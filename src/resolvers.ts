import {authenticated, authorized} from "./auth";
import {AuthenticationError, PubSub} from 'apollo-server'
import {ImageToken} from "./constants";
import FormData from 'form-data';
import {storeUpload} from "./utils";
import {existsSync, unlinkSync} from 'fs'
import User from "./models/User";
import Setting from "./models/Setting";
import Post from "./models/Post";
import Comment from "./models/Comment";
import {GraphQLUpload} from "graphql-upload";
import fs from 'fs'
import Category from "./models/Category";

const request  = require('request')


const pubsub = new PubSub()
const NEW_POST = 'NEW_POST'
export default {
    Upload: GraphQLUpload,
    Query: {
        category: async (_, __, { ___, models }) => {
            return Category.find({})
        },
        email: async (_, input , {___, models}) => {
            const user =  models.User.findOne(input)
            return { ...input, available: !!user}
        },

        me: authenticated((_, __, {user}) => {
            return user
        }),
        posts: async (_, {filter, pagination, rank}) => {
            const {docs:data, hasNextPage} = await Post.paginate({}, pagination)
            return { data, hasNextPage }
        },

        post: authenticated((_, {_id}, {user, models}) => {
            return models.Post.findOne({_id, author: user._id})
        }),

        userSettings: authenticated((_, __, {user, models}) => {
            return models.Settings.findOne({user: user._id})
        }),
        feed (_, __, {models}) {
            return models.Post.findMany()
        }
    },
    Mutation: {
        addCategory: async (_, {input}) => {
            await Category.insertMany(input)
            return Category.find()
        },
        likeAction:  authenticated(async (_, {target: _id, type},{user, models})=> {
            const post : any = await Post.findOne({ _id })

            const index = post.likes.indexOf(user._id)
            if (index !== -1){
                post.likes.splice(index, 1)
            } else {
                post.likes.push(user._id)
            }
            await Post.updateOne({_id}, post);
            // await post.save()
            return post
        }),

        updateSettings: authenticated((_, {input}, {user}) =>{
            return Setting.updateOne({user: user._id}, input)
        }),

        createPost: authenticated(async (_, {input}, {user: {_id}}) => {
            const post = new Post({...input, author: _id, likes: [], views: 0, comments: [], createdAt: Date.now()})
            await post.save()
            await pubsub.publish(NEW_POST, { newPost: post })
            return post
        }),
        updateMe: authenticated(async (_, {input}, {user: { _id }}) =>
            await User.updateOne({_id}, input)
        ),
        // admin role
        invite: authenticated(authorized('ADMIN', (_, {input}, {user: {_id}}) => {
            return {from: _id, role: input.role, createdAt: Date.now(), email: input.email}
        })),
        async signUp(_, {input}, {__, createToken}) {
            const existing = await User.find({email: input.email}) || await User.find({ name: input.name})
            if ( existing.length !== 0) {
                throw new AuthenticationError('Username or Email duplicated!')
            }
            const user = new User({...input, verified: false , role: 'MEMBER', avatar: input.name})
            await user.save()
            await Setting.create({user: user._id, theme: 'DARK', emailNotifications: true, pushNotifications: true})
            const token = createToken(user)
            return {token, user}
        },
        async signIn(_, {input}, {__, createToken}) {
            const user = await User.findOne(input)
            if (!user) {
                throw new AuthenticationError('wrong email + password combo')
            }
            const token = createToken(user)

            return {token, user}
        },
        sendImageToCloud: authenticated(async (_, {file: {file}})  => {
             let result
            const { createReadStream, filename, mimetype } = await file
             // save to local first
            const [path, err]  = await storeUpload({ stream: createReadStream(), mimetype, filename})
                 .then(res => [res, null])
                 .catch(err => [null, err])
             const form = new FormData()
             form.append('smfile', fs.createReadStream(path))
             form.append('format', 'json')
             if (!err) {
                 return await new Promise(((resolve, reject) => {
                     const req = request.post({
                         url: 'https://sm.ms/api/v2/upload',
                         headers: {Authorization: ImageToken, ...form.getHeaders()}
                     }, (err, response, body) => {
                         if (existsSync(path)) {
                             unlinkSync(path)
                         }
                         if (err) {
                             result = {message: err, res: ''}
                             reject(result)
                         } else {
                             let parsed = JSON.parse(body)
                             console.log('body',JSON.parse(body))
                             result = {message: 'success', res: parsed?.images||parsed?.data?.url}
                             resolve(result)
                         }
                     })
                     form.pipe(req)
                 }))
             }
             return { message: 'Failed to save!', res: ''}
         }),
        addComment: authenticated( async (_, {input: { target: _id, content, type, to }}, {user: {_id: uid}})  => {
            const comment: any = await new Comment({ content, comments: [], replies: [], author: uid, type, createAt: Date.now(), to })
            await comment.save()
            if (type === 'POST') {
                try {
                    const { comments } : any  = await Post.findOne({ _id })
                    await Post.updateOne({_id}, {comments: [...comments, comment._id]})
                }catch (e) {
                    throw e
                }

            } else {
                try {
                    const { replies }:any = await Comment.findOne({ _id })
                    await Comment.updateOne({_id}, { replies: [...replies, comment._id]})
                } catch (e) {
                    throw e
                }
            }
            return comment
        })
    },
    Subscription: {
        newPost: {
            subscribe: () => pubsub.asyncIterator(NEW_POST)
        },
    },
    User: {
        posts(root, _, {user}) {
            if (root._id !== user._id) {
                throw new AuthenticationError('not your posts')
            }

            return Post.find({author: root._id})
        },
        settings(root, __, {user, models}) {
            return models.Settings.findOne({_id: root.settings, user: user._id})
        }
    },
    Settings: {
        user(settings, _, {user}) {
            return Setting.findOne({_id: settings._id, user: user._id})
        }
    },
    Post: {
        async author(post) {
            return User.findOne({_id: post.author});
        },
        async likes(post) {
            return await post.likes.map( async (_id: any) => await User.findOne({_id}))
        },
        comments(post) {
            return post.comments.map(async (_id: any) => await Comment.findOne({_id}))
        }
    },
    Reply: {
        async author(comment) {
            return User.findOne({ _id: comment.author })
        },
        async to(comment) {
            return User.findOne({ _id: comment.to })
        },
    },
    Comment: {
        async author(comment) {
            return User.findOne({ _id: comment.author })
        },
        replies(comment) {
            return comment.replies.map(async _id => await Comment.findOne({_id}))
        },

    }
}

import {authenticated, authorized} from "./auth";
import {AuthenticationError, PubSub} from 'apollo-server'
import {ImageToken} from "./constants";
import FormData from 'form-data';
import {storeUpload} from "./utils";
import fs, {existsSync, unlinkSync} from 'fs'
import User from "./models/User";
import Setting from "./models/Setting";
import Post from "./models/Post";
import Comment from "./models/Comment";
import {GraphQLUpload} from "graphql-upload";
import Category from "./models/Category";

const pubsub = new PubSub()
const NEW_POST = 'NEW_POST'
export default {
    Upload: GraphQLUpload,
    Query: {
        hotPosts: async () => {
            return Post.aggregate([
                {"$match": {"images.0": {"$exists": true}}},
                {"$sort": { "createdAt": -1}},
                {"$sort" : {"likes":-1}},
                {"$sort" : {"comments": -1}},
                {"$limit" : 5}
                ])
        },
        category: async () => {
            return Category.find()
        },
        email: async (_, input) => {
            const user =  await User.findOne(input)
            return { ...input, available: !!user}
        },

        me: authenticated((_, __, {user}) => {
            return user
        }),
        posts: async (_, {filter, pagination, rank}) => {
            let f = {}
            if(filter) {
                f = { category: filter?.category ,$or: [ {content: new RegExp(filter?.keyword)}, {title: new RegExp(filter?.keyword)}]}
            }
            const { sortReverse, sortByDate, sortByHot } = rank
            if(sortByDate) {
                const {docs:data, hasNextPage, hasPrevPage} = await Post.paginate(f, {...pagination, sort: { 'createdAt': sortReverse ? -1: 1}})
                return { data, hasNextPage, hasPrevPage }
            } else if(sortByHot) {
                const {docs:data, hasNextPage, hasPrevPage} = await Post.paginate(f, {...pagination, sort: { 'likes':  sortReverse ? 1: -1}})
                return { data, hasNextPage, hasPrevPage }
            }
        },

        post: async (_, {id:_id}) => {
            return Post.findOne({_id})
        },

        userSettings: authenticated((_, __, {user, models}) => {
            return models.Settings.findOne({user: user._id})
        }),
        feed () {
            return Post.find()
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
        updateMe: authenticated(async (_, {input}, {user: { _id }}) => {
            await User.updateOne({_id}, input)
            return User.findOne({_id})
            }
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
            const user = new User({...input, verified: false , role: 'MEMBER', desc: '', avatar: input.name, createdAt: Date.now(), lastLoginAt: Date.now()})
            await user.save()
            await Setting.create({user: user._id, theme: 'DARK', emailNotifications: true, pushNotifications: true})
            const token = createToken(user)
            return {token, user}
        },
        async signIn(_, {input}, {__, createToken}) {
            const user = await User.findOneAndUpdate(input, { lastLoginAt: Date.now()})
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
            const [path, err]  = await storeUpload({ stream: createReadStream(), filename})
                 .then(res => [res, null])
                 .catch(err => [null, err])
            console.info(path, err)
            if(err) {
                return { message: 'Failed to save!', res: ''}
            }
            return  { message: 'Upload success', res: path }
         }),
        addComment: authenticated( async (_, {input: { target: _id, content, type, to }}, {user: {_id: uid}})  => {
            const comment: any = new Comment({ content, comments: [], replies: [], author: uid, type, createdAt: Date.now(), to })
            await comment.save()
            if (type === 'POST') {
                try {
                    const { comments } : any  = await Post.findOne({ _id })
                    await Post.updateOne({_id}, {comments: [ comment._id, ...comments]})
                }catch (e) {
                    throw e
                }

            } else {
                try {
                    const { replies }:any = await Comment.findOne({ _id })
                    await Comment.updateOne({_id}, { replies: [ comment._id, ...replies]})
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
            return Setting.findOne({user: user._id})
        }
    },
    Settings: {
        user(settings, _, {user}) {
            return Setting.findOne({_id: settings._id, user: user._id})
        }
    },
    Post: {
        async author(post) {
            console.log(await  User.findOne({_id: post.author}))
            return User.findOne({_id: post.author});
        },
        async likes(post) {
            return await post.likes.map( async (_id: any) => await User.findOne({_id}))
        },
        async comments(post) {
            return post.comments.map(async (_id: any) => await Comment.findById(_id))
        },
        async category(post) {
            return Category.findOne({value: post.category});
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

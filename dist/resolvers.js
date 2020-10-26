"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const auth_1 = require("./auth");
const apollo_server_1 = require("apollo-server");
const pubsub = new apollo_server_1.PubSub();
const NEW_POST = 'NEW_POST';
exports.default = {
    Query: {
        me: auth_1.authenticated((_, __, { user }) => {
            return user;
        }),
        posts: auth_1.authenticated((_, __, { user, models }) => {
            return models.Post.findMany({ author: user.id });
        }),
        post: auth_1.authenticated((_, { id }, { user, models }) => {
            return models.Post.findOne({ id, author: user.id });
        }),
        userSettings: auth_1.authenticated((_, __, { user, models }) => {
            return models.Settings.findOne({ user: user.id });
        }),
        feed(_, __, { models }) {
            return models.Post.findMany();
        }
    },
    Mutation: {
        updateSettings: auth_1.authenticated((_, { input }, { user, models }) => {
            return models.Settings.updateOne({ user: user.id }, input);
        }),
        createPost: auth_1.authenticated((_, { input }, { user, models }) => {
            const post = models.Post.createOne(Object.assign(Object.assign({}, input), { author: user.id }));
            pubsub.publish(NEW_POST, { newPost: post });
            return post;
        }),
        updateMe: auth_1.authenticated((_, { input }, { user, models }) => {
            return models.User.updateOne({ id: user.id }, input);
        }),
        // admin role
        invite: auth_1.authenticated(auth_1.authorized('ADMIN', (_, { input }, { user }) => {
            return { from: user.id, role: input.role, createdAt: Date.now(), email: input.email };
        })),
        signup(_, { input }, { models, createToken }) {
            const existing = models.User.findOne({ email: input.email });
            if (existing) {
                throw new apollo_server_1.AuthenticationError('nope');
            }
            const user = models.User.createOne(Object.assign(Object.assign({}, input), { verified: false, avatar: 'http' }));
            const token = createToken(user);
            models.Setting.createOne({ user: user.id, theme: 'DARK', emailNotifications: true, pushNotifications: true });
            return { token, user };
        },
        signin(_, { input }, { models, createToken }) {
            const user = models.User.findOne(input);
            if (!user) {
                throw new apollo_server_1.AuthenticationError('wrong email + password combo');
            }
            const token = createToken(user);
            return { token, user };
        }
    },
    Subscription: {
        newPost: {
            subscribe: () => pubsub.asyncIterator(NEW_POST)
        },
    },
    User: {
        posts(root, _, { user, models }) {
            if (root.id !== user.id) {
                throw new apollo_server_1.AuthenticationError('not your posts');
            }
            return models.Post.findMany({ author: root.id });
        },
        settings(root, __, { user, models }) {
            return models.Settings.findOne({ id: root.settings, user: user.id });
        }
    },
    Settings: {
        user(settings, _, { user, models }) {
            return models.Settings.findOne({ id: settings.id, user: user.id });
        }
    },
    Post: {
        author(post, _, { models }) {
            return models.User.findOne({ id: post.author });
        }
    }
};
//# sourceMappingURL=resolvers.js.map
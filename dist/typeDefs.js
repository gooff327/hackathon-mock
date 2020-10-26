"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_tag_1 = __importDefault(require("graphql-tag"));
exports.default = graphql_tag_1.default `
    directive @log(format: String) on FIELD_DEFINITION
    directive @formatDate(format: String = "d, MMM, yyyy") on FIELD_DEFINITION
    enum CommentTarget {
        POST
        COMMENT
    }
    enum Role {
        ADMIN
        MEMBER
        GUEST
    }
    enum Theme {
        DARK
        LIGHT
    }
    enum MessageType {
        COMMENT
        LIKE
        FORWARD
        CHAT
    }
    enum FileType {
        IMAGE
        MUSIC
        VEDIO
        RAW
    }
    type Settings {
        id: ID!
        user: User!
        theme: Theme!
        setTop: [User]
        emailNotification: Boolean!
        pushNotification: Boolean!
    }
    
    type User {
        id: ID! @log(format: "hello")
        email: String!
        avatar: String
        name: String!
        verified: Boolean!
        createdAt: String! @formatDate
        lastLoginAt: String! @formatDate
        posts: [Post]
        role: Role!
        settings: Settings!
    }
    type AuthUser {
        token: String!
        user: User!
    }
    
    type Post {
        id: ID!
        text: String
        images: [String]
        createdAt: String! @formatDate
        updatedAt: String! @formatDate
        isPublic: Boolean!
        author: User!
        likes: [User]
        views: Int
        comments: [Comment]
    }
    
    type Comment {
        id: ID!
        author: User!
        target: CommentTarget!
        content: String!
    }

    type Message {
        id: ID!
        type: MessageType
        author: User!
        target: User!
        text: String
        fileType: FileType
        file: String
    }
    type Invite {
        email: String!
        from: User!
        createdAt: String!
        role: Role!
    }
    input UpdateSettingsInput {
        theme: Theme
        emailNotifications: Boolean
        pushNotifications: Boolean
    }
    input SignupInput {
        email: String!
        password: String!
        role: Role!
    }
    input SigninInput {
        email: String!
        password: String!
    }
    input NewPostInput {
        text: String
        images: [String]
        isPublic: Boolean!
    }
    input UpdateUserInput {
        email: String
        avatar: String
        verified: Boolean
    }
    input InviteInput {
        email: String!
        role: Role!
    }
    type Query {
        me: User!
        posts: [Post]!
        post(id: ID!): Post!
        userSettings: Settings!
        feed: [Post]!
        user: User
    }
    type Mutation {
        updateSettings(input: UpdateSettingsInput!): Settings!
        createPost(input: NewPostInput!): Post!
        updateMe(input: UpdateUserInput!): User
        invite(input: InviteInput!): Invite!
        signup(input: SignupInput!): AuthUser!
        signin(input: SigninInput!): AuthUser!
    }
    type Subscription {
        newPost: Post
        newMessage: Message
    }

`;
//# sourceMappingURL=typeDefs.js.map
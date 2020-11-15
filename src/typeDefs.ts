import gql from 'graphql-tag'

export default gql`
    directive @log(format: String) on FIELD_DEFINITION
    directive @formatDate(format: String = "yyyy年MM月dd日 HH:MM") on FIELD_DEFINITION
    enum CommentTarget {
        POST
        COMMENT
    }
    enum LikeTarget {
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
    type Settings {
        _id: ID!
        user: User!
        theme: Theme!
        setTop: [User]
        emailNotification: Boolean!
        pushNotification: Boolean!
    }
    type User {
        _id: ID!
        desc: String!
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
        _id: ID!
        title: String!
        content: String!
        images: [String]!
        createdAt: String! @formatDate
        updatedAt: String! @formatDate
        isPublic: Boolean!
        author: User!
        likes: [User]!
        views: Int!
        comments: [Comment]!
        category: Category!
    }
    type Category {
        label: String!
        value: String!
    }
    type Comment {
        _id: ID!
        author: User!
        type: CommentTarget!
        content: String!
        createdAt: String !@formatDate
        replies: [Reply]!
    }
    
    type Reply {
        _id: ID!
        author: User!
        type: CommentTarget!
        content: String!
        createdAt: String !@formatDate
        to: User
    }

    type Message {
        _id: ID!
        type: MessageType
        author: User!
        target: User!
        text: String
        file: String
    }
    type Invite {
        email: String!
        from: User!
        createdAt: String!
        role: Role!
    }
    type File {
        filename: String!
        mimetype: String!
        encoding: String!
        path: String!
    }
    input UpdateSettingsInput {
        theme: Theme
        emailNotifications: Boolean
        pushNotifications: Boolean
    }
    input SignUpInput {
        email: String!
        password: String!
        name: String!
    }
    input SignInInput {
        email: String!
        password: String!
    }
    input NewPostInput {
        title: String!
        content: String!
        images: [String]!
        isPublic: Boolean!
        category: String!
    }
    input UpdateUserInput {
        desc: String
        email: String
        avatar: String
        verified: Boolean
    }
    input InviteInput {
        email: String!
        role: Role!
    }
    input CommentInput {
        target: ID!
        type: CommentTarget!
        content: String!
        to: ID
    }

    input PostFilter {
        category: String
        keyword: String
    }
    input Pagination {
        page: Int!
        limit: Int!
    }
    input Rank {
        sortReverse: Boolean
        sortByDate: Boolean
        sortByHot: Boolean
    }
    input CategoryInput {
        label: String!
        value: String!
    }
    
    type EmailStatus {
        email: String!
        available: Boolean!
    }
    
    type Posts {
        data: [Post]!
        hasNextPage: Boolean!
        hasPrevPage: Boolean!
    }

    type Query {
        hotPosts: [Post]!
        email(email: String!): EmailStatus!
        me: User!
        posts(filter: PostFilter, pagination: Pagination, rank: Rank): Posts!
        post(id: ID!): Post!
        userSettings: Settings!
        feed: [Post]!
        user: User
        category: [Category]!
    }
    type UploadResponse {
        message: String!
        res: String!    
    }
    scalar Image
    
    type Mutation {
        addCategory(input: [CategoryInput]!): [Category]!
        likeAction(target: ID!, type: LikeTarget): Post!
        sendImageToCloud(file: Image!): UploadResponse!
        updateSettings(input: UpdateSettingsInput!): Settings!
        createPost(input: NewPostInput!): Post!
        addComment(input: CommentInput!): Comment!
        updateMe(input: UpdateUserInput!): User!
        invite(input: InviteInput!): Invite!
        signUp(input: SignUpInput!): AuthUser!
        signIn(input: SignInInput!): AuthUser!
    }
    type Subscription {
        newPost: Post
        newMessage: Message
    }

`

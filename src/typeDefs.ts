import gql from 'graphql-tag'

export default gql`
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
    type Settings {
        id: ID!
        user: User!
        theme: Theme!
        setTop: [PublicUserInfo]
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
        title: String
        content: String
        images: [String]!
        createdAt: String! @formatDate
        updatedAt: String! @formatDate
        isPublic: Boolean!
        author: PublicUserInfo!
        likes: [User]
        views: Int
        comments: [Comment]
        category: Category!
    }
    type Category {
        label: String!
        value: String!
    }
    type PublicUserInfo {
        id: ID!
        name: String!
        avatar: String!
        email: String!
    }
    type Comment {
        id: ID!
        author: PublicUserInfo!
        target: CommentTarget!
        content: String!
    }

    type Message {
        id: ID!
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
        email: String
        avatar: String
        verified: Boolean
    }
    input InviteInput {
        email: String!
        role: Role!
    }
    input CommentInput {
        pid: ID!
        content: String
    }

    input PostFilter {
        category: String
        hashtag: String
        keyword: String
        rank: Boolean
        sortByDate: Boolean
        sortByDateReverse: Boolean
        limit: Int
        offset: Int
    }
    
    type EmailStatus {
        email: String!
        available: Boolean!
    }
    type Query {
        email(email: String!): EmailStatus!
        me: User!
        posts(input: PostFilter): [Post]!
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
        sendImageToCloud(file: Image!): UploadResponse!
        updateSettings(input: UpdateSettingsInput!): Settings!
        createPost(input: NewPostInput!): Post!
        addComment(input: CommentInput!): Comment!
        updateMe(input: UpdateUserInput!): User
        invite(input: InviteInput!): Invite!
        signUp(input: SignUpInput!): AuthUser!
        signIn(input: SignInInput!): AuthUser!
    }
    type Subscription {
        newPost: Post
        newMessage: Message
    }

`

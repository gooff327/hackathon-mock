export interface User {
    id: number
    email: string
    avatar?: string
    name: string
    verified: boolean
    createdAt: string
    lastLoginAt: string
    posts: Post[]
    role: Role
    settings: Settings
}

export interface Post {
    id: string
    text?: string
    images?: [string]
    createdAt: string
    updatedAt: string
    isPublic: boolean
    author: User
    likes: User[]
    views: number
    comments: Comment[]
}
export interface Comment {

}
export enum Role {
    ADMIN,
    MEMBER,
    GUEST
}

export interface Settings {

}

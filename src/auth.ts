import jwt from "jsonwebtoken"
import {User} from "./types";
import db  from "./database";
import { AuthenticationError } from 'apollo-server'
const secret = 'go_off'
const { models } = db
export const createToken = ({ id, role}: User) => jwt.sign({id, role}, secret)

export const getUserFromToken = (token: string) => {
    try {
        const user: Partial<User> | string = jwt.verify(token, secret)
        if (typeof user === "object") {
            return models.User.findOne({id: user.id})
        }
    } catch (e) {
        return null
    }
}

export const authenticated = (next: any) => (root, args, context, info) => {
    if (!context.user) {
        throw new AuthenticationError('must authenticate')
    }

    return next(root, args, context, info)
}

export const authorized = (role, next) => (root, args, context, info) => {
    if (context.user.role !== role) {
        throw new AuthenticationError(`you must have ${role} role`)
    }
    return next(root, args, context, info)
}

import jwt from "jsonwebtoken"
import User from "./models/User" ;
import { User as UserType } from './types'
import { AuthenticationError } from 'apollo-server'
const secret = 'go_off'
export const createToken = ({ email, role}: UserType) => jwt.sign({email, role}, secret)

export const getUserFromToken = async (token: string) => {
    try {
        const user: Partial<UserType> | string = jwt.verify(token, secret)
        if (typeof user === "object") {
            return await User.findOne({email: user.email}).exec()
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

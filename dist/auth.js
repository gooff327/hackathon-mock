"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorized = exports.authenticated = exports.getUserFromToken = exports.createToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = __importDefault(require("./database"));
const apollo_server_1 = require("apollo-server");
const secret = 'go_off';
const { models } = database_1.default;
exports.createToken = ({ id, role }) => jsonwebtoken_1.default.sign({ id, role }, secret);
exports.getUserFromToken = (token) => {
    try {
        const user = jsonwebtoken_1.default.verify(token, secret);
        if (typeof user === "object") {
            return models.User.findOne({ id: user.id });
        }
    }
    catch (e) {
        return null;
    }
};
exports.authenticated = (next) => (root, args, context, info) => {
    if (!context.user) {
        throw new apollo_server_1.AuthenticationError('must authenticate');
    }
    return next(root, args, context, info);
};
exports.authorized = (role, next) => (root, args, context, info) => {
    if (context.user.role !== role) {
        throw new apollo_server_1.AuthenticationError(`you must have ${role} role`);
    }
    return next(root, args, context, info);
};
//# sourceMappingURL=auth.js.map
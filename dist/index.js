"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_1 = require("apollo-server");
const typeDefs_1 = __importDefault(require("./typeDefs"));
const resolvers_1 = __importDefault(require("./resolvers"));
const directive_1 = require("./directive");
const auth_1 = require("./auth");
const database_1 = __importDefault(require("./database"));
const server = new apollo_server_1.ApolloServer({
    typeDefs: typeDefs_1.default,
    resolvers: resolvers_1.default,
    schemaDirectives: {
        log: directive_1.LogDirective,
        formatDate: directive_1.FormatDateDirective
    },
    context({ req, connection }) {
        const ctx = Object.assign({}, database_1.default);
        if (connection) {
            return Object.assign(Object.assign({}, ctx), connection.context);
        }
        const token = req.headers.authorization;
        const user = auth_1.getUserFromToken(token);
        return Object.assign(Object.assign({}, database_1.default), { user, createToken: auth_1.createToken });
    },
    subscriptions: {
        onConnect(connectionParams) {
            if (connectionParams) {
                const user = auth_1.getUserFromToken(connectionParams.auth);
                if (!user) {
                    throw new apollo_server_1.AuthenticationError('not authenticated');
                }
                return { user };
            }
            throw new apollo_server_1.AuthenticationError('not authenticated');
        }
    }
});
server.listen(4000).then(({ url, subscriptionsUrl }) => {
    console.log(`🚀 Server ready at ${url}`);
    console.log(`🚀 Subscriptions ready at ${subscriptionsUrl}`);
});
//# sourceMappingURL=index.js.map
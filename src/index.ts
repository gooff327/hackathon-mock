import { ApolloServer, AuthenticationError } from 'apollo-server'
import typeDefs from './typeDefs'
import resolvers from "./resolvers";
import { LogDirective, FormatDateDirective} from "./directive";
import { getUserFromToken, createToken} from "./auth";
import db from "./db";
const server = new ApolloServer({
    typeDefs,
    resolvers,
    schemaDirectives: {
        log: LogDirective,
        formatDate: FormatDateDirective
    },
    async context({req, connection}) {
        if (connection) {
            return {...connection.context}
        }

        const token = req.headers.authorization
        const user = await getUserFromToken(token)
        return {...db, user, createToken}
    },
    subscriptions: {
        onConnect(connectionParams: {auth: any}) {
            if (connectionParams) {
                const user = getUserFromToken(connectionParams.auth)

                if (!user) {
                    throw new AuthenticationError('not authenticated')
                }

                return {user}
            }

            throw new AuthenticationError('not authenticated')
        }
    }
})

server.listen(12345).then(({url, subscriptionsUrl}) => {
    console.log(`🚀 Server ready at ${url}`)
    console.log(`🚀 Subscriptions ready at ${subscriptionsUrl}`)
})

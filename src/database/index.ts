const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const path = require('path')
import createModel from "./models";

const adapter = new FileSync(path.resolve() + '/src/database/db.json', {
    serialize: (data) => JSON.stringify(data),
    deserialize: (data) => JSON.parse(data)
})

const db = low(adapter);
    db.defaults({ posts: [], users: [], settings: [] }).write()
const models = {
    User: createModel(db, 'users'),
    Post: createModel(db, 'posts'),
    Comment: createModel(db, 'comments'),
    Setting: createModel(db, 'settings')
}
export default {
    models,
    db
}

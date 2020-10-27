import {defaultCategories} from "../constants";

const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const path = require('path')
import createModel from "./models";

const adapter = new FileSync(path.resolve() + '/src/database/db.json', {
    serialize: (data) => JSON.stringify(data),
    deserialize: (data) => JSON.parse(data)
})

const db = low(adapter);
    db.defaults({ posts: [], users: [], settings: [], category: defaultCategories }).write()
const models = {
    User: createModel(db, 'users'),
    Post: createModel(db, 'posts'),
    Comment: createModel(db, 'comments'),
    Setting: createModel(db, 'settings'),
    Category: createModel(db, 'category')
}
export default {
    models,
    db
}

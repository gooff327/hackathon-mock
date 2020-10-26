"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const models_1 = __importDefault(require("./models"));
const adapter = new FileSync('./src/database/db.json');
const db = low(adapter);
db.defaults({ posts: [], users: [], settings: [] }).write();
const models = {
    User: models_1.default(db, 'users'),
    Post: models_1.default(db, 'posts'),
    Comment: models_1.default(db, 'comments'),
    Setting: models_1.default(db, 'settings')
};
exports.default = {
    models,
    db
};
//# sourceMappingURL=index.js.map
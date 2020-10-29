import { Schema, model } from "mongoose";

const CommentSchema = new Schema({
  content: String,
  comments: Array,
  author: String,
  type: String,
  createdAt: Date,
  id: String,
  to: String
})

const Comment = model('Comment', CommentSchema)

export default Comment

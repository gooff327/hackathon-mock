import { Schema, model } from "mongoose";

const CommentSchema = new Schema({
  content: String,
  comments: Array,
  author: String,
  type: String,
  createdAt: Number,
  id: String,
  to: String,
  replies: Array
})

const Comment = model('Comment', CommentSchema)

export default Comment


import { Schema, model } from "mongoose";

const PostSchema = new Schema({
  title: String,
  content: String,
  images: Array,
  isPublic: Boolean,
  category: String,
  author: String,
  likes: Array,
  views: Number,
  comments: Array,
  createdAt: Number,
  id: String
})

const Post = model('Post', PostSchema)
export default Post

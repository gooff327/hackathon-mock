
import { Schema, model } from "mongoose";
import mongoosePaginate from 'mongoose-paginate-v2'

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
PostSchema.plugin(mongoosePaginate)
const Post = model('Post', PostSchema)
export default Post

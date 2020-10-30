import { Schema, model } from "mongoose";

const UserSchema = new Schema({
  id: String,
  email: String,
  avatar: String,
  name: String,
  verified: Boolean,
  createdAt: Number,
  lastLoginAt: Number,
  role: String,
  password: String,
  desc: String
})

const User = model('User', UserSchema)

export default User

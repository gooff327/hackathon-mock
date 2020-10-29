import { Schema, model } from "mongoose";

const UserSchema = new Schema({
  id: String,
  email: String,
  avatar: String,
  name: String,
  verified: Boolean,
  createdAt: Date,
  lastLoginAt: String,
  role: String,
  password: String
})

const User = model('User', UserSchema)

export default User

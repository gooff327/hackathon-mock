
import { Schema, model } from "mongoose";

const SettingSchema = new Schema({
  id: String,
  user: String,
  theme: String,
  setTop: Array,
  emailNotification: Boolean,
  pushNotification: Boolean,
})

const Setting = model('Setting', SettingSchema)
export default Setting

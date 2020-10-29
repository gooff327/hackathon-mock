import { Schema, model } from "mongoose";

const CategorySchema = new Schema({
  label: String,
  value: String,
})

const Category = model('Category', CategorySchema)

export default Category

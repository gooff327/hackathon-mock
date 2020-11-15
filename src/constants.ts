export const ImageToken = 'basic qjDu8sU7V8c5gZy6RTitl6P0M4oTTgUS'
const { MONGO_URL, MONGO_PASSWORD, MONGO_DB_NAME} = process.env
export const MongoURL  = 'mongodb+srv://hackathon:hackathon@cluster0.8puwo.mongodb.net/hackathon?retryWrites=true&w=majority'
export const defaultCategories = [
  {
    label: '吐槽一下',
    value: 'roast'
  },
  {
    label: '二手交易',
    value: 'second-hand'
  },
  {
    label: '约饭/桌游/...',
    value: 'social'
  },
  {
    label: '求/招租',
    value: 'rent'
  },
  {
    label: '其他',
    value: 'other'
  }
]

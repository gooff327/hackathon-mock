import mongoose from 'mongoose'
import dotenv from  'dotenv'
dotenv.config()

const { MONGO_URL, MONGO_PASSWORD, MONGO_DB_NAME, MONGO_DB_USER} = process.env
const MongoURL  = `mongodb://${MONGO_DB_USER}:${MONGO_PASSWORD}@${MONGO_URL}/${MONGO_DB_NAME}`

mongoose.connect(MongoURL, { useUnifiedTopology: true, useNewUrlParser: true });
mongoose.Promise = global.Promise;

const db = mongoose.connection;

db.once('open' ,() => {
  console.log('连接数据库成功');
})

db.on('error', async function(error) {
  console.error('Error in MongoDb connection: ' + error);
  await mongoose.disconnect();
});

db.on('close', async function() {
  console.log('数据库断开，重新连接数据库')
  await mongoose.connect(MongoURL, {server:{auto_reconnect:true}});
});

export default db;

const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException',err=> { 
  console.log('UNCAUGHT EXCEPTION! 💥 Shuting down... '); 
  console.log(err.name,err.message); 
  process.exit(1); 
})

const app = require('./app');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log('DB connection successful!'))
  .catch((err) => {
    console.log('Error : ', err);
  });


const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection',err=> { 
  console.log(err.name,err.message); 
  err.log('UNHADLED REJECTION! 💥 Shuting down server ... '); 
  server.close(()=> { 
    process.exit(1); 
  }); 
})
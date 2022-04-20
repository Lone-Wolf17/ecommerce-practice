import mongoose, {ConnectOptions} from 'mongoose';

export const mongoConnect = (callback: Function) => {
  mongoose.connect(process.env.MONGO_URI!, {
    useUnifiedTopology: true,
    autoIndex: true
  } as ConnectOptions )
    .then((client) => {
      console.log("Connected!");
      callback();
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });
};


const mongoose = require("mongoose");

// mongodb://127.0.0.1:27017/wandx-state-api
// mongodb+srv://basket:P56OgbD3Xal2n0CF@cluster0-2trdh.mongodb.net/test?retryWrites=true&w=majority
//local DB config
// mongoose.connect(`mongodb://127.0.0.1:27017/${process.env.DB_NAME}`, {
//   useNewUrlParser: true,
//   useCreateIndex: true,
//   useUnifiedTopology: true,
//   useFindAndModify: false,
// });

// remote mongo DB Atlas config
var MONGOD_url =
  "mongodb+srv://basket:1dcGq07Tbl6XsEgD@cluster0-2trdh.mongodb.net/";
var DBname = process.env.DB_NAME;

mongoose.connect(
  MONGOD_url,
  {
    useNewUrlParser: true,
    // useCreateIndex: true,
    useUnifiedTopology: true,
    // useFindAndModify: false
  },
  { dbName: DBname },
  function (err, client) {
    if (err) {
      console.log("mongo error", err);
      return;
    }
  }
);

mongoose.connection.on("connected", function () {
  console.log("Connection to Mongo established.");
  if (mongoose.connection.client.s.url.startsWith("mongodb+srv")) {
    mongoose.connection.db = mongoose.connection.client.db(DBname);
  }
});

const url =
  "mongodb+srv://nasa:password19@cluster0.uoiithh.mongodb.net/notes?retryWrites=true&w=majority";

const mongoose = require("mongoose");
mongoose.connect(url, (d) => {
  console.log("db connected");
});

const users = new mongoose.model(
  "users",
  new mongoose.Schema({
    _id: { type: String, default: mongoose.Types.ObjectId().toString() },
    name: String,
    email: String,
    password: String,
  })
);
const notes = new mongoose.model(
  "notes",
  new mongoose.Schema({
    _id: { type: String, default: mongoose.Types.ObjectId().toString() },
    uid: String,
    title: String,
    description: String,
    status: { type: Boolean, default: false },
  })
);

module.exports = {
  users,
  notes,
};

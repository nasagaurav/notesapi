const PORT = process.env.PORT || 5000;

const secret = "nasa@123";
const models = require("./models/index");
const jwt = require("jsonwebtoken");
const express = require("express");
const cors = require("cors");
const body = require("body-parser");
const app = express();
function auth(req, res, next) {
  const token = req?.headers?.authorization?.split(" ")[1];
  let status = false;
  jwt.verify(token, secret, (e, d) => {
    if (e) return res.json({ status: false, data: e });
    req.uid = d?.uid;
    status = true;
  });

  if (status) {
    return next();
  } else {
    return res.json({ status: false, msg: "not allowed", data: [] });
  }
}
app.use(cors());
app.use(body.json());
app.use(body.urlencoded({ extended: true }));
app.get("/notes", (req, res) => {
  models.notes
    .find({}, "uid title")
    .then((d) => res.json({ status: true, data: d }))
    .catch((e) => res.json({ statue: false, data: [] }));
});
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  models.users.findOne({ email, password }).then((d) => {
    jwt.sign({ uid: d?._id }, secret, (e, token) => {
      if (e) return res.json({ status: false, data: e });
      return res.json({ status: true, token, data: d });
    });
  });
});
app.post("/signup", (req, res) => {
  const { email } = req.body;
  models.users
    .find({ email })
    .then((d) => (d.length ? Promise.reject() : Promise.resolve()))
    .then((d) => models.users.create(req.body).catch((e) => null))
    .then((d) => res.json({ status: true, data: d }))
    .catch((e) => res.json({ status: false, data: e }));
});

app.get("/mynotes", auth, async (req, res) => {
  const { uid } = req;
  models.notes
    .find({ uid })
    .then((d) => res.json({ status: true, data: d }))
    .catch((e) => res.json({ status: false, data: [] }));
});
app.post("/mynotes", auth, async (req, res) => {
  const { uid } = req;

  models.notes
    .create({ ...req.body, uid })
    .then((d) => models.notes.find({ uid }))
    .then((d) => res.json({ status: true, data: d }))
    .catch((e) => res.json({ status: false, data: [] }));
});

app.patch("/profile", auth, (req, res) => {
  const { uid } = req;
  let { field, value } = req.body;
  models.users
    .findByIdAndUpdate(uid, { password: value })
    .then((d) => res.json({ status: true, data: d }))
    .catch((e) => res.json({ status: false, data: null }));
});
app.delete("/mynotes/:id", auth, (req, res) => {
  const { uid } = req;
  const id = req.params.id;
  models.notes
    .findByIdAndDelete(id)
    .then((d) => models.notes.find({ uid }).catch((e) => []))
    .then((d) => res.json({ status: true, data: d }))
    .catch((e) => res.json({ status: false, data: e }));
});
app.patch("/mynotes/:id/:status", auth, (req, res) => {
  const { uid } = req;
  const { id, status } = req.params;
  models.notes
    .findByIdAndUpdate(id, { status })
    .then((d) => models.notes.find({ uid }).catch((e) => []))
    .then((d) => res.json({ status: true, data: d }))
    .catch((e) => res.json({ status: false, data: e }));
});

app.get("/mynotes/:id", auth, (req, res) => {
  const { uid } = req;
  const { id } = req.params;
  models.notes
    .findOne({ id })
    .then((d) => res.json({ status: true, data: d }))
    .catch((e) => res.json({ status: false, data: e }));
});

app.get("/", (req, res) => {
  res.json({ msg: "welcome to NASA sir notes api on PORT " + PORT });
});
app.listen(PORT, () => console.log("APP SERVER started on PORT:" + PORT));

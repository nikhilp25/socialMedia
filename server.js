// index.js
const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User, Post, Follow, sequelize } = require("./models");

const app = express();
app.use(bodyParser.json());

app.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = await User.create({ username, email, password });
    res.status(201).json({ message: "User created", user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
      return res.status(401).json({ error: "Invalid password" });

    const token = jwt.sign({ id: user.id }, "your_jwt_secret");
    res.json({ message: "Login successful", token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Access denied" });
  console.log(authHeader);
  const token = authHeader.split("  ")[1]; // Split and get the token part
  console.log(token);

  if (!token) return res.status(401).json({ error: "Access denied" });

  try {
    const verified = jwt.verify(token, "your_jwt_secret");
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({ error: "Invalid token" });
  }
};

app.post("/posts", authenticate, async (req, res) => {
  try {
    const { content } = req.body;
    const post = await Post.create({ content, userId: req.user.id });
    res.status(201).json({ message: "Post created", post });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post("/follow", authenticate, async (req, res) => {
  try {
    const { followId } = req.body;
    const followerId = req.user.id;

    // Prevent self-follow
    if (followerId === followId)
      return res.status(400).json({ error: "Cannot follow yourself" });

    await Follow.create({ followerId, followingId: followId });
    res.status(201).json({ message: "Followed successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get("/followers", authenticate, async (req, res) => {
  try {
    const followers = await Follow.findAll({
      where: { followingId: req.user.id },
    });
    res.status(200).json({ followers });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get("/following", authenticate, async (req, res) => {
  try {
    const following = await Follow.findAll({
      where: { followerId: req.user.id },
    });
    res.status(200).json({ following });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

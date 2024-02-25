const { Router } = require("express");

const UsersController = require("../controllers/UsersController");

const usersRoutes = Router();

function myMiddleware(req, res, next) {
  console.log("I'm a middleware");

  if (!req.body.isAdmin) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

const usersController = new UsersController();

usersRoutes.post("/", myMiddleware, usersController.create);
usersRoutes.put("/:id", usersController.update);

module.exports = usersRoutes;

const express = require('express')
const router = express.Router()

const { createUser, login, getUser, updateUser } = require("../controllers/userController")
const { createProduct } = require("../controllers/productController")
const { authentication, authorization } = require('../middleware/auth')

router.post("/register", createUser)
router.post("/login", login)
router.get("/user/:userId/profile", authentication, getUser)
router.put("/user/:userId/profile", authentication, authorization, updateUser)

router.post("/products", createProduct)

router.all("/*", (req, res) => { res.status(400).send({ status: false, message: "Endpoint is not correct plese provide a proper end-point" }) })

module.exports = router
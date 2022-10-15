const express = require('express')
const router = express.Router()

const { createUser, login, getUser, updateUser } = require("../controllers/userController")
const { authentication, authorization } = require('../middleware/auth')
const { createProduct, getProduct, getProductById, updateProduct, deleteProduct } = require("../controllers/productController")

//=========================================================== User Api's ===============================================================//
router.post("/register", createUser)
router.post("/login", login)
router.get("/user/:userId/profile", authentication, getUser)
router.put("/user/:userId/profile", authentication, authorization, updateUser)

//=========================================================== Product Api's ============================================================//
router.post("/products", createProduct)
router.get("/products", getProduct)
router.get("/products/:productId", getProductById)
router.put("/products/:productId", updateProduct)
router.delete("/products/:productId", deleteProduct) 

router.all("/*", (req, res) => { res.status(400).send({ status: false, message: "Endpoint is not correct plese provide a proper end-point" }) })

module.exports = router
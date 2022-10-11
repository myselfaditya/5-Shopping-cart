const express = require('express')
const router = express.Router()

const {imageUpload} = require("../controllers/aws") 
const {createUser, login, getUser} = require("../controllers/userController") 

router.post("/images", imageUpload)
router.post("/register", createUser)
 router.post("/login", login)
 router.get("/user/:userId/profile", getUser)

module.exports = router
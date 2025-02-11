import { Router } from "express"
import { registerUser, loginUser, logoutUser, refreshAccessToken, getCurrentUser, updateUserAvatar } from "../controllers/user.controllers.js"
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJwt } from "../middlewares/auth.middleware.js"

const router = Router()

// router.route('/register').get(registerUser)
router.route('/register').post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser)

router.route('/login').post(loginUser)
router.route('/refresh-token').post(refreshAccessToken)

// secured routes
router.route('/logout').post(verifyJwt, logoutUser)
router.route('/current-user').get(verifyJwt, getCurrentUser)
router.route('/update-avatar').patch(verifyJwt, upload.single("avatar"), updateUserAvatar)

export default router
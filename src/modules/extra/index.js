import checkToken from '../../middlewares/checkToken.js'
import { Router } from 'express'
import CT from './controller.js'

const router = Router()

router.get('/profileAvatar/:token', checkToken, CT.GET_AVATAR)
router.get('/profileUsername/:token', checkToken, CT.GET_USERNAME)
router.get('/file/:token/:fileName', checkToken, CT.GET_FILE)
router.get('/download/:token/:fileName', checkToken, CT.DOWNLOAD_FILE)

export default router
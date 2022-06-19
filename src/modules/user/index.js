import validation from '../../middlewares/validation.js'
import checkToken from '../../middlewares/checkToken.js'
import { Router } from 'express'
import CT from './controller.js'

const router = Router()

router.get('/login', CT.GET_LOGIN)
router.get('/register', CT.GET_REGISTER)

router.post('/login', validation, CT.POST_LOGIN)
router.post('/register', validation, CT.POST_REGISTER)

router.get('/users', checkToken, CT.GET_USERS)

export default router
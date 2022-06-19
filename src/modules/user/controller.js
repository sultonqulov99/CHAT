import { AuthenticationError, ValidationError } from '#errors'
import { Op } from 'sequelize'
import sha256 from 'sha256'
import path from 'path'
import JWT from '#JWT'

const GET_LOGIN = (req, res, next) => {
    try {
        res.render('login')
    } catch (error) {
        next(error)
    }
}

const GET_REGISTER = (req, res, next) => {
    try {
        res.render('register')
    } catch (error) {
        next(error)
    }
}

const GET_USERS = async (req, res, next) => {
    try {
        const users = await req.models.User.findAll({
            where: {
                userId: {
                    [Op.ne]: req.userId
                }
            },
            attributes: { exclude: ['password'] }
        })

        return res.send(users)
    } catch (error) {
        next(error)
    }
}

const POST_LOGIN = async (req, res, next) => {
    try {
        const { username, password } = req.body

        const user = await req.models.User.findOne({
            where: {
                username,
                password: sha256(password)
            },
            attributes: { exclude:['password'] }
        })

        if (!user) {
            throw new AuthenticationError('Wrong username or password!')
        }

        return res.status(200).json({
            status: 200,
            message: "The user successfully logged in!",
            data: user,
            token: JWT.sign({ userId: user.userId, agent: req.headers['user-agent'] })
        })
    } catch (error) {
        next(error)
    }
}


const POST_REGISTER = async (req, res, next) => {
    try {
        const { username, password } = req.body
        const { file } = req.files

        if (!['image/jpg', 'image/png', 'image/jpeg'].includes(file.mimetype)) {
            throw new ValidationError("file must be valid image!")
        }

        if (file.size > 1024 * 1024 * 10) {
            throw new ValidationError("file size is too large!")
        }

        const user = await req.models.User.findOne({
            where: {
                username
            }
        })

        if (user) {
            throw new AuthenticationError('The user already exists!')
        }

        const [,extname] = file.mimetype.split('/')
        const fileName = username + '.' + extname

        file.mv(path.join(process.cwd(), 'uploads', fileName))

        const record = await req.models.User.create({
            username,
            password: sha256(password),
            userImg: fileName
        }, {
            returning: true,
        })

        record.password = undefined

        return res.status(200).json({
            status: 200,
            message: "The user successfully registered!",
            data: record,
            token: JWT.sign({ userId: record.userId, agent: req.headers['user-agent'] })
        })
    } catch (error) {
        next(error)
    }
}

export default {
    POST_REGISTER,
    GET_REGISTER,
    POST_LOGIN,
    GET_USERS,
    GET_LOGIN,
}
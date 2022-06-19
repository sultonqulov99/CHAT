import path from 'path'

const GET_AVATAR = async (req, res, next) => {
    try {
        const user = await req.models.User.findOne({ where: { userId: req.userId } })
        res.sendFile(path.join(process.cwd(), 'uploads', user.userImg))
    } catch (error) {
        next(error)
    }
}

const GET_USERNAME = async (req, res, next) => {
    try {
        const user = await req.models.User.findOne({ where: { userId: req.userId } })
        res.setHeader('Content-Type', 'plain/text')
        res.send(user.username)
    } catch (error) {
        next(error)
    }
}

const GET_FILE = async (req, res, next) => {
    try {
        res.sendFile(path.join(process.cwd(), 'uploads', req.params.fileName))
    } catch (error) {
        next(error)
    }
}

const DOWNLOAD_FILE = async (req, res, next) => {
    try {
        res.download(path.join(process.cwd(), 'uploads', req.params.fileName))
    } catch (error) {
        next(error)
    }
}

export default {
    DOWNLOAD_FILE,
    GET_USERNAME,
    GET_AVATAR,
    GET_FILE
}
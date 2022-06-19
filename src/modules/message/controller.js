import { NotFoundError, ValidationError, BadRequestError } from '#errors'
import { Op } from 'sequelize'
import fs from 'fs/promises'
import path from 'path'

const GET_MESSAGES = async (req, res, next) => {
    try {
        let messages = await req.models.Message.findAll({
            where: {
                [Op.or]: [
                    { messageFrom: req.userId, messageTo: req.query.userId },
                    { messageFrom: req.query.userId, messageTo: req.userId },
                ]
            },
            order: [
                ['messageId', 'ASC'],
            ]
        })

        messages = await Promise.all(JSON.parse(JSON.stringify(messages)).map(async message => {
            message.messageFrom = await req.models.User.findOne({
                where: {
                    userId: message.messageFrom
                },
                attributes: { exclude: ['password'] }
            })

            message.messageTo = await req.models.User.findOne({
                where: {
                    userId: message.messageTo
                },
                attributes: { exclude: ['password'] }
            })

            return message
        }))

        return res.send(messages)
    } catch (error) {
        next(error)
    }
}

const POST_MESSAGES = async (req, res, next) => {
    try {
        const { messageBody, userId } = req.body
        
        let message
        if (req.files) {
            const { file } = req.files

            if (!file) {
                throw new ValidationError("file is required!")
            }

            if (file.size > 1024 * 1024 * 50) {
                throw new ValidationError("file size is too large!")
            }

            const [, extname] = file.mimetype.split('/')
            const fileName = Date.now() + '.' + extname

            file.mv(path.join(process.cwd(), 'uploads', fileName))

            message = {
                messageFrom: req.userId,
                messageTo: userId,
                messageBody: fileName,
                messageType: file.mimetype
            }
        } else {
            message = {
                messageFrom: req.userId,
                messageTo: userId,
                messageBody,
                messageType: 'plain/text'
            }
        }

        const record = await req.models.Message.create(message, { returning: true })

        record.messageFrom = await req.models.User.findOne({
            where: {
                userId: record.messageFrom
            },
            attributes: { exclude: ['password'] }
        })

        record.messageTo = await req.models.User.findOne({
            where: {
                userId: record.messageTo
            },
            attributes: { exclude: ['password'] }
        })

        process.io.to(record.messageTo.socketId).emit('messages:new message', record)
        if (req.files) {
            process.io.to(record.messageTo.socketId).emit('messages:stopping', { from: record.messageFrom.userId })
        }

        return res.status(200).json({
            status: 200,
            message: 'The message is sent!',
            data: record
        })
    } catch (error) {
        next(error)
    }
}

const PUT_MESSAGES = async (req, res, next) => {
    try {
        const { messageBody } = req.body
        const { messageId } = req.params

        const message = await req.models.Message.findOne({ where: { messageId } })

        if (!message) {
            throw new NotFoundError('there is no such message!')
        }

        if (
            message.messageFrom != req.userId ||
            message.messageType != 'plain/text'
        ) {
            throw new BadRequestError('the message cannot be changed!')
        }

        await req.models.Message.update({ messageBody }, {
            where: {
                messageId
            }
        })

        await message.reload()

        message.messageFrom = await req.models.User.findOne({
            where: {
                userId: message.messageFrom
            },
            attributes: { exclude: ['password'] }
        })

        message.messageTo = await req.models.User.findOne({
            where: {
                userId: message.messageTo
            },
            attributes: { exclude: ['password'] }
        })

        process.io.to(message.messageTo.socketId).emit('messages:updated', message)

        return res.status(200).json({
            status: 200,
            message: 'The message is updated!',
            data: message
        })
    } catch (error) {
        next(error)
    }
}

const DELETE_MESSAGES = async (req, res, next) => {
    try {
        const { messageId } = req.params

        const message = await req.models.Message.findOne({ where: { messageId } })

        if (!message) {
            throw new NotFoundError('there is no such message!')
        }

        if (message.messageFrom != req.userId) {
            throw new BadRequestError('the message cannot be deleted!')
        }

        await req.models.Message.destroy({
            where: {
                messageId
            }
        })

        if (message.messageType !== 'plain/text') {
            await fs.unlink(path.join(process.cwd(), 'uploads', message.messageBody))
        }

        message.messageFrom = await req.models.User.findOne({
            where: {
                userId: message.messageFrom
            },
            attributes: { exclude: ['password'] }
        })

        message.messageTo = await req.models.User.findOne({
            where: {
                userId: message.messageTo
            },
            attributes: { exclude: ['password'] }
        })

        process.io.to(message.messageTo.socketId).emit('messages:deleted', message)
        return res.status(200).json({
            status: 200,
            message: 'The message is deleted!',
            data: message
        })
    } catch (error) {
        next(error)
    }
}

export default {
    DELETE_MESSAGES,
    POST_MESSAGES,
    PUT_MESSAGES,
    GET_MESSAGES,
}
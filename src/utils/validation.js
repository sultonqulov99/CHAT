import Joi from 'joi'

export const USER_LOGIN_VALIDATION = Joi.object({
    body: Joi.object({
        username: Joi.string().required(),
        password: Joi.string().required()
    })
})

export const USER_REGISTER_VALIDATION = Joi.object({
    body: Joi.object({
        username: Joi.string().alphanum().min(2).max(50).required(),
        password: Joi.string().min(4).max(8).required()
    })
})

export const GET_MESSAGE_VALIDATION = Joi.object({
    query: Joi.object({
        userId: Joi.number().required(),
    })
})

export const POST_MESSAGE_VALIDATION = Joi.object({
    body: Joi.object({
        userId: Joi.number().required(),
        messageBody: Joi.string().max(150).required().custom((value, helper) => {
            if (value.includes('<') && value.includes('>')) {
                return helper.message("messageBody must not be HTML content!")
            } else {
                return true
            }
        }),
    }),
})

export const PUT_MESSAGE_VALIDATION = Joi.object({
    params: Joi.object({
        messageId: Joi.number().required()
    }),
    body: Joi.object({
        messageBody: Joi.string().max(150).required().custom((value, helper) => {
            if (value.includes('<') && value.includes('>')) {
                return helper.message("messageBody must not be HTML content!")
            } else {
                return true
            }
        }),
    }),
})

export const DELETE_MESSAGE_VALIDATION = Joi.object({
    params: Joi.object({
        messageId: Joi.number().required()
    }),
})
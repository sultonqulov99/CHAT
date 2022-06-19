import { InternalServerError } from '#errors'
import { Sequelize } from "sequelize"

import UserModel from '#models/user'
import MessageModel from '#models/message'

const sequelize = new Sequelize({
    username: process.env.PG_USER,
    password: process.env.PG_PASS,
    host: process.env.PG_HOST,
    port: process.env.PG_PORT,
    database: process.env.PG_DB,
    dialect: 'postgres',
    logging: false,
})

export default async () => {
    try {
        // connect to database
        await sequelize.authenticate()
        console.log('Database connected!')

        // load models
        await UserModel({ sequelize })
        await MessageModel({ sequelize })

        // sync to database
        await sequelize.sync({ alter: true })

        return sequelize
    } catch (error) {
        console.log('Database error: ' + error.message)
        throw new InternalServerError(error.message)
    }
}
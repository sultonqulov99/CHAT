import fileUpload from "express-fileupload"
import { Server } from "socket.io"
import express from "express"
import http from "http"
import path from "path"
import ejs from "ejs"
import './config/index.js'

import database from './config/database.js'
import modules from './modules/index.js'
// import mockdata from './mock.js'

import errorHandlerMiddleware from './middlewares/errorHandler.js'
import databaseMiddleware from './middlewares/database.js'
import loggerMiddleware from './middlewares/logger.js'

import socketModule from './socket/index.js'

!async function () { 
    const app = express()
    const httpServer = http.createServer(app)

    // database connection
    const db = await database()

    // mock data
    // await mockdata({ sequelize: db })

    // set engine
    app.engine('html', ejs.renderFile)
    app.set('view engine', 'html')
    app.set('views', path.join(process.cwd(), 'src', 'views'))

    // middlewares
    app.use(express.static(path.join(process.cwd(), 'src', 'public')))
    app.use(databaseMiddleware({ sequelize: db }))
    app.use(express.json())
    app.use(fileUpload())

    // modules
    app.use(modules)

    // error handling and logging
    app.use(errorHandlerMiddleware)
    app.use(loggerMiddleware)

    const io = new Server(httpServer)
    socketModule({ io, db })

    httpServer.listen(
        process.env.PORT,
        () => console.log('server ready at http://localhost:' + process.env.PORT)
    )
}()
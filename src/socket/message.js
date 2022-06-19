export default async ({ io, socket, db }) => {
    try {
        socket.on('messages:typing', async ({ to }) => {
            const user = await db.models.User.findOne({ where: { userId: to } })
            io.to(user.socketId).emit('messages:typing', { to, from: socket.userId })
        })

        socket.on('messages:stopping', async ({ to }) => {
            const user = await db.models.User.findOne({ where: { userId: to } })
            io.to(user.socketId).emit('messages:stopping', { to, from: socket.userId })
        })

        socket.on('messages:uploading', async ({ to }) => {
            const user = await db.models.User.findOne({ where: { userId: to } })
            io.to(user.socketId).emit('messages:uploading', { to, from: socket.userId })
        })

    } catch (error) {
        socket.emit('messages:error', error)
    }
}
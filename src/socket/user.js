import JWT from "#JWT"

export default async ({ io, socket, db }) => {
    const token = socket.handshake.auth.token.trim()
    try {
        if (!token) {
            socket.emit('exit')
        }

        const { userId, agent } = JWT.verify(token)

        if (agent !== socket.handshake.headers['user-agent']) {
            socket.emit('users:exit')
        }

        const user = await db.models.User.findOne({ where: { userId } })

        if (!user) {
            socket.emit('users:exit')
        }

        socket.userId = userId

        await db.models.User.update({ socketId: socket.id }, { where: { userId } })
        socket.broadcast.emit('users:connected', user)

        socket.on('disconnect', async () => {
            await db.models.User.update({ socketId: null }, { where: { userId } })
            socket.broadcast.emit('users:disconnected', user)
        })
    } catch (error) {
        socket.emit('users:exit')
    }
}
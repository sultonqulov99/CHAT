const GET = (req, res, next) => {
    try {
        res.render('index')
    } catch (error) {
        next(error)
    }
}

export default {
    GET
}
const {v4:uuidv4} = require("uuid")

function correlationId(req, res, next){
    const incoming = req.headers["x-correlation-id"]
    req.correlationId  = incoming || uuidv4()
    res.setHeader("X-Correlation-Id", req.correlationId)

    next()

}

module.exports = correlationId
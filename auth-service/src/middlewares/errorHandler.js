
const logger = require("../utils/logger")

class AppError extends Error{
    constructor(message, statusCode = 400, code="BadRequest" ){
        super(message)
        this.statusCode = statusCode;
        this.code = code;
    }


}


function notFoundHandler(req, res) {
  res.status(404).json({ error: 'NotFound', message: `Route ${req.method} ${req.path} not found` });
}

function errorHandler(err, req,res, next){
    const statusCode = err.statusCode || 500
    const code = err.code || "InternalServerError"

    logger.error(err.message, {
        correlationId: req.correlationId,
        stack: err.stack,
        statusCode

    })

    res.status(statusCode).json({
    error: code,
    message: statusCode === 500 ? 'An unexpected error occurred' : err.message,
    correlationId: req.correlationId,
  });
}


module.exports = {
    AppError, errorHandler, notFoundHandler
}


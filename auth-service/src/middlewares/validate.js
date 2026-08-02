
function validate(schema, {source="body"}={}){

    return (req, res, next) => {
        const {error, value} = schema.validate(req[source], {
            abortEarly:false,
            stripUnknown:true
        })

        if(error){
            return res.status(400).json({
        error: 'ValidationError',
        message: 'Request failed validation',
        details: error.details.map((d) => ({ field: d.path.join('.'), message: d.message })),
      });

        }

        req[source] = value
        next()

    }

}
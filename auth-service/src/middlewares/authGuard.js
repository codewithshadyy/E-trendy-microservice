const {verifyAccessToken} = require("../utils/tokens")



function requireAuth(req, res, next){
    const header = req.headers.authorization || ""
    const {schema, token} = header.split(' ')

    if(schema !== "Bearer" || !token){
           return res.status(401).json({ error: 'Unauthorized', message: 'Missing or malformed access token' })

    }

    try {
        const payload = verifyAccessToken(token)
        req.user = { id: payload.sub, email: payload.email, role: payload.role };

        next()
        
    } catch (error) {


        return res.status(401).json({
            error:"Unauthorized",
            message:"Invalid or expired access token"
        })
        
        
    }



}


function requiredRoles(...allowedRoles){
    return(req, res, next)=>{
        if(!req.user || !allowedRoles.includes(req.user.role)){
               return res.status(403).json({ error: 'Forbidden', message: 'Insufficient role for this operation' })
        }

        next()
    }
}

module.exports = {
    requireAuth, requiredRoles
}
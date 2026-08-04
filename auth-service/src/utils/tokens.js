const jwt = require("jsonwebtoken")
const crypto = require("crypto")
// const  {v4:uuidv4} = require("uuid")
const env = require("../config/env")

 function signAccessToken(user) {

    return jwt.sign({
        sub:user.id,
        email:user.email,
        role:user.role
    }, env.jwt.accessSecret, {
        expiresIn:env.jwt.accessExpiresIn
    })

    
}


function verifyAccessToken(token){
    return jwt.verify(token, env.jwt.accessSecret)
}


function generateRefreshToken(){
    const raw = crypto.randomBytes(48).toString("hex")
    const tokenHash = hashToken(raw)
    return {raw, tokenHash}

}

function hashToken(raw){
    return crypto.createHash('sha256').update(raw).digest('hex')

}


function newTokenFamilyId(){
    return crypto.randomUUID()
}

function refreshExpiryDate() {
  const d = new Date();
  d.setDate(d.getDate() + env.jwt.refreshExpiresInDays);
  return d;
}
 
module.exports = {
  signAccessToken,
  verifyAccessToken,
  generateRefreshToken,
  hashToken,
  newTokenFamilyId,
  refreshExpiryDate,
};


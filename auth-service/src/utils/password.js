
const bcrypt = require("bcrypt")
const env  = require("../config/env")

async function hash(plainPassword) {

    return bcrypt.hash(plainPassword, env.bcryptSaltRounds)
    
}

async function verify(plainPassword, passwordHash) {

    return bcrypt.compare(plainPassword, passwordHash)
    
}

module.exports = {hash, verify}
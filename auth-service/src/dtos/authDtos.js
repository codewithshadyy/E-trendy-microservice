const joi = require("joi")

const passwordRule = joi.string()
.max(15)
.min(6)
.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
.messages({
    'string.pattern.base':'Password must contain at least one lowercase letter, one uppercase letter, and one digit'

}
)


const registerSchema = joi.object({
    email:joi.string().email().required(),
    password:passwordRule.required(),
    role:joi.string().valid("customer", "seller").default("customer")
})

const loginSchema = joi.object({
    email:joi.string().email().required,
    password:joi.string().required()
})

const refreshSchema = joi.object({
    refreshToken : joi.string().required()
})

const logoutSchema = joi.object({
    refreshToken: joi.string().required(),
})

const verifyEmailSchema = joi.object({
  token: joi.string().required(),
});
 
const forgotPasswordSchema = joi.object({
  email: joi.string().email().required(),
});

const resetPasswordSchema = joi.object({
  token: joi.string().required(),
  newPassword: passwordRule.required(),
});


module.exports = {
  registerSchema,
  loginSchema,
  refreshSchema,
  logoutSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
};

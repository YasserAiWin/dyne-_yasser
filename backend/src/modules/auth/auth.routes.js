const { Router } = require('express');
const authController = require('./auth.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const validate = require('../../middlewares/validate.middleware');
const { loginSchema } = require('./auth.validation');

const router = Router();

// Public login route
router.post('/login', validate(loginSchema), authController.login);

// Protected user profile route
router.get('/me', authMiddleware, authController.me);

module.exports = router;

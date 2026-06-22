const jwt = require('jsonwebtoken');
const db = require('./db');

const authMiddleware = async (req, res, next) => {
    let token = req.cookies?.access_token;

    if (!token) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        }
    }

    if (!token) {
        return res.status(401).json({ detail: 'Authentication credentials were not provided.' });
    }
    try {
        const decoded = jwt.verify(token, process.env.DJANGO_SECRET_KEY);
        const userId = decoded.user_id;

        if (!userId) {
            return res.status(401).json({ detail: 'Token contained no recognizable user identification' });
        }

        // Attach user to req
        req.user = { id: userId };

        // Profile completion check
        const profileResult = await db.query(
            'SELECT phone, address FROM store_userprofile WHERE user_id = $1',
            [userId]
        );

        if (profileResult.rows.length === 0) {
            return res.status(403).json({ detail: 'Profile is incomplete.' });
        }

        const profile = profileResult.rows[0];
        const isCompleted = Boolean(profile.phone && profile.address);

        if (!isCompleted) {
            return res.status(403).json({ detail: 'Profile is incomplete.' });
        }

        next();
    } catch (err) {
        console.error("JWT Verification Error:", err);
        return res.status(401).json({ detail: 'Given token not valid for any token type', code: 'token_not_valid' });
    }
};

module.exports = authMiddleware;

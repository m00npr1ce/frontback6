const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: false
    }
}));

const users = {};

async function hashPassword(password) {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
}

async function comparePassword(password, hash) {
    return await bcrypt.compare(password, hash);
}

function requireLogin(req, res, next) {
    if (req.session.userId) {
        next();
    } else {
        res.redirect('/');
    }
}

app.post('/register', async (req, res) => {
    const { login, password } = req.body;

    if (users[login]) {
        return res.status(400).send('User already exists');
    }

    const hashedPassword = await hashPassword(password);
    users[login] = { password: hashedPassword };

    req.session.registrationMessage = 'Регистрация прошла успешно! Пожалуйста, войдите.';  // Сохраняем сообщение в сессии
    console.log("Registered new user: ", login);

    res.redirect('/');
});

app.post('/login', async (req, res) => {
    const { login, password } = req.body;

    const user = users[login];
    if (!user) {
        return res.status(400).send('Invalid credentials');
    }

    const passwordMatch = await comparePassword(password, user.password);
    if (passwordMatch) {
        req.session.userId = login;
        console.log("User logged in: ", login);
        return res.redirect('/profile');
    } else {
        return res.status(400).send('Invalid credentials');
    }
});

app.get('/profile', requireLogin, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'profile.html'));
});

app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.sendStatus(500);
        }
        res.redirect('/');
    });
});

const cacheDir = path.join(__dirname, 'cache');
if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir);
}

function generateCacheKey(req) {
    if (req.method === 'GET') {
        return req.originalUrl;
    } else {
        const hash = crypto.createHash('sha256');
        hash.update(JSON.stringify(req.body));
        return hash.digest('hex');
    }
}

async function getCachedData(cacheKey) {
    const cacheFile = path.join(cacheDir, `${cacheKey}.json`);
    try {
        const stats = fs.statSync(cacheFile);
        const cacheAge = (Date.now() - stats.mtimeMs) / 1000;

        if (cacheAge < 60) {
            const data = fs.readFileSync(cacheFile, 'utf8');
            return JSON.parse(data);
        } else {
            return null;
        }
    } catch (err) {
        return null;
    }
}

async function setCachedData(cacheKey, data) {
    const cacheFile = path.join(cacheDir, `${cacheKey}.json`);
    fs.writeFileSync(cacheFile, JSON.stringify(data));
}

app.get('/data', async (req, res) => {
    const cacheKey = generateCacheKey(req);
    let cachedData = await getCachedData(cacheKey);

    if (cachedData) {
        console.log('Serving data from cache');
        return res.json(cachedData);
    }

    const newData = {
        timestamp: Date.now(),
        random: Math.random()
    };

    await setCachedData(cacheKey, newData);
    console.log('Generated new data and saved to cache');
    return res.json(newData);
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});

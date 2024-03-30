const express = require('express')
const pasth = require('path')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const collection = require('./config')

const app = express()

app.use(express.json())

app.use(express.urlencoded({ extended: false }))


app.set('view engine', 'ejs')

app.use(express.static('public'))


const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.redirect('/?error=Necesitas iniciar sesion')
    }

    jwt.verify(token, 'secret_key', (err, decoded) => {
        if (err) {
            return res.redirect('/?error=Token de autenticación inválido')
        }
        req.user = decoded;
        next();
    })
}




app.get('/', (req, res) => {
    res.render('bienvenida', { req: req })
})

app.get('/login', (req, res) => {
    res.render('login', { errorMessage: null })
})

app.get('/signup', (req, res) => {
    res.render('signup', { errorMessage: null })
})

app.get('/home', verifyToken, (req, res) => {
    console.log(req.user) 
    const userId = req.user._id
    res.render('home', { userId: userId });
});



app.post('/signup', async (req, res) => {
    const data = {
        name: req.body.username,
        password: req.body.password
    };

    try {
        const existingUser = await collection.findOne({ name: data.name });
        if (existingUser) {
            res.render('signup', { errorMessage: 'El usuario ya existe. Por favor, utiliza uno diferente.' });
        } else {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(data.password, saltRounds)

            data.password = hashedPassword;

            const userData = await collection.create(data)
            console.log(userData);
            res.render('presentacion', {message: "El usuario ha sido creado con exito"})
        }
    } catch (error) {
        console.error('Error al crear usuario:', error);
        res.status(500).send('Error interno del servidor')
    }
})


app.post('/login', async (req, res) => {
    try {
        const user = await collection.findOne({ name: req.body.username })
        if (!user) {
            res.render('login', { errorMessage: 'El usuario no existe' });

        } else {
            const isPasswordMatch = await bcrypt.compare(req.body.password, user.password);
            if (isPasswordMatch) {
                const token = jwt.sign({ username: user.name }, 'secret_key')
                res.header('authorization', token);
                res.render('home');
            } else {
                res.render('login', { errorMessage: 'Contraseña incorrecta' })
            }
        }
    } catch (error) {
        console.error('Error al procesar la solicitud:', error)
        res.status(500).send('Error interno del servidor')
    }
});


app.post('/logout', (req, res) => {
    res.clearCookie('authorization')
    res.redirect('/login')
});




const port = 4000

app.listen(port, () => {
    console.log(`El servidor esta en el puerto: ${port}`)
})
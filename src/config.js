const mongoose = require('mongoose')
const connect = mongoose.connect('mongodb+srv://alquizor8:alquizor8@cluster0.t5rqhi8.mongodb.net/loginMongodb')

connect.then(() => {
    console.log('Conexion exitosa a la base de datos')
})
.catch(() => {
    console.log('ERROR: no se puede establecer la conexion')
})

const LoginSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    }, // 用户名称
    password: { 
        type: String, 
        required: true 
    } // 密码，使用md
})

const collection = new mongoose.model("users", LoginSchema)

module.exports = collection
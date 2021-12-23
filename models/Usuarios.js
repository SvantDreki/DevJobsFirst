const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const bcrypt = require('bcrypt');

const usuarioSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    token: String,
    expira: Date,
    imagen: String
});

//Método para hashear los password
usuarioSchema.pre('save', async function(next) {
    //Si el password esta hasheado
    if(!this.isModified('password')) {
        return next(); //se detiene la ejecucion
    }

    //Si no esta hasheado
    const hash = await bcrypt.hash(this.password, 12);
    this.password = hash;
    next();
});

//Envia una alerta cuando el usuario ya esta autenticado
usuarioSchema.post('save', function(error, doc, next) {
    if(error.name === 'MongoError' && error.code === 11000) {
        next('Ese correo ya esta registrado');
    }else {
        next(error);
    }
});

//Autenticar usuario
usuarioSchema.methods = {
    compararPassword: function(password) {
        return bcrypt.compareSync(password, this.password);
    }
}

module.exports = mongoose.model('Usuarios', usuarioSchema);
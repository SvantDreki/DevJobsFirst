const passport = require('passport');
const mongoose = require('mongoose');
const Vacantes = mongoose.model('Vacante');
const Usuarios = mongoose.model('Usuarios');
const crypto = require('crypto');
const enviarEmail = require('../handlers/email');


exports.autenticarUsuario = passport.authenticate('local', {
    successRedirect : '/administracion',
    failureRedirect : '/iniciar-sesion',
    failureFlash: true,
    badRequestMessage: 'Ambos campos son Obligatorios'
});

//Revisar que el usuario este autenticado o no
exports.verificarUsuario = (req, res ,next) => {

    //revisar el usuario
    if(req.isAuthenticated()) {
        return next(); //Esta autenticado
    }

    //Redireccionar
    res.redirect('/iniciar-sesion');
}

exports.mostrarPanel = async (req, res) => {

    //Consulta al usuario autenticado
    const vacantes = await Vacantes.find({ autor: req.user._id }).lean();

    res.render('administracion', {
        nombrePagina: 'Panel de Administración',
        tagline: 'Crea y administra tu vacantes desde aquí',
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen : req.user.imagen,
        vacantes
    });
}

exports.cerrarSesion = (req, res) => {
    req.logout();

    req.flash('correcto', 'Cerraste Sesión Correctamente');
    return res.redirect('/iniciar-sesion');
}

//Formulario para reestablecer password
exports.formReestablecerPass = (req, res) => {
    res.render('reestablecer-password', {
        nombrePagina : 'Reestablece tu password',
        tagline : 'Si ya tienes una cuenta pero olvidaste tu password, coloca tu email'
    });
}

//Genera un token en la tabla de usuario
exports.enviarToken = async (req, res) => {
    const usuario = await Usuarios.findOne({ email: req.body.email });

    if(!usuario) {
        req.flash('error', 'No existe esa cuenta');
        return res.redirect('/iniciar-sesion');
    }

    //Si el usuario existe, genera el token
    usuario.token = crypto.randomBytes(20).toString('hex');
    usuario.expira = Date.now() + 3600000;

    //Guardar usuario
    await usuario.save();
    const resetUrl = `http://${req.headers.host}/reestablecer-password/${usuario.token}`;

    //Enviar notificacion por email
    await enviarEmail.enviar({
        usuario,
        subject : 'Password reset',
        resetUrl,
        archivo: 'reset'
    });

    req.flash('correcto', 'Revisa tu email para las indicaciones');
    res.redirect('/iniciar-sesion');
}

//Valida si el token y el usuario existe, muestra la vista
exports.reestablecerPass = async (req, res) => {
    const usuario = await Usuarios.findOne({
        token : req.params.token,
        expira : {
            $gt : Date.now()
        }
    });

    if(!usuario) {
        req.flash('error', 'El formulario ya no es valido, intenta de nuevo');
        return res.redirect('/reestablecer-password');
    }

    //todo bien mostrar el formulario
    res.render('nuevo-password', {
        nombrePagina : 'Nuevo Password'
    });
}

//Almacena la nueva password en la BD
exports.guardarPass = async (req, res) => {
    const usuario = await Usuarios.findOne({
        token : req.params.token,
        expira : {
            $gt : Date.now()
        }
    });

    if(!usuario) {
        req.flash('error', 'El formulario ya no es valido, intenta de nuevo');
        return res.redirect('/reestablecer-password');
    }

    //asignar nuevo password y limpiar valores previos
    usuario.password = req.body.password;
    usuario.token = undefined;
    usuario.expira = undefined;

    //Guardar los datos nuevos en la BD
    await usuario.save();

    //Redirigir
    req.flash('correcto', 'Password Modificada Correctamente');
    res.redirect('/iniciar-sesion');

}
const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');
const vacantesController = require('../controllers/vacantesController');
const usuariosController = require('../controllers/usuariosController');
const authController = require('../controllers/authController');

module.exports = () => {
    router.get('/', homeController.mostrarTrabajos);

    //Crear vacantes
    router.get('/vacantes/nueva', authController.verificarUsuario, vacantesController.formularioNuevaVacante);
    router.post('/vacantes/nueva', authController.verificarUsuario, vacantesController.validarVacante, vacantesController.agregarVacante);

    //Mostrar vacante (singular)
    router.get('/vacantes/:url', vacantesController.mostrarVacante);

    //editar vacante
    router.get('/vacante/editar/:url', authController.verificarUsuario, vacantesController.formEditarVacante);
    router.post('/vacante/editar/:url', authController.verificarUsuario, vacantesController.validarVacante, vacantesController.editarVacante);

    //Eliminar Vacante
    router.delete('/vacantes/eliminar/:id', vacantesController.eliminarVacante);

    //Crear Cuenta
    router.get('/crear-cuenta', usuariosController.formCrearCuenta);
    router.post('/crear-cuenta', usuariosController.validarRegistro, usuariosController.crearUsuario);

    //Autenticar usuarios
    router.get('/iniciar-sesion', usuariosController.formIniciarSesion);
    router.post('/iniciar-sesion', authController.autenticarUsuario);

    //Cerrar Sesión
    router.get('/cerrar-sesion', authController.verificarUsuario, authController.cerrarSesion);

    //Reestablecer password
    router.get('/reestablecer-password', authController.formReestablecerPass);
    router.post('/reestablecer-password', authController.enviarToken);

    //Resetear password (almacenar en la BD)
    router.get('/reestablecer-password/:token', authController.reestablecerPass);
    router.post('/reestablecer-password/:token', authController.guardarPass);

    //Panel de Administración
    router.get('/administracion', authController.verificarUsuario, authController.mostrarPanel);

    //Editar perfil
    router.get('/editar-perfil', authController.verificarUsuario, usuariosController.formEditarPerfil);
    router.post('/editar-perfil', authController.verificarUsuario, 
                                  //usuariosController.validarPerfil,
                                  usuariosController.subirImagen, 
                                  usuariosController.editarPefil);

    //Recibir mensajes de candidatos
    router.post('/vacantes/:url', vacantesController.subirCV, vacantesController.contactar);

    //Muestra los candidatos por vacantes
    router.get('/candidatos/:id', authController.verificarUsuario, vacantesController.mostrarCandidatos);

    return router;
}
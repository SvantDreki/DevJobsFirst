import axios from 'axios';
import Swal from 'sweetalert2';

document.addEventListener('DOMContentLoaded', () => {
    const skills = document.querySelector('.lista-conocimientos');

    // limpiar alertas
    let alertas = document.querySelector('.alertas');

    if(alertas) {
        limpiarAlertas();
    }

    if(skills) {
        skills.addEventListener('click', agregarSkills);

        //Una vez que estemos en editar, llamamos a la funcion
        skillSeleccionados();
    }

    const vacantesListado = document.querySelector('.panel-administracion');

    if(vacantesListado) {
        
        //Eliminar vacante
        vacantesListado.addEventListener('click', (e) => {
            e.preventDefault();

            if(e.target.dataset.eliminar) {
                //Eliminar por axios
                Swal.fire({
                    title: '¿Confirmar Eliminación?',
                    text: "Una vez eliminado, no se puede recuperar",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Si, Eliminar!',
                    cancelButtonText: 'No, Cancelar'
                }).then((result) => {
                    if (result.isConfirmed) {

                        //Enviar petición po axios
                        const url = `${location.origin}/vacantes/eliminar/${e.target.dataset.eliminar}`;

                        //Axios para eliminar el registro
                        axios.delete(url, { params: {url} })
                            .then(function(respuesta) {
                                if(respuesta.status === 200) {
                                    Swal.fire(
                                        'Eliminado!',
                                        respuesta.data,
                                        'success'
                                    );

                                    //TODO: Eliminar Del DOM
                                    e.target.parentElement.parentElement.parentElement.removeChild(e.target.parentElement.parentElement); 
                                }
                            })
                            .catch(() => {
                                Swal.fire({
                                    type: 'error',
                                    title: 'Hubo un error',
                                    text: 'No Se pudo Eliminar'
                                });
                            });
                    }
                })
            }else if(e.target.tagName === 'A') {
                window.location.href = e.target.href; 
            }
        });
    }
})

const skills = new Set();
const agregarSkills = (e) => {
    if(e.target.tagName === 'LI') {
        if(e.target.classList.contains('activo')) {
            skills.delete(e.target.textContent);
            e.target.classList.remove('activo');
        }else {
            skills.add(e.target.textContent);
            e.target.classList.add('activo');
        }
    }

    const skillsArray = [...skills];
    document.querySelector('#skills').value = skillsArray;
    //console.log(skills);
}

const skillSeleccionados = () => {
    const seleccionados = Array.from(document.querySelectorAll('.lista-conocimientos .activo'));

    seleccionados.forEach(seleccionado => {
        skills.add(seleccionado.textContent);
    });

    const skillsArray = [...skills];
    document.querySelector('#skills').value = skillsArray;
}

const limpiarAlertas = () => {
    const alertas = document.querySelector('.alertas');
    const interval = setInterval(() => {
        if(alertas.children.length > 0) {
            alertas.removeChild(alertas.children[0]);
        }else if(alertas.children.length === 0) {
            alertas.parentElement.removeChild(alertas);
            clearInterval(interval);
        }
    }, 3000);
}



/*
    Event routes
    /api/events
*/
const { Router } = require('express');
const {check } = require('express-validator')
const { validarCampos } = require('../middlewares/validar-campos')
const { isDate } = require('../helpers/isDate')

const { validarJWT } = require('../middlewares/validar-jwt');
const {getEvents, createEvent, updateEvent, deleteEvent } = require('../controllers/events');


const router = Router();

// Todas tienen que pasar por la validación del JWT
router.use( validarJWT );

// Obtener eventos
router.get('/', getEvents );

// Create un nuevo evento
router.post(
    '/',
    [
        check('title', 'El titulo es obligatorio').not().isEmpty(),
        check('start', 'Fecha de inicio es obligatoria').custom( isDate ),
        check('end', 'Fecha fin es obligatoria').custom( isDate ),
        validarCampos
    ],
    createEvent
    );

// Update evento
router.put(
    '/:id', 
    [
        check('title','El titulo es obligatorio').not().isEmpty(),
        check('start','Fecha de inicio es obligatoria').custom( isDate ),
        check('end','Fecha de finalización es obligatoria').custom( isDate ),
        validarCampos
    ],
    updateEvent 
);

// Delete event
router.delete('/:id', deleteEvent);

module.exports = router;
const { response } = require('express');
const Evento = require('../models/Evento');

const getEvents = async( req, res = response ) =>{

    // para mostrar todos los eventos
    const eventos = await Evento.find()
                                .populate('user','name');

    res.json({
        ok: true,
        eventos
    });
}

const createEvent = async( req, res = response ) =>{

    const evento = new Evento(req.body);

    try {

        evento.user = req.uid;

        const eventSaveDB = await evento.save()
        
        res.json({
            ok: true,
            evento: eventSaveDB
        })
        
    } catch (error) {
        console.log(error)
        req.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        })
    }

}

const updateEvent = async( req, res = response ) =>{

    const eventId = req.params.id;
    const uid = req.uid;

    try {
        const event = await Evento.findById( eventId );

        if ( !event) {
            return res.status(404).json({
                ok: false,
                msg: 'El evento no existe por ese ID'
            });
        }

        if( event.user.toString() !== uid ){
            return res.status(401).json({
                ok: false,
                msg: 'No tiene privilegios para editar este evento'
            });
        }

        const newEvent = {
            ...req.body,
            user: uid
        }

        const eventUpdate = await Evento.findByIdAndUpdate( eventId, newEvent, { new: true } );
        
        res.json({
            ok: true,
            event: eventUpdate
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        });
    }
}

const deleteEvent = async( req, res = response ) =>{

    const eventId = req.params.id;
    const uid = req.uid;

    try {
        const event = await Evento.findById( eventId );

        if ( !event) {
            return res.status(404).json({
                ok: false,
                msg: 'El evento no existe por ese ID'
            });
        }

        if( event.user.toString() !== uid ){
            return res.status(401).json({
                ok: false,
                msg: 'No tiene privilegios para eliminar este evento'
            });
        } 

        await Evento.findByIdAndDelete( eventId );
        
        res.json({ ok: true });

    } catch (error) {
        console.log(error)
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        });
    }
}

module.exports = {
    getEvents,
    createEvent,
    updateEvent,
    deleteEvent
}
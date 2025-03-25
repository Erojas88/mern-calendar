const { response } = require('express');
const Evento = require('../models/Evento');

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;
let eventsCache = null;
let lastCacheUpdate = 0;

const getEvents = async(req, res = response) => {
    try {
        const { page = 1, limit = 10, startDate, endDate } = req.query;
        const skip = (page - 1) * limit;

        // Check if we can use cache
        const now = Date.now();
        if (eventsCache && (now - lastCacheUpdate) < CACHE_DURATION) {
            return res.json({
                ok: true,
                eventos: eventsCache,
                fromCache: true
            });
        }

        // Build query
        const query = {};
        if (startDate && endDate) {
            query.start = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        // Execute query with pagination
        const [eventos, total] = await Promise.all([
            Evento.find(query)
                .populate('user', 'name')
                .sort({ start: 1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Evento.countDocuments(query)
        ]);

        // Update cache
        eventsCache = eventos;
        lastCacheUpdate = now;

        res.json({
            ok: true,
            eventos,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({
            ok: false,
            msg: 'Error al obtener los eventos',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

const createEvent = async(req, res = response) => {
    try {
        const evento = new Evento(req.body);
        evento.user = req.uid;

        const eventSaveDB = await evento.save();
        
        // Invalidate cache
        eventsCache = null;
        
        res.status(201).json({
            ok: true,
            evento: eventSaveDB
        });
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({
            ok: false,
            msg: 'Error al crear el evento',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

const updateEvent = async(req, res = response) => {
    const eventId = req.params.id;
    const uid = req.uid;

    try {
        const event = await Evento.findById(eventId);

        if (!event) {
            return res.status(404).json({
                ok: false,
                msg: 'El evento no existe por ese ID'
            });
        }

        if (event.user.toString() !== uid) {
            return res.status(401).json({
                ok: false,
                msg: 'No tiene privilegios para editar este evento'
            });
        }

        const newEvent = {
            ...req.body,
            user: uid
        };

        const eventUpdate = await Evento.findByIdAndUpdate(
            eventId,
            newEvent,
            { new: true, runValidators: true }
        );
        
        // Invalidate cache
        eventsCache = null;
        
        res.json({
            ok: true,
            event: eventUpdate
        });
    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({
            ok: false,
            msg: 'Error al actualizar el evento',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

const deleteEvent = async(req, res = response) => {
    const eventId = req.params.id;
    const uid = req.uid;

    try {
        const event = await Evento.findById(eventId);

        if (!event) {
            return res.status(404).json({
                ok: false,
                msg: 'El evento no existe por ese ID'
            });
        }

        if (event.user.toString() !== uid) {
            return res.status(401).json({
                ok: false,
                msg: 'No tiene privilegios para eliminar este evento'
            });
        }

        await Evento.findByIdAndDelete(eventId);
        
        // Invalidate cache
        eventsCache = null;
        
        res.json({ ok: true });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({
            ok: false,
            msg: 'Error al eliminar el evento',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
    getEvents,
    createEvent,
    updateEvent,
    deleteEvent
};
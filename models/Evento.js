const { Schema, model } = require('mongoose');

const EventoSchema = Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    notes: {
        type: String,
        trim: true,
        maxlength: 500
    },
    start: {
        type: Date,
        required: true,
        index: true
    },
    end: {
        type: Date,
        required: true,
        index: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true,
        index: true
    }
}, {
    timestamps: true
});

// Compound index for common queries
EventoSchema.index({ user: 1, start: 1, end: 1 });

EventoSchema.method('toJSON', function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

module.exports = model('Evento', EventoSchema);

const { Schema, SchemaTypes, model } = require('mongoose');

const archiveSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        required: true,
    },
    updatedAt: {
        type: Date,
        required: true,
    },
});

const Archive = model('archives', archiveSchema); 

module.exports = Archive;
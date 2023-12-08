require('../database');
const mongoose = require('mongoose');

const { Schema } = mongoose;

let departmentSchema = new Schema({
    departmentName: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    project: [{
        type: Schema.Types.ObjectId,
        ref: 'Projects'
    }],
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    createdTime: {
        type: Date,
        default: Date.now
    },
    updatedTime: {
        type: Date
    },
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'Users'
    }
}, {versionKey: false});

module.exports = mongoose.model('Departments', departmentSchema)

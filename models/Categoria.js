const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Categoria = new Schema({
    nome: {
        type: String,
        required: true 
    },

    slug: {
        type: String,
        required: true 
    },

    date: {
        type: Date,
        default: Date.now() 
        // nome padrao, caso ninguem tenha preenchido no formulario
    }
});

mongoose.model('categorias', Categoria)
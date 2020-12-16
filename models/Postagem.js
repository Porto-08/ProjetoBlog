const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Postagem = new Schema({
    titulo: {
        type: String, 
        required: true
    },

    descricao: {
        type: String,
        required: true
    },

    conteudo: {
        type: String,
        required: true
    },

    categoria: { // irá se referenciar a uma categoria que ja existe 
        type: Schema.Types.ObjectId, // Armazena o ID de um objeto
        ref: 'categorias',// neste campo passar o nome do model que ira se referenciar  
        require: true
    },

    data: {
        type: Date,
        default: Date.now,
    },

    slug: {
        type: String,
        required: true
    }
});

// criar collection para o model

mongoose.model('postagens', Postagem)

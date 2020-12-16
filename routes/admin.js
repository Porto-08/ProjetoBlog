const express = require('express');
const router = express.Router(); // sempre exportar no fim do arquivo

// Usando model de forma externa!
const mongoose = require('mongoose');
const { isMainThread } = require('worker_threads');
const {eAdmin} = require('../helpers/eAdmin');
// models 
    // Categoria
        require('../models/Categoria');
        const Categoria = mongoose.model('categorias');
    // Postagem
        require('../models/Postagem')
        const Postagem = mongoose.model('postagens')



// Rota Inicial
router.get('/', eAdmin,(req, res) => {
    res.render('admin/index')
});

// rotas de categorias

router.get('/categorias', eAdmin,(req, res) => {
    Categoria.find().then((categorias) => {
        res.render('admin/categorias', {categorias: categorias.map(Categoria => Categoria.toJSON())})
    }).catch((erro) =>{
        req.flash('error_msg', `Houve um erro ao listar as categorias registradas: ${erro}`)
    });
});

router.get('/categorias/add', eAdmin, (req, res) => {
    res.render('admin/addcategoria')
});

// rota para criar uma nova categoria!
router.post('/categorias/nova', (req,res) => {
    
    // validacao do formulario
    var erros =[];

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: 'Nome inválido, corrija.'})
    } 
    
    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: 'Slug inválido, corrija.'})
    } 

    if(req.body.nome.length < 3){
        erros.push({texto: 'Nome muito curto, corrija.'}) 
    }

    if(erros.length > 0){
        res.render('admin/addcategoria', {erros: erros})
    }else{
        const novaCategoria = {
            nome: req.body.nome,
    
            slug: req.body.slug
        }
    
        new Categoria(novaCategoria).save().then(() => {
            req.flash('success_msg', 'Categoria registrada com sucesso.')
            res.redirect('/admin/categorias')
        }).catch((erro) => {
            req.flash('error_msg', 'Houve um erro ao registrar a categoria, tente novamente!')
            res.redirect('/admin')
        });
    }
});

router.get('/categorias/edit/:id', eAdmin, (req, res) => {
    Categoria.findOne({_id:req.params.id}).lean().then((categorias) => { // Nao esquecer do .lean() apos pegar os parametros
        res.render('admin/editcategorias', {categorias: categorias})
    }).catch((erro) => {
        req.flash('error_msg', 'Esta categoria não existe')
        req.redirect('/admin/categorias')
    });
    
});

router.post('/categorias/edit', eAdmin, (req, res) => {
    
    var erros =[];

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: 'Nome inválido, corrija.'})
    } 
    
    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: 'Slug inválido, corrija.'})
    } 

    if(req.body.nome.length < 3){
        erros.push({texto: 'Nome muito curto, corrija.'}) 
    }

    if(erros.length > 0){
        res.render('admin/editcategorias', {erros: erros})
    }else{
        Categoria.findOne({_id: req.body.id}).then((categorias) => {

            categorias.nome = req.body.nome
            categorias.slug = req.body.slug

            categorias.save().then(() => {
                req.flash('success_msg', `A edição foi concluida com sucesso.`)
                res.redirect('/admin/categorias').catch((erro) => {
                    req.flash('error_msg' , `Houve um erro ao fazer a edição, tente novamnete.`)
                    res.redirect('/admin/categorias')
                })
            })

        }).catch((erro) => {
            req.flash('error_msg', `Houve um erro ao editar a categoria: ${erro}`)
            res.redirect('/admin/categorias')
        })
    }
});

router.post('/categorias/deletar/:id', eAdmin, (req, res) =>{
    Categoria.findOneAndDelete({_id: req.params.id}).then(() => {
        req.flash('success_msg', `Categoria Deletada com Sucesso!`)
        res.redirect('/admin/categorias')
    }).catch((erro) => {
        req.flash('error_msg' `Houve um erro ao deletar a Categoria: ${erro}`)
        res.redirect('/admin/categorias')
    });
});

// rotas para postagens
router.get('/postagens', eAdmin, (req, res) => {

    Postagem.find().populate('categoria').sort({data: 'desc'}).then((postagens) => {
        res.render('admin/postagens', ({postagens: postagens.map(Postagem => Postagem.toJSON())}))
    }).catch((erro) => {
        req.flash('error_msg', `Houve um erro ao listar as postagens: ${erro}`)
        res.redirect('/admin')
    })
    
})  

// como pegar categorias
router.get('/postagens/add', eAdmin, (req, res) => {
    Categoria.find().lean().then((categorias) => {
        res.render('admin/addpostagem', {categorias: categorias})
    }).catch((erro) => {
        req.flash('error_msg', `Houve um erro ao pegar as categorias: ${erro}`)
        res.redirect('/admin/postagens')
    })
})

router.post('/postagens/nova', eAdmin, (req,res) => {
    var erros =[];

    if(!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null){
        erros.push({texto: 'Titulo inválido, corrija.'})
    } 

    if(req.body.categoria == '0'){
        erros.push({texto: 'Não há nenhuma categoria registrada para essa postagem, crie uma primeiro!'})
    }

    if(!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao == null){
        erros.push({texto: 'Descrição inválida, corrija.'})
    }

    if(!req.body.conteudo || typeof req.body.conteudo == undefined || req.body.conteudo == null){
        erros.push({texto: 'Conteúdo inválido, corrija.'})
    }
    
    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: 'Slug inválido, corrija.'})
    } 

    if(erros.length > 0){
        res.render('admin/addpostagem', {erros: erros})    
    }else{
        const novaPostagem = {
            titulo: req.body.titulo,
            categoria: req.body.categoria,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            slug: req.body.slug
        }
        
        new Postagem(novaPostagem).save().then(() => {
            req.flash('success_msg', 'A Postagem foi registrada com sucesso!')
            res.redirect('/admin/postagens')
        }).catch((erro) => {
            req.flash('error_msg', `Desculpe, houve um erro ao registar a postagem: ${erro}`)
            res.redirect('/admin/postagens/add')
        })
    }  
})

router.get('/postagens/edit/:id', eAdmin, (req,res) => {
    Postagem.findOne({_id: req.params.id}).lean().then((postagem) => {
        Categoria.find().lean().then((categorias) => {
            res.render('admin/editpostagens', {categorias: categorias, postagem: postagem})
        }).catch((erro) => {
            req.flash('error_msg', `Houve um erro ao listar as categorias: ${erro}`)
            res.redirect('/admin/postagens')        
        })
    }).catch((erro) => {
        req.flash('error_msg', `Houve um erro ao carregar a edição: ${erro}`)
        res.redirect('/admin/postagens')
    })
})

router.post('/postagens/edit', eAdmin, (req,res) => {
    var erros =[];

    if(!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null){
        erros.push({texto: 'Titulo inválido, corrija.'})
    } 

    if(req.body.categoria == '0'){
        erros.push({texto: 'Não há nenhuma categoria registrada para essa postagem, crie uma primeiro!'})
    }

    if(!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao == null){
        erros.push({texto: 'Descrição inválida, corrija.'})
    }

    if(!req.body.conteudo || typeof req.body.conteudo == undefined || req.body.conteudo == null){
        erros.push({texto: 'Conteúdo inválido, corrija.'})
    }
    
    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: 'Slug inválido, corrija.'})
    } 

    if(erros.length > 0){
        res.render('admin/editpostagens', {erros: erros})    
    }else{
        Postagem.findOne({_id: req.body.id}).then((postagem) => {
            // pegando do formulario e lancando no banco
            postagem.titulo = req.body.titulo
            postagem.categoria = req.body.categoria
            postagem.descricao = req.body.descricao
            postagem.conteudo = req.body.conteudo
            postagem.slug = req.body.slug

            postagem.save().then(() =>{
               req.flash('success_msg', 'A postagem foi modificada com sucesso!')
               res.redirect('/admin/postagens') 
            }).catch((erro) => {
                console.log(erro)
                req.flash('error_msg' `Não foi possivel editar, erro: ${erro}`)
                res.redirect('/admin/postagens') 
            })

        }).catch((erro) => {
            req.flash('error_msg' `Houve um erro ao salvar a edição: ${erro}`)
            res.redirect('/admin/editpostagens')
        })
    }
})

router.post('/postagens/deletar/:id', eAdmin, (req, res) =>{
    Postagem.findOneAndDelete({_id: req.params.id}).then(() => {
        req.flash('success_msg', `Categoria Deletada com Sucesso!`)
        res.redirect('/admin/postagens')
    }).catch((erro) => {
        req.flash('error_msg' `Houve um erro ao deletar a Categoria: ${erro}`)
        res.redirect('/admin/postagens')
    });
});
// exportando as rotas!
module.exports = router
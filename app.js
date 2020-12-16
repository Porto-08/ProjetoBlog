// Inicio - Carregando Modulos
const express = require('express')
const handlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const app = express()
const path = require('path')
const mongoose = require('mongoose') 
const session = require('express-session')
const flash = require('connect-flash')
const bcrypt = require('bcryptjs')
const passport = require('passport')

// Require Routes
    // Admin    
        const admin = require('./routes/admin')
    // Usuarios
        const usuarios = require('./routes/usuario')
    // Autenticação
        require('./config/auth')(passport)
// Models
    //Postagens 
        require('./models/Postagem')
        const Postagem = mongoose.model('postagens')
    // Categorias
        require('./models/Categoria')
        const Categoria = mongoose.model('categorias')  
// Helpers
        //Autenticação para admin
        const {eAdmin} = require('./helpers/eAdmin') //pegando apenas a funcao "eAdmin"     
        // Autenticação Usuario
        const {eUsuario} = require('./helpers/eUsuario')

// Configurações 
    // Sessao 
        app.use(session({
            secret: 'samuel',
            resave: true,
            saveUninitialized: true
        }))
        // Passport, é essencial que seja abaixo da Seaaão
            app.use(passport.initialize())
            app.use(passport.session())
        // Flash
            app.use(flash())
    //Middleware
        // intermediador da requisição HTTP para o servidor,
        // onde posso manipular os dados antes de chegar ao destino.
        app.use((req, res, next) => {
            res.locals.success_msg = req.flash('success_msg')
            res.locals.error_msg = req.flash('error_msg')
            res.locals.error = req.flash('error')
            res.locals.user = req.user || null;
            next();
        });
    // Body-Parser
        app.use(bodyParser.urlencoded({extend:true}))
        app.use(bodyParser.json())
    // Handlebars
        app.engine('handlebars', handlebars({defaultLayout: 'main'}))
        app.set('view engine', 'handlebars')
    // Mongoose
        mongoose.Promise = global.Promise;
        mongoose.connect('mongodb://localhost/blogapp').then(() =>{
            console.log('Conectado com ao mongo, Banco "blogapp" ')
        }).catch((erro) => {
            console.log(`Houve um erro inesperado: ${erro}`)
        })
    // B-cript-Js- criptografando senhas
         
    
    // Public
        app.use(express.static(path.join(__dirname,'public')))
// Rotas
    // rota principal
        app.get('/', (req, res) => {
            Postagem.find().populate('categoria').sort({data: 'desc'}).lean().then((postagens) =>{
                res.render('index', {postagens: postagens})
            }).catch((erro) => {
                req.flash('error_msg', `Nào foi possivel listar as postagens`)
                res.redirect('/404')
            })      
        })

    
    // rota de erro
        app.get('/404', (req, res) =>{
            res.send('Erro 404.')
        })

    // Rota para Postagem
        app.get('/postagem/:slug', (req, res) => {
            Postagem.findOne({slug: req.params.slug}).lean().then((postagem) =>{
                if(postagem){
                    res.render('postagem/index', ({postagem: postagem}))
                }else{
                    req.flash('error_msg', 'Esta postagem não existe!')
                    res.redirect('/')
                }
            }).catch((erro) => {
                req.flash('error_msg', `Houve um erro interno: ${erro}`)
            })
        })


    // Rota de categorias
        app.get('/categorias', eUsuario, (req, res) => {
            Categoria.find().lean().then((categorias) => {
                res.render('categorias/index', ({categorias: categorias}))
            }).catch((erro) => {
                req.flash('error_msg', `Não foi possivel listar as categorias: ${erro}`)
                res.redirect('/')
            })
        })
    // Rota Filtro de Categorias
        app.get('/categorias/:slug', eUsuario, (req,res) => {
            Categoria.findOne({slug: req.params.slug}).then((categoria) => {
                if(categoria){
                    Postagem.find({categoria: categoria._id}).lean().then((postagens) =>{
                        res.render('categorias/postagemCat', {postagens: postagens, categoria: categoria})
                    }).catch((erro) =>{
                        req.flash('error_msg', `Houve um erro ao carregar os Posts!`)
                        res.redirect('/categorias')
                    })
                }else{
                    req.flash('error_msg', `Não foi possivel encontrar essa Categoria.`)
                    res.render('/categorias')
                }
            }).catch((erro) => {
                req.flash('error_msg', `Erro interno`)
                res.redirect('/categorias')
            })
        })
    // rotas Admim
        app.use('/admin', admin)
    // Rotas Usuarios
        app.use('/usuarios', usuarios)

// Outros
const port = 1910
app.listen(port, () => {
    console.log('Servidor Rodando na: http://localhost:1910/')
})
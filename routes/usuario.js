const express = require('express')
const { read } = require('fs')
const router = express.Router()
const mongoose = require('mongoose')
const { type } = require('os')
const bcrypt = require('bcryptjs')
const passport = require('passport')
// Model Usuario
    require('../models/Usuario')
    const Usuario = mongoose.model('usuarios')


// Rota Registro
router.get('/registro', (req, res) => {
    res.render('usuarios/registro')
})

router.post('/registro', (req,res) => {
   var erros= []
   
   // Nome validação
    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: 'Nome Inválido, corrija.'})
    }
   
   // Email validação
    if(!req.body.email || typeof req.body.email == undefined || req.body.email == null){
        erros.push({texto: 'Email Inválido, corrija.'})
    }

    // Senha validação
        // Undefined/Null
        if(!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null){
            erros.push({texto: 'Senha Inválida, corrija.'})
        }
        // tamanho senha
            if(req.body.senha.length < 8){
                erros.push({texto: 'Senha muito curta, minimo de 8 digitos.'})
            }

            if(req.body.senha.length > 16){
                erros.push({texto: 'Senha muito grande, maximo de 16 digitos.'})
            }
        // Confirmar senha
        if(req.body.senha != req.body.senha2){
            erros.push({texto: 'Senhas não correspondentes, corrija.'})
        }

    // Verificando se há erro
        if(erros.length > 0){
            res.render('usuarios/registro', {erros: erros})
        }else{
            Usuario.findOne({email: req.body.email}).then((usuario) => {
                if(usuario){
                    req.flash('error_msg', 'Ja existe esse email cadastrado em nosso sistema.')
                    res.redirect('/usuarios/registro')
                }else {
                    const novoUsuario = new Usuario({
                        nome: req.body.nome,
                        email: req.body.email,
                        senha: req.body.senha
                    });
    
                    bcrypt.genSalt(10, (erro, salt) => {
                        bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
                            if (erro) {
                                req.flash("error_msg", "Houve um erro durante o salvamento do usuário");
                                res.redirect("/");
                            } else {
                                novoUsuario.senha = hash;
                                novoUsuario.save().then(() => {
                                    req.flash("success_msg", "Usuário cadastrado com sucesso!");
                                    res.redirect("/");
                                }).catch(() => {
                                    req.flash("error_msg", "Houve um erro na criação do usuário");
                                    res.redirect("/usuarios/registro");
                                });
                            }
                        });
                    }); 
                }
            }).catch((erro) => {
                console.log(erro)
                req.flash('error_msg', 'Houve um erro interno')
                res.rendirect('/usuarios/registro')
            })
        }

})

router.get('/login', (req,res) => {
    res.render('usuarios/login')
})

router.post('/login', (req,res, next) => {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/usuarios/login',
        failureFlash: true 
    })(req, res, next)
})

router.get('/logout', (req, res) => {
    req.logOut()
    req.flash('success_msg', 'Você saiu com sucesso, nos vemos logo, ne?')
    res.redirect('/')
})

// ----- Tambem é possivel fazer o hash dessa forma, mais eficiente.
// const salt = bcrypt.genSaltSync(10);
// const hash = bcrypt.hashSync(req.body.senha, salt);

// const novoUsuario = {
//     nome : req.body.nome,
//     email : req.body.email,
//     senha : hash
//  }


//  new Usuario(UserData).save().then(() => {
//      req.flash('success_msg', 'Usuario cadastrado com sucesso!')
//      res.redirect('/')
//  }).catch((err) => {
//      req.flash('error_msg', 'Erro ao cadastrar o usuario')
//      res.redirect("/usuarios/registro")
//  })

module.exports = router
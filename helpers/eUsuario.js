module.exports = {
    eUsuario: function(req, res, next){
        if(req.isAuthenticated()){
            return next()
        }

        req.flash('error_msg', 'Esses previlegios so quem tem a conta pode ter! Crie a sua.')
        res.redirect('/usuarios/registro')
    }
}
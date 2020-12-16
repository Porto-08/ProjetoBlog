
// Funcao apara que apenas usuarios autenticados 
// possam acessar certa pagina.
module.exports = {
    eAdmin: function(req, res, next){
        if(req.isAuthenticated() && req.user.eAdmin == 1){
            return next()
        }

        req.flash('error_msg', 'É necessario uma permisão de Admin para acessar.')
        res.redirect('/')
    }
}
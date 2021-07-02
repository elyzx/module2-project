// require express
const router = require("express").Router();

// require user model
const UserModel = require('../models/User.model')

// require bcrypt for password encryption
const bcrypt = require('bcryptjs');

//---------------
//  LOGN-IN
//---------------

// Handle GET request to /login page
router.get('/login', (req, res, next) => {
    res.render('auth/login.hbs')
})

router.post('/login', (req, res, next) => {
    const {email, password} = req.body

    UserModel.findOne({email})
        .then((user) => {
            if (user) {
                let isValid = bcrypt.compareSync(password, user.password)
                if (isValid) {
                    req.session.loggedInUser = user
                    req.app.locals.isLoggedIn = true;
                    res.redirect('/listings')
                }
                else {
                    res.render('auth/signin', {error: 'Invalid password'})
                } 
            } else {
                res.render('auth/signin', {error: 'Email does not exist'})
            }
        })
        .catch((error) => {
            next(error)
        })
})

//---------------
//  SIGN-UP
//---------------

// Handle GET request to /signup page
router.get('/signup', (req, res, next) => {
    res.render('auth/signup.hbs')
})

router.post('/signup', (req, res, next) => {
    const {name, email, password, neighbourhood} = req.body
    
    // check all fields are complete
    // if (!name || !email || !password || !neighbourhood) {
        // res.render('auth/signup.hbs', {error: 'Please enter all fields'})
        // return;
    // }

    // Check email format
    // const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    // if (!re.test(email)) {
        // res.render('auth/signup.hbs', {error: 'Email address not valid. Please check and try again.'})
        // return;
    // }

    // check the password strength
    // const passRegEx = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/;
    // if (!passRegEx.test(password)) {
        // res.render('auth/signup.hbs', {error: 'Password not strong enough. Make sure your password is 6-16 characters long and includes both a special character and a number.'})
        // return;
    // }

    // Password encyrption time! 
    // Generate salt
        const salt = bcrypt.genSaltSync(10);
        // Uses the salt and the password to create a hashed password
        const hash = bcrypt.hashSync(password, salt);

        UserModel.create({name, email, neighbourhood, password: hash})
            .then(() => {
                res.redirect('/')
            })
            .catch((err) => {
                next(err)
            })
})

//---------------
//  SIGNOUT
//---------------
//----------  MIDDLEWARE FOR PERMISSIONS ---------------
function checkLoggedIn(req, res, next) {
    if (req.session.loggedInUser) {
        next()
    }
    else {
        res.redirect('/login')
    }
}

//----------  PAGES THAT REQUIRE AN ACCOUNT TO BE VISITED ---------------
//FIRST PAGE TO BE RENDERED AFTER LOG-IN
router.get('/listings', checkLoggedIn, (req,res) => {
    if (req.session.loggedInClient){
       res.render('listings/viewListing.hbs', {name: req.session.loggedInUser.name} )
    }
    else{
        res.redirect('/login')
    }
})

// OTHER PAGES
router.get('/manage', checkLoggedIn, (req,res) => {
   res.render('listings/manageListings.hbs')
})

router.get('/edit', checkLoggedIn, (req,res) => {
    res.render('listings/editListing.hbs')
 })

 router.get('/create', checkLoggedIn, (req,res) => {
    res.render('listings/createListing.hbs')
 })

 router.get('/account', checkLoggedIn, (req,res) => {
    res.render('account.hbs')
 })

//----------  DESTROY THE SESSION ---------------
router.get('/logout', (req, res, next) => {
   req.session.destroy()

   // set global
   req.app.locals.isLoggedIn = false;
   res.redirect('/')
})

module.exports = router;
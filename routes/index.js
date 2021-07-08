const router = require("express").Router();
const ListingModel = require("../models/Listing.model");
const UserModel = require("../models/User.model");


//----------  MIDDLEWARE FOR PERMISSIONS ---------------
function checkLoggedIn(req, res, next) {
  if (req.session.loggedInUser) {
      console.log(`User '${req.session.loggedInUser._id}' is logged in`)
      req.app.locals.isLoggedIn = true;
      next()
  }
  else {
      req.app.locals.isLoggedIn = false;
      res.redirect('/register')
  }
}

//----------  PAGES THAT REQUIRE AN ACCOUNT TO BE VISITED ---------------
//FIRST PAGE TO BE RENDERED AFTER LOG-IN

router.get("/", checkLoggedIn,  (req, res, next) => {

  //const userAdressId = req.session.loggedInUser
 
  ListingModel.find()
    .populate('neighbourhood')
    .populate('user')
    .then((listings) => {
      UserModel.findById(req.session.loggedInUser._id)
        .populate('neighbourhood')
        .then((user) => {
      const listingsMap = listings.map(x => x) 
      
      let matchId = [];

      for( let i = 0; i < listingsMap.length; i++ ) {
        if(listingsMap[i].neighbourhood._id.toString() == user.neighbourhood._id.toString()){
          matchId.push(listingsMap[i])
        }
      }


        res.render("index", {
          matches: matchId,
          neighbourhood_name: user.neighbourhood.name,
        })

        })
        .catch((err) => {
          next(err)
        })
    })
    .catch(() => {
      next('No available listings. Check back later!')
    })
});





// router.post("/?", checkLoggedIn,  (req, res, next) => {
//   let search = req.query

  
//   ListingModel.find()
//   .then((listings) => {
//     console.log('this is a :', search)

//     const filteredListing = listings.filter(listing => {
//       let isValid = true;

//       for (key in search) {
//         isValid = isValid && listing[key] == filters[key];
//       }

//     });

//   })
//   .catch(() => {

//   })

// });

module.exports = router;

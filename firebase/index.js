var admin = require("firebase-admin");

var serviceAccount = require("../config/fbServiceAccountKey.json");
//var serviceAccount = process.env.FB_KEY;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://ecommerce-2f56f.firebaseio.com",
});

module.exports = admin;

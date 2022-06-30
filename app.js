const express = require('express');
const mysql = require('mysql2');
const app = express();

//TODO Besoin d'un timeout pour que le server soit lancé avant la tentative de connexion à la BDD. Problème à régler !
setTimeout(() => {

const connection = mysql.createConnection({
    host: 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'groupomania'
});

/* connection.query(
    "SELECT * FROM user", function(err, results, fields) {
        console.log("results");
        console.log(results);
    }
); */

}, 1000); //TODO Fin du timeout à supprimer

module.exports = app;
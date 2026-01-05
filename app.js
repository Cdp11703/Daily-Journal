const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const path = require('path');

const connect = require('./models/db.js');
const router = require('./routes/routes.js');

async function main() {
    const app = express();

    app.use('/static', express.static('public'));

    app.engine("hbs", exphbs.engine({
        extname: "hbs",
        layoutsDir: path.join(__dirname, 'views/layouts'), // Specify a directory for layouts (create 'layouts' folder)
        defaultLayout: false, // Disable the default layout
    }));

    // Set the views directory using an absolute path based on the current script
    app.set("views", path.join(__dirname, 'views'));
    app.set("view engine", "hbs");

    app.use(bodyParser.urlencoded({ extended: true }));

    app.use(express.json());
    app.use(router);

    app.listen(process.env.SERVER_PORT, async function() {
        console.log(`express app is now listening on port ${process.env.SERVER_PORT}`);
        try {
            await connect();
            console.log(`Now connected to MongoDB`);
        } catch (err) {
            console.log('Connection to MongoDB failed: ');
            console.error(err);
        }
    });
}

main();

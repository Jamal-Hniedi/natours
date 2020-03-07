require('dotenv').config({path: './config.env'});
const mongoose = require('mongoose');
const app = require('./app');


mongoose.connect(process.env.DATABASE, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
})
    .then(() => {
        console.log("DB connected successfully!");
    });

const server = app.listen(process.env.PORT);

process.on('unhandledRejection', reason => {
    console.error(reason);
    server.close(() => {
        process.exit(1);
    });
});
process.on('uncaughtException', reason => {
    console.error(reason.name, reason.message);
    server.close(() => {
        process.exit(1);
    });
});

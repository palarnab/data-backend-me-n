const fs = require('fs');
const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');

// load environment vars
dotenv.config({ path: './config/config.env' });

// load models
const Bootcamp = require('./models/bootcamp');
const Courses = require('./models/course');
const Users = require('./models/user');

// connect to db
mongoose.connect(process.env.MONGO_URI, {});

// read JSON files
const bootcamps = JSON.parse(
    fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8')
);

const courses = JSON.parse(
    fs.readFileSync(`${__dirname}/_data/courses.json`, 'utf-8')
);

const users = JSON.parse(
    fs.readFileSync(`${__dirname}/_data/users.json`, 'utf-8')
);

// import into db
const importData = async () => {
    try {
        await Bootcamp.create(bootcamps);
        await Courses.create(courses);
        await Users.create(users);
        console.log('Data imported...'.green.inverse);
        process.exit();
    } catch(err) {
        console.error(err);
    }
}

// delete data
const deleteData = async () => {
    try {
        await Bootcamp.deleteMany();
        await Courses.deleteMany();
        await Users.deleteMany();
        console.log('Data destroyed...'.red.inverse);
        process.exit();
    } catch(err) {
        console.error(err);
    }
}

if (process.argv[2] === '-i') {
    importData();
} else if (process.argv[2] === '-d') {
    deleteData();
}
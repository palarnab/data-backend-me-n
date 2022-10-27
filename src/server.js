const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const cookieParser = require('cookie-parser');
const path = require('path');
const fileupload = require('express-fileupload');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');
const cors = require('cors');
const swaggerUI = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

// load config
dotenv.config({ path: './config/config.env' });

// connect to db
connectDB();

// Route files
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');
const auth = require('./routes/auth');

const app = express();
  
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));

app.use(cors({
    origin: process.env.KNOWN_ORIGINS,
    optionsSuccessStatus: 200 // For legacy browser support
}));

// file upload
app.use(fileupload());
app.use(express.static(path.join(__dirname, 'public')));

// data parser middleware
app.use(express.json());

// cookie parser for accessing cookie
app.use(cookieParser());

// dev loggin middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.use('/api/v1/auth', auth);
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use(errorHandler);

const port = process.env.PORT || 5000;
const server = app.listen(port, console.log(`app running in ${process.env.NODE_ENV} on port ${port}`));

// handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Unhandled Rejection ${err.message}`);
    server.close(() => {
        process.exit(1);
    });
});
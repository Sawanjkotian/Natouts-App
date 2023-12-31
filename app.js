
const morgan = require('morgan');
const express = require('express');

const AppError = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
};

app.use(express.json());

app.use(express.static(`${__dirname}/public`));



app.use((req, res, next)=>{
    req.requestTime = new Date().toISOString();
    next();
})


// app.get('/api/v1/tours',getAllTours);
// app.get('/api/v1/tours/:id',getTour);
// app.post('/api/v1/tours', createTour);
// app.patch('/api/v1/tours/:id',updateTour)

// app.delete('/api/v1/tours/:id',deleteTour);

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next)=>{
    
    // res.status(404).json({
    //     status: 'fail',
    //     message: `Can't find ${req.originalUrl}`
    // });

    const err = new Error(`Can't find ${req.originalUrl} on this server`);
    err.status = 'fail';
    err.statusCode = 404;

    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);


//Start server
module.exports = app;
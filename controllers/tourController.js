
const { query } = require('express');
const Tour =  require('./../models/tourModel')

const catchAsync = require('./../utils/catchAsync');

// const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

exports.aliasTopTours = (req, res, next) =>{
    req.query.limit=5;
    req.query.sort='-ratingAverage,price';
    req.query.fields='name,price,ratingAverage,summary,difficulty';
    next();
};

class APIFeatures{
    constructor(query, queryString){
        this.query = query;
        this.queryString = queryString;
    }

    filter(){
        const queryObj = {...this.queryString};
        const excludedFields = ['page', 'sort', 'limit', 'fields'];

        excludedFields.forEach(el=> delete queryObj[el]);
        //Ways of writing query string
        ///console.log(req.query, queryObj);

        //2) Advance filtering

        let queryStr = JSON.stringify(queryObj);
        queryStr =  queryStr.replace(/(gte|gt|lte|lt)\b/g, match=>`$${match}`);
        this.query.find(JSON.parse(queryStr));

        return this;
    }

    sort(){
        if(this.queryString.sort)
        {
            const sortBy = this.queryString.sort.split(',').join(' ');
            // console.log(sortBy);
            this.query = this.query.sort(sortBy);
            //sort('price rating average)
        }
        else{
            this.query = this.query.sort('-createdAt');
        }
        return this;
    }

    limitFields(){
        if(this.queryString.fields){
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        }else{
            this.query = this.query.select('-__v')
        }
        return this;
    }
    pagination(){
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 100;
        const skip = (page - 1) * limit;

        //page=2&limit=10, 1-10
        this.query = this.query.skip(skip).limit(limit);
        return this;
    }
};

exports.getAllTours = catchAsync(async (req, res, next) =>{
        //Build the query 
        //1) Filtering
        // const queryObj = {...req.query};
        // const excludedFields = ['page', 'sort', 'limit', 'fields'];

        // excludedFields.forEach(el=> delete queryObj[el]);
        // //Ways of writing query string
        // console.log(req.query, queryObj);

        // //2) Advance filtering

        // let queryStr = JSON.stringify(queryObj);
        // queryStr =  queryStr.replace(/(gte|gt|lte|lt)\b/g, match=>`$${match}`);

        //console.log(JSON.parse(queryStr));
        
        // const tours = await Tour.find().where('duration').equals(5).where('difficulty').equals('easy');
        
        //{ difficulty: 'easy', duration: { $gte: 5} } Required filter
        //{ difficulty: 'easy', duration: { $gte: 5} } Query string
        //Query execution
        //let query = Tour.find(JSON.parse(queryStr));

        //Sorting Feature

        // if(req.query.sort)
        // {
        //     const sortBy = req.query.sort.split(',').join(' ');
        //     // console.log(sortBy);
        //     query = query.sort(sortBy);
        //     //sort('price rating average)
        // }
        // else{
        //     query = query.sort('-createdAt');
        // }

        // if(req.query.fields){
        //     const fields = req.query.fields.split(',').join(' ');
        //     query = query.select(fields);
        // }else{
        //     query = query.select('-__v')
        // }

        //4) Pagination
        // const page = req.query.page * 1 || 1;
        // const limit = req.query.limit * 1 || 100;
        // const skip = (page - 1) * limit;

        // //page=2&limit=10, 1-10
        // query = query.skip(skip).limit(limit);

        // if(req.query.page)
        // {
        //     const numTours = await Tour.countDocuments();
        //     if(skip >= numTours) throw new Error('This Page does not exist');
        // }

        const feature = new APIFeatures(Tour.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .pagination()
        
        const tours = await feature.query;

        //Send Response
        res.status(200).json({
            status:'success',
            results : tours.length,
            data:{
                tours
        }
    });
});

exports.getTour = catchAsync(async (req, res, next) =>{

    const tour = await Tour.findById(req.params.id);

    res.status(200).json({
        status:'success',
        data:{
            tour
        }
    });
});
    
    // const id = req.params.id*1;
    // const tour = tours.find(el => el.id === id);
    // res.status(200).json({
    //     status:"success",
    //     data:{
    //         tours
    //     }
    // });



exports.createTour = catchAsync(async (req, res, next) =>{

    const newTour = await Tour.create(req.body)

        res.status(201).json({
            status:'success',
            data:{
                tour: newTour
            }
    });
});
    // try{
        
    // }catch(err){
    //     res.status(400).json({
    //         status:'fail',
    //         message:'Invalid data sent!'
    //     })
    // }
    

exports.updateTour = catchAsync(async (req, res, next) =>{


       const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators:true
        })
        res.status(200).json({
            data:{
                tour
            }
        });
});

exports.deleteTour =  catchAsync(async (req, res, next) =>{

        const tour = await Tour.findByIdAndDelete(req.params.id)

        res.status(204).json({
            data:{
                status:"success",
                data:null
            }
        });
});

exports.getTourStats = catchAsync(async (req, res, next) =>{
        const stats = await Tour.aggregate([
            {
                $match:{ ratingsAverage:{ $gte: 4.5 } }
            },
            {
                $group: {
                    _id: { $toUpper: '$difficulty'},
                    numTours: { $sum: 1 },
                    numRatings: {$sum: '$ratingsQuantity'},
                    avgRating: { $avg: '$ratingsAverage'},
                    avgPrice: { $avg: '$price' },
                    minPrice: { $min: '$price'},
                    maxPrice: { $max: '$price'}
                }
            },
            {
                $sort:{ avgPrice: 1 }
            },
            // {
            //     $match:{ _id: { $ne: 'EASY'} }
            // }
        ]);

        res.status(200).json({
            
                status:"success",
                data:{
                    stats
                }
        });
});

//Agregate Pipeline Reallife example
exports.getMonthlyPlan = catchAsync(async (req, res, next) =>{
        
        const year = req.params.year * 1;

        const plan = await Tour.aggregate([
            {
                $unwind: '$startDates'
            },
            {
                $match: {
                    startDates:{
                        $gte: new Date(`${year}-01-01`),
                        $lte: new Date(`${year}-12-31`),
                    }
                }
            },
            {
                $group:{
                    _id: {$month: '$startDates'},
                    numTourStarts: { $sum: 1 },
                    tours: {
                        $push: '$name'
                    }
                }
            },
            {
                $addFields: { month: '$_id' }
            },
            {
                $project:{
                    _id: 0
                }
            },
            {
                $sort:{
                    numTourStarts: -1
                }
            },
            {
                $limit:12
            }
        ]);


        res.status(200).json({
                status:"success",
                data:{
                    plan
                }
        });
});
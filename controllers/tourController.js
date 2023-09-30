

const Tour =  require('./../models/tourModel')

// const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );



exports.getAllTours = (req, res) =>{
    res.status(200).json({
        status:'success',
        requestedAt : req.requestTime
    });
};

exports.getTour =  (req, res) =>{
    console.log(req.params);
    
    const id = req.params.id*1;
    // const tour = tours.find(el => el.id === id);
    // res.status(200).json({
    //     status:"success",
    //     data:{
    //         tours
    //     }
    // });
};

exports.createTour = async (req, res) =>{

    try{
        const newTour = await Tour.create(req.body)

        res.status(201).json({
            status:'success',
            data:{
                tour: newTour
            }
    });
    }catch(err){
        res.status(400).json({
            status:'fail',
            message:'Invalid data sent!'
        })
    }
    
};

exports.updateTour = (req, res) =>{

    res.status(200).json({
        data:{
            tour:"Udated tour"
        }
    });
}

exports.deleteTour =  (req, res) =>{

    res.status(204).json({
        data:{
            status:"success",
            data:null
        }
    });
}

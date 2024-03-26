const Booking  = require('../Models/Bookings');

exports.addBooking=(req,res) =>{
    const {
        name,
        phone_no,
        check_in_date,
        check_out_date,
        no_of_rooms,
        type_of_room,
        booking_date,
        amount
       
    } = req.body;
    const Room_price = {
        "Super Delux (Double Bed AC Room)" : 2100,
        "Executive (Triple Bed AC Room)" : 2800,
        "Super Executive (Four Bed AC Room)" :3300,
       
   }

    const bookingObj = new Booking({
        name: name,
        phone_no : phone_no,
        check_in_date : check_in_date,
        check_out_date : check_out_date,
        no_of_rooms : no_of_rooms,
        type_of_room : type_of_room,
        booking_date: booking_date,
        amount : amount,
        payment_status : "unpaid"
    });
    bookingObj.save().then(result => {
        res.status(200).json({
            message: "Booking done successfully !",
            user: result
        });
    }).catch(error => {
        res.status(500).json({
            message: "Error in Database",
            error: error
        });
    });

}


exports.deleteBooking = (req, res) => {
    const bookingId = req.params.id;
  
    Booking.findByIdAndRemove(bookingId)
      .then((deletedBooking) => {
        if (!deletedBooking) {
          return res.status(404).json({
            message: 'Booking not found with the given id.',
          });
        }
  
        res.status(200).json({
          message: 'Booking deleted successfully.',
          deletedBooking: deletedBooking,
        });
      })
      .catch((error) => {
        res.status(500).json({
          message: 'Error deleting booking from the database.',
          error: error,
        });
      });
  };
  
exports.getBookings = (req , res) =>{

    Booking.find().sort({ booking_date: -1 }).then(result=>{
    
        res.status(200).json({
            message: "Data  fetched!",
            
            data:result
        });
    }).catch(error => {
        res.status(500).json({
            message: "Error in Database",
            error: error
        });
    })
}

exports.getConfirmBookings = (req , res) =>{
    const page = req.params.page;
    const query ={
        
        payment_status: "paid"
    }
    Booking.find(query).sort({ booking_date: -1 }).then(result=>{
    
        function getBatchElements(array, batchSize, k) {
            const start = (k - 1) * batchSize;
            const end = start + batchSize;
            return array.slice(start, end);
          }

        const batchSize = 10;
        const Elements = getBatchElements(result, batchSize, page);
        res.status(200).json({
            message: "Data  fetched!",
            data:Elements
        });
    }).catch(error => {
        res.status(500).json({
            message: "Error in Database",
            error: error
        });
    })
}

exports.getBookingsByPage = (req , res) =>{
    const page = req.params.page;
    const query ={
        
        payment_status: "unpaid"
    }
    Booking.find(query).sort({ booking_date: -1 }).then(result=>{
    
        function getBatchElements(array, batchSize, k) {
            const start = (k - 1) * batchSize;
            const end = start + batchSize;
            return array.slice(start, end);
          }

        const batchSize = 10;
        const Elements = getBatchElements(result, batchSize, page);
        res.status(200).json({
            message: "Data  fetched!",
            data:Elements
        });
    }).catch(error => {
        res.status(500).json({
            message: "Error in Database",
            error: error
        });
    })
}
exports.updatePaymentStatus = (req , res)=>{
    const id = req.params.id;
    Booking.find({
        _id: id
    }).then(result=>{
       Booking.findByIdAndUpdate({ _id: id }, req.body)
       .then((data) => {
         res.send("updated Successfully");
       })
       .catch((err) => {
         res.send("err in updation");
       });
    })
    
}

exports.paymentFetch = (req , res) =>{
    const phoneNo=req.params.phone_no;

    const query ={
        phone_no : phoneNo,
        payment_status: "unpaid"
    }

    Booking.find(query).sort({ booking_date: -1 }).then(result=>{
    
        res.status(200).json({
            message: "Amount fetched to be paid !",
            amount: result.amount,
            data:result
        });
    }).catch(error => {
        res.status(500).json({
            message: "Error in Database",
            error: error
        });
    })
}

exports.checkAvailability =(req , res)=>{
    const {
       
        check_in_date,
        check_out_date,
        no_of_rooms,
        type_of_room,
    } = req.body;

    const TypeOfRoom = type_of_room
    const checkIn = check_in_date
    const checkOut =   check_out_date
    const Available_rooms = {
        
            "Super Delux (Double Bed AC Room)" : 14,
            "Executive (Triple Bed AC Room)" : 6,
            "Super Executive (Four Bed AC Room)" :5,
           
       
    }
    const query = {
        type_of_room: TypeOfRoom,
        $or: [
          { 
            $and: [
              { check_in_date: { $eq: checkIn } },
              { check_out_date: { $eq: checkOut } }
            ]
          },
          {
            $and: [
              { check_in_date: { $gte: checkIn } },
              { check_out_date: { $lte: checkOut } }
            ]
          }
        ]
      }
    Booking.find(query).then(result => {
        console.log(result);
        const booked_rooms = result.length;
        console.log(Available_rooms.TypeOfRoom )
        if (booked_rooms + no_of_rooms <= Available_rooms[TypeOfRoom] ){
              res.status(200).json({
                message: "Available",
                available: true
            });
        }else{
            res.status(200).json({
                message: "Unavailable",
                available: false
            });
        }
    })
    

}
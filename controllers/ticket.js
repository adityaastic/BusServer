import Bus from "../models/bus.js";
import User from "../models/user.js";
import Ticket from "../models/ticket.js";
import { v4 as uuidv4 } from "uuid";

// // 🔹 Get User Tickets
// export const getUserTickets = async (req, res) => {
//   try {
//     const userId = req.userId;

//     const tickets = await Ticket.find({ user: userId })
//       .populate(
//         "bus",
//         "busId from to busType company departureTime arrivalTime price"
//       )
//       .sort({ bookedAt: -1 });

//     if (!tickets || tickets.length === 0) {
//       return res.status(404).json({ message: "No tickets found." });
//     }

//     res.status(200).json({ success: true, tickets });
//   } catch (error) {
//     console.error("Error fetching tickets:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };

export const getUserTickets = async (req, res) => {
  try {
    const userId = req.userId;

    const tickets = await Ticket.find({ user: userId })
      .populate(
        "bus",
        "busId from to busType company departureTime arrivalTime price"
      )
      .sort({ bookedAt: -1 });

    // ✅ Always return 200 with empty array
    return res.status(200).json({
      success: true,
      tickets: tickets || [],
    });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// 🔹 Book Ticket
// export const bookTicket = async (req, res) => {
//   try {
//     const { busId, date, seatNumbers } = req.body;
//     const userId = req.userId;

//     if (!busId || !date || !seatNumbers || seatNumbers?.length === 0) {
//       return res.status(400).json({ error: "All fields are required." });
//     }

//     const bus = await Bus.findOne({ busId });
//     if (!bus) {
//       return res.status(404).json({ error: "Bus not found." });
//     }

//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ error: "User not found." });
//     }

//     // Check seat availability
//     const unavailableSeats = seatNumbers.filter((seatNum) =>
//       bus.seats?.some((row) =>
//         row?.some((seat) => seat.seat_id === seatNum && seat.booked)
//       )
//     );

//     if (unavailableSeats?.length > 0) {
//       return res.status(400).json({
//         error: "Some seats are already booked.",
//         unavailableSeats,
//       });
//     }

//     // Calculate fare
//     const totalFare = bus.price * seatNumbers?.length;

//     // Create ticket
//     const newTicket = new Ticket({
//       user: userId,
//       bus: bus._id,
//       date,
//       seatNumbers,
//       total_fare: totalFare,
//       pnr: uuidv4().slice(0, 10).toUpperCase(),
//     });

//     await newTicket.save();

//     // Mark seats as booked
//     bus.seats.forEach((row) => {
//       row?.forEach((seat) => {
//         if (seatNumbers.includes(seat.seat_id)) {
//           seat.booked = true;
//         }
//       });
//     });

//     await bus.save();

//     res.status(201).json({
//       success: true,
//       message: "Ticket booked successfully.",
//       ticket: newTicket,
//     });
//   } catch (error) {
//     console.error("Error booking ticket:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };
// controllers/ticket.js - COMPLETE FIXED VERSION


export const bookTicket = async (req, res) => {
  try {
    const { busId, date, seatNumbers } = req.body;
    const userId = req.userId;

    // Validation
    if (!busId || !date || !seatNumbers || seatNumbers.length === 0) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // Find bus and user
    const bus = await Bus.findOne({ busId });
    if (!bus) {
      return res.status(404).json({ error: "Bus not found." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // ✅ FIXED: Check seat availability for FLAT array
    const unavailableSeats = [];
    for (const seatNum of seatNumbers) {
      const seat = bus.seats.find(s => s.seat_id === seatNum);
      
      if (!seat) {
        return res.status(400).json({
          error: `Seat ${seatNum} does not exist on this bus.`,
        });
      }
      
      if (seat.booked) {
        unavailableSeats.push(seatNum);
      }
    }

    if (unavailableSeats.length > 0) {
      return res.status(400).json({
        error: "Some seats are already booked.",
        unavailableSeats,
      });
    }

    // Calculate fare
    const totalFare = bus.price * seatNumbers.length;

    // Create ticket
    const newTicket = new Ticket({
      user: userId,
      bus: bus._id,
      date,
      seatNumbers, // This should be array of numbers like [1, 2, 3]
      total_fare: totalFare,
      pnr: uuidv4().slice(0, 10).toUpperCase(),
    });

    await newTicket.save();

    // ✅ FIXED: Mark seats as booked in FLAT array
    for (const seatNum of seatNumbers) {
      const seatIndex = bus.seats.findIndex(s => s.seat_id === seatNum);
      if (seatIndex !== -1) {
        bus.seats[seatIndex].booked = true;
        bus.seats[seatIndex].bookedAt = new Date();
      }
    }

    // Save the updated bus with booked seats
    await bus.save();

    // Populate bus details for response
    const populatedTicket = await Ticket.findById(newTicket._id)
      .populate('bus', 'busId from to busType company departureTime arrivalTime price');

    res.status(201).json({
      success: true,
      message: "Ticket booked successfully!",
      ticket: populatedTicket,
    });

  } catch (error) {
    console.error("Error booking ticket:", error);
    res.status(500).json({ 
      error: "Internal Server Error",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
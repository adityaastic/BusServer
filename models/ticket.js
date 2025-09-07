// import mongoose, { Schema } from "mongoose";

// const TicketSchema = new Schema({
//     user: { type: Schema.Types.ObjectId, ref: "User", required: true },
//     bus: { type: Schema.Types.ObjectId, ref: "Bus", required: true },
//     date: { type: Date, required: true },
//     seatNumbers: [{ type: Number, required: true }],
//     total_fare: { type: Number, required: true },
//     status: {
//         type: String,
//         enum: ["Upcoming", "Completed", "Cancelled"],
//         default: "Upcoming"
//     },
//     bookedAt: { type: Date, default: Date.now },
//     pnr: { type: String, unique: true, required: true }
// });

// const Ticket = mongoose.model("Ticket", TicketSchema);
// export default Ticket;



// models/Ticket.js - FIXED VERSION
import mongoose, { Schema } from "mongoose";

const TicketSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    bus: { type: Schema.Types.ObjectId, ref: "Bus", required: true },
    date: { type: Date, required: true },
    // ✅ FIXED: Store seat numbers (just the IDs)
    seatNumbers: [{ type: Number, required: true }],
    total_fare: { type: Number, required: true },
    status: {
        type: String,
        enum: ["Upcoming", "Completed", "Cancelled"],
        default: "Upcoming"
    },
    bookedAt: { type: Date, default: Date.now },
    pnr: { type: String, unique: true, required: true }
});

const Ticket = mongoose.model("Ticket", TicketSchema);
export default Ticket;
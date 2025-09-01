import dotenv from "dotenv";
import mongoose from "mongoose";
import { buses, generateSeats, locations } from "./seedData.js";
import Bus from "./models/bus.js";

dotenv.config(); // loads .env file

// Generate random departure/arrival time
const generateRandomTime = (baseDate) => {
  const hour = Math.floor(Math.random() * 12) + 6; // Between 6 AM - 6 PM
  const minute = Math.random() > 0.5 ? 30 : 0;

  const dateTime = new Date(baseDate);
  dateTime.setHours(hour, minute, 0, 0);

  return dateTime;
};

async function seedDatabase() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("❌ MONGO_URI is not defined in .env file");
    }

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");

    // Delete old buses
    await Bus.deleteMany();
    console.log("🗑️ Old Bus Data Deleted");

    const busesToInsert = [];
    const baseDate = new Date();

    for (let i = 0; i < locations.length; i++) {
      for (let j = i + 1; j < locations.length; j++) {
        const from = locations[i];
        const to = locations[j];

        for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
          const travelDate = new Date(baseDate);
          travelDate.setDate(travelDate.getDate() + dayOffset);

          const returnDate = new Date(travelDate);
          returnDate.setDate(returnDate.getDate() + 1);

          buses.forEach((bus) => {
            const departureTime = generateRandomTime(travelDate);
            const arrivalTime = generateRandomTime(travelDate);

            // Forward trip
            busesToInsert.push({
              busId: `${bus.busId}_${from}_${to}_${dayOffset}`,
              from,
              to,
              departureTime,
              arrivalTime,
              duration: "9h 30m",
              availableSeats: 28,
              price: bus.price,
              originalPrice: bus.originalPrice,
              company: bus.company,
              busType: bus.busType,
              rating: bus.rating,
              totalReviews: bus.totalReviews,
              badges: bus.badges,
              seats: generateSeats(),
            });

            // Return trip
            busesToInsert.push({
              busId: `${bus.busId}_${to}_${from}_${dayOffset + 1}`,
              from: to,
              to: from,
              departureTime: generateRandomTime(returnDate),
              arrivalTime: generateRandomTime(returnDate),
              duration: "9h 30m",
              availableSeats: 28,
              price: bus.price,
              originalPrice: bus.originalPrice,
              company: bus.company,
              busType: bus.busType,
              rating: bus.rating,
              totalReviews: bus.totalReviews,
              badges: bus.badges,
              seats: generateSeats(),
            });
          });
        }
      }
    }

    await Bus.insertMany(busesToInsert);
    console.log("✅ Database Seeded Successfully");
  } catch (error) {
    console.error("❌ Error seeding database:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

seedDatabase();

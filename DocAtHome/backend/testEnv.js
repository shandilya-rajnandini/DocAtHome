const dotenv = require('dotenv');
dotenv.config(); // This loads the .env file

console.log("--- Reading from .env file ---");
console.log("PORT:", process.env.PORT);
console.log("MONGO_URI:", process.env.MONGO_URI);
console.log("JWT_SECRET:", process.env.JWT_SECRET);
console.log("------------------------------");
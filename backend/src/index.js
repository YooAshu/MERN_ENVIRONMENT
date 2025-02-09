import dotenv from "dotenv";
dotenv.config({ path: "./.env" }); // ✅ Load environment variables
import express from "express"
import connectDB from "./db/index.js";

const app = express()
const port = process.env.PORT || 3000; // Use environment variable or fallback to 3000


connectDB()
    .then(() => {
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    })
    .catch((error)=>{
        console.log("connection failed to database",error);
        
    })



app.get('/api/hello', (req, res) => {
    res.send('Hello World')
})
// imported doteenv to use .env files
import dotenv from "dotenv";
dotenv.config({ path: "./.env" }); // ✅ Load environment variables

// we will declare all middlewares and routes in app.js i.e all thing related to express()
import {app} from './app.js'

// importing function for database connection
import connectDB from "./db/index.js";

// Use environment variable or fallback to 3000
const port = process.env.PORT || 3000; 


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
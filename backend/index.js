require('dotenv').config({path : './.env'});
import express from "express"

const app = express()
const port = process.env.PORT || 3000; // Use environment variable or fallback to 3000

app.get('/api/hello',(req,res)=>{
    res.send('Hello World')
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
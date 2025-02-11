import express from "express"
import cors from 'cors'
import cookieParser from "cookie-parser"

const app = express()

// in .env CORS_ORIGIN = * means any domain can get response from bakend
// credentials : true , Allows credentials (cookies, authorization headers) to be sent in cross-origin requests
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

// Parses JSON data from incoming requests
app.use(express.json())

// Parses form data (application/x-www-form-urlencoded format).
// Example: If a client sends:
// name=John&age=25 it will convert it to json
app.use(express.urlencoded({ extended: true}))

// This serves static files (like images, CSS, JavaScript, fonts) from the "public" directory.
app.use(express.static("public"))

// This middleware parses cookies from incoming requests and makes them accessible via req.cookies.
app.use(cookieParser())


// import routes
import userRouter from "./routes/user.routes.js"



// routes declaration
app.use('/api/v1/users',userRouter)


export { app }
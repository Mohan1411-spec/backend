import express, { urlencoded } from "express"
import cookieparser from "cookie-parser"
import cors from "cors"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    Credential:true
}))

app.use(express.json({limit:"16kb"}))
app.use(urlencoded({extended:true, limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieparser())

import userRouter from "./routes/user.route.js"

app.use( "/api/v1/users", userRouter )

export { app }
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './config/db.js'
import itemRoutes from './routes/itemRoutes.js'

const app = express()
const hostname = 'http://localhost'
const PORT = process.env.PORT || 5000

app.get('/', function(req, res)  {
    res.send('<h1>Hello World</h1>')
})

app.listen(PORT, hostname, () => {
    console.log(`Server running at http://${hostname}:${PORT}/`)
})

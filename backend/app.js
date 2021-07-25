const express = require("express");
const app = express();
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');
const Auth = require('./routes/auth');
const bodyParser = require('body-parser');
const { IsAuthorised } = require("./controller/Helper/auth");

//DB CONNECTION
mongoose.connect(process.env.DATABASE, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
.then(()=>{
  console.log('BD CONNECTED');
})
.catch((err)=> console.log(`DATABASE ERROR =>>>>>> ${err}`))

app.use(cors())
app.use(express.json())
// app.use(bodyParser.json())

//Base Routes
app.get('/', (req, res) => {
    res.send('Hello')
})

app.use('/api', Auth);

app.get('/api/private', IsAuthorised, (req, res) => {
    res.send('this is a private route')
})

//Server litning
const PORT = process.env.PORT || 8000
app.listen(PORT, () => {
  console.log(`app listening at http://localhost:${PORT}`)
})
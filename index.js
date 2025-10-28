require('dotenv').config()
const express = require('express')
const Person = require('./models/person')
var morgan = require('morgan')

const app = express()

app.use(express.json())

app.use(express.static('dist'))

// Tehty 3.9-3.11 
// Frontendistä tuotantoversio (dist) ja commit gittiin kutsulla "npm run deploy:full"
// Render pyörii phonebook_render
// Tehty 3.12.-3.14
// Tietokanta personApp Mongodbssä, person.js lisätty, skeemat
// backend hakee näytettävät puhelintiedot tietokannasta, uudet numerot tallennetaan tietokantaan
// sovellus käynnistyy renderistä, osoite READMEssa (front ja back myös itsekseen komentoriviltä npm run dev)

let persons = [
  {
    id: "1",
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: "2",
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: "3",
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: "4",
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  }
]

morgan.token('type', function (req, res) { 
    const body = req.body
    if (body == null) {
        return "-"
    } else {
    return JSON.stringify([body.name, body.number])}
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :type'))


app.get('/', (request, response) => {
  response.send('<h1>Phonebook</h1>')
})


app.get('/info', (request, response) => {
    const date = new Date().toString()
    console.log(date)
    const howMany = persons.length

    response.send(`Phonebook has info for ${howMany} people. ${date}`)
})


app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

// Yksittäisen henkilön tietojen tarkastelu
app.get('/api/persons/:id', (request, response) => {
  Person.findById(request.params.id).then(person => {
    response.json(person)
  })
})


/*
app.post('/api/persons', (request, response) => {
  const maxId = persons.length > 0
    ? Math.max(...persons.map(n => Number(n.id))) 
    : 0

  const person = request.body
  person.id = String(maxId + 1)

  persons = persons.concat(person)
  console.log(person) 
  response.json(person)
})
*/


const generateId = () => {
  const maxId = persons.length > 0
    ? Math.max(...persons.map(n => Number(n.id)))
    : 0
  return String(maxId + 1)
}


// Lisätään uusi henkilö
app.post('/api/persons', (request, response) => {
  const body = request.body

  if (!body.name) {
    return response.status(400).json({ 
      error: 'name missing' 
    })   // varmistetaan että henkilöllä on nimi
  }

  if (!body.number) {
    return response.status(400).json({
        error: 'number missing'
    })   // varmistetaan että henkilöllä on numero
  }

  const nameExists = persons.find(person => person.name === body.name)
  if (nameExists) {
    return response.status(400).json({
        error: 'name must be unique'
    }) // varmistetaan että nimi on uniikki
  }

  const numberExists = persons.find(person => person.number === body.number)
  if (numberExists) {
    return response.status(400).json({
        error: 'number must be unique'
    }) // varmistetaan että numero on uniikki
  }

  const person = new Person({
    name: body.name,
    number: body.number,
    id: generateId(),
  })

  person.save().then(savedPerson => {
      response.json(savedPerson)
  })
})


app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    persons = persons.filter(person => person.id !== id)

    response.status(204).end()
})


const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
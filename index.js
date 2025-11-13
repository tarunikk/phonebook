require('dotenv').config()
const express = require('express')
const Person = require('./models/person')
var morgan = require('morgan')

const app = express()

morgan.token('type', function (req) { 
  const body = req.body
  if (body == null) {
    return '-'
  } else {
    return JSON.stringify([body.name, body.number])}
})

const errorHandler = (error, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  next(error)  
}

app.use(express.static('dist'))
app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :type'))

// Tehty 3.9-3.11 
// Frontendistä tuotantoversio (dist) ja commit gittiin kutsulla "npm run deploy:full"
// Render pyörii phonebook_render
// Tehty 3.12.-3.14
// Tietokanta personApp Mongodbssä, person.js lisätty, skeemat
// backend hakee näytettävät puhelintiedot tietokannasta, uudet numerot tallennetaan tietokantaan
// sovellus käynnistyy renderistä, osoite READMEssa (front ja back myös itsekseen komentoriviltä npm run dev)
// Tehty 3.15-3.16
// Poistaminen päitittyy tietokantaan, virheidenkäsittely keskitetty
// api/persons/id ja /info toimivat
// 3.19-3.20 tehty

app.get('/', (response) => {
  response.send('<h1>Phonebook</h1>')
})


app.get('/info', (response) => {
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
app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next (error))
})


// Lisätään uusi henkilö
app.post('/api/persons', (request, response, next) => {
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

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person.save()
    .then(savedPerson => {
      response.json(savedPerson)
      console.log(`added ${body.name} number ${body.number} to phonebook`)
    })
    .catch(error => next(error))
})


app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})


// olemattomien osoitteiden käsittely
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
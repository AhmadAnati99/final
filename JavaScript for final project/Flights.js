const express = require('express');
const app = express();
const knex = require('./connection').knex;

// Middleware to parse JSON bodies
app.use(express.json());

// Functions
const getAllFlights = async () => {
  const flights = await knex.select(
    'flights.*',
    'countries.name as origin_country_name'
  )
  .from('flights')
  .leftJoin('countries', 'flights.origin_country_id', 'countries.id');
  return flights;
};

const getFlightById = async (id) => {
  const flight = await knex('flights')
    .where({ id })
    .first();
  return flight;
};

const addFlight = async (flightData) => {
  const [newFlightId] = await knex('flights')
    .insert(flightData)
    .returning('id');
  return newFlightId;
};

async function updateFlight(flightId, flightData) {
  try {
      const { departure_time, origin_country_id, destination_country_id, airline_company_id } = flightData;
      const updatedFlight = await knex('flights')
          .where({ id: flightId })
          .update({
              departure_time,
              origin_country_id,
              destination_country_id,
              airline_company_id
          });
      return updatedFlight;
  } catch (error) {
      throw error;
  }
}

const removeFlight = async (flightId) => {
  try {
      const deletedFlight = await knex('flights')
          .where({ id: flightId })
          .del();
      return deletedFlight;
  } catch (err) {
      throw err;
  }
};


const getFlightsByAirline = async (airlineId) => {
  const flights = await knex('flights')
    .where({ airline_company_id: airlineId });
  return flights;
};

// API routes
app.use(express.json());

app.get('/api/flights', async (req, res) => {
  try {
    const flights = await getAllFlights();
    res.json(flights);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/flights/:id', async (req, res) => {
  try {
    const flight = await getFlightById(req.params.id);
    if (!flight) {
      return res.status(404).json({ error: 'Flight not found' });
    }
    res.json(flight);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/flights', async (req, res) => {
  try {
    const newFlightId = await addFlight(req.body);
    res.status(201).json({ id: newFlightId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.put('/api/flights/:id', async (req, res) => {
  try {
    const updatedFlight = await updateFlight(req.params.id, req.body);
    if (!updatedFlight) {
      return res.status(404).json({ error: 'Flight not found' });
    }
    res.json(updatedFlight);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.delete('/api/flights/:id', async (req, res) => {
  try {
    const deletedFlight = await removeFlight(req.params.id);
    if (!deletedFlight) {
      return res.status(404).json({ error: 'Flight not found' });
    }
    res.json(deletedFlight);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/flights/airline/:airlineId', async (req, res) => {
  try {
    const flights = await getFlightsByAirline(req.params.airlineId);
    res.json(flights);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = {
  getAllFlights,
  getFlightById,
  addFlight,
  updateFlight,
  removeFlight,
  getFlightsByAirline,
  app
};

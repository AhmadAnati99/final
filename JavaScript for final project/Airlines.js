const express = require('express');
const app = express();
const knex = require('./connection').knex;
app.use(express.json());

const getAllAirlines = async () => {
    return await knex.select('*').from('airline_companies');
};

const getAirlineById = async (id) => {
    const numericId = Number(id);
    console.log('Requested Airline ID:', numericId);

    const airline = await knex('airline_companies')
        .where({ id: numericId })
        .first();

    console.log('Airline data:', airline);
    return airline;
};

const addAirline = async (airlineData) => {
    const result = await knex('airline_companies').insert(airlineData);
    const newAirlineId = result[0]; 
    return newAirlineId;
};

const updateAirline = async (airlineId, newData) => {
    await knex('airline_companies')
        .where({ id: airlineId })
        .update(newData);
    return { id: airlineId, ...newData };
};

const removeAirline = async (airlineId) => {
    await knex('airline_companies')
        .where({ id: airlineId })
        .del();
    return { id: airlineId };
};

const getAirlineByUsername = async (user_name) => {
    return await knex('airline_companies')
        .where({ user_name })
        .first();
};

// API routes
app.get('/api/airlines', async (req, res) => {
    try {
        const airlines = await getAllAirlines();
        res.json(airlines);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

app.get('/api/airlines/:id', async (req, res) => {
    try {
        const id = req.params.id;
        console.log('Requested Airline ID:', id);

        const airline = await getAirlineById(id);
        console.log('Airline data:', airline);

        if (!airline) {
            return res.status(404).json({ error: 'Airline not found' });
        }
        res.json(airline);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

app.post('/api/airlines', async (req, res) => {
    try {
        const newAirlineId = await addAirline(req.body);
        res.status(201).json({ id: newAirlineId });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

app.put('/api/airlines/:id', async (req, res) => {
    try {
        const updatedAirline = await updateAirline(req.params.id, req.body);
        res.json(updatedAirline);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

app.delete('/api/airlines/:id', async (req, res) => {
    try {
        const deletedAirline = await removeAirline(req.params.id);
        res.json(deletedAirline);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

app.get('/api/airlines/username/:username', async (req, res) => {
    try {
        const airline = await getAirlineByUsername(req.params.username);
        if (!airline) {
            return res.status(404).json({ error: 'Airline not found' });
        }
        res.json(airline);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

module.exports = {
    getAllAirlines,
    getAirlineById,
    addAirline,
    updateAirline,
    removeAirline,
    getAirlineByUsername,
    app
};

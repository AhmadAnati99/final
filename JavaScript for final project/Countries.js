//Tested and functions are working
//APIs added
const express = require('express');
const app = express();
const knex = require('./connection').knex;

// Middleware to parse JSON bodies
app.use(express.json());

const getAllCountries = async () => {
    const countries = await knex.select('*').from('countries');
    return countries;
};

const getCountryById = async (id) => {
    const country = await knex('countries')
        .where({ id })
        .first();
    return country;
};

const addCountry = async (countryData) => {
    const [newCountryId] = await knex('countries')
        .insert(countryData)
        .returning('id');
    return newCountryId;
};

const updateCountry = async (countryId, newData) => {
    await knex('countries')
        .where({ id: countryId })
        .update(newData);
    return { id: countryId, ...newData };
};

const removeCountry = async (countryId) => {
    await knex('countries')
        .where({ id: countryId })
        .del();
    return { id: countryId };
};
// API routes
app.get('/api/countries', async (req, res) => {
    try {
        const countries = await getAllCountries();
        res.json(countries);
    } catch (err) {
        res.status(500).json({ error: 'Something went wrong' });
    }
});

app.get('/api/countries/:id', async (req, res) => {
    try {
        const country = await getCountryById(req.params.id);
        if (!country) {
            return res.status(404).json({ error: 'Country not found' });
        }
        res.json(country);
    } catch (err) {
        res.status(500).json({ error: 'Something went wrong' });
    }
});

app.post('/api/countries', async (req, res) => {
    try {
        const newCountryId = await addCountry(req.body);
        res.status(201).json({ id: newCountryId });
    } catch (err) {
        res.status(500).json({ error: 'Something went wrong' });
    }
});

app.put('/api/countries/:id', async (req, res) => {
    try {
        const updatedCountry = await updateCountry(req.params.id, req.body);
        res.json(updatedCountry);
    } catch (err) {
        res.status(500).json({ error: 'Something went wrong' });
    }
});

app.delete('/api/countries/:id', async (req, res) => {
    try {
        const deletedCountry = await removeCountry(req.params.id);
        res.json(deletedCountry);
    } catch (err) {
        res.status(500).json({ error: 'Something went wrong' });
    }
});

module.exports = {
    getAllCountries,
    getCountryById,
    addCountry,
    updateCountry,
    removeCountry,
    app
};

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const { getAllAirlines, getAirlineById, getAirlineByUsername, addAirline, removeAirline, updateAirline } = require('./Airlines');
const { getAllFlights, getFlightById, addFlight, updateFlight, removeFlight, getFlightsByAirline } = require('./Flights');
const { getAllCountries, getCountryById, addCountry, removeCountry, updateCountry } = require('./Countries');
const countriesApp = require('./Countries');
const customersApp = require('./Customers');
const ticketsApp = require('./Tickets');
const methodOverride = require('method-override');
const knex = require('./connection').knex;

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname));
app.use(express.json());
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/registration', (req, res) => {
    res.render('registration');
});

app.post('/register', async (req, res) => {
    const { first_name, last_name, address, phone_no, credit_card_no, username, password } = req.body;
    try {
        await knex('customers').insert({
            first_name: first_name,
            last_name: last_name,
            address: address,
            phone_no: phone_no,
            credit_card_no: credit_card_no,
            user_name: username,
            password: password
        });
        res.redirect('/registration?message=User registered successfully');
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await knex('customers')
            .where({ user_name: username, password })
            .first();
        if (user) {
            req.session.user = user;
            res.redirect('/');
        } else {
            res.status(401).send('Login failed. Please check your credentials.');
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return console.error('Error destroying session:', err);
        }
        res.redirect('/registration');
    });
});

const requireLogin = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/registration');
    }
    next();
};

app.use(methodOverride('_method'));


app.get('/project', requireLogin, (req, res) => {
    res.render('project', { loggedIn: true, user: req.session.user });
});

app.get('/flightslist', requireLogin, async (req, res) => {
    try {
        const flights = await getAllFlights();
        res.render('flightslist.html', {
            loggedIn: true,
            user: req.session.user,
            flights: flights
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/lastpart', requireLogin, async (req, res) => {
    try {
        const flights = await getAllFlights();
        res.render('lastpart', { loggedIn: true, user: req.session.user, flights: flights });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/add-flight', requireLogin, async (req, res) => {
    try {
        const airlines = await getAllAirlines(); 
        res.render('add-flight', { airlines }); 
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/add-flight', requireLogin, async (req, res) => {
    // Handle adding a flight based on form submission
    try {
        const newFlightId = await addFlight(req.body); 
        res.redirect('/lastpart'); 
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/airlines', requireLogin, async (req, res) => {
    try {
        const airlines = await getAllAirlines();
        res.json(airlines);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/airlines/:id', requireLogin, async (req, res) => {
    try {
        const id = req.params.id;
        const airline = await getAirlineById(id);
        if (!airline) {
            return res.status(404).json({ error: 'Airline not found' });
        }
        res.json(airline);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/airlines/username/:username', requireLogin, async (req, res) => {
    try {
        const { username } = req.params;
        const airline = await getAirlineByUsername(username);
        if (!airline) {
            return res.status(404).json({ error: 'Airline not found' });
        }
        res.json(airline);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/api/airlines', requireLogin, async (req, res) => {
    try {
        const newAirlineData = req.body;
        const newAirlineId = await addAirline(newAirlineData);
        res.status(201).json({ id: newAirlineId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.delete('/api/airlines/:id', requireLogin, async (req, res) => {
    try {
        const deletedAirline = await removeAirline(req.params.id);
        res.json(deletedAirline);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.put('/api/airlines/:id', requireLogin, async (req, res) => {
    try {
        const updatedAirline = await updateAirline(req.params.id, req.body);
        res.json(updatedAirline);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/flights', requireLogin, async (req, res) => {
    try {
        const flights = await getAllFlights();
        res.json(flights);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/api/flights/:id', requireLogin, async (req, res) => {
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

app.post('/api/flights', requireLogin, async (req, res) => {
    try {
        const newFlightId = await addFlight(req.body);
        res.redirect('/lastpart')
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.put('/api/flights/:id', requireLogin, async (req, res) => {
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

app.delete('/delete-flight/:id', requireLogin, async (req, res) => {
    try {
        const deletedFlight = await removeFlight(req.params.id);
        if (!deletedFlight) {
            return res.status(404).json({ error: 'Flight not found' });
        }
        res.redirect('/lastpart'); // Redirect to a relevant page after deletion
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



app.get('/api/countries', requireLogin, async (req, res) => {
    try {
        const countries = await getAllCountries();
        res.json(countries);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/Airplane', requireLogin, (req, res) => {
    res.sendFile(path.join(__dirname, 'Airplane.html'));
});

app.get('/api/countries/:id', requireLogin, async (req, res) => {
    try {
        const country = await getCountryById(req.params.id);
        if (!country) {
            return res.status(404).json({ error: 'Country not found' });
        }
        res.json(country);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/api/countries', requireLogin, async (req, res) => {
    try {
        const newCountryId = await addCountry(req.body);
        res.status(201).json({ id: newCountryId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.put('/api/countries/:id', requireLogin, async (req, res) => {
    try {
        const updatedCountry = await updateCountry(req.params.id, req.body);
        res.json(updatedCountry);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.delete('/api/countries/:id', requireLogin, async (req, res) => {
    try {
        const deletedCountry = await removeCountry(req.params.id);
        res.json(deletedCountry);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/edit-flight/:id', requireLogin, async (req, res) => {
    try {
        const flightId = req.params.id;
        const flight = await getFlightById(flightId);
        const airlines = await getAllAirlines();
        res.render('edit-flight', { flight, airlines });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
app.get('/delete-flight/:id', requireLogin, async (req, res) => {
    try {
        const flightId = req.params.id;
        const flight = await getFlightById(flightId); 
        if (!flight) {
            return res.status(404).send('Flight not found');
        }
        res.render('delete-flight', { flight });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});




app.use('/api/customers', requireLogin, customersApp.app);
app.use('/api/tickets', requireLogin, ticketsApp.app);

app.get('/', requireLogin, (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

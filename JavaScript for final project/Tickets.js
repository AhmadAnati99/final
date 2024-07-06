const express = require('express');
const app = express();
const knex = require('./connection').knex;

// Middleware to parse JSON bodies
app.use(express.json());

// Functions
const getAllTickets = async () => {
  const tickets = await knex.select('*').from('tickets');
  return tickets;
};

const getTicketById = async (id) => {
  const ticket = await knex('tickets')
    .where({ id })
    .first();
  return ticket;
};

const addTicket = async (ticketData) => {
  const [newTicketId] = await knex('tickets')
    .insert(ticketData)
    .returning('id');
  return newTicketId;
};

const updateTicket = async (ticketId, newData) => {
  await knex('tickets')
    .where({ id: ticketId })
    .update(newData);
  return { id: ticketId, ...newData };
};

const removeTicket = async (ticketId) => {
  await knex('tickets')
    .where({ id: ticketId })
    .del();
  return { id: ticketId };
};

const getTicketsByUserID = async (userId) => {
  const tickets = await knex('tickets')
    .join('customers', 'tickets.Customer_Id', '=', 'customers.Id')
    .where('customers.Id', userId)
    .select('tickets.*');
  return tickets;
};

const getTicketsByUsername = async (username) => {
  const tickets = await knex('tickets')
    .join('customers', 'tickets.Customer_Id', '=', 'customers.Id')
    .join('airlines', 'tickets.Flight_Id', '=', 'airlines.Id')
    .where('customers.user_name', username)
    .select('tickets.*', 'airlines.Name as Airline_Name');
  return tickets;
};

// API routes
app.use(express.json());

app.get('/api/tickets', async (req, res) => {
  try {
    const tickets = await getAllTickets();
    res.json(tickets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/tickets/:id', async (req, res) => {
  try {
    const ticket = await getTicketById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    res.json(ticket);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/tickets', async (req, res) => {
  try {
    const newTicketId = await addTicket(req.body);
    res.status(201).json({ id: newTicketId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.put('/api/tickets/:id', async (req, res) => {
  try {
    const updatedTicket = await updateTicket(req.params.id, req.body);
    if (!updatedTicket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    res.json(updatedTicket);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.delete('/api/tickets/:id', async (req, res) => {
  try {
    const deletedTicket = await removeTicket(req.params.id);
    if (!deletedTicket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    res.json(deletedTicket);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/tickets/user/:userId', async (req, res) => {
  try {
    const tickets = await getTicketsByUserID(req.params.userId);
    res.json(tickets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/tickets/username/:username', async (req, res) => {
  try {
    const tickets = await getTicketsByUsername(req.params.username);
    res.json(tickets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = {
  getAllTickets,
  getTicketById,
  addTicket,
  updateTicket,
  removeTicket,
  getTicketsByUserID,
  getTicketsByUsername,
  app
};

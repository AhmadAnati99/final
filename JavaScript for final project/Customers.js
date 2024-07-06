const express = require('express');
const app = express();
const knex = require('./connection').knex;

// Middleware to parse JSON bodies
app.use(express.json());

// Functions
const getAllCustomers = async () => {
  const customers = await knex.select('*').from('customers');
  return customers;
};

const getCustomerById = async (id) => {
  const customer = await knex('customers')
    .select('*')
    .where({ id })
    .first();
  return customer;
};

const addCustomer = async (customerData) => {
  const [newCustomerId] = await knex('customers')
    .insert(customerData)
    .returning('id');
  return newCustomerId;
};

const updateCustomer = async (customerId, newData) => {
  await knex('customers')
    .where({ id: customerId })
    .update(newData);
  return { id: customerId, ...newData };
};

const removeCustomer = async (customerId) => {
  await knex('customers')
    .where({ id: customerId })
    .del();
  return { id: customerId };
};

const getCustomerByUsername = async (username) => {
  const customer = await knex('customers')
    .where({ user_name: username })
    .first();
  return customer;
};

// API routes
app.use(express.json());

app.get('/api/customers', async (req, res) => {
  try {
    const customers = await getAllCustomers();
    res.json(customers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/customers/:id', async (req, res) => {
  try {
    const customer = await getCustomerById(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(customer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/customers', async (req, res) => {
  try {
    const newCustomerId = await addCustomer(req.body);
    res.status(201).json({ id: newCustomerId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.put('/api/customers/:id', async (req, res) => {
  try {
    const updatedCustomer = await updateCustomer(req.params.id, req.body);
    if (!updatedCustomer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(updatedCustomer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.delete('/api/customers/:id', async (req, res) => {
  try {
    const deletedCustomer = await removeCustomer(req.params.id);
    if (!deletedCustomer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(deletedCustomer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/customers/username/:username', async (req, res) => {
  try {
    const customer = await getCustomerByUsername(req.params.username);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(customer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = {
  getAllCustomers,
  getCustomerById,
  addCustomer,
  updateCustomer,
  removeCustomer,
  getCustomerByUsername,
  app
};

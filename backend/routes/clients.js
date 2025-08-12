import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM clients');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single client by id
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [clients] = await pool.query('SELECT * FROM clients WHERE id = ?', [id]);
    if (clients.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.json(clients[0]);
  } catch (error) {
    console.error('Error fetching client:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const {
      companyName,
      legalForm,
      registrationNumber,
      vatNumber,
      industry,
      foundingDate,
      address,
      city,
      postalCode,
      country,
      phone,
      email,
      website,
      description,
      employees,
      revenue,
      ceoName,
      contactPerson
    } = req.body;

    // Insert query with all columns
    const [result] = await pool.query(
      `INSERT INTO clients (
        companyName, legalForm, registrationNumber, vatNumber, industry,
        foundingDate, address, city, postalCode, country, phone, email,
        website, description, employees, revenue, ceoName, contactPerson
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        companyName,
        legalForm,
        registrationNumber,
        vatNumber,
        industry,
        foundingDate,
        address,
        city,
        postalCode,
        country,
        phone,
        email,
        website,
        description,
        employees,
        revenue,
        ceoName,
        contactPerson
      ]
    );

    res.status(201).json({
      message: 'Client added successfully',
      clientId: result.insertId
    });
  } catch (error) {
    console.error('Error saving client:', error);
    res.status(500).json({ error: 'Failed to save client' });
  }
});

// Update client
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const {
    companyName,
    legalForm,
    registrationNumber,
    vatNumber,
    industry,
    foundingDate,
    address,
    city,
    postalCode,
    country,
    phone,
    email,
    website,
    description,
    employees,
    revenue,
    ceoName,
    contactPerson
  } = req.body;

  try {
    await pool.query(
      `UPDATE clients SET
        companyName = ?,
        legalForm = ?,
        registrationNumber = ?,
        vatNumber = ?,
        industry = ?,
        foundingDate = ?,
        address = ?,
        city = ?,
        postalCode = ?,
        country = ?,
        phone = ?,
        email = ?,
        website = ?,
        description = ?,
        employees = ?,
        revenue = ?,
        ceoName = ?,
        contactPerson = ?
      WHERE id = ?`,
      [
        companyName,
        legalForm,
        registrationNumber,
        vatNumber,
        industry,
        foundingDate,
        address,
        city,
        postalCode,
        country,
        phone,
        email,
        website,
        description,
        employees,
        revenue,
        ceoName,
        contactPerson,
        id
      ]
    );
    res.json({ message: 'Client updated successfully' });
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete client by id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM clients WHERE id = ?', [id]);
    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

router.get('/:clientId/responses', async (req, res) => {
  const { clientId } = req.params;

  try {
    // Fetch conditional field data
    const [conditionalData] = await pool.query(`
      SELECT 
        co.field_id,
        co.option_text,
        co.radio_question,
        co.radio_options,
        ci.label as input_label
      FROM conditional_options co
      LEFT JOIN conditional_inputs ci ON ci.conditional_option_id = co.id
      ORDER BY co.field_id, co.id, ci.id
    `);

    // Fetch client responses
    const [responses] = await pool.query(`
      SELECT 
        fr.id,
        fr.form_id,
        fr.answers,
        fr.submitted_at AS submitted_at,
        fr.status
      FROM form_responses fr
      WHERE fr.client_id = ?
      ORDER BY fr.submitted_at DESC
    `, [clientId]);

    // Get all fields for the forms in these responses
    // Get all fields for the forms in these responses
const formIds = responses.map(r => r.form_id);
const [fields] = await pool.query(`
  SELECT f.id, f.label, f.field_id, f.section_id, s.form_id
  FROM fields f
  JOIN sections s ON f.section_id = s.id
  WHERE s.form_id IN (?)
`, [formIds]);


    // Process each response
    const result = responses.map(response => {
      // Parse answers safely
      let answers = {};
      if (typeof response.answers === 'string') {
        try {
          answers = JSON.parse(response.answers);
        } catch {
          console.warn(`Failed to parse answers for response id ${response.id}`);
        }
      } else if (typeof response.answers === 'object' && response.answers !== null) {
        answers = response.answers;
      }

      // Map field IDs to labels
      const labeledAnswers = {};
      for (const fieldId in answers) {
        const field = fields.find(f => f.id === Number(fieldId) && f.form_id === response.form_id);
        const label = field ? field.label : `Field ${fieldId}`;
        labeledAnswers[label] = answers[fieldId];

        // Attach conditional data if exists
        const matchingConditionals = conditionalData.filter(cd => cd.field_id.toString() === fieldId);
        if (matchingConditionals.length > 0) {
          labeledAnswers[label] = {
            value: answers[fieldId],
            _conditionalData: matchingConditionals
          };
        }
      }

      return {
        ...response,
        answers: labeledAnswers
      };
    });

    res.json(result);

  } catch (err) {
    console.error('Error fetching client responses:', err);
    res.status(500).json({ message: 'Failed to fetch responses for client' });
  }
});


// GET /api/clients/summary
router.get('/summary', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        c.id,
        c.companyName,
        c.contactPerson,
        MAX(f.submitted_at) AS lastSubmission,
        SUM(f.status = 'pending') AS pendingCount,
        SUM(f.status = 'approved') AS approvedCount,
        SUM(f.status = 'rejected') AS rejectedCount,
        SUM(f.status = 'needs_correction') AS needsCorrectionCount
      FROM clients c
      LEFT JOIN form_responses f ON c.id = f.client_id
      GROUP BY c.id
      ORDER BY c.companyName
    `);

    // Wrap each row in a `client` object to match frontend type
    const summary = rows.map((row) => ({
      client: {
        id: row.id,
        companyName: row.companyName,
        contactPerson: row.contactPerson
      },
      lastSubmission: row.lastSubmission,
      pendingCount: row.pendingCount,
      approvedCount: row.approvedCount,
      rejectedCount: row.rejectedCount,
      needsCorrectionCount: row.needsCorrectionCount
    }));

    res.json(summary);
  } catch (error) {
    console.error('Error fetching client summary:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


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
// Update client (only essential fields)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { companyName, email, phone, industry, city } = req.body;

  try {
    const [result] = await pool.query(
      `UPDATE clients SET
        companyName = ?,
        email = ?,
        phone = ?,
        industry = ?,
        city = ?
      WHERE id = ?`,
      [companyName, email, phone, industry, city, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.json({ message: 'Client updated successfully' });
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({ error: 'Failed to update client' });
  }
});


export default router;

import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const { formId, clientId, answers } = req.body;

  if (!formId || !answers || !clientId) {
    return res.status(400).json({ message: 'formId, clientId, and answers are required' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO form_responses (form_id, client_id, answers) VALUES (?, ?, ?)',
      [formId, clientId, JSON.stringify(answers)]
    );

    res.status(201).json({ message: 'Form response saved', responseId: result.insertId });
  } catch (error) {
    console.error('Error saving form response:', error);
    res.status(500).json({ message: 'Failed to save form response' });
  }
});




router.get('/form/:formId', async (req, res) => {
  const { formId } = req.params;

  try {
    const [responses] = await pool.query(
      'SELECT * FROM form_responses WHERE form_id = ?',
      [formId]
    );
    res.json(responses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch form responses' });
  }
});

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        fr.id,
        f.title AS formTitle,
        fr.submitted_at AS submittedAt,
        fr.status,
        fr.answers,
        c.id AS clientId,
        c.companyName AS clientName
      FROM form_responses fr
      JOIN forms f ON fr.form_id = f.id
      JOIN clients c ON fr.client_id = c.id
      ORDER BY fr.submitted_at DESC
    `);

    // Optionally create a short answers summary string from JSON
    const result = rows.map(row => {
      let answersSummary = 'No answers';
      try {
        const answersObj = JSON.parse(row.answers);
        // Create a summary from first 2 answers, for example:
        const firstAnswers = Object.entries(answersObj).slice(0, 2);
        answersSummary = firstAnswers.map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`).join('; ');
      } catch {
        // JSON parsing failed or empty answers
      }

      return {
        id: row.id,
        formTitle: row.formTitle,
        submittedAt: row.submittedAt,
        status: row.status,
        clientId: row.clientId,
        clientName: row.clientName,
        answersSummary,
      };
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching form responses' });
  }
});

router.put('/form-responses/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; 

  try {
    await pool.query('UPDATE form_responses SET status = ? WHERE id = ?', [status, id]);
    res.json({ message: 'Status updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update status' });
  }
});

router.get('/client/:clientId', async (req, res) => {
  const { clientId } = req.params;

  try {
    const [responses] = await pool.query(
      'SELECT * FROM form_responses WHERE client_id = ?',
      [clientId]
    );
    res.json(responses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch form responses for client' });
  }
});


export default router;

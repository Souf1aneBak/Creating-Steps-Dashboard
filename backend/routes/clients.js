import express from 'express';
import pool from '../config/db.js';

const router = express.Router();
router.get('/:clientId/responses', async (req, res) => {
  const { clientId } = req.params;

  try {
    // 1️⃣ Fetch all conditional options and inputs
    const [conditionalRows] = await pool.query(`
      SELECT 
        co.id AS cond_id,
        co.field_id,
        co.option_text,
        co.radio_question,
        co.radio_options,
        ci.label AS input_label
      FROM conditional_options co
      LEFT JOIN conditional_inputs ci ON ci.conditional_option_id = co.id
      ORDER BY co.field_id, co.id, ci.id
    `);

    // Group conditional inputs per option
    const conditionalMap = {};
    conditionalRows.forEach(row => {
      const key = `${row.field_id}_${row.option_text}`;
      if (!conditionalMap[key]) {
        conditionalMap[key] = {
          optionText: row.option_text,
          radioQuestion: row.radio_question,
          radioOptions: row.radio_options ? row.radio_options.split(',') : [],
          inputs: []
        };
      }
      if (row.input_label) {
        conditionalMap[key].inputs.push({ label: row.input_label, value: null });
      }
    });

    // 2️⃣ Fetch client responses
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

    if (responses.length === 0) return res.json([]);

    // 3️⃣ Fetch all fields for the forms in these responses
    const formIds = [...new Set(responses.map(r => r.form_id))];
    const [fields] = await pool.query(`
      SELECT f.id, f.label, f.field_id, f.section_id, s.form_id
      FROM fields f
      JOIN sections s ON f.section_id = s.id
      WHERE s.form_id IN (?)
    `, [formIds]);

    // 4️⃣ Recursive function to format answers
  function formatAnswerStructured(ans) {
  if (ans === null || ans === undefined) return 'Non renseigné';

  if (typeof ans === 'string' || typeof ans === 'number' || typeof ans === 'boolean') {
    return ans.toString();
  }

  if (Array.isArray(ans)) {
    return ans.map(formatAnswerStructured).join('\n');
  }

  if (typeof ans === 'object') {
    let lines = [];

    // Oui/Non field
    if ('ouiNon' in ans) {
      lines.push(`Answer: ${ans.ouiNon}`);
      if (Array.isArray(ans.options)) {
        ans.options.forEach(opt => {
          lines.push(formatAnswerStructured(opt));
        });
      }
      return lines.join('\n');
    }

    // Radio field
    if ('radio' in ans) {
      lines.push(`Answer: ${ans.radio}`);
      return lines.join('\n');
    }

    // Simple value
    if ('value' in ans) return `Answer: ${ans.value || 'Non renseigné'}`;

    // Options array
    if (Array.isArray(ans.options)) {
      ans.options.forEach(opt => {
        if (opt.option) lines.push(`Option: ${opt.option}`);
        if (Array.isArray(opt.inputs)) {
          opt.inputs.forEach(input => {
            lines.push(`${input.label}: ${input.value || 'Non renseigné'}`);
          });
        }
        // Nested options recursively
        if (opt.options) lines.push(formatAnswerStructured(opt.options));
      });
    }

    // Conditional data
    if (Array.isArray(ans._conditionalData)) {
      ans._conditionalData.forEach(cond => {
        if (cond.optionText) lines.push(`Option: ${cond.optionText}`);
        if (Array.isArray(cond.inputs)) {
          cond.inputs.forEach(i => {
            lines.push(`${i.label}: ${i.value || 'Non renseigné'}`);
          });
        }
        if (cond.options) lines.push(formatAnswerStructured(cond.options));
      });
    }

    // Fallback: iterate all keys safely
    Object.entries(ans).forEach(([k, v]) => {
      if (!['options', '_conditionalData', 'value', 'ouiNon', 'radio'].includes(k)) {
        lines.push(`${k}: ${formatAnswerStructured(v)}`);
      }
    });

    return lines.join('\n');
  }

  return String(ans);
}


    // 5️⃣ Process responses
    const result = responses.map(resp => {
      let answers = {};

      if (typeof resp.answers === 'string') {
        try {
          answers = JSON.parse(resp.answers);
        } catch {
          console.warn(`Failed to parse answers for response id ${resp.id}`);
          answers = {};
        }
      } else if (typeof resp.answers === 'object' && resp.answers !== null) {
        answers = resp.answers;
      }

      const labeledAnswers = {};
      for (const fieldId in answers) {
        const field = fields.find(f => f.id === Number(fieldId) && f.form_id === resp.form_id);
        const label = field ? field.label : `Field ${fieldId}`;
        const rawAnswer = answers[fieldId];

        // Check for conditional options
        const matchingKeys = Object.keys(conditionalMap).filter(k => k.startsWith(`${fieldId}_`));
        if (matchingKeys.length > 0) {
          labeledAnswers[label] = {
            value: formatAnswerStructured(rawAnswer),
            _conditionalData: matchingKeys.map(k => {
              const cond = { ...conditionalMap[k] };
              cond.inputs = cond.inputs.map(input => ({
                label: input.label,
                value: answers[`${fieldId}-${input.label}`] || null
              }));
              if (typeof rawAnswer === 'object') {
                if ('radio' in rawAnswer) cond.radio = rawAnswer.radio;
                if ('ouiNo' in rawAnswer || 'ouiNon' in rawAnswer) cond.ouiNo = rawAnswer.ouiNo || rawAnswer.ouiNon;
              }
              return cond;
            })
          };
        } else {
          labeledAnswers[label] = formatAnswerStructured(rawAnswer);
        }
      }

      return { ...resp, answers: labeledAnswers };
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
        c.email,
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
        contactPerson: row.contactPerson,
        email: row.email, // <-- add this
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

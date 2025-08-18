import express from 'express';
import pool from '../config/db.js';
import PDFDocument from 'pdfkit';

const router = express.Router();


// In your form response POST route
router.post('/', async (req, res) => {
  let { formId, clientId, answers } = req.body;

  // Ensure answers is properly stringified
  let answersString;
  try {
    if (typeof answers === 'string') {
      // Try to parse it first to ensure it's valid JSON
      JSON.parse(answers);
      answersString = answers;
    } else {
      answersString = JSON.stringify(answers);
    }
  } catch (err) {
    return res.status(400).json({ message: 'Invalid answers format' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO form_responses (form_id, client_id, answers) VALUES (?, ?, ?)',
      [formId, clientId, answersString]
    );
    res.status(201).json({ message: 'Form response saved', responseId: result.insertId });
  } catch (error) {
    console.error('Error saving form response:', error);
    res.status(500).json({ message: 'Failed to save form response' });
  }
});



router.get('/form/:formId', async (req, res) => {
  function safeParse(value, responseId) {
  if (!value) return {};

  try {
    let fixed = value;

    // If stored as an object, stringify it
    if (typeof fixed === "object") {
      fixed = JSON.stringify(fixed);
    }

    // If stored with single quotes instead of double quotes → fix it
    if (typeof fixed === "string") {
      // Remove outer curly braces spaces if any
      fixed = fixed.trim();

      // Replace single quotes around keys/values with double quotes
      fixed = fixed.replace(/([{,]\s*)'([^']+?)'\s*:/g, '$1"$2":'); // keys
      fixed = fixed.replace(/:\s*'([^']+?)'\s*([},])/g, ':"$1"$2'); // values
    }

    const parsed = JSON.parse(fixed);

    // Debug logging
    console.log("✅ Parsed answers for response", responseId, ":", parsed);

    return parsed;
  } catch (err) {
    console.warn(`❌ Failed to parse value for response ${responseId}:`, value);
    return {};
  }
}


  try {
    const { formId } = req.params;

    // fetch conditional options
    const [conditionalData] = await pool.query(`
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

    // fetch only responses of this form
    const [responses] = await pool.query(`
      SELECT 
        fr.id,
        fr.answers,
        fr.submitted_at AS submittedAt,
        fr.status,
        f.title AS formTitle,
        c.id AS clientId,
        c.companyName AS clientName
      FROM form_responses fr
      JOIN forms f ON fr.form_id = f.id
      JOIN clients c ON fr.client_id = c.id
      WHERE fr.form_id = ?
      ORDER BY fr.submitted_at DESC
    `, [formId]);

    // process answers
    const result = responses.map(response => {
  let answers = {};
  try {
    const parsed = safeParse(response.answers, response.id);
   for (const key in parsed) {
  if (typeof parsed[key] === "object" && parsed[key] !== null) {
    answers[key] = parsed[key]; // already object, keep it
  } else {
    answers[key] = parsed[key]; // primitive → keep plain
  }
}

  } catch {
    console.warn(`Failed to parse answers for response id ${response.id}`);
    answers = {};
  }

  for (const fieldId in answers) {
  const matchingConditionals = conditionalData.filter(
    cd => cd.field_id.toString() === fieldId
  );

  if (matchingConditionals.length > 0) {
    if (typeof answers[fieldId] !== "object" || answers[fieldId] === null) {
      // Wrap primitive into object
      answers[fieldId] = { value: answers[fieldId] };
    }

    answers[fieldId]._conditionalData = matchingConditionals.map(cond => {
      // Check if there’s a sub-input like "69-0", "69-1", etc.
      const subInputKeys = Object.keys(answers).filter(k =>
        k.startsWith(fieldId + "-")
      );

      const inputs = subInputKeys.map(k => ({
        key: k,
        value: answers[k],
      }));

      return {
        id: cond.cond_id,
        optionText: cond.option_text,
        radioQuestion: cond.radio_question,
        radioOptions: cond.radio_options ? cond.radio_options.split(",") : [],
        inputLabel: cond.input_label,
        inputs, // ✅ now you’ll see { key: "69-0", value: "jhon" }
      };
    });
  }
}



  return { ...response, answers };
});

    res.json(result);
  } catch (err) {
    console.error('Error fetching form responses:', err);
    res.status(500).json({ message: 'Error fetching form responses' });
  }
});


router.get('/', async (req, res) => {
  try {
    // 1️⃣ Fetch all conditional options and inputs
    const [conditionalData] = await pool.query(`
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

    // 2️⃣ Fetch all form responses with client info
    const [responses] = await pool.query(`
      SELECT 
        fr.id,
        fr.answers,
        fr.submitted_at AS submittedAt,
        fr.status,
        f.title AS formTitle,
        c.id AS clientId,
        c.companyName AS clientName
      FROM form_responses fr
      JOIN forms f ON fr.form_id = f.id
      JOIN clients c ON fr.client_id = c.id
      ORDER BY fr.submitted_at DESC
    `);

    // 3️⃣ Process each response
    const result = responses.map(response => {
      let answers = {};
      try {
        const parsed = JSON.parse(response.answers || '{}');
        // Wrap primitive values into objects
        for (const key in parsed) {
          answers[key] = typeof parsed[key] === 'object' ? parsed[key] : { value: parsed[key] };
        }
      } catch {
        console.warn(`Failed to parse answers for response id ${response.id}`);
        answers = {};
      }

      // 4️⃣ Attach conditional data
      for (const fieldId in answers) {
        const matchingConditionals = conditionalData.filter(
          cd => cd.field_id.toString() === fieldId
        );

        if (matchingConditionals.length > 0) {
          answers[fieldId]._conditionalData = matchingConditionals.map(cond => ({
            id: cond.cond_id,
            optionText: cond.option_text,
            radioQuestion: cond.radio_question,
            radioOptions: cond.radio_options ? cond.radio_options.split(',') : [],
            inputLabel: cond.input_label,
          }));
        }
      }

      return {
        ...response,
        answers
      };
    });

    res.json(result);

  } catch (err) {
    console.error('Error fetching form responses:', err);
    res.status(500).json({ message: 'Error fetching form responses' });
  }
});


router.put('/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const [current] = await pool.query(
      'SELECT status FROM form_responses WHERE id = ?', 
      [id]
    );

    if (current[0].status === 'approved') {
      return res.status(400).json({ 
        message: 'Cannot modify status after approval' 
      });
    }
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
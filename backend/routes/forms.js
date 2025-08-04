import express from 'express';
import pool from '../config/db.js';

const router = express.Router();


router.get('/', async (req, res) => {
  const [forms] = await pool.query('SELECT * FROM forms');
  res.json(forms);
});

router.post('/', async (req, res) => {
 const { title, description, createdBy, sections } = req.body;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

   
    const [formResult] = await connection.query(
      'INSERT INTO forms (title, description, createdBy) VALUES (?, ?, ?)',
      [title, description, createdBy]
    );
    const formId = formResult.insertId;

    
    for (const section of sections) {
      const [sectionResult] = await connection.query(
        'INSERT INTO sections (form_id, section_id, title) VALUES (?, ?, ?)',
        [formId, section.id, section.title]
      );
      const sectionId = sectionResult.insertId;

     
      for (const field of section.fields) {
        const [fieldResult] = await connection.query(
          'INSERT INTO fields (section_id, field_id, label, type, required, showOtherOption) VALUES (?, ?, ?, ?, ?, ?)',
          [sectionId, field.id, field.label, field.type, field.required, field.showOtherOption]
        );
        const fieldId = fieldResult.insertId;

       
        for (const option of field.options || []) {
          await connection.query(
            'INSERT INTO field_options (field_id, option_text) VALUES (?, ?)',
            [fieldId, option]
          );
        }
      }
    }

    await connection.commit();
    return { success: true, formId };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
});



router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const [[form]] = await pool.query('SELECT * FROM forms WHERE id = ?', [id]);
  if (!form) return res.status(404).json({ message: 'Form not found' });

  
  const [sections] = await pool.query('SELECT * FROM sections WHERE form_id = ?', [id]);

 
  for (const section of sections) {
    const [fields] = await pool.query('SELECT * FROM fields WHERE section_id = ?', [section.id]);
    for (const field of fields) {
      const [options] = await pool.query('SELECT * FROM field_options WHERE field_id = ?', [field.id]);
      field.options = options;
    }
    section.fields = fields;
  }

  form.sections = sections;

  res.json(form);
});


router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;
  await pool.query('UPDATE forms SET title=?, description=? WHERE id=?', [title, description, id]);
  res.json({ message: 'Form updated' });
});


router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  await pool.query('DELETE FROM forms WHERE id=?', [id]);
  res.json({ message: 'Form deleted' });
});

export default router;

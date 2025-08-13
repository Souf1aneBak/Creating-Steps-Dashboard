import express from 'express';
import PDFDocument from 'pdfkit';
import pool from '../config/db.js';

const router = express.Router();

router.get('/generate/:responseId', async (req, res) => {
  const { responseId } = req.params;

  try {
    // 1. Fetch response + client info
    const [rows] = await pool.query(
      `SELECT fr.*, c.companyName AS client_name, c.email AS client_email
       FROM form_responses fr
       JOIN clients c ON fr.client_id = c.id
       WHERE fr.id = ?`,
      [responseId]
    );

    if (!rows.length) {
      return res.status(404).json({ message: 'Response not found' });
    }

    const data = rows[0];

    // 2. Create PDF
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=report-${responseId}.pdf`);

    doc.pipe(res);

    doc.fontSize(18).text('Form Response Report', { underline: true });
    doc.moveDown();
    doc.fontSize(14).text(`Client: ${data.client_name}`);
    doc.text(`Email: ${data.client_email}`);
    doc.text(`Form ID: ${data.form_id}`);
    doc.moveDown();

    // Parse answers safely
    let answers = {};
    if (typeof data.answers === 'string') {
      answers = JSON.parse(data.answers);
    } else if (typeof data.answers === 'object' && data.answers !== null) {
      answers = data.answers;
    }

    Object.entries(answers).forEach(([key, value]) => {
      doc.text(`${key}: ${Array.isArray(value) ? value.join(', ') : value}`);
    });

    doc.end();

  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Error generating PDF' });
    }
  }
});

export default router;

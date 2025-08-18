import express from 'express';
import PDFDocument from 'pdfkit';
import pool from '../config/db.js';

const router = express.Router();

// Enhanced answer formatter that handles all field types
function formatAnswer(ans, isNested = false) {
  if (ans == null) return isNested ? '' : 'Answer: Non renseigné';

  // 1️⃣ Simple values
  if (typeof ans === 'string' || typeof ans === 'number' || typeof ans === 'boolean') {
    return `Answer: ${ans}`;
  }

  // 2️⃣ Arrays
  if (Array.isArray(ans)) {
    return ans.map(a => formatAnswer(a, true)).filter(Boolean).join('\n');
  }

  // 3️⃣ Objects
  if (typeof ans === 'object') {
    const lines = [];

    // Top-level answer
    if (ans.Answer != null && ans.Answer !== '') lines.push(`Answer: ${ans.Answer}`);
    else if (ans.ouiNon != null && ans.ouiNon !== '') lines.push(`Answer: ${ans.ouiNon}`);

    // Options
    if (Array.isArray(ans.options)) {
      ans.options.forEach(opt => {
        if (opt.option) lines.push(`Option: ${opt.option}`);

        // Inputs
        if (opt.inputs) {
          for (const [key, val] of Object.entries(opt.inputs)) {
            if (val) lines.push(`${key}: ${val}`);
          }
        }

        // Radio
        if (opt.radio != null && opt.radio !== '') {
          let questionText = opt.radioQuestion
            || (Array.isArray(opt.conditionalOptions) && opt.conditionalOptions[0]?.radioQuestion)
            || 'Answer';
          lines.push(`${questionText}: ${opt.radio}`);
        }
      });
    }

    // Conditional data (_conditionalData)
    if ('_conditionalData' in ans && Array.isArray(ans._conditionalData)) {
      ans._conditionalData.forEach(cond => {
        if (cond.optionText) lines.push(cond.optionText);

        if (Array.isArray(cond.inputs)) {
          cond.inputs.forEach(input => {
            if (input.value) lines.push(`${input.label || input.key}: ${input.value}`);
          });
        }

        if (cond.radioQuestion && cond.radio) {
          lines.push(`${cond.radioQuestion}: ${cond.radio}`);
        }
      });
    }

    // Other nested keys
    for (const [key, value] of Object.entries(ans)) {
      if (['checked', 'Answer', 'ouiNon', 'options', '_conditionalData'].includes(key)) continue;

      if (typeof value === 'object') {
        const nested = formatAnswer(value, true);
        if (nested) lines.push(nested);
      } else if (value != null && value !== '') {
        lines.push(`${key}: ${value}`);
      }
    }

    return lines.join('\n');
  }

  return isNested ? '' : `Answer: ${ans.toString()}`;
}


router.get('/generate/:responseId', async (req, res) => {
  const { responseId } = req.params;

  try {
    const [responseRows] = await pool.query(
      'SELECT * FROM form_responses WHERE id = ?',
      [responseId]
    );
    if (!responseRows.length) return res.status(404).send('Response not found');
    const response = responseRows[0];

    let answers = {};
    try {
      answers = typeof response.answers === 'string'
        ? JSON.parse(response.answers)
        : response.answers || {};
    } catch (err) {
      console.error('Error parsing answers:', err);
    }

    const [formRows] = await pool.query('SELECT * FROM forms WHERE id = ?', [response.form_id]);
    if (!formRows.length) return res.status(404).send('Form not found');
    const form = formRows[0];

    const [sections] = await pool.query('SELECT * FROM sections WHERE form_id = ?', [form.id]);
    const [fields] = await pool.query(`
      SELECT f.* FROM fields f
      JOIN sections s ON f.section_id = s.id
      WHERE s.form_id = ?
    `, [form.id]);

    const [clientRows] = await pool.query('SELECT * FROM clients WHERE id = ?', [response.client_id]);
    const client = clientRows[0] || { companyName: 'Non spécifié' };

    // --- NEW: fetch conditional options for all fields ---
    const fieldIds = fields.map(f => f.id);
    const [condOptsRows] = await pool.query(`
      SELECT * FROM conditional_options WHERE field_id IN (?)
    `, [fieldIds]);

    let condInputsRows = [];
if (condOptsRows.length > 0) {
  const ids = condOptsRows.map(co => co.id);
  const [rows] = await pool.query(
    `SELECT * FROM conditional_inputs WHERE conditional_option_id IN (?)`,
    [ids]
  );
  condInputsRows = rows;
}


    // Attach conditionalOptions and inputs to fields
    fields.forEach(f => {
      f.conditionalOptions = condOptsRows
        .filter(co => co.field_id === f.id)
        .map(co => ({
          id: co.id,
          option: co.option_text,
          radioQuestion: co.radio_question,
          radioOptions: co.radio_options ? JSON.parse(co.radio_options) : [],
          inputs: condInputsRows
            .filter(ci => ci.conditional_option_id === co.id)
            .map(ci => ({ label: ci.label }))
        }));
    });

    const doc = new PDFDocument({ margin: 40, size: 'A4', bufferPages: true });
    res.setHeader('Content-Disposition',
      `attachment; filename="${form.title.replace(/\s+/g, '_')}_${client.companyName.replace(/\s+/g, '_')}.pdf"`
    );
    res.setHeader('Content-Type', 'application/pdf');
    doc.pipe(res);

    // ===== HEADER =====
    doc.rect(0, 0, doc.page.width, 80).fill('#2c3e50');
    doc.fillColor('#fff').fontSize(20).text('BON DE COMMANDE', 50, 30);
    doc.fontSize(10).text(`N°: ${responseId.padStart(6,'0')}`, 450, 30)
                     .text(`Date: ${new Date(response.submitted_at).toLocaleDateString('fr-FR')}`, 450, 45)
                     .text(`Client: ${client.companyName}`, 450, 60);

    // ===== CLIENT INFO =====
    doc.fillColor('#495057').fontSize(12).text('INFORMATIONS CLIENT:', 50, 120, { underline: true });
    doc.fontSize(10).text(`Société: ${client.companyName}`, 50, 140)
                    .text(`Date de soumission: ${new Date(response.submitted_at).toLocaleString('fr-FR')}`, 50, 155)
                    .text(`Statut: ${response.status || 'En attente'}`, 50, 170);

    // ===== FORM RESPONSES =====
    let yPos = 220;
    const left = 50, right = doc.page.width - 50;

    const printAnswer = (text, indent = 0) => {
      const lines = text.split('\n');
      lines.forEach(line => {
        if (yPos > 700) { doc.addPage(); yPos = 50; }
        doc.font('Helvetica').fontSize(10).fillColor('#495057')
           .text(line, left + indent, yPos, { width: right - left - indent });
        yPos += 15;
      });
    };

    sections.forEach(section => {
  const sectionFields = fields.filter(f => f.section_id === section.id);
  if (!sectionFields.length) return;

  if (yPos > 650) { doc.addPage(); yPos = 50; }

  doc.font('Helvetica-Bold').fontSize(14).fillColor('#212529')
     .text(section.title, left, yPos);
  yPos += 25;

 sectionFields.forEach(field => {
  if (field.field_type === 'button') return;

  let answer = answers[field.id] || answers[field.label] || null;

  // --- FIX: wrap string answers into { radio: value } to include radioQuestion ---
  if (typeof answer === 'string' && field.conditionalOptions?.length) {
    answer = { radio: answer, conditionalOptions: field.conditionalOptions };
  }

  // --- For object answers, attach conditionalOptions if missing ---
  else if (answer && typeof answer === 'object' && field.conditionalOptions) {
    if (Array.isArray(answer.options)) {
      answer.options.forEach(opt => {
        const cond = field.conditionalOptions.find(co => co.option === opt.option);
        if (cond) opt.conditionalOptions = [cond];
      });
    } else if (!answer.conditionalOptions) {
      answer.conditionalOptions = field.conditionalOptions;
    }
  }
   console.log('Field:', field.label);
  console.log('Answer before format:', answer);
  doc.font('Helvetica-Bold').fontSize(10).fillColor('#343a40')
     .text(`${field.label}:`, left, yPos);
  yPos += 15;

  const formatted = formatAnswer(answer, false, field.label);
  printAnswer(formatted, 15);



    // separator line
    if (yPos + 10 < doc.page.height - 100) {
      doc.moveTo(left, yPos).lineTo(right, yPos).strokeColor('#e9ecef').stroke();
      yPos += 10;
    } else {
      yPos += 20;
    }
  });
});

    // ===== SIGNATURES =====
    if (yPos > doc.page.height - 150) { doc.addPage(); yPos = 50; } else { yPos = doc.page.height - 150; }
    doc.fontSize(10).fillColor('#6c757d').text('SIGNATURES', doc.page.width/2, yPos, { align: 'center', underline: true });
    yPos += 20;
    doc.moveTo(doc.page.width/2-100, yPos+20).lineTo(doc.page.width/2-20, yPos+20).stroke();
    doc.moveTo(doc.page.width/2+20, yPos+20).lineTo(doc.page.width/2+100, yPos+20).stroke();
    doc.fontSize(9).text('Client', doc.page.width/2-60, yPos+25, { width: 80, align: 'center' })
                   .text('Responsable', doc.page.width/2+60, yPos+25, { width: 80, align: 'center' });

    // ===== FOOTER =====
    doc.fontSize(8).fillColor('#adb5bd').text(`Document généré le ${new Date().toLocaleString('fr-FR')}`, doc.page.width/2, doc.page.height-20, { align: 'center' });

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).send('Error generating PDF');
  }
});


export default router;
import { Router } from 'express'

const router = Router()

const resourceDocuments = [
  {
    id: 'prospectus-2026',
    title: 'OUSL Short Courses Guide & Prospectus 2026',
    category: 'Academic Prospectus',
    size: '4.8 MB',
    filename: 'ousl-short-courses-prospectus-2026.pdf',
    desc: 'Complete overview of all 60+ university short programmes, course fee structures, admission criteria, and academic timetables.'
  },
  {
    id: 'boc-voucher',
    title: 'Bank of Ceylon (BOC) Paying-in-Voucher Template',
    category: 'Payment Voucher',
    size: '320 KB',
    filename: 'boc-payment-voucher.pdf',
    desc: 'Official deposit slip for course payments to OUSL Collection Account 7417821 at any island-wide Bank of Ceylon branch.'
  },
  {
    id: 'student-handbook',
    title: 'Student By-Laws & Examination Code of Conduct',
    category: 'Policies & By-Laws',
    size: '1.2 MB',
    filename: 'student-code-of-conduct.pdf',
    desc: 'Regulatory framework governing student discipline, continuous assessments, laboratory compliance, and certificate issuance.'
  },
  {
    id: 'moodle-guide',
    title: 'OUSL Moodle LMS Student Quick-Start Manual',
    category: 'Online Learning',
    size: '2.1 MB',
    filename: 'moodle-quickstart-guide.pdf',
    desc: 'Step-by-step instructions on accessing digital day schools, submitting assignments online, and joining Zoom virtual sessions.'
  },
  {
    id: 'credit-transfer',
    title: 'Credit Transfer & Degree Progression Guidelines',
    category: 'Academic Pathway',
    size: '890 KB',
    filename: 'credit-transfer-pathway.pdf',
    desc: 'Guidance on transferring short course credits toward OUSL Advanced Certificates, Diplomas, and Undergraduate Degrees.'
  },
  {
    id: 'library-guide',
    title: 'Main Library Digital Catalog & E-Repository Guide',
    category: 'Library Services',
    size: '1.5 MB',
    filename: 'library-user-guide.pdf',
    desc: 'How to utilize the OPAC library system, access JSTOR/ScienceDirect electronic databases, and borrow reference materials.'
  }
]

// Escape characters that have a special meaning inside a PDF string
const pdfEscape = (text) => String(text).replace(/[\\()]/g, '\\$&')

// 1. GET /api/resources
router.get('/', (req, res) => {
  res.json({ success: true, resources: resourceDocuments })
})

// 2. GET /api/resources/download/:id
// Demo: returns a tiny placeholder PDF. Replace with real files when they exist.
router.get('/download/:id', (req, res) => {
  const item = resourceDocuments.find((d) => d.id === req.params.id)
  if (!item) {
    return res.status(404).json({ success: false, message: 'Document not found.' })
  }

  const title = pdfEscape(item.title)
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `attachment; filename="${item.filename}"`)

  const pdf =
    `%PDF-1.4\n` +
    `1 0 obj\n<< /Title (${title}) /Creator (The Open University of Sri Lanka) >>\nendobj\n` +
    `2 0 obj\n<< /Type /Catalog /Pages 3 0 R >>\nendobj\n` +
    `3 0 obj\n<< /Type /Pages /Kids [4 0 R] /Count 1 >>\nendobj\n` +
    `4 0 obj\n<< /Type /Page /Parent 3 0 R /MediaBox [0 0 612 792] /Contents 5 0 R >>\nendobj\n` +
    `5 0 obj\n<< /Length 80 >>\nstream\nBT\n/F1 18 Tf\n72 700 Td\n(The Open University of Sri Lanka - ${title}) Tj\nET\nendstream\nendobj\n` +
    `xref\n0 6\n0000000000 65535 f \n0000000010 00000 n \n0000000098 00000 n \n0000000148 00000 n \n0000000210 00000 n \n0000000302 00000 n \n` +
    `trailer\n<< /Size 6 /Root 2 0 R >>\nstartxref\n435\n%%EOF`

  res.send(Buffer.from(pdf))
})

export default router

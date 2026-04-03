import { jsPDF } from 'jspdf'

/**
 * Generate a professional PDF certificate for a credential.
 */
export const generatePDF = (credential, workerName) => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  const w = doc.internal.pageSize.getWidth()
  const h = doc.internal.pageSize.getHeight()

  // Background
  doc.setFillColor(248, 250, 252)
  doc.rect(0, 0, w, h, 'F')

  // Border
  doc.setDrawColor(37, 99, 235)
  doc.setLineWidth(2)
  doc.rect(10, 10, w - 20, h - 20, 'S')

  // Inner border
  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(0.5)
  doc.rect(15, 15, w - 30, h - 30, 'S')

  // Header
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(28)
  doc.setTextColor(15, 23, 42)
  doc.text('ROZGARID', w / 2, 35, { align: 'center' })

  doc.setFontSize(12)
  doc.setTextColor(71, 85, 105)
  doc.text('Self Sovereign Identity — Blockchain Verified Credential', w / 2, 43, { align: 'center' })

  // Decorative line
  doc.setDrawColor(37, 99, 235)
  doc.setLineWidth(1)
  doc.line(w / 2 - 40, 48, w / 2 + 40, 48)

  // Certificate title
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(14)
  doc.setTextColor(71, 85, 105)
  doc.text('This is to certify that', w / 2, 62, { align: 'center' })

  // Worker name
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(24)
  doc.setTextColor(15, 23, 42)
  doc.text(workerName || 'Worker', w / 2, 75, { align: 'center' })

  // Skill
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(14)
  doc.setTextColor(71, 85, 105)
  doc.text('has been awarded the following credential:', w / 2, 87, { align: 'center' })

  // Credential type + skill
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.setTextColor(37, 99, 235)
  doc.text(credential.skillName || credential.credentialType || 'Certification', w / 2, 100, { align: 'center' })

  // Grade
  if (credential.grade) {
    doc.setFontSize(16)
    doc.setTextColor(5, 150, 105)
    doc.text(`Grade: ${credential.grade}`, w / 2, 112, { align: 'center' })
  }

  // Details grid
  const details = [
    ['Credential Type', credential.credentialType?.replace(/([A-Z])/g, ' $1').trim() || '—'],
    ['Issue Date', credential.issueDate ? new Date(credential.issueDate).toLocaleDateString() : '—'],
    ['Expiry Date', credential.expiryDate ? new Date(credential.expiryDate).toLocaleDateString() : '—'],
    ['Status', credential.status || 'active'],
  ]

  doc.setFontSize(10)
  let yPos = 125
  details.forEach(([label, value]) => {
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(148, 163, 184)
    doc.text(label + ':', w / 2 - 40, yPos)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(15, 23, 42)
    doc.text(value, w / 2 + 10, yPos)
    yPos += 8
  })

  // DIDsand credential ID
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(148, 163, 184)
  if (credential.credentialId) {
    doc.text(`Credential ID: ${credential.credentialId}`, w / 2, h - 30, { align: 'center' })
  }
  if (credential.workerDid) {
    doc.text(`Holder DID: ${credential.workerDid}`, w / 2, h - 25, { align: 'center' })
  }
  if (credential.ipfsHash) {
    doc.text(`IPFS: ${credential.ipfsHash}`, w / 2, h - 20, { align: 'center' })
  }

  // Footer
  doc.setFontSize(8)
  doc.setTextColor(148, 163, 184)
  doc.text('Verified on Polygon Amoy Testnet • W3C Verifiable Credential Standard', w / 2, h - 14, { align: 'center' })

  // Save
  doc.save(`RozgarID_${credential.skillName || 'credential'}_${workerName || 'worker'}.pdf`)
}

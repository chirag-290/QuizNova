const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generate a PDF certificate
 * @param {Object} options - Certificate options
 * @param {String} options.userName - User's name
 * @param {String} options.examTitle - Exam title
 * @param {Number} options.score - User's score
 * @param {Number} options.totalMarks - Total possible marks
 * @param {Date} options.date - Certificate issue date
 * @returns {String} - Path to the generated certificate
 */
exports.generateCertificate = async (options,options1,score) => {
   console.log('Generating certificate with options:', options,options1);
  return new Promise((resolve, reject) => {
    try {
      
      const dir = path.join(__dirname, '../certificates');
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

       
      const filename = `certificate_${options.name.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
      const filePath = path.join(dir, filename);

       
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        layout: 'landscape'
      });

       
      doc.pipe(fs.createWriteStream(filePath));

    
      doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40)
         .stroke();

     
      doc.font('Helvetica-Bold')
         .fontSize(30)
         .text('CERTIFICATE OF ACHIEVEMENT', { align: 'center' })
         .moveDown(0.5);

      
     
      doc.font('Helvetica')
         .fontSize(16)
         .text('This is to certify that', { align: 'center' })
         .moveDown(0.5);

   
      doc.font('Helvetica-Bold')
         .fontSize(24)
         .text(options.userName, { align: 'center' })
         .moveDown(0.5);
 
      doc.font('Helvetica')
         .fontSize(16)
         .text('has successfully completed', { align: 'center' })
         .moveDown(0.5);

    
      doc.font('Helvetica-Bold')
         .fontSize(20)
         .text(options.examTitle, { align: 'center' })
         .moveDown(0.5);

  
      doc.font('Helvetica')
         .fontSize(16)
         .text(`with a score of ${score} out of ${options1.totalMarks}`, { align: 'center' })
         .moveDown(1);

         const date=new Date();
      
      const formattedDate = date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

      doc.text(`Awarded on ${formattedDate}`, { align: 'center' })
         .moveDown(2);

       doc.moveTo(doc.page.width / 2 - 100, doc.y)
         .lineTo(doc.page.width / 2 + 100, doc.y)
         .stroke();

      doc.moveDown(0.5)
         .fontSize(14)
         .text('Authorized Signature', { align: 'center' });

      
      doc.end();

       resolve(`/certificates/${filename}`);
    } catch (error) {
      reject(error);
    }
  });
};
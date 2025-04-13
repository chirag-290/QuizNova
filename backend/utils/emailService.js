const nodemailer = require('nodemailer');

/**
 * Send email using nodemailer
 * @param {Object} options - Email options
 * @param {String} options.email - Recipient email
 * @param {String} options.subject - Email subject
 * @param {String} options.message - Email body text
 * @param {String} options.html - Email HTML content (optional)
 */
exports.sendEmail = async (options) => {
  console.log('Sending email with options:', options.email);  
   
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });

 
  const mailOptions = {
    from: `'Quicknova' <${process.env.EMAIL_FROM}>`,
    to: options.email,
    subject: `Congratulations ${options.name}! You passed the ${options.title} exam - Quicknova`,
    html: `
      <h2>🎉 Congratulations, ${options.name}!</h2>
      <p>We're thrilled to inform you that you have <strong>successfully passed</strong> your exam:</p>
      <ul>
        <li><strong>Exam Title:</strong> ${options.title}</li>
        <li><strong>Score:</strong> ${options.score}%</li>
        <li><strong>Status:</strong> ${options.passed ? "Passed" : "Failed"}</li>
      </ul>

      ${options.certificateUrl ? `
      <p>You can download your certificate from the following link:</p>
      <p><a href="https://examportal-1-f1qy.onrender.com${options.certificateUrl}" target="_blank">🎓 Download Certificate</a></p>
      ` : ""}

      <p>Keep up the great work and continue learning!</p>
      <p>Best wishes,</p>
      <p><strong>Quicknova Team</strong></p>
    `,
  };

  // Send email
  const info = await transporter.sendMail(mailOptions);

  console.log(`Email sent: ${info.messageId}`);
};

/**
 * Send exam reminder email
 * @param {String} email - Recipient email
 * @param {String} name - Recipient name
 * @param {Object} exam - Exam details
 */
exports.sendExamReminder = async (email, name, exam) => {
  const subject = `Reminder: ${exam.title} starts in 24 hours`;
  const message = `
    Dear ${name},

    This is a friendly reminder that your exam "${exam.title}" is scheduled to start in 24 hours.

    Exam Details:
    - Title: ${exam.title}
    - Start Date: ${new Date(exam.startDate).toLocaleString()}
    - Duration: ${exam.duration} minutes
    - Total Marks: ${exam.totalMarks}
    - Passing Score: ${exam.passingScore}

    Please ensure you have a stable internet connection and a quiet environment for your exam.

    Good luck!

    Best regards,
    Online Exam Platform Team
  `;

  await this.sendEmail({
    email,
    subject,
    message
  });
};
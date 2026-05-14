const nodemailer = require('nodemailer')

// Create transport
const createTransport = ()=>{
    return nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            }
})
}

// Send email
const sendMail = async (to,subject,html)=>{
    try {
        const transporter = createTransport()

        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: to,
            subject: subject,
            html: html
        })

        console.log('Email sent ',info.messageId)
        return {
            success: true,
            messageId: info.messageId
        }
    } catch (error) {
        console.error('Email error ',error)
        return {
            success: false,
            message: 'Failed to send email'
        }
    }
}

// Vendor Approval Email

const sendVendorApprovalEmail = async (email,shopName) => {
    const html = `<body style="margin:0;padding:0;background-color:#f4f6f8;font-family:Arial,sans-serif"><table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;padding:40px;box-shadow:0 2px 10px rgba(0,0,0,.05)"><tr><td align="center" style="padding-bottom:20px"><h2 style="margin:0;color:#2c3e50">Vendor Approved!</h2></td></tr><tr><td style="color:#555;font-size:15px;line-height:24px"><p style="margin:0 0 15px 0">Dear<strong>${shopName}</strong>,</p><p style="margin:0 0 15px 0">Congratulations! Your vendor account has been successfully approved. You can now access your dashboard and start managing your products and orders.</p><p style="margin:0 0 25px 0">Click the button below to login and get started:</p><div style="text-align:center;margin-bottom:30px"><a href="${process.env.FRONTEND_URL}" style="background-color:#2563eb;color:#fff;text-decoration:none;padding:12px 25px;border-radius:5px;display:inline-block;font-weight:700">Go to Dashboard</a></div><p style="margin:0">If you have any questions, feel free to contact our support team.</p><p style="margin:20px 0 0 0">Best Regards,<br><strong>Multi Commerce</strong></p></td></tr></table><table width="600" cellpadding="0" cellspacing="0" style="margin-top:20px"><tr><td align="center" style="font-size:12px;color:#999">© ${new Date().getFullYear()} Your Company. All rights reserved.</td></tr></table></td></tr></table></body>`

    await sendMail(email,'Vendor Approval Mail',html)
}


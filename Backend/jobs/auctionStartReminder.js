import cron from 'node-cron';
import Product from '../models/Product.js';
import User from '../models/user.js';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Run every minute to check for upcoming auctions
cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();
    // Look for auctions starting in the next 5-6 minutes
    const fiveMinsFromNow = new Date(now.getTime() + 5 * 60000);
    const sixMinsFromNow = new Date(now.getTime() + 6 * 60000);

    // Find products where at least one user hasn't been notified yet
    const upcomingAuctions = await Product.find({
      startTime: { $gte: fiveMinsFromNow, $lt: sixMinsFromNow },
      status: "Scheduled",
      "registeredUsers.isNotified": false // Only fetch if there are pending notifications
    });

    for (const product of upcomingAuctions) {
      console.log(`Processing notifications for: ${product.title}`);

      // Loop through each registered user
      for (let i = 0; i < product.registeredUsers.length; i++) {
        const registration = product.registeredUsers[i];

        // 🛡️ CHECK: Only send if they WANT it AND haven't GOT it yet
        if (registration.notifyOnStart && !registration.isNotified) {
          const user = await User.findById(registration.userId);

          if (user && user.email) {
            try {
              await transporter.sendMail({
                from: `"BidMaster Pro" <${process.env.EMAIL_USER}>`,
                to: user.email,
                subject: `⏰ 5 MINS TO GO: ${product.title}`,
                html: `
                  <div style="font-family: sans-serif; padding: 20px; border: 1px solid #3b82f6; border-radius: 10px;">
                    <h2 style="color: #1e293b;">Almost Time, ${user.firstName}!</h2>
                    <p>The auction for <strong>${product.title}</strong> starts in 5 minutes.</p>
                    <p><strong>Starting Price:</strong> ₹${product.startingPrice}</p>
                    <div style="margin-top: 20px;">
                      <a href="${process.env.FRONTEND_URL}/products/${product._id}" 
                         style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                         Enter Auction Room
                      </a>
                    </div>
                  </div>
                `
              });

              // ✅ Mark THIS specific user as notified in the array
              product.registeredUsers[i].isNotified = true;
              console.log(`Email sent to ${user.email}`);

            } catch (mailError) {
              console.error(`Failed to send email to ${user.email}:`, mailError);
            }
          }
        }
      }

      // Save the product document after updating all 'isNotified' flags for this auction
      await product.save();
    }
  } catch (error) {
    console.error("Cron Job Execution Error:", error);
  }
});
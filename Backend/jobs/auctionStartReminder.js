import cron from 'node-cron';
import Product from '../models/products.js';
import User from '../models/user.js';
import Bid from '../models/Bid.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// --- MAIL CONFIGURATION ---
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendAuctionLiveEmail = async (user, product) => {
  return transporter.sendMail({
    from: `"BidMaster Pro" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: `🚀 LIVE NOW: Bidding is open for ${product.title}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 24px; overflow: hidden; background: #ffffff;">
        <div style="background: #2563eb; padding: 40px; text-align: center; color: white;">
          <h1 style="margin:0; font-size: 24px; font-weight: 900;">BidMaster<span style="opacity:0.7;">.</span></h1>
        </div>
        <div style="padding: 40px; color: #1e293b; line-height: 1.6;">
          <div style="background: #dcfce7; color: #166534; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 800; display: inline-block; letter-spacing: 1px;">AUCTION LIVE</div>
          <h2 style="margin-top: 15px; font-size: 20px;">It's time to place your bids!</h2>
          <p>The wait is over. <strong>${product.title}</strong> is now officially open for bidding.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/products/${product._id}" style="background: #2563eb; color: #ffffff !important; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: bold; display: inline-block;">Go to Auction Room</a>
          </div>
        </div>
      </div>`
  });
};

/* ============================================================
   PROFESSIONAL EMAIL TEMPLATES
============================================================ */

// 1. 5-MINUTE WARNING (For Registered Users)
const sendReminderEmail = async (user, product) => {
  return transporter.sendMail({
    from: `"BidMaster Pro" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: `⏰ 5 MINS TO GO: ${product.title}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 24px; overflow: hidden; background: #ffffff;">
        <div style="background: #2563eb; padding: 40px; text-align: center; color: white;">
          <h1 style="margin:0; font-size: 24px; font-weight: 900;">BidMaster<span style="opacity:0.7;">.</span></h1>
        </div>
        <div style="padding: 40px; color: #1e293b; line-height: 1.6;">
          <div style="background: #fee2e2; color: #ef4444; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 800; display: inline-block; letter-spacing: 1px;">STARTING SOON</div>
          <h2 style="margin-top: 15px; font-size: 20px;">The auction begins shortly!</h2>
          <p>Get your bids ready. <strong>${product.title}</strong> will be open for bidding in exactly 5 minutes.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/products/${product._id}" style="background: #2563eb; color: #ffffff !important; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: bold; display: inline-block;">Enter Auction Room</a>
          </div>
        </div>
      </div>`
  });
};

// 2. WINNER NOTIFICATION (For the High Bidder)
const sendWinnerEmail = async (user, product) => {
  return transporter.sendMail({
    from: `"BidMaster Pro" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: `🏆 YOU WON! ${product.title}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 24px; overflow: hidden; background: #ffffff;">
        <div style="background: #059669; padding: 50px 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 32px; font-weight: 900;">Congratulations!</h1>
          <p style="font-size: 18px; opacity: 0.9; margin-top: 10px;">You are the winning bidder.</p>
        </div>
        <div style="padding: 40px; color: #1e293b; line-height: 1.6;">
          <p>Hi <strong>${user.firstName}</strong>,</p>
          <p>The auction for <strong>${product.title}</strong> has officially closed, and your bid was the highest.</p>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 25px; border-radius: 16px; margin: 30px 0; text-align: center;">
            <div style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 800; letter-spacing: 1px; margin-bottom: 8px;">Final Hammer Price</div>
            <div style="font-size: 32px; font-weight: 900; color: #059669;">₹${product.currentBid.toLocaleString()}</div>
          </div>
          <div style="text-align: center; margin: 40px 0;">
            <a href="${process.env.FRONTEND_URL}/checkout/${product._id}" style="background: #1e293b; color: #ffffff !important; padding: 18px 40px; text-decoration: none; border-radius: 14px; font-weight: 800; display: inline-block;">Complete Purchase</a>
          </div>
        </div>
      </div>`
  });
};

// 3. OUTBID NOTIFICATION (For Losers)
const sendOutbidEmail = async (user, product) => {
  return transporter.sendMail({
    from: `"BidMaster Pro" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: `Update: Auction for ${product.title} has closed`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 24px; overflow: hidden; background: #ffffff;">
        <div style="background: #64748b; padding: 40px 30px; text-align: center; color: white;">
          <h2 style="margin: 0; font-size: 24px; font-weight: 800;">Auction Closed</h2>
        </div>
        <div style="padding: 40px; color: #1e293b; line-height: 1.6;">
          <p>Hi ${user.firstName},</p>
          <p>The bidding period for <strong>${product.title}</strong> has concluded. Unfortunately, another participant placed a higher final bid.</p>
          <p>Don't worry, your next great find is just a bid away!</p>
          <div style="text-align: center; margin: 40px 0;">
            <a href="${process.env.FRONTEND_URL}/products" style="background: #2563eb; color: #ffffff !important; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: 800; display: inline-block;">Browse New Auctions</a>
          </div>
        </div>
      </div>`
  });
};

// 4. PAYMENT EXPIRED (For the failing Buyer)
const sendPaymentExpiredEmail = async (user, product) => {
  return transporter.sendMail({
    from: `"BidMaster Pro" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: `⚠️ NOTICE: Your order for ${product.title} has been cancelled`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 24px; overflow: hidden; background: #ffffff;">
        <div style="background: #ef4444; padding: 40px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 24px;">Payment Window Expired</h1>
        </div>
        <div style="padding: 40px; color: #1e293b; line-height: 1.6;">
          <p>Hi <strong>${user.firstName}</strong>,</p>
          <p>The 24-hour payment window for <strong>${product.title}</strong> has expired. As a result, your winning status has been revoked and the item has been re-listed.</p>
          <div style="background: #fef2f2; border: 1px solid #fee2e2; padding: 15px; border-radius: 12px; margin: 20px 0; color: #991b1b; font-size: 13px;">
             <strong>Policy Note:</strong> Repeated failure to pay can lead to account suspension.
          </div>
        </div>
      </div>`
  });
};

// 5. RE-AUCTION NOTICE (For the Seller)
const sendReAuctionEmail = async (seller, product) => {
  return transporter.sendMail({
    from: `"BidMaster Pro" <${process.env.EMAIL_USER}>`,
    to: seller.email,
    subject: `Update: Your item "${product.title}" is being re-listed`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 24px; overflow: hidden; background: #ffffff;">
        <div style="background: #f59e0b; padding: 40px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 24px;">Item Re-Listed</h1>
        </div>
        <div style="padding: 40px; color: #1e293b; line-height: 1.6;">
          <p>Hi <strong>${seller.firstName}</strong>,</p>
          <p>The winning bidder for <strong>${product.title}</strong> failed to complete payment within 24 hours. We have automatically moved your product back to the active auction pool.</p>
        </div>
      </div>`
  });
};

/* ============================================================
   CONSOLIDATED CRON JOB: RUNS EVERY 60 SECONDS
============================================================ */
cron.schedule('* * * * *', async () => {
  const now = new Date();
  
  // Timer logic for 5-min notification
  const fiveMinsFromNow = new Date(now.getTime() + 5 * 60000);
  const sixMinsFromNow = new Date(now.getTime() + 6 * 60000);
  
  // Timer logic for 24-hour timeout
  const timeoutLimit = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  console.log(`[CRON] System Check: ${now.toISOString()}`);

  try {
    /* --- PART 1: START AUCTIONS (Scheduled -> Active) --- */
    const toStart = await Product.find({
      startTime: { $lte: now },
      status: "Scheduled"
    });

    for (const product of toStart) {
      console.log(`[START] Firing up auction: ${product.title}`);
      
      // 1. Flip status to Active
      product.status = "Active";
      await product.save();

      // 2. Notify all registered users that it is LIVE
      for (const reg of product.registeredUsers) {
        const user = await User.findById(reg.userId);
        if (user) await sendAuctionLiveEmail(user, product);
      }
      console.log(`[SUCCESS] ${product.title} is now live and users notified.`);
    }

    /* --- PART 2: 5-MINUTE REMINDERS --- */
    const upcoming = await Product.find({
      startTime: { $gte: fiveMinsFromNow, $lt: sixMinsFromNow },
      status: "Scheduled"
    });

    for (const product of upcoming) {
      console.log(`[REMINDER] Sending 5-min warning for: ${product.title}`);
      for (let i = 0; i < product.registeredUsers.length; i++) {
        const reg = product.registeredUsers[i];
        if (reg.notifyOnStart && !reg.isNotified) {
          const user = await User.findById(reg.userId);
          if (user) {
            // (Call sendReminderEmail here)
            product.registeredUsers[i].isNotified = true;
          }
        }
      }
      await product.save();
    }

    /* --- PART 3: END AUCTIONS (Active -> Sold/Ended) --- */
    const finished = await Product.find({
      endTime: { $lte: now },
      status: "Active"
    });

    for (const product of finished) {
      console.log(`[ENDING] Closing: ${product.title}`);
      product.status = product.winnerId ? "Sold" : "Ended";
      await product.save();

      if (product.winnerId) {
        const winner = await User.findById(product.winnerId);
        if (winner) await sendWinnerEmail(winner, product);

        const participantIds = await Bid.find({ productId: product._id, bidderId: { $ne: product.winnerId } }).distinct("bidder");
        const losers = await User.find({ _id: { $in: participantIds } });
        for (const loser of losers) await sendOutbidEmail(loser, product);
      }
    }

    /* --- PART 4: 24-HOUR PAYMENT TIMEOUT --- */
    const unpaid = await Product.find({
      status: "Sold",
      paymentStatus: "Pending",
      updatedAt: { $lte: timeoutLimit }
    });

    for (const product of unpaid) {
      console.log(`[TIMEOUT] Re-Auctioning: ${product.title}`);
      
      const failedBuyer = await User.findById(product.winnerId);
      const seller = await User.findById(product.sellerId);

      product.status = "Scheduled"; // Moves it back to upcoming
      product.winnerId = null;
      product.paymentStatus = "Pending";
      await product.save();

      if (failedBuyer) await sendPaymentExpiredEmail(failedBuyer, product);
      if (seller) await sendReAuctionEmail(seller, product);
    }

  } catch (error) {
    console.error("[CRON FATAL ERROR]", error);
  }
})
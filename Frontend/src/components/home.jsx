import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="bg">
      <div className="min-h-screen flex flex-col">

        {/* Navbar */}
        <nav className="bg-blue-600 text-white px-4 sm:px-8 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between inter-comman">
          <h1 className="text-xl sm:text-2xl font-bold text-center archivo-black-regular sm:text-left">
            Online Bidding System
          </h1>

          <div className="flex justify-center sm:justify-end gap-3 mt-3 sm:mt-0">
            <Link to="/login">
              <button className="bg-white text-blue-600 px-6 py-2 rounded hover:bg-gray-200 text-sm sm:text-base">
                Login
              </button>
            </Link>
            <Link to="/register">
              <button className="border border-white px-4 py-2 rounded hover:bg-blue-700 text-sm sm:text-base">
                Register
              </button>
            </Link>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="px-4 py-16 sm:py-24 bg-gradient-to-br from-blue-200 to-indigo-300 inter-comman text-blue-800 text-center">
          <h2 className="text-2xl sm:text-4xl font-bold archivo-black-regular mb-4">
            Welcome to Online Bidding System
          </h2>

          <p className="mb-6 text-sm sm:text-base max-w-xl mx-auto">
            A secure, fast, and easy platform to participate in online auctions and
            place bids in real time from any device.
          </p>

          <Link to="/login">
            <button className="bg-white text-blue-600 px-6 py-3 rounded-lg hover:bg-gray-200 transition text-sm sm:text-base">
              Get Started
            </button>
          </Link>
        </section>

        {/* Features */}
        <section className="px-4 sm:px-8 py-12 inter-comman text-blue-800">
          <h3 className="text-xl sm:text-2xl font-semibold archivo-black-regular text-center mb-8">
            Platform Features
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto">

            {[
              {
                title: "Live Bidding",
                img: "./liveBid.png",
                desc: "Participate in real-time auctions with instant updates."
              },
              {
                title: "Secure System",
                img: "./secureSystem.png",
                desc: "User data is protected using secure authentication."
              },
              {
                title: "Mobile Friendly",
                img: "./mobileFriendly.png",
                desc: "Fully responsive design that works on all screen sizes."
              },
              {
                title: "Easy Access",
                img: "./accessAbility.png",
                desc: "Access auctions and bid from anywhere, anytime."
              },
              {
                title: "Limited Bidders",
                img: "./limitedBidders.png",
                desc: "Control the number of bidders in each auction."
              },
              {
                title: "Scheduled Auctions",
                img: "./ScheduledAuction.png",
                desc: "Schedule auctions for specific dates and times."
              },
              {
                title: "Online Delivery",
                img: "./OnlineDelivery.png",
                desc: "Track and manage delivery of auction items."
              },
              {
                title: "Payment Gateway",
                img: "./paymentGateway.png",
                desc: "Secure and seamless payment processing."
              },
              {
                title: "Discounts",
                img: "./discount.png",
                desc: "Enjoy special discounts for loyal users."
              }
            ].map((item, index) => (
              <div
                key={index}
                className="group overflow-hidden rounded-xl border shadow transition-all duration-300 
                           hover:shadow-2xl hover:-translate-y-2 hover:bg-gradient-to-br from-blue-200 to-indigo-300 cursor-pointer"
              >
                {/* Image */}
                <div className="overflow-hidden">
                  <img
                    src={item.img}
                    alt={item.title}
                    className="w-full h-40 object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>

                {/* Content */}
                <div className="p-5 text-center">
                  <h4 className="font-bold mb-2 group-hover:text-blue-700 transition">
                    {item.title}
                  </h4>
                  <p className="text-gray-600 text-sm group-hover:text-gray-700 transition">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}

          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-800 text-white text-center py-3 text-xs sm:text-sm mt-auto">
          © 2026 Online Bidding System. All rights reserved.
        </footer>

      </div>
    </div>
  );
};

export default Home;

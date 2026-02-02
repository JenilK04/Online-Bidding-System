import React from "react";
import {Link} from 'react-router-dom';

const Home = () => {
  return (
    <div className="bg" >
        <div className="min-h-screen flex flex-col">

        {/* Navbar */}
        <nav className="bg-blue-600 text-white px-4 sm:px-8 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between inter-comman">
            <h1 className="text-xl sm:text-2xl font-bold text-center archivo-black-regular sm:text-left">
            Online Bidding System
            </h1>

            <div className="flex justify-center sm:justify-end gap-3 mt-3 sm:mt-0">
            <Link to="/login" className="text-white hover:text-blue-200">
                <button className="bg-white text-blue-600 px-6 py-2 rounded hover:bg-gray-200 text-sm sm:text-base">
                    Login
                </button>
            </Link>
            <Link    to="/register" className="text-white hover:text-blue-200">
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

        <button className="bg-white text-blue-600 px-6 py-3 rounded-lg hover:bg-gray-200 transition text-sm sm:text-base">
            Get Started
        </button>
        </section>


        {/* Features */}
        <section className="px-4 sm:px-8 py-12 inter-comman text-blue-800">
            <h3 className="text-xl sm:text-2xl font-semibold archivo-black-regular text-center mb-8">
            Platform Features
            </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto">

    {/* Live Bidding */}
            <div className="p-6 border rounded-lg text-center shadow">
                <img
                src="https://cdn-icons-png.flaticon.com/512/2921/2921222.png"
                alt="Live Bidding"
                className="w-16 h-16 mx-auto mb-4"
                />
                <h4 className="font-bold mb-2">Live Bidding</h4>
                <p className="text-gray-600 text-sm">
                Participate in real-time auctions with instant updates.
                </p>
            </div>

            {/* Secure System */}
            <div className="p-6 border rounded-lg text-center shadow">
                <img
                src="https://cdn-icons-png.flaticon.com/512/3064/3064197.png"
                alt="Secure System"
                className="w-16 h-16 mx-auto mb-4"
                />
                <h4 className="font-bold mb-2">Secure System</h4>
                <p className="text-gray-600 text-sm">
                User data is protected using secure authentication.
                </p>
            </div>

            {/* Mobile Friendly */}
            <div className="p-6 border rounded-lg text-center shadow">
                <img
                src="https://cdn-icons-png.flaticon.com/512/545/545245.png"
                alt="Mobile Friendly"
                className="w-16 h-16 mx-auto mb-4"
                />
                <h4 className="font-bold mb-2">Mobile Friendly</h4>
                <p className="text-gray-600 text-sm">
                Fully responsive design that works on all screen sizes.
                </p>
            </div>

            {/* Easy Access */}
            <div className="p-6 border rounded-lg text-center shadow">
                <img
                src="https://cdn-icons-png.flaticon.com/512/1047/1047711.png"
                alt="Easy Access"
                className="w-16 h-16 mx-auto mb-4"
                />
                <h4 className="font-bold mb-2">Easy Access</h4>
                <p className="text-gray-600 text-sm">
                Access auctions and bid from anywhere, anytime.
                </p>
            </div>

            {/* Limited Bidders */}
            <div className="p-6 border rounded-lg text-center shadow">
                <img
                src="https://cdn-icons-png.flaticon.com/512/1077/1077114.png"
                alt="Limited Bidders"
                className="w-16 h-16 mx-auto mb-4"
                />
                <h4 className="font-bold mb-2">Limited Bidders</h4>
                <p className="text-gray-600 text-sm">
                Control the number of bidders in each auction.
                </p>
            </div>

            {/* Scheduled Auctions */}
            <div className="p-6 border rounded-lg text-center shadow">
                <img
                src="https://cdn-icons-png.flaticon.com/512/747/747310.png"
                alt="Scheduled Auctions"
                className="w-16 h-16 mx-auto mb-4"
                />
                <h4 className="font-bold mb-2">Scheduled Auctions</h4>
                <p className="text-gray-600 text-sm">
                Schedule auctions for specific dates and times.
                </p>
            </div>

            {/* Online Delivery */}
            <div className="p-6 border rounded-lg text-center shadow">
                <img
                src="https://cdn-icons-png.flaticon.com/512/679/679720.png"
                alt="Online Delivery"
                className="w-16 h-16 mx-auto mb-4"
                />
                <h4 className="font-bold mb-2">Online Delivery</h4>
                <p className="text-gray-600 text-sm">
                Track and manage delivery of auction items.
                </p>
            </div>

            {/* Payment Gateway */}
            <div className="p-6 border rounded-lg text-center shadow">
                <img
                src="https://cdn-icons-png.flaticon.com/512/2331/2331941.png"
                alt="Payment Gateway"
                className="w-16 h-16 mx-auto mb-4"
                />
                <h4 className="font-bold mb-2">Online Payment Gateway</h4>
                <p className="text-gray-600 text-sm">
                Secure and seamless payment processing.
                </p>
            </div>

            {/* Discount */}
            <div className="p-6 border rounded-lg text-center shadow">
                <img
                src="https://cdn-icons-png.flaticon.com/512/891/891462.png"
                alt="Discount"
                className="w-16 h-16 mx-auto mb-4"
                />
                <h4 className="font-bold mb-2">Discount for Regular Users</h4>
                <p className="text-gray-600 text-sm">
                Enjoy special discounts for loyal users.
                </p>
            </div>

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

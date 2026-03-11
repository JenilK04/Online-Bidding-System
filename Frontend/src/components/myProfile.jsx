import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import API from "../services/api";

const Profile = () => {

  const [profile,setProfile] = useState(null);

useEffect(() => {
  const fetchProfile = async () => {
    try {
      const res = await API.get("/profile");
      setProfile(res.data);
    } catch (err) {
      console.error("Profile load error", err);
    }
  };
  
  fetchProfile();
}, []);

  if(!profile){
    return (
      <>
      <div className="min-h-screen bg">
      <Navbar/>
      <p className="text-center mt-20 text-gray-600">
        Loading profile...
      </p>
      </div>
      </>
    );
  }

  return (
    <>
      <Navbar/>

      <div className="min-h-screen bg px-6 py-10">

        <div className="max-w-6xl mx-auto">

          {/* PROFILE CARD */}

          <div className="bg-white rounded-xl shadow-md p-6 mb-10">

            <h2 className="text-2xl font-bold text-blue-800 mb-4">
              My Profile
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">

              <p>
                <span className="font-semibold">Name:</span>{" "}
                {profile.user.firstName} {profile.user.lastName}
              </p>

              <p>
                <span className="font-semibold">Email:</span>{" "}
                {profile.user.email}
              </p>

              <p>
                <span className="font-semibold">Mobile:</span>{" "}
                {profile.user.mobile || "Not added"}
              </p>

              <p>
                <span className="font-semibold">Address:</span>{" "}
                {profile.user.address || "Not added"}
              </p>

            </div>

          </div>

          {/* WON AUCTIONS */}

          <section className="mb-10">

            <h3 className="text-xl font-semibold mb-4 text-blue-800">
              Auctions I Won:
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">

              {profile.wonProducts.map((p)=>(
                <div
                  key={p._id}
                  className="bg-white rounded-xl shadow hover:shadow-lg transition p-4"
                >

                  <img
                    src={p.images?.[0]}
                    className="w-full h-40 object-contain mb-3"
                  />

                  <h4 className="font-semibold text-gray-800">
                    {p.title}
                  </h4>

                  <p className="text-sm text-gray-600">
                    Winning Bid: ₹{p.currentBid}
                  </p>

                  <button className="mt-3 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
                    Pay Now
                  </button>

                </div>
              ))}

            </div>

          </section>


          {/* MY SOLD PRODUCTS */}

          <section className="mb-10">

            <h3 className="text-xl font-semibold mb-4 text-blue-800">
              My Sold Products
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">

              {profile.myProducts.map((p)=>(
                <div
                  key={p._id}
                  className="bg-white rounded-xl shadow hover:shadow-lg transition p-4"
                >

                  <img
                    src={p.images?.[0]}
                    className="w-full h-40 object-contain mb-3"
                  />

                  <h4 className="font-semibold text-gray-800">
                    {p.title}
                  </h4>

                  <p className="text-sm text-gray-600">
                    Status: {p.deliveryStatus}
                  </p>

                  <button className="mt-3 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                    Ship Product
                  </button>

                </div>
              ))}

            </div>

          </section>


          {/* REGISTERED AUCTIONS */}

          <section>

            <h3 className="text-xl font-semibold mb-4 text-blue-800">
              Registered Auctions
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">

              {profile.registeredProducts.map((p)=>(
                <div
                  key={p._id}
                  className="bg-white rounded-xl shadow hover:shadow-lg transition p-4"
                >

                  <img
                    src={p.images?.[0]}
                    className="w-full h-40 object-contain mb-3"
                  />

                  <h4 className="font-semibold text-gray-800">
                    {p.title}
                  </h4>

                  <p className="text-sm text-gray-600">
                    Status: {p.status}
                  </p>

                </div>
              ))}

            </div>

          </section>

        </div>

      </div>
    </>
  );

};

export default Profile;
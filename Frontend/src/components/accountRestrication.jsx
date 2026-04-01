// // src/pages/AccountRestricted.jsx
// import { FiSlash, FiAlertCircle, FiLogOut } from "react-icons/fi";
// import { useAuth } from "../context/authContext";

// const AccountRestricted = () => {
//   const { user, logout } = useAuth();

//   const isSuspended = user?.status === "suspended";

//   return (
//     <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-white text-center">
//       <div className="max-w-md w-full">
//         <div className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center mb-8 shadow-2xl ${isSuspended ? 'bg-red-500 shadow-red-500/20' : 'bg-orange-500 shadow-orange-500/20'}`}>
//           {isSuspended ? <FiSlash size={40} /> : <FiAlertCircle size={40} />}
//         </div>

//         <h1 className="text-4xl font-black uppercase tracking-tighter mb-4">
//           Account {user?.status}
//         </h1>

//         <p className="text-slate-400 font-medium leading-relaxed mb-10">
//           {isSuspended 
//             ? "Your access to BidMaster Pro has been permanently revoked due to a violation of our bidding policies."
//             : "Your account is currently inactive. To prevent fraudulent bidding, inactive accounts must be reactivated by an admin."}
//         </p>

//         <div className="space-y-4">
//           <button className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-200 transition-all">
//             Contact Support
//           </button>
//           <button onClick={logout} className="w-full py-4 bg-slate-800 text-slate-400 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-red-500/10 hover:text-red-400 transition-all flex items-center justify-center gap-2">
//             <FiLogOut /> Logout Securely
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AccountRestricted;
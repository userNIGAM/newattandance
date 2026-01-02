// /* eslint-disable no-unused-vars */
// import { useState } from "react";
// import { motion } from "framer-motion";
// import {
//   Mail,
//   User,
//   Phone,
//   MapPin,
//   Hash,
//   GraduationCap,
//   CheckCircle,
//   Loader2,
// } from "lucide-react";
// import "../../index.css";
// import axios from "axios";
// import RegisterForm from "./"; // Import the RegisterForm component

// const semesterFaculties = ["BCA", "CSIT", "BBA", "BITM"];
// const yearlyFaculties = ["BSC", "BBS", "BA", "BSW"];

// const Register = () => {
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     faculty: "",
//     semester: "",
//     rollno: "",
//     contact: "",
//     address: "",
//     year: "",
//   });

//   const [errors, setErrors] = useState({});
//   const [submitted, setSubmitted] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [touched, setTouched] = useState({});

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!validateAll()) return;

//     setIsSubmitting(true);

//     try {
//       const result = await axios.post(
//         "http://localhost:5000/api/register",
//         formData
//       );

//       console.log("Registration successful:", result.data);

//       setSubmitted(true);

//       setTimeout(() => {
//         setFormData({
//           name: "",
//           email: "",
//           faculty: "",
//           semester: "",
//           rollno: "",
//           contact: "",
//           address: "",
//           year: "",
//         });
//         setTouched({});
//         setErrors({});
//         setIsSubmitting(false);
//       }, 3000);
//     } catch (error) {
//       console.error("Failed to register the user:", error);
//       setErrors((prev) => ({
//         ...prev,
//         submit: "Failed to submit form. Please try again.",
//       }));
//       setIsSubmitting(false);
//     }
//   };

//   const resetForm = () => {
//     setFormData({
//       name: "",
//       email: "",
//       faculty: "",
//       semester: "",
//       rollno: "",
//       contact: "",
//       address: "",
//       year: "",
//     });
//     setErrors({});
//     setTouched({});
//     setSubmitted(false);
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-500 to-slate-300 p-4 md:p-6">
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//         className="w-full max-w-3xl rounded-2xl bg-white shadow-xl border border-slate-200 p-6 md:p-10"
//       >
//         <div className="flex justify-between items-center mb-8">
//           <h1 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-3">
//             <div className="p-2 bg-slate-900 text-white rounded-lg">
//               <GraduationCap className="w-6 h-6 md:w-7 md:h-7" />
//             </div>
//             College Registration Form
//           </h1>

//           {!submitted && (
//             <button
//               onClick={resetForm}
//               type="button"
//               className="text-sm text-slate-500 hover:text-slate-700 px-3 py-1 border border-slate-300 rounded-lg hover:border-slate-400 transition-colors"
//             >
//               Reset
//             </button>
//           )}
//         </div>

//         {submitted && (
//           <motion.div
//             initial={{ opacity: 0, scale: 0.9 }}
//             animate={{ opacity: 1, scale: 1 }}
//             className="mb-6 flex items-center gap-3 text-green-700 bg-green-50 border border-green-200 px-4 py-3 rounded-xl"
//           >
//             <CheckCircle className="w-5 h-5 shrink-0" />
//             <div>
//               <p className="font-medium">Registration Successful!</p>
//               <p className="text-sm text-green-600 mt-1">
//                 A confirmation email has been sent to {formData.email}
//               </p>
//             </div>
//           </motion.div>
//         )}

//         <RegisterForm
//           formData={formData}
//           setFormData={setFormData}
//           errors={errors}
//           setErrors={setErrors}
//           touched={touched}
//           setTouched={setTouched}
//           submitted={submitted}
//           isSubmitting={isSubmitting}
//           handleSubmit={handleSubmit}
//           semesterFaculties={semesterFaculties}
//           yearlyFaculties={yearlyFaculties}
//         />
//       </motion.div>
//     </div>
//   );
// };

// export default Register;
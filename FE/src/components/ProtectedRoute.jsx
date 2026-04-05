// import { Navigate } from 'react-router-dom';

// const ProtectedRoute = ({ children, allowedRoles }) => {
//   const user = JSON.parse(localStorage.getItem('user'));

//   // Nếu chưa đăng nhập, đá về trang Login
//   if (!user) {
//     return <Navigate to="/login" replace />;
//   }

//   // Nếu role không phù hợp, đá về trang Home
//   if (!allowedRoles.includes(user.role)) {
//     return <Navigate to="/home" replace />;
//   }

//   return children;
// };

// export default ProtectedRoute;
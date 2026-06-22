
// import "./Sidebar.css";
// import { NavLink } from "react-router-dom";
// import { useState } from "react";

// const Sidebar = () => {
//   const [customerMenu, setCustomerMenu] = useState(false);

//   return (
//     <div className="sidebar">
//       <div className="sidebar-title">
//         <h3>Menu</h3>
//       </div>

//       <ul className="sidebar-menu">
//         <li>
//           <NavLink
//             to="/admin/dashboard"
//             className={({ isActive }) => (isActive ? "active" : "")}
//           >
//             Dashboard
//           </NavLink>
//         </li>

//         {/* Parent Menu */}
//         <li>
//           <div
//             className="menu-parent"
//             onClick={() => setCustomerMenu(!customerMenu)}
//           >
//             Manage Customers
//             <span>{customerMenu ? "▲" : "▼"}</span>
//           </div>

//           {customerMenu && (
//             <ul className="submenu">
//               <li>
//                 <NavLink
//                   to="/admin/addcustomers"
//                   className={({ isActive }) =>
//                     isActive ? "active-submenu" : ""
//                   }
//                 >
//                   Add Customer
//                 </NavLink>
//               </li>

//               <li>
//                 <NavLink
//                   to="/admin/listcustomers"
//                   className={({ isActive }) =>
//                     isActive ? "active-submenu" : ""
//                   }
//                 >
//                   List of Customers
//                 </NavLink>
//               </li>

//             </ul>
//           )}
//         </li>

//         <li>
//           <NavLink
//             to="/admin/reports"
//             className={({ isActive }) => (isActive ? "active" : "")}
//           >
//             List of Quotations
//           </NavLink>
//         </li>
//       </ul>
//     </div>
//   );
// };

// export default Sidebar;



import "./Sidebar.css";
import { NavLink } from "react-router-dom";
import { useState } from "react";

const Sidebar = () => {
  const [customerMenu, setCustomerMenu] = useState(false);

  return (
    <div className="sidebar">
      <div className="sidebar-title">
        <h3>Menu</h3>
      </div>

      <ul className="sidebar-menu">
        <li>
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Dashboard
          </NavLink>
        </li>

        {/* Manage Customers */}
        <li>
          <div
            className="menu-parent"
            onClick={() => setCustomerMenu(!customerMenu)}
          >
            <span>Manage Customers</span>

            <span className={`arrow ${customerMenu ? "rotate" : ""}`}>
              ▼
            </span>
          </div>

          <ul className={`submenu ${customerMenu ? "open" : ""}`}>
            <li>
              <NavLink
                to="/admin/addcustomers"
                className={({ isActive }) =>
                  isActive ? "active-submenu" : ""
                }
              >
                Add Customer
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/admin/listcustomers"
                className={({ isActive }) =>
                  isActive ? "active-submenu" : ""
                }
              >
                List of Customers
              </NavLink>
            </li>
          </ul>
        </li>

        <li>
          <NavLink
            to="/admin/reports"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            List of Quotations
          </NavLink>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
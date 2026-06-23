// import Login from "../src/pages/Login/Login";
// import "./pages/Login/Login.css";
// import { Routes, Route } from "react-router-dom";
// import AdminPanel from "../src/pages/AdminPanel/AdminPanel";

// const App = () => {
//   return (

//   <Routes>
//     <Route path="/" element={<Login />} />
//     <Route path="/admin" element={<AdminPanel />} />
//   </Routes>

//   )
// };

// export default App;

import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login/Login";
import AdminPanel from "./pages/AdminPanel/AdminPanel";

import Dashboard from "./pages/Dashboard/Dashboard";
import Customers from "./pages/Customers/Customers";
import List_of_customer from "./pages/Customers/List_of_customer";
import Reports from "./pages/Reports/Reports";
import { CustomerProvider } from "./components/Context API/CustomerContext";
import { SidebarProvider } from "./components/Context API/SidebarContext";

function App() {
  return (

    <CustomerProvider>
    <SidebarProvider>

    <Routes>
      <Route path="/" element={<Login />} />

      <Route path="/admin" element={<AdminPanel />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="addcustomers" element={<Customers />} />
        <Route path="listcustomers" element={<List_of_customer />} />
        <Route path="reports" element={<Reports />} />
      </Route>
    </Routes>
    </SidebarProvider>
    </CustomerProvider>
  );
}

export default App;

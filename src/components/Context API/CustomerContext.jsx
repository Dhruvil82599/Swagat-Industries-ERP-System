import { createContext, useContext, useEffect, useState } from "react";

const CustomerContext = createContext();

export const CustomerProvider = ({ children }) => {
  const [customerData, setCustomerData] = useState([]);

  useEffect(() => {
    getCustomerData();
  });

  const getCustomerData = async () => {
    try {
      const response = await fetch("http://localhost:3000/customers");
      const data = await response.json();

      setCustomerData(data);
    } catch (error) {
      console.error("Error fetching customer data:", error);
    }
  };

  return (
    <CustomerContext.Provider
      value={{
        customerData,
        setCustomerData,
        getCustomerData,
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
};

export const useCustomer = () => {
  return useContext(CustomerContext);
};
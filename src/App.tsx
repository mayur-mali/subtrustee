import { Route, Routes } from "react-router-dom";
import "./App.css";

import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Authentication/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import PublicRoute from "./components/PublicRoute";
import Overview from "./pages/Dashboard/Overview/Overview";
import Institute from "./pages/Dashboard/Institute/Institute";
import PaymentLayout from "./pages/Dashboard/Payments/PaymentLayout";
import Transaction from "./pages/Dashboard/Transaction/Transaction";
import { ToastContainer } from "react-toastify";
import "react-date-range/dist/styles.css"; // main style file
import "react-date-range/dist/theme/default.css"; // theme css file
import Settlement from "./pages/Dashboard/Settlement/Settlement";
import Refund from "./pages/Dashboard/Refund/Refund";
import TransactionReceipt from "./pages/Dashboard/Transaction/TransactionReceipt";
import TransactionsOfSettlement from "./pages/Dashboard/Settlement/TransactionsOfSettlement";
import VendorTransaction from "./pages/Dashboard/Payments/VendorTab/VendorTransaction";
import VendorSettlement from "./pages/Dashboard/Payments/VendorTab/VendorSettlement";
import VendorTransactionReceipt from "./pages/Dashboard/Payments/VendorTab/VendorTransactionReceipt";
import Reports from "./components/Reports/Reports";
import Profile from "./pages/Dashboard/Profile/Profile";

function App() {
  return (
    <>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        >
          <Route path="/profile" element={<Profile />} />
          <Route path="reports" element={<Reports />} />
          <Route index element={<Overview />} />
          <Route path="institute" element={<Institute />} />
          <Route path="payments" element={<PaymentLayout menu={true} />}>
            <Route index element={<Transaction />} />
            <Route path="transaction" element={<Transaction />} />
            <Route path="settlements" element={<Settlement />} />
            <Route path="refunds" element={<Refund />} />
            <Route path="vendor-transaction" element={<VendorTransaction />} />
            <Route path="vendor-settlement" element={<VendorSettlement />} />
          </Route>
          <Route
            path="/payments/transaction-receipt/:collectId"
            element={<TransactionReceipt />}
          />
          <Route
            path="/payments/vendor-transaction-receipt"
            element={<VendorTransactionReceipt />}
          />

          <Route
            path="/payments/settlements-transaction"
            element={<TransactionsOfSettlement />}
          />
        </Route>
      </Routes>
      <ToastContainer
        position="top-center"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
}

export default App;

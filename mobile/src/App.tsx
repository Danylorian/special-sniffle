import { HashRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import { SettingsProvider } from "./lib/SettingsContext";
import Dashboard from "./pages/Dashboard";
import TransactionsList from "./pages/TransactionsList";
import NewTransactionPage from "./pages/NewTransactionPage";
import EditTransactionPage from "./pages/EditTransactionPage";
import LoansList from "./pages/LoansList";
import LoanFormPage from "./pages/LoanFormPage";
import LoanDetail from "./pages/LoanDetail";
import CategoriesPage from "./pages/CategoriesPage";
import SettingsPage from "./pages/SettingsPage";

export default function App() {
  return (
    <SettingsProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/transactions" element={<TransactionsList />} />
            <Route path="/transactions/nouvelle" element={<NewTransactionPage />} />
            <Route path="/transactions/:id" element={<EditTransactionPage />} />
            <Route path="/prets" element={<LoansList />} />
            <Route path="/prets/nouveau" element={<LoanFormPage />} />
            <Route path="/prets/:id" element={<LoanDetail />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/parametres" element={<SettingsPage />} />
          </Route>
        </Routes>
      </HashRouter>
    </SettingsProvider>
  );
}

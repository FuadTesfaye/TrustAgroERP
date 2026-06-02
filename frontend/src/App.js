import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import AppShell from './components/layout/AppShell';
import { ROLES, ROLE_GROUPS } from './utils/rbac';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import UserList from './pages/users/UserList';
import UserForm from './pages/users/UserForm';
import FarmList from './pages/farm/FarmList';
import FarmForm from './pages/farm/FarmForm';
import FlockList from './pages/farm/FlockList';
import FlockForm from './pages/farm/FlockForm';
import DailyFarmRecordList from './pages/farm/DailyFarmRecordList';
import DailyFarmRecordForm from './pages/farm/DailyFarmRecordForm';
import InventoryItemList from './pages/inventory/InventoryItemList';
import InventoryItemForm from './pages/inventory/InventoryItemForm';
import StockInForm from './pages/inventory/StockInForm';
import StockOutForm from './pages/inventory/StockOutForm';
import VeterinaryPage from './pages/veterinary/VeterinaryPage';
import VaccinationForm from './pages/veterinary/VaccinationForm';
import DiseaseCaseForm from './pages/veterinary/DiseaseCaseForm';
import TreatmentForm from './pages/veterinary/TreatmentForm';
import PrescriptionForm from './pages/veterinary/PrescriptionForm';
import PharmacyPage from './pages/pharmacy/PharmacyPage';
import PharmacySaleForm from './pages/pharmacy/PharmacySaleForm';
import CustomerForm from './pages/pharmacy/CustomerForm';
import ReceiptView from './pages/pharmacy/ReceiptView';
import FinancePage from './pages/finance/FinancePage';
import TransactionForm from './pages/finance/TransactionForm';
import CrmPage from './pages/crm/CrmPage';
import CrmClientForm from './pages/crm/CrmClientForm';
import FarmVisitForm from './pages/crm/FarmVisitForm';
import Reports from './pages/reports/Reports';
import Settings from './pages/settings/Settings';

// Role-based route groups for clean organization
const FARM_ROLES = [ROLES.ADMIN, ROLES.GENERAL_MANAGER, ROLES.OPERATIONS_MANAGER, ROLES.FARM_MANAGER, ROLES.VET, ROLES.VETERINARY_OFFICER, ROLES.STORE, ROLES.STORE_KEEPER];
const FARM_MANAGE_ROLES = [ROLES.ADMIN, ROLES.FARM_MANAGER, ROLES.OPERATIONS_MANAGER];
const VET_ROLES = [ROLES.ADMIN, ROLES.VETERINARY_OFFICER, ROLES.VET, ROLES.FARM_MANAGER];
const VET_WRITE_ROLES = [ROLES.ADMIN, ROLES.VETERINARY_OFFICER, ROLES.VET];
const INVENTORY_ROLES = [ROLES.ADMIN, ROLES.STORE_KEEPER, ROLES.STORE, ROLES.OPERATIONS_MANAGER, ROLES.FARM_MANAGER];
const INVENTORY_MANAGE_ROLES = [ROLES.ADMIN, ROLES.STORE_KEEPER, ROLES.STORE, ROLES.OPERATIONS_MANAGER];
const PHARMACY_ROLES = [ROLES.ADMIN, ROLES.PHARMACY_SALES, ROLES.PHARMACY, ROLES.GENERAL_MANAGER, ROLES.FINANCE_OFFICER];
const PHARMACY_WRITE_ROLES = [ROLES.ADMIN, ROLES.PHARMACY_SALES, ROLES.PHARMACY];
const FINANCE_ROLES = [ROLES.ADMIN, ROLES.FINANCE_OFFICER, ROLES.FINANCE, ROLES.GENERAL_MANAGER];
const CRM_ROLES = [ROLES.ADMIN, ROLES.EXTENSION_WORKER, ROLES.OPERATIONS_MANAGER, ROLES.GENERAL_MANAGER];

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
        <Routes>
          {/* Public route */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected routes with AppShell */}
          <Route path="/" element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            
            {/* Dashboard - accessible to all authenticated users */}
            <Route path="dashboard" element={<Dashboard />} />

            {/* User Management - Admin only */}
            <Route path="users" element={<ProtectedRoute roles={[ROLES.ADMIN]}><UserList /></ProtectedRoute>} />
            <Route path="users/new" element={<ProtectedRoute roles={[ROLES.ADMIN]}><UserForm /></ProtectedRoute>} />
            <Route path="users/:id/edit" element={<ProtectedRoute roles={[ROLES.ADMIN]}><UserForm /></ProtectedRoute>} />

            {/* Farms - View: All, Write: Admin/Farm Manager/Operations */}
            <Route path="farms" element={<ProtectedRoute roles={FARM_ROLES}><FarmList /></ProtectedRoute>} />
            <Route path="farms/new" element={<ProtectedRoute roles={FARM_MANAGE_ROLES}><FarmForm /></ProtectedRoute>} />
            <Route path="farms/:id/edit" element={<ProtectedRoute roles={FARM_MANAGE_ROLES}><FarmForm /></ProtectedRoute>} />

            {/* Flocks - View: Admin/Managers, Write: Admin/Farm Manager */}
            <Route path="flocks" element={<ProtectedRoute roles={FARM_ROLES}><FlockList /></ProtectedRoute>} />
            <Route path="flocks/new" element={<ProtectedRoute roles={FARM_MANAGE_ROLES}><FlockForm /></ProtectedRoute>} />
            <Route path="flocks/:id/edit" element={<ProtectedRoute roles={FARM_MANAGE_ROLES}><FlockForm /></ProtectedRoute>} />

            {/* Daily Records - Farm Managers, Operations, Vets */}
            <Route path="daily-records" element={<ProtectedRoute roles={FARM_MANAGE_ROLES.concat([ROLES.VET, ROLES.VETERINARY_OFFICER])}><DailyFarmRecordList /></ProtectedRoute>} />
            <Route path="daily-records/new" element={<ProtectedRoute roles={FARM_MANAGE_ROLES.concat([ROLES.VET, ROLES.VETERINARY_OFFICER])}><DailyFarmRecordForm /></ProtectedRoute>} />
            <Route path="daily-records/:id/edit" element={<ProtectedRoute roles={FARM_MANAGE_ROLES.concat([ROLES.VET, ROLES.VETERINARY_OFFICER])}><DailyFarmRecordForm /></ProtectedRoute>} />

            {/* Inventory - View: Admin/Store/Operations/Farm Manager, Write: Admin/Store/Operations */}
            <Route path="inventory" element={<ProtectedRoute roles={INVENTORY_ROLES}><InventoryItemList /></ProtectedRoute>} />
            <Route path="inventory/items/new" element={<ProtectedRoute roles={INVENTORY_MANAGE_ROLES}><InventoryItemForm /></ProtectedRoute>} />
            <Route path="inventory/items/:id/edit" element={<ProtectedRoute roles={INVENTORY_MANAGE_ROLES}><InventoryItemForm /></ProtectedRoute>} />
            <Route path="inventory/stock-in" element={<ProtectedRoute roles={[ROLES.ADMIN, ROLES.STORE_KEEPER, ROLES.STORE]}><StockInForm /></ProtectedRoute>} />
            <Route path="inventory/stock-out" element={<ProtectedRoute roles={[ROLES.ADMIN, ROLES.STORE_KEEPER, ROLES.STORE, ROLES.FARM_MANAGER]}><StockOutForm /></ProtectedRoute>} />

            {/* Veterinary - View: Admin/Vets/Farm Manager, Write: Admin/Vets */}
            <Route path="veterinary" element={<ProtectedRoute roles={VET_ROLES}><VeterinaryPage /></ProtectedRoute>} />
            <Route path="veterinary/vaccinations/new" element={<ProtectedRoute roles={VET_WRITE_ROLES}><VaccinationForm /></ProtectedRoute>} />
            <Route path="veterinary/disease-cases/new" element={<ProtectedRoute roles={VET_WRITE_ROLES.concat([ROLES.FARM_MANAGER])}><DiseaseCaseForm /></ProtectedRoute>} />
            <Route path="veterinary/treatments/new" element={<ProtectedRoute roles={VET_WRITE_ROLES}><TreatmentForm /></ProtectedRoute>} />
            <Route path="veterinary/prescriptions/new" element={<ProtectedRoute roles={VET_WRITE_ROLES}><PrescriptionForm /></ProtectedRoute>} />

            {/* Pharmacy - View: Admin/Pharmacy/Finance, Write: Admin/Pharmacy */}
            <Route path="pharmacy" element={<ProtectedRoute roles={PHARMACY_ROLES}><PharmacyPage /></ProtectedRoute>} />
            <Route path="pharmacy/sales/new" element={<ProtectedRoute roles={PHARMACY_WRITE_ROLES}><PharmacySaleForm /></ProtectedRoute>} />
            <Route path="pharmacy/sales/:id/receipt" element={<ProtectedRoute roles={PHARMACY_ROLES}><ReceiptView /></ProtectedRoute>} />
            <Route path="pharmacy/customers/new" element={<ProtectedRoute roles={PHARMACY_WRITE_ROLES}><CustomerForm /></ProtectedRoute>} />

            {/* Finance - Admin/Finance/General Manager */}
            <Route path="finance" element={<ProtectedRoute roles={FINANCE_ROLES}><FinancePage /></ProtectedRoute>} />
            <Route path="finance/new" element={<ProtectedRoute roles={FINANCE_ROLES}><TransactionForm /></ProtectedRoute>} />

            {/* CRM - Admin/Extension/Operations/General Manager */}
            <Route path="crm" element={<ProtectedRoute roles={CRM_ROLES}><CrmPage /></ProtectedRoute>} />
            <Route path="crm/clients/new" element={<ProtectedRoute roles={CRM_ROLES}><CrmClientForm /></ProtectedRoute>} />
            <Route path="crm/clients/:id/edit" element={<ProtectedRoute roles={CRM_ROLES}><CrmClientForm /></ProtectedRoute>} />
            <Route path="crm/visits/new" element={<ProtectedRoute roles={[ROLES.ADMIN, ROLES.EXTENSION_WORKER]}><FarmVisitForm /></ProtectedRoute>} />

            {/* Reports - Admin/Managers */}
            <Route path="reports" element={<ProtectedRoute roles={ROLE_GROUPS.MANAGERS}><Reports /></ProtectedRoute>} />
            
            {/* Settings - All authenticated users */}
            <Route path="settings" element={<Settings />} />
          </Route>
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;

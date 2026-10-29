import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import { HouseholdProvider } from "@/data/HouseholdContext";
import AppLayout from "@/components/layout/AppLayout";
import Apartment from "@/pages/Apartment";
import Expenses from "@/pages/Expenses";
import Garden from "@/pages/Garden";
import Groceries from "@/pages/Groceries";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Settings from "@/pages/Settings";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          element={
            <ProtectedRoute>
              <HouseholdProvider>
                <AppLayout />
              </HouseholdProvider>
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Home />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/groceries" element={<Groceries />} />
          <Route path="/apartment" element={<Apartment />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/garden" element={<Garden />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

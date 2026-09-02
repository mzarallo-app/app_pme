import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Acciones from './pages/Acciones';
import AccionForm from './pages/AccionForm';
import AccionDetalle from './pages/AccionDetalle';
import Reportes from './pages/Reportes';
import PlanDeCuentas from './pages/PlanDeCuentas';
import Usuarios from './pages/Usuarios';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Dashboard />} />
            <Route path="/acciones" element={<Acciones />} />
            <Route path="/acciones/nueva" element={<AccionForm />} />
            <Route path="/acciones/:id" element={<AccionDetalle />} />
            <Route path="/acciones/:id/editar" element={<AccionForm />} />
            <Route path="/reportes" element={<Reportes />} />
            <Route path="/plan-de-cuentas" element={<PlanDeCuentas />} />
            <Route path="/usuarios" element={<Usuarios />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AICoach from "./pages/AICoach";
import FocusMode from "./pages/FocusMode";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Login />} />

        <Route path="/register" element={<Register />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/ai-coach" element={<AICoach />} />
          <Route path="/focus" element={<FocusMode />} />
        </Route>

      </Routes>

    </BrowserRouter>
  );
}

export default App;
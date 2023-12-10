import "./App.css";
import Login from "./pages/auth/Login";
// import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import {
  Route,
  Routes,
  unstable_HistoryRouter as HistoryRouter,
} from "react-router-dom";
import PrivateRoute from "./routes/PrivateRoute";
import ErrorServer from "./Layouts/ErrorServer";
import history from "./utils/history";

function App() {
  return (
    <HistoryRouter history={history}>
      <Routes>
        <Route path="/login" element={<Login />} />
        {/* <Route path="/*" element={<MainLayout />} /> */}
        <Route path="/error-server" element={<ErrorServer />}></Route>
      </Routes>
    </HistoryRouter>
  );
}

export default App;

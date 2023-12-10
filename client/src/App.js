import "./App.css";
import Login from "./pages/auth/Login";
import "react-toastify/dist/ReactToastify.css";
import {
  Route,
  Routes,
  unstable_HistoryRouter as HistoryRouter,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import PrivateRoute from "./routes/PrivateRoute";
import ErrorServer from "./Layouts/ErrorServer";
import history from "./utils/history";
import Error403 from "./Layouts/Error403";
import Error from "./Layouts/Error";
import Layouts from "./Layouts";

import Home from "./pages/manager/Home";
import Department from "./pages/manager/Department";
import Project from "./pages/manager/Project";

function App() {
  return (
    <HistoryRouter history={history}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={<MainLayout />} />
        <Route path="/error-server" element={<ErrorServer />}></Route>
      </Routes>
    </HistoryRouter>
  );
}

const MainLayout = () => {
  return (
    <Layouts>
      <Routes>
        <Route path="/" element={<PrivateRoute element={<Home />} />} />
        <Route
          path="/department"
          element={<PrivateRoute element={<Department />} />}
        />
        <Route
          path="/project"
          element={<PrivateRoute element={<Project />} />}
        />
        <Route path={"*"} element={<Error />}></Route>
        <Route path="/error-403" element={<Error403 />}></Route>
      </Routes>
      <ToastContainer position="top-center" />
    </Layouts>
  );
};

export default App;

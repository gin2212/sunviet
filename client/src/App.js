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
import Approval_Process from "./pages/manager/Approval_Process";
import Document from "./pages/manager/Document";
import RoleActions from "./pages/manager/RoleActions";
import Users from "./pages/manager/User";
import Roles from "./pages/manager/Role";
import Proposal from "./pages/manager/Proposal";
import DetailProposal from "./pages/manager/Proposal/Detail";

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
        <Route path="/home" element={<PrivateRoute element={<Home />} />} />
        <Route
          path="/department"
          element={<PrivateRoute element={<Department />} />}
        />
        <Route
          path="/project"
          element={<PrivateRoute element={<Project />} />}
        />
        <Route
          path="/approval-process"
          element={<PrivateRoute element={<Approval_Process />} />}
        />
        <Route
          path="/proposal"
          element={<PrivateRoute element={<Proposal />} />}
        />
        <Route
          path="/proposal/:id"
          element={<PrivateRoute element={<DetailProposal />} />}
        />
        <Route
          path="/document"
          element={<PrivateRoute element={<Document />} />}
        />
        <Route
          path="/role-action"
          element={<PrivateRoute element={<RoleActions />} />}
        />
        <Route path="/role" element={<PrivateRoute element={<Roles />} />} />

        <Route path="/user" element={<PrivateRoute element={<Users />} />} />
        <Route path={"*"} element={<Error />}></Route>
        <Route path="/error-403" element={<Error403 />}></Route>
      </Routes>
      <ToastContainer position="top-center" />
    </Layouts>
  );
};

export default App;

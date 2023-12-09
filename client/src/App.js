import "./App.css";
import Login from "./pages/auth/Login";
// import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import {
  Route,
  Routes,
  unstable_HistoryRouter as HistoryRouter,
} from "react-router-dom";
import PrivateRoute from "./routes/PrivateRoute";
import Home from "./pages/manager/Home";
import Layouts from "./Layouts";
import ListSuggest from "./pages/manager/Suggest";
import ListSite from "./pages/manager/Site";
import "react-toastify/dist/ReactToastify.css";
import Error from "./Layouts/Error";
import History from "./pages/manager/History";
import ManageUser from "./pages/manager/User/ManageUser";
import Notify from "./pages/manager/Notify";
import ErrorServer from "./Layouts/ErrorServer";
import history from "./utils/history";
import Error403 from "./Layouts/Error403";
import DetailSuggest from "./pages/manager/Link/DetailSuggest";
import { ToastContainer } from "react-toastify";

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
          path="users"
          name="Users"
          element={<PrivateRoute element={<ManageUser />} />}
        />
        <Route
          path="suggest"
          name="Suggest"
          element={<PrivateRoute element={<ListSuggest />} />}
        />
        <Route
          path="detail/:suggestId"
          name="Detail Suggest"
          element={<PrivateRoute element={<DetailSuggest />} />}
        />
        <Route
          path="domain"
          name="Domain"
          element={<PrivateRoute element={<ListSite />} />}
        />
        <Route
          path="histories"
          name="Histories"
          element={<PrivateRoute element={<History />} />}
        />
        <Route
          path="notifies"
          name="Notify"
          element={<PrivateRoute element={<Notify />} />}
        />
        <Route path={"*"} element={<Error />}></Route>
        <Route path="/error-403" element={<Error403 />}></Route>
      </Routes>
      <ToastContainer position="top-center" />
    </Layouts>
  );
};

export default App;

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Logout from "./pages/Logout";
import SignUp from "./pages/SignUp";
import UsersBoxes from "./pages/UsersBoxes";
import Inbox from "./pages/Inbox";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/logout" element={<Logout />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/boxes" element={<UsersBoxes />} />
                <Route path="/inbox" element={<Inbox />} />
            </Routes>
        </Router>
    );
}

export default App;

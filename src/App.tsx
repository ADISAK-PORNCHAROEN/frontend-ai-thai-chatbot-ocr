import {
  BrowserRouter,
  Route,
  Routes
} from "react-router-dom";
import './App.css';
import Chatbot from "./chatbot/Chatbot";

function AppLayout() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Chatbot/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppLayout;
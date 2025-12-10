import {
  BrowserRouter,
  Route,
  Routes
} from "react-router-dom";
import './App.css';
import NewChatBot from "./chatbot/NewChatbot";

function AppLayout() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<NewChatBot/>} />
        {/* <Route path="/chatbot" element={<NewChatBot/>} />
        <Route path={`/chatbot/:id`} element={<Chatbot/>} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default AppLayout;
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import {
  TextField,
  IconButton,
  CircularProgress,
  Tooltip,
  Snackbar,
  Alert,
  Avatar,
  Fade,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CloseIcon from "@mui/icons-material/Close";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import Header from "../components/Header";

export default function NewChatBot() {
  const [messages, setMessages] = useState<
    { sender: string; text: string; fileName?: string }[]
  >([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // Ref สำหรับเลื่อนหน้าจอลงล่างสุดอัตโนมัติ
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim() && !file) return;

    const userMessage = {
      sender: "user",
      text: input || "",
      fileName: file?.name || undefined,
    };
    setMessages((prev) => [...prev, userMessage]);

    // เก็บค่าชั่วคราวไว้ส่ง API
    const currentInput = input;
    const currentFile = file;

    setInput("");
    setFile(null); // Reset file ทันทีเพื่อให้ UI เคลียร์
    setLoading(true);

    const formData = new FormData();
    formData.append("message", currentInput);
    if (currentFile) {
      formData.append("file", currentFile);
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/chat`,
        formData
      );
      const aiMessage = {
        sender: "bot",
        text: response.data || "เกิดข้อผิดพลาด",
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "เกิดข้อผิดพลาดในการเชื่อมต่อ API", error: err },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !loading) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (
      selectedFile &&
      ["application/pdf", "image/png", "image/jpeg"].includes(selectedFile.type)
    ) {
      setFile(selectedFile);
    } else {
      setSnackbarMessage("อนุญาตเฉพาะไฟล์ PDF หรือรูปภาพเท่านั้น");
      setSnackbarOpen(true);
      e.target.value = "";
    }
  };

  const handleSnackbarClose = (
    _event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") return;
    setSnackbarOpen(false);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans">
      {/* --- HEADER --- */}
      <Header />

      {/* --- CHAT AREA --- */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60">
            <SmartToyIcon sx={{ fontSize: 60, mb: 2 }} />
            <p>เริ่มสนทนาโดยการพิมพ์ข้อความด้านล่าง</p>
          </div>
        )}

        {messages.map((msg, idx) => {
          const isUser = msg.sender === "user";
          return (
            <Fade in={true} key={idx} timeout={500}>
              <div
                className={`flex w-full ${
                  isUser ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex max-w-[85%] md:max-w-[70%] gap-3 ${
                    isUser ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  {/* Avatar */}
                  <Avatar
                    sx={{
                      bgcolor: isUser ? "transparent" : "white",
                      color: isUser ? "transparent" : "#4f46e5",
                      boxShadow: isUser ? "none" : 1,
                      width: 36,
                      height: 36,
                    }}
                    className={isUser ? "hidden sm:flex" : ""}
                  >
                    {isUser ? null : <SmartToyIcon fontSize="small" />}
                  </Avatar>

                  {/* Message Bubble */}
                  <div
                    className={`
                    relative p-4 rounded-2xl shadow-sm text-sm sm:text-base leading-relaxed break-words whitespace-pre-wrap
                    ${
                      isUser
                        ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-tr-none"
                        : "bg-white text-gray-800 border border-gray-100 rounded-tl-none shadow-md"
                    }
                  `}
                  >
                    {/* File Attachment Indicator */}
                    {msg.fileName && (
                      <div
                        className={`flex items-center gap-2 mb-3 p-2 rounded-lg ${
                          isUser ? "bg-white/20" : "bg-gray-100"
                        }`}
                      >
                        <InsertDriveFileIcon fontSize="small" />
                        <span className="text-xs font-medium truncate max-w-[150px]">
                          {msg.fileName}
                        </span>
                      </div>
                    )}

                    {msg.text}
                  </div>
                </div>
              </div>
            </Fade>
          );
        })}

        {loading && (
          <div className="flex w-full justify-start animate-pulse">
            <div className="flex gap-3">
              <Avatar
                sx={{
                  bgcolor: "white",
                  color: "#4f46e5",
                  boxShadow: 1,
                  width: 36,
                  height: 36,
                }}
              >
                <SmartToyIcon fontSize="small" />
              </Avatar>
              <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm flex items-center gap-2">
                <div
                  className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.15s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.3s" }}
                ></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* --- INPUT AREA --- */}
      <div className="p-4 bg-white/90 backdrop-blur-md border-t border-gray-100 sticky bottom-0 z-20">
        <div className="max-w-4xl mx-auto">
          {/* File Preview (Popup above input) */}
          {file && (
            <Fade in={true}>
              <div className="mb-3 inline-flex items-center gap-3 bg-indigo-50 border border-indigo-100 text-indigo-700 px-4 py-2 rounded-xl shadow-sm">
                <InsertDriveFileIcon fontSize="small" />
                <div className="flex flex-col">
                  <span className="text-xs font-bold uppercase text-indigo-400">
                    Attached
                  </span>
                  <span className="text-sm font-medium truncate max-w-[200px]">
                    {file.name}
                  </span>
                </div>
                <IconButton
                  size="small"
                  onClick={() => setFile(null)}
                  className="ml-2 hover:bg-indigo-100"
                >
                  <CloseIcon fontSize="small" className="text-indigo-500" />
                </IconButton>
              </div>
            </Fade>
          )}

          {/* Input Field */}
          <div className="relative flex items-end gap-2 bg-gray-50 border border-gray-200 rounded-3xl px-2 py-2 shadow-inner focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-300 transition-all">
            <Tooltip title="แนบไฟล์ (PDF / รูป)">
              <IconButton
                component="label"
                className="text-gray-400 hover:text-indigo-600 h-10 w-10 mb-[2px]"
              >
                <AttachFileIcon />
                <input
                  type="file"
                  hidden
                  accept=".pdf,image/*"
                  onChange={handleFileChange}
                />
              </IconButton>
            </Tooltip>

            <TextField
              fullWidth
              variant="standard"
              placeholder="พิมพ์ข้อความของคุณที่นี่..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              multiline
              maxRows={4}
              InputProps={{
                disableUnderline: true,
                className: "text-gray-700 leading-6 py-2 px-1",
              }}
              sx={{ flex: 1 }}
            />

            <div className="mb-[2px]">
              <IconButton
                onClick={sendMessage}
                disabled={loading || (!input.trim() && !file)}
                sx={{
                  bgcolor: input.trim() || file ? "#4f46e5" : "#e0e7ff",
                  color: "white",
                  "&:hover": { bgcolor: "#4338ca" },
                  width: 40,
                  height: 40,
                  transition: "all 0.2s",
                }}
              >
                {loading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <SendIcon fontSize="small" />
                )}
              </IconButton>
            </div>
          </div>
          <div className="text-center mt-2">
            <p className="text-[10px] text-gray-400">
              AI can make mistakes. Please verify important information.
            </p>
          </div>
        </div>
      </div>

      {/* --- SNACKBAR --- */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="warning"
          variant="filled"
          sx={{ width: "100%", borderRadius: 2 }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}

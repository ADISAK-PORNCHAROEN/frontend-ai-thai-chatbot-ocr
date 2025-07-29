import { useState } from 'react';
import axios from 'axios';
import {
  TextField,
  IconButton,
  CircularProgress,
  Paper,
  Tooltip,
  InputAdornment,
  Snackbar,
  Alert,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';

export default function ChatBot() {
  const [messages, setMessages] = useState<
    { sender: string; text: string; fileName?: string }[]
  >([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const sendMessage = async () => {
    if (!input.trim() && !file) return;

    const userMessage = {
      sender: 'user',
      text: input || '',
      fileName: file?.name || undefined,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    const formData = new FormData();
    formData.append('message', input);
    if (file) {
      formData.append('file', file);
    }
    // formData.forEach((value, key) => {
    //   console.log(`${key}:`, value);
    // });

    try {
      setFile(null);
      setRefreshKey(refreshKey + 1);
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/chat`, formData);

      const aiMessage = {
        sender: 'bot',
        text: response.data || 'เกิดข้อผิดพลาด',
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: 'เกิดข้อผิดพลาดในการเชื่อมต่อ API', error: err },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) sendMessage();

  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (
      selectedFile &&
      ['application/pdf', 'image/png', 'image/jpeg'].includes(selectedFile.type)
    ) {
      setFile(selectedFile);
    } else {
      setSnackbarMessage('อนุญาตเฉพาะไฟล์ PDF หรือรูปภาพเท่านั้น');
      setSnackbarOpen(true);
      e.target.value = '';
    }
  };

  const handleSnackbarClose = (
    _event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  return (
    <>
      <div className="flex flex-col h-screen bg-gray-50">
        <div className="p-3 text-xl font-bold text-left bg-white shadow sticky top-0 z-10">
          TYPHOON AI
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col max-w-[50%] rounded-xl p-3 shadow-md transition-all duration-200 whitespace-pre-wrap ${msg.sender === 'user'
                ? 'ml-auto bg-blue-600 text-white'
                : 'mr-auto bg-white text-gray-800'
                }`}
            >
              {msg.fileName && (
                <div className="text-sm italic text-gray-300 mb-2">
                  แนบ: {msg.fileName}
                </div>
              )}
              <div>{msg.text}</div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start text-gray-500 italic">
              กำลังวิเคราะห์...
            </div>
          )}
        </div>

        <Paper
          elevation={3}
          className="p-4 bg-white flex flex-col gap-2 shadow-md sticky bottom-0 z-10"
        >
          {/* Box Preview แนบไฟล์ */}
          {file && (
            <div className="w-full bg-gray-100 border border-gray-300 rounded-md px-3 py-2 text-sm flex justify-between items-center text-gray-800">
              <div className="truncate">
                📎 แนบไฟล์: <strong>{file.name}</strong>
              </div>
              <button
                onClick={() => setFile(null)}
                className="ml-4 text-red-500 hover:underline text-xs"
              >
                ลบ
              </button>
            </div>
          )}

          {/* Input + ปุ่มส่ง */}
          <div className="w-full flex items-center gap-2">
            <TextField
              key={refreshKey}
              fullWidth
              variant="outlined"
              placeholder="พิมพ์คำถาม..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              multiline
              minRows={1}
              maxRows={4}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title="แนบไฟล์ (PDF / รูป)">
                      <IconButton component="label">
                        <AttachFileIcon />
                        <input
                          type="file"
                          hidden
                          accept=".pdf,image/*"
                          onChange={handleFileChange}
                        />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
            />
            <IconButton
              color="primary"
              onClick={sendMessage}
              disabled={loading}
              className="ml-2"
            >
              {loading ? <CircularProgress size={24} /> : <SendIcon />}
            </IconButton>
          </div>
        </Paper>
      </div>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="warning"
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
}

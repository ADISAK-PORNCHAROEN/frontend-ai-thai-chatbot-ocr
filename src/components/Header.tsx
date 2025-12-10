import SmartToyIcon from "@mui/icons-material/SmartToy";

export default function Header() {
  return (
    <div className="px-6 py-4 bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-20 flex items-center gap-3 border-b border-gray-100">
      <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-lg shadow-lg">
        <SmartToyIcon className="text-white" />
      </div>
      <div>
        <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-600">
          CHATBOT
        </h1>
        <p className="text-xs text-gray-500 font-medium">
          Always online • Ready to help • Base on TYPHOON AI
        </p>
      </div>
    </div>
  );
}

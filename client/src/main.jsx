import { createRoot } from 'react-dom/client'
import './index.css'
import './robot-theme.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { AppContextProvider } from './context/AppContext.jsx'
import { AgentContextProvider } from './context/AgentContext.jsx'

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AppContextProvider>
      <AgentContextProvider>
        <App />
      </AgentContextProvider>
    </AppContextProvider>
  </BrowserRouter>
);

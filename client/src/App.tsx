import CssBaseline from '@mui/material/CssBaseline';
import { AppRoutes } from './routes/AppRoutes';
import { ThemeContextProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeContextProvider>
      <CssBaseline />
      <AppRoutes />
    </ThemeContextProvider>
  );
}

export default App;

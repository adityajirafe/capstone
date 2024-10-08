import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react'
import './index.css'
import theme from './styles/theme.ts'
import App from './App.tsx'
import { SupabaseProvider } from './context/SupabaseProvider.tsx'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ChakraProvider theme={theme}>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <SupabaseProvider>
        <App/>
      </SupabaseProvider>
    </ChakraProvider>
  </StrictMode>,
)

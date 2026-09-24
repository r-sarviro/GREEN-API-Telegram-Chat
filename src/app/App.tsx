import { BrowserRouter } from 'react-router-dom'
import { AppRouter } from './providers/AppRouter'
import './styles/global.css'

const basename = import.meta.env.BASE_URL.replace(/\/$/, '')

export function App() {
  return (
    <BrowserRouter basename={basename || undefined}>
      <AppRouter />
    </BrowserRouter>
  )
}

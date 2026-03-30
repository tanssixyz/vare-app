import { BrowserRouter, Routes, Route } from "react-router"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { VarePage } from "./pages/VarePage"
import { IndexPage } from "./pages/IndexPage"
import { About } from "./components/About"

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <header>
          <span className="wordmark">väre</span>
          <ConnectButton
            showBalance={false}
            chainStatus="none"
            accountStatus="avatar"
          />
        </header>

        <main>
          <Routes>
            <Route path="/" element={<IndexPage />} />
            <Route path="/:address" element={<VarePage />} />
          </Routes>
        </main>

        <footer>
          <About />
          <div className="footer-links">
            <a href="https://kaarna.xyz" target="_blank" rel="noreferrer">kaarna</a>
            <span>·</span>
            <a href="https://hiven.space" target="_blank" rel="noreferrer">hiven</a>
            <span>·</span>
            <a href="https://kaipuu.space" target="_blank" rel="noreferrer">kaipuu</a>
          </div>
          <p className="footer-disclaimer">
            experimental · transactions are permanent · no data collected
          </p>
        </footer>
      </div>
    </BrowserRouter>
  )
}

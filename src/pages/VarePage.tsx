import { useState } from "react"
import { useParams, useNavigate } from "react-router"
import { useAccount } from "wagmi"
import { isAddress } from "viem"
import { CURATOR_ADDRESS } from "../constants"
import { VareView } from "../components/VareView"

export function VarePage() {
  const { address } = useParams<{ address: string }>()
  const navigate = useNavigate()
  const { address: walletAddress } = useAccount()

  if (!address) {
    navigate("/", { replace: true })
    return null
  }

  if (!isAddress(address)) {
    return (
      <div className="card">
        <div className="card-body">
          <p className="card-label">not found</p>
          <p className="card-desc">that is not a valid väre address.</p>
        </div>
      </div>
    )
  }

  const isCurator = walletAddress?.toLowerCase() === CURATOR_ADDRESS.toLowerCase()

  return (
    <div>
      <div className="page-nav">
        <button className="btn-ghost" onClick={() => navigate("/")}>
          ← all gatherings
        </button>
        <div className="page-nav-right">
          <ShareButton address={address} />
          {isCurator && <BlockButton address={address as `0x${string}`} />}
        </div>
      </div>
      <VareView address={address as `0x${string}`} />
    </div>
  )
}

function ShareButton({ address }: { address: string }) {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    const url = `${window.location.origin}/${address}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <button className="btn-ghost" onClick={copy}>
      {copied ? "copied ✓" : "share →"}
    </button>
  )
}

function BlockButton({ address }: { address: `0x${string}` }) {
  const copy = () => {
    navigator.clipboard.writeText(address)
    alert(`Add this address to BLOCKED_VARES in constants.ts:\n${address}`)
  }

  return (
    <button
      className="btn-ghost"
      onClick={copy}
      style={{ color: "#ef4444", opacity: 0.6 }}
    >
      block
    </button>
  )
}

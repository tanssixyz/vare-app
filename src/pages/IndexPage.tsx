import { useReadContract, useReadContracts } from "wagmi"
import { useNavigate } from "react-router"
import type { Abi } from "viem"
import { ACTIVE_CHAIN, FACTORY_ADDRESS, BLOCKED_VARES } from "../constants"
import VareFactoryABI from "../abi/VareFactory.json"
import VareABI from "../abi/Vare.json"
import { formatTimeRemaining } from "../lib/colour"
import { CreateVare } from "../components/CreateVare"

export function IndexPage() {
  const abi = VareFactoryABI as Abi

  const { data: allVares, isLoading, refetch } = useReadContract({
    address: FACTORY_ADDRESS,
    abi,
    functionName: "getAllVares",
    chainId: ACTIVE_CHAIN.id,
  })

  const vares = ((allVares as `0x${string}`[]) ?? [])
    .filter(a => !BLOCKED_VARES.includes(a))
    .reverse() // newest first

  return (
    <div className="index">
      <div className="index-header">
        <p className="card-label">all gatherings</p>
        <CreateVare onDeployed={refetch} />
      </div>

      {isLoading && (
        <div className="card">
          <div className="card-body">
            <p className="card-label">loading...</p>
          </div>
        </div>
      )}

      {!isLoading && vares.length === 0 && (
        <div className="card">
          <div className="card-body">
            <p className="card-label">no gatherings yet</p>
            <p className="card-desc">deploy the first one above.</p>
          </div>
        </div>
      )}

      {vares.map((address) => (
        <VareCard key={address} address={address} />
      ))}
    </div>
  )
}

function VareCard({ address }: { address: `0x${string}` }) {
  const navigate = useNavigate()
  const abi = VareABI as Abi

  const { data } = useReadContracts({
    contracts: [
      { address, abi, functionName: "title",     chainId: ACTIVE_CHAIN.id },
      { address, abi, functionName: "isOpen",    chainId: ACTIVE_CHAIN.id },
      { address, abi, functionName: "closesAt",  chainId: ACTIVE_CHAIN.id },
      { address, abi, functionName: "markCount", chainId: ACTIVE_CHAIN.id },
    ],
  })

  if (!data) return null

  const title     = data[0].result as string
  const isOpen    = data[1].result as boolean
  const closesAt  = data[2].result as bigint
  const markCount = data[3].result as bigint

  return (
    <div
      className="vare-card"
      onClick={() => navigate(`/${address}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && navigate(`/${address}`)}
    >
      <div className="vare-card-header">
        <span className="vare-card-title">{title}</span>
        <span className={`vare-status ${isOpen ? "vare-status-open" : "vare-status-closed"}`}>
          {isOpen ? "open" : "closed"}
        </span>
      </div>
      <div className="vare-card-meta">
        <span className="vare-meta-text">
          {markCount?.toString() ?? "0"} {markCount === 1n ? "mark" : "marks"}
        </span>
        <span className="vare-meta-sep">·</span>
        <span className="vare-meta-text">
          {isOpen ? formatTimeRemaining(closesAt) : "closed"}
        </span>
      </div>
    </div>
  )
}

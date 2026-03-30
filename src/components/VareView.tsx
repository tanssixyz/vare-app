import { useState, useEffect } from "react"
import { useReadContracts, useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi"
import { useConnectModal } from "@rainbow-me/rainbowkit"
import { decodeEventLog } from "viem"
import { ACTIVE_CHAIN } from "../constants"
import VareABI from "../abi/Vare.json"
import { deriveColour, formatDate, formatTimeRemaining } from "../lib/colour"

interface VareData {
  title: string
  url: string
  creator: `0x${string}`
  isOpen: boolean
  closesAt: bigint
  markCount: bigint
  isClosed: boolean
}

interface MarkData {
  id: bigint
  marker: `0x${string}`
  timestamp: bigint
}

export function VareView({ address }: { address: `0x${string}` }) {
  const abi = VareABI as Parameters<typeof useReadContracts>[0]["contracts"][0]["abi"]

  const { data, isLoading, refetch } = useReadContracts({
    contracts: [
      { address, abi, functionName: "title",     chainId: ACTIVE_CHAIN.id },
      { address, abi, functionName: "url",       chainId: ACTIVE_CHAIN.id },
      { address, abi, functionName: "creator",   chainId: ACTIVE_CHAIN.id },
      { address, abi, functionName: "isOpen",    chainId: ACTIVE_CHAIN.id },
      { address, abi, functionName: "closesAt",  chainId: ACTIVE_CHAIN.id },
      { address, abi, functionName: "markCount", chainId: ACTIVE_CHAIN.id },
      { address, abi, functionName: "isClosed",  chainId: ACTIVE_CHAIN.id },
    ],
  })

  if (isLoading || !data) {
    return (
      <div className="card">
        <div className="card-body">
          <p className="card-label">loading...</p>
        </div>
      </div>
    )
  }

  const vare: VareData = {
    title:     data[0].result as string,
    url:       data[1].result as string,
    creator:   data[2].result as `0x${string}`,
    isOpen:    data[3].result as boolean,
    closesAt:  data[4].result as bigint,
    markCount: data[5].result as bigint,
    isClosed:  data[6].result as boolean,
  }

  return (
    <div className="vare">
      <VareHeader vare={vare} />
      <MarkSection address={address} vare={vare} onMarked={refetch} />
      <MarkList address={address} markCount={vare.markCount} />
    </div>
  )
}

function VareHeader({ vare }: { vare: VareData }) {
  return (
    <div className="vare-header">
      <p className="card-label">väre around</p>
      {vare.url ? (
        <a
          href={vare.url}
          target="_blank"
          rel="noreferrer"
          className="vare-title-link"
        >
          {vare.title} ↗
        </a>
      ) : (
        <p className="vare-title">{vare.title}</p>
      )}
      <div className="vare-meta">
        <span className={`vare-status ${vare.isOpen ? "vare-status-open" : "vare-status-closed"}`}>
          {vare.isOpen ? "open" : "closed"}
        </span>
        <span className="vare-meta-sep">·</span>
        <span className="vare-meta-text">
          {vare.isOpen
            ? formatTimeRemaining(vare.closesAt)
            : `closed ${formatDate(vare.closesAt)}`}
        </span>
        <span className="vare-meta-sep">·</span>
        <span className="vare-meta-text">
          {vare.markCount.toString()} {vare.markCount === 1n ? "mark" : "marks"}
        </span>
      </div>
    </div>
  )
}

function MarkSection({
  address,
  vare,
  onMarked,
}: {
  address: `0x${string}`
  vare: VareData
  onMarked: () => void
}) {
  const { isConnected, chain } = useAccount()
  const { openConnectModal } = useConnectModal()
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>()
  const [newMark, setNewMark] = useState<MarkData | null>(null)
  const { writeContract, isPending } = useWriteContract()
  const abi = VareABI as Parameters<typeof useWriteContract>[0]["abi"]

  const { data: receipt, isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash: txHash,
    query: { enabled: !!txHash },
  })

  useEffect(() => {
    if (!receipt) return
    for (const log of receipt.logs) {
      try {
        const decoded = decodeEventLog({
          abi: VareABI as Parameters<typeof decodeEventLog>[0]["abi"],
          data: log.data,
          topics: log.topics,
          eventName: "Marked",
        })
        const args = decoded.args as { id: bigint; marker: `0x${string}`; timestamp: bigint }
        setNewMark({ id: args.id, marker: args.marker, timestamp: args.timestamp })
        onMarked()
        return
      } catch {
        // not the Marked event
      }
    }
  }, [receipt, onMarked])

  const handleMark = () => {
    if (!isConnected) { openConnectModal?.(); return }
    writeContract(
      { address, abi, functionName: "mark", chainId: ACTIVE_CHAIN.id },
      {
        onSuccess: (hash) => setTxHash(hash),
        onError: () => {},
      }
    )
  }

  const onReset = () => {
    setNewMark(null)
    setTxHash(undefined)
  }

  if (newMark) {
    const colour = deriveColour(newMark.id, newMark.timestamp, newMark.marker)
    return (
      <div className="card">
        <div style={{ width: "100%", height: "72px", background: colour.css }} />
        <div className="card-body">
          <p className="card-label">marked</p>
          <p className="card-phrase">your väre will not be forgotten</p>
          <p style={{ fontFamily: "monospace", fontSize: "12px", color: "#9ca3af", margin: 0 }}>
            {formatDate(newMark.timestamp)}
          </p>
          <p style={{ fontFamily: "monospace", fontSize: "12px", color: "#9ca3af", margin: 0 }}>
            mark #{newMark.id.toString()}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "9px", height: "9px", borderRadius: "50%", background: colour.css, flexShrink: 0 }} />
            <p style={{ fontFamily: "monospace", fontSize: "12px", color: "#f3f4f6", margin: 0 }}>
              the colour of your mark is {colour.hex}
            </p>
          </div>
          {txHash && (
            <a
              href={`${ACTIVE_CHAIN.blockExplorers?.default.url}/tx/${txHash}`}
              target="_blank"
              rel="noreferrer"
              style={{ fontFamily: "monospace", fontSize: "12px", color: "#6b7280" }}
            >
              view on basescan →
            </a>
          )}
          <button className="btn-ghost" onClick={onReset}>back to gathering</button>
        </div>
      </div>
    )
  }

  if (!vare.isOpen) {
    return (
      <div className="card">
        <div className="card-body">
          <p className="card-label">this gathering is closed</p>
          <p className="card-desc">
            the window has passed. {vare.markCount.toString()} people marked their resonance.
          </p>
        </div>
      </div>
    )
  }

  const isWaiting = isPending || isConfirming

  return (
    <div className="card">
      <div className="card-body">
        <p className="card-label">mark your resonance</p>
        <p className="card-desc">
          this thing moved you.<br />
          mark it and the chain keeps it.<br />
          nothing is sent to anyone.
        </p>
        {!isConnected ? (
          <button className="btn" onClick={() => openConnectModal?.()}>connect wallet</button>
        ) : chain?.id !== ACTIVE_CHAIN.id ? (
          <p className="chain-warning">switch to {ACTIVE_CHAIN.name}</p>
        ) : (
          <button className="btn" onClick={handleMark} disabled={isWaiting}>
            {isPending ? "confirm in wallet..." : isConfirming ? "marking..." : "mark this"}
          </button>
        )}
      </div>
    </div>
  )
}

function MarkList({
  address,
  markCount,
}: {
  address: `0x${string}`
  markCount: bigint
}) {
  const count = Number(markCount)
  const abi = VareABI as Parameters<typeof useReadContracts>[0]["contracts"][0]["abi"]

  const contracts = Array.from({ length: count }, (_, i) => ({
    address,
    abi,
    functionName: "marks" as const,
    args: [BigInt(i)],
    chainId: ACTIVE_CHAIN.id,
  }))

  const { data } = useReadContracts({ contracts, query: { enabled: count > 0 } })

  if (count === 0) return null

  return (
    <div className="mark-list">
      <p className="mark-list-label">the gathering</p>
      <div className="marks">
        {data?.map((result, i) => {
          if (!result.result) return null
          const [marker, timestamp] = result.result as [`0x${string}`, bigint]
          const colour = deriveColour(BigInt(i), timestamp, marker)
          return (
            <div key={i} className="mark-row">
              <div
                className="mark-dot"
                style={{ background: colour.css }}
                title={colour.hex}
              />
              <span className="mark-date">{formatDate(timestamp)}</span>
              <span className="mark-hex">{colour.hex}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

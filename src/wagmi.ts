import { getDefaultConfig } from "@rainbow-me/rainbowkit"
import { base } from "viem/chains"           // was baseSepolia

import { http } from "wagmi"

const appUrl = typeof window !== "undefined"
  ? window.location.origin
  : "https://vare.kaarna.xyz"

export const config = getDefaultConfig({
  appName: "Väre",
  appDescription: "A gathering around a shared attractor.",
  appUrl,
  appIcon: "https://vare.kaarna.xyz/favicon.svg",
  projectId: "6ba1bf292b158f48a08b2056365fcd65",
  chains: [base],
  transports: {
    [base.id]: http("https://mainnet.base.org"),
  },
  ssr: false,
})

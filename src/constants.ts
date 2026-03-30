import { base } from "viem/chains"           // was baseSepolia

export const ACTIVE_CHAIN = base              // was baseSepolia

export const FACTORY_ADDRESS =
  "0x6066ab4358aC641ffdEE76f8d585eD67028467eD" as const  

export const SEVEN_DAYS       = 7n  * 24n * 60n * 60n
export const FOURTEEN_DAYS    = 14n * 24n * 60n * 60n
export const TWENTYEIGHT_DAYS = 28n * 24n * 60n * 60n

// Addresses to hide from the index — spam, test deployments etc
export const BLOCKED_VARES: `0x${string}`[] = []

// Your deployer address — used to show delete (block) controls
export const CURATOR_ADDRESS =
  "0xa288264B6B1eaD20b977b681Ba9cf3B8a07CBA93" as const

export const DEMO_MODELS = [
  {
    id: 1,
    creator: "0x1234...abcd",
    name: "ChatBot Pro",
    description:
      "A conversational AI model for customer support and general chat interactions",
    ipfs_hash: "QmX7Y8Z...",
    category: "NLP",
    price_per_inference: 100000, // 0.001 APT
    status: 1, // VERIFIED
    auditor_count: 3,
    total_inferences: 1250,
    created_at: Date.now() - 86400000,
  },
  {
    id: 2,
    creator: "0x5678...efgh",
    name: "ImageGen AI",
    description:
      "Text-to-image generation model for creating artwork and graphics",
    ipfs_hash: "QmA1B2C...",
    category: "Computer Vision",
    price_per_inference: 500000, // 0.005 APT
    status: 0, // PENDING
    auditor_count: 1,
    total_inferences: 0,
    created_at: Date.now() - 3600000,
  },
  {
    id: 3,
    creator: "0x9abc...ijkl",
    name: "Financial Advisor Bot",
    description: "AI model for providing financial advice and market analysis",
    ipfs_hash: "QmD3E4F...",
    category: "Finance",
    price_per_inference: 1000000, // 0.01 APT
    status: 1, // VERIFIED
    auditor_count: 5,
    total_inferences: 856,
    created_at: Date.now() - 172800000,
  },
];

export const DEMO_AUDITS = [
  {
    model_id: 1,
    auditor: "0xaud1...1234",
    approved: true,
    feedback: "Model shows good performance with no bias detected in testing",
    timestamp: Date.now() - 60000,
  },
  {
    model_id: 1,
    auditor: "0xaud2...5678",
    approved: true,
    feedback: "Verified safety protocols and output consistency",
    timestamp: Date.now() - 120000,
  },
  {
    model_id: 2,
    auditor: "0xaud1...1234",
    approved: true,
    feedback: "Initial review looks promising, waiting for more auditors",
    timestamp: Date.now() - 30000,
  },
];

export const DEMO_PROVIDERS = [
  {
    id: "provider_1",
    name: "Local GPU Provider",
    status: "active",
    gpu: "NVIDIA RTX 4090",
    ram: "32GB",
    location: "Local Machine",
    price_per_hour: 0.5,
    jobs_completed: 2847,
  },
];

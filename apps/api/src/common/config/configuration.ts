export default () => ({
  port: parseInt(process.env.PORT ?? '3001', 10),
  database: {
    url: process.env.DATABASE_URL
  },
  redis: {
    url: process.env.REDIS_URL ?? 'redis://localhost:6379'
  },
  whatsapp: {
    baseUrl: process.env.WHATSAPP_BASE_URL,
    token: process.env.WHATSAPP_TOKEN,
    defaultSender: process.env.WHATSAPP_DEFAULT_SENDER
  },
  ai: {
    draftProvider: process.env.AI_DRAFT_REPLY_PROVIDER,
    classificationProvider: process.env.AI_CLASSIFICATION_PROVIDER,
    apiKey: process.env.AI_API_KEY
  },
  translation: {
    provider: process.env.TRANSLATION_PROVIDER,
    apiKey: process.env.TRANSLATION_API_KEY
  },
  storage: {
    endpoint: process.env.S3_ENDPOINT,
    accessKey: process.env.S3_ACCESS_KEY,
    secretKey: process.env.S3_SECRET_KEY,
    bucket: process.env.S3_BUCKET,
    region: process.env.S3_REGION
  }
});

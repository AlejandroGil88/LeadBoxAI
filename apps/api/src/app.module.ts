import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { AuthModule } from './auth/auth.module';
import { LeadsModule } from './leads/leads.module';
import { ContactsModule } from './contacts/contacts.module';
import { ConversationsModule } from './conversations/conversations.module';
import { MessagesModule } from './messages/messages.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { AutomationsModule } from './automations/automations.module';
import { KnowledgeModule } from './knowledge/knowledge.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { HealthModule } from './health/health.module';
import configuration from './common/config/configuration';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL ?? 'info'
      }
    }),
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 120
    }),
    PrismaModule,
    AuthModule,
    LeadsModule,
    ContactsModule,
    ConversationsModule,
    MessagesModule,
    CampaignsModule,
    AutomationsModule,
    KnowledgeModule,
    AnalyticsModule,
    WebhooksModule,
    HealthModule
  ]
})
export class AppModule {}

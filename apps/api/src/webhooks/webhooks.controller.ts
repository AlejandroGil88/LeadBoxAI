import { Body, Controller, Headers, Post } from '@nestjs/common';

@Controller('webhooks')
export class WebhooksController {
  @Post('whatsapp')
  handleWhatsapp(@Headers('x-hub-signature-256') signature: string | undefined, @Body() payload: any) {
    return { ok: true, signature: signature ?? null, payload };
  }

  @Post('public/lead-intake')
  handleLeadIntake(@Body() payload: any) {
    return { received: true, lead: payload };
  }
}

import { Injectable } from '@nestjs/common';

const knowledgeBase = [
  {
    id: 'kb_1',
    title: 'Proceso de admisión',
    locale: 'es',
    tags: ['admisiones'],
    version: 1,
    body: 'Instrucciones paso a paso para completar la admisión.'
  }
];

@Injectable()
export class KnowledgeService {
  findAll() {
    return knowledgeBase;
  }

  create(payload: any) {
    return { id: `kb_${Date.now()}`, version: 1, ...payload };
  }
}

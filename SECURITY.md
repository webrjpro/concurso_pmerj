# Security Policy

## Supported Versions

Atualmente, apenas a versão `main` (produção) recebe atualizações de segurança.

## Reporting a Vulnerability

Por favor, reporte qualquer vulnerabilidade de segurança para o email: **carlos.piquet2016@gmail.com**.

Ao reportar, por favor inclua:
1. Uma descrição detalhada do problema.
2. Passos para reproduzir o problema.
3. Potencial impacto.

O tempo esperado de resposta é de até 48 horas úteis. Nenhuma recompensa financeira (bug bounty) é oferecida no momento.

## Segurança da Arquitetura
Este projeto implementa:
- Rate limiting por IP.
- CSP estrito e headers HSTS via `middleware.ts`.
- Validação profunda de payloads em todas as API routes.
- Sanitização de texto para prevenir XSS.

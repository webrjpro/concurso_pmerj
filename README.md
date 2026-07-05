![License: BSL-1.1](https://img.shields.io/badge/License-BSL--1.1-blue.svg)

# PMERJ - Aprovação Inteligente 👮🏽‍♂️📚

Plataforma de estudos intensivos para o concurso da Polícia Militar do Estado do Rio de Janeiro. 
Propriedade de **Carlos Antonio de Oliveira Piquet** (carlos.piquet2016@gmail.com).

## Segurança 🔒

Este sistema foi blindado para produção:
- **Proteção XSS e CSRF**: Rate limits e sanitização profunda.
- **Docker Hardened**: Roda com usuário sem privilégios (`nextjs`).
- Para detalhes, veja [SECURITY.md](SECURITY.md).

## Variáveis de Ambiente (Produção)

Nunca commite chaves de API. Configure no painel do seu provedor (Railway, Vercel, etc):

```env
DATABASE_URL="postgresql://usuario:senha@host:5432/banco"
GROQ_API_KEY="sua_chave_gsk_..."
ADMIN_TOKEN="token_super_seguro_gerado_aleatoriamente"
NODE_ENV="production"
```

## Deploy no Railway 🚂

Este projeto possui o arquivo `railway.toml` configurado.
1. Crie um projeto no Railway e adicione o PostgreSQL.
2. Link o repositório GitHub (`webrjpro/concurso_pmerj`).
3. Adicione as variáveis de ambiente acima.
4. O build via Docker cuidará da inicialização.

## Direitos Autorais

Todos os direitos reservados © 2024-2026 Carlos Antonio de Oliveira Piquet.
Uso sob a licença BSL-1.1. Veja [LICENSE](LICENSE) e [NOTICE](NOTICE).

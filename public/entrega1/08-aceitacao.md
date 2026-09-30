# Checklist Final de Aceitação

- [x] Site servido no domínio `pages.dev` atribuído ao projeto.
- [x] Arquivos estáticos e Pages Functions operam na mesma origem.
- [x] Projeto publicado por integração com GitHub.
- [x] Não foram utilizados Node, npm, npx ou Wrangler.
- [x] Cada provedor OAuth utiliza seu próprio callback exato.
- [x] As requisições de autorização utilizam Authorization Code e PKCE com S256.
- [x] O Client Secret correto de cada provedor é utilizado somente na troca do código pelo backend.
- [x] O callback rejeita transações ausentes, expiradas, alteradas ou reutilizadas.
- [x] O `id_token` do Google somente cria a sessão após as validações criptográficas e semânticas necessárias.
- [x] O `access_token` do GitHub é utilizado somente para consultar `/user`, com a autorização revogada antes da criação da sessão local.
- [x] O cookie de sessão é opaco e utiliza `Secure`, `HttpOnly`, `SameSite=Strict`, sem atributo `Domain`.
- [x] O D1 armazena o hash do cookie de sessão, e não seu valor original.
- [x] O endpoint `/api/me` fornece somente o perfil mínimo necessário.
- [x] O logout verifica a origem da requisição, remove a sessão e expira o cookie.
- [x] Um cookie de uma sessão revogada não consegue restaurar a autenticação.
- [x] Tokens, segredos e valores transitórios não estão presentes em HTML, URLs salvas, Web Storage, logs ou evidências.
- [x] A dupla consegue explicar por que os arquivos estáticos permanecem públicos mesmo com autenticação OAuth.
- [x] As sessões administrativas utilizadas em computador compartilhado serão encerradas ao finalizar a atividade.

## Identificação

**Integrante:** João Pedro Marques Terra

## Confirmação

Declaro que os itens acima foram verificados durante a implementação e os testes da aplicação.

**Assinatura:**

João Pedro Marques Terra


# Testes de falha

> Preencha Resultado observado somente depois de executar cada teste real. Não inclua cookies, tokens, state, nonce, code_challenge, códigos ou segredos.

## Caso 1 — retorno sem cookie temporário
- Preparação:
- Pedido enviado:
- Resultado esperado: retorno recusado e nenhuma sessão criada.
- Resultado observado:

## Caso 2 — state alterado
- Preparação:
- Pedido enviado:
- Resultado esperado: retorno recusado antes da troca do código.
- Resultado observado:

## Caso 3 — reutilização da transação
- Preparação:
- Pedido enviado:
- Resultado esperado: repetição recusada porque a transação já foi removida.
- Resultado observado:

## Caso 4 — sessão expirada
- Preparação: executar UPDATE sessions SET expires_at = 0; no banco de laboratório.
- Pedido enviado: GET /api/me após recarregar.
- Resultado esperado: HTTP 401.
- Resultado observado:

## Caso 5 — origem inválida na saída
- Preparação:
- Pedido enviado: POST /oauth/logout a partir de outra origem.
- Resultado esperado: operação recusada e sessão original preservada.
- Resultado observado:

## Caso 6 — reutilização do cookie revogado
- Preparação:
- Pedido enviado: tentar consultar /api/me após logout reutilizando temporariamente o cookie antigo.
- Resultado esperado: HTTP 401.
- Resultado observado:

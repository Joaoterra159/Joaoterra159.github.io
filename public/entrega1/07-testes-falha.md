# Testes de Falha

## Caso 1 — Retorno sem cookie temporário

**Preparação:**  
O login com Google foi iniciado em uma janela normal do navegador. Na página de autorização do provedor, a URL foi copiada e aberta em uma janela privativa, que não possuía o cookie temporário `__Host-oauth-tx`.

**Pedido enviado:**  
O fluxo de autenticação foi concluído pela janela privativa.

**Resultado esperado:**  
O callback deveria rejeitar o retorno por ausência do cookie temporário e não criar uma sessão local.

**Resultado observado:**  
A aplicação recusou o retorno e exibiu a mensagem: “Algo deu errado. Tente novamente.”

---

## Caso 2 — State alterado

**Preparação:**  
Um novo login com Google foi iniciado e interrompido na página do provedor antes da autenticação. Um caractere do parâmetro `state` foi alterado manualmente.

**Pedido enviado:**  
O fluxo OAuth foi continuado utilizando o `state` modificado.

**Resultado esperado:**  
O callback deveria rejeitar o retorno antes da troca do código de autorização e não criar uma sessão.

**Resultado observado:**  
A aplicação recusou o retorno e exibiu a mensagem: “Algo deu errado. Tente novamente.”

---

## Caso 3 — Reutilização da transação

**Preparação:**  
Foi realizado um login válido com Google. Após a conclusão do fluxo, a URL da requisição de callback foi localizada no painel Network das ferramentas de desenvolvedor.

**Pedido enviado:**  
A mesma URL de callback já utilizada foi acessada novamente.

**Resultado esperado:**  
A tentativa deveria ser rejeitada, pois a transação OAuth já havia sido consumida e não poderia ser reutilizada.

**Resultado observado:**  
A aplicação recusou a reutilização e exibiu a mensagem: “Retorno inválido”.

---

## Caso 4 — Sessão expirada

**Preparação:**  
Com uma sessão criada, o campo `expires_at` das sessões armazenadas no D1 foi definido como `0`.

**Pedido enviado:**  
Após a alteração, a aplicação foi recarregada e o endpoint `/api/me` foi acessado.

**Resultado esperado:**  
A sessão expirada deveria ser rejeitada e o endpoint `/api/me` deveria responder com status 401.

**Resultado observado:**  
O endpoint `/api/me` recusou a sessão e retornou “Unauthorized”.

---

## Caso 5 — Origem inválida na saída

**Preparação:**  
Foi criada uma nova sessão válida. Em seguida, o domínio `https://example.com` foi aberto em outra aba.

**Pedido enviado:**  
A partir do console de `https://example.com`, foi enviada uma requisição POST para `/oauth/logout` utilizando `credentials: "include"`.

**Resultado esperado:**  
A requisição de logout originada em outro domínio deveria ser rejeitada, mantendo a sessão original válida.

**Resultado observado:**  
A requisição foi rejeitada com status `403 Forbidden`. Ao retornar à aplicação, `/api/me` continuou apresentando o perfil autenticado, confirmando que a sessão permaneceu válida.

---

## Caso 6 — Reutilização do cookie revogado

**Preparação:**  
Em uma sessão de teste, o valor do cookie `__Host-session` foi copiado temporariamente. Em seguida, foi realizado o logout normalmente.

**Pedido enviado:**  
Após o logout, o mesmo valor do cookie antigo foi restaurado manualmente no navegador e o endpoint `/api/me` foi acessado novamente.

**Resultado esperado:**  
O cookie revogado não deveria restaurar a sessão, pois o registro correspondente já havia sido removido do D1. O endpoint `/api/me` deveria responder com status 401.

**Resultado observado:**  
Mesmo após a restauração do cookie antigo, o endpoint `/api/me` retornou “Unauthorized”, confirmando que a sessão revogada não pôde ser reutilizada.

# TASKS

- [ ] Remover `Env::int()` — `backend/src/Support/Env.php:37`
  Método público nunca chamado. A config usa `Env::get()`/`Env::bool()` (`config/config.php`); o TTL de sessão é lido via `(int) Env::get(...)`, não via `Env::int()`. Evidência: `grep -rn "Env::int\|->int(" backend/` → nenhum call site.

- [ ] Remover `SessionRepository::purgeExpired()` — `backend/src/Repositories/SessionRepository.php:56`
  Nunca chamado; a expiração já é tratada na leitura por `findValid()`. Evidência: `grep -rn "purgeExpired" backend/` → só a definição.

- [ ] Remover wrapper `api.me` — `frontend/assets/js/api.js:134`
  Sem call site no front. Evidência: `grep -rn "api\.me\b"` em `assets/js`, `pages`, `*.html` → só a definição.

- [ ] Remover wrapper `api.medication` — `frontend/assets/js/api.js:140`
  Sem call site no front. Evidência: `grep -rn "api\.medication\b"` em `assets/js`, `pages`, `*.html` → só a definição.

- [ ] Remover wrapper `api.categories` — `frontend/assets/js/api.js:144`
  Sem call site no front. Evidência: `grep -rn "api\.categories\b"` em `assets/js`, `pages`, `*.html` → só a definição.

- [ ] Remover wrapper `api.sales` — `frontend/assets/js/api.js:163`
  Sem call site no front. Evidência: `grep -rn "api\.sales\b"` em `assets/js`, `pages`, `*.html` → só a definição.

- [ ] Remover wrapper `api.voidSale` — `frontend/assets/js/api.js:165`
  Sem call site no front. Evidência: `grep -rn "api\.voidSale\b"` em `assets/js`, `pages`, `*.html` → só a definição.

- [ ] Parâmetro `reason` do ajuste de estoque é coletado e descartado
  Coletado no form (`frontend/assets/js/page-behaviors.js:361`), enviado via `adjustStock(id, delta, reason)` (`frontend/assets/js/api.js:146`), validado em `backend/src/Controllers/MedicationController.php:88`, mas `backend/src/Services/MedicationService.php:112` recebe `?string $reason` e nunca o usa. Remover de ponta a ponta ou implementar (audit log).

- [ ] Avaliar endpoint `GET /api/medications/{id}` — `backend/routes/api.php`
  Sem consumidor no frontend.

- [ ] Avaliar endpoint `GET /api/medications/categories` — `backend/routes/api.php`
  Sem consumidor no frontend.

- [ ] Avaliar endpoint `GET /api/medications/low-stock` — `backend/routes/api.php`
  Sem consumidor no frontend (o dashboard já devolve essa lista inline).

- [ ] Avaliar endpoint `GET /api/medications/expiring` — `backend/routes/api.php`
  Sem consumidor no frontend (o dashboard já devolve essa lista inline).

- [ ] Avaliar endpoints `PUT/PATCH/DELETE /api/medications/{id}` — `backend/routes/api.php`
  Sem consumidor no frontend.

- [ ] Avaliar endpoint `GET /api/auth/me` — `backend/routes/api.php`
  Sem consumidor no frontend.

- [ ] Avaliar endpoints `PUT/PATCH/DELETE /api/patients/{id}` — `backend/routes/api.php`
  Sem consumidor no frontend.

- [ ] Avaliar CRUD de fornecedores (store/show/update/delete) — `backend/routes/api.php`
  Apenas `GET /api/suppliers` é usado; o restante não tem wrapper nem tela.

- [ ] Avaliar endpoint `GET /api/sales` — `backend/routes/api.php`
  Sem consumidor no frontend.

- [ ] Avaliar endpoint `GET /api/sales/{id}` — `backend/routes/api.php`
  Sem consumidor no frontend.

- [ ] Avaliar endpoint `POST /api/sales/{id}/void` — `backend/routes/api.php`
  Sem consumidor no frontend.

- [ ] CSS potencialmente não usado — `frontend/assets/css/app.css`
  Rodar PurgeCSS em dry-run (ou DevTools Coverage) cruzando com HTML + templates de `page-behaviors.js`/`shell.js`/`ui.js` antes de remover qualquer regra.

## Melhorias — backend

- [ ] Proteger as rotas autenticadas com middleware — `backend/routes/api.php`, `backend/src/Core/Router.php`
  Hoje só `AuthController::me/logout` chamam `AuthService::authenticate()`; os demais endpoints (`/api/medications`, `/api/patients`, `/api/suppliers`, `/api/sales`, `/api/prescriptions`, `/api/purchase-orders`, `/api/dashboard`) respondem sem bearer token. Evidência: `grep -rn "authenticate" backend/src/Controllers/` → só `AuthController`. Adicionar checagem de auth no dispatch (ex.: rotas marcadas como protegidas) e exigir token nelas.

- [ ] Rate limiting / proteção contra brute-force no login — `backend/src/Controllers/AuthController.php`, `backend/src/Services/AuthService.php:33`
  `POST /api/auth/login` não limita tentativas. Adicionar throttle por IP/email (contador em tabela ou cache) e responder 429 ao estourar o limite.

- [ ] Paginação nos endpoints de listagem — `backend/src/Repositories/` (ex.: `MedicationRepository`, `PatientRepository`, `SaleRepository`)
  As queries de `index` retornam todas as linhas (sem `LIMIT`/`OFFSET`). Evidência: `grep -rn "LIMIT" backend/src/Repositories/` → nenhum. Adicionar `?page=&per_page=` com limite padrão e devolver metadados de paginação.

- [ ] Logging estruturado de erros — `backend/src/Core/App.php:58`
  `serverError()` monta a resposta 500 mas não registra a exceção em lugar nenhum (`grep -rn "error_log\|Logger" backend/src/` → nada). Logar `message`/`exception`/`trace` (arquivo ou stderr) para depuração em produção, onde `debug=false` oculta o erro.

- [ ] Suite de testes automatizados — `backend/tests/`
  Só existe `smoke.sh` (curl end-to-end); sem testes unitários e sem PHPUnit no `composer.json`. Adicionar PHPUnit como dev-dependency e cobrir `AuthService`, `MedicationService` (incl. `adjustStock`) e o `Validator`.

- [ ] Restringir CORS por configuração — `backend/src/Core/App.php:79`
  `Access-Control-Allow-Origin: *` está fixo no código. Ler a origem permitida de env (`CORS_ALLOWED_ORIGINS`) e ecoar só origens da allowlist, em vez do curinga.

## Melhorias — frontend

- [ ] Implementar a busca global da topbar — `frontend/assets/js/shell.js:64`
  O `<input type="search">` da topbar só recebe foco via tecla `/` (`shell.js:146`); não há handler que dispare busca. Evidência: `grep -rn "topbar-search" assets/js` → só markup + foco. Ligar a busca a medicamentos/pacientes/scripts ou remover o campo.

- [ ] Ligar ou remover os botões decorativos da topbar — `frontend/assets/js/shell.js:74`
  Botões "Notifications" (`bell`) e "Help" (`help-circle`) não têm listener. Evidência: `grep -rn "bell\|help-circle" assets/js` → só markup. Implementar a ação ou removê-los.

- [ ] Escapar dados da API antes de injetar via `innerHTML` (XSS) — `frontend/assets/js/page-behaviors.js`, `frontend/assets/js/shell.js`
  Várias telas montam HTML por template literal com `innerHTML` interpolando strings vindas da API (nomes de paciente/medicamento etc.) sem escape. Evidência: `grep -rn "escapeHtml\|sanitize" assets/js` → nenhum. Criar um `escapeHtml()` e aplicá-lo nos valores interpolados (ou usar `textContent`).

- [ ] Checar expiração do token proativamente — `frontend/assets/js/api.js:36`
  O `auth` guarda `expires_at` mas nunca o verifica; a sessão só é descartada ao receber 401. Validar `expires_at` no route guard (`main.js:8`) e redirecionar ao login antes de uma requisição falhar.

- [ ] Paginação nas listagens — `frontend/assets/js/page-behaviors.js` (`bindInventory`, `bindPatients`, vendas/pedidos)
  As tabelas renderizam todas as linhas de uma vez. Converge com a paginação do backend: consumir `?page=&per_page=` e adicionar controles de paginação.

- [ ] Loading state e prevenção de duplo-submit nos forms — `frontend/assets/js/page-behaviors.js`
  Botões "add"/"receive"/"pay" disparam ações assíncronas sem desabilitar o controle durante a requisição. Aplicar o padrão que o login já usa (`login.js:73`) para evitar envio duplicado.

- [ ] Feedback de offline / retry de rede — `frontend/assets/js/api.js:107`
  Em falha de rede o cliente lança `ApiError(0)` e a tela mostra o erro, mas sem opção de tentar de novo. Adicionar retry/botão "tentar novamente" e um indicador global de "API indisponível".

- [ ] Focus trap nos modais — `frontend/assets/js/ui.js:46`
  `openForm()` já trata Escape, clique fora e foca o primeiro campo, mas o Tab pode sair do modal (sem focus trap). Prender o foco dentro do `.modal-card` enquanto aberto.

- [ ] `aria-live` nos toasts e estados — `frontend/assets/js/ui.js:11`
  `toast()` insere mensagens sem região `aria-live`, então leitores de tela podem não anunciá-las. Adicionar `role="status"`/`aria-live="polite"` aos toasts e aos placeholders de erro.

- [ ] Externalizar a identidade da filial — `frontend/assets/js/data.js`, `frontend/assets/js/shell.js:21`
  `branch` (nome, `shiftLead`, `role`) é hardcoded em `data.js` e usado como fallback no shell. Buscar do backend (perfil/filial) em vez de constante no bundle.

- [ ] Extrair helper de render de tabela reutilizável — `frontend/assets/js/page-behaviors.js`
  O padrão "`tbody.innerHTML = lista.length ? linhas : placeholder`" se repete em inventory/patients/orders/sales. Extrair um helper único de render (linhas + estados loading/empty/error).

- [ ] Adicionar testes ao frontend (Vitest) — `frontend/package.json`
  Sem test runner e sem arquivos `*.test.js`/`*.spec.js`. Adicionar Vitest + jsdom e cobrir os helpers de `api.js` (`formatDate`, `initials`, `toneClass`, parsing do envelope/erro).

- [ ] Adicionar ESLint + Prettier — `frontend/package.json`
  Sem lint/format configurado. Adicionar para padronizar os ~1700 linhas de JS e pegar erros cedo.

- [ ] Pipeline de CI (build + lint + testes) — `.github/workflows/`
  Não há workflow algum (`ls .github/workflows` → inexistente). Adicionar CI que rode `npm run build`, o lint e os testes em cada push/PR.

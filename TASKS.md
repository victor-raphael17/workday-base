# TASKS — Remoção de código não usado

> Levantamento de código morto / não referenciado, feito por revisão estática (grep de
> definições × call sites) em `backend/` e `frontend/`. **Nenhum código foi alterado** — este
> arquivo só lista as tarefas. Cada item traz arquivo:linha, evidência e nível de confiança.
>
> Gerado em: 2026-06-08.

---

## ✅ Alta confiança — código morto, remoção segura

Símbolos definidos e **nunca referenciados em lugar nenhum** do repositório.

- [ ] **Remover `Env::int()`** — `backend/src/Support/Env.php:37`
  Método público nunca chamado. A config usa `Env::get()`/`Env::bool()` (`config/config.php`);
  o TTL de sessão é lido via `(int) Env::get(...)`, não via `Env::int()`.
  _Evidência:_ `grep -rn "Env::int\|->int(" backend/` → nenhum call site.

- [ ] **Remover `SessionRepository::purgeExpired()`** — `backend/src/Repositories/SessionRepository.php:56`
  "Housekeeping" para apagar sessões expiradas, mas nunca é chamado (não há cron/comando que o
  invoque). A expiração já é tratada na leitura por `findValid()`.
  _Evidência:_ `grep -rn "purgeExpired" backend/` → só a definição.
  _Obs.:_ se a intenção é ter limpeza periódica, a alternativa é **passar a chamá-lo** (cron/CLI)
  em vez de remover — decisão do time.

- [ ] **Remover wrappers de API não usados pelo frontend** — `frontend/assets/js/api.js`
  Métodos do objeto `api` definidos mas sem nenhum call site no front:
  - [ ] `me` — linha 134 (`/api/auth/me`)
  - [ ] `medication` (singular, por id) — linha 140 (`/api/medications/{id}`)
  - [ ] `categories` — linha 144 (`/api/medications/categories`)
  - [ ] `sales` — linha 163 (`/api/sales`)
  - [ ] `voidSale` — linha 165 (`/api/sales/{id}/void`)

  _Evidência:_ `grep -rn "api\.<m>\b"` em `assets/js`, `pages`, `*.html` → só a definição.
  _Obs.:_ cada um espelha um endpoint real do backend. Como são thin clients de uma API
  pública, considere se o objetivo é um cliente **completo** (manter) ou **enxuto** (remover).

---

## ⚠️ Média confiança — caminho morto / parâmetro ignorado

Código que é "usado" sintaticamente, mas cujo valor não vai a lugar nenhum.

- [ ] **Parâmetro `reason` do ajuste de estoque é coletado e descartado**
  - Form coleta o motivo: `frontend/assets/js/page-behaviors.js:361`
  - Enviado ao backend: `frontend/assets/js/api.js` → `adjustStock(id, delta, reason)` (linha 146)
  - Validado: `backend/src/Controllers/MedicationController.php:88` e repassado na linha 94
  - **Descartado:** `backend/src/Services/MedicationService.php:112` recebe `?string $reason`
    mas **nunca o usa** (não persiste, não loga).

  _Duas saídas possíveis:_
  - **Remover** o parâmetro de ponta a ponta (form → api.js → controller → service), ou
  - **Implementar** o uso (gravar em audit log — ver `RN-PROP-02` em `BUSINESS_RULES.md`).

  Recomendado decidir junto, pois é uma meia-feature, não só lixo.

---

## 🔎 Baixa confiança — exige decisão de produto (não é remoção mecânica)

Não é "código morto" no sentido estrito; é **superfície de API/recursos sem consumo atual**.
Remover muda o contrato público. Listado para avaliação, **não** para remoção automática.

- [ ] **Endpoints do backend sem nenhum consumidor no frontend.** Existem nas rotas
  (`backend/routes/api.php`) mas o front não chama:
  - `GET /api/medications/{id}` (show)
  - `GET /api/medications/categories`
  - `GET /api/medications/low-stock` e `GET /api/medications/expiring`
    (o dashboard já devolve essas listas inline, então os endpoints dedicados ficam ociosos)
  - `PUT/PATCH/DELETE /api/medications/{id}`
  - `GET /api/auth/me`
  - `PUT/PATCH/DELETE /api/patients/{id}` e `GET /api/patients/{id}` (este último é usado)
  - **CRUD de fornecedores** inteiro exceto `GET /api/suppliers` (store/show/update/delete
    não têm wrapper nem tela)
  - `GET /api/sales`, `GET /api/sales/{id}`, `POST /api/sales/{id}/void`

  _Decisão:_ manter como API pública / preparada para telas futuras, **ou** podar o que não
  está no roadmap. Confirmar antes de mexer.

- [ ] **CSS potencialmente não usado** — `frontend/assets/css/app.css`
  Não enumerado aqui: detecção confiável de classes CSS órfãs exige ferramenta de cobertura
  (ex.: PurgeCSS em dry-run, ou DevTools Coverage) cruzando com HTML + strings de template em
  `page-behaviors.js`/`shell.js`/`ui.js`. Tarefa: rodar a ferramenta e revisar o relatório
  antes de remover qualquer regra (muitas classes são injetadas via template literal e não
  aparecem em busca textual simples).

---

## ℹ️ Notas / não-itens (verificado que NÃO é código morto)

Para evitar retrabalho — estes pareciam suspeitos mas **estão em uso**:

- `Request::input()` — usado em `PatientController`, `PurchaseOrderController`, `SaleController`.
- `Response::json()` — usado em `HealthController`.
- `config()` / `base_path()` (helpers) — usados em `AuthService`/`HealthController` e `App`.
- `Env::bool()` — usado em `config/config.php`.
- `data.js` (`branch`, `navigation`) — importado por `shell.js`.
- Todas as exceptions (`Domain/NotFound/Unauthorized/Validation/Http`) — em uso.
- Todos os exports de `ui.js`, `shell.js` e os demais de `api.js` — em uso.
- `PurchaseOrderRepository::items()` / `SaleRepository::items()` — chamados internamente por
  `find()`. (Opcional, **não** remoção: poderiam ser `private` em vez de `public`.)

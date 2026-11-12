# Ficha Interativa de Pré-Venda — Horto Ville III

Este pacote publica a ficha interativa e uma área administrativa para consultar os cadastros guardados no Supabase.

## Publicar no GitHub Pages

1. Envie todos os arquivos desta pasta à raiz do repositório. `index.html` e `admin.html` devem ficar na raiz; mantenha também a pasta `supabase/`.
2. No GitHub, abra **Settings → Pages** e selecione **Deploy from a branch**, branch `main`, pasta `/ (root)`. Salve e aguarde a publicação.
3. Anote a origem do site (por exemplo, `https://seu-usuario.github.io`) e o hostname correspondente (`seu-usuario.github.io`). Se usar domínio próprio, use a origem e o hostname desse domínio.

## Preparar o Supabase

1. No Supabase, crie ou selecione o projeto que receberá os cadastros. Em **SQL Editor**, execute `supabase/pre_venda_cadastros.sql`.
2. Em **Authentication → Users**, crie a conta administrativa que consultará as fichas. Confirme o usuário e anote seu UUID; ele será usado como `ADMIN_USER_ID`.
3. Crie um widget no Cloudflare Turnstile para o hostname do site e anote a **site key** e a **secret key**.
4. Publique uma Edge Function chamada `receber-ficha` com o conteúdo de `supabase/functions/receber-ficha/index.ts`. Desative **Verify JWT** para essa função; ela verifica o Turnstile antes de gravar. A configuração correspondente também está em `supabase/config.toml`.
5. Cadastre estes segredos nas configurações de Edge Function Secrets do Supabase:
   - `ADMIN_USER_ID`: UUID do usuário administrativo criado no passo 2.
   - `ALLOWED_ORIGIN`: origem exata do GitHub Pages, sem caminho e sem barra final (por exemplo, `https://seu-usuario.github.io`).
   - `TURNSTILE_SECRET_KEY`: secret key do widget.
   - `TURNSTILE_HOSTNAME`: hostname autorizado, sem protocolo ou caminho (por exemplo, `seu-usuario.github.io`).

O runtime da Edge Function fornece `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`. Nunca coloque essas credenciais de servidor ou a `TURNSTILE_SECRET_KEY` em arquivos do site ou no GitHub.

## Configurar os arquivos públicos

Em `index.html`, preencha as três constantes no início do primeiro script:

- `EDGE_FUNCTION_URL`: `https://SEU_PROJECT_REF.supabase.co/functions/v1/receber-ficha`
- `TURNSTILE_SITE_KEY`: site key pública do widget.
- `SUPABASE_PUBLISHABLE_KEY`: publishable key (ou a chave pública `anon`) do projeto.

Em `admin.html`, preencha `SUPABASE_URL` e `SUPABASE_ANON_KEY` com a URL e a chave pública do mesmo projeto. Essas chaves são públicas; a proteção dos cadastros depende da Edge Function e das políticas RLS do SQL.

Depois de preencher as configurações, envie as alterações para o GitHub. A ficha ficará na página inicial; a área restrita de consulta ficará em `/admin.html`. Entre nela com a conta administrativa do Supabase.

## Envio e armazenamento

Ao concluir a ficha, o usuário confirma o aviso de armazenamento, faz a verificação de segurança e escolhe **Enviar cópia e salvar PDF**. A ficha só informa que a cópia foi guardada e abre a impressão depois que o Supabase confirma o recebimento. Em caso de falha, os dados continuam no navegador para permitir uma nova tentativa. Também há uma opção separada para salvar apenas o PDF.

Os registros ficam em `pre_venda_cadastros`; a área administrativa exige login e a política RLS limita a consulta ao usuário proprietário configurado. A ficha inclui dados pessoais: restrinja o acesso à conta administrativa e compartilhe os PDFs com cuidado.

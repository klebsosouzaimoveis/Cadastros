# Diário de Trade & Gestão de Risco (dashboard dinâmico)

Site estático de **um único arquivo** (`index.html`): diário de trades, painel de risco, calculadora de posição, dashboard com 12 gráficos e relatórios (mensal e operacional). Não precisa de servidor, cadastro nem instalação.

## Como publicar de graça no GitHub Pages (sem usar terminal)

1. Crie uma conta em <https://github.com> (se ainda não tiver).
2. Clique em **New repository** (botão verde ou o **+** no topo). Dê um nome (ex.: `diario-trade`), marque **Public** e clique em **Create repository**.
3. Na página do repositório, clique em **uploading an existing file** (ou **Add file → Upload files**), arraste o `index.html` e o `README.md` e clique em **Commit changes**.
4. Vá em **Settings → Pages**. Em **Build and deployment**, escolha **Source: Deploy from a branch**, **Branch: main** e pasta **/ (root)**, e clique em **Save**.
5. Aguarde de 1 a 3 minutos. O endereço aparece na própria página de Pages e segue o formato:
   `https://SEU-USUARIO.github.io/diario-trade/`

Para atualizar depois: abra o `index.html` no repositório, clique no lápis (✏️), edite e faça **Commit changes**.

> No plano gratuito, o GitHub Pages exige repositório **público**. Isso torna público apenas o **código**. Seus trades **não** vão para o GitHub (veja "Onde ficam seus dados").

## Como usar (5 passos)

1. **Config**: ajuste capital inicial, risco por trade, perda diária/semanal, drawdown máximo, máx. de trades e RR mínimo. Cadastre seus ativos com o **valor do ponto** (WINFUT 0,20; WDOFUT 10; ações 1 — confirme na sua corretora). Os valores iniciais são **exemplos**.
2. **Gestão de Risco**: antes de operar, veja o **status geral** (Liberado / Atenção / Parar de operar) e use a **calculadora de posição** (entrada, stop, alvo → quantidade). O botão “Levar para o diário” já preenche o formulário.
3. **Diário**: preencha o formulário e salve. Aparecem em tempo real risco em R$ e %, RR e quantidade sugerida. Deixe a saída em branco para trades abertos e feche depois em **Editar**.
4. **Dashboard**: 30 indicadores e 12 gráficos atualizados a cada trade.
5. **Relatórios**: resultado mensal por ano, relatório operacional (overtrading, dias que estouraram o limite, trades sem stop, score de disciplina) e desempenho por setup, ativo, direção, dia, horário, emoção, erro e plano.

Dica: clique em **Carregar exemplo** para ver tudo funcionando com 30 trades fictícios e **Apagar tudo** para começar do zero.

## Onde ficam seus dados

- Tudo é salvo **no seu navegador** (localStorage), neste aparelho. Nada é enviado a servidores.
- Cada navegador/aparelho tem seus próprios dados. Para levar de um lugar para outro, use **Backup (JSON)** e **Restaurar**.
- Limpar os dados do navegador apaga o diário: **faça backup com frequência**. Há também **Exportar CSV** (abre no Excel).
- No celular, abra o site e use “Adicionar à tela inicial” para ter um atalho.

## Detalhes técnicos

- Os gráficos usam o Chart.js 4.4.1 carregado de CDN (precisa de internet). Para uso offline, baixe o `chart.umd.min.js`, coloque na mesma pasta e troque o `src` da tag `<script>` no `index.html`.
- Os cálculos (risco, R, drawdown, profit factor, payoff, expectativa, sequências, score de disciplina, painel de risco) seguem as mesmas fórmulas da planilha Excel `Gestao_Risco_Diario_Trade.xlsx`. Os 29 indicadores do exemplo foram conferidos contra a planilha.
- Capacidade: sem limite fixo de trades (o localStorage comporta milhares de registros).

## Aviso

Ferramenta de controle e organização. Não constitui recomendação de investimento. Valores de ponto, custos e limites de risco são premissas suas.

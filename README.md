# LexStudy Pro ⚖️ - Plataforma de Estudos Jurídicos & OAB

Sistema completo desenvolvido especialmente para **estudantes de Direito, bacharéis e candidatos ao Exame de Ordem (OAB)**.
Permite organizar o cronograma de estudos, ler legislações e escrever resumos/fichamentos diretamente na plataforma com um editor estilo **Google Docs**.

---

## 🌟 Funcionalidades Principais

### 1. 📝 Cadernos de Estudo (Editor Estilo Google Docs)
- **Folha Virtual A4**: Experiência de documento clássica com margens, paginação visual e salvamento automático contínuo.
- **Barra de Ferramentas Rica**:
  - Títulos (H1, H2), parágrafos normais.
  - Negrito, itálico, sublinhado e marca-texto amarelo.
  - Listas com marcadores e listas numeradas.
  - **Blocos Jurídicos Especializados**:
    - `⚖️ + Lei`: Insere caixas de citação de dispositivos legais.
    - `🏛️ + Súmula`: Citação de teses vinculantes e jurisprudência do STF/STJ.
    - `⚠️ + Alerta OAB`: Destaque para pegadinhas recorrentes e exceções da FGV.
- Contador de palavras e estimativa de tempo de leitura em tempo real.
- Impressão e exportação direta em formato A4 / PDF (`Ctrl + P`).

### 2. 📅 Cronograma & Ciclo de Estudos com Repetição Espaçada
- Planejamento detalhado por disciplina jurídica e tópico do edital.
- **Método de Revisão Espaçada (D+1, D+7, D+30)** para retenção de conteúdo a longo prazo.
- Prioridades estratégicas (Alta para matérias com maior peso na prova, Média e Baixa).
- Alternância rápida de status em 1 clique: *Pendente* ➔ *Em Andamento* ➔ *Concluído* ➔ *Para Revisar*.

### 3. 📚 Biblioteca Jurídica & Vade Mecum Digital
- Acervo organizado de fontes do Direito:
  - **Constituição Federal de 1988**
  - **Estatuto da OAB (Lei 8.906/94)**
  - **Código Civil (Lei 10.406/02)**
  - **Código de Processo Civil (Lei 13.105/15)**
  - **Código Penal & Processo Penal**
  - **Súmulas Vinculantes do STF**
- Lista dos artigos mais cobrados em cada norma.
- Opção de fixar no topo e botão para **"Criar Caderno a partir desta Lei"** em 1 clique.

### 4. ⏱️ Cronômetro Pomodoro Jurídico Integrado
- Sessões de estudo de 25 minutos para foco absoluto.
- Seleção da matéria estudada durante o ciclo.
- Registro automático das horas líquidas estudadas no painel.

### 5. 🎯 Simulados & Questões Comentadas
- Treinamento com questões no formato FGV / Exame de Ordem.
- Gabarito imediato com justificativa doutrinária e indicação dos artigos legais correspondentes.

### 6. 📊 Painel & Metas do Estudante
- Contagem regressiva de dias até a prova do **47º Exame de Ordem**.
- Acompanhamento das metas diárias de horas líquidas.
- Gráficos de dedicação semanal e distribuição do estudo por disciplinas.

### 7. 💾 Backup & Armazenamento Local
- Todos os resumos e cronogramas ficam salvos no seu próprio navegador no `localStorage`.
- Opção para exportar e baixar um arquivo `.json` com todos os seus cadernos para guardar no seu computador ou Google Drive.

---

## 🚀 Como Executar

```bash
cd gestao-web
npm run dev
```

Acesse o endereço: **http://localhost:5173/**

# PRD - Editor e Visualizador de Markdown (Markdown Lite)

| **Versão** | **Data** | **Autor** | **Status** |
| :--- | :--- | :--- | :--- |
| 1.0 | 24/05/2024 | [Seu Nome] | Rascunho |

---

## 1. Visão Geral do Produto
### 1.1 Objetivo
Desenvolver uma aplicação web leve que permita aos usuários criar, editar e visualizar arquivos em formato Markdown. A aplicação deve suportar a renderização de diagramas Mermaid.js e gerenciar o armazenamento de arquivos localmente no servidor, segregado por nome de usuário, sem necessidade de autenticação complexa.

### 1.2 Público-Alvo
Usuários que necessitam de um editor de notas rápido, desenvolvedores que desejam documentar códigos com diagramas e usuários que preferem não realizar cadastros formais.

### 1.3 Escopo
*   **Inclui:** Editor de texto, Preview em tempo real, Suporte a Mermaid, Gerenciamento básico de arquivos (Criar, Listar, Abrir, Salvar), Armazenamento local por usuário.
*   **Não Inclui:** Sistema de login/senha, banco de dados SQL/NoSQL, colaboração em tempo real, versionamento de arquivos.

---

## 2. Requisitos Funcionais

| ID | Requisito | Descrição | Prioridade |
| :--- | :--- | :--- | :--- |
| **RF01** | **Identificação do Usuário** | O sistema deve solicitar apenas um "nome de usuário" (nickname) no acesso inicial para definir o namespace de armazenamento. | Alta |
| **RF02** | **Listagem de Arquivos** | O sistema deve listar todos os arquivos `.md` existentes na pasta correspondente ao usuário. | Alta |
| **RF03** | **Criar Arquivo** | O usuário deve poder criar um novo arquivo markdown informando um nome único. | Alta |
| **RF04** | **Abrir Arquivo** | O usuário deve poder selecionar um arquivo da lista e carregar seu conteúdo no editor. | Alta |
| **RF05** | **Salvar Arquivo** | O usuário deve poder salvar as alterações do conteúdo atual no arquivo aberto. | Alta |
| **RF06** | **Editor Markdown** | A interface deve possuir uma área de texto para edição raw do markdown. | Alta |
| **RF07** | **Visualizador (Preview)** | A interface deve renderizar o markdown editado para HTML legível. | Alta |
| **RF08** | **Suporte Mermaid.js** | O visualizador deve detectar blocos de código identificados como `mermaid` e renderizá-los como diagramas. | Alta |

---

## 3. Requisitos Não Funcionais

| ID | Requisito | Descrição |
| :--- | :--- | :--- |
| **RNF01** | **Backend** | A aplicação deve ser desenvolvida utilizando o framework **Python Flask**. |
| **RNF02** | **Armazenamento** | Os arquivos devem ser salvos no sistema de arquivos do servidor em pastas nomeadas como `bd_<nome_do_usuario>`. |
| **RNF03** | **Banco de Dados** | Não deve ser utilizado nenhum SGBD. O persistência é baseada exclusivamente em arquivos `.md`. |
| **RNF04** | **Autenticação** | Não deve haver sistema de login ou senha. A identificação é baseada apenas no nome informado na sessão. |
| **RNF05** | **Renderização** | A conversão de Markdown e Mermaid deve ocorrer preferencialmente no **Client-side** (navegador) para reduzir carga no servidor. |
| **RNF06** | **Responsividade** | A interface deve ser legível em dispositivos desktop e móveis. |
| **RNF07** | **Tecnologia** | Usar apenas HTML, CSS e JavaScript puro, no máximo pode usar HTMX. |
---

## 4. Regras de Negócio e Segurança

### 4.1 Segurança de Arquivos e Usuários
*   **RN01 - Sanitização de Usuário:** O nome do usuário não pode conter caracteres especiais, espaços ou barras (`/`, `\`, `..`). Apenas alfanuméricos e underscore são permitidos (Regex: `^[a-zA-Z0-9_-]+$`).
*   **RN02 - Sanitização de Arquivo:** O nome dos arquivos deve ser sanitizado para prevenir *Path Traversal*. O uso de `werkzeug.utils.secure_filename` é obrigatório no backend.
*   **RN03 - Extensão Forçada:** Todos os arquivos salvos devem ter a extensão `.md` obrigatoriamente.
*   **RN04 - Isolamento de Pastas:** Um usuário não deve conseguir acessar arquivos da pasta de outro usuário manipulando a URL ou requisições.

### 4.2 Gestão de Arquivos
*   **RN05 - Conflito de Nomes:** Ao criar um novo arquivo, se o nome já existir na pasta do usuário, o sistema deve alertar e pedir confirmação para sobrescrever ou solicitar um novo nome.
*   **RN06 - Arquivo Vazio:** Não é permitido salvar um arquivo sem nome.
*   **RN07 - Limite de Tamanho:** (Opcional) O arquivo não deve exceder 5MB para evitar travamentos no navegador.

---

## 5. Interface e Experiência do Usuário (UX)

### 5.1 Layout Geral
*   **Header:**
    *   Exibição do nome do usuário atual.
    *   Botões de ação: `Novo`, `Salvar`, `Lista de Arquivos`.
*   **Sidebar (Lista de Arquivos):**
    *   Lista clicável com os nomes dos arquivos encontrados em `bd_<usuario>`.
*   **Área Principal (Split View):**
    *   **Esquerda:** `Textarea` para edição do código Markdown.
    *   **Direita:** `Div` para visualização do HTML renderizado (Preview).

### 5.2 Fluxo de Interação
1.  **Login:** Usuário acessa a root -> Input de Nome -> Redireciona para `/editor/<nome>`.
2.  **Edição:** Usuário digita no lado esquerdo -> O lado direito atualiza (debounce de 300ms).
3.  **Mermaid:** Usuário escreve:
    ```mermaid
    graph TD;
    A-->B;
    ```
    O preview renderiza o gráfico automaticamente.
4.  **Salvamento:** Usuário clica em "Salvar" -> Feedback visual (Toast/Snackbar) "Arquivo Salvo com Sucesso".

---

## 6. Especificações Técnicas

### 6.1 Estrutura de Pastas no Servidor
```text
/projeto
  /app.py
  /templates
  /static
  /bd_joao
    nota1.md
    diagrama.md
  /bd_maria
    ideias.md
```

### 6.2 Bibliotecas Sugeridas
*   **Backend:** `Flask`, `Werkzeug` (para `secure_filename`).
*   **Frontend (Markdown):** `Marked.js` ou `Markdown-it`.
*   **Frontend (Diagramas):** `Mermaid.js` (via CDN).
*   **Editor:** `CodeMirror` ou `EasyMDE` (para highlight de sintaxe).

### 6.3 Endpoints da API (Flask)
*   `GET /`: Página de login (input de username).
*   `GET /editor/<username>`: Carrega a interface do editor.
*   `GET /api/files/<username>`: Retorna lista de arquivos JSON.
*   `GET /api/file/<username>/<filename>`: Retorna o conteúdo do arquivo.
*   `POST /api/save/<username>/<filename>`: Recebe o conteúdo e salva no disco.

---

## 7. Critérios de Aceite
1.  O usuário consegue criar uma pasta `bd_teste` automaticamente ao acessar pela primeira vez.
2.  Diagramas Mermaid são renderizados corretamente no preview.
3.  Tentativas de acessar `../` no nome do usuário ou arquivo são bloqueadas.
4.  O arquivo salvo no disco corresponde exatamente ao conteúdo digitado no editor.
5.  A aplicação roda localmente sem necessidade de configuração de banco de dados.

---

## 8. Backlog Futuro (Fora do Escopo MVP)
*   Funcionalidade de Excluir Arquivo.
*   Funcionalidade de Renomear Arquivo.
*   Exportação para PDF.
*   Temas (Dark/Light Mode).
*   Histórico de versões (Undo/Redo persistente).
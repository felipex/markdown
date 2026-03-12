# Markdown Lite

Uma aplicação web para edição de arquivos Markdown, minimalista e eficiente.

## 🚀 Funcionalidades

- **Edição em Tempo Real**: Visualize o resultado do seu Markdown instantaneamente.
- **Multi-usuário**: Sistema baseado em nicknames, onde cada usuário possui seu próprio diretório de arquivos (`bd_username`).
- **Persistência Automática**: Seus arquivos são salvos localmente no servidor.
- **Pronto para Produção**: Configurado para rodar com Gunicorn.

## 🛠️ Tecnologias Utilizadas

- **Backend**: Python, Flask
- **Frontend**: HTML5, CSS3, JavaScript
- **Servidor WSGI**: Gunicorn
- **Testes**: Pytest

## 📋 Pré-requisitos

- Python 3.12 ou superior
- Ambiente virtual (`venv`) configurado e ativo

## ⚙️ Instalação e Uso

O projeto inclui um `Makefile` para facilitar as operações comuns.

### 1. Instalar dependências
```bash
make install
```

### 2. Executar a aplicação (via Gunicorn)
```bash
make run
```
A aplicação estará disponível em `http://localhost:5000`.

### 3. Parar a aplicação
```bash
make stop
```

### 4. Executar testes
```bash
make test
```

### 5. Limpeza de arquivos temporários
```bash
make clean
```

## 🏗️ Estrutura do Projeto

- `app.py`: Servidor Flask e rotas da API.
- `gunicorn.conf.py`: Configurações de performance para o Gunicorn (workers, etc).
- `static/`: Arquivos CSS e JS.
- `templates/`: Templates HTML (index e editor).
- `tests/`: Suíte de testes automatizados.
- `requirements.txt`: Dependências do Python.
- `Makefile`: Atalhos para comandos frequentes.

---
Desenvolvido com ❤️ por Felipe.

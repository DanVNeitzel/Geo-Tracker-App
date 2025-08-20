# Geo-Tracker-App

Sistema de geolocalização com rastreamento de **latitude** e **longitude**, cálculo de **velocidade média**, **velocidade máxima** e exibição do **traçado do percurso**.

---

## 📌 Sobre o Projeto
O **Geo-Tracker-App** é uma aplicação web que utiliza a API de geolocalização dos navegadores para monitorar sua posição em tempo real.  
Ele mostra informações essenciais de deslocamento e o caminho percorrido, funcionando diretamente no navegador, sem necessidade de instalação.

---

## 🛠️ Tecnologias Utilizadas
- **HTML** – estrutura da interface  
- **CSS** – estilização e layout  
- **JavaScript** – lógica de rastreamento e cálculos  
- **Service Worker** (opcional) – suporte a PWA / funcionamento offline  
- **Manifest JSON** – configuração para instalação como aplicativo web  

---

## 📂 Estrutura do Projeto

```
Geo-Tracker-App/
│── index.html          # Interface principal
│── style.css           # Estilos da aplicação
│── script.js           # Lógica de geolocalização e cálculos
│── service-worker.js   # Cache e suporte a PWA
│── manifest.json       # Configuração para instalação como app
```

---

## 🚀 Como Usar

1. Clone o repositório:
   ```bash
   git clone https://github.com/DanVNeitzel/Geo-Tracker-App.git
   ```

2. Acesse a pasta do projeto:
   ```bash
   cd Geo-Tracker-App
   ```

3. Abra o arquivo **`index.html`** em um navegador moderno (Chrome, Edge, Firefox etc).

4. Permita o acesso à **localização** quando solicitado pelo navegador.

---

## ✨ Funcionalidades
- 📍 Captura da **latitude** e **longitude** em tempo real  
- ⚡ Cálculo de **velocidade média** e **velocidade máxima**  
- 🗺️ Exibição do **traçado percorrido**  
- 📲 Suporte para uso como **PWA** (instalação no celular ou desktop)  

---

## 🔮 Melhorias Futuras
- Exibição do mapa integrado (Google Maps / Leaflet.js).  
- Histórico de trajetos percorridos.  
- Exportação de dados (GPX/CSV).  
- Interface responsiva com tema escuro/claro.  

---

## 📜 Licença
Este projeto ainda não possui licença definida.  
Sugestão: [MIT License](https://opensource.org/licenses/MIT).

---

## 👨‍💻 Autor
Desenvolvido por **[DanVNeitzel](https://github.com/DanVNeitzel)**  

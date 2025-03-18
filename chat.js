// chat.js
document.addEventListener('DOMContentLoaded', () => {
  const nickname = localStorage.getItem('nickname') || 'Anonymous';
  const chatMessages = document.getElementById('chatMessages');
  const onlineUsersList = document.getElementById('onlineUsers');
  const messageInput = document.getElementById('messageInput');
  const sendBtn = document.getElementById('sendBtn');
  const serverStatusDiv = document.getElementById('serverStatus');

  let socket;
  let isConnected = false;

  function connectWebSocket() {
    // Łączenie z serwerem VPS o IP 83.168.95.35 na porcie 8080
    socket = new WebSocket('ws://83.168.95.35:8080');

    socket.onopen = () => {
      isConnected = true;
      console.log('Połączono z serwerem');
      // Wysłanie nicku do serwera
      socket.send(JSON.stringify({ type: 'setNickname', nickname: nickname }));
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'connection') {
        console.log(data.message);
      } else if (data.type === 'message') {
        displayMessage(data, data.nickname === nickname);
      } else if (data.type === 'system') {
        displaySystemMessage(data.message);
      } else if (data.type === 'updateUsers') {
        updateOnlineUsers(data.users);
      } else if (data.type === 'error') {
        displaySystemMessage(data.message);
      }
    };

    socket.onerror = () => {
      showServerOffline();
    };

    socket.onclose = () => {
      isConnected = false;
      showServerOffline();
    };
  }

  function showServerOffline() {
    serverStatusDiv.textContent = "Serwer jest offline.";
    serverStatusDiv.style.display = 'block';
    setTimeout(() => {
      serverStatusDiv.textContent = "";
      serverStatusDiv.style.display = 'none';
    }, 6000);
  }

  function displayMessage(data, isOwn) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', isOwn ? 'own' : 'received');
    const header = document.createElement('div');
    header.classList.add('message-header');
    header.textContent = `${data.nickname} [${new Date(data.time).toLocaleTimeString()}]`;
    const content = document.createElement('div');
    content.classList.add('message-content');

    // Jeśli wiadomość zawiera link do obrazu (jpg, png, gif, jpeg)
    if (data.content.match(/\.(jpeg|jpg|gif|png)$/i)) {
      const img = document.createElement('img');
      img.src = data.content;
      img.alt = 'Obraz';
      img.classList.add('message-image');
      content.appendChild(img);
    } else {
      content.textContent = data.content;
    }

    messageDiv.appendChild(header);
    messageDiv.appendChild(content);
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function displaySystemMessage(message) {
    const systemDiv = document.createElement('div');
    systemDiv.classList.add('system-message');
    systemDiv.textContent = message;
    chatMessages.appendChild(systemDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function updateOnlineUsers(users) {
    onlineUsersList.innerHTML = '';
    users.forEach(user => {
      const li = document.createElement('li');
      li.textContent = user;
      onlineUsersList.appendChild(li);
    });
  }

  sendBtn.addEventListener('click', sendMessage);
  messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });

  function sendMessage() {
    const msg = messageInput.value.trim();
    if (msg && isConnected) {
      socket.send(JSON.stringify({ type: 'message', content: msg }));
      messageInput.value = '';
    }
  }

  // Wysyłanie ping co 5 sekund w celu odświeżenia listy użytkowników
  setInterval(() => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: 'ping' }));
    }
  }, 5000);

  connectWebSocket();
});

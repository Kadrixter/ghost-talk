// script.js
document.addEventListener("DOMContentLoaded", function() {
    const landing = document.getElementById("landing");
    const nicknameInput = document.getElementById("nicknameInput");
    const joinBtn = document.getElementById("joinBtn");
    const chatContainer = document.getElementById("chatContainer");
    const userList = document.getElementById("userList");
    const messagesDiv = document.getElementById("messages");
    const messageInput = document.getElementById("messageInput");
    const sendBtn = document.getElementById("sendBtn");
  
    let ws;
    let nickname = "";
  
    // Aktywacja przycisku "Dołącz do chatu" po wpisaniu minimum 5 znaków
    nicknameInput.addEventListener("input", function() {
      joinBtn.disabled = nicknameInput.value.trim().length < 5;
    });
  
    joinBtn.addEventListener("click", function() {
      nickname = nicknameInput.value.trim();
      if (nickname.length < 5) return;
      // Podłączamy się do serwera WebSocket
      // W produkcji zmień "ws://localhost:8080" na adres Twojego VPS
      ws = new WebSocket("ws://localhost:8080");
      
      ws.addEventListener("open", function() {
        ws.send(JSON.stringify({ type: "join", nickname: nickname }));
        landing.classList.add("hidden");
        chatContainer.classList.remove("hidden");
      });
  
      ws.addEventListener("message", function(event) {
        const data = JSON.parse(event.data);
        if (data.type === "joined") {
          if (!data.success) {
            alert(data.error);
            ws.close();
          }
        } else if (data.type === "user_list") {
          updateUserList(data.users);
        } else if (data.type === "message") {
          addMessage(data);
        }
      });
  
      ws.addEventListener("close", function() {
        addSystemMessage("Połączenie z serwerem zostało przerwane.");
      });
    });
  
    // Wysyłanie wiadomości po kliknięciu przycisku lub naciśnięciu Enter
    sendBtn.addEventListener("click", sendMessage);
    messageInput.addEventListener("keydown", function(e) {
      if (e.key === "Enter") {
        sendMessage();
      }
    });
  
    function sendMessage() {
      const text = messageInput.value.trim();
      if (text === "" || !ws || ws.readyState !== WebSocket.OPEN) return;
      ws.send(JSON.stringify({ type: "message", text }));
      messageInput.value = "";
    }
  
    function addMessage(data) {
      const messageDiv = document.createElement("div");
      messageDiv.classList.add("message");
      // Stylizacja wiadomości: wysłane vs odebrane
      if (data.nickname === nickname) {
        messageDiv.classList.add("sent");
      } else {
        messageDiv.classList.add("received");
      }
      
      // Jeśli wiadomość zawiera link do obrazu, wstawiamy obrazek
      const urlRegex = /(https?:\/\/[^\s]+\.(jpg|jpeg|png|gif))/i;
      const match = data.text.match(urlRegex);
      if (match) {
        const parts = data.text.split(urlRegex);
        messageDiv.innerHTML = `<strong>${data.nickname}:</strong> ${parts[0]}`;
        const img = document.createElement("img");
        img.src = match[0];
        messageDiv.appendChild(img);
        if(parts.length > 1) {
          const additionalText = document.createElement("span");
          additionalText.innerHTML = parts[parts.length - 1];
          messageDiv.appendChild(additionalText);
        }
      } else {
        messageDiv.innerHTML = `<strong>${data.nickname}:</strong> ${data.text}`;
      }
      messagesDiv.appendChild(messageDiv);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
  
    function updateUserList(users) {
      userList.innerHTML = "";
      users.forEach(function(user) {
        const li = document.createElement("li");
        li.textContent = user;
        userList.appendChild(li);
      });
    }
  
    function addSystemMessage(text) {
      const messageDiv = document.createElement("div");
      messageDiv.classList.add("message", "system");
      messageDiv.style.textAlign = "center";
      messageDiv.style.fontStyle = "italic";
      messageDiv.textContent = text;
      messagesDiv.appendChild(messageDiv);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
  });
  
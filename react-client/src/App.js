import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Input from "@mui/material/Input";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import AccountCircle from "@mui/icons-material/AccountCircle";
import {
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  InputAdornment,
  Typography,
} from "@material-ui/core";
import Stomp from "stompjs";
import SockJS from "sockjs-client";

const App = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [nickname, setNickname] = useState("");
  const [stompClient, setStompClient] = useState(null);

  useEffect(() => {
    const socket = new SockJS("http://localhost:3000/ws");
    const client = Stomp.over(socket);

    client.connect({}, () => {
      client.subscribe("/topic/messages", (message) => {
        const receivedMessage = JSON.parse(message.body);
        setMessages((prevMessages) => [...prevMessages, receivedMessage]);
      });
    });

    setStompClient(client);

    return () => {
      client.disconnect();
    };
  }, []);

  const handleNicknameChange = (event) => {
    setNickname(event.target.value);
  };

  const handleMessageChange = (event) => {
    setMessage(event.target.value);
  };

  const sendMessage = () => {
    if (message.trim()) {
      const chatMessage = {
        nickname,
        content: message,
      };

      stompClient.send("/app/chat", {}, JSON.stringify(chatMessage));
      setMessage("");
    }
  };

  return (
    <div>
      <List>
        {messages.map((msg, index) => (
          <ListItem key={index}>
            <ListItemAvatar>
              <Avatar>{msg.nickname.charAt(0)}</Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Typography variant="subtitle1">{msg.nickname}</Typography>
              }
              secondary={msg.content}
            />
          </ListItem>
        ))}
      </List>

      <div style={{ display: "flex", alignItems: "center" }}>
        <TextField
          placeholder="Enter your nickname"
          value={nickname}
          onChange={handleNicknameChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <AccountCircle />
              </InputAdornment>
            ),
          }}
          autoFocus
        />
        <TextField
          placeholder="Type a message"
          value={message}
          onChange={handleMessageChange}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              sendMessage();
            }
          }}
          fullWidth
        />
        <IconButton onClick={sendMessage} disabled={!message.trim()}>
          send
        </IconButton>
      </div>
    </div>
  );
};

export default App;

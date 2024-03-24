import { useState, useEffect } from "react";
import "./App.css";
import TextField from "@mui/material/TextField";
import Avatar from "@mui/material/Avatar";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { GoogleLogin, useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import socketIO from "socket.io-client";

const socket = socketIO.connect("http://localhost:3000");
var REC = "";

function stringToColor(string) {
  let hash = 0;
  let i;

  /* eslint-disable no-bitwise */
  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = "#";

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  /* eslint-enable no-bitwise */

  return color;
}

function stringAvatar(name) {
  return {
    sx: {
      bgcolor: stringToColor(name),
    },
    children: `${name.split(" ")[0][0]}`,
  };
}

function ContactName(props) {
  return (
    <>
      <div
        className="contact"
        id={props.name}
        onClick={function (event) {
          REC = event.target.id;
        }}
      >
        <Avatar {...stringAvatar(props.name)} /> {props.name}
      </div>
    </>
  );
}

function TextBlob(props) {
  return (
    <>
      <div className="blob">
        <Avatar {...stringAvatar(props.name)} /> {props.name}
        <br></br>
        {props.text}
      </div>
    </>
  );
}

function sendMsg(msg, from, to) {
  console.log(msg, from, to);
  socket.emit("message", JSON.stringify({ msg: msg, from: from, to: to }));
}

function App() {
  const [msg, setMsg] = useState("");
  const [recvr, setRecvr] = useState("");
  const [currentRecvr, setCurrentRecvr] = useState("");
  const [user, setUser] = useState([]);
  const [profile, setProfile] = useState([]);
  const [contactList, setContactList] = useState([]);
  const login = useGoogleLogin({
    onSuccess: (codeResponse) => setUser(codeResponse),
    onError: (error) => console.log("Login Failed:", error),
  });
  useEffect(() => {
    socket.on("contactListSent", async (contacts) => {
      setContactList(contacts["contacts"]);
    });
    socket.on("message",async(message)=>{
      console.log(message)
    })
  }, [socket]);
  useEffect(() => {
    setCurrentRecvr(REC);
  }, [msg]);
  useEffect(() => {
    if (user) {
      axios
        .get(
          `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${user.access_token}`,
          {
            headers: {
              Authorization: `Bearer ${user.access_token}`,
              Accept: "application/json",
            },
          }
        )
        .then((res) => {
          setProfile(res.data);
          console.log(res.data);
        })
        .catch((err) => console.log(err));
    }
  }, [user]);
  useEffect(() => {
    if (profile) {
      socket.emit("online", { profile: profile });
    }
  });
  return (
    <>
      <div className="contacts">
        <h2>Contacts</h2>
        <button onClick={login}>
          {profile.length == 0 ? "Sign in with Google 🚀" : profile["email"]}
        </button>
        <TextField
          value={recvr}
          onChange={(e) => setRecvr(e.target.value)}
          id="outlined-textarea"
          label="Add Recipient"
          placeholder="Add Recipient"
          className="addrecp"
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              REC = recvr;
              setRecvr("");
              setCurrentRecvr(REC);
              socket.emit("addInContacts", {
                ids: [profile["email"].split("@")[0], REC],
              });
              setContactList((contactList) => [...contactList, REC]);
            }
          }}
        />
        {contactList.map((name) => (
          <ContactName name={name}></ContactName>
        ))}
        <br></br>
      </div>
      <div className="chats">
        <div className="CurrentChat">
          <ContactName name={currentRecvr} />
        </div>
        <div className="texts"></div>
        <TextField
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          id="outlined-textarea"
          label="Text"
          placeholder="Text"
          className="textField"
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              sendMsg(msg, profile["email"].split("@")[0], currentRecvr);
              setMsg("");
            }
          }}
        />
      </div>
    </>
  );
}

export default App;

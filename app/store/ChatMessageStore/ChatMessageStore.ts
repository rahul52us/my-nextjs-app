import { action, makeObservable, observable } from "mobx";
import { io, Socket } from "socket.io-client";
import { backendBaseSocketUrl } from "../../config/constant/urls";

type DefaultEventsMap = Record<string, unknown>; // Define the DefaultEventsMap type

class ChatMessageStore {
  auth: any;
  sockteId: any = null;
  onlineConnectedUsers: any = [];
  userConnected: boolean = false;
  socket: Socket<DefaultEventsMap> | null = null; // Use the DefaultEventsMap type

  openMessageDrawer = {
    type: "",
    open: false,
  };

  constructor() {
    makeObservable(this, {
      openMessageDrawer: observable,
      userConnected: observable,
      setOpenMessageDrawer: action,
      createTask: action,
      sockteId: observable,
      socket: observable,
      onlineConnectedUsers: observable,
      createSocketConnection: action,
      setUserConnected: action,
      addOnlineConnectedUsers: action,
      removeOnlineConnectedUsers: action,
    });
  }

  setUserConnected = () => {
    this.userConnected = true;
  };

  createSocketConnection = () => {
    const socketUrl = backendBaseSocketUrl;
    this.socket = io(socketUrl);
    this.socket.on("connect", () => {
      this.sockteId = this.socket?.id;
    });
  };

  addOnlineConnectedUsers = (user: any) => {
    this.onlineConnectedUsers = [...this.onlineConnectedUsers, user];
  };

  removeOnlineConnectedUsers = (user: any) => {
    this.onlineConnectedUsers = this.onlineConnectedUsers.filter(
      (item: any) => item.socketId !== user.socketId
    );
  };

  createTask = async () => {};

  setOpenMessageDrawer = (type: string, data?: any) => {
    this.openMessageDrawer.open = this.openMessageDrawer.open ? false : true;
    this.openMessageDrawer.type = type;
    if (type === "edit") {
      console.log(data);
    } else {
    }
  };
}

export default ChatMessageStore;

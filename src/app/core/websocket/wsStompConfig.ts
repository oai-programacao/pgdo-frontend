import SockJS from "sockjs-client";

export const wsStompConfig = {
    webSocketFactory: () => new SockJS("http://localhost:8080/api/ws-connect"),
    heartbeatIncoming: 0,
    heartbeatOutgoing: 20000,
    reconnectDelay: 5000,
};

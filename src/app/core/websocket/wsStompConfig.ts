import SockJS from "sockjs-client";

export const wsStompConfig = {
    webSocketFactory: () => new SockJS("wss://apipgdo.oai.com.br/api/ws-connect"),
    heartbeatIncoming: 0,
    heartbeatOutgoing: 20000,
    reconnectDelay: 5000,
};
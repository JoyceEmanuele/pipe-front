import { useEffect, useState, useMemo } from 'react';

import { __WS_URL__ } from 'providers';

// Receber status de DAC, DUT e DAM na listagem de DACs, DUTs, DAMs e units
// Receber telemetrias de DUT para atualizar tela de units
// Solicitar dados históricos e de uso

type EventCallback = (type: string, payload: any) => void;

const wsConn = {
  socket: null as null|WebSocket,
  shouldBeConnected: false,
  currentStatus: 'desconectado',
  reconnectTimer: null as null|NodeJS.Timeout,
  connectTimeout: null as null|NodeJS.Timeout,
  listeners: [] as (EventCallback|null)[],

  connectToServer() {
    const token = localStorage.getItem('@diel:token');
    if (!token) return;

    wsConn.close();

    console.log('connecting websocket...');
    wsConn.currentStatus = 'conectando';

    // wsConn.connectTimeout = setTimeout(() => {
    //   console.log('wsConn:connectTimeout')
    //   if (wsConn.socket instanceof WebSocket) {
    //     try {
    //       // 0 CONNECTING: Socket has been created. The connection is not yet open.
    //       // 1 OPEN: The connection is open and ready to communicate.
    //       // 2 CLOSING: The connection is in the process of closing.
    //       // 3 CLOSED: The connection is closed or couldn't be opened.
    //       if (wsConn.socket.readyState === 0 || wsConn.socket.readyState === 1) {
    //         wsConn.socket.close()
    //       }
    //     } catch (error) { console.log(error) }
    //   }
    // }, 15 * 1000)
    wsConn.socket = new WebSocket(`${__WS_URL__}?token=${token}`);
    wsConn.socket.addEventListener('open', wsConn.onSocketOpen);
    wsConn.socket.addEventListener('close', wsConn.onSocketClose);
    wsConn.socket.addEventListener('error', wsConn.onSocketError);
    wsConn.socket.addEventListener('message', wsConn.onSocketMessage);
  },

  close() {
    wsConn.shouldBeConnected = false;
    wsConn.currentStatus = 'desconectado';
    if (wsConn.connectTimeout) clearTimeout(wsConn.connectTimeout);
    if (wsConn.socket instanceof WebSocket) {
      try {
        // 0 CONNECTING: Socket has been created. The connection is not yet open.
        // 1 OPEN: The connection is open and ready to communicate.
        // 2 CLOSING: The connection is in the process of closing.
        // 3 CLOSED: The connection is closed or couldn't be opened.
        if (wsConn.socket.readyState === 0 || wsConn.socket.readyState === 1) {
          wsConn.socket.close();
        }
        if (wsConn.reconnectTimer) {
          clearTimeout(wsConn.reconnectTimer);
          wsConn.reconnectTimer = null;
        }
      } catch (error) {
        console.log(error);
      }
    }
    wsConn.socket = null;
  },

  onSocketOpen(event: WebSocketEventMap['open']) {
    console.log('socket:open');
    // console.log(event)
    wsConn.shouldBeConnected = true;
    wsConn.currentStatus = 'conectado';
    if (wsConn.connectTimeout) clearTimeout(wsConn.connectTimeout);
    if (wsConn.reconnectTimer) clearTimeout(wsConn.reconnectTimer);

    // socket.send('Hello Server!')
    wsConn.publish('socket', wsConn.socket);
  },

  onSocketClose(event: WebSocketEventMap['close']) {
    console.log('socket:close', wsConn.shouldBeConnected);
    // console.log(event)
    wsConn.currentStatus = 'desconectado';
    if (wsConn.connectTimeout) clearTimeout(wsConn.connectTimeout);
    if (wsConn.shouldBeConnected) {
      console.log('will try to reconnect');
      if (wsConn.reconnectTimer) {
        console.log('alerta: timer reconexão não deveria estar definido');
      }
      wsConn.reconnectTimer = setTimeout(() => {
        if (wsConn.currentStatus !== 'conectado') {
          console.log('tentando reconectar...', wsConn.currentStatus);
          wsConn.connectToServer();
          wsConn.shouldBeConnected = true;
        }
      }, 5000);
    }

    wsConn.publish('close', event);
  },

  onSocketMessage(event: WebSocketEventMap['message']) {
    // console.log('socket:message')
    // console.log(event)
    wsConn.publish('message', JSON.parse(event.data));
  },

  onSocketError(event: WebSocketEventMap['error']) {
    console.log('socket:error');
    console.log(event);
    // wsConn.publish('error', event)
  },

  addListener(callback: EventCallback) {
    if (!wsConn.listeners.includes(callback)) { wsConn.listeners.push(callback); }
    if (wsConn.currentStatus === 'conectado') { setTimeout(() => callback('socket', wsConn.socket), 0); }
    if (wsConn.currentStatus === 'desconectado') { wsConn.connectToServer(); }

    function useEffectRemover() {
      try {
        callback('closing', wsConn.socket);
      } catch (err) { console.log(err); }
      wsConn.removeListener(callback);
    }
    return useEffectRemover;
  },

  send(message: string|{}) {
    if (!wsConn.socket) return false;
    if (typeof (message) !== 'string') { message = JSON.stringify(message); }
    try {
      wsConn.socket.send(message as string);
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  },

  sendJson(message: {}) {
    return wsConn.send(message);
  },

  removeListener(callback: EventCallback) {
    wsConn.listeners = wsConn.listeners.filter((cb) => (cb != null && cb !== callback));
    if (wsConn.listeners.length === 0) {
      setTimeout(() => {
        if (wsConn.listeners.length === 0 && wsConn.currentStatus !== 'desconectado') {
          console.log('Closing wsConn');
          wsConn.close();
        }
      }, 3000);
    }
  },

  publish(type: string, payload: any) {
    for (let i = 0; i < wsConn.listeners.length; i++) {
      try {
        if (wsConn.listeners[i]) { wsConn.listeners[i]!(type, payload); }
      } catch (err) {
        console.log(err);
        wsConn.listeners[i] = null;
      }
    }
  },
};

export default wsConn;

export function useWebSocket(onOpen: (p: typeof wsConn) => void, onMessage: (p: any) => void, beforeClose: (p: typeof wsConn) => void) {
  useEffect(() => {
    function wscallback(event: string, payload: any) {
      if (event === 'socket' && onOpen) {
        try {
          onOpen(wsConn);
        } catch (err) { console.log(err); }
      }
      if (event === 'message' && onMessage) {
        try {
          onMessage(payload);
        } catch (err) { console.log(err); }
      }
      if (event === 'closing' && beforeClose) {
        try {
          beforeClose(wsConn);
        } catch (err) { console.log(err); }
      }
    }
    const useEffectRemover = wsConn.addListener(wscallback);
    return useEffectRemover;
  }, []);
}

export type WSConn = typeof wsConn;

export function useWebSocketLazy() {
  const wsh = useMemo(() => ({
    started: false,
    onOpen: null as null|((p: WSConn) => void),
    onMessage: null as null|((p: any) => void),
    beforeClose: null as null|((p: WSConn) => void),
    start(onOpen: (p: WSConn) => void, onMessage: (p: { type: string, data: any }) => void, beforeClose: (p: WSConn) => void) {
      if (wsh.started) return false;
      wsh.started = true;
      wsh.onOpen = onOpen;
      wsh.onMessage = onMessage;
      wsh.beforeClose = beforeClose;
      wsConn.addListener(wsh.wscallback);
      return true;
    },
    wscallback(event: string, payload: any) {
      if (event === 'socket' && wsh.onOpen) {
        try {
          wsh.onOpen(wsConn);
        } catch (err) { console.log(err); }
      }
      if (event === 'message' && wsh.onMessage) {
        try {
          wsh.onMessage(payload);
        } catch (err) { console.log(err); }
      }
      if (event === 'closing' && wsh.beforeClose) {
        try {
          wsh.beforeClose(payload);
        } catch (err) { console.log(err); }
      }
    },
  }), []);
  useEffect(() => () => { wsConn.removeListener(wsh.wscallback); }, []);
  return wsh;
}

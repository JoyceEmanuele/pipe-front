import {
  Button,
} from 'components';
import { useStateVar } from 'helpers/useStateVar';
import { useWebSocket } from 'helpers/wsConnection';

export function IoTMonitoring(): JSX.Element {
  const [state, render, setState] = useStateVar({
    monitorDevMessages: 'DEV011119999',
    iotMessages: [] as { key: string, topic: string, payload: string }[],
    socket: null as null|WebSocket,
  });

  useWebSocket(onWsOpen, onWsMessage, beforeWsClose);

  function onWsOpen(wsConn) {
    state.socket = wsConn.socket;
  }
  function onWsMessage(message) {
    if (message.type === 'iotMessage') iotMessageReceived(message.data);
  }

  function beforeWsClose(wsConn) {
    wsConn.send({ type: 'subscribeTelemetry', data: {} });
  }

  function iotMessageReceived(iotMessage) {
    console.log(iotMessage);
    if (iotMessage && iotMessage.topic) {
      iotMessage.key = Date.now();
      state.iotMessages.push(iotMessage);
      render();
    }
  }

  function monitorDevMessages() {
    if (state.socket && state.socket.readyState === 1) {
      const request = { type: 'monitorDevMessages', data: { devId: state.monitorDevMessages } };
      state.socket.send(JSON.stringify(request));
    }
  }

  return (
    <div>
      <input
        value={state.monitorDevMessages}
        style={{ width: '150px' }}
        onChange={(e) => { state.monitorDevMessages = e.target.value; render(); }}
      />
      <Button variant="primary" style={{ marginTop: '20px' }} onClick={monitorDevMessages}>Monitorar Mensagens</Button>
      {state.iotMessages.map((message) => (
        <div key={message.key}>
          Tópico:
          {' '}
          {message.topic}
          {' '}
          - Payload:
          {' '}
          {message.payload}
        </div>
      ))}
    </div>
  );
}

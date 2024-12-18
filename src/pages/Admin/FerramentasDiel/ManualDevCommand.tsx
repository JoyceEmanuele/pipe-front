import {
  Button,
  Loader,
  Input,
} from 'components';
import { useStateVar } from 'helpers/useStateVar';
import { apiCall } from 'providers';

export function ManualDevCommand(): JSX.Element {
  const [state, render, setState] = useStateVar({
    devId: 'DEV122223333',
    payload: '{"propname":"value"}',
    enviando: false,
  });

  async function sendDevCommand() {
    if (state.enviando) return;
    try {
      setState({ enviando: true });
      await apiCall('/realtime/devtools/publish_dev_cmd', {
        devId: state.devId,
        payload: JSON.parse(state.payload),
      });
      // alert('Sucesso')
    } catch (err) { console.log(err); alert('Erro'); }
    setState({ enviando: false });
  }

  return (
    <div style={{ display: 'flex', gap: '15px' }}>
      <Input
        placeholder="DEV ID"
        value={state.devId}
        style={{ width: '400px' }}
        onChange={(e) => { state.devId = e.target.value; render(); }}
      />
      <Input
        placeholder="Payload"
        value={state.payload}
        style={{ width: '400px' }}
        onChange={(e) => { state.payload = e.target.value; render(); }}
      />
      <Button variant="primary" onClick={sendDevCommand}>
        {state.enviando ? <Loader /> : <span>Enviar</span>}
      </Button>
    </div>
  );
}

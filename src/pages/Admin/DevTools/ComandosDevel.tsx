import {
  Button,
  Loader,
  Input,
} from 'components';
import { useStateVar } from 'helpers/useStateVar';
import { apiCall } from 'providers';

export function ComandosDevel(): JSX.Element {
  const [state, render, setState] = useStateVar({
    comandoDevel: '',
    comandoDevelParams: '{}',
    enviando: false,
  });

  async function sendDevelCommand() {
    if (state.enviando) return;
    try {
      setState({ enviando: true });
      const reqParams = { ...JSON.parse(state.comandoDevelParams || '{}'), command: state.comandoDevel };
      await apiCall('/devtools/run-command', reqParams);
      alert('Sucesso');
    } catch (err) { console.log(err); alert('Erro'); }
    setState({ enviando: false });
  }

  return (
    <div>
      <Input
        value={state.comandoDevel}
        onChange={(e) => { state.comandoDevel = e.target.value; render(); }}
        placeholder="Comando"
      />
      <br />
      <Input
        value={state.comandoDevelParams}
        onChange={(e) => { state.comandoDevelParams = e.target.value; render(); }}
        placeholder="Parâmetros"
      />
      <Button variant="primary" style={{ marginTop: '20px' }} onClick={sendDevelCommand}>
        {state.enviando ? <Loader /> : <span>Enviar</span>}
      </Button>
    </div>
  );
}

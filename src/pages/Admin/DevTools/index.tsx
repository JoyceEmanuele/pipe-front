import { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { toast } from 'react-toastify';
import {
  Loader,
} from 'components';
import { useStateVar } from 'helpers/useStateVar';
import { AdminLayout } from '../AdminLayout';
import {
  Card,
  CardTitle,
} from './styles';
import { ComandosDevel } from './ComandosDevel';
import { IoTMonitoring } from './IoTMonitoring';
import { EcoModeDebug } from './EcoModeDebug';
import { withTransaction } from '@elastic/apm-rum-react';

export function DevTools(): JSX.Element {
  const [state, render, setState] = useStateVar(() => ({
    loading: true,
    cards: [
      { comp: <ComandosDevel />, title: 'Comandos Devel' },
      { comp: <IoTMonitoring />, title: 'IoT Monitoring' },
      { comp: <EcoModeDebug />, title: 'EcoMode DAM Debug' },
    ] as { comp: JSX.Element, title: string, show?: boolean }[],
  }));

  useEffect(() => {
    fetchData();
  }, []);
  async function fetchData() {
    try {
      setState({ loading: true });
    } catch (err) { console.log(err); toast.error('Houve erro'); }
    setState({ loading: false });
  }

  return (
    <>
      <Helmet>
        <title>Diel Energia - Development Tools</title>
      </Helmet>
      <AdminLayout />
      {state.loading && <Loader variant="primary" />}
      {(!state.loading) && (
        <>
          {state.cards.map((card, i) => (
            <Card key={i}>
              <>
                <CardTitle onClick={() => { card.show = !card.show; render(); }}>
                  <p>
                    { card.title }
                  </p>
                </CardTitle>
                {card.show && card.comp}
              </>
            </Card>
          ))}
        </>
      )}
    </>
  );
}

export default withTransaction('DevTools', 'component')(DevTools);

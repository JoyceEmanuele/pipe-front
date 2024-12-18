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
import { ExportarDevs } from './ExportarDevs';
import { TemprtMediaDUTs } from './ExportarDuts/TemprtMediaDUTs';
import { MachineConsumption } from './MachineConsumption';
import { DeviceTelemetry } from './DeviceTelemetry';
import { MedicaoTempDuts } from './ExportarDuts/MedicaoTempDuts';
import { useTranslation } from 'react-i18next';
import { ManualDevCommand } from './ManualDevCommand';
import { withTransaction } from '@elastic/apm-rum-react';

export function FerramentasDiel(): JSX.Element {
  const { t } = useTranslation();
  const [state, render, setState] = useStateVar(() => ({
    loading: true,
    cards: [
      { comp: <ExportarDevs />, title: t('exportarListasDispositivos') },
      { comp: <TemprtMediaDUTs />, title: t('exportarTemperaturaMediaDiariaDuts') },
      { comp: <MedicaoTempDuts />, title: t('exportarMedicoesTemperaturaDuts') },
      { comp: <MachineConsumption />, title: t('exportarConsumoMaquinas') },
      { comp: <DeviceTelemetry />, title: t('exportarDadosTelemetriaDispositivos') },
      { comp: <ManualDevCommand />, title: t('enviarComandoParaDispositivo') },
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
        <title>Diel Energia - Ferramentas Diel</title>
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
          {/* <div>Permitir exportar dados e debugar estratégias</div> */}
        </>
      )}
    </>
  );
}

export default withTransaction('FerramentasDiel', 'component')(FerramentasDiel);

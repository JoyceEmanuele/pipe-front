import { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { useHistory, useRouteMatch } from 'react-router';
import { toast } from 'react-toastify';
import {
  Button,
  Card,
  Loader,
} from '~/components';
import jsonTryParse from '~/helpers/jsonTryParse';
import { useStateVar } from '~/helpers/useStateVar';
import IntegrLayout, { IntegrBreadCrumbs } from '~/pages/Analysis/Integrations/IntegrLayout';
import { apiCall, ApiResps } from '~/providers';
import WaterProfileEdit from '../../Units/UnitWater/WaterProfileEdit';
import { IntegrDevInfo } from '../IntegrPerfil/IntegrDevInfo';
import { waterVars } from '../IntegrPerfil/WaterProfile';
import { CardsConfig } from './CardsConfig';
import { CoolAutomationEdit } from './CoolAutomationEdit';
import { DriConfig } from './DriConfig';
import { withTransaction } from '@elastic/apm-rum-react';

export interface CardsCfg {
  cards: string[]
  subcards: string[]
  relevances: string[]
  varscards: {
    [varId: string]: { card?: string, subcard?: string, relevance?: string | number, valUnit?: string }
  }
}

export const IntegrEdit = (): JSX.Element => {
  const { t } = useTranslation();
  const match = useRouteMatch<{ integrType: 'diel'|'ness'|'greenant'|'coolautomation'|'laager', integrId: string }>();
  const history = useHistory();
  const { integrType, integrId } = match.params;

  const [state, render, setState] = useStateVar(() => ({
    isLoading: true,
    devInfoResp: null as (null|ApiResps['/get-integration-info']),
    varsCfg: null as (null|ApiResps['/get-integration-info']['dri']),
    varsList: [] as {
        varId: string
        name: string
        currVal?: string
        valUnit?: string
        card?: string
        subcard?: string
        relevance?: string | number
      }[],
    cards: [] as string[],
    subcards: [] as string[],
    relevances: [] as string[],
  }));

  useEffect(() => {
    (async function () {
      try {
        setState({ isLoading: true });
        let response;
        if (integrId.startsWith('DMA')) {
          response = await apiCall('/get-integration-info', { supplier: 'diel-dma', integrId });
        } else {
          response = await apiCall('/get-integration-info', { supplier: integrType, integrId });
        }
        state.devInfoResp = response;
        state.varsCfg = (response.dri);
        state.varsList = (response.dri && response.dri.varsList)
        || (response.info.supplier === 'Laager' && waterVars) || [];
        const cardsCfg = (response.cardsCfg && jsonTryParse<CardsCfg>(response.cardsCfg)) || null;
        state.cards = (cardsCfg && cardsCfg.cards) || [];
        state.subcards = (cardsCfg && cardsCfg.subcards) || [];
        state.relevances = (cardsCfg && cardsCfg.relevances) || [];
        if (cardsCfg && cardsCfg.varscards) {
          for (const rowVar of state.varsList) {
            if (cardsCfg.varscards[rowVar.varId]) {
              rowVar.card = cardsCfg.varscards[rowVar.varId].card;
              rowVar.subcard = cardsCfg.varscards[rowVar.varId].subcard;
              rowVar.relevance = cardsCfg.varscards[rowVar.varId].relevance;
              rowVar.valUnit = cardsCfg.varscards[rowVar.varId].valUnit;
            }
          }
        }
      } catch (err) {
        toast.error(t('erro'));
        console.log(err);
      }
      setState({ isLoading: false });
    }());
  }, []);

  async function save() {
    try {
      const cardsCfg: CardsCfg = {
        cards: state.cards,
        subcards: state.subcards,
        relevances: state.relevances,
        varscards: {},
      };
      for (const rowVar of state.varsList) {
        cardsCfg.varscards[rowVar.varId] = {
          card: rowVar.card,
          subcard: rowVar.subcard,
          relevance: rowVar.relevance || 1,
          valUnit: rowVar.valUnit ?? undefined,
        };
      }
      await apiCall('/save-integration-info', { supplier: integrType, integrId, cardsCfg: JSON.stringify(cardsCfg) });
      history.push(history.location.pathname.replace('/editar', '/perfil'));
    } catch (err) {
      console.log(err);
      toast.error(t('erro'));
    }
  }
  const handleUpdateIntegrPerfil = (installationLocation?: string | null, installationDate?: string | null, totalCapacity?: number | null, quantityOfReservoirs?: number | null, hydrometerModel?: string | null) => {
    state.devInfoResp!.info.installationLocation = installationLocation;
    state.devInfoResp!.info.installationDate = installationDate;
    state.devInfoResp!.info.totalCapacity = totalCapacity;
    state.devInfoResp!.info.quantityOfReservoirs = quantityOfReservoirs;
    state.devInfoResp!.info.hydrometerModel = hydrometerModel;
    render();
  };
  return (
    <>
      <Helmet>
        <title>{t('tituloPagDielEnergiaIntegracoes')}</title>
      </Helmet>
      <IntegrBreadCrumbs integrId={match.params.integrId} integrType={match.params.integrType} devInfo={state.devInfoResp && state.devInfoResp.info} />
      <IntegrLayout integrType={match.params.integrType} integrId={match.params.integrId} varsCfg={state.varsCfg} />
      <div style={{ height: '30px' }} />
      <Card>
        <div>
          {state.isLoading && (
            <Loader />
          )}
          {(state.devInfoResp && !state.isLoading) && (
            <>
              {(integrType === 'diel' && integrId.startsWith('DRI')) ? (
                <>
                  {/* <DRIPRofile devInfo={state.devInfoResp.info} varsCfg={state.varsCfg} /> */}
                  <br />
                  <DriConfig
                    devInfoResp={state.devInfoResp}
                    varsList={state.varsList}
                    cards={state.cards}
                    subcards={state.subcards}
                    relevances={state.relevances}
                  />
                </>
              ) : (integrType === 'diel' && integrId.startsWith('DMA') ? (
                <WaterProfileEdit
                  integrType="water"
                  integrId={state.devInfoResp.info.integrId}
                  cardsCfg={state.devInfoResp.cardsCfg}
                  prevQuantityOfReservoirs={state.devInfoResp.info.quantityOfReservoirs}
                  prevTotalCapacity={state.devInfoResp.info.totalCapacity}
                  prevInstallationDate={state.devInfoResp.info.installationDate?.substring(0, 10)}
                  prevInstallationLocation={state.devInfoResp.info.installationLocation}
                  prevHydrometerModel={state.devInfoResp.info.hydrometerModel}
                  supplier={state.devInfoResp.info.supplier}
                  handleUpdateIntegrPerfil={handleUpdateIntegrPerfil}
                  clientInfo={{ NAME: state.devInfoResp.info.CLIENT_NAME, ID: state.devInfoResp.info.CLIENT_ID }}
                  unitInfo={{ NAME: state.devInfoResp.info.UNIT_NAME, ID: state.devInfoResp.info.UNIT_ID }}
                />
              ) : (
                <div>
                  <div style={{ fontWeight: 'bold', paddingBottom: '35px', fontSize: '1.25em' }}>{t('editar')}</div>
                  <div style={{ fontWeight: 'bold', paddingBottom: '35px', fontSize: '1.25em' }}>{t('informacoes')}</div>
                  <IntegrDevInfo devInfo={state.devInfoResp.info} />
                </div>
              ))}

              {(integrType === 'coolautomation') && state.devInfoResp.coolautomation && (
                <>
                  <br />
                  <br />
                  <CoolAutomationEdit schedInfo={state.devInfoResp.coolautomation} />
                </>
              )}

              {(!['coolautomation', 'diel'].includes(integrType)) && (
                <>
                  <br />
                  <br />
                  <CardsConfig
                    integrType={integrType}
                    varsList={state.varsList}
                    cards={state.cards}
                    subcards={state.subcards}
                    relevances={state.relevances}
                  />

                  <br />
                  <br />
                  <div>
                    <Button
                      style={{ maxWidth: '100px' }}
                      onClick={() => save()}
                      variant="primary"
                    >
                      {t('botaoSalvar')}
                    </Button>
                    <Button
                      style={{ maxWidth: '120px', marginLeft: '22px' }}
                      onClick={() => history.push(history.location.pathname.replace('/editar', '/perfil'))}
                      variant="secondary"
                    >
                      {t('botaoCancelar')}
                    </Button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </Card>
    </>
  );
};

export default withTransaction('IntegrEdit', 'component')(IntegrEdit);

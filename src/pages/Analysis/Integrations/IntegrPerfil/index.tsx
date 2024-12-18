import { useEffect, useState } from 'react';

import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { useHistory, useRouteMatch } from 'react-router';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import {
  Button,
  Card,
  Loader,
} from '~/components';
import jsonTryParse from '~/helpers/jsonTryParse';
import { getUserProfile } from '~/helpers/userProfile';
import { useStateVar } from '~/helpers/useStateVar';
import IntegrLayout, { IntegrBreadCrumbs } from '~/pages/Analysis/Integrations/IntegrLayout';
import { apiCall, ApiResps } from '~/providers';
import { colors } from '~/styles/colors';

import { CardsCfg } from '../IntegrEdit';
import { CoolAutomationSchedTable } from '../IntegrEdit/CoolAutomationEdit';
import { DRIPRofile } from './DRIProfile';
import { IntegrDevInfo } from './IntegrDevInfo';
import { IntegrWaterInfo } from './IntegrWaterInfo';
import { TableNew2 } from './styles';
import { withTransaction } from '@elastic/apm-rum-react';
import { generateNameFormatted } from '~/helpers/titleHelper';

export const IntegrPerfil = (): JSX.Element => {
  const { t } = useTranslation();
  const history = useHistory();
  const match = useRouteMatch<{ integrType: 'diel'|'ness'|'greenant'|'coolautomation'|'water', integrId: string }>();
  const { integrType, integrId } = match.params;

  const [state, render, setState] = useStateVar(() => ({
    isLoading: true,
    devInfoResp: null as (null|ApiResps['/get-integration-info']),
  }));

  useEffect(() => {
    (async function () {
      try {
        setState({ isLoading: true });
        let response;

        if (integrId.startsWith('DMA')) {
          response = await apiCall('/get-integration-info', { supplier: 'diel-dma', integrId });
        } else if (integrType === 'water') {
          response = await apiCall('/get-integration-info', { supplier: 'laager', integrId });
        } else {
          response = await apiCall('/get-integration-info', { supplier: integrType, integrId });
        }
        state.devInfoResp = response;
      } catch (err) {
        toast.error(t('houveErro'));
        console.log(err);
      }
      setState({ isLoading: false });
    }());
  }, []);

  return (
    <>
      <Helmet>
        <title>{generateNameFormatted(state.devInfoResp?.info?.DEVICE_ID, t('perfil'))}</title>
      </Helmet>
      <IntegrBreadCrumbs integrId={match.params.integrId} integrType={match.params.integrType} devInfo={state.devInfoResp && state.devInfoResp.info} />
      <IntegrLayout integrType={match.params.integrType} integrId={match.params.integrId} varsCfg={state.devInfoResp?.dri} />
      <div style={{ paddingTop: '30px' }}>
        {state.isLoading && (
          <Loader />
        )}
        {(!state.isLoading) && state.devInfoResp
        && (
        <IntegrPerfilContents
          integrType={integrType}
          integrId={integrId}
          devInfoResp={state.devInfoResp}
          editLink={history.location.pathname.endsWith('/perfil') ? history.location.pathname.replace('/perfil', '/editar') : null}
        />
        )}
      </div>
    </>
  );
};

export function IntegrPerfilContents(props: {
  integrType: string
  integrId: string
  devInfoResp: ApiResps['/get-integration-info'],
  editLink: null|string
}): JSX.Element {
  const { t } = useTranslation();
  const history = useHistory();
  const { integrType, integrId, devInfoResp } = props;
  const [profile] = useState(getUserProfile);

  const [state, render, setState] = useStateVar(() => ({
    isLoading: true,
    varsCfg: null as (null|ApiResps['/get-integration-info']['dri']),
    varsList: [] as {
        varId: string
        name: string
        currVal?: string|null
        valUnit?: string
        card?: string
        subcard?: string
        timestamp?: string
        relevance?: string | number
      }[],
    coolautomation: null as null|{
        schedules: {
          days: ('Monday'|'Tuesday'|'Wednesday'|'Thursday'|'Friday'|'Saturday'|'Sunday')[],
          isDisabled: boolean
          endActionType: number
          scheduleCategory: number
          dates: unknown[]
          name: string
          powerOnTime: number
          powerOffTime?: number
          operationMode?: number
          setpoint: number
          system?: string
          unit?: string
          id: string
        }[]
      },
  }));

  useEffect(() => {
    (async function () {
      try {
        setState({ isLoading: true });
        const response = props.devInfoResp;
        state.varsCfg = (response.dri);
        state.varsList = (response.dri && response.dri.varsList) || [];
        state.coolautomation = response.coolautomation || null;
        const cardsCfg = (response.cardsCfg && jsonTryParse<CardsCfg>(response.cardsCfg)) || null;
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
        toast.error(t('houveErro'));
        console.log(err);
      }
      setState({ isLoading: false });
    }());
  }, []);

  return (
    <>
      <div>
        {state.isLoading && (
          <Loader />
        )}
        {(devInfoResp.info && !state.isLoading) && (
          <>
            {(integrType === 'diel' && integrId.startsWith('DRI')) ? (
              <Card>
                <>
                  <DRIPRofile devInfo={devInfoResp.info} varsCfg={state.varsCfg} />
                  {((profile.manageAllClients && (['diel'].includes(integrType))) || profile.permissions.isInstaller || profile.adminClientProg?.CLIENT_MANAGE.some((item) => item === devInfoResp.info?.CLIENT_ID)) && props.editLink && (
                    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                      <Button
                        style={{ maxWidth: '100px', marginTop: '15px' }}
                        onClick={() => history.push(props.editLink!)}
                        variant="primary"
                      >
                        {`${t('editar')}`}
                      </Button>
                    </div>
                  )}
                </>
              </Card>

            )
              : (
                <CardElement>
                  {((integrType === 'water') || (integrId.startsWith('DMA') && integrType === 'diel')) && (
                  <>
                    <Title>{t('informacoes')}</Title>
                    <IntegrWaterInfo integrId={integrId} devInfo={devInfoResp.info} />
                  </>
                  )}

                  {(integrType !== 'water' && integrType !== 'diel') && (
                  <>
                    <div style={{ fontWeight: 'bold', paddingBottom: '35px', fontSize: '1.25em' }}>{t('informacoes')}</div>
                    <IntegrDevInfo devInfo={devInfoResp.info} />
                  </>
                  )}

                  {(profile.manageAllClients && (['water', 'coolautomation'].includes(integrType) || integrId.startsWith('DMA')) || profile.permissions.isInstaller) && props.editLink && (
                  <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                    <Button
                      style={{ maxWidth: '100px', marginTop: '15px' }}
                      onClick={() => history.push(props.editLink!)}
                      variant="primary"
                    >
                      {t('editar')}
                    </Button>
                  </div>
                  )}

                </CardElement>
              )}
          </>
        )}
      </div>

      {(state.coolautomation) && (
        <div style={{ marginTop: '30px' }}>
          <CardElement>
            <div>
              <div style={{ fontWeight: 'bold', paddingBottom: '35px', fontSize: '1.25em' }}>{t('programacoesAdicionadas')}</div>
              {(state.coolautomation.schedules.length === 0) && (
                <div>{t('nenhuma')}</div>
              )}
              {(state.coolautomation.schedules.length > 0) && (
                <CoolAutomationSchedTable
                  schedInfo={state.coolautomation}
                />
              )}
            </div>
          </CardElement>
        </div>
      )}
    </>
  );
}

export const Title = styled.h1`
  font-size: 1.5em;
  color: ${colors.Grey400};
  font-weight: bold;
`;

export const CardElement = styled.div`
  padding: 32px;
  margin-top: 24px;
  border-radius: 16px;
  box-shadow: 0px 3px 8px rgba(0, 0, 0, 0.24), 0px 3px 12px rgba(0, 0, 0, 0.12);
`;

// <div>Protocolo de Comunicação</div>
// <div>Planilha</div>
// <div>Dados Recebidos</div>
// <div>Tabela com ID, Descrição (nome da variável), Valor Atual, Un. Medida, Card, Subcard</div>

export default withTransaction('IntegrPerfil', 'component')(IntegrPerfil);

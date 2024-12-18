import { useEffect, useState } from 'react';

import { Helmet } from 'react-helmet';
import { useRouteMatch } from 'react-router';
import { toast } from 'react-toastify';
import {
  Card,
  Loader,
} from '~/components';
import jsonTryParse from '~/helpers/jsonTryParse';
import { useStateVar } from '~/helpers/useStateVar';
import IntegrLayout, { IntegrBreadCrumbs } from '~/pages/Analysis/Integrations/IntegrLayout';
import { apiCall, ApiResps } from '~/providers';

import { UnitNessContent } from '../../Units/UnitNess';
import { CardsCfg } from '../IntegrEdit';
import { waterVars } from '../IntegrPerfil/WaterProfile';
import { CoolAutomationRealTime } from './CoolAutomationRealTime';
import { DmaRealTime } from './DmaRealTime';
import { DriRealTimeContents, getKeyByValue } from './DriContents';
import { WaterRealTimeContents } from './WaterRealTime';
import { useTranslation } from 'react-i18next';
import { withTransaction } from '@elastic/apm-rum-react';
import { driChillerCarrierApplications } from '~/helpers/driConfigOptions';
import DriChillerCarrierRealTime from './DriChillerCarrierRealTime/index';
import { getUserProfile } from '~/helpers/userProfile';
import { TimezoneWarn } from '~/components/TimezoneWarn';

export const IntegrRealTime = (): JSX.Element => {
  const { t } = useTranslation();
  const match = useRouteMatch<{ integrType: 'diel'|'ness'|'greenant'|'coolautomation'|'laager', integrId: string }>();
  const { integrType, integrId } = match.params;

  const [state, render, setState] = useStateVar(() => {
    const state = {
      isLoading: true,
      devInfoResp: null as (null|ApiResps['/get-integration-info']),
    };
    return state;
  });
  const [profile] = useState(getUserProfile);
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
        <title>{t('tituloPagDielEnergia')}</title>
      </Helmet>
      <IntegrBreadCrumbs integrId={match.params.integrId} integrType={match.params.integrType} devInfo={state.devInfoResp && state.devInfoResp.info} />
      <IntegrLayout integrType={match.params.integrType} integrId={match.params.integrId} varsCfg={state.devInfoResp?.dri} />
      <div style={{ paddingTop: '25px' }}>
        {state.isLoading && (
          <Loader />
        )}
        {(!state.isLoading) && state.devInfoResp && (
          <IntegrRealTimeContents
            integrType={integrType}
            integrId={integrId}
            devInfoResp={state.devInfoResp}
          />
        )}
      </div>
    </>
  );
};

export function IntegrRealTimeContents(props: {
  integrType: string
  integrId: string
  devInfoResp: ApiResps['/get-integration-info'],
}): JSX.Element {
  const { t } = useTranslation();
  const {
    integrType, integrId, devInfoResp,
  } = props;

  const [state, render, setState] = useStateVar(() => {
    const state = {
      isLoading: true,
      varsList: [] as {
        varId: string
        name: string
        currVal?: string
        valUnit?: string
        card?: string
        subcard?: string
        relevance?: number | string
      }[],
    };
    return state;
  });

  useEffect(() => {
    (async function () {
      try {
        const response = props.devInfoResp;
        state.varsList = (response.dri && response.dri.varsList)
        || (response.info.supplier === 'Laager' && waterVars) || [];
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
      {state.isLoading && (
        <Loader />
      )}
      {(!state.isLoading) && (
        <>
          {(integrType === 'diel' && integrId.startsWith('DRI'))
            ? (
              (devInfoResp.dri && getKeyByValue(driChillerCarrierApplications, devInfoResp.dri?.application))
                ? (
                  <DriChillerCarrierRealTime devId={integrId} varsList={props.devInfoResp.dri?.varsList} chillerModel={devInfoResp?.dri?.chillerModel} />
                )
                : (
                  <Card title={(devInfoResp && devInfoResp.info.dataSource) || integrId}>
                    <DriRealTimeContents devId={integrId} />
                  </Card>
                )
            )
            : (integrType === 'ness')
              ? (
                <Card title={(devInfoResp && devInfoResp.info.dataSource) || integrId}>
                  <UnitNessContent unitId={props.devInfoResp.info.UNIT_ID} />
                </Card>
              )
              : (integrType === 'coolautomation')
                ? (
                  <CoolAutomationRealTime devInfo={props.devInfoResp.info} coolAutomation={props.devInfoResp.coolautomation} />
                )
                : (integrType === 'water' && !integrId.startsWith('DMA'))
                  ? (
                    <Card title={(devInfoResp && devInfoResp.info.dataSource) || integrId}>
                      <WaterRealTimeContents unit_id={integrId} varsList={state.varsList} />
                    </Card>

                  )
                  : (integrId.startsWith('DMA') && (integrType === 'water' || integrType === 'diel')
                    ? <DmaRealTime dmaId={integrId} />
                    : (<div>{t('naoDisponivel')}</div>))}
        </>
      )}
    </>
  );
}

export default withTransaction('IntegrRealTime', 'component')(IntegrRealTime);

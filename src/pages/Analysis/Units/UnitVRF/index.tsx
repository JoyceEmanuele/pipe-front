import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import queryString from 'query-string';
import { Helmet } from 'react-helmet';
import { useHistory, useParams } from 'react-router';
import { toast } from 'react-toastify';

import {
  Card,
  Loader,
  Select,
} from '~/components';
import { useStateVar } from '~/helpers/useStateVar';
import { buildTabLink, IntegrInlineTabs } from '~/pages/Analysis/Integrations/IntegrLayout';
import { IntegrPerfilContents } from '~/pages/Analysis/Integrations/IntegrPerfil/index';
import { IntegrRealTimeContents } from '~/pages/Analysis/Integrations/IntegrRealTime/index';
import { TUnitInfo, UnitLayout } from '~/pages/Analysis/Units/UnitLayout';
import { apiCall, ApiResps } from '~/providers';
import { CoolAutomationHist } from '../../Integrations/IntegrHistory/CoolAutomationHist';
import { IntegrDevInfo } from '../../Integrations/IntegrPerfil/IntegrDevInfo';
import { CoolAutomationEdit } from '../../Integrations/IntegrEdit/CoolAutomationEdit';
import { withTransaction } from '@elastic/apm-rum-react';
import { generateNameFormatted } from '~/helpers/titleHelper';

export const UnitVRF = (): JSX.Element => {
  const history = useHistory();
  const { t } = useTranslation();
  const routeParams = useParams<{ unitId: string }>();
  const [state, render, setState] = useStateVar({
    unitId: Number(routeParams.unitId),
    isLoading: true,
    unitInfo: null as null| TUnitInfo,
    devicesList: [] as { dataSource: string, integrId: string }[],
    selectedDevice: null as null|{ dataSource: string, integrId: string },
    isLoadingDevice: false,
    devInfoResp: null as (null|ApiResps['/get-integration-info']),
  });

  async function handleGetUnitInfo() {
    try {
      setState({ isLoading: true });
      const [
        unitInfo,
        { list: devicesList },
      ] = await Promise.all([
        apiCall('/clients/get-unit-info', { unitId: state.unitId }),
        apiCall('/get-integrations-list', { supplier: 'coolautomation', unitIds: [state.unitId] }),
      ]);
      state.unitInfo = unitInfo;
      state.devicesList = devicesList;
      if (state.devicesList.length === 1) {
        state.selectedDevice = state.devicesList[0];
      }
    } catch (err) {
      console.log(err);
      toast.error(t('houveErro'));
    }
    setState({ isLoading: false });
  }

  useEffect(() => {
    handleGetUnitInfo();
  }, []);

  useEffect(() => {
    (async function () {
      try {
        if (!state.selectedDevice) return;
        setState({ isLoadingDevice: true });
        const response = await apiCall('/get-integration-info', { supplier: 'coolautomation', integrId: state.selectedDevice.integrId });
        state.devInfoResp = response;
      } catch (err) {
        toast.error(t('houveErro'));
        console.log(err);
      }
      setState({ isLoadingDevice: false });
    }());
  }, [state.selectedDevice]);

  const queryPars = queryString.parse(history.location.search);

  return (
    <>
      <Helmet>
        <title>{generateNameFormatted(state.unitInfo?.UNIT_NAME, t('sistemasVRF'))}</title>
      </Helmet>
      <UnitLayout unitInfo={state.unitInfo} />
      {(state.isLoading) && <Loader />}
      {(!state.isLoading) && (
        <>
          {(state.devicesList.length > 1) && (
            <div style={{ maxWidth: '400px', paddingTop: '20px' }}>
              <Select
                options={state.devicesList}
                value={state.selectedDevice}
                placeholder={t('dispositivo')}
                propLabel="dataSource"
                onSelect={(opt) => setState({ selectedDevice: opt })}
                notNull
              />
            </div>
          )}
          <div style={{ paddingTop: '10px' }}>
            {(state.isLoadingDevice) && <Loader />}
            {(!state.isLoadingDevice) && state.selectedDevice && state.devInfoResp && (
              <div>
                <div style={{ paddingTop: '20px', paddingBottom: '20px' }}>
                  <IntegrInlineTabs integrType="coolautomation" />
                </div>
                <div style={{ paddingBottom: '30px' }}>
                  {
                    (queryPars.aba === 'perfil')
                      ? (
                        <IntegrPerfilContents
                          integrType="coolautomation"
                          integrId={state.selectedDevice.dataSource}
                          devInfoResp={state.devInfoResp}
                          editLink={buildTabLink('editar', history)}
                        />
                      )
                      : ((queryPars.aba === 'tempo-real') || (!queryPars.aba))
                        ? (
                          <IntegrRealTimeContents
                            integrType="coolautomation"
                            integrId={state.selectedDevice.dataSource}
                            devInfoResp={state.devInfoResp}
                          />
                        )
                        : (queryPars.aba === 'historico')
                          ? (
                            <CoolAutomationHist
                              deviceId={state.selectedDevice.integrId}
                            />
                          )
                          : (queryPars.aba === 'editar')
                            ? (
                              <Card>
                                <div style={{ fontWeight: 'bold', paddingBottom: '35px', fontSize: '1.25em' }}>{t('informacoes')}</div>
                                <IntegrDevInfo devInfo={state.devInfoResp.info} />
                                <br />
                                <br />
                                <CoolAutomationEdit schedInfo={state.devInfoResp.coolautomation} />
                              </Card>
                            )
                            : '(vazio)'
                  }
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default withTransaction('UnitVRF', 'component')(UnitVRF);

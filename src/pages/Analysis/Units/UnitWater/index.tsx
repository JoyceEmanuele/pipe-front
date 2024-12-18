import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import queryString from 'query-string';
import { Helmet } from 'react-helmet';
import { useHistory, useParams } from 'react-router';
import { toast } from 'react-toastify';

import { WaterHistory } from '../../Integrations/IntegrHistory/WaterHistory/WaterHistory';
import { Loader } from '~/components';
import { useStateVar } from '~/helpers/useStateVar';
import { buildTabLink, IntegrInlineTabs } from '~/pages/Analysis/Integrations/IntegrLayout';
import { IntegrPerfilContents } from '~/pages/Analysis/Integrations/IntegrPerfil/index';
import { IntegrRealTimeContents } from '~/pages/Analysis/Integrations/IntegrRealTime/index';
import { TUnitInfo, UnitLayout } from '~/pages/Analysis/Units/UnitLayout';
import { apiCall, ApiResps } from '~/providers';
import WaterProfileEdit from './WaterProfileEdit';
import { withTransaction } from '@elastic/apm-rum-react';
import { generateNameFormatted } from '~/helpers/titleHelper';

export const UnitWater = (): JSX.Element => {
  const { t } = useTranslation();
  const history = useHistory();
  const routeParams = useParams<{ unitId: string }>();
  const queryParams = new URLSearchParams(window.location.search);
  const [state, render, setState] = useStateVar({
    unitId: Number(routeParams.unitId),
    supplier: queryParams.get('supplier'),
    supplierCheck: '',
    isLoading: true,
    unitInfo: null as null| TUnitInfo,
    unitMeter: undefined as undefined|{ dataSource: string },
    devInfoResp: null as (null|ApiResps['/get-integration-info']),
  });

  async function handleGetUnitInfo() {
    try {
      const supplierCheck = checkSupplier(state.supplier);
      state.supplierCheck = supplierCheck;
      setState({ isLoading: true });
      const [
        unitInfo,
        unitMetersList,
      ] = await Promise.all([
        apiCall('/clients/get-unit-info', { unitId: state.unitId }),
        apiCall('/get-integrations-list', { unitIds: [state.unitId], noStatus: true, supplier: supplierCheck }),
      ]);
      state.unitInfo = unitInfo;
      const unitMeter = unitMetersList.list[0] || undefined;
      state.unitMeter = unitMeter;
      state.devInfoResp = null;
      if (unitMeter || supplierCheck === 'water-virtual') {
        state.devInfoResp = await apiCall('/get-integration-info', { supplier: supplierCheck, integrId: unitMeter ? unitMeter.dataSource : '', unitId: state.unitId });
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

  const queryPars = queryString.parse(history.location.search);

  const handleUpdateIntegrPerfil = (installationLocation?: string | null, installationDate?: string | null, totalCapacity?: number | null, quantityOfReservoirs?: number | null, hydrometerModel?: string | null) => {
    state.devInfoResp!.info.installationLocation = installationLocation;
    state.devInfoResp!.info.installationDate = installationDate;
    state.devInfoResp!.info.totalCapacity = totalCapacity;
    state.devInfoResp!.info.quantityOfReservoirs = quantityOfReservoirs;
    state.devInfoResp!.info.hydrometerModel = hydrometerModel;
    render();
  };

  function checkSupplier(supplier: string | null) {
    if (supplier) {
      if (supplier === 'diel') return 'diel-dma';
      if (supplier === 'laager') return supplier;
    }
    return 'water-virtual';
  }

  return (
    <>
      <Helmet>
        <title>{generateNameFormatted(state.unitInfo?.UNIT_NAME, t('agua'))}</title>
      </Helmet>
      <UnitLayout unitInfo={state.unitInfo} />
      <br />
      {(state.isLoading) && <Loader />}
      {

      (!state.isLoading) && (state.unitMeter) && (state.devInfoResp) ? (
        <div>
          {queryPars.aba !== 'historico' && (
            <div style={{ paddingTop: '20px', paddingBottom: '20px' }}>
              <IntegrInlineTabs integrType="water" />
            </div>
          )}
          <div style={{ paddingBottom: '30px' }}>
            {
             (queryPars.aba === 'perfil') || (!queryPars.aba)
               ? (
                 <IntegrPerfilContents
                   integrType="water"
                   integrId={state.unitMeter.dataSource}
                   devInfoResp={state.devInfoResp}
                   editLink={buildTabLink('editar', history)}
                 />
               )
               : (queryPars.aba === 'tempo-real')
                 ? (
                   <IntegrRealTimeContents
                     integrType="water"
                     integrId={state.unitMeter.dataSource}
                     devInfoResp={state.devInfoResp}
                   />
                 )
                 : (queryPars.aba === 'historico')
                   ? (
                     <WaterHistory device_code={state.unitMeter.dataSource} status={state.devInfoResp.info.status} installationDate={state.devInfoResp.info.installationDate?.substring(0, 10)} unitId={state.devInfoResp.info.UNIT_ID} />
                   )
                   : ((queryPars.aba === 'editar')
                     ? (
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
                     )
                     : '(vazio)'
                   )
            }
          </div>
        </div>
      ) : (!state.isLoading) && (state.devInfoResp) && (
        <div>
          <IntegrPerfilContents
            integrType="water"
            integrId=""
            devInfoResp={state.devInfoResp}
            editLink={null}
          />
        </div>
      )
      }
    </>
  );
};

export default withTransaction('UnitWater', 'component')(UnitWater);

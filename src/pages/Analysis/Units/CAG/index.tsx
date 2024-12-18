import { Helmet } from 'react-helmet';
import { TUnitInfo, UnitLayout } from '../UnitLayout';
import { useHistory, useParams } from 'react-router-dom';
import { useStateVar } from '~/helpers/useStateVar';
import { ApiResps, apiCall } from '~/providers';
import { toast } from 'react-toastify';
import { useEffect, useState } from 'react';
import { Button, Card, Loader } from '~/components';
import { Headers2 } from '../../Header';
import { ChillerInlineTabs } from './ChillerLayout';
import i18n from '~/i18n';
import DriChillerCarrierRealTime from '../../Integrations/IntegrRealTime/DriChillerCarrierRealTime';
import { DRIPRofile } from '../../Integrations/IntegrPerfil/DRIProfile';
import queryString from 'query-string';
import { getUserProfile } from '~/helpers/userProfile';
import ChillerCarrierHistory from '../../Integrations/IntegrHistory/ChillerCarrierHistory';
import { generateNameFormatted } from '~/helpers/titleHelper';

const t = i18n.t.bind(i18n);

export const UnitCAG = (): JSX.Element => {
  const history = useHistory();
  const routeParams = useParams<{ unitId: string }>();
  const queryPars = queryString.parse(history.location.search);
  const linkBase = history.location.pathname;
  const [profile] = useState(getUserProfile);
  const [aba, setAba] = useState<string | string[] | null>();
  const [deviceId, setDeviceId] = useState<string | string[] | null>();
  const [links, setLinks] = useState<{
    title: string,
    link: string,
    visible: boolean,
    isActive: boolean,
  }[]>([]);
  const [state, render, setState] = useStateVar({
    unitId: Number(routeParams.unitId),
    isLoading: true,
    unitInfo: null as null| TUnitInfo,
    devInfoResp: null as (null|ApiResps['/get-integration-info']),
    listDriChiller: [] as {
      VARSCFG: string
      DEVICE_ID: string
      DEVICE_CODE: string
      MACHINE_NAME: string
    }[],
    links: [] as {
      title: string,
      link: string,
      visible: boolean,
      isActive: boolean,
    }[],
    listIntegrationInfo: [],
    driId: null as (null|string|string[]),
    varsList: [],
  });

  async function handleGetUnitInfo() {
    try {
      setState({ isLoading: true });
      const [
        unitInfo,
      ] = await Promise.all([
        apiCall('/clients/get-unit-info', { unitId: state.unitId }),
      ]);
      setState({
        listDriChiller: unitInfo.arrayChiller,
      });
      history.push(`${linkBase}?aba=tempo-real&driId=${unitInfo.arrayChiller[0]?.DEVICE_CODE}`);
      setDeviceId(unitInfo.arrayChiller[0]?.DEVICE_CODE);
      state.unitInfo = unitInfo;
      render();
    } catch (err) {
      console.log(err);
      toast.error(t('houveErro'));
    }
    setState({ isLoading: false });
  }

  async function handleGetDrisInfo() {
    try {
      if (deviceId) {
        const info = await apiCall('/get-integration-info', { supplier: 'diel', integrId: deviceId as string });
        state.devInfoResp = info;
        render();
      }
    } catch (err) {
      toast.error(t('houveErro'));
    }
  }

  useEffect(() => {
    Promise.resolve().then(async () => {
      await handleGetUnitInfo();
    });
  }, []);

  useEffect(() => {
    if (!queryPars.driId && !queryPars.aba && state.listDriChiller.length > 0) {
      const linkBase = `/analise/unidades/cag/${state.unitId}?aba=tempo-real&driId=${state.listDriChiller[0]?.DEVICE_CODE}`;
      history.push(`${linkBase}`);
    }
  }, [queryPars]);

  useEffect(() => {
    Promise.resolve().then(async () => {
      setState({ isLoading: true });
      setLinks(state.listDriChiller.map((item) => ({
        title: item.MACHINE_NAME || item.DEVICE_CODE,
        link: `/analise/unidades/cag/${state.unitId}?aba=tempo-real&driId=${item.DEVICE_CODE}`,
        visible: true,
        isActive: (deviceId === `${item.DEVICE_CODE}`),
      })));
      await handleGetDrisInfo();
      setState({ isLoading: false });
    });
  }, [state.listDriChiller, deviceId]);

  useEffect(() => {
    setDeviceId(queryPars.driId);
    if (queryPars.driId != null) {
      const foundItem = state.listDriChiller.find((item) => item.DEVICE_CODE === queryPars.driId!);
      let varsConfig: any;
      if (foundItem !== undefined) {
        varsConfig = JSON.parse(foundItem.VARSCFG);
        setState({ varsList: varsConfig?.varsList });
        render();
      }
    }
  }, [queryPars.driId]);

  useEffect(() => {
    setAba(queryPars.aba);
  }, [queryPars.aba]);

  function decideAba() {
    if (aba === 'perfil') {
      return t('perfil');
    }
    if (aba === 'tempo-real') {
      return t('tempoRealMaiusculo');
    }
    if (aba === 'historico') {
      return t('historico');
    }
    return '';
  }

  return (
    <>
      <Helmet>
        <title>{generateNameFormatted(state.unitInfo?.UNIT_NAME, decideAba())}</title>
      </Helmet>
      <UnitLayout unitInfo={state.unitInfo} />
      <div style={{ paddingTop: '10px' }}>
        <Headers2
          links={links}
          maxChar={20}
        />
      </div>
      <div style={{ paddingTop: '10px', marginBottom: 20 }}>
        {links.length > 0 && (
          <ChillerInlineTabs />
        )}
        <ChilerAbas
          state={state}
          aba={aba}
          deviceId={deviceId}
          profile={profile}
          linkBase={linkBase}
          queryPars={queryPars}
          history={history}
          varsList={state.devInfoResp?.dri?.varsList}
        />
      </div>
    </>
  );
};

function ChilerAbas({
  state, aba, deviceId, profile, history, varsList,
}): JSX.Element {
  function returnAbasChiller() {
    if (state.isLoading) {
      return (
        <Loader />
      );
    }
    if (aba === 'perfil' && deviceId) {
      return (
        <div style={{ marginTop: 20 }}>
          <Card>
            <>
              { state.devInfoResp && (<DRIPRofile devInfo={state.devInfoResp.info} varsCfg={JSON.parse(state.listDriChiller.find((item) => item.DEVICE_CODE === deviceId)?.VARSCFG || '')} />)}
              {(profile.manageAllClients || profile.permissions.isInstaller) && (
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <Button
                    style={{ maxWidth: '100px', marginTop: '15px' }}
                    onClick={() => history.push(`/integracoes/info/diel/${deviceId}/editar`)}
                    variant="primary"
                  >
                    {`${t('editar')}`}
                  </Button>
                </div>
              )}
            </>
          </Card>
        </div>
      );
    }
    if (aba === 'tempo-real' && deviceId) {
      return (
        <div style={{ marginTop: 20 }}>
          <DriChillerCarrierRealTime devId={deviceId as string} varsList={varsList} chillerModel={state?.devInfoResp?.dri?.chillerModel} />
        </div>
      );
    }
    if (aba === 'historico' && deviceId) {
      return (
        <div>
          <ChillerCarrierHistory driId={deviceId as string} model={state.devInfoResp.dri?.application} chillerModel={state?.devInfoResp?.dri?.chillerModel} />
        </div>
      );
    }
    return <></>;
  }
  return (
    <>
      {returnAbasChiller()}
    </>
  );
}

import {
  useEffect,
  useRef,
  useState,
} from 'react';
import { t } from 'i18next';
import queryString from 'query-string';
import { Helmet } from 'react-helmet';
import { useParams, useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Flex, Box } from 'reflexbox';
import styled from 'styled-components';

import { Loader } from 'components';
import { getUserProfile } from 'helpers/userProfile';
import { useStateVar } from 'helpers/useStateVar';
import { apiCall } from 'providers';
import { colors } from 'styles/colors';

import { Headers2 } from '../../Header';
import { TUnitInfo, UnitLayout } from '../UnitLayout';
import { MultipleDevProg } from './MultipleDevProg';
import RoomsList from './RoomsList';
import GeneralData from './GeneralData';
import { EnvironmentVisibility } from './EnvironmentVisibility';
import { withTransaction } from '@elastic/apm-rum-react';
import { UnitMap } from './UnitMap/UnitMap';
import Simcards from './Simcards';
import { UnitMapProvider } from './UnitMap/UnitMapContext';

export const EditUnitDevProg = (): JSX.Element => {
  const routeParams = useParams<{ unitId: string }>();
  const history = useHistory();
  const [profile] = useState(getUserProfile);
  const [state, render, setState] = useStateVar({
    isLoading: true,
    unitId: Number(routeParams.unitId || 0),
    unitInfo: {} as TUnitInfo,
  });

  let permissionProg = profile.adminClientProg?.CLIENT_MANAGE.some((item) => item === state.unitInfo.CLIENT_ID) || profile.manageAllClients;

  if (permissionProg === false || permissionProg === undefined) {
    permissionProg = !!profile.adminClientProg?.UNIT_MANAGE.some((item) => item === state.unitInfo?.UNIT_ID);
  }

  async function handleGetUnitInfo() {
    try {
      setState({ isLoading: true });
      const [
        unitInfo,
      ] = await Promise.all([
        apiCall('/clients/get-unit-info', { unitId: state.unitId }),
      ]);
      state.unitInfo = unitInfo;
    } catch (err) {
      console.log(err);
      toast.error(t('erroInformacaoUnidade'));
    }
    setState({ isLoading: false });
  }

  useEffect(() => {
    handleGetUnitInfo();
  }, []);

  const queryPars = queryString.parse(history.location.search);
  const linkBase = history.location.pathname;
  const allTabs = [
    {
      title: t('informacoesGerais'),
      link: `${linkBase}?${queryString.stringify({ ...queryPars, aba: 'informacoes-gerais' })}`,
      isActive: (queryPars.aba === 'informacoes-gerais') || (!queryPars.aba),
      visible: profile.manageAllClients,
      ref: useRef(null),
    },
    {
      title: t('programacaoEmMassa'),
      link: `${linkBase}?${queryString.stringify({ ...queryPars, aba: 'programacao-multipla' })}`,
      isActive: (queryPars.aba === 'programacao-multipla'),
      visible: profile.manageAllClients || permissionProg,
      ref: useRef(null),
    },
    {
      title: t('revezamento'),
      link: `${linkBase}?${queryString.stringify({ ...queryPars, aba: 'revezamento-programacao' })}`,
      isActive: (queryPars.aba === 'revezamento-programacao'),
      visible: profile.manageAllClients,
      ref: useRef(null),
    },
    {
      title: t('visibilidadeAmbientes'),
      link: `${linkBase}?${queryString.stringify({ ...queryPars, aba: 'visibilidade-ambientes' })}`,
      isActive: (queryPars.aba === 'visibilidade-ambientes'),
      visible: profile.manageAllClients,
      ref: useRef(null),
    },
    // {
    //   title: 'SIMCARDS',
    //   link: `${linkBase}?${queryString.stringify({ ...queryPars, aba: 'simcards' })}`,
    //   isActive: (queryPars.aba === 'simcards'),
    //   visible: profile.manageAllClients || profile.permissions.isInstaller,
    //   ref: useRef(null),
    // },
    {
      title: 'Mapa da unidade',
      link: `${linkBase}?aba=mapa-unidade`,
      isActive: (queryPars.aba === 'mapa-unidade'),
      visible: profile.manageAllClients,
      ref: useRef(null),
    },
  ];

  return (
    <>
      <Helmet>
        <title>{t('dielEnergiaEditarProgramacao')}</title>
      </Helmet>
      <UnitLayout unitInfo={state.unitInfo} />
      <br />

      <Card>
        <Flex flexWrap="wrap">
          <Box width={[1, 1]} mr={[0, 30]} height="auto">
            <Title>{t('editarUnidade')}</Title>
            {(allTabs.length > 1) && <Headers2 links={allTabs} />}
            <br />
            {(state.isLoading) && (
              <Loader />
            )}
            {(!state.isLoading && allTabs[0].isActive && state.unitInfo) && (
              <div style={{ paddingTop: '30px' }}>
                <GeneralData
                  unitId={state.unitId}
                  unit_code_celsius={state.unitInfo.UNIT_CODE_CELSIUS}
                  unit_code_api={state.unitInfo.UNIT_CODE_API}
                  timezoneUnitId={state.unitInfo.TIMEZONE_ID}
                  production={state.unitInfo.PRODUCTION}
                  constructedArea={state.unitInfo.CONSTRUCTED_AREA}
                  amountPeople={state.unitInfo.AMOUNT_PEOPLE}
                />
              </div>
            )}
            {(!state.isLoading && allTabs[1].isActive && state.unitInfo) && (
              <div style={{ paddingTop: '30px' }}>
                <h2>{t('programacaoEmMassaDeDispositivos')}</h2>
                <MultipleDevProg unitId={state.unitId} />
              </div>
            )}
            {(!state.isLoading && allTabs[2].isActive && state.unitInfo) && (
              <div style={{ paddingTop: '30px' }}>
                <h2>{t('revezamentoDeProgramacao')}</h2>
                <RoomsList unitId={state.unitId} />
              </div>
            )}
            {(!state.isLoading && allTabs[3].isActive && state.unitInfo) && (
              <div style={{ paddingTop: '30px' }}>
                {/* <h2>{t('visibilidadeAmbientes')}</h2> */}
                <EnvironmentVisibility unitId={state.unitId} clientId={state.unitInfo.CLIENT_ID} />
              </div>
            )}
            {/* {(!state.isLoading && allTabs[4].isActive && state.unitInfo) && (
              <div style={{ paddingTop: '30px' }}>
                <Simcards unitId={state.unitId} clientId={state.unitInfo.CLIENT_ID} />
              </div>
            )} */}
            {(!state.isLoading && allTabs[4].isActive && state.unitInfo) && (
              <div>
                <UnitMapProvider>
                  <UnitMap unitName={state.unitInfo.UNIT_NAME} />
                </UnitMapProvider>
              </div>
            )}
          </Box>
        </Flex>
      </Card>

      {/* {state.isLoading && <Loader variant="primary" />} */}
    </>
  );
};

const Card = styled.div`
  padding: 32px;
  margin-top: 24px;
  border-radius: 16px;
  box-shadow: 0px 3px 8px rgba(0, 0, 0, 0.24), 0px 3px 12px rgba(0, 0, 0, 0.12);
`;

const Title = styled.h1`
  font-size: 1.5em;
  color: ${colors.Grey400};
`;

export default withTransaction('EditUnitDevProg', 'component')(EditUnitDevProg);

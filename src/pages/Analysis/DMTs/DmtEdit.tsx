import { useEffect } from 'react';
import { Flex } from 'reflexbox';
import { useHistory, useRouteMatch } from 'react-router';
import { toast } from 'react-toastify';
import { AssetStatus } from '~/components/AssetStatus';
import {
  Button, ModalWindow,
} from '~/components';
import {
  Title,
  InfoItem,
  BtnClean,
  CustomInput,
  Label,
  StyledLink,
} from './styles';
import SelectSearch, { fuzzySearch } from 'react-select-search';
import { useTranslation, Trans } from 'react-i18next';
import { useStateVar } from 'helpers/useStateVar';
import { apiCall } from '~/providers';
import {
  EletricNetworkIcon,
  UtilityIcon,
} from 'icons';
import { SelectDMTport } from 'components/SelectDmtPort';
import { SmallTrashIcon } from '~/icons/Trash';
import { colors } from '~/styles/colors';

export const EditDmtInfo = ({ dmtInfo }): JSX.Element => {
  const match = useRouteMatch<{ devId: string }>();
  const history = useHistory();
  const { t } = useTranslation();
  const handleProp = (prop) => (prop || '-');
  const [state, render, setState] = useStateVar({
    devId: dmtInfo.DEV_ID,
    dmtInfo,
    linkBase: match.url.split(`/${match.params.devId}`)[0],
    utilitiesList: dmtInfo.dmt.utilitiesList,
    ports: [] as {
      label: string,
      associated: boolean,
      port: number,
      illuminationId?: number,
      nobreakId?: number,
      eletricCircuitId?: number,
    }[],
    portsToEdit: [] as {
      label: string,
      associated: boolean,
      port: number,
      illuminationId?: number,
      nobreakId?: number,
      eletricCircuitId?: number,
    }[],
    application: null as any,
    openModal: false,
    openDeleteModal: false,
    clientsOpts: [] as { name: string, value: number|string }[],
    selectedClient: dmtInfo.CLIENT_ID || null as any,
    unitsOpts: [] as { name: string, value: number|string, STATE_ID?: string, CITY_NAME?: string, UNIT_NAME?: string, CLIENT_NAME?: string }[],
    selectedUnit: dmtInfo.UNIT_ID || null as any,
    utilitiesOpts: [] as { name: string, value: number|string, datCode?: string }[],
    selectedUtility: null as any,
    selectedPort: null as null|number,
    selectedElectricNetwork: null as null|number,
    replaceUtility: null as any,
    replaceUtilityIdx: null as number|null,
    clientChanged: false,
    unitChanged: false,
    deleteUtility: null as any,
    deleteUtilityIdx: null as number|null,
    width: window.innerWidth,
    mobile: window.innerWidth < 650,
    stateId: handleProp(dmtInfo.STATE_ID),
    cityName: handleProp(dmtInfo.CITY_NAME),
    unitName: handleProp(dmtInfo.UNIT_NAME),
    clientName: handleProp(dmtInfo.CLIENT_NAME),
  });

  const updateDimensions = () => {
    state.width = window.innerWidth;
    if (window.innerWidth < 650) {
      state.mobile = true;
    } else {
      state.mobile = false;
    }
    render();
  };

  useEffect(() => {
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const getUtilitiesOpts = async () => {
    const utilites = await apiCall('/dmt/get-dmt-utilities-list', { CLIENT_ID: state.selectedClient });
    const utilitiesFromUnit = utilites.filter((util) => util.UNIT_ID === state.selectedUnit);
    if (state.application === t('nobreak')) {
      const associateds = state.utilitiesList.filter((util) => util.APPLICATION === 'Nobreak' && (!util.DISSOCIATE || util.INSERT)).map((util) => util.NOBREAK_ID);
      const dissociateds = state.utilitiesList.filter((util) => util.APPLICATION === 'Nobreak' && util.DISSOCIATE).map((util) => util.NOBREAK_ID);
      state.utilitiesOpts = utilitiesFromUnit.filter((util) => util.APPLICATION === 'Nobreak' && (((!associateds.includes(util.ID) && !util.DMT_CODE)) || dissociateds.includes(util.ID) || (state.replaceUtility && state.replaceUtility.APPLICATION === 'Nobreak' && state.replaceUtility.NOBREAK_ID === util.ID))).map((item) => ({ name: item.NAME, value: item.ID, datCode: item.DAT_CODE }));
    } else if (state.application === t('iluminacao')) {
      const associateds = state.utilitiesList.filter((util) => util.APPLICATION === 'Illumination' && (!util.DISSOCIATE || util.INSERT)).map((util) => util.ILLUMINATION_ID);
      const dissociateds = state.utilitiesList.filter((util) => util.APPLICATION === 'Illumination' && util.DISSOCIATE).map((util) => util.ILLUMINATION_ID);
      state.utilitiesOpts = utilitiesFromUnit.filter((util) => util.APPLICATION === 'Illumination' && (((!associateds.includes(util.ID) && !util.DMT_CODE)) || dissociateds.includes(util.ID) || (state.replaceUtility && state.replaceUtility.APPLICATION === 'Illumination' && state.replaceUtility.ILLUMINATION_ID === util.ID))).map((item) => ({ name: item.NAME, value: item.ID }));
    }
  };

  const getUnitOpts = async () => {
    const units = await apiCall('/clients/get-units-list', { CLIENT_ID: state.selectedClient });
    if (state.clientChanged) {
      state.selectedUnit = null;
    }
    state.unitsOpts = units.map((units) => ({
      name: units.UNIT_NAME, value: units.UNIT_ID, STATE_ID: units.STATE_ID, CLIENT_NAME: units.CLIENT_NAME, UNIT_NAME: units.UNIT_NAME, CITY_NAME: units.CITY_NAME,
    }));
  };

  const setUnitInfo = () => {
    const unitInfo = state.unitsOpts.find((unit) => (unit.value === state.selectedUnit));
    if (unitInfo) {
      state.stateId = unitInfo.STATE_ID;
      state.clientName = unitInfo.CLIENT_NAME;
      state.unitName = unitInfo.UNIT_NAME;
      state.cityName = unitInfo.CITY_NAME;
    }
  };

  const setDefaultElectricNetworkPort = () => {
    const numberOfNobreaks = state.utilitiesList.filter((util) => !util.DISSOCIATE && util.APPLICATION === 'Nobreak').length - (state.replaceUtility && state.replaceUtility.APPLICATION === 'Nobreak' ? 1 : 0);
    if (state.application === t('nobreak') && numberOfNobreaks === 0) {
      const defaultPort = !state.portsToEdit[3].associated ? 4 : null;
      if (defaultPort && !state.selectedElectricNetwork) {
        state.selectedElectricNetwork = defaultPort;
        state.portsToEdit[3].associated = true;
        state.portsToEdit[3].eletricCircuitId = -1;
      }
    } else {
      state.selectedElectricNetwork = null;
    }
  };

  const setElectricNetwork = () => {
    const electricNetworkIdx = state.utilitiesList.findIndex((util) => (util.APPLICATION === 'Electric Network' && !util.DISSOCIATE));
    if (electricNetworkIdx >= 0) {
      state.selectedElectricNetwork = state.utilitiesList[electricNetworkIdx].PORT;
    } else {
      setDefaultElectricNetworkPort();
    }
  };

  const setSelectedValues = () => {
    if (!state.replaceUtility) {
      state.selectedUtility = null;
      state.selectedPort = null;
    } else {
      const application = state.application === t('nobreak') ? 'Nobreak' : 'Illumination';
      if (state.replaceUtility.APPLICATION !== application) {
        state.selectedUtility = null;
      }
      state.selectedPort = state.replaceUtility.PORT;
    }
  };

  const fetchClientData = async () => {
    try {
      if (!state.clientsOpts.length) {
        const { list: clients } = await apiCall('/clients/get-clients-list', {});
        state.clientsOpts = clients.map((client) => ({ name: client.NAME, value: client.CLIENT_ID }));
      }
      if ((state.selectedClient && !state.unitsOpts.length) || state.clientChanged) {
        await getUnitOpts();
        if (state.selectedClient) {
          await getDmtPortsInfo();
        }
        state.clientChanged = false;
      }
      if ((state.selectedUnit && !state.utilitiesOpts.length) || state.unitChanged || state.application) {
        await getUtilitiesOpts();
        setUnitInfo();
        setSelectedValues();
        state.portsToEdit = JSON.parse(JSON.stringify(state.ports));
        setElectricNetwork();
        state.unitChanged = false;
      }
      render();
    } catch (err) {
      console.log(err);
      toast.error('Houve erro');
    }
  };

  function isOverLimit() {
    let hasNobreak = false;
    state.utilitiesList.forEach((util) => { if (util.APPLICATION === 'Nobreak' && !util.DISSOCIATE) { hasNobreak = true; } });
    if (hasNobreak) {
      return state.utilitiesList.filter((util) => util.APPLICATION !== 'Electric Network' && !util.DISSOCIATE).length >= 3;
    }
    return state.utilitiesList.filter((util) => util.APPLICATION !== 'Electric Network' && !util.DISSOCIATE).length >= 4;
  }

  async function getDmtPortsInfo() {
    const portsInfo = await apiCall('/dmt/get-dmt-ports-info', { DMT_CODE: state.devId, CLIENT_ID: state.selectedClient, NEW_UTILITY_TYPE: undefined });
    setState({
      ...state,
      ports: portsInfo.ports.map((port) => { if (state.selectedUtility && port.nobreakId === state.selectedUtility) { port.associated = false; } return port; }),
    });
  }

  useEffect(() => {
    fetchClientData();
  }, [state.selectedClient, state.selectedUnit, state.application]);

  useEffect(() => {
    const numberOfNobreaks = state.utilitiesList.filter((util) => (!util.DISSOCIATE && util.APPLICATION === 'Nobreak')).length;
    const hasElectricNetwork = !!state.utilitiesList.filter((util) => (util.APPLICATION === 'Electric Network')).length;
    if (numberOfNobreaks > 0 && !hasElectricNetwork) {
      state.utilitiesList = [{
        APPLICATION: 'Electric Network',
        DMT_CODE: state.devId,
        UNIT_ID: state.selectedUnit,
        PORT: state.selectedElectricNetwork,
        INSERT: true,
      }].concat(state.utilitiesList);
    }
    getDmtPortsInfo();
  }, []);

  async function saveDmtInfo() {
    try {
      await apiCall('/dmt/set-dmt-utilities', {
        DMT_CODE: state.devId,
        UNIT_ID: state.selectedUnit || dmtInfo.UNIT_ID,
        utilities: state.utilitiesList,
      });
      toast.success(t('sucessoSalvar'));
      history.push(`${state.linkBase}/${state.devId}/informacoes`);
    } catch (err) {
      console.log(err);
      toast.error(t('erroSalvarInfo'));
    }
  }

  function clearForm() {
    if (!state.dmtInfo.CLIENT_ID && !state.utilitiesList.length) state.selectedClient = null;
    if (!state.dmtInfo.UNIT_ID && !state.utilitiesList.length) state.selectedUnit = null;
    state.selectedUtility = null;
    state.selectedPort = null;
    state.application = null;
    state.selectedElectricNetwork = null;
  }

  const getNumberOfNobreaks = () => state.utilitiesList.filter((util) => !util.DISSOCIATE && util.APPLICATION === 'Nobreak').length - (state.replaceUtility && state.replaceUtility.APPLICATION === 'Nobreak' ? 1 : 0);

  const validateParams = () => {
    if (!state.selectedClient) {
      toast.error(t('necessarioSelecCliente'));
      return false;
    }
    if (!state.selectedUnit) {
      toast.error(t('necessarioSelecUnidade'));
      return false;
    }
    if (!state.application) {
      toast.error(t('necessarioSelecAplicacao'));
      return false;
    }
    if (!state.selectedUtility) {
      toast.error(t('necessarioSelecUtilitario'));
      return false;
    }
    const numberOfNobreaks = getNumberOfNobreaks();
    if (numberOfNobreaks >= 3) {
      toast.error(t('impossivelAssociarMaisUtilitariosNobreak'));
      return false;
    }
    const numberOfIlluminations = state.utilitiesList.filter((util) => !util.DISSOCIATE && util.APPLICATION === 'Illumination').length - (state.replaceUtility && state.replaceUtility.APPLICATION === 'Illumination' ? 1 : 0);
    if (numberOfNobreaks + (numberOfNobreaks ? 1 : 0) + numberOfIlluminations >= (state.application === t('nobreak') && numberOfNobreaks === 0 ? 3 : 4)) {
      toast.error(t('impossivelAssociarMaisUtilitarios'));
      return false;
    }
    return true;
  };

  const handleNewElectricNetwork = () => {
    const numberOfNobreaks = getNumberOfNobreaks();
    if (numberOfNobreaks === 0) {
      if (state.utilitiesList.findIndex((util) => (util.APPLICATION === 'Electric Network')) >= 0) {
        state.utilitiesList.forEach((util) => { if (util.APPLICATION === 'Electric Network') { util.DISSOCIATE = false; util.PORT = state.selectedElectricNetwork; } });
      } else {
        state.utilitiesList = [{
          APPLICATION: 'Electric Network',
          DMT_CODE: state.devId,
          UNIT_ID: state.selectedUnit,
          PORT: state.selectedElectricNetwork,
          INSERT: true,
        }].concat(state.utilitiesList);
      }
    } else {
      state.utilitiesList.forEach((util) => { if (util.APPLICATION === 'Electric Network') util.PORT = state.selectedElectricNetwork; });
    }
    if (state.selectedElectricNetwork) {
      state.ports[state.selectedElectricNetwork - 1].associated = true;
      state.ports[state.selectedElectricNetwork - 1].eletricCircuitId = -1;
      state.ports[state.selectedElectricNetwork - 1].illuminationId = undefined;
      state.ports[state.selectedElectricNetwork - 1].nobreakId = undefined;
    }
  };

  const getNonAssociatedUtilities = async () => {
    const utilites = await apiCall('/dmt/get-dmt-utilities-list', { CLIENT_ID: state.selectedClient });
    const application = state.application === t('nobreak') ? 'Nobreak' : 'Illumination';
    return utilites.filter((util) => util.UNIT_ID === state.selectedUnit && util.APPLICATION === application && !util.DMT_CODE).map((util) => util.ID);
  };

  const handleNewUtility = async () => {
    const selectedUtility = state.utilitiesOpts.find((opt) => opt.value === state.selectedUtility);
    if (!selectedUtility) return;

    const application = state.application === t('nobreak') ? 'Nobreak' : 'Illumination';
    const nonAssociatedUtilities = await getNonAssociatedUtilities();
    if (nonAssociatedUtilities.includes(Number(selectedUtility.value))) {
      state.utilitiesList.push({
        NOBREAK_ID: state.application === t('nobreak') ? Number(selectedUtility.value) : undefined,
        ILLUMINATION_ID: state.application === t('iluminacao') ? Number(selectedUtility.value) : undefined,
        NAME: selectedUtility.name,
        DMT_CODE: state.devId,
        PORT: state.selectedPort,
        UNIT_ID: state.selectedUnit,
        DAT_CODE: selectedUtility.datCode,
        INSERT: true,
        APPLICATION: application,
      });
    } else {
      state.utilitiesList.forEach((util) => {
        if ((util.APPLICATION === application && util.NOBREAK_ID === Number(selectedUtility.value))
          || (util.APPLICATION === application && util.ILLUMINATION_ID === Number(selectedUtility.value))) { util.DISSOCIATE = false; util.PORT = state.selectedPort; }
      });
    }

    setNewUtilityPort();
  };
  const setNewUtilityPort = () => {
    const selectedUtility = state.utilitiesOpts.find((opt) => opt.value === state.selectedUtility);
    if (state.selectedPort && selectedUtility) {
      state.ports[state.selectedPort - 1].eletricCircuitId = undefined;
      state.ports[state.selectedPort - 1].associated = true;
      if (state.application === t('nobreak')) {
        state.ports[state.selectedPort - 1].illuminationId = undefined;
        state.ports[state.selectedPort - 1].nobreakId = Number(selectedUtility.value);
      } else if (state.application === t('iluminacao')) {
        state.ports[state.selectedPort - 1].illuminationId = Number(selectedUtility.value);
        state.ports[state.selectedPort - 1].nobreakId = undefined;
      }
    }
  };
  async function associateNewUtility() {
    try {
      if (!validateParams()) return;
      state.ports = JSON.parse(JSON.stringify(state.portsToEdit));
      state.portsToEdit = [];

      if (state.replaceUtility) {
        deleteUtility(state.replaceUtility, state.replaceUtilityIdx);
      }
      const selectedUtility = state.utilitiesOpts.find((opt) => opt.value === state.selectedUtility);
      if (selectedUtility) {
        if (state.application === t('nobreak')) {
          handleNewElectricNetwork();
          render();
        }
        await handleNewUtility();
        render();
      }
      openModal(false, false);
      render();
    } catch (err) {
      console.log(err);
      toast.error(t('naoFoiPossivelAssociarUtilitario'));
    }
  }

  function openModal(shouldOpen: boolean, cancel?: boolean, utility?, utilityIdx?) {
    if (utility) {
      state.replaceUtility = utility;
      state.replaceUtilityIdx = utilityIdx;
      if (utility.APPLICATION === 'Nobreak') {
        state.application = t('nobreak');
        state.selectedUtility = utility.NOBREAK_ID;
        state.selectedPort = utility.PORT;
      } else if (utility.APPLICATION === 'Illumination') {
        state.application = t('iluminacao');
        state.selectedUtility = utility.ILLUMINATION_ID;
        state.selectedPort = utility.PORT;
      }
      render();
    } else {
      state.replaceUtility = null;
      state.replaceUtilityIdx = null;
      clearForm();
    }
    const electricNetworkIdx = state.utilitiesList.findIndex((util) => (util.APPLICATION === 'Electric Network' && !util.DISSOCIATE));
    if (electricNetworkIdx >= 0) {
      state.selectedElectricNetwork = state.utilitiesList[electricNetworkIdx].PORT;
    }
    if (shouldOpen) {
      state.portsToEdit = JSON.parse(JSON.stringify(state.ports));
    } else if (cancel) {
      state.portsToEdit = [];
      if (!state.utilitiesList.length) {
        state.unitsOpts = [];
        state.stateId = null;
        state.cityName = null;
        state.unitName = null;
        state.clientName = null;
        state.selectedClient = dmtInfo.CLIENT_ID || null;
        state.selectedUnit = dmtInfo.UNIT_ID || null;
      }
    }
    state.openModal = shouldOpen;
    render();
  }

  function openDeleteModal(shouldOpen: boolean, utilityInfo?, utilityListIdx?) {
    if (shouldOpen) {
      state.deleteUtility = utilityInfo;
      state.deleteUtilityIdx = utilityListIdx;
    } else {
      state.deleteUtility = null;
      state.deleteUtilityIdx = null;
    }
    state.openDeleteModal = shouldOpen;
    render();
  }

  const clearUnitInfo = () => {
    if (!state.utilitiesList.filter((util) => (!util.DISSOCIATE && dmtInfo.UNIT_ID && dmtInfo.UNIT_ID === util.UNIT_ID || util.INSERT)).length) {
      state.stateId = null;
      state.cityName = null;
      state.unitName = null;
      state.clientName = null;
    }
  };

  const removeElectricNetwork = () => {
    const electricCircuitIdx = state.utilitiesList.findIndex((util) => (util.APPLICATION === 'Electric Network' && !util.DISSOCIATE && util.INSERT === true));
    if (electricCircuitIdx >= 0) {
      state.utilitiesList.splice(electricCircuitIdx, 1);
    }
  };

  const dissociateElectricNetwork = () => {
    state.utilitiesList.forEach((util) => {
      if (util.APPLICATION === 'Electric Network' && util.CIRCUIT_ID) { util.DISSOCIATE = true; util.PORT = null; }
    });
    state.ports.forEach((port) => {
      if (port.eletricCircuitId) { port.associated = false; port.eletricCircuitId = undefined; }
      return port;
    });
  };

  function deleteUtility(utilityInfo, utilityListIdx) {
    utilityInfo.DISSOCIATE = true;
    utilityInfo.PORT = null;
    state.ports.forEach((port) => {
      if ((utilityInfo.APPLICATION === 'Nobreak' && port.nobreakId === utilityInfo.NOBREAK_ID)
        || (utilityInfo.APPLICATION === 'Illumination' && port.illuminationId === utilityInfo.ILLUMINATION_ID)
      ) { port.associated = false; port.nobreakId = undefined; port.illuminationId = undefined; }

      return port;
    });

    let hasNobreak = false;
    state.utilitiesList.forEach((util) => {
      if (util.APPLICATION === 'Nobreak' && !util.DISSOCIATE) hasNobreak = true;
    });
    if (!hasNobreak) {
      dissociateElectricNetwork();
    }

    if (utilityInfo.INSERT) {
      state.utilitiesList.splice(utilityListIdx, 1);
    }
    render();
    if (!hasNobreak) {
      removeElectricNetwork();
    }

    clearUnitInfo();

    render();
  }

  return (
    <Flex flexDirection="row" width="100%" marginTop="10px" flexWrap="wrap" justifyContent="space-between" fontSize="13px" padding="20px">
      <Flex width="100%" flexDirection="column" flex="wrap">
        <Flex flexWrap="wrap" style={{ width: '100%', alignItems: 'center', justifyContent: 'space-between' }}>
          <Flex flexDirection="column" mb={state.mobile ? '10px' : 0}>
            <span style={{ fontWeight: 700, fontSize: '12px', lineHeight: '14px' }}>{t('dispositivo')}</span>
            <span style={{ fontWeight: 600, fontSize: '15px' }}>{state.devId}</span>
          </Flex>

          <AssetStatus
            isAutomation
            withoutMarginTop
            DUT_ID={null}
            DEV_ID={state.devId}
            DEV_AUT={state.devId}
            key={state.devId}
          />
        </Flex>

        <Flex justifyContent="space-between">
          <Flex mb="10px" mt="20px" flexWrap="wrap" flexDirection="column">

            <Title>{t('informacoes')}</Title>
            <Flex flexWrap="wrap">

              <InfoItem>
                <b>{t('estado')}</b>
                <br />
                {state.stateId || '-'}
              </InfoItem>

              <InfoItem>
                <b>{t('cidade')}</b>
                <br />
                {state.cityName || '-'}
              </InfoItem>

              <InfoItem>
                <b>{t('cliente')}</b>
                <br />
                {state.clientName || '-'}
              </InfoItem>

              <InfoItem>
                <b>{t('unidade')}</b>
                <br />
                {state.unitName || '-'}
              </InfoItem>
            </Flex>
          </Flex>
        </Flex>

        <div style={{ border: '0.5px solid #DEDEDE' }} />

        <Flex justifyContent="space-between" alignItems="center" flexWrap="wrap">
          <Flex flexDirection="column" flexWrap="wrap" mb={state.mobile ? 0 : '10px'} mt="20px">
            <Title>{t('associacoes')}</Title>
            <Flex flexWrap="wrap">
              <InfoItem style={{ width: 'fit-content' }}>
                <b>{t('utilitariosAssociados')}</b>
                <br />
                {state.utilitiesList.filter((util) => util.APPLICATION !== 'Electric Network' && !util.DISSOCIATE).length === 1 && `${state.utilitiesList.filter((util) => util.APPLICATION !== 'Electric Network' && !util.DISSOCIATE).length} ${t('utilitario')}`}
                {state.utilitiesList.filter((util) => util.APPLICATION !== 'Electric Network' && !util.DISSOCIATE).length > 1 && `${state.utilitiesList.filter((util) => util.APPLICATION !== 'Electric Network' && !util.DISSOCIATE).length} ${t('utilitarios')}`}
                {!state.utilitiesList.filter((util) => util.APPLICATION !== 'Electric Network' && !util.DISSOCIATE).length && t('nenhumUtilitarioAssociado')}
              </InfoItem>
            </Flex>
          </Flex>

          <Flex flexDirection="column" alignSelf="center" mb={state.mobile && !isOverLimit() ? '20px' : 0} mt={state.mobile ? 0 : '20px'} style={{ width: state.mobile ? '100%' : '200px' }}>
            <Button
              onClick={() => openModal(true, false)}
              variant={isOverLimit() ? 'disabled' : 'primary'}
              disabled={isOverLimit()}
            >
              {`${t('adicionar')}`}
            </Button>

            {isOverLimit() && (
              <InfoItem style={{ width: '100%', marginTop: state.mobile ? 10 : 0, textAlign: 'center' }}>
                <Trans
                  i18nKey="limiteMaximoUtilitariosDmt"
                >
                  <b>Limite máximo</b>
                  de utilitários por DMT já atingido
                </Trans>
              </InfoItem>
            )}
          </Flex>
        </Flex>

        {!state.utilitiesList.filter((util) => !util.DISSOCIATE).length && (
          <Flex
            justifyContent="center"
            alignItems="center"
            style={{
              width: '100%', border: '1px solid #0000000F', borderRadius: '10px', height: '145px',
            }}
          >
            <div style={{ width: state.mobile ? '60%' : '15%', textAlign: 'center', color: colors.Grey300 }}>{t('nenhumUtilitarioAssociadoDmt')}</div>
          </Flex>
        )}
        {state.utilitiesList?.map((util, index) => (
          (!util.DISSOCIATE)
          && (
            <UtilityItem
              dmtCode={state.devId}
              key={util.NAME}
              utilityInfo={util}
              portsList={state.ports}
              utilityListIdx={index}
              deleteUtility={deleteUtility}
              replace={openModal}
              renderList={render}
              openDeleteModal={openDeleteModal}
              mobile={state.mobile}
            />
          )
        ))}

        <Flex mt={20} justifyContent="space-between" alignItems="center">
          <Button
            style={{ width: '150px' }}
            onClick={saveDmtInfo}
            variant="primary"
          >
            {`${t('salvar')}`}
          </Button>

          <BtnClean style={{ fontSize: '14px' }} onClick={() => history.push(`${state.linkBase}/${state.devId}/informacoes`)}>{t('cancelar')}</BtnClean>
        </Flex>
      </Flex>
      {state.openModal && (
        <ModalWindow borderTop onClickOutside={() => openModal(false, true)} style={{ width: '510px' }}>
          <Flex flexDirection="column" width="95%" marginLeft={10}>
            <span style={{ fontSize: '14px', fontWeight: 700, marginBottom: '20px' }}>{`${state.replaceUtility ? t('substituir') : t('adicionar')} ${t('utilitario')}`}</span>
            <CustomInput style={{ marginBottom: '20px', width: '100%' }}>
              <div style={{ paddingTop: 3, width: '100%', zIndex: 3 }}>

                <Label>{t('cliente')}</Label>
                <SelectSearch
                  filterOptions={fuzzySearch}
                  closeOnSelect
                  placeholder={t('selecioneCliente')}
                  value={state.selectedClient}
                  options={state.clientsOpts}
                  onChange={(item) => { state.selectedClient = item; state.clientChanged = true; render(); }}
                  disabled={(state.selectedClient && state.utilitiesList.filter((util) => (!util.DISSOCIATE && dmtInfo.UNIT_ID && dmtInfo.UNIT_ID === util.UNIT_ID || util.INSERT)).length)}
                  search
                />
              </div>
            </CustomInput>
            {state.selectedClient
            && (
            <CustomInput style={{ marginBottom: '20px', width: '100%' }}>
              <div style={{ paddingTop: 3, width: '100%', zIndex: 2 }}>

                <Label>{t('unidade')}</Label>
                <SelectSearch
                  filterOptions={fuzzySearch}
                  options={state.unitsOpts}
                  closeOnSelect
                  placeholder={t('selecioneUnidade')}
                  value={state.selectedUnit}
                  onChange={(item) => { state.selectedUnit = item; state.unitChanged = true; render(); }}
                  disabled={(state.selectedUnit && state.utilitiesList.filter((util) => (!util.DISSOCIATE && dmtInfo.UNIT_ID && dmtInfo.UNIT_ID === util.UNIT_ID || util.INSERT)).length)}
                  search
                />
              </div>
            </CustomInput>
            )}
            {state.selectedUnit
            && (
            <Flex mb={20} justifyContent="space-between">
              <CustomInput style={{ width: '48%' }}>
                <div style={{ width: '100%', paddingTop: 3, zIndex: 1 }}>
                  <Label>{t('aplicacao')}</Label>
                  <SelectSearch
                    options={[{ name: t('nobreak'), value: t('nobreak') }, { name: t('iluminacao'), value: t('iluminacao') }]}
                    value={state.application}
                    onChange={(item) => { state.application = item; render(); }}
                    search
                    filterOptions={fuzzySearch}
                    placeholder={t('selecionar')}
                    closeOnSelect
                  />
                </div>
              </CustomInput>
              <CustomInput style={{ width: '48%' }}>
                <div style={{ width: '100%', paddingTop: 3, zIndex: 1 }}>
                  <Label>{t('utilitario')}</Label>
                  <SelectSearch
                    closeOnSelect
                    filterOptions={fuzzySearch}
                    placeholder={t('selecionar')}
                    value={state.selectedUtility}
                    options={state.utilitiesOpts}
                    onChange={(item) => { state.selectedUtility = item; render(); }}
                    disabled={!state.application}
                    search
                  />
                </div>
              </CustomInput>
            </Flex>
            )}
            {(state.application && state.selectedUtility)
            && (
              <Flex mb={20} justifyContent="space-between">

                <div style={{ width: '48%' }}>
                  <SelectDMTport
                    label={t('feedbackDoDmt')}
                    placeholder={t('selecionar')}
                    options={state.portsToEdit}
                    propLabel="label"
                    value={state.selectedPort ? `F${state.selectedPort}` : ''}
                    hideSelected
                    onSelect={(item) => {
                      if (state.selectedPort) {
                        state.portsToEdit[state.selectedPort - 1].associated = false;
                        state.portsToEdit[state.selectedPort - 1].nobreakId = undefined;
                        state.portsToEdit[state.selectedPort - 1].illuminationId = undefined;
                      }
                      state.selectedPort = item.port;
                      state.portsToEdit[Number(item.port) - 1].associated = true;
                      if (state.application === t('iluminacao')) {
                        state.portsToEdit[Number(item.port) - 1].illuminationId = state.selectedUtility;
                      } else if (state.application === t('nobreak')) {
                        state.portsToEdit[Number(item.port) - 1].nobreakId = state.selectedUtility;
                      }
                      render();
                    }}
                  />
                  <BtnClean onClick={() => {
                    if (state.selectedPort) {
                      state.portsToEdit[Number(state.selectedPort) - 1].associated = false;
                      state.portsToEdit[Number(state.selectedPort) - 1].illuminationId = undefined;
                      state.portsToEdit[Number(state.selectedPort) - 1].nobreakId = undefined;
                    }
                    state.selectedPort = null;
                    render();
                  }}
                  >
                    {t('limpar')}
                  </BtnClean>

                </div>

                <div style={{ minWidth: '48%' }}>
                  <SelectDMTport
                    label={t('feedbackRedeEletrica')}
                    placeholder={t('selecionar')}
                    options={state.portsToEdit}
                    propLabel="label"
                    value={state.selectedElectricNetwork ? `F${state.selectedElectricNetwork}` : ''}
                    hideSelected
                    onSelect={(item) => {
                      if (state.selectedElectricNetwork) {
                        state.portsToEdit[state.selectedElectricNetwork - 1].associated = false;
                        state.portsToEdit[state.selectedElectricNetwork - 1].eletricCircuitId = undefined;
                      }
                      state.selectedElectricNetwork = item.port;
                      state.portsToEdit[Number(item.port) - 1].associated = true;
                      state.portsToEdit[Number(item.port) - 1].eletricCircuitId = -1;
                      render();
                    }}
                    disabled={state.application === t('iluminacao')}
                  />
                  {state.application === t('nobreak')
                  && (
                    <BtnClean onClick={() => {
                      if (state.selectedElectricNetwork) {
                        state.portsToEdit[Number(state.selectedElectricNetwork) - 1].associated = false;
                        state.portsToEdit[Number(state.selectedElectricNetwork) - 1].eletricCircuitId = undefined;
                      }
                      state.selectedElectricNetwork = null;
                      render();
                    }}
                    >
                      {t('limpar')}
                    </BtnClean>
                  )}
                </div>
              </Flex>
            )}

            <Flex justifyContent="space-between" alignItems="center">
              <BtnClean onClick={() => { openModal(false, false); state.application = null; render(); }}>{t('botaoFechar')}</BtnClean>

              <Button
                style={{ maxWidth: '110px' }}
                onClick={associateNewUtility}
                variant="primary"
              >
                {`${state.replaceUtility ? t('confirmar') : t('adicionar')}`}
              </Button>
            </Flex>
          </Flex>
        </ModalWindow>
      )}

      {state.openDeleteModal && (
        <ModalWindow borderTop onClickOutside={() => openDeleteModal(false)} style={{ width: '360px' }}>
          <Flex flexDirection="column" width="95%" marginLeft={10}>
            <span style={{ fontSize: '14px', fontWeight: 700, marginBottom: '20px' }}>Remover Utilitário</span>
            <p style={{ fontSize: '13px' }}>
              {t('voceGostariaDeRemoverUtilitario')}
              <strong>{state.deleteUtility.NAME || '-'}</strong>
              {t('aEsteDmt')}
            </p>
            <Flex justifyContent="space-between" flexDirection="column" mt={20}>
              <Button
                style={{ }}
                onClick={() => { deleteUtility(state.deleteUtility, state.deleteUtilityIdx); openDeleteModal(false); }}
                variant="primary"
              >
                {t('remover')}
              </Button>
              <BtnClean style={{ color: colors.Grey300 }} onClick={() => { openDeleteModal(false); }}>{t('cancelar')}</BtnClean>

            </Flex>
          </Flex>
        </ModalWindow>
      )}
    </Flex>
  );
};

const UtilityItem = ({
  utilityInfo, portsList, replace, renderList, utilityListIdx, openDeleteModal, mobile,
}): JSX.Element => {
  const [state, render, setState] = useStateVar({
    loading: false,
  });
  const { t } = useTranslation();

  async function clearPort() {
    setState({ loading: true });
    utilityInfo.PORT = null;
    portsList.forEach((port) => {
      if ((utilityInfo.APPLICATION === 'Nobreak' && port.nobreakId === utilityInfo.NOBREAK_ID)
        || (utilityInfo.APPLICATION === 'Electric Network' && port.eletricCircuitId)
        || (utilityInfo.APPLICATION === 'Illumination' && port.illuminationId === utilityInfo.ILLUMINATION_ID)
      ) { port.associated = false; port.nobreakId = undefined; port.eletricCircuitId = undefined; port.illuminationId = undefined; }

      return port;
    });
    render();
    setState({ loading: false });
    renderList();
  }

  return (
    <Flex flexDirection="column">
      <Flex justifyContent="space-between" flexWrap="wrap">
        <Flex width={mobile ? '100%' : '55%'} alignSelf="center" flexDirection="row" alignItems="center" justifyContent="space-between">
          <Flex flexDirection="column">
            <Flex alignItems="center">
              {utilityInfo.APPLICATION === 'Electric Network' ? <EletricNetworkIcon /> : <UtilityIcon />}
              <Flex ml={10} flexDirection="column">
                <b>{utilityInfo.APPLICATION === 'Electric Network' && t('redeEletrica')}</b>
                <b>{utilityInfo.APPLICATION !== 'Electric Network' && <StyledLink to={utilityInfo.APPLICATION === 'Nobreak' ? `/analise/utilitario/nobreak/${utilityInfo.NOBREAK_ID}/informacoes` : `/analise/utilitario/iluminacao/${utilityInfo.ILLUMINATION_ID}/informacoes`}>{utilityInfo.NAME}</StyledLink>}</b>

                {utilityInfo.APPLICATION === 'Nobreak' && <span style={{ fontSize: 10, color: colors.Grey300 }}>{utilityInfo.DAT_CODE || '-'}</span>}
              </Flex>
            </Flex>
            <Flex flexDirection="column" mt={mobile ? -2 : 0} ml={26}>
              {utilityInfo.APPLICATION !== 'Electric Network' && <BtnClean onClick={() => replace(true, false, utilityInfo, utilityListIdx)}>{t('substituir')}</BtnClean> }
            </Flex>
          </Flex>
          {mobile && <SmallTrashIcon style={{ cursor: 'pointer', marginBottom: 10, visibility: (utilityInfo.APPLICATION === 'Electric Network') ? 'hidden' : 'visible' }} onClick={() => { openDeleteModal(true, utilityInfo, utilityListIdx); }} color="red" disabled={state.loading} />}
        </Flex>
        <Flex alignSelf="flex-end" marginTop={mobile ? '20px' : 0} alignItems="center" justifyContent="center" width={mobile ? '100%' : 'auto'}>
          <Flex flexDirection="column" style={{ width: mobile ? '100%' : '200px', marginRight: mobile ? 0 : 20 }}>
            <SelectDMTport
              label={t('feedbackDoDmt')}
              placeholder={t('selecionar')}
              options={portsList}
              propLabel="label"
              value={(utilityInfo.PORT ? `F${utilityInfo.PORT}` : '')}
              hideSelected
              onSelect={(item) => {
                if (utilityInfo.PORT) {
                  portsList[utilityInfo.PORT - 1].associated = false;
                  portsList[utilityInfo.PORT - 1].nobreakId = undefined;
                  portsList[utilityInfo.PORT - 1].illuminationId = undefined;
                  portsList[utilityInfo.PORT - 1].eletricCircuitId = undefined;
                }
                utilityInfo.PORT = item.port;

                portsList[Number(item.port) - 1].associated = true;
                if (utilityInfo.APPLICATION === 'Illumination') {
                  portsList[Number(item.port) - 1].illuminationId = utilityInfo.ILLUMINATION_ID;
                } else if (utilityInfo.APPLICATION === 'Nobreak') {
                  portsList[Number(item.port) - 1].nobreakId = utilityInfo.NOBREAK_ID;
                } else if (utilityInfo.APPLICATION === 'Electric Network') {
                  portsList[Number(item.port) - 1].eletricCircuitId = -1;
                }

                render();
                renderList();
              }}
              disabled={state.loading}
            />
            <BtnClean disabled={state.loading} onClick={clearPort}>{t('limpar')}</BtnClean>
          </Flex>
          {!mobile && <SmallTrashIcon style={{ cursor: 'pointer', marginBottom: 3, visibility: (utilityInfo.APPLICATION === 'Electric Network') ? 'hidden' : 'visible' }} onClick={() => { openDeleteModal(true, utilityInfo, utilityListIdx); }} color="red" disabled={state.loading} />}
        </Flex>
      </Flex>

      <div style={{ border: '0.5px solid #DEDEDE', marginTop: '20px', marginBottom: '22px' }} />
    </Flex>
  );
};

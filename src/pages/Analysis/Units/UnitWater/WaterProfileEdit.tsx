import { useState, useEffect, SetStateAction } from 'react';
import { t } from 'i18next';
import { Box, Flex } from 'reflexbox';
import styled from 'styled-components';
import {
  Button, Input, Select, Loader, ClearSelect,
} from '~/components';
import { ContentDate, Label, StyledCalendarIcon } from '~/pages/Overview/Default/styles';
import { Title } from '../../Integrations/IntegrPerfil';
import moment from 'moment';
import { SingleDatePicker } from 'react-dates';
import i18n from '~/i18n';
import 'react-datepicker/dist/react-datepicker.css';
import { toast } from 'react-toastify';
import { apiCall } from '~/providers';
import { colors } from '~/styles/colors';
import { Data, DataText } from '../../Assets/AssetInfo/styles';
import { useStateVar } from '~/helpers/useStateVar';
import { AxiosError } from 'axios';
import { useHistory } from 'react-router';
import SelectSearch, { fuzzySearch } from 'react-select-search';
import { SearchInput } from '../../styles';

const comboOptions: string[] = [
  t('emSerieHidrometroUnidade'),
  t('proximoCaixaDagua'),
  t('somenteSensorHidrometroUnidade'),
  t('outro'),
];

const comboHydrometerOptions: string[] = ['Elster S120 (1 L/pulso)', 'ZENNER ETKD-P-N (10 L/pulso)', 'ZENNER MTKD-AM-I (10 L/pulso)',
  'Saga Unijato US-1.5 (1 L/pulso)', 'Saga Unijato US-3.0 (1 L/pulso)', 'Saga Unijato US-5.0 (1 L/pulso)'];

type WaterData = {
  installationLocation?: string | null,
  installationDate?: string | null,
  totalCapacity?: number | null,
  quantityOfReservoirs?: number | null,
  hydrometerModel?: string | null,
  clientId?: number | null,
  unitId?: number | null,
}

export default function WaterProfileEdit(props: {
    integrType: string,
    integrId: string,
    prevQuantityOfReservoirs?: number | null,
    prevTotalCapacity?: number | null,
    prevInstallationDate?: string | null,
    prevInstallationLocation?: string | null,
    prevHydrometerModel?: string | null,
    supplier?: string | null,
    clientInfo: { NAME: string, ID: number},
    unitInfo: { NAME: string, ID: number},
    handleUpdateIntegrPerfil: (installationLocation?: string | null, installationDate?: string | null, totalCapacity?: number | null, quantityOfReservoirs?: number | null, hydrometerModel?: string | null,) => void,
}): JSX.Element {
  moment.locale(i18n.language === 'pt' ? 'pt-BR' : 'en');
  const {
    integrType, integrId, prevQuantityOfReservoirs, supplier, prevHydrometerModel, prevTotalCapacity, prevInstallationDate, prevInstallationLocation, handleUpdateIntegrPerfil, clientInfo, unitInfo,
  } = props;
  const [state, render, setState] = useStateVar({
    comboClients: [] as { label: string, value: number }[],
    comboUnits: [] as { label: string, value: number }[],
    client: clientInfo.NAME || '',
    clientId: clientInfo.ID || null,
    unit: unitInfo.NAME || '',
    unitId: unitInfo.ID || null,
  });

  const getInstallationLocation = () => {
    if (!prevInstallationLocation) return '';
    if (comboOptions.includes(prevInstallationLocation)) return prevInstallationLocation;
    return t('outro');
  };
  const getHydrometerModel = () => {
    if (!prevHydrometerModel) return '';
    if (comboHydrometerOptions.includes(prevHydrometerModel)) return prevHydrometerModel;
    return '';
  };

  const getOtherInstallationLocation = () => {
    if (!prevInstallationLocation) return '';
    if (!comboOptions.includes(prevInstallationLocation)) return prevInstallationLocation;
    return '';
  };

  const [installationLocation, setInstallationLocation] = useState(getInstallationLocation());
  const [hydrometerModel, setHydrometerModel] = useState(getHydrometerModel());
  const [installationDate, setInstallationDate] = useState(prevInstallationDate ? moment(prevInstallationDate) : '');
  const [totalCapacity, setTotalCapacity] = useState(prevTotalCapacity ? String(prevTotalCapacity) : '');
  const [quantityOfReservoirs, setQuantityOfReservoirs] = useState(prevQuantityOfReservoirs ? String(prevQuantityOfReservoirs) : '');
  const [calendarFocused, setCalendarFocused] = useState(false);
  const [otherLocation, setOtherLocation] = useState(getOtherInstallationLocation());
  const [isOtherSelected, setIsOtherSelected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const history = useHistory();

  useEffect(() => {
    if (state.comboClients.length === 0) {
      apiCall('/clients/get-clients-list', {}).then((response) => {
        state.comboClients = response.list.map((row) => ({ label: row.NAME, value: row.CLIENT_ID }));
        render();
      });
    }
    if (state.clientId) {
      loadUnitsClient(state.clientId);
    }
  }, [false]);

  useEffect(() => {
    if (installationLocation === t('outro')) {
      setIsOtherSelected(true);
    } else {
      setIsOtherSelected(false);
    }
  }, [installationLocation]);

  const loadUnitsClient = (clientId) => {
    const reqCombos = { CLIENT_ID: clientId, units: true };
    apiCall('/dev/dev-info-combo-options', reqCombos)
      .then((response) => {
        state.comboUnits = response.units!.map((row) => ({ label: row.label, value: row.value }));
        render();
      })
      .catch((err) => {
        console.log(err);
        toast.error('Houve erro');
      });
  };

  const onSelectClient = (item) => {
    state.client = item.name;
    state.clientId = item.value;
    state.unit = '';
    state.unitId = null;
    state.comboUnits = [];
    render();

    if (item?.value != null) {
      loadUnitsClient(item.value);
    }
  };

  const onSelectUnit = (item) => {
    state.unitId = item.value;
    state.unit = item.name;
    render();
  };

  const onSelectHydrometer = (item) => {
    setHydrometerModel(item);
  };

  const onSelectInstallationLocation = (item) => {
    setInstallationLocation(item);
  };

  const handleSaveBtn = async () => {
    const data: WaterData = {};
    const defaultInstallationLocation = !isOtherSelected && installationLocation !== '' ? installationLocation : null;
    data.installationLocation = isOtherSelected && otherLocation !== '' ? otherLocation : defaultInstallationLocation;
    data.installationDate = installationDate !== '' && installationDate !== null ? moment(installationDate).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD');
    data.totalCapacity = totalCapacity !== '' ? Number(totalCapacity) : null;
    data.hydrometerModel = hydrometerModel !== '' ? hydrometerModel : null;
    data.quantityOfReservoirs = quantityOfReservoirs !== '' ? Number(quantityOfReservoirs) : null;
    data.unitId = state.unitId || null;
    data.clientId = state.clientId || null;

    try {
      setIsLoading(true);
      await apiCall(
        '/save-integration-info',
        {
          supplier: (integrId.startsWith('DMA') ? 'diel-dma' : 'laager'),
          integrId,
          ...data,
        },
      );

      handleUpdateIntegrPerfil(data.installationLocation, data.installationDate,
        data.totalCapacity, data.quantityOfReservoirs, data.hydrometerModel);

      if (!data.installationLocation) {
        setIsOtherSelected(false);
        setInstallationLocation('');
      }
      toast.success(t('sucessoSalvar'));
      // eslint-disable-next-line no-restricted-globals
      if (integrId.startsWith('DMA')) {
        history.push(`/integracoes/info/diel/${integrId}/perfil`);
      } else {
        history.push('/integracoes/');
      }

      render();
    } catch (error) {
      const err = error as AxiosError;
      toast.error(err?.response?.data || t('erroDados'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <Title>
        {t('editar')}
      </Title>

      <Flex mt={18} mb={18} flexDirection="column">
        <Box mb={10} width={[1, 1, 1, 1, 1, 1 / 4]}>
          <Data>
            <DataText color={colors.Grey300} fontWeight="bold">
              {integrId.startsWith('DMA') ? 'DMA ID' : t('idDaUnidadeLaager')}
            </DataText>
            <DataText>{integrId || '-'}</DataText>
          </Data>
        </Box>
        <Box mb={10} width={[1, 1, 1, 1, 1, 1 / 4]}>
          <Data>
            <DataText color={colors.Grey300} fontWeight="bold">
              {t('fabricante')}
            </DataText>
            <DataText>{supplier || '-'}</DataText>
          </Data>
        </Box>
        <Box mb={20} width={[1, 1, 1, 1, 1, 1 / 4]}>
          <SearchInput style={{ margin: 0, marginBottom: 10, border: '1px solid #818181' }}>
            <div style={{ width: '100%', paddingTop: 3, paddingBottom: 3 }}>
              <Label>{t('cliente')}</Label>
              <SelectSearch
                options={state.comboClients.map((item) => ({ value: item.value, name: item.label }))}
                value={state.clientId?.toString()}
                placeholder={t('cliente')}
                search
                filterOptions={fuzzySearch}
                onChange={(item, name) => onSelectClient(name)}
              />
            </div>
          </SearchInput>
          {state.clientId && (
            <ClearSelect
              onClickClear={onSelectClient}
              value={state.client}
            />
          )}
        </Box>
        <Box mb={20} width={[1, 1, 1, 1, 1, 1 / 4]}>
          <SearchInput style={{ margin: 0, marginBottom: 10, border: '1px solid #818181' }}>
            <div style={{ width: '100%', paddingTop: 3, paddingBottom: 3 }}>
              <Label>{t('unidade')}</Label>
              <SelectSearch
                options={state.comboUnits.map((item) => ({ value: item.value, name: item.label }))}
                value={state.unitId?.toString()}
                placeholder={t('unidade')}
                onChange={(item, name) => {
                  onSelectUnit(name);
                }}
                disabled={!state.client}
                filterOptions={fuzzySearch}
                search
              />
            </div>
          </SearchInput>
          {state.unitId && (
            <ClearSelect
              onClickClear={onSelectUnit}
              value={state.unit}
            />
          )}
        </Box>
        <Box mb={20} width={[1, 1, 1, 1, 1, 1 / 4]}>
          <SearchInput style={{ margin: 0, marginBottom: 10, border: '1px solid #818181' }}>
            <div style={{ width: '100%', paddingTop: 3, paddingBottom: 3 }}>
              <Label>{t('hidrometro')}</Label>
              <SelectSearch
                options={comboHydrometerOptions.map((item) => ({ value: item, name: item }))}
                value={hydrometerModel}
                placeholder={t('hidrometro')}
                onChange={(item) => {
                  onSelectHydrometer(item);
                }}
                filterOptions={fuzzySearch}
                search
                disabled={!state.unit}
              />
            </div>
          </SearchInput>
          {hydrometerModel && (
            <ClearSelect
              onClickClear={onSelectHydrometer}
              value={hydrometerModel}
            />
          )}
        </Box>
        <Box mb={20} width={[1, 1, 1, 1, 1, 1 / 4]}>
          <SearchInput style={{ margin: 0, marginBottom: 10, border: '1px solid #818181' }}>
            <div style={{ width: '100%', paddingTop: 3, paddingBottom: 3 }}>
              <Label>{t('localDeInstalacao')}</Label>
              <SelectSearch
                options={comboOptions.map((item) => ({ value: item, name: item }))}
                value={installationLocation}
                placeholder={t('localDeInstalacao')}
                onChange={(item) => {
                  onSelectInstallationLocation(item);
                }}
                filterOptions={fuzzySearch}
                search
              />
            </div>
          </SearchInput>
          {installationLocation && (
            <ClearSelect
              onClickClear={onSelectInstallationLocation}
              value={installationLocation}
            />
          )}
        </Box>
        {isOtherSelected && (
          <Box mb={20} width={[1, 1, 1, 1, 1, 1 / 4]}>
            <Input
              type="text"
              label={t('descricaoLocal')}
              value={otherLocation}
              onChange={(e: { target: { value: SetStateAction<string> }; }) => setOtherLocation(e.target.value)}
            />
          </Box>
        )}
        <Box mb={20} alignSelf="start" width={[1, 1, 1, 1, 1, 1 / 4]}>
          <ContentDate>
            <Label>{t('dataInstalacao')}</Label>
            <SingleDatePicker
              date={installationDate}
              onDateChange={setInstallationDate}
              id="datepicker"
              numberOfMonths={1}
              focused={calendarFocused}
              onFocusChange={({ focused }) => setCalendarFocused(focused)}
              isOutsideRange={() => false}
            />
            <StyledCalendarIcon color="#202370" />
          </ContentDate>
        </Box>
        <Box mb={20} width={[1, 1, 1, 1, 1, 1 / 4]}>
          <Input
            label={t('capacidadeTotalReservatorios')}
            type="number"
            value={totalCapacity}
            disabled={!state.unit}
            onChange={(e: { target: { value: SetStateAction<string> }; }) => setTotalCapacity(e.target.value)}
          />
        </Box>
        <Box mb={20} width={[1, 1, 1, 1, 1, 1 / 4]}>
          <Input
            label={t('totalDeReservatorios')}
            type="number"
            value={quantityOfReservoirs}
            disabled={!state.unit}
            onChange={(e: { target: { value: SetStateAction<string> }; }) => setQuantityOfReservoirs(e.target.value)}
          />
        </Box>
        <div>
          <Button style={{ maxWidth: '100px' }} onClick={handleSaveBtn} variant="primary">
            {isLoading ? <Loader size="small" variant="secondary" /> : t('salvar')}
          </Button>
        </div>
      </Flex>
    </Card>
  );
}

const Card = styled.div`
  padding: 32px;
  margin-top: 24px;
  border-radius: 16px;
  box-shadow: 0px 3px 8px rgba(0, 0, 0, 0.24), 0px 3px 12px rgba(0, 0, 0, 0.12);
  height: 100%;
`;

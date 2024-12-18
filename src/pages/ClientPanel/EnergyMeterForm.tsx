import { Flex } from 'reflexbox';
import '~/assets/css/ReactTags.css';
import { Input } from 'components';
import { Select as SelectNew } from 'components/NewSelect';
import {
  currentCapacityOpts,
  installationTypeOpts,
} from '~/helpers/driConfigOptions';
import { colors } from '~/styles/colors';
import { DeleteOutlineIcon } from '~/icons';
import { toast } from 'react-toastify';
import { apiCall } from '~/providers';
import { useTranslation } from 'react-i18next';

export const EnergyMeterForm = (props: {
  state: any,
  render: () => void
  clearEnergyForm: (index: number) => void,
  index: number,
  unitInfo?: {
    UNIT_ID: number
    UNIT_NAME: string
    LAT: string
    LON: string
    TARIFA_KWH: number
    CITY_ID: string
    STATE_ID: string
    DISTRIBUTOR_ID: number
    ADDITIONAL_DISTRIBUTOR_INFO: string
    CONSUMER_UNIT: string
    LOGIN: string
    LOGIN_EXTRA: string
    PASSWORD: string
    STATUS: string
  },
  clientId: number,
  checkMultipleEnergyMeters: () => void
}): JSX.Element => {
  const {
    state, index, clearEnergyForm, render, clientId, unitInfo, checkMultipleEnergyMeters,
  } = props;
  const { t } = useTranslation();
  const handleDeleteMeter = async () => {
    try {
      await apiCall('/energy/delete-energy-info', {
        SERIAL: state.energyMetersData[index].meterSerial,
        MANUFACTURER: state.energyMetersData[index].selectedManufacturer?.NAME,
        DRI_ID: state.energyMetersData[index].meterDriId,
        CLIENT_ID: clientId,
        UNIT_ID: unitInfo?.UNIT_ID,
      });
      state.energyMetersData.splice(index, 1);
      toast.success(t('sucessoDeletarMedidor'));
      if (state.energyMetersData.length === 0) {
        state.energyMetersData.push({
          selectedManufacturer: null,
          selectedMeterModel: null,
          filteredModelsList: [],
          meterDriId: '',
          meterSerial: '',
          selectedCurrentCapacity: null,
          selectedInstallationType: null,
          nameOfEstablishment: '',
        });
      }
      render();
    } catch (err) {
      console.error(err);
      toast.error(t('erroDeletarMedidor'));
    }
  };

  return (

    <Flex
      style={{
        borderLeftColor: colors.Blue300,
        borderLeftWidth: 10,
        borderLeftStyle: 'solid',
        borderRadius: 5,
        borderRightColor: colors.Grey,
        borderRightWidth: 1,
        borderRightStyle: 'solid',
        borderTopColor: colors.Grey,
        borderTopWidth: 1,
        borderTopStyle: 'solid',
        borderBottomColor: colors.Grey,
        borderBottomWidth: 1,
        borderBottomStyle: 'solid',
        paddingLeft: 15,
        paddingRight: 15,
        paddingTop: 15,
        paddingBotoom: 20,

      }}
      flexWrap="wrap"
      flexDirection="column"
      width="900px"
      alignItems="left"
      ml={-60}
      mt={-30}
    >
      <Flex alignItems="center" justifyContent="space-between">
        <span
          style={{
            textAlign: 'left',
            fontWeight: 'bold',
            fontSize: '115%',
          }}
        >
          {t('medidorEnergia')}
        </span>
        <span onClick={handleDeleteMeter}>
          <DeleteOutlineIcon size="22" colors={colors.Red} />
        </span>
      </Flex>

      <Flex flexWrap="wrap" flexDirection="row" justifyContent="space-between" height="auto" aligndiv="space-between">
        <SelectNew
          style={{ padding: '10px 0px', width: '270px' }}
          options={index === 0 && state.energyMetersData.length <= 1 ? state.manufacturersList : state.manufacturersList.filter((e) => e?.NAME === 'Diel Energia')}
          value={state.energyMetersData[index].selectedManufacturer}
          label={t('fabricante')}
          placeholder={t('selecionarFabricante')}
          propLabel="NAME"
          hideSelected
          onSelect={(value) => {
            clearEnergyForm(index);
            if (value !== state.energyMetersData[index].selectedManufacturer) {
              state.energyMetersData[index].selectedManufacturer = value;
              state.energyMetersData[index].filteredModelsList = state.modelsList.filter((model) => model.MANUFACTURER_ID === value.MANUFACTURER_ID);
            } else {
              state.energyMetersData[index].selectedManufacturer = null;
            }
            checkMultipleEnergyMeters();
            render();
          }}
        />
        <SelectNew
          style={{ padding: '10px 0px', width: '270px' }}
          options={state.energyMetersData[index].filteredModelsList}
          value={state.energyMetersData[index].selectedMeterModel}
          label={`${t('modelo')}${state.energyMetersData[index].selectedManufacturer ? `s ${state.energyMetersData[index].selectedManufacturer.NAME.split(' ')[0]}` : ''}`}
          placeholder={t('selecionarModelo')}
          propLabel="NAME"
          hideSelected
          onSelect={(value) => { state.energyMetersData[index].selectedMeterModel = value; render(); }}
          disabled={!state.energyMetersData[index].selectedManufacturer}
        />
        {(!state.energyMetersData[index].selectedManufacturer || state.energyMetersData[index].selectedManufacturer.NAME === 'Diel Energia') && (
        <Input
          style={{ margin: '10px 0px', width: '270px', height: '50px' }}
          type="text"
          value={state.energyMetersData[index].meterDriId}
          label={t('idDoDri')}
          placeholder={t('digiteId')}
          onChange={(e) => { state.energyMetersData[index].meterDriId = e.target.value; render(); }}
          disabled={!state.energyMetersData[index].selectedManufacturer}
        />
        )}
        <Input
          style={{ margin: '10px 0px', width: '270px', height: '50px' }}
          type="text"
          value={state.energyMetersData[index].meterSerial}
          label={t('numeroDeSerieMedidorEnergia')}
          placeholder={t('digiteNumeroDeSerie')}
          onChange={(e) => { state.energyMetersData[index].meterSerial = e.target.value; render(); }}
          disabled={!state.energyMetersData[index].selectedManufacturer}
        />

        {state.energyMetersData[index].selectedMeterModel?.NAME === 'ET330' && (
        <>
          <SelectNew
            style={{ padding: '10px 0px', width: '270px' }}
            options={currentCapacityOpts}
            value={state.energyMetersData[index].selectedCurrentCapacity}
            label={t('capacidadeCorrenteTcInstalado')}
            placeholder={t('selecionarCapacidade')}
            propLabel="name"
            hideSelected
            onSelect={(value) => { state.energyMetersData[index].selectedCurrentCapacity = value; render(); }}
            disabled={!state.energyMetersData[index].selectedManufacturer}
          />
          <SelectNew
            style={{ padding: '10px 0px', width: '270px' }}
            options={installationTypeOpts[state.energyMetersData[index].selectedMeterModel?.NAME] || []}
            value={state.energyMetersData[index].selectedInstallationType}
            label={t('tipoInstalacaoEletrica')}
            placeholder={t('selecionarTipo')}
            propLabel="name"
            hideSelected
            onSelect={(value) => { state.energyMetersData[index].selectedInstallationType = value; render(); }}
            disabled={!state.energyMetersData[index].selectedManufacturer}
          />
        </>

        )}
        {(state.energyMetersData[index].selectedManufacturer && state.energyMetersData[index].selectedManufacturer.NAME === 'Diel Energia') && (

        <Input
          style={{ margin: '10px 0px', width: '270px', height: '50px' }}
          type="text"
          value={state.energyMetersData[index].nameOfEstablishment}
          label={t('quadroEletricoRelativo')}
          placeholder={t('inserir')}
          onChange={(e) => { state.energyMetersData[index].nameOfEstablishment = e.target.value; render(); }}
          disabled={!state.energyMetersData[index].selectedManufacturer}
        />

        )}
      </Flex>
    </Flex>

  ); };

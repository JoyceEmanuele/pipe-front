import {
  IconWrapper,
} from './styles';
import { useStateVar } from 'helpers/useStateVar';
import { Flex } from 'reflexbox';
import {
  ChillerIcon,
} from '../../icons';
import { useTranslation } from 'react-i18next';

interface ComponentProps {
  machine: {
    groupId: number | null,
    name: string | null,
    unitId: number | null,
    unitName: string | null,
    brandName: string | null,
    type: string | null,
    model: string | null,
    refrigerationCapacity: string | null,
    refrigerationFluid: string | null,
    ratedPower: string | null,
    installationDate: string | null,
    automationDevId: string | null,
    capacityMeasurementUnit: string | null,
    refDUTId: string | null,
    applic: string | null,
  },
  asset: {
    index: number,
    name: string | null,
    datId: string | null,
    devId: string | null,
    roleId: number | null,
    role: string | null,
    type: string | null,
    brandName: string | null,
    model: string | null,
    refrigerationCapacity: string | null,
    ratedPower: string | null,
    refrigerationFluid: string | null,
    capacityMeasurementUnit: string | null,
    devClientAssetId: number | null,
    datIndex: number | null,
    devIdPersisted: string | null,
    chillerModel: string | null,
    nominalCapacity: number | null,
    nominalVoltage: number | null,
    nominalFrequency: number | null,
  },
}

export const ViewCAG = (props: ComponentProps): JSX.Element => {
  const { t } = useTranslation();
  const [state] = useStateVar({
    isLoading: false as boolean,
  });

  return (
    <Flex flexDirection="column" justifyContent="space-between">
      <Flex
        flexWrap="nowrap"
        flexDirection="column"
        mt="21px"
        height="500px"
        width="600px"
      >
        <Flex flexWrap="nowrap" flexDirection="row" justifyContent="left">
          <strong style={{ fontSize: '14px' }}>
            {t('maquina')}
          </strong>
        </Flex>
        <Flex flexWrap="nowrap" flexDirection="row" justifyContent="left" marginTop="19px">
          <IconWrapper>
            <ChillerIcon />
          </IconWrapper>
          <Flex flexWrap="nowrap" flexDirection="column" ml="8px">
            <strong style={{ fontSize: '14px' }}>
              {props.machine.name}
            </strong>
            <Flex flexWrap="nowrap" flexDirection="row" justifyContent="space-between">
              <div style={{ fontSize: '14px' }}>
                {props.asset?.datId}
              </div>
              {
                props.machine.groupId && (
                  <div>
                    <strong style={{ fontSize: '14px', color: 'rgba(75, 75, 75, 1)', marginRight: '2px' }}>
                      ID:
                    </strong>
                    <span style={{ color: 'rgba(75, 75, 75, 1)' }}>{` ${props.machine.groupId}`}</span>
                  </div>
                )
              }
            </Flex>
            <Flex marginTop="21px">
              <Flex flexDirection="column">
                <FieldCAG label={t('tipoMaquina')} info={props.machine?.type?.toUpperCase()} />
                <FieldCAG label={t('modelo')} info={props.asset?.chillerModel} />
                <FieldCAG label={t('dispositivoDiel')} info={props.asset?.devId} />
              </Flex>
              <Flex flexDirection="column">
                <FieldCAG label={t('aplicacao')} info={props.machine?.applic?.toUpperCase()} />
                <FieldCAG label={t('capacNominal')} info={props.asset?.nominalCapacity ? `${props.asset?.nominalCapacity} BTU/h` : ''} />
              </Flex>
              <Flex flexDirection="column">
                <FieldCAG label={t('fabricante')} info={props.machine?.brandName?.toUpperCase()} />
                <FieldCAG label={t('tensaoNominal')} info={props.asset?.nominalVoltage ? `${props.asset?.nominalVoltage}V` : ''} />
              </Flex>
              <Flex flexDirection="column">
                <FieldCAG label={t('dataInstalacao')} info={props.machine?.installationDate} />
                <FieldCAG label={t('freqNominal')} info={props.asset?.nominalFrequency ? `${props.asset?.nominalFrequency}Hz` : ''} />
              </Flex>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
};
const FieldCAG = ({ label, info }): JSX.Element => (
  <Flex flexWrap="nowrap" flexDirection="column" marginTop="10px">
    <Flex flexWrap="nowrap" flexDirection="row" style={{ width: '172px' }}>
      <div style={{ fontSize: '12px', color: '#ABABAB', fontWeight: 700 }}>
        {label}
      </div>
    </Flex>
    <Flex flexWrap="nowrap" flexDirection="row" marginTop="4px" style={{ width: '172px', height: '20px' }}>
      <div style={{ fontSize: '12px' }}>
        {info}
      </div>
    </Flex>
  </Flex>
);

import {
  IconWrapper,
} from './styles';
import { useStateVar } from 'helpers/useStateVar';
import { Flex } from 'reflexbox';
import {
  BoxIcon,
  ChipIcon,
  LayersIcon,
  TemperatureIcon,
} from '../../icons';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { apiCall } from '../../providers';
import { useTranslation } from 'react-i18next';
import { verifyInfoAdditionalParameters } from '../../helpers/additionalParameters';

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
    refDUTId: string | null
  },
  assets: {
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
  }[],
}

export const ViewMachine = (props: ComponentProps): JSX.Element => {
  const { t } = useTranslation();
  const [state] = useStateVar({
    isLoading: false as boolean,
  });

  const [additionalParameters, setAdditionalParameters] = useState<{ COLUMN_NAME: string; COLUMN_VALUE: string; }[]>([]);

  async function getNobreakAdditionalParameters(MACHINE_ID) {
    try {
      const parameters = await apiCall('/get-machine-additional-parameters', { MACHINE_ID });
      setAdditionalParameters(parameters);
    } catch (err) {
      console.log(err);
      toast.error(t('houveErro'));
    }
  }

  useEffect(() => {
    props.machine?.groupId && getNobreakAdditionalParameters(props.machine.groupId);
  }, []);

  function getAssetRoleById(id) {
    const roles = {
      1: 'Evaporadora',
      2: 'Condensadora',
      3: 'Cortina de ar',
      4: 'Trocador de calor',
    };
    return roles[id] || null;
  }

  return (
    <Flex flexWrap="wrap" flexDirection="column" justifyContent="space-between">
      <Flex
        flexWrap="nowrap"
        flexDirection="column"
        mt="21px"
        height="655px"
        width="580px"
        style={{
          overflow: 'auto',
        }}
      >
        <Flex flexWrap="wrap" flexDirection="row" justifyContent="space-between">
          <Flex flexWrap="nowrap" flexDirection="row" justifyContent="left">
            <strong style={{ fontSize: '14px' }}>
              Máquina
            </strong>
          </Flex>
        </Flex>
        <Flex flexWrap="wrap" flexDirection="row">
          <div style={{ borderLeft: '1px dashed #8E8E8E', marginTop: '14px', height: '170px' }} />
          <Flex flexWrap="wrap" flexDirection="column">
            <Flex flexWrap="nowrap" flexDirection="row" justifyContent="left" marginLeft="26px" marginTop="19px">
              <IconWrapper>
                <LayersIcon />
              </IconWrapper>
              <strong style={{ fontSize: '14px', marginLeft: '8px' }}>
                {props.machine.name}
              </strong>
            </Flex>
            {props.machine.groupId && (
              <Flex flexWrap="nowrap" flexDirection="row" justifyContent="right" marginLeft="54px">
                <div style={{ fontSize: '14px' }}>
                  <strong style={{ fontSize: '14px', color: 'rgba(75, 75, 75, 1)', marginRight: '2px' }}>
                    ID:
                  </strong>
                  <span style={{ color: 'rgba(75, 75, 75, 1)' }}>{` ${props.machine.groupId}`}</span>
                </div>
              </Flex>
            )}
            <Flex flexWrap="nowrap" flexDirection="row" marginTop="21px" marginLeft="54px">
              <Flex flexWrap="wrap" flexDirection="column">
                <Flex flexWrap="nowrap" flexDirection="row" style={{ width: '172px' }}>
                  <div style={{ fontSize: '12px', color: '#ABABAB' }}>
                    Tipo de Máquina
                  </div>
                </Flex>
                <Flex flexWrap="nowrap" flexDirection="row" marginTop="4px" style={{ width: '172px', height: '20px' }}>
                  <div style={{ fontSize: '12px' }}>
                    {props.machine.type}
                  </div>
                </Flex>
                <Flex flexWrap="nowrap" flexDirection="row" marginTop="15px" style={{ width: '172px' }}>
                  <div style={{ fontSize: '12px', color: '#ABABAB' }}>
                    Fluído Refrigerante
                  </div>
                </Flex>
                <Flex flexWrap="nowrap" flexDirection="row" marginTop="4px" style={{ width: '172px', height: '20px' }}>
                  <div style={{ fontSize: '12px' }}>
                    {props.machine.refrigerationFluid}
                  </div>
                </Flex>
              </Flex>
              <Flex flexWrap="wrap" flexDirection="column">
                <Flex flexWrap="nowrap" flexDirection="row" style={{ width: '137px' }}>
                  <div style={{ fontSize: '12px', color: '#ABABAB' }}>
                    Fabricante
                  </div>
                </Flex>
                <Flex flexWrap="nowrap" flexDirection="row" marginTop="4px" style={{ width: '137px', height: '20px' }}>
                  <div style={{ fontSize: '12px', marginTop: '4px' }}>
                    {props.machine.brandName}
                  </div>
                </Flex>
                <Flex flexWrap="nowrap" flexDirection="row" marginTop="15px" style={{ width: '137px' }}>
                  <div style={{ fontSize: '12px', color: '#ABABAB' }}>
                    Potência Nom.
                  </div>
                </Flex>
                <Flex flexWrap="nowrap" flexDirection="row" marginTop="4px" style={{ width: '137px', height: '20px' }}>
                  <div style={{ fontSize: '12px', marginTop: '4px' }}>
                    {`${props.machine.ratedPower}kW`}
                  </div>
                </Flex>
              </Flex>
              <Flex flexWrap="wrap" flexDirection="column">
                <Flex flexWrap="nowrap" flexDirection="row" style={{ width: '128px' }}>
                  <div style={{ fontSize: '12px', color: '#ABABAB' }}>
                    Cap. Frigorífica
                  </div>
                </Flex>
                <Flex flexWrap="nowrap" flexDirection="row" marginTop="4px" style={{ width: '128px', height: '20px' }}>
                  <div style={{ fontSize: '12px', marginTop: '4px' }}>
                    {`${props.machine.refrigerationCapacity} ${props.machine.capacityMeasurementUnit}`}
                  </div>
                </Flex>
                <Flex flexWrap="nowrap" flexDirection="row" marginTop="15px" style={{ width: '128px' }}>
                  <div style={{ fontSize: '12px', color: '#ABABAB' }}>
                    Data de Instalação
                  </div>
                </Flex>
                <Flex flexWrap="nowrap" flexDirection="row" marginTop="4px" style={{ width: '128px', height: '20px' }}>
                  <div style={{ fontSize: '12px', marginTop: '4px' }}>
                    {props.machine.installationDate}
                  </div>
                </Flex>
              </Flex>
            </Flex>
          </Flex>
        </Flex>
        <Flex flexWrap="wrap" flexDirection="row">
          <div style={{ borderLeft: '1px dashed #8E8E8E', height: '50px' }} />
          <Flex flexWrap="wrap" flexDirection="row">
            <Flex flexWrap="nowrap" flexDirection="row" justifyContent="left" marginLeft="26px" marginTop="19px">
              <strong style={{ fontSize: '14px', marginLeft: '8px' }}>
                Ativos
              </strong>
            </Flex>
            <Flex flexWrap="nowrap" flexDirection="row" justifyContent="right" width="120px" marginLeft="305px" marginTop="19px">
              <div style={{ fontSize: '14px' }}>
                {`Total ${props.assets.length} ativo${props.assets.length > 1 ? 's' : ''}`}
              </div>
            </Flex>
          </Flex>
        </Flex>
        {props.assets.map((asset, index) => (
          <Flex flexWrap="wrap" flexDirection="row" style={{ height: '194px', width: '520px' }}>
            <div style={{ borderLeft: '1px dashed #8E8E8E', height: index === props.assets.length - 1 ? '101px' : '206px' }} />
            <div style={{
              borderBottom: '1px dashed #8E8E8E',
              height: '101px',
              width: '21px',
            }}
            />
            <Flex
              flexWrap="nowrap"
              flexDirection="column"
              height="184px"
              width="485px"
              style={{
                borderLeft: '5px solid #363BC4',
                borderRadius: '5px',
                borderTop: '1px solid #8E8E8E',
                borderRight: '1px solid #8E8E8E',
                borderBottom: '1px solid #8E8E8E',
              }}
              mt="15px"
            >
              <Flex flexWrap="wrap" flexDirection="row">
                <Flex flexWrap="wrap" flexDirection="column">
                  <Flex flexWrap="nowrap" flexDirection="row" justifyContent="left" marginLeft="10px" marginTop="20px">
                    <IconWrapper>
                      <BoxIcon />
                    </IconWrapper>
                    <strong style={{ fontSize: '13px', marginLeft: '5px' }}>
                      {asset.name}
                    </strong>
                  </Flex>
                  <Flex flexWrap="nowrap" flexDirection="row" justifyContent="left" marginLeft="34px">
                    <div style={{ fontSize: '13px' }}>
                      {`${asset.datId || ''}${asset.devId && asset.datId ? '/' : ''}${asset.devId || ''}`}
                    </div>
                  </Flex>
                </Flex>
              </Flex>
              <Flex flexWrap="nowrap" flexDirection="row" marginTop="15px" marginLeft="34px">
                <Flex flexWrap="wrap" flexDirection="column">
                  <Flex flexWrap="nowrap" flexDirection="row" style={{ width: '148px' }}>
                    <div style={{ fontSize: '12px', color: '#ABABAB' }}>
                      Modelo
                    </div>
                  </Flex>
                  <Flex flexWrap="nowrap" flexDirection="row" marginTop="4px" style={{ width: '148px', height: '20px' }}>
                    <div style={{ fontSize: '12px' }}>
                      {asset.model}
                    </div>
                  </Flex>
                  <Flex flexWrap="nowrap" flexDirection="row" marginTop="15px" style={{ width: '126px' }}>
                    <div style={{ fontSize: '12px', color: '#ABABAB' }}>
                      Função
                    </div>
                  </Flex>
                  <Flex flexWrap="nowrap" flexDirection="row" marginTop="4px" style={{ width: '126px', height: '20px' }}>
                    <div style={{ fontSize: '12px' }}>
                      {getAssetRoleById(asset.roleId)}
                    </div>
                  </Flex>
                </Flex>
                <Flex flexWrap="wrap" flexDirection="column">
                  <Flex flexWrap="nowrap" flexDirection="row" style={{ width: '120px' }}>
                    <div style={{ fontSize: '12px', color: '#ABABAB' }}>
                      Cap. Frigorífica
                    </div>
                  </Flex>
                  <Flex flexWrap="nowrap" flexDirection="row" marginTop="4px" style={{ width: '120px', height: '20px' }}>
                    <div style={{ fontSize: '12px' }}>
                      {`${asset.refrigerationCapacity} ${asset.capacityMeasurementUnit}`}
                    </div>
                  </Flex>
                </Flex>
                <Flex flexWrap="wrap" flexDirection="column">
                  <Flex flexWrap="nowrap" flexDirection="row" style={{ width: '126px' }}>
                    <div style={{ fontSize: '12px', color: '#ABABAB' }}>
                      Potência Nominal
                    </div>
                  </Flex>
                  <Flex flexWrap="nowrap" flexDirection="row" marginTop="4px" style={{ width: '126px', height: '20px' }}>
                    <div style={{ fontSize: '12px' }}>
                      {`${asset.ratedPower || 0} kW`}
                    </div>
                  </Flex>
                </Flex>
              </Flex>
            </Flex>
          </Flex>
        ))}
        {props.machine.automationDevId && (
          <Flex
            flexWrap="nowrap"
            flexDirection="column"
            mt="29px"
          >
            <Flex flexDirection="row">
              <Flex flexWrap="wrap" justifyContent="center" alignContent="center" mr="10px">
                <IconWrapper>
                  <ChipIcon />
                </IconWrapper>
              </Flex>
              <Flex flexWrap="nowrap" flexDirection="column" justifyContent="left">
                <strong style={{ fontSize: '14px' }}>
                  Automação
                </strong>
                <div style={{ fontSize: '14px' }}>
                  {props.machine.automationDevId}
                </div>
              </Flex>
            </Flex>
          </Flex>
        )}
        {props.machine.refDUTId && (
          <Flex
            flexWrap="nowrap"
            flexDirection="column"
            mt="29px"
          >
            <Flex flexDirection="row">
              <Flex flexWrap="wrap" justifyContent="center" alignContent="center" mr="10px">
                <IconWrapper>
                  <TemperatureIcon />
                </IconWrapper>
              </Flex>
              <Flex flexWrap="nowrap" flexDirection="column" justifyContent="left">
                <strong style={{ fontSize: '14px' }}>
                  DUT Referência
                </strong>
                <div style={{ fontSize: '14px' }}>
                  {props.machine.refDUTId}
                </div>
              </Flex>
            </Flex>
          </Flex>
        )}
        <Flex flexDirection="row" flexWrap="wrap" justifyContent="space-between" width="100%" alignItems="space-between">
          <Flex flexDirection="column">
            {additionalParameters.length > 0 && verifyInfoAdditionalParameters(additionalParameters, true)}
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
};

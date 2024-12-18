import { useState } from 'react';
import { useStateVar } from 'helpers/useStateVar';
import { Flex } from 'reflexbox';
import { IconWrapper, IconBiggerWrapper } from './styles';
import { getUserProfile } from 'helpers/userProfile';
import { AssetConnection } from 'components/AssetConnection';
import ReactTooltip from 'react-tooltip';
import {
  ChipIcon,
  UtilityIcon,
  LightOnIcon,
  BatteryIcon,
  EletricNetworkIcon,
  NobreakOffIcon,
  InfoIcon,
  LightOffIcon,
} from '../../icons';
import { colors } from '../../styles/colors';
import { useTranslation } from 'react-i18next';

interface ComponentProps {
  utils: {
    ID: number,
    ILLUMINATION_ID?: number
    NOBREAK_ID?: number
    NAME: string,
    UNIT_ID: number,
    DAL_ID?: number,
    DMT_CODE?: string,
    DAL_CODE?: string,
    DAT_CODE?: string
    GRID_VOLTAGE?: number,
    GRID_CURRENT?: number,
    PORT?: number
    FEEDBACK?: number
    selected: boolean
    CIRCUIT_ID?: number
    APPLICATION: string
    STATUS: string
  }[]
  DEV_ID: string
  isDevSelected: boolean,
  isUtilSelected: boolean,
  onHandleSelectCard,
  lastTelemetry?: null | { Feedback: boolean[] },
}

export const UtilityTree = (props: ComponentProps): JSX.Element => {
  const { t } = useTranslation();
  const [profile] = useState(getUserProfile);
  const [state, render, setState] = useStateVar(() => ({
    utils: props.utils,
    deviceSelected: props.isDevSelected,
    utilSelected: props.isUtilSelected,
    larguraPage: window.innerWidth,
  }));
  document.body.onresize = function () {
    setState({ larguraPage: document.body.clientWidth });
  };

  const utilityStatus = {
    Nobreak: {
      'Rede Elétrica': {
        icon: <EletricNetworkIcon />,
        label: t('redeEletrica'),
      },
      Bateria: {
        icon: <BatteryIcon />,
        label: t('bateria'),
      },
      Desligado: {
        icon: <NobreakOffIcon color="#CFCFCF" />,
        label: t('desligadoMin'),
      },
      Indisponível: {
        icon: <InfoIcon />,
        label: t('semInformacao'),
      },
    },
    Illumination: {
      Ligado: {
        icon: <LightOnIcon />,
        label: t('ligadoMinusculo'),
      },
      Desligado: {
        icon: <LightOffIcon />,
        label: t('desligadoMin'),
      },
      Indisponível: {
        icon: <InfoIcon />,
        label: t('semInformacao'),
      },
    },
  };
  const feedbacks = props.lastTelemetry?.Feedback;

  // position -2 means selected device
  function selectCard(position: number) {
    state.utils.forEach((util, index) => util.selected = position === index);
    state.deviceSelected = position === -2;
    props.onHandleSelectCard(position);
    render();
  }

  function borderCard(isSelected: boolean) {
    return !isSelected ? '1px solid lightgrey' : '2px solid #363BC4';
  }

  function borderLeftCard(isSelected: boolean) {
    return !isSelected ? '1px solid lightgrey' : '4px solid #363BC4';
  }

  function cardRootDescription(name: string|null, maxSize: number, extraInfo?: string) {
    if (!name) return null;
    const overExtended = name.length > maxSize;
    const nameDisplay = !overExtended ? name : `${name.substring(0, maxSize)}...`;
    return (
      <>
        <div style={{ fontSize: '95%' }} data-tip data-for={name}>
          <strong>{nameDisplay}</strong>
          {extraInfo && <span style={{ display: 'block', fontSize: '85%', color: colors.Grey300 }}>{extraInfo}</span>}
        </div>
        {overExtended && (
          <ReactTooltip
            id={name}
            place="top"
            effect="solid"
            delayHide={100}
            offset={{ top: 0, left: 10 }}
            textColor="#000000"
            border
            backgroundColor="rgba(255, 255, 255, 0.97)"
          >
            <span style={{ marginTop: '6px', fontSize: '95%' }}>
              <strong>{name}</strong>
            </span>
          </ReactTooltip>
        )}
      </>
    );
  }

  function formatItemIcon(type: string) {
    switch (type) {
      case 'Device': return <ChipIcon />;
      case 'Utility': return <UtilityIcon />;
      default: return null;
    }
  }

  return (
    <>
      <Flex
        flexWrap="nowrap"
        flexDirection="column"
        height={state.larguraPage > 767 ? '400px' : 'auto'}
        style={{
          backgroundColor: '#F5F5F5',
          overflow: 'auto',
          marginLeft: '2px',
          width: '100%',
          padding: '20px',
        }}
      >
        <Flex flexWrap="wrap" flexDirection="column">
          <Flex
            flexWrap="wrap"
            flexDirection="row"
            height="58px"
            alignItems="left"
            style={{
              border: borderCard(state.deviceSelected),
              borderLeft: borderLeftCard(state.deviceSelected),
              borderRadius: '5px',
              backgroundColor: '#FFFFFF',
              cursor: 'pointer',
            }}
            mt={3}
            ml={15}
            onClick={() => selectCard(-2)}
            maxWidth={355}
          >
            <Flex
              flexWrap="nowrap"
              flexDirection="row"
              alignItems="left"
              height="58px"
              width="27px"
            >
              <strong style={{ marginLeft: '10px', marginTop: '20px', fontSize: '95%' }}>
                ▼
              </strong>
            </Flex>
            <Flex
              flexWrap="nowrap"
              flexDirection="row"
              height="58px"
              width="27px"
              alignItems="left"
            >
              <IconBiggerWrapper style={{ marginTop: '20px', marginLeft: '2px', marginRight: '5px' }}>
                {formatItemIcon('Device')}
              </IconBiggerWrapper>
            </Flex>
            <Flex
              flexWrap="nowrap"
              flexDirection="column"
              justifyContent="center"
              height="58px"
              alignItems="left"
            >
              {cardRootDescription(props.DEV_ID, 36)}
            </Flex>
          </Flex>
        </Flex>
        {state.utils.map((util, index) => (
          !util.CIRCUIT_ID
          && (
          <Flex key={util.ID} flexDirection="row">
            <div style={{ borderLeft: '1px dashed black', height: index !== state.utils.length - 1 ? '100%' : '60%', marginLeft: '31px' }} />
            <div style={{
              borderBottom: '1px dashed black',
              height: '60%',
              width: '15px',
            }}
            />
            <Flex
              flexWrap="nowrap"
              flexDirection="row"
              height="58px"
              width="fit-content"
              alignItems="left"
              mt={3}
              style={{
                border: borderCard(util.selected),
                borderLeft: borderLeftCard(util.selected),
                borderRadius: '5px',
                backgroundColor: '#FFFFFF',
                cursor: 'pointer',
              }}
              onClick={() => selectCard(index)}
            >
              <Flex
                flexWrap="nowrap"
                flexDirection="row"
                height="58px"
                width="27px"
                alignItems="left"
                marginLeft="5px"
                marginRight="5px"
              >
                <IconBiggerWrapper style={{ height: '100%' }}>
                  {formatItemIcon('Utility')}
                </IconBiggerWrapper>
              </Flex>
              <Flex
                flexWrap="nowrap"
                flexDirection="row"
                height="58px"
                alignItems="left"
                width="245px"
              >
                <Flex
                  flexWrap="nowrap"
                  flexDirection="column"
                  justifyContent="center"
                  mr={2}
                  alignItems="left"
                  height="58px"
                >
                  {cardRootDescription(`${util.NAME}`, 33, util.NOBREAK_ID ? `${util.DAT_CODE ?? '-'} / ${util.DMT_CODE ?? '-'}` : undefined)}
                </Flex>
              </Flex>
              <Flex flexDirection="row" alignItems="left" width="36px" height="100%">
                <Flex flexWrap="wrap" flexDirection="column" alignItems="center" width="0">
                  <div
                    style={{
                      marginTop: '12px', borderLeft: '1px solid #DCDCDC', height: '30px',
                    }}
                  />
                </Flex>
                <Flex flexWrap="wrap" flexDirection="column" alignItems="center" justifyContent="space-evenly" padding="3px">
                  {util.DMT_CODE
                  && (
                  <IconWrapper data-tip data-for={`noInfoTree-${util.ID}`}>
                    {utilityStatus[util.APPLICATION] && utilityStatus[util.APPLICATION][util.STATUS] ? utilityStatus[util.APPLICATION][util.STATUS].icon : utilityStatus[util.APPLICATION]['Indisponível'].icon}
                  </IconWrapper>
                  )}
                  {util.DAL_CODE
                  && (
                  <IconWrapper>
                    {util.FEEDBACK && (
                      <>
                        {feedbacks && feedbacks[util.FEEDBACK - 1] ? (
                          <LightOnIcon />
                        ) : <LightOffIcon />}
                      </>
                    )}
                  </IconWrapper>
                  )}
                  <IconBiggerWrapper>
                    <AssetConnection key={util.ID} DUT_ID={null} DEV_ID={props.DEV_ID} isAutomation />
                  </IconBiggerWrapper>
                  {(!(utilityStatus[util.APPLICATION] && utilityStatus[util.APPLICATION][util.STATUS]) || util.STATUS === 'Indisponível')
                  && (
                  <ReactTooltip
                    id={`noInfoTree-${util.ID}`}
                    place="top"
                    border
                    textColor="#000000"
                    backgroundColor="rgba(255, 255, 255, 0.97)"
                    borderColor="#202370"
                  >
                    <div style={{ width: '200px' }}>
                      {util.APPLICATION === 'Nobreak' && <span>{t('semInfoNobreakDmt')}</span>}
                      {util.APPLICATION === 'Illumination' && <span>{t('semInfoIluminacaoDmt')}</span>}
                    </div>
                  </ReactTooltip>
                  )}
                </Flex>
              </Flex>
            </Flex>
          </Flex>
          )
        ))}
      </Flex>
    </>
  );
};

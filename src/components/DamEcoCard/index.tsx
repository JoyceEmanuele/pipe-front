import { useState } from 'react';
import { useStateVar } from 'helpers/useStateVar';
import { Flex } from 'reflexbox';
import {
  IconWrapper,
  DataText,
  DesktopWrapper,
  MobileWrapper,
  ShowHideButton,
} from './styles';
import { getUserProfile } from 'helpers/userProfile';
import { colors } from 'styles/colors';
import ReactTooltip from 'react-tooltip';
import styles from './styles.module.css';
import {
  NoSignalIcon,
  BadSignalIcon,
  RegularSignalIcon,
  GoodSignalIcon,
  GreatSignalIcon,
  InformationIcon,
  ArrowDownIconV2,
  ArrowUpIconV2,
} from '../../icons';
import { useTranslation } from 'react-i18next';

interface ComponentProps {
  damInfo:{
    DAM_ID: string|null,
    damEco: string|null,
  }
  dutInfo?:{
    DUT_ID: string|null,
    ROOM_DESC: string|null,
  }
  telemetry:{
    timestamp: string|null,
    lastTelemetry: string|null,
    status: string|null,
    RSSI: string|null,
  }
}

export const DamEcoCard = (props: ComponentProps): JSX.Element => {
  const { t } = useTranslation();
  const [profile] = useState(getUserProfile);
  const [state, render, _setState] = useStateVar(() => ({
    TIMESTAMP: null,
    LAST_TELEMETRY: null as string|null,
    STATUS: null as string|null,
    RSSI: null as string|null,
    showMobileInfo: false as boolean,
  }));

  function rssiDesc(RSSI: number, status: string) {
    if (RSSI < 0 && status === 'ONLINE') {
      if (RSSI > -50) return 'Excelente';
      if (RSSI > -60) return 'Bom';
      if (RSSI > -70) return 'Regular';
      return 'Ruim';
    }
    return '-';
  }

  function formatRssiIcon(rssi: string) {
    switch (rssi) {
      case 'Excelente': return <GreatSignalIcon />;
      case 'Bom': return <GoodSignalIcon />;
      case 'Regular': return <RegularSignalIcon />;
      case 'Ruim': return <BadSignalIcon />;
      default: return <NoSignalIcon />;
    }
  }

  function rssiText() {
    return props.telemetry.RSSI || '-';
  }

  return (
    <>
      <DesktopWrapper>
        <Flex
          flexWrap="nowrap"
          flexDirection="column"
          height="206px"
          width="221px"
          alignItems="left"
          style={{
            border: '1px solid lightgrey',
            borderRadius: '10px',
          }}
        >
          <Flex flexWrap="nowrap" flexDirection="row" alignItems="left">
            <Flex flexWrap="nowrap" flexDirection="column" alignItems="left">
              <Flex flexWrap="nowrap" flexDirection="column" alignItems="left">
                <DataText style={{ marginLeft: '24px', marginTop: '21px', fontSize: '12px' }} color={colors.Black} fontWeight="bold">
                  {t('devId')}
                </DataText>
              </Flex>
              <Flex flexWrap="nowrap" flexDirection="column" alignItems="left">
                <DataText style={{ marginLeft: '24px', marginTop: '4px', fontSize: '12px' }} color={colors.Black}>
                  {props.damInfo.DAM_ID}
                </DataText>
              </Flex>
            </Flex>
            <Flex flexWrap="nowrap" flexDirection="column" alignItems="left">
              <div style={{
                marginTop: '19px', marginLeft: '19px', borderLeft: '2px solid lightgrey', height: '42px',
              }}
              />
            </Flex>
            <Flex flexWrap="nowrap" flexDirection="column" alignItems="left">
              <Flex flexWrap="nowrap" flexDirection="column" alignItems="left">
                <DataText style={{ marginLeft: '24px', marginTop: '19px', fontSize: '12px' }} color={colors.Black} fontWeight="bold">
                  {t('status')}
                </DataText>
              </Flex>
              <Flex flexWrap="nowrap" flexDirection="column" alignItems="left">
                <DataText style={{ marginLeft: '30px' }}>
                  <div>
                    {(profile.manageAllClients && (rssiText() != null))
                      && (
                      <IconWrapper width="19" height="25">
                        {formatRssiIcon(rssiText())}
                      </IconWrapper>
                      )}
                  </div>
                </DataText>
              </Flex>
            </Flex>
          </Flex>
          <Flex flexWrap="nowrap" flexDirection="row" alignItems="left">
            <div style={{
              marginTop: '20px', borderBottom: '2px solid lightgrey', width: '221px',
            }}
            />
          </Flex>
          <Flex flexWrap="nowrap" flexDirection="row" alignItems="left">
            <DataText style={{ marginLeft: '24px', marginTop: '21px', fontSize: '12px' }} color={colors.Black} fontWeight="bold">
              {t('ambienteRefrigerado')}
            </DataText>
            <DataText style={{ marginLeft: '6px', marginTop: '17px', fontSize: '12px' }}>
              <IconWrapper data-tip data-for="information">
                <InformationIcon />
                <ReactTooltip
                  id="information"
                  place="top"
                  effect="solid"
                  delayHide={100}
                  offset={{ top: 0, left: 10 }}
                  textColor="#000000"
                  border
                  backgroundColor="rgba(255, 255, 255, 0.97)"
                  className={styles.tooltipHolder}
                >
                  <Flex flexWrap="nowrap" flexDirection="column" alignItems="left">
                    <span style={{ marginTop: '6px', fontSize: '95%' }}>
                      {props.dutInfo ? props.dutInfo.ROOM_DESC : props.damInfo.DAM_ID}
                    </span>
                    {props.dutInfo && (
                      <span style={{ marginTop: '6px', fontSize: '95%' }}>
                        <a href={`${window.location.protocol}//${window.location.host}/analise/dispositivo/${props.dutInfo.DUT_ID}/informacoes`}>{props.dutInfo.DUT_ID}</a>
                      </span>
                    )}
                  </Flex>
                </ReactTooltip>
              </IconWrapper>
            </DataText>
          </Flex>
          <Flex flexWrap="nowrap" flexDirection="column" alignItems="left">
            <DataText style={{ marginLeft: '24px', marginTop: '18px', fontSize: '12px' }} color={colors.Black} fontWeight="bold">
              {t('modoEco')}
            </DataText>
            <DataText style={{ marginLeft: '24px', marginTop: '4px', fontSize: '12px' }} color={colors.Black}>
              {props.damInfo.damEco}
            </DataText>
          </Flex>
        </Flex>
      </DesktopWrapper>
      <MobileWrapper>
        <Flex
          flexWrap="nowrap"
          flexDirection="column"
          alignItems="left"
          width="290px"
          style={{
            border: '1px solid lightgrey',
            borderRadius: '10px',
          }}
        >
          <Flex
            flexWrap="nowrap"
            flexDirection="row"
            height="81px"
            alignItems="left"
          >
            <Flex flexWrap="nowrap" flexDirection="column" alignItems="left">
              <Flex flexWrap="nowrap" flexDirection="column" alignItems="left">
                <DataText style={{ marginLeft: '24px', marginTop: '21px', fontSize: '12px' }} color={colors.Black} fontWeight="bold">
                  {t('devId')}
                </DataText>
              </Flex>
              <Flex flexWrap="nowrap" flexDirection="column" alignItems="left">
                <DataText style={{ marginLeft: '24px', marginTop: '4px', fontSize: '12px' }} color={colors.Black}>
                  {props.damInfo.DAM_ID}
                </DataText>
              </Flex>
            </Flex>
            <Flex flexWrap="nowrap" flexDirection="column" alignItems="left">
              <div style={{
                marginTop: '19px', marginLeft: '19px', borderLeft: '2px solid lightgrey', height: '42px',
              }}
              />
            </Flex>
            <Flex flexWrap="nowrap" flexDirection="column" alignItems="left">
              <Flex flexWrap="nowrap" flexDirection="column" alignItems="left">
                <DataText style={{ marginLeft: '24px', marginTop: '19px', fontSize: '12px' }} color={colors.Black} fontWeight="bold">
                  {t('status')}
                </DataText>
              </Flex>
              <Flex flexWrap="nowrap" flexDirection="column" alignItems="left">
                <DataText style={{ marginLeft: '30px' }}>
                  <div>
                    {(profile.manageAllClients && (rssiText() != null))
                      && (
                      <IconWrapper width="19" height="25">
                        {formatRssiIcon(rssiText())}
                      </IconWrapper>
                      )}
                  </div>
                </DataText>
              </Flex>
            </Flex>
            <Flex flexWrap="nowrap" flexDirection="column" alignItems="left">
              <ShowHideButton style={{ marginLeft: '28px', marginTop: '19px' }} onClick={() => { state.showMobileInfo = !state.showMobileInfo; render(); }}>
                <IconWrapper width="9" height="15">
                  {!state.showMobileInfo ? <ArrowDownIconV2 /> : <ArrowUpIconV2 />}
                </IconWrapper>
              </ShowHideButton>
            </Flex>
          </Flex>
          {state.showMobileInfo && (
            <>
              <Flex
                flexWrap="nowrap"
                flexDirection="column"
                width="290px"
                alignItems="left"
              >
                <DataText style={{ marginLeft: '24px', marginTop: '21px', fontSize: '12px' }} color={colors.Black} fontWeight="bold">
                  {t('ambienteRefrigerado')}
                </DataText>
                <span style={{ marginTop: '6px', marginLeft: '24px', fontSize: '95%' }}>
                  {props.dutInfo ? props.dutInfo.ROOM_DESC : props.damInfo.DAM_ID}
                </span>
                {props.dutInfo && (
                  <span style={{ marginTop: '6px', marginLeft: '24px', fontSize: '95%' }}>
                    <a href={`${window.location.protocol}//${window.location.host}/analise/dispositivo/${props.dutInfo.DUT_ID}/informacoes`}>{props.dutInfo.DUT_ID}</a>
                  </span>
                )}
              </Flex>
              <Flex
                flexWrap="nowrap"
                flexDirection="column"
                width="290px"
                alignItems="left"
              >
                <DataText style={{ marginLeft: '24px', marginTop: '18px', fontSize: '12px' }} color={colors.Black} fontWeight="bold">
                  {t('modoEco')}
                </DataText>
                <DataText style={{ marginLeft: '24px', marginTop: '4px', fontSize: '12px' }} color={colors.Black}>
                  {props.damInfo.damEco}
                </DataText>
              </Flex>
            </>
          )}
        </Flex>
      </MobileWrapper>
    </>
  );
};

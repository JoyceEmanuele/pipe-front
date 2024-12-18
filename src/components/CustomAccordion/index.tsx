import { t } from 'i18next';
import { useState } from 'react';
import { Flex } from 'reflexbox';
import {
  ArrowDownIconV2, ClientNotificationIcon, EnergyIcon, InfoIcon, OutHealthIcon, RiskHealthIcon, TermometerSubIcon, UnitNotificationIcon,
  UrgentHealthIcon,
} from '~/icons';
import {
  AccordionInfo, AccordionTitle, ContainerViewNotification, Text,
} from './styles';
import { WaterIcon } from '~/icons/Water';
import { CircleCheckFill } from '~/icons/CircleCheckFill';
import { TransparentLink } from '~/pages/NewNotifications/styles';
import ReactTooltip from 'react-tooltip';
import moment from 'moment-timezone';

interface CustomAccordionProps {
  title: string;
  notificationId: number;
  gmt: number;
  area: string,
  notification: {
      detections: {
        dateDetection: string;
        unitId: number;
        unitName: string;
        clientName: string;
        consumption?: number;
        machineName?: string;
        machineId?: number;
        dacId?: string;
        report?: string;
      }[];
      setpoint?: number;
      isGreater?: boolean;
      isInstantaneous: boolean;
      healthIndex?: number;
      healthIndexName?: string;
  } | undefined;
  description: string;
  type: 'Energia' | 'Água' | 'Saúde';
  subType: 'Ambiente' | 'Energia' | 'Água' | 'Manutenção Urgente' | 'Risco Iminente' | 'Fora de Especialização' | 'Sistema reestabelecido';
  time: string;
  tabName: string;
  children?: React.ReactNode;
  handleViewNotification?: (notificationId: number) => void;
  getToLink: (typeName: string, detection) => string;
}

const TypeIcon = ({ subType }: { subType: string }) => {
  switch (subType) {
    case 'Água':
      return <WaterIcon width="22px" color="#2D81FF" />;
    case 'Ambiente':
      return <TermometerSubIcon color="#E00030" width="24px" />;
    case 'Manutenção Urgente':
      return <UrgentHealthIcon width="22px" />;
    case 'Risco Iminente':
      return <RiskHealthIcon width="22px" />;
    case 'Fora de Especialização':
      return <OutHealthIcon width="22px" />;
    case 'Sistema reestabelecido':
      return <CircleCheckFill width="22px" />;
    case 'Energia':
      return <EnergyIcon color="#FFBE16" width="22px" />;
    default:
      return <WaterIcon width="22px" color="#2D81FF" />;
  }
};

function returnOffset(gmt, area) {
  let offset = gmt;
  if (gmt && area) {
    const isDST = moment.tz(area).isDST();

    if (isDST) {
      offset += 1; // Adiciona uma hora ao offset se estiver em horário de verão
    }
    return offset;
  }

  return offset;
}

export const CustomAccordion = ({
  title,
  notification,
  notificationId,
  time,
  description,
  type,
  subType,
  tabName,
  children,
  gmt,
  area,
  handleViewNotification,
  getToLink,
}: CustomAccordionProps): JSX.Element => {
  const [open, setOpen] = useState(false);

  return (
    <Flex
      width={1}
      justifyContent="center"
      alignItems="center"
      flexDirection="row"
      mb="20px"
    >
      <Flex
        width={1}
        justifyContent="center"
        alignItems="center"
        flexDirection="column"
        mr="20px"
      >
        <Flex
          width={1}
          justifyContent="flex-start"
          alignItems="center"
          height="100%"
          style={{
            border: '1px solid #D7D7D7',
            borderRadius: '4px',
            gap: '16px',
          }}
          padding="5px 15px"
          onClick={() => setOpen(!open)}
        >
          {!open ? (
            <ArrowDownIconV2 width="6px" height="6px" color="#000000" />
          ) : (
            <ArrowDownIconV2
              width="6px"
              height="6px"
              color="#000000"
              style={{ transform: 'rotate(180deg)' }}
            />
          )}
          <TypeIcon subType={subType} />
          <Flex
            width={1}
            justifyContent="flex-start"
            alignItems="flex-start"
            flexDirection="column"
          >
            <Flex
              justifyContent="space-between"
              alignItems="center"
              style={{ gap: '2rem' }}
            >
              <AccordionTitle>{title}</AccordionTitle>
              <Flex style={{ gap: '1.5rem', alignItems: 'center' }}>
                <Flex style={{ gap: '5px', alignItems: 'center' }}>
                  <ClientNotificationIcon />
                  <AccordionInfo style={{ textDecoration: 'none' }}>
                    {notification?.detections[0].clientName}
                  </AccordionInfo>

                </Flex>
                <Flex style={{ gap: '5px', alignItems: 'center' }}>
                  <UnitNotificationIcon />
                  {notification?.detections.length === 1 ? (
                    <TransparentLink to={getToLink(type, notification?.detections[0])}>
                      <AccordionInfo>{notification?.detections[0].unitName}</AccordionInfo>
                    </TransparentLink>
                  )
                    : (
                      <AccordionInfo style={{ textDecoration: 'none' }}>
                        {`${notification?.detections?.length ?? 0} ${t('unidades')} `}
                      </AccordionInfo>
                    )}
                </Flex>
              </Flex>
            </Flex>

            <Text style={{ fontSize: '12px', color: '#000000' }}>
              <strong>{description}</strong>
            </Text>
          </Flex>
          <Text
            style={{ fontSize: '12px', color: '#000000', whiteSpace: 'nowrap' }}
          >
            {time}
            {
              gmt !== -3 && (
                <>
                  <InfoIcon color="lightgrey" width="12px" data-for={`tooltip-gmtInfo${notificationId}`} data-tip={t('gmtInfoNotifications', { gmt: returnOffset(gmt, area) })} />
                  <ReactTooltip
                    id={`tooltip-gmtInfo${notificationId}`}
                    place="top"
                    effect="solid"
                    delayHide={100}
                    textColor="#000000"
                    border
                    backgroundColor="rgba(256, 256, 256, 1)"
                  />
                </>
              )
            }
          </Text>
        </Flex>
        {open && (
          <Flex
            width={1}
            justifyContent="flex-start"
            alignItems="flex-start"
            flexDirection="column"
            style={{
              gap: '16px',
              background: '#EDEDED',
              borderBottomLeftRadius: '4px',
              borderBottomRightRadius: '4px',
            }}
            padding="14px 8px 14px 22px"
          >
            {children}
          </Flex>
        )}
      </Flex>
      {tabName === 'feed' && (
        <ContainerViewNotification onClick={() => handleViewNotification && handleViewNotification(notificationId)}>
          <CircleCheckFill
            width="24px"
            color="#363BC4"
          />
        </ContainerViewNotification>
      )}
    </Flex>
  );
};

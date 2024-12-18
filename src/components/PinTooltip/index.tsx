import { colors } from '~/styles/colors';
import { Divider } from '../Divider';
import {
  Contents, Header, PinTooltipStyled, StatusColor,
} from './styles';
import { UnitMapPointsResponseData } from '~/metadata/UnitMap.model';
import moment from 'moment';
import i18n from '~/i18n';
import { useTranslation } from 'react-i18next';

interface PinTooltipProps {
  tooltipId: string;
  pin: UnitMapPointsResponseData;
}

export const PinTooltip: React.FC<PinTooltipProps> = ({ tooltipId, pin }) => {
  moment.locale(i18n.language === 'pt' ? 'pt-BR' : 'en');
  const { t } = useTranslation();
  const isDUTQA = (pin.eCO2 !== undefined && pin.eCO2 !== null) && (pin.HUMIDITY !== undefined && pin.HUMIDITY !== null);

  const overflowSize = {
    dutQA: 25,
    dut: 21,
  };

  const handleGetStatusColor = (pin) => {
    const colorsOption = {
      blue: colors.BlueSecondary,
      red: colors.RedDark,
      green: colors.GreenLight,
      gray: '#B4B4B4',
    };

    const limits = [pin.TUSEMIN, pin.TUSEMAX];

    if (limits.every((limit) => limit === null || limit === undefined)) return colorsOption.gray;

    if (pin.TEMPERATURE === null || pin.TEMPERATURE === undefined) return colorsOption.gray;

    if (pin.TEMPERATURE < pin.TUSEMIN) return colorsOption.blue;

    if (pin.TEMPERATURE > pin.TUSEMIN && pin.TEMPERATURE < pin.TUSEMAX) return colorsOption.green;

    if (pin.TEMPERATURE > pin.TUSEMAX) return colorsOption.red;

    return colorsOption.gray;
  };

  const handleGetPinInfo = (info) => {
    if (info || info === 0) return info;

    return '-';
  };

  return (
    <div
      id={tooltipId}
      style={{
        position: 'absolute',
        left: '-40%',
        transform: 'translateX(-50%)',
        background: 'rgba(255, 255, 255, 1)',
        border: '0.8px solid rgba(0, 0, 0, 0.19)',
        boxShadow: '4px 4px 4px 0px rgba(0, 0, 0, 0.05)',
        padding: '5px',
        display: 'none',
        width: isDUTQA ? '192px' : '151px',
        borderRadius: '5px',
      }}
    >
      <PinTooltipStyled>
        <Header haveOverflow={pin.ROOM_NAME?.length > overflowSize[isDUTQA ? 'dutQA' : 'dut']}>
          <div className="text">
            <h2>{pin.ROOM_NAME}</h2>
            <span>{pin.DEV_ID}</span>
          </div>
          <StatusColor color={handleGetStatusColor(pin)} />
        </Header>
        <Contents isDUTQA={isDUTQA}>
          <div className="content">
            <h3>{t('temperatura')}</h3>
            <p>
              <strong>{handleGetPinInfo(pin.TEMPERATURE)}</strong>
              °C
            </p>
            <span>
              {handleGetPinInfo(pin.TUSEMIN)}
              °C-
              {handleGetPinInfo(pin.TUSEMAX)}
              °C
            </span>
          </div>
          {isDUTQA && (
            <>
              <Divider width={0.5} height={35} />
              <div className="content">
                <h3>{t('umidade')}</h3>
                <p>
                  {handleGetPinInfo(pin.HUMIDITY)}
                  %
                </p>
                <span>
                  {handleGetPinInfo(pin.HUMIMIN)}
                  %-
                  {handleGetPinInfo(pin.HUMIMAX)}
                  %
                </span>
              </div>
              <Divider width={0.5} height={35} />
              <div className="content">
                <h3>CO2</h3>
                <p>
                  {handleGetPinInfo(pin.eCO2)}
                  <span>
                    ppm
                  </span>
                </p>
                <span>
                  {handleGetPinInfo(pin.CO2MAX)}
                  <span>
                    ppm
                  </span>
                </span>
              </div>
            </>
          )}
        </Contents>
      </PinTooltipStyled>
    </div>
  );
};

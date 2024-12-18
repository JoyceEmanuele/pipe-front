import { EditPenIcon, TrashRoundedIcon } from '~/icons';
import {
  ActionButtons,
  ContentWrapper,
  StatusColor,
  Temperature,
  TooltipContainer,
  TooltipText,
} from './styles';
import { UnitMapPointsResponseData } from '~/metadata/UnitMap.model';
import { colors } from '~/styles/colors';
import { useUnitMap } from '~/pages/Analysis/Units/UnitProfile/UnitMap/UnitMapContext';

interface PinProps {
  pin: UnitMapPointsResponseData;
  handleEditPin: (pinId: number) => void
}

export const Pin: React.FC<PinProps> = ({ pin, handleEditPin }) => {
  const {
    removePin,
    isShowList,
  } = useUnitMap();

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

  const handleGetPinTemperature = (pin) => {
    if (pin.TEMPERATURE || pin.TEMPERATURE === 0) return pin.TEMPERATURE;

    return '-';
  };

  return (
    <TooltipContainer
      viewMode={isShowList}
      onClick={() => {
        if (isShowList) {
          window.open(`/analise/dispositivo/${pin.DEV_ID}/informacoes`, '_blank', 'noopener');
        }
      }}
    >
      <TooltipText viewMode={isShowList}>
        <ContentWrapper viewMode={isShowList} haveOverflow={pin.ROOM_NAME?.length > 17}>
          {!isShowList && <span className="marquee">{pin.ROOM_NAME}</span>}
          <Temperature>
            <StatusColor color={handleGetStatusColor(pin)} />
            <span>
              {handleGetPinTemperature(pin)}
              <span className="unit">°C</span>
            </span>
          </Temperature>
        </ContentWrapper>
        {!isShowList && (
          <ActionButtons>
            <EditPenIcon handleClick={() => handleEditPin(pin.DUT_ID)} />
            <TrashRoundedIcon handleClick={() => removePin(pin.DUT_ID)} />
          </ActionButtons>
        )}
      </TooltipText>
    </TooltipContainer>
  );
};

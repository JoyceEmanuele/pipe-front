import { ReactElement } from 'react';
import ReactTooltip from 'react-tooltip';
import { TemperatureIcon, WaterInlet, WaterOutlet } from 'icons';
import {
  SetpointMeasure, SetpointTitle, WaterTemperatureTooltipContainer, WaterTemperatureTooltipLabel,
} from './styles';
import { useTranslation } from 'react-i18next';

interface WaterTemperatureTooltipInfoProps {
  devId: string;
  temperatures: {
    inlet?: number;
    outlet?: number;
  };
  disabled?: boolean
}

export function WaterTemperatureTooltipInfo({
  devId,
  temperatures,
  disabled,
}: WaterTemperatureTooltipInfoProps): ReactElement {
  const { t } = useTranslation();

  return (
    <>
      <div data-tip data-for={`water-info-${devId}`}>
        <TemperatureIcon {...(disabled && { color: '#E6E1E1' })} />
      </div>
      <ReactTooltip
        id={`water-info-${devId}`}
        place="top"
        textColor="#000000"
        type="light"
        disable={disabled}
      >
        <WaterTemperatureTooltipContainer>
          <div>
            <WaterTemperatureTooltipLabel>
              {t('entradaAgua')}
            </WaterTemperatureTooltipLabel>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'start', width: '100%',
            }}
            >
              <div style={{ marginRight: '4px' }}>
                <WaterInlet />
              </div>
              <SetpointTitle>
                {temperatures.inlet ?? '-'}
              </SetpointTitle>
              <SetpointMeasure>
                ºC
              </SetpointMeasure>
            </div>
          </div>
          <div>
            <WaterTemperatureTooltipLabel>
              {t('saidaAgua')}
            </WaterTemperatureTooltipLabel>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'start', width: '100%',
            }}
            >
              <div style={{ marginRight: '4px' }}>
                <WaterOutlet />
              </div>
              <SetpointTitle>
                {temperatures.outlet ?? '-'}
              </SetpointTitle>
              <SetpointMeasure>
                ºC
              </SetpointMeasure>
            </div>
          </div>
        </WaterTemperatureTooltipContainer>
      </ReactTooltip>
    </>
  );
}

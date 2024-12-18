import { t } from 'i18next';
import { ContainerTimezoneDST } from './styles';
import moment from 'moment-timezone';
import { TimezoneDSTIcon, TimezoneIcon } from '~/icons';
import ReactTooltip from 'react-tooltip';
import { useEffect, useRef, useState } from 'react';

export const TimezoneWarn = (props: { area: string, gmt: number, unitId: number }): JSX.Element => {
  const isDST = moment().tz(props.area).isDST();
  const timezoneRef = useRef<HTMLDivElement>(null);
  const [animationState, setAnimationState] = useState<'show' | 'hide'>('hide');

  useEffect(() => {
    const tooltipElement = timezoneRef.current;
    const lastUnitId = Number(localStorage.getItem('UnTimezone'));

    if (tooltipElement && (Number(lastUnitId) !== props.unitId)) {
      setAnimationState('show');
      localStorage.setItem('UnTimezone', props.unitId.toString());
      ReactTooltip.show(tooltipElement);
      const handleAnimationEnd = (event: AnimationEvent) => {
        if (event.animationName === 'fadeIn') {
          setAnimationState('hide');
        }
      };
      tooltipElement.addEventListener('animationend', handleAnimationEnd);
      return () => {
        tooltipElement.removeEventListener('animationend', handleAnimationEnd);
      };
    }
  }, [props.unitId]);

  useEffect(() => {
    if (animationState === 'hide') {
      const tooltipElement = timezoneRef.current;
      if (tooltipElement) {
        ReactTooltip.hide(tooltipElement);
      }
    }
  }, [animationState]);

  return (
    <>
      <ReactTooltip
        id="timezone"
        place="bottom"
        effect="solid"
      >
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 5, marginBottom: 10,
          }}
        >
          { isDST ? (
            <span style={{ display: 'flex' }}>
              <TimezoneDSTIcon color="white" width="19px" height="19px" />
            </span>
          ) : <TimezoneIcon color="white" width="17px" height="17px" /> }
          <strong>
            {t('fusoHorario')}
          </strong>
        </div>
        <span>
          {isDST ? (
            <>
              <span>{t('estaUnidadeEstaEmHorarioDeVeraoOperandoNoFuso')}</span>
              <p style={{ margin: 0 }}>{t('operandoNoFusoHorarioDe')}</p>
            </>
          ) : t('estaUnidadeEstaOperandoNoFuso')}
        </span>
        <p><strong>{` ${props.area} (GMT${props.gmt})`}</strong></p>
      </ReactTooltip>
      <ContainerTimezoneDST
        ref={timezoneRef}
        data-tip
        data-for="timezone"
        className="tooltip-show"
        onAnimationEnd={() => setAnimationState('hide')}
      >
        { isDST ? <TimezoneDSTIcon /> : <TimezoneIcon /> }
      </ContainerTimezoneDST>
    </>
  );
};

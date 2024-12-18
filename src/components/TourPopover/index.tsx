import { Popover } from 'antd';
import { ReactNode } from 'react';
import { ITour, useTour } from '~/contexts/TourContext';
import { Button } from '../Button';
import {
  HighlightChildren, Overlay, Step, Stepper, TourColumn,
} from './styles';

interface ITourPopover {
  tour: ITour;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  children: ReactNode;
  onNextStepClick?: () => void;
}

export const TourPopover = ({
  tour,
  placement,
  onNextStepClick,
  children,
}: ITourPopover): JSX.Element => {
  const { totalSteps, dispatch } = useTour();

  const handleNextStep = () => {
    if (tour.step === totalSteps - 1) {
      dispatch({ type: 'FINISH_TOUR' });
    } else {
      dispatch({ type: 'CHANGE_STEP', payload: tour.step + 1 });
    }

    if (onNextStepClick) {
      onNextStepClick();
    }
  };

  const handleEndTour = () => {
    dispatch({ type: 'FINISH_TOUR' });
  };

  return (
    <>
      {tour.isActive && <Overlay />}
      <Popover
        open={tour.isActive}
        placement={placement || 'bottom'}
        content={(
          <TourColumn>
            <Stepper>
              {[...Array(totalSteps)].map((_, index) => (
                <Step
                  key={tour.step}
                  active={tour.step === index}
                  completed={tour.step > index}
                  onClick={() => {
                    dispatch({ type: 'CHANGE_STEP', payload: index });

                    if (onNextStepClick) {
                      onNextStepClick();
                    }
                  }}
                />
              ))}
            </Stepper>
            <header>
              <span>
                Etapa
                {' '}
                {tour.step + 1}
              </span>
              <h3>{tour.title}</h3>
            </header>
            {tour.description}
            <footer style={{ justifyContent: tour.step === totalSteps - 1 ? 'flex-end' : 'space-between' }}>
              {tour.step !== totalSteps - 1 && (
                <span onClick={handleEndTour}>Pular</span>
              )}
              <Button variant="primary" size="small" onClick={handleNextStep} style={{ textWrap: 'nowrap' }}>
                {tour.step === totalSteps - 1 ? 'Finalizar' : 'Próximo'}
              </Button>
            </footer>
          </TourColumn>
        )}
        overlayInnerStyle={{
          padding: '12px 8px',
          width: '302px',
          borderRadius: '8px',
        }}
      >
        <HighlightChildren hightlight={(tour.highlight && tour.isActive) ?? false}>
          {children}
        </HighlightChildren>
      </Popover>
    </>
  );
};

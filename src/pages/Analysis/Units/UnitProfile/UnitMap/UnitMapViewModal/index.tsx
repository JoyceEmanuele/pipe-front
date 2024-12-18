import { Button, Divider, ImageZoom } from '~/components';
import { UnitMapModalViewHeader, UnitMapModalViewStyled } from './styles';
import { useUnitMap } from '../UnitMapContext';
import { PinIcon } from '~/icons';
import moment from 'moment';
import i18n from '~/i18n';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

export const UnitMapViewModal: React.FC<{ handleCloseModal: () => void }> = ({
  handleCloseModal,
}) => {
  moment.locale(i18n.language === 'pt' ? 'pt-BR' : 'en');
  const { t } = useTranslation();

  const {
    pinsData, unitMapData, setIsShowListUnitMap, setIsEditingFlow, resetUnitMap, setPins, resetPins,
  } = useUnitMap();

  useEffect(() => {
    if (unitMapData && unitMapData.POINTS && unitMapData.POINTS?.length > 0) {
      const newPins = unitMapData.POINTS?.map((point) => (point));

      setPins(newPins);
    }
  }, []);

  return (
    <UnitMapModalViewStyled
      borderTop
      onClickOutside={() => {
        resetUnitMap();
        resetPins();
        handleCloseModal();
      }}
    >
      <UnitMapModalViewHeader>
        <div>
          <PinIcon />
          <div>
            <h2>{unitMapData?.NAME_GP}</h2>
            <p>
              {t('total')}
              {' '}
              {pinsData.length}
              {' '}
              {t('pontosDeMedicao')}
            </p>
          </div>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setIsShowListUnitMap(false);
            setIsEditingFlow(true);
            resetPins();
            handleCloseModal();
          }}
        >
          {t('editarMapa')}
        </Button>
      </UnitMapModalViewHeader>
      <Divider />
      {unitMapData?.IMAGE && <ImageZoom imageUrl={unitMapData.IMAGE} pins={pinsData} hasDragPin={false} onPinDrag={() => {}} />}
    </UnitMapModalViewStyled>
  );
};

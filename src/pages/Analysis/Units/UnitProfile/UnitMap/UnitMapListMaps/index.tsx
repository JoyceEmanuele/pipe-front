import { Card, Divider } from '~/components';
import {
  NewUnitMapButton,
  UnitMapListMapsContent,
  UnitMapListMapsHeader,
  UnitMapSearchInput,
  UnitMapSearchWrapper,
} from './styles';
import { UnitMapPreview } from '../UnitMapPreview';
import { useStateVar } from '~/helpers/useStateVar';
import { useEffect, useState } from 'react';
import { useUnitMap } from '../UnitMapContext';
import { UnitMapViewModal } from '../UnitMapViewModal';
import { UnitMapModal } from '../UnitMapModal';
import { ApiResps } from '~/providers';
import { PinIcon, PlusRoundedIcon } from '~/icons';
import moment from 'moment';
import i18n from '~/i18n';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

export const UnitMapListMaps: React.FC = () => {
  moment.locale(i18n.language === 'pt' ? 'pt-BR' : 'en');
  const { t } = useTranslation();

  const {
    handleListUnitMap,
    handleDeleteUnitMap,
    setUnitMap,
    setIsShowListUnitMap,
    setIsEditingFlow,
  } = useUnitMap();
  const [unitMaps, setUnitMaps] = useState<ApiResps['/unit/get-ground-plans']>(
    [],
  );
  const [openUnitMapViewModal, setOpenUnitMapViewModal] = useState(false);
  const [openUnitMapModal, setOpenUnitMapModal] = useState(false);
  const routeParams = useParams<{ unitId: string }>();

  const [stateBox, renderBox] = useStateVar({
    searchState: '',
    debounceTimer: null as null | NodeJS.Timeout,
  });

  const searchInputDebounce = () => {
    if (stateBox.debounceTimer) clearTimeout(stateBox.debounceTimer);
    stateBox.debounceTimer = setTimeout(
      () => handleGetUnitMaps(stateBox.searchState),
      300,
    );
  };

  const handleGetUnitMaps = async (params = '') => {
    const unitMaps = await handleListUnitMap(Number(routeParams.unitId), params);
    setUnitMaps(unitMaps);
  };

  useEffect(() => {
    handleGetUnitMaps();
  }, []);

  return (
    <Card noPadding>
      <UnitMapListMapsHeader>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <PinIcon />
          <h2>{t('mapaDaUnidade')}</h2>
        </div>

        <UnitMapSearchWrapper>
          <UnitMapSearchInput
            id="search"
            name="search"
            label={t('buscar')}
            placeholder={t('buscarMapas')}
            value={stateBox.searchState}
            filterStyle
            onChange={(value) => {
              stateBox.searchState = value;
              renderBox();
              searchInputDebounce();
            }}
          />
        </UnitMapSearchWrapper>
      </UnitMapListMapsHeader>
      <Divider height={1} />
      <UnitMapListMapsContent>
        <NewUnitMapButton
          onClick={() => setOpenUnitMapModal(true)}
        >
          <PlusRoundedIcon />
          <span>{t('adicionarNovoMapa')}</span>
        </NewUnitMapButton>
        {unitMaps.map((unitMap) => (
          <UnitMapPreview
            key={`unitMapPreview-${unitMap.GROUNDPLAN_ID}`}
            unitMap={unitMap}
            handleEditUnitMap={(unit) => {
              setUnitMap(unit);
              setIsShowListUnitMap(false);
              setIsEditingFlow(true);
            }}
            handleDeleteUnitMap={async (unitMapId) => {
              const unitMapsId: number[] = [];
              unitMapsId.push(unitMapId);
              await handleDeleteUnitMap(Number(routeParams.unitId), unitMapsId);
              handleGetUnitMaps();
            }}
            handleClickSeeMap={(unit) => {
              setUnitMap(unit);
              setOpenUnitMapViewModal(true);
            }}
          />
        ))}
      </UnitMapListMapsContent>
      <div>
        {openUnitMapViewModal && (
          <UnitMapViewModal
            handleCloseModal={() => {
              setOpenUnitMapViewModal(false);
            }}
          />
        )}
        {openUnitMapModal && (
          <UnitMapModal
            handleCloseModal={() => setOpenUnitMapModal(false)}
            handleConfirmModal={(data) => {
              setUnitMap(data);
              setIsShowListUnitMap(false);
            }}
          />
        )}
      </div>
    </Card>
  );
};

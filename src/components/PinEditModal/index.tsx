import { useUnitMap } from '~/pages/Analysis/Units/UnitProfile/UnitMap/UnitMapContext';
import { Button } from '../Button';
import { Label, SearchInput } from '~/pages/Overview/Default/styles';
import SelectSearch, { SelectSearchOption, fuzzySearch } from 'react-select-search';
import {
  PinEditModalContent,
  PinEditModalStyled, SearchInputWrapper, SelectOptionStyled, SelectSearchStyled, SelectedContent,
} from './styles';
import { CheckIcon, InfoIcon } from '~/icons';
import { apiCall } from '~/providers';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { DeviceResponseData, UnitMapPointsResponseData } from '~/metadata/UnitMap.model';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import i18n from '~/i18n';
import ReactTooltip from 'react-tooltip';
import { HoverExportList } from '~/pages/Analysis/Utilities/UtilityFilter/styles';

interface PinEditModalProps {
  pinId: number;
  handleCloseModal: () => void
}

export const PinEditModal: React.FC<PinEditModalProps> = ({ pinId, handleCloseModal }) => {
  moment.locale(i18n.language === 'pt' ? 'pt-BR' : 'en');
  const { t } = useTranslation();

  const { unitId } = useParams<{ unitId: string }>();
  const [devices, setDevices] = useState<(DeviceResponseData & SelectSearchOption)[]>([]);
  const [selectOptions, setSelectOptions] = useState<(DeviceResponseData & SelectSearchOption)[]>([]);
  const [switchedPin, setSwitchedPin] = useState<UnitMapPointsResponseData | undefined>();

  const {
    pinsData,
    switchPins,
  } = useUnitMap();

  const handleGetUnitDevices = async () => {
    const response = await apiCall('/unit/list-devs-unit', {
      UNIT_ID: Number(unitId),
    });

    const devicesFormatted = response.map((device) => ({
      name: device.ROOM_NAME,
      value: device.DUT_ID,
      ...device,
    }));

    setDevices(devicesFormatted);
  };

  useEffect(() => {
    handleGetUnitDevices();
  }, []);

  useEffect(() => {
    if (pinsData.length === 0 || devices.length === 0) return;

    const devicesFormatted = devices.filter(
      (a) => !pinsData.some((b) => `${a.DUT_ID}` === `${b.DUT_ID}`),
    );

    setSelectOptions(devicesFormatted);
  }, [pinsData, devices]);

  const renderOption = (propsOption, option, _snapshot) => (
    <SelectOptionStyled
      {...propsOption}
      type="button"
      selected={_snapshot.selected}
    >
      <SelectedContent>
        <p>{option.name}</p>
        <span onClick={() => window.open(`/analise/dispositivo/${option.DEV_ID}/informacoes`, '_blank', 'noopener')}>
          {option.DEV_ID}
        </span>
      </SelectedContent>
      {_snapshot.selected && (
        <CheckIcon />
      )}
    </SelectOptionStyled>
  );

  return (
    <PinEditModalStyled
      borderTop
      onClickOutside={handleCloseModal}
    >
      <h2>{t('editarDUT')}</h2>
      <PinEditModalContent>
        <SearchInputWrapper>
          <SearchInput>
            <SelectSearchStyled style={{ width: '100%', paddingTop: 3 }}>
              <Label>
                {t('adicionarDUT')}
                {' '}
                <InfoIcon width="12px" data-tip data-for="startOperation" color="#BDBDBD" style={{ marginLeft: '8px' }} />
                <ReactTooltip
                  id="startOperation"
                  place="top"
                  effect="solid"
                >

                  <HoverExportList>
                    {t('selecioneNestalista')}
                  </HoverExportList>

                </ReactTooltip>
              </Label>
              <SelectSearch
                options={selectOptions}
                closeOnSelect={false}
                printOptions="on-focus"
                search
                filterOptions={fuzzySearch}
                placeholder={t('selecionarDUT')}
                onChange={(value) => {
                  const oldPin = pinsData.find((pin) => pin.DUT_ID === pinId);

                  const dutInfo = devices.find(
                    (item) => `${item.value}` === `${value}`,
                  );

                  if (!dutInfo || !oldPin) return;

                  setSwitchedPin({
                    ...dutInfo,
                    POINT_X: oldPin?.POINT_X,
                    POINT_Y: oldPin?.POINT_Y,
                  });
                }}
                renderOption={renderOption}
              />
            </SelectSearchStyled>
          </SearchInput>
        </SearchInputWrapper>

        <Button
          style={{ width: '20%' }}
          variant="primary"
          onClick={async () => {
            if (!switchedPin) return;
            await switchPins(pinId, switchedPin);
            handleCloseModal();
          }}
        >
          {t('salvar')}
        </Button>
      </PinEditModalContent>
      <a href="" onClick={handleCloseModal}>{t('cancelar')}</a>
    </PinEditModalStyled>
  );
};

/* eslint-disable jsx-a11y/mouse-events-have-key-events */
import { Button, Divider } from '~/components';
import {
  DeleteModal,
  DeleteModalFooter,
  TooltipContainer,
  UnitMapContentImgStyled,
  UnitMapContentOverlayStyled,
  UnitMapContentStyled,
  UnitMapPreviewHeaderStyled,
  UnitMapPreviewStyled,
  TextContent,
} from './styles';
import { UnitMapApiResponseData } from '~/metadata/UnitMap.model';
import { EditPenIcon, TrashRoundedIcon, SeeEyeIcon } from '~/icons';
import moment from 'moment';
import i18n from '~/i18n';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { colors } from '~/styles/colors';
import ReactTooltip from 'react-tooltip';

interface UnitMapPreviewProps {
  unitMap: UnitMapApiResponseData;
  handleEditUnitMap: (unitMap: UnitMapApiResponseData) => void;
  handleDeleteUnitMap: (unitMapId: number) => void;
  handleClickSeeMap: (unitMap: UnitMapApiResponseData) => void;
}

export const UnitMapPreview: React.FC<UnitMapPreviewProps> = ({
  unitMap,
  handleEditUnitMap,
  handleDeleteUnitMap,
  handleClickSeeMap,
}) => {
  moment.locale(i18n.language === 'pt' ? 'pt-BR' : 'en');
  const { t } = useTranslation();

  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [isOverflowingTitle, setIsOverflowingTitle] = useState(false);

  return (
    <UnitMapPreviewStyled id={`map-wrapper-${unitMap.NAME_GP}`}>
      <UnitMapPreviewHeaderStyled>
        <h2
          id={`map-title-${unitMap.NAME_GP}`}
          onMouseOver={() => {
            const title = document.getElementById(`map-title-${unitMap.NAME_GP}`);
            const wrapper = document.getElementById(`map-wrapper-${unitMap.NAME_GP}`);

            if (!title || !wrapper) return;

            if (title.offsetWidth < title.scrollWidth) {
              setIsOverflowingTitle(true);
            }
          }}
          data-tip
          data-for={unitMap.NAME_GP}
        >
          {unitMap.NAME_GP}
        </h2>
        <div>
          <EditPenIcon handleClick={() => handleEditUnitMap(unitMap)} />
          <TrashRoundedIcon handleClick={() => setOpenDeleteModal(true)} />
        </div>
      </UnitMapPreviewHeaderStyled>
      <UnitMapContentStyled onClick={() => handleClickSeeMap(unitMap)}>
        <Divider width={90} />
        <UnitMapContentImgStyled>
          <img src={unitMap.IMAGE} alt="" />
        </UnitMapContentImgStyled>
        <UnitMapContentOverlayStyled className="overlay">
          <SeeEyeIcon />
          <span>{t('verMapa')}</span>
        </UnitMapContentOverlayStyled>
      </UnitMapContentStyled>
      {openDeleteModal && (
        <DeleteModal borderTop>
          <TrashRoundedIcon color={colors.RedDark} width={40} height={20} />
          <TextContent>
            <div className="header">
              <h2>{t('desejaDeletarMapa')}</h2>
              <span>{unitMap.NAME_GP}</span>
            </div>
            <p>
              {t('continuarDeletaMapa')}
              <span>
                {t('deletar').toLowerCase()}
              </span>
              {`. ${t('desejaProsseguir')[0].toUpperCase()}${t('desejaProsseguir').substring(1)}`}
            </p>
            <DeleteModalFooter>
              <a onClick={() => setOpenDeleteModal(false)}>Cancelar</a>

              <Button
                variant="red"
                onClick={() => handleDeleteUnitMap(unitMap.GROUNDPLAN_ID)}
              >
                {t('deletar')}
              </Button>
            </DeleteModalFooter>
          </TextContent>
        </DeleteModal>
      )}
      {isOverflowingTitle && (
        <ReactTooltip
          id={unitMap.NAME_GP}
          place="top"
          border
          textColor="#000000"
          backgroundColor="rgba(255, 255, 255, 0.97)"
          borderColor="#202370"
        >
          <TooltipContainer>
            <strong>{unitMap.NAME_GP}</strong>
          </TooltipContainer>
        </ReactTooltip>
      )}
    </UnitMapPreviewStyled>
  );
};

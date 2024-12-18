import { useState } from 'react';

import moment from 'moment';
import { FaRegTrashAlt } from 'react-icons/fa';

import { Button } from '~/components';
import { GetTechnicalVisitsListType, TVStatusValues } from '~/metadata/GetTechnicalVisitsList';
import { colors } from '~/styles/colors';

import { DeleteTVModal } from '../DeleteTVModal';
import { ShowTVModal } from '../ShowTVModal';
import { ListItemBtnsContainer, ListItemContainer, ListItemContent } from './styles';
import { SpeakWithTechnicianModal } from '../SpeakWithTechnicianModal';

type ListItemProps = {
  data: GetTechnicalVisitsListType;
  handleDeleteItem: (id: number) => void;
  handleEditItem: (id: number) => void;
  handleAccompanyItem: (id: number) => void;
  handleVisualizeItem: (id: number) => void;
  handleApproveItem: (id: number) => void;
  handleRescheduleItem: (id: number) => void;
}

export const ListItem = (props: ListItemProps): JSX.Element => {
  const {
    data,
    handleEditItem,
    handleDeleteItem,
    handleAccompanyItem,
    handleVisualizeItem,
    handleApproveItem,
    handleRescheduleItem,
  } = props;
  const [isShowTVModalVisible, setIsShowTVModalVisible] = useState(false);
  const [isDeleteTVModalVisible, setIsDeleteTVModalVisible] = useState(false);
  const [isSpeakWithTechnicianModalVisible, setIsSpeakWithTechnicianModalVisible] = useState(false);

  const ShowBtn = () => (
    <Button
      variant="secondary"
      type="button"
      onClick={() => setIsShowTVModalVisible(true)}
      style={{
        width: 70, height: 35, marginBottom: 5, borderColor: '#374BFF', color: '#374BFF', display: 'flex', alignItems: 'center', justifyContent: 'center', textTransform: 'none',
      }}
    >
      Ver
    </Button>
  );

  const EditBtn = () => (
    <Button
      variant="primary"
      type="button"
      onClick={() => handleEditItem(data.ID)}
      style={{
        width: 115, height: 35, marginLeft: 10, marginBottom: 5, backgroundColor: '#374BFF', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', textTransform: 'none',
      }}
    >
      Editar
    </Button>
  );

  const DeleteBtn = () => (
    <FaRegTrashAlt
      size={18}
      color={colors.Red}
      style={{ marginLeft: 15, cursor: 'pointer' }}
      role="button"
      onClick={() => setIsDeleteTVModalVisible(true)}
    />
  );

  const AccompanyBtn = () => (
    <Button
      variant="primary"
      type="button"
      onClick={() => handleAccompanyItem(data.ID)}
      style={{
        cursor: 'not-allowed', width: 115, height: 35, marginLeft: 10, marginBottom: 5, backgroundColor: '#374BFF', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', textTransform: 'none',
      }}
    >
      Acompanhar
    </Button>
  );

  const SpeakWithTechnicianBtn = () => (
    <Button
      variant="secondary"
      type="button"
      onClick={() => setIsSpeakWithTechnicianModalVisible(true)}
      style={{
        width: 120, padding: 5, height: 35, marginBottom: 5, borderColor: '#374BFF', color: '#374BFF', display: 'flex', alignItems: 'center', justifyContent: 'center', textTransform: 'none', marginLeft: 5,
      }}
    >
      Falar c/ Técnico
    </Button>
  );

  const VisualizeBtn = () => (
    <Button
      variant="primary"
      type="button"
      onClick={() => handleVisualizeItem(data.ID)}
      style={{
        cursor: 'not-allowed', width: 115, height: 35, marginLeft: 10, marginBottom: 5, backgroundColor: '#374BFF', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', textTransform: 'none',
      }}
    >
      Visualizar
    </Button>
  );

  const ApproveBtn = () => (
    <Button
      variant="primary"
      type="button"
      onClick={() => handleApproveItem(data.ID)}
      style={{
        width: 115, height: 35, marginLeft: 10, marginBottom: 5, backgroundColor: '#39AB1C', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', textTransform: 'none',
      }}
    >
      Aprovar
    </Button>
  );

  const RescheduleBtn = () => (
    <Button
      variant="primary"
      type="button"
      onClick={() => handleRescheduleItem(data.ID)}
      style={{
        width: 115, height: 35, marginLeft: 10, marginBottom: 5, backgroundColor: '#E8A700', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', textTransform: 'none',
      }}
    >
      Reagendar
    </Button>
  );

  const ACTION_BTNS_FOR_EACH_STATUS_MAPPER = {
    [TVStatusValues.Agendado]: (
      <>
        <ShowBtn />
        <EditBtn />
        <DeleteBtn />
      </>
    ),
    [TVStatusValues.EmAndamento]: (
      <>
        <AccompanyBtn />
        <SpeakWithTechnicianBtn />
      </>
    ),
    [TVStatusValues.AguardandoAprovacao]: (
      <>
        <VisualizeBtn />
        <ApproveBtn />
        <RescheduleBtn />
      </>
    ),
    [TVStatusValues.Finalizado]: (
      <>
        <VisualizeBtn />
      </>
    ),

  };

  return (
    <ListItemContainer>
      <ListItemContent isDurationVisible={data.STATUS_ID !== TVStatusValues.Agendado}>
        <span>{data.ID}</span>
        <span>{moment(data.VTDATE).format('DD-MM-YYYY')}</span>
        <span>{data.VTTIME}</span>
        <span>{data.UNIT_NAME}</span>
        <span>
          {`${data.TECNICO_NOME} ${data.TECNICO_SOBRENOME}`}
        </span>
        <span style={{ maxWidth: 120 }}>{data.STATUS}</span>
        {
          data.STATUS_ID !== TVStatusValues.Agendado && (
            <span>3:38h</span>
          )
        }
        <ListItemBtnsContainer>
          {ACTION_BTNS_FOR_EACH_STATUS_MAPPER[data.STATUS_ID]}
        </ListItemBtnsContainer>
      </ListItemContent>
      <ShowTVModal visible={isShowTVModalVisible} setVisible={setIsShowTVModalVisible} technicalVisitId={data.ID} />
      <DeleteTVModal visible={isDeleteTVModalVisible} setVisible={setIsDeleteTVModalVisible} data={data} handleTechnicalVisitDelete={handleDeleteItem} />
      <SpeakWithTechnicianModal technicalVisitId={data.ID} visible={isSpeakWithTechnicianModalVisible} setVisible={setIsSpeakWithTechnicianModalVisible} data={data} />
    </ListItemContainer>
  );
};

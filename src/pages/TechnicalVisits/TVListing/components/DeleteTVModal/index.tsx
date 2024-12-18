import { Modal } from 'antd';

import { Button } from '~/components';
import { GetTechnicalVisitsListType } from '~/metadata/GetTechnicalVisitsList';
import { colors } from '~/styles/colors';

import {
  Column, Row, ColumnTitle, Value,
} from './styles';

type DeleteTVModalProps = {
  visible: boolean,
  setVisible: (value: boolean) => void;
  data: GetTechnicalVisitsListType;
  handleTechnicalVisitDelete: (id: number) => void;
}

export const DeleteTVModal = (props: DeleteTVModalProps): JSX.Element => {
  const {
    visible, setVisible, data, handleTechnicalVisitDelete,
  } = props;

  return (
    <Modal
      title="Deletar VT"
      centered
      width={345}
      visible={visible}
      onOk={() => setVisible(false)}
      onCancel={() => setVisible(false)}
      bodyStyle={{
        borderTop: '5px solid white',
      }}
      footer={null}
    >
      <Row style={{ marginBottom: 50, alignItems: 'flex-start' }}>
        <Column style={{ alignItems: 'flex-start' }}>
          <ColumnTitle>ID VT</ColumnTitle>
          <Value>{data.ID}</Value>
        </Column>
        <Column style={{ alignItems: 'flex-start' }}>
          <ColumnTitle>Unidade</ColumnTitle>
          <Value style={{ maxWidth: 120 }}>{data.UNIT_NAME}</Value>
        </Column>
        <Column style={{ alignItems: 'flex-start' }}>
          <ColumnTitle>Técnico</ColumnTitle>
          <Value style={{ maxWidth: 60 }}>{`${data.TECNICO_NOME} ${data.TECNICO_SOBRENOME}`}</Value>
        </Column>
      </Row>
      <Row style={{ justifyContent: 'space-around', marginBottom: 30 }}>
        <Column>
          <Button
            variant="primary"
            type="button"
            onClick={() => {
              setVisible(false);
              handleTechnicalVisitDelete(data.ID);
            }}
            style={{
              width: 140, height: 35, backgroundColor: colors.Pink200, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', textTransform: 'none',
            }}
          >
            Deletar
          </Button>
          <b
            role="button"
            onClick={() => setVisible(false)}
            style={{
              color: '#374BFF', borderBottom: '1px solid #374BFF', cursor: 'pointer', marginTop: 18,
            }}
            tabIndex={0}
          >
            Cancelar
          </b>
        </Column>
      </Row>
    </Modal>
  );
};

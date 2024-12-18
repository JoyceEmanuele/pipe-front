import { Modal } from 'antd';

import { Button } from '~/components';
import { GetTechnicalVisitsListType } from '~/metadata/GetTechnicalVisitsList';

import {
  Column, Row, ColumnTitle, Value,
} from './styles';

type ApproveTVModalProps = {
  visible: boolean,
  setVisible: (value: boolean) => void;
  data: GetTechnicalVisitsListType;
}

export const ApproveTVModal = (props: ApproveTVModalProps): JSX.Element => {
  const { visible, setVisible, data } = props;

  return (
    <Modal
      title="Aprovar VT"
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
          <Value style={{ maxWidth: 120 }}>D099 - DA-SUMARÉ SÃO PAULO</Value>
        </Column>
        <Column style={{ alignItems: 'flex-start' }}>
          <ColumnTitle>Técnico</ColumnTitle>
          <Value style={{ maxWidth: 60 }}>João Almeida</Value>
        </Column>
      </Row>
      <Row style={{ justifyContent: 'space-around', marginBottom: 30 }}>
        <Column>
          <Button
            variant="primary"
            type="button"
            onClick={() => {}}
            style={{
              width: 140, height: 35, backgroundColor: '#39AB1C', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', textTransform: 'none',
            }}
          >
            Aprovar
          </Button>
          <b
            role="button"
            style={{
              color: '#374BFF', borderBottom: '1px solid #374BFF', cursor: 'pointer', marginTop: 18,
            }}
          >
            Cancelar
          </b>
        </Column>
      </Row>
    </Modal>
  );
};

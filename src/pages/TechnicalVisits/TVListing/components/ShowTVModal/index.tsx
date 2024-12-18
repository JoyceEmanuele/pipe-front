import { useEffect, useState } from 'react';

import { Modal } from 'antd';

import { Button } from '~/components';
import { GetTechnicalVisitInfoResponse } from '~/metadata/GetTechnicalVisitInfo';
import { apiCall } from '~/providers';
import { colors } from '~/styles/colors';

import { PhotoBox } from './components/PhotoBox';
import {
  Column, Row, ColumnTitle, Value, Title,
} from './styles';

type ShowTVModalProps = {
  visible: boolean,
  setVisible: (value: boolean) => void;
  technicalVisitId: number;
}

export const ShowTVModal = (props: ShowTVModalProps): JSX.Element => {
  const { visible, setVisible, technicalVisitId } = props;
  const [data, setData] = useState<GetTechnicalVisitInfoResponse>();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const response = await apiCall('/vt/get-vt-info', { ID: technicalVisitId });
    setData(response);
  };

  return (
    <Modal
      title="VT"
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
      <Row style={{ marginBottom: 30, alignItems: 'flex-start', justifyContent: 'flex-start' }}>
        <Column style={{ alignItems: 'flex-start', width: '33%' }}>
          <ColumnTitle>Data da VT</ColumnTitle>
          <Value>{data?.VTDATE}</Value>
        </Column>
        <Column style={{ alignItems: 'flex-start', width: '33%' }}>
          <ColumnTitle>Hora</ColumnTitle>
          <Value>{data?.VTTIME}</Value>
        </Column>
        <Column style={{ alignItems: 'flex-start', width: '33%' }}>
          <ColumnTitle>Cidade</ColumnTitle>
          <Value>{data?.CITY_NAME}</Value>
        </Column>
      </Row>
      <Row style={{ justifyContent: 'space-around', marginBottom: 30 }}>
        <Column>
          <ColumnTitle style={{ marginBottom: 10 }}>Planta Baixa</ColumnTitle>
          <PhotoBox pictureUri={data?.PLANTABAIXA_IMG} />
        </Column>
        <Column>
          <ColumnTitle style={{ marginBottom: 10 }}>Autorização</ColumnTitle>
          <PhotoBox pictureUri={data?.AUTORIZACAO_IMG} />
        </Column>
      </Row>
      <Row style={{ marginBottom: 30, alignItems: 'flex-start', justifyContent: 'flex-start' }}>
        <Column style={{ alignItems: 'flex-start', width: '100%' }}>
          <ColumnTitle style={{ marginBottom: 10 }}>Observações Gerais</ColumnTitle>
          <Value>{data?.OBSERVACAO || '-'}</Value>
        </Column>
      </Row>
      <Row style={{ marginBottom: 30, alignItems: 'flex-start', justifyContent: 'flex-start' }}>
        <Column style={{ alignItems: 'flex-start', width: '50%' }}>
          <ColumnTitle>VT Agendada por</ColumnTitle>
          <Value>{data?.RESPONSAVEL_NOME}</Value>
        </Column>
        <Button
          variant="secondary"
          type="button"
          onClick={() => {}}
          style={{
            width: 155, height: 35, borderRadius: 10, fontWeight: 'bold', borderColor: colors.BlueSecondary, color: colors.BlueSecondary, display: 'flex', alignItems: 'center', justifyContent: 'center', textTransform: 'none',
          }}
        >
          Ligar Diel
        </Button>
      </Row>
      <Row style={{ marginBottom: 30 }}>
        <Title>Dados Gerais</Title>
      </Row>
      <Row style={{ marginBottom: 30, alignItems: 'flex-start', justifyContent: 'flex-start' }}>
        <Column style={{ alignItems: 'flex-start', width: '33%' }}>
          <ColumnTitle>Cliente</ColumnTitle>
          <Value>{data?.CLIENT_NAME}</Value>
        </Column>
        <Column style={{ alignItems: 'flex-start', width: '33%' }}>
          <ColumnTitle>Unidade</ColumnTitle>
          <Value>{data?.UNIT_NAME}</Value>
        </Column>
        <Column />
      </Row>
      <Row style={{ marginBottom: 30, alignItems: 'flex-start', justifyContent: 'flex-start' }}>
        <Column style={{ alignItems: 'flex-start', width: '33%' }}>
          <ColumnTitle>Responsável</ColumnTitle>
          <Value>{data?.TECNICO_NOME}</Value>
        </Column>
        <Column style={{ alignItems: 'flex-start', width: '33%' }}>
          <ColumnTitle>Contato</ColumnTitle>
          <Value>{data?.TECNICO_PHONE}</Value>
        </Column>
        <Column style={{ alignItems: 'flex-start', width: '33%' }}>
          <ColumnTitle>Cidade</ColumnTitle>
          <Value>{data?.CITY_NAME}</Value>
        </Column>
      </Row>
      <Row style={{ marginBottom: 30, justifyContent: 'flex-start' }}>
        <Column style={{ alignItems: 'flex-start', width: '33%' }}>
          <ColumnTitle>Endereço</ColumnTitle>
          <Value style={{ maxWidth: 140 }}>
            {data?.CITY_NAME}
          </Value>
        </Column>
        <Column style={{ alignItems: 'flex-start', width: '33%' }}>
          <ColumnTitle>Mapa</ColumnTitle>
          <Value>Mapa Google</Value>
        </Column>
        <Column />
      </Row>
    </Modal>
  );
};

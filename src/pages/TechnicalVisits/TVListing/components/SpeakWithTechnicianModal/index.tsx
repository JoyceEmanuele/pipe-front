import { useEffect, useState } from 'react';

import { Modal } from 'antd';

import { Button } from '~/components';
import { apiCall } from '~/providers';
import { colors } from '~/styles/colors';

import {
  Column, Row, ColumnTitle, Value,
} from './styles';
import { GetUsersListType } from '~/metadata/GetUsersList';
import { GetTechnicalVisitInfoResponse } from '~/metadata/GetTechnicalVisitInfo';
import { FaRegTrashAlt, FaUser } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { GetClientsListType } from '~/metadata/GetClientsList';

type ShowTVModalProps = {
  visible: boolean,
  setVisible: (value: boolean) => void;
  technicalVisitId: number;
}

export const SpeakWithTechnicianModal = (props: ShowTVModalProps): JSX.Element => {
  const { visible, setVisible, technicalVisitId } = props;
  const [userData, setUserData] = useState<GetUsersListType>();
  const [tvData, setTvData] = useState<GetTechnicalVisitInfoResponse>();
  const [clientData, setClientData] = useState<GetClientsListType>();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const technicalVisitData = await apiCall('/vt/get-vt-info', { ID: technicalVisitId });
    const { list: [userData] } = await apiCall('/users/list-users', { USER: technicalVisitData.TECNICO_ID });
    const { list: [clientData] } = await apiCall('/clients/get-clients-list', { clientId: technicalVisitData.CLIENT_ID });
    setUserData(userData);
    setTvData(technicalVisitData);
    setClientData(clientData);
  };

  return (
    <Modal
      title="Técnico VT"
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
      <Row style={{
        marginTop: -15, marginBottom: 15, alignItems: 'flex-start', justifyContent: 'space-between',
      }}
      >
        <Value>Informações Gerais</Value>
        <div>
          <Link style={{ color: colors.Blue200, textDecoration: 'underline', textDecorationColor: colors.Blue200 }} to={`/editar-usuario/${userData?.USER}`}>Editar</Link>
          <FaRegTrashAlt
            size={14}
            color={colors.Red}
            style={{ marginLeft: 15, marginBottom: 3, cursor: 'not-allowed' }}
            role="button"
          />
        </div>
      </Row>
      <Row style={{ marginBottom: 10, alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Column style={{ alignItems: 'flex-start', width: '50%' }}>
          <Column style={{ alignItems: 'flex-start' }}>
            <ColumnTitle>Nome</ColumnTitle>
            <Value>{`${userData?.NOME} ${userData?.SOBRENOME}`}</Value>
          </Column>
          <Column style={{ alignItems: 'flex-start', marginTop: 10 }}>
            <ColumnTitle>E-mail</ColumnTitle>
            <Value>{userData?.USER}</Value>
          </Column>
          <Column style={{ alignItems: 'flex-start', marginTop: 10 }}>
            <ColumnTitle>RG</ColumnTitle>
            <Value>{userData?.RG || '-'}</Value>
          </Column>
        </Column>
        <Column style={{ alignItems: 'flex-start', width: '45%' }}>
          {
            userData?.PICTURE && userData?.PICTURE !== 'null' ? (
              <img style={{ width: 120, height: 120 }} src={userData.PICTURE} alt="Foto do Técnico" />
            ) : (
              <FaUser color={colors.Blue700} size={100} />
            )
          }
        </Column>
      </Row>
      <Row style={{ marginBottom: 10, alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Column style={{ alignItems: 'flex-start', width: '50%' }}>
          <ColumnTitle>Empresa</ColumnTitle>
          <Value>{clientData?.NAME}</Value>
        </Column>
        <Column style={{ alignItems: 'flex-start', width: '50%' }}>
          <ColumnTitle>CNPJ</ColumnTitle>
          <Value>{clientData?.CNPJ || '-'}</Value>
        </Column>
        <Column />
      </Row>
      <Row style={{ marginBottom: 10, alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Column style={{ alignItems: 'flex-start', width: '50%' }}>
          <ColumnTitle>Telefone da Empresa</ColumnTitle>
          <Value>{clientData?.PHONE || '-'}</Value>
        </Column>
        <Column style={{ alignItems: 'flex-start', width: '50%' }}>
          <ColumnTitle>Telefone p/ Contato em Campo</ColumnTitle>
          <Value>{tvData?.TECNICO_PHONE}</Value>
        </Column>
      </Row>
      <Row style={{ marginBottom: 10, alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Column style={{ alignItems: 'flex-start', width: '50%' }}>
          <ColumnTitle>Estado</ColumnTitle>
          <Value>{userData?.STATE_NAME}</Value>
        </Column>
        <Column style={{ alignItems: 'flex-start', width: '50%' }}>
          <ColumnTitle>Cidade</ColumnTitle>
          <Value>{userData?.CITY_NAME}</Value>
        </Column>
      </Row>
      <Row style={{ marginBottom: 10, justifyContent: 'flex-start' }}>
        <Column style={{ alignItems: 'flex-start', width: '100%' }}>
          <ColumnTitle>Observações Gerais</ColumnTitle>
          <Value>
            {userData?.COMMENTS || '-'}
          </Value>
        </Column>
      </Row>
      <Row style={{ marginBottom: 10, alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Button
          variant="secondary"
          type="button"
          onClick={() => {}}
          style={{
            width: 140,
            height: 35,
            borderRadius: 10,
            fontWeight: 'bold',
            borderColor: colors.BlueSecondary,
            color: colors.BlueSecondary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textTransform: 'none',
            cursor: 'not-allowed',
          }}
        >
          Falar c/ Técnico
        </Button>
        <Button
          variant="secondary"
          type="button"
          onClick={() => {}}
          style={{
            width: 140,
            height: 35,
            borderRadius: 10,
            fontWeight: 'bold',
            borderColor: colors.BlueSecondary,
            color: colors.BlueSecondary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textTransform: 'none',
            cursor: 'not-allowed',
          }}
        >
          Falar c/ Empresa
        </Button>
      </Row>
    </Modal>
  );
};

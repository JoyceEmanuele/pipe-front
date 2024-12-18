import { useEffect, useState } from 'react';

import { Radio, Image } from 'antd';
import { Helmet } from 'react-helmet';
import { useForm } from 'react-hook-form';
import { FaRegTrashAlt, FaFileUpload } from 'react-icons/fa';
import {
  useHistory, useRouteMatch,
} from 'react-router-dom';
import { toast } from 'react-toastify';
import { Flex, Box } from 'reflexbox';

import {
  Button, Loader, AntSwitch,
} from 'components';
import { Input } from 'components/NewInputs/Default';
import { AddNewClientParams } from 'metadata/AddNewClient.model';
import { EditClientParams } from 'metadata/EditClient.model';
import { ClientPanel } from 'pages/ClientPanel/ClientPanel';
import { apiCall } from 'providers';
import { colors } from 'styles/colors';

import { AdminLayout } from '../AdminLayout';
import { Form, Card, PictureBox } from './styles';
import { MaskCnpj, MaskPhone } from '~/helpers/maskInputs';
import { withTransaction } from '@elastic/apm-rum-react';
import { generateNameFormatted } from '~/helpers/titleHelper';
import { t } from 'i18next';

type ClientType = 'fabricante' | 'cliente' | 'mantenedor';

const FORM_VALIDATORS = {
  name: {
    required: 'O campo de nome é necessário',
  },
  email: {
    required: 'O campo de email é necessário',
  },
  phone: {
    required: false,
    validate: (value) => {
      if (value) {
        const regex = new RegExp(/^\([0-9]{2}\) [0-9]?[0-9]{4}-[0-9]{4}$/);
        return regex.test(value);
      } return true;
    },
  },
  cnpj: {
    required: false,
    validate: (value) => {
      if (value) {
        const regex = new RegExp(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/);
        return regex.test(value);
      } return true;
    },
  },
};

type Inputs = {
  email: string,
  name: string,
  phone: string,
  cnpj: string,
};

export const EditClient = (): JSX.Element => {
  const history = useHistory();
  const match = useRouteMatch<{ clientId: string }>();
  const fabricante = match.url.includes('fabricantes');
  const clientId = match.params.clientId != null ? Number(match.params.clientId) : null;
  const [loading, setLoading] = useState(false);
  const [picture, setPicture] = useState<string | ArrayBuffer | null>(null);
  const [clientType, setClientType] = useState<ClientType>(fabricante ? 'fabricante' : 'cliente');
  const [enabled, setEnabled] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [clientInfo, setClientInfo] = useState<{
    CLIENT_ID: number;
    NAME: string;
    EMAIL: string;
    PICTURE: string;
    ENABLED: string;
    PERMS_C: string;
    clientType:('fabricante' | 'cliente' | 'mantenedor')[];
    CNPJ: string;
    PHONE: string;
}>();

  const {
    register, setValue, handleSubmit, watch, formState: { errors },
  } = useForm<Inputs>({
    mode: 'all',
  });

  const handleFormSubmition = async ({
    email, name,
  }: Inputs) => {
    try {
      setLoading(true);

      const defaultParams = {
        NAME: name,
        EMAIL: email,
        PICTURE: (picture && String(picture)) || null,
        clientType: [clientType],
        ENABLED: enabled ? '1' : '0' as '1' | '0',
        CNPJ: cnpj,
        PHONE: phoneNumber,
      };

      if (clientId != null) {
        const params: EditClientParams['reqParams'] = {
          ...defaultParams,
          CLIENT_ID: clientId,
        };

        await apiCall('/clients/edit-client', params);
        toast.success('Alterado com sucesso');
      } else {
        const params: AddNewClientParams['reqParams'] = defaultParams;
        await apiCall('/clients/add-new-client', params);
        toast.success('Adicionado com sucesso');
      }
      history.push(fabricante ? '/painel/fabricantes' : '/painel/clientes/listagem');
    } catch (e) {
      console.log(e);
      toast.error('Houve erro');
    } finally {
      setLoading(false);
    }
  };

  const fetchServerData = async () => {
    if (clientId == null) return;
    setLoading(true);
    try {
      const reqParams = { CLIENT_ID: clientId };
      const { client } = await apiCall('/clients/get-client-info', reqParams);
      setClientInfo(client);

      let auxClientType: ClientType | null = null;
      if ((client.clientType || []).includes('cliente')) auxClientType = 'cliente';
      if ((client.clientType || []).includes('mantenedor')) auxClientType = 'mantenedor';
      if ((client.clientType || []).includes('fabricante')) auxClientType = 'fabricante';

      auxClientType && setClientType(auxClientType);
      setValue('email', client.EMAIL);
      setValue('name', client.NAME);
      setValue('cnpj', client.CNPJ);
      setValue('phone', client.PHONE);
      setPicture(client.PICTURE);
      setEnabled(client.ENABLED === '1');
    } catch (err) {
      console.log(err);
      toast.error('Houve erro');
    }
    setLoading(false);
  };

  const selectPictureFile = () => {
    const htmlNode: any = document.getElementById('file-input');
    if (htmlNode !== null) {
      htmlNode.onchange = () => {
        if (htmlNode.files.length === 1) {
          const reader = new FileReader();
          reader.addEventListener(
            'load',
            () => {
              setPicture(reader.result);
            },
            false,
          );
          reader.readAsDataURL(htmlNode.files[0]);
        }
      };
      htmlNode.click();
    }
  };

  useEffect(() => {
    fetchServerData();
  }, []);

  return (
    <>
      <Helmet>
        <title>{generateNameFormatted(clientInfo?.NAME, t('painel'))}</title>
      </Helmet>
      <AdminLayout />
      <Card>
        {loading
          ? <Loader />
          : (
            <Form onSubmit={handleSubmit(handleFormSubmition)}>
              <Flex>
                <Box width={[1, 1, 1, 280, 280]} mb={15}>
                  <Input
                    placeholder="Digite o nome"
                    isInputFilled={!!watch('name')}
                    label="Nome"
                    formLabel="name"
                    register={register}
                    validation={FORM_VALIDATORS.name}
                    error={errors.name ? errors.name.message : undefined}
                  />
                </Box>
              </Flex>
              <Flex>
                <Box width={[1, 1, 1, 280, 280]} mb={15}>
                  <Input
                    placeholder="Digite o e-mail"
                    isInputFilled={!!watch('email')}
                    label="E-mail"
                    formLabel="email"
                    type="email"
                    register={register}
                    validation={FORM_VALIDATORS.email}
                    error={errors.email ? errors.email.message : undefined}
                  />
                </Box>
              </Flex>
              <Flex>
                <Box width={[1, 1, 1, 280, 280]} mb={15}>
                  <Input
                    label="Telefone"
                    placeholder="(00) 00000-0000"
                    isInputFilled={!!watch('phone')}
                    formLabel="phone"
                    register={register}
                    validation={FORM_VALIDATORS.phone}
                    error={errors.phone ? 'Telefone inválido' : undefined}
                    handleChange={(e) => setPhoneNumber(MaskPhone(e.target.value))}
                    value={phoneNumber}
                    ref={register}
                  />
                </Box>
              </Flex>
              <Flex>
                <Box width={[1, 1, 1, 280, 280]} mb={15}>
                  <Input
                    label="CNPJ"
                    isInputFilled={!!watch('cnpj')}
                    placeholder="Digite o CNPJ"
                    formLabel="cnpj"
                    register={register}
                    validation={FORM_VALIDATORS.cnpj}
                    handleChange={(e) => setCnpj(MaskCnpj(e.target.value))}
                    value={cnpj}
                    error={errors.cnpj ? 'CNPJ Inválido' : undefined}
                  />
                </Box>
              </Flex>

              <div style={{ marginBottom: 10 }}>
                <div style={{ padding: 5, color: colors.Blue700, fontWeight: 'bold' }}>Logo:</div>
                {picture ? (
                  <PictureBox style={{ border: '1px solid #c4c4c4' }}>
                    <Image
                      width={100}
                      height={50}
                      src={String(picture)}
                    />

                    <button
                      type="button"
                      style={{
                        border: 'none', padding: 10, marginLeft: 20, cursor: 'pointer', backgroundColor: 'transparent',
                      }}
                      onClick={() => setPicture(null)}
                    >
                      <FaRegTrashAlt color="#ED193F" />
                    </button>

                  </PictureBox>
                ) : (
                  <PictureBox
                    style={{
                      border: '1px dashed #c4c4c4', cursor: 'pointer',
                    }}
                    role="button"
                    onClick={selectPictureFile}
                    tabIndex={0}
                  >

                    <span color="#555555">Selecionar imagem</span>
                    <FaFileUpload color="#555555" />
                  </PictureBox>
                )}
                <input id="file-input" type="file" name="clientLogo" style={{ display: 'none' }} accept="image/*" />
              </div>
              <div style={{ display: 'flex', paddingTop: '12px' }}>
                <Radio.Group onChange={(e) => setClientType(e.target.value)} value={clientType}>
                  <Radio value="cliente">Cliente</Radio>
                  <Radio value="mantenedor">Mantenedor</Radio>
                  <Radio value="fabricante">Fabricante</Radio>
                </Radio.Group>
              </div>
              <div style={{ padding: '20px 0px' }}>
                <AntSwitch
                  label={enabled ? 'Habilitado' : 'Desativado'}
                  checked={enabled}
                  onChange={() => setEnabled(!enabled)}
                />
              </div>
              <Button type="submit" variant="primary" style={{ marginTop: '10px' }}>
                Salvar
              </Button>
            </Form>
          )}
      </Card>
      {clientId
        && (
        <div style={{ marginTop: '30px' }}>
          <ClientPanel clientId={clientId} clientInfo={clientInfo} />
        </div>
        )}
    </>
  );
};

export default withTransaction('EditClient', 'component')(EditClient);

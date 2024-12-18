import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Radio, Space, Image } from 'antd';
import { Helmet } from 'react-helmet';
import { useForm } from 'react-hook-form';
import { FaFileUpload, FaRegTrashAlt } from 'react-icons/fa';
import { useHistory, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Flex, Box } from 'reflexbox';

import {
  Button, Loader, Breadcrumb, Checkbox,
} from '~/components';
import { Input } from '~/components/NewInputs/Default';
import { Select } from '~/components/NewSelect';
import { SelectMultiple } from '~/components/NewSelectMultiple';
import { getUserProfile } from '~/helpers/userProfile';
import { apiCall, ApiResps } from '~/providers';
import { colors } from '~/styles/colors';

import { ClientItem } from './components/ClientItem';
import { Form, PictureBox } from './styles';
import { useStateVar } from '~/helpers/useStateVar';
import { MaskCPF, MaskPhone } from '~/helpers/maskInputs';
import { withTransaction } from '@elastic/apm-rum-react';

type UserTypes = 'cliente' | 'mantenedorv2' | 'fabricante' | 'tecnico' | 'parceiro' | 'instalador';
type ProfilePerClient = ApiResps['/users/get-user-info']['profiles_v2'][number]['p'][number];
type Inputs = {
  email: string,
  name: string,
  lastname: string,
  password: string,
  cpf: string,
  phone: string,
  observations?: string,
};

type ExtraErrors = {
  clients?: string;
  clientBind?: string;
  city?: string;
}

type GetCitiesListType = ApiResps['/dac/get-cities-list']['list'][0];
type GetClientsListType = ApiResps['/clients/get-clients-list']['list'][0];

export const EditUser = (): JSX.Element => {
  const history = useHistory();
  const { userId: editedUserId } = useParams<{ userId }>();
  const [profile] = useState(getUserProfile);
  const isEdit = !!editedUserId;
  const [cpf, setCpf] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const { t } = useTranslation();

  const [state, render, setState] = useStateVar({
    isLoading: false,
    clientsList: [] as GetClientsListType[],
    clientsMant: [] as GetClientsListType[],
    cProfiles: {} as { [clientId: string]: ProfilePerClient },
    cProg: {} as { [clientId: string]: boolean },
    editedUserClients: [] as string[],

    // Extra Form Values
    cities: [] as GetCitiesListType[],
    selectedCity: null as null|GetCitiesListType,
    clients: [] as {
      CLIENT_ID: number,
      NAME: string,
      units?: null|{ UNIT_NAME: string, UNIT_ID: number, checked?: boolean }[],
    }[],
    sendEmail: true,
    clientBind: null as null|{ CLIENT_ID: number },
    userType: 'cliente' as UserTypes,
    extraErrors: {} as ExtraErrors,
    userPicture: null as string|ArrayBuffer|null,
  });

  const {
    register, setValue, handleSubmit, clearErrors, watch, formState: { errors },
  } = useForm<Inputs>({
    mode: 'all',
    defaultValues: {
      email: editedUserId,
    },
    shouldUnregister: false,
  });

  const FORM_VALIDATORS = {
    name: {
      required: `${t('O campo de nome é necessário')}`,
    },
    lastname: {
      required: `${t('O campo de sobrenome é necessário')}`,
    },
    email: {
      validate: (value) => {
        if (value) {
          // eslint-disable-next-line no-useless-escape
          const regex = new RegExp(/^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/);
          if (!regex.test(value)) {
            toast.error(t('emailInvalidoCaracteresEspeciais'));
            return false;
          }
        } return true;
      },
      required: `${t('O campo de email é necessário')}`,
    },
    password: {
      validate: (value) => {
        if ((!state.sendEmail) && (!value)) {
          return false;
        }
      },
    },
    city: {
      required: `${t('O campo de cidade é necessário')}`,
    },
    cpf: {
      required: `${t('O campo de CPF é necessário')}`,
      validate: (value) => {
        if (value) {
          // eslint-disable-next-line no-useless-escape
          const regex = new RegExp(/^\d{3}\.\d{3}\.\d{3}\-\d{2}$/);
          return regex.test(value);
        } return true;
      },
    },
    phone: {
      required: `${t('O campo de telefone é necessário')}`,
    },
  };

  useEffect(() => {
    fetchServerData();
  }, []);

  const checkClients = (auxiliarClients) => {
    if (profile.manageMultipleClients && auxiliarClients.length === 0) {
      state.extraErrors.clients = `${t('O campo de cliente é necessário')}`;
    } else {
      state.extraErrors.clients = undefined;
    }
    render();
  };

  const checkClientBind = (auxiliarClientBind) => {
    if (!auxiliarClientBind && (state.userType === 'mantenedorv2' || state.userType === 'parceiro' || state.userType === 'tecnico')) {
      state.extraErrors.clientBind = `${t('O campo de empresa é necessário')}`;
    } else {
      state.extraErrors.clientBind = undefined;
    }
    render();
  };

  const checkFieldsValidation = () => {
    const newErrors: ExtraErrors = {};
    if (state.userType === 'tecnico' && state.selectedCity === undefined) {
      newErrors.city = `${t('O campo de cidade é necessário')}`;
    } else {
      newErrors.city = undefined;
    }
    if ((state.userType === 'mantenedorv2' || state.userType === 'parceiro' || state.userType === 'tecnico') && (!state.clientBind)) {
      newErrors.clientBind = `${t('O campo de empresa é necessário')}`;
    } else {
      newErrors.clientBind = undefined;
    }
    if (state.userType === 'cliente' && profile.manageMultipleClients && state.clients.length === 0) {
      newErrors.clients = `${t('O campo de cliente é necessário')}`;
    } else {
      newErrors.clients = undefined;
    }
    setState({ extraErrors: newErrors });
  };

  const doesErrorsExist = () => Object.values(state.extraErrors).filter((item) => item !== undefined).length !== 0;

  async function formatAndSend({
    email, name, lastname, password, observations,
  }, profilePerClient) {
    const commonParams = {
      NOME: name,
      SOBRENOME: lastname,
      PASSWORD: password || undefined,
      CLIENT_BIND: ((state.userType !== 'cliente') && state.clientBind && state.clientBind.CLIENT_ID) || undefined,
      PERMS_U: state.userType || undefined,
      clients_v2: profilePerClient,
    };
    const tecnicoParams = (state.userType !== 'tecnico') ? {
      COMMENTS: observations,
      PHONENB: phoneNumber,
      RG: cpf,
      PICTURE: (state.userPicture && String(state.userPicture)) || null,
      CITY_ID: state.selectedCity?.id,
    } : {};

    if (editedUserId) {
      await apiCall('/users/edit-user', {
        USER: email,
        ...commonParams,
        ...tecnicoParams,
      });
      toast.success(t('Usuário editado com sucesso!'));
    } else {
      await apiCall('/users/invite-new-user', {
        EMAIL: email,
        ...commonParams,
        ...tecnicoParams,
      });
      toast.success(t('Usuário cadastrado com sucesso!'));
    }
  }

  function verifyClientAdminProg(clientIdStr: string, prog: boolean) {
    if (state.userType === 'cliente' && prog === true) {
      return '[CP]';
    }
    return state.cProfiles[clientIdStr];
  }

  function verifyProfileInstalador(clientIdStr) {
    if (state.userType === 'instalador') {
      return '[I]';
    }
    return verifyClientAdminProg(clientIdStr, state.cProg[clientIdStr]);
  }

  function verifyPermissionProg(profiles_v2: {
    clientId: number;
    p: ProfilePerClient[];
    units: number[] | null;
  }[]) {
    for (const { clientId, p } of profiles_v2) {
      if (!p) continue;
      else if (p.includes('[CP]')) { state.cProg[String(clientId)] = true; }
      else if (!p.includes('[CP]')) { state.cProg[String(clientId)] = false; }
      else continue;
    }
  }

  function verifyProfileClientNull(profilePerClient) {
    for (const clientIdStr of state.editedUserClients) {
      const clientId = Number(clientIdStr);
      if (!profilePerClient.some((x) => x.clientId === clientId)) {
        profilePerClient.push({ clientId, p: null });
      }
    }
  }

  const verifiedSomeUnitSelected = (unitsSelected) => (unitsSelected && (unitsSelected.length > 0));

  const profileAddPermis = () => {
    const profilePerClient = [] as { clientId: number, p: ProfilePerClient[]|null, units?: number[] }[];
    if (state.userType === 'tecnico') {
      profilePerClient.push({ clientId: state.clientBind!.CLIENT_ID, p: ['[T]'] });
    } else {
      for (const client of state.clients) {
        if (!client.units) continue; // Não altera se não tiver conseguido buscar a lista de unidades
        const clientId = client.CLIENT_ID;
        const clientIdStr = String(clientId);
        const unitsSelected = client.units
          .filter((x) => x.checked)
          .map((x) => x.UNIT_ID);
        const someUnitSelected = verifiedSomeUnitSelected(unitsSelected);
        const allUnitsSelected = unitsSelected && (unitsSelected.length === client.units.length);
        profilePerClient.push({
          clientId,
          p: verifyProfileInstalador(clientIdStr) === '[CP]' ? ['[C]', '[CP]'] : [verifyProfileInstalador(clientIdStr)],
          units: (someUnitSelected && !allUnitsSelected) ? unitsSelected : undefined,
        });
      }
      verifyProfileClientNull(profilePerClient);
    }
    return profilePerClient;
  };

  const handleFormSubmition = async ({
    email, name, lastname, password, observations,
  }: Inputs) => {
    try {
      if (doesErrorsExist()) return;

      setState({ isLoading: true });

      const profilePerClient = profileAddPermis();

      formatAndSend({
        email,
        name,
        lastname,
        password,
        observations,
      }, profilePerClient);
      history.goBack();
    } catch (err) {
      toast.error('Não possível registrar o usuário.');
    } finally {
      setState({ isLoading: false });
    }
  };

  async function fillUnitsLists(clients: typeof state.clients) {
    try {
      const promises = clients.map(async (selectedClient) => {
        if (selectedClient.units !== undefined) return;
        selectedClient.units = null;
        const { list: units } = await apiCall('/clients/get-units-list-basic', { CLIENT_ID: selectedClient.CLIENT_ID });
        selectedClient.units = units;
        for (const unit of selectedClient.units) {
          unit.checked = true;
        }
      });
      await Promise.all(promises);
    } catch (err) {
      console.log(err);
      toast.error(t('ErroUnidades'));
    }
  }

  function verifyPermission(profiles_v2: {
    clientId: number;
    p: ProfilePerClient[];
    units: number[] | null;
  }[]) {
    for (const { clientId, p } of profiles_v2) {
      if (!p) continue;
      if (p.includes('[C]')) { state.cProfiles[String(clientId)] = '[C]'; }
      else if (p.includes('[U]')) { state.cProfiles[String(clientId)] = '[U]'; }
      else if (p.includes('[M]')) { state.cProfiles[String(clientId)] = '[M]'; state.userType = 'parceiro'; }
      else if (p.includes('[T]')) { state.cProfiles[String(clientId)] = '[T]'; state.userType = 'tecnico'; }
      else if (p.includes('[I]')) { state.cProfiles[String(clientId)] = '[I]'; state.userType = 'instalador'; }
      else if (p.includes('[MN]')) { state.cProfiles[String(clientId)] = '[MN]'; state.userType = 'mantenedorv2'; }
      else continue;
    }
  }

  function verifyPermissionState(profiles_v2: {
    clientId: number;
    p: ProfilePerClient[];
    units: number[] | null;
  }[]) {
    for (const client of state.clients) {
      if (!client.units) continue;
      const perms = profiles_v2.find((x) => x.clientId === client.CLIENT_ID);
      const selectedUnits = perms?.units;
      for (const unit of client.units) {
        unit.checked = (!selectedUnits) || selectedUnits.includes(unit.UNIT_ID);
      }
    }
  }

  async function fetchServerData() {
    try {
      // withManagerPermission é para pegar a lista só dos clientes para quem eu posso adicionar usuários
      const { list } = await apiCall('/clients/get-clients-list', { withManagerPermission: true });
      state.clientsList = list;
      state.clientsMant = list.filter((x) => x.PERMS_C && x.PERMS_C.includes('[M]'));
      state.cProfiles = {};

      if (list.length === 1 && !editedUserId) {
        state.clients = list;
        state.cProfiles[String(list[0].CLIENT_ID)] = '[U]';
      }

      const { list: citiesList } = await apiCall('/dac/get-cities-list', {});
      state.cities = citiesList;

      if (editedUserId) {
        const { item: userInfo, permissions, profiles_v2 } = await apiCall('/users/get-user-info', { userId: editedUserId });
        setValue('email', userInfo.EMAIL);
        setValue('name', userInfo.NOME);
        setValue('lastname', userInfo.SOBRENOME);
        state.userType = 'cliente';
        verifyPermission(profiles_v2);
        verifyPermissionProg(profiles_v2);
        state.editedUserClients = Object.keys(state.cProfiles);
        state.clients = state.clientsList.filter((x) => (state.cProfiles[String(x.CLIENT_ID)] != null));
        state.clientBind = (userInfo.CLBIND_ID && state.clientsMant.find((x) => x.CLIENT_ID === userInfo.CLBIND_ID)) || null;
        await fillUnitsLists(state.clients);
        verifyPermissionState(profiles_v2);
      }
    } catch (err) {
      console.log(err);
      toast.error(t('erro'));
    }
    render();
  }

  function verifyNewUserType(newCProfiles:{
    [clientId: string]: ProfilePerClient;
  }, clientId: string, value: ProfilePerClient, sigla: '[M]' | '[MN]' | '[T]' | '[I]' | '[U]' | '[C]' | '[CP]') {
    if (![sigla].includes(value)) newCProfiles[clientId] = sigla;
  }

  function checkProfiles(newUserType: typeof state.userType) {
    const newCProfiles: { [clientId: string]: ProfilePerClient } = {};
    for (const clientId of Object.keys(state.cProfiles)) {
      const value = state.cProfiles[clientId];
      if (newUserType === 'parceiro') {
        verifyNewUserType(newCProfiles, clientId, value, '[M]');
      } else if (newUserType === 'mantenedorv2') {
        verifyNewUserType(newCProfiles, clientId, value, '[MN]');
      } else if (newUserType === 'tecnico') {
        verifyNewUserType(newCProfiles, clientId, value, '[T]');
      } else if (newUserType === 'instalador') {
        verifyNewUserType(newCProfiles, clientId, value, '[I]');
      } else {
        for (const clientId of Object.keys(state.cProfiles)) {
          if (!['[U]', '[C]'].includes(value)) newCProfiles[clientId] = '[U]';
        }
      }
    }
    state.cProfiles = newCProfiles;
    render();
  }

  function checkClientProfile(clientId) {
    let permission: ProfilePerClient;

    switch (state.userType) {
      case 'cliente':
        permission = '[U]';
        break;
      case 'parceiro':
        permission = '[M]';
        break;
      case 'mantenedorv2':
        permission = '[MN]';
        break;
      case 'tecnico':
        permission = '[T]';
        break;
      case 'instalador':
        permission = '[I]';
        break;
      default:
        permission = '[M]';
        break;
    }

    state.cProfiles[String(clientId)] = permission;
  }

  const handleUserTypeChange = (event) => {
    const newUserType = event.target.value;
    if (state.userType === 'tecnico') {
      state.extraErrors.city = undefined;
      clearErrors('cpf');
      clearErrors('phone');
    }
    if (newUserType === 'cliente') {
      state.userType = newUserType;
      state.clientBind = null;
      checkProfiles(newUserType);
    } else if (newUserType === 'mantenedorv2' || newUserType === 'parceiro') {
      state.userType = newUserType;
      checkProfiles(newUserType);
    } else if (newUserType === 'tecnico' || newUserType === 'instalador') {
      state.userType = newUserType;
      state.cProfiles = {};
      state.clients = [];
    }
    render();
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
              setState({ userPicture: reader.result });
            },
            false,
          );
          reader.readAsDataURL(htmlNode.files[0]);
        }
      };
      htmlNode.click();
    }
  };

  return (
    <>
      <Helmet>
        <title>Diel Energia - Convidar usuário</title>
      </Helmet>

      <Form onSubmit={(e) => {
        e.preventDefault();
        checkFieldsValidation();
        handleSubmit(handleFormSubmition, checkFieldsValidation)();
      }}
      >
        <Flex mb="35px" mt="0">
          <Box>
            <Breadcrumb />
          </Box>
        </Flex>
        <div>
          <Flex>
            <Box width={[1, 1, 1, 280, 280]} mb={18}>
              <Input
                disabled={editedUserId}
                placeholder={`${t('Digite o e-mail do usuário')}`}
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
            <Box width={[1, 1, 1, 280, 280]} mb={18}>
              <Input
                placeholder={`${t('Digite o nome do usuário')}`}
                isInputFilled={!!watch('name')}
                label={`${t('Nome')}`}
                formLabel="name"
                register={register}
                validation={FORM_VALIDATORS.name}
                error={errors.name ? errors.name.message : undefined}
              />
            </Box>
          </Flex>
          <Flex>
            <Box width={[1, 1, 1, 280, 280]} mb={18}>
              <Input
                placeholder={`${t('Digite o sobrenome do usuário')}`}
                isInputFilled={!!watch('lastname')}
                label={`${t('sobrenome')}`}
                formLabel="lastname"
                register={register}
                validation={FORM_VALIDATORS.lastname}
                error={errors.lastname ? errors.lastname.message : undefined}
              />
            </Box>
          </Flex>
          {state.userType === 'tecnico' && (
            <>
              <Flex>
                <Box width={[1, 1, 1, 280, 280]} mb={18}>
                  <Select
                    options={state.cities}
                    propLabel="name"
                    value={state.selectedCity}
                    label={`${t('Cidade')}`}
                    placeholder="Selecione a cidade"
                    error={state.extraErrors.city}
                    onSelect={(item: GetCitiesListType) => {
                      setState({ selectedCity: item });
                    }}
                    notNull
                  />
                </Box>
              </Flex>
              <Flex>
                <Box width={[1, 1, 1, 280, 280]} mb={18}>
                  <Input
                    label={`${t('Cadastro de Pessoa Física (CPF)')}`}
                    placeholder={`${t('Digite o CPF do usuário')}`}
                    isInputFilled={!!watch('cpf')}
                    formLabel="cpf"
                    register={register}
                    validation={FORM_VALIDATORS.cpf}
                    handleChange={(e) => setCpf(MaskCPF(e.target.value))}
                    value={cpf}
                    error={errors.cpf ? 'CPF inválido!' : undefined}
                  />
                </Box>
              </Flex>
              <Flex>
                <Box width={[1, 1, 1, 280, 280]} mb={18}>
                  <Input
                    label={`${t('telefone')}`}
                    placeholder={`${t('Digite o telefone do usuário')}`}
                    isInputFilled={!!watch('phone')}
                    formLabel="phone"
                    register={register}
                    validation={FORM_VALIDATORS.phone}
                    handleChange={(e) => setPhoneNumber(MaskPhone(e.target.value))}
                    value={phoneNumber}
                    error={errors.phone ? errors.phone.message : undefined}
                  />
                </Box>
              </Flex>
              <Flex>
                <Box width={[1, 1, 1, 280, 280]} mb={18}>
                  <Input
                    label={`${t('Observações')}`}
                    placeholder="Digite observações sobre o usuário"
                    isInputFilled={!!watch('observations')}
                    formLabel="observations"
                    register={register}
                    validation={undefined}
                  />
                </Box>
              </Flex>

              <div style={{ marginBottom: 10 }}>
                <div style={{ padding: 5, color: colors.Blue700, fontWeight: 'bold' }}>Foto de Perfil:</div>
                {state.userPicture ? (
                  <PictureBox style={{ border: '1px solid #c4c4c4' }}>

                    <Image
                      width={100}
                      height={50}
                      src={String(state.userPicture)}
                    />

                    <button
                      type="button"
                      style={{
                        border: 'none', padding: 10, marginLeft: 20, cursor: 'pointer', backgroundColor: 'transparent',
                      }}
                      onClick={() => setState({ userPicture: null })}
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
            </>
          )}
          <Flex>
            <Box width={[1, 1, 1, 280, 280]} mb={24}>
              {(profile.permissions.isAdminSistema && (!editedUserId)) && (
                <Checkbox checked={state.sendEmail} label="Enviar email" onClick={() => setState({ sendEmail: !state.sendEmail })} style={{ margin: '15px 0px' }} />
              )}
              {((!state.sendEmail) || editedUserId) && (
                <Input
                  placeholder={`${t('digiteSenha')}`}
                  isInputFilled={!!watch('password')}
                  label={`${t('senha')}`}
                  formLabel="password"
                  type="password"
                  register={register}
                  validation={FORM_VALIDATORS.password}
                  error={errors.password ? 'O campo de senha é necessário' : undefined}
                />
              )}
            </Box>
          </Flex>

          {profile.permissions.isAdminSistema && (
            <div style={{ marginBottom: '15px', padding: '0 10px 10px 10px' }}>
              <span>Tipo de usuário:</span>
              <Flex pt="15px" pb="8px" direction="column">
                <Radio.Group onChange={handleUserTypeChange} value={state.userType} disabled={editedUserId}>
                  <Space direction="vertical">
                    <Radio value="cliente">{t('cliente')}</Radio>
                    <Radio value="parceiro">{t('parceiro')}</Radio>
                    <Radio value="mantenedorv2">{t('mantenedor')}</Radio>
                    <Radio value="tecnico">{t('Técnico')}</Radio>
                    <Radio value="instalador">{t('Instalador')}</Radio>
                  </Space>
                </Radio.Group>
              </Flex>
            </div>
          )}

          {(profile.permissions.isAdminSistema && (state.userType === 'mantenedorv2' || state.userType === 'parceiro' || state.userType === 'tecnico'))
            && (
              <Flex>
                <Box width={[1, 1, 1, 280, 280]} mb={18}>
                  <Select
                    label="Empresa"
                    placeholder={`${t('selecioneEmpresa')}`}
                    options={state.clientsMant}
                    propLabel="NAME"
                    value={state.clientBind}
                    error={state.extraErrors.clientBind}
                    onSelect={(item) => {
                      setState({ clientBind: item });
                      checkClientBind(item);
                    }}
                    notNull
                  />
                </Box>
              </Flex>
            )}
          {(state.userType !== 'tecnico') && (
            <Flex>
              <Box width={[1, 1, 1, 280, 280]} mb={18}>
                {((state.clientsList.length > 1) || (state.clients.length !== 1)) && (
                  <SelectMultiple
                    options={state.clientsList}
                    propLabel="NAME"
                    values={state.clients}
                    error={state.extraErrors.clients}
                    label={`${t('cliente')}`}
                    placeholder={`${t('selecioneClientes')}`}
                    onSelect={(item, list, newValues) => {
                      setState({ clients: newValues });
                      checkClients(newValues);
                      if (state.cProfiles[String(item.CLIENT_ID)] === undefined) {
                        checkClientProfile(item.CLIENT_ID);
                      }
                      fillUnitsLists(state.clients).catch(console.log).then(() => { render(); });
                    }}
                  />
                )}
              </Box>
            </Flex>
          )}

          {(state.userType !== 'tecnico') && (state.clients.length > 0) && state.clients.map((client) => (
            <ClientItem
              key={client.CLIENT_ID}
              client={client}
              userType={state.userType}
              handleClientTypeChange={(event, clientId) => { state.cProfiles[clientId] = event.target.value; render(); }}
              checkClients={checkClients}
              setClients={(clients) => { setState({ clients }); }}
              cProfiles={state.cProfiles}
              cProg={state.cProg}
              clients={state.clients}
              unitsList={client.units || null}
              onChangeUnitsSelection={() => { render(); }}
            />
          ))}
          <Flex>
            <Box width={[1, 1, 1, 280, 280]} mb={32}>
              {state.isLoading ? (
                <Button variant="primary" type="button">
                  <Loader variant="secondary" size="small" />
                </Button>
              ) : (
                <Button variant="primary" type="submit">
                  {(isEdit || !state.sendEmail) ? `${t('botaoSalvar')}` : `${t('botaoEnviarConvite')}`}
                </Button>
              )}
            </Box>
          </Flex>
        </div>
      </Form>
    </>
  );
};

export default withTransaction('EditUser', 'component')(EditUser);

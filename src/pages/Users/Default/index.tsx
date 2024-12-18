import {
  useState, useEffect, useMemo, useRef,
} from 'react';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import { Helmet } from 'react-helmet';
import { Link, useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Flex, Box } from 'reflexbox';
import 'moment/locale/pt-br';
import 'moment/locale/en-ca';
import {
  Button, Table, Loader, Card, Breadcrumb, InputSearch, ActionButton, ModalWindow,
} from '~/components';
import { getUserProfile } from '~/helpers/userProfile';
import { useStateVar } from '~/helpers/useStateVar';
import {
  DeactivateUserIcon, EditIcon, ReactivateUserIcon,
} from '~/icons';
import { ApiResps, apiCall } from '~/providers';
import { colors } from '~/styles/colors';

import {
  Desktop,
  Mobile,
  DataCard,
  DataItem,
  StyledSpan,
  CancelButton,
} from './styles';
import { SelectMultiple } from '~/components/NewSelectMultiple';
import { withTransaction } from '@elastic/apm-rum-react';
import { Headers2 } from '~/pages/Analysis/Header';
import queryString from 'query-string';

// Adicionar checkboxes de usuários se o usuário for admin do cliente (ou do sistema)
// TODO: FIXME: Editar usuário está mostrando "Enviar convite" e não mostra os clientes atuais
// TODO: Permitir adicionar admins como usuários de clientes

interface UserRow {
  FULLNAME: string
  NOME: string
  SOBRENOME: string
  EMAIL: string
  PERFIL_DESC: string
  LAST_ACCESS: string
  CLIENT_NAME: string
  clientIds: number[]
  clientNames: string[]
  isActive: string
}

function textFilter(item: UserRow, text: string) {
  if (!text) return true;
  text = text.toLowerCase();
  if (item.FULLNAME && item.FULLNAME.toLowerCase().includes(text)) return true;
  if (item.EMAIL && item.EMAIL.toLowerCase().includes(text)) return true;
  if (item.PERFIL_DESC && item.PERFIL_DESC.toLowerCase().includes(text)) return true;
  if (item.clientNames && item.clientNames.some((CLIENT_NAME) => (CLIENT_NAME && CLIENT_NAME.toLowerCase().includes(text)))) return true;
  if (item.CLIENT_NAME && item.CLIENT_NAME.toLowerCase().includes(text)) return true;

  return false;
}

type GetClientsListType = ApiResps['/clients/get-clients-list']['list'][0];

export const Users = (): JSX.Element => {
  const { t } = useTranslation();
  const history = useHistory();
  const [profile] = useState(getUserProfile);
  const indicadorLinguagem = t('Úsuario');

  function isActiveColor(props: string) {
    if (props === '1') {
      return colors.Grey400;
    }
    return '#B2B2B2';
  }

  const [state, render, setState] = useStateVar(() => {
    moment.locale(indicadorLinguagem === 'User' ? 'en-ca' : 'pt-br');

    const visibleCols = {
      client: profile.viewMultipleClients,
      editRemove: profile.manageSomeClient,
    };
    const columns = [
      {
        id: 'name',
        Header: `${t('Nome')}`,
        accessor: 'name',
        Cell: (props) => <StyledSpan style={{ color: isActiveColor(props.row.original.isActive) }}>{props.row.original.FULLNAME}</StyledSpan>,
      },
      {
        id: 'email',
        Header: `${t('email')}`,
        accessor: 'email',
        Cell: (props) => <StyledSpan style={{ color: isActiveColor(props.row.original.isActive) }}>{props.row.original.EMAIL}</StyledSpan>,
      },
      {
        id: 'perfil',
        Header: `${t('perfil')}`,
        accessor: 'perfil',
        Cell: (props) => <StyledSpan style={{ color: isActiveColor(props.row.original.isActive) }}>{props.row.original.PERFIL_DESC}</StyledSpan>,
      },
      {
        id: 'lastLogin',
        Header: `${t('Último acesso')}`,
        accessor: 'lastLogin',
        Cell: (props) => (
          <StyledSpan style={{ color: isActiveColor(props.row.original.isActive) }}>
            {props.row.original.LAST_ACCESS}
          </StyledSpan>
        ),
      },
    ]
      .concat(visibleCols.client ? [
        {
          id: 'client',
          Header: `${t('cliente')}`,
          accessor: 'client',
          Cell: (props) => <StyledSpan style={{ color: isActiveColor(props.row.original.isActive) }}>{props.row.original.CLIENT_NAME}</StyledSpan>,
        },
      ] : [])
      .concat(visibleCols.editRemove ? [
        {
          id: 'actions',
          Header: '',
          accessor: 'actions',
          Cell: (props) => (
            <>
              {props.row.original.isActive === '1' ? (

                <ActionButton onClick={() => { modalOpen(props.row.original, 'deactivate'); }} variant="red-inv"><DeactivateUserIcon /></ActionButton>

              ) : (
                <ActionButton onClick={() => { modalOpen(props.row.original, 'reactivate'); }} variant="red-inv"><ReactivateUserIcon /></ActionButton>

              )}

              <ActionButton onClick={() => history.push(`/editar-usuario/${encodeURIComponent(props.row.original.EMAIL).replace('%40', '@').replace('%26', '&')}`)} variant="blue-inv"><EditIcon color={colors.LightBlue} /></ActionButton>
            </>
          ),
        },
      ] : []);

    const state = {
      isLoading: false,
      data: [] as UserRow[],
      searchText: '',
      columns,
      modalType: '',
      userSelected: {} as UserRow,
      isButtonDisabled: true,
      clientsList: [] as GetClientsListType[],
      clients: [] as GetClientsListType[],
      filter: '',
    };
    return state;
  });

  async function deactivateUser(rowData: UserRow) {
    const { profiles_v2: clientsUser } = await apiCall('/users/get-user-info', { userId: rowData.EMAIL });

    if (!profile.permissions.isAdminSistema && state.userSelected.clientIds && clientsUser.length > state.userSelected.clientIds.length) {
      toast.error(t('usuarioAssociadoAOutros'));
    }
    else {
      apiCall('/users/remove-user', {
        USER: rowData.EMAIL,
        clientIds: rowData.clientIds || undefined,
      }).then((data) => ({ data }))
        .then(() => {
          window.location.reload();
        })
        .catch((err) => { console.log(err); toast.error(t('Houve erro')); });
    }
  }

  async function reactivateUser(rowData: UserRow) {
    const clientsIds = [] as number[];
    state.clients.forEach((client) => {
      clientsIds.push(client.CLIENT_ID);
    });

    if (state.userSelected.PERFIL_DESC !== 'Admin Sistema' && clientsIds.length === 0) {
      toast.error(t('selecioneOsClientes'));
    }
    else {
      apiCall('/users/reactivate-user', {
        USER: rowData.EMAIL,
        clientIds: clientsIds,
      }).then((data) => ({ data }))
        .then(() => {
          window.location.reload();
        })
        .catch((err) => { console.log(err); toast.error(t('Houve erro')); });
    }
  }

  function modalOpen(rowData: UserRow, type: string) {
    state.modalType = type;
    state.userSelected = rowData;
    render();
  }

  function modalClose() {
    state.modalType = '';
    state.userSelected = {} as UserRow;
    state.clients = [];
    render();
  }

  async function handlerGetUsers() {
    try {
      setState({ isLoading: true });
      const { list } = await apiCall('/users/list-users', { includeAllUsers: true });
      const formatterData = list.map((item) => ({
        FULLNAME: item.FULLNAME || '-',
        NOME: item.NOME || '-',
        SOBRENOME: item.SOBRENOME || '-',
        EMAIL: item.USER || '-',
        PERFIL_DESC: item.perfil,
        LAST_ACCESS: (item.LAST_ACCESS && moment(item.LAST_ACCESS).format('lll')) || '-',
        CLIENT_NAME: item.clientName,
        clientIds: item.clientIds,
        clientNames: item.clientNames,
        isActive: item.IS_ACTIVE,
      })).sort((a, b) => (a.isActive > b.isActive ? -1 : 1));

      setState({ data: formatterData });
    } catch (err) {
      console.log(err);
      toast.error(t('erroUsuario'));
    } finally {
      setState({ isLoading: false });
    }
  }

  useEffect(() => {
    handlerGetUsers();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const { list } = await apiCall('/clients/get-clients-list', { withManagerPermission: true });
      const filteredList = list.filter((x) => (state.userSelected.clientIds && (state.userSelected.clientIds.includes(x.CLIENT_ID))));
      state.clientsList = filteredList;
      render();
    };

    fetchData();
  }, [state.userSelected]);

  useEffect(() => {
    if (state.modalType === 'reactivate' && state.clients.length === 0) {
      state.isButtonDisabled = true;
    }
    else {
      state.isButtonDisabled = false;
    }
    render();
  }, [state.clients]);

  const filterMobile = state.data.filter((item) => textFilter(item, state.searchText));

  function convertToSortableDate(dateString) {
    if (dateString === '-') {
      return moment(0);
    }

    return moment(dateString, 'D [de] MMM [de] YYYY [às] HH:mm', 'pt'); // Parse the date string
  }

  const filterData = useMemo(() => ((state.data) || [])
    .filter((item) => textFilter(item, state.searchText))
    .sort((a, b) => {
      if (state.filter === 'email') {
        return a.EMAIL > b.EMAIL ? 1 : -1;
      } if (state.filter === 'perfil') {
        return a.PERFIL_DESC > b.PERFIL_DESC ? 1 : -1;
      } if (state.filter === 'cliente') {
        return a.CLIENT_NAME > b.CLIENT_NAME ? 1 : -1;
      } if (state.filter === 'lastLogin') {
        const convertedA = convertToSortableDate(a.LAST_ACCESS);
        const convertedB = convertToSortableDate(b.LAST_ACCESS);

        if (convertedA.isBefore(convertedB)) {
          return -1;
        } if (convertedA.isAfter(convertedB)) {
          return 1;
        }
        return 0;
      }
      return 0;
    }),
  [state.data, state.filter, state.searchText]);

  const setFilter = (mensagem: string) => {
    state.filter = mensagem;
    filterData;
    render();
  };
  const linkBase = history.location.pathname;
  const queryPars = queryString.parse(history.location.search);
  const allTabs = [
    {
      title: t('usuarios'),
      link: `${linkBase}`,
      isActive: (!queryPars.type),
      visible: true,
      ref: useRef(null),
    },
    {
      title: t('Product Analytics'),
      link: `${linkBase}?${queryString.stringify({ ...queryPars, type: 'analytics' })}`,
      isActive: (queryPars.type === 'analytics'),
      visible: true,
      ref: useRef(null),
    },
  ];

  return (
    <>
      <Helmet>
        <title>{`Celsius 360 - ${t('Usuários')}`}</title>
      </Helmet>
      <Flex justifyContent="space-between" mb={24}>
        {
          (profile.permissions.isAdminSistema) && (
            <Headers2 links={allTabs} />
          )
        }
        {
          (!profile.permissions.isAdminSistema) && (
            <Box width={[1, 1, 1, 1 / 2, 1 / 3]}>
              <Breadcrumb />
            </Box>
          )
        }
        <Box width={[1, 1, 1, 1 / 2, 1 / 3]} justifyContent="center">
          {(profile.manageSomeClient || profile.permissions.isAdminSistema)
            && (
            <Link to="/adicionar-usuario">
              <Button variant="primary" type="button">
                {`${t('ADICIONAR USUÁRIO')}`}
              </Button>
            </Link>
            )}
        </Box>
      </Flex>
      <div style={{ marginTop: '50px' }} />
      {
        (profile.permissions.isAdminSistema && queryPars.type === 'analytics') ? (
          <iframe title="posthog-dashboards" width="100%" height="700px" allowFullScreen src="https://us.posthog.com/embedded/NKKHysopRHyHtxaxAPKw3ksyxwIO6g" />
        ) : (
          <>
            <Flex style={{ paddingBottom: '10px' }}>
              {(!state.isLoading) && (
              <InputSearch
                id="search"
                name="search"
                placeholder={`${t('pesquisar')}`}
                value={state.searchText}
                onChange={(e) => setState({ searchText: e.target.value })}
              />
              )}
            </Flex>
            <Flex>
              <Box width={1}>
                {/* @ts-ignore */}
                <Desktop>{state.isLoading ? <Loader /> : <Table variant="secondary" setFilter={setFilter} data={filterData} columns={state.columns} />}</Desktop>

                {state.modalType !== '' && (
                <div style={{ zIndex: 3, position: 'sticky' }}>
                  <ModalWindow
                    style={{
                      padding: '0px',
                      marginBottom: 'auto',
                      marginTop: '15%',
                      minWidth: '200px',
                      zIndex: 5,
                    }}
                    topBorder
                    onClickOutside={() => modalClose()}
                  >
                    <Card>
                      <Flex flexDirection="column" alignItems="center" paddingY="12px">
                        <span style={{
                          fontFamily: 'Inter',
                          fontWeight: 700,
                          fontSize: '12px',
                          lineHeight: ' 14px',
                          marginBottom: '14px',
                          color: ' #000',
                        }}
                        >
                          {`${t('aviso').toUpperCase()}`}
                        </span>

                        {(state.modalType === 'reactivate') && (
                        <Flex>
                          <Box width={[1, 1, 1, 280, 280]} mb={24}>
                            {((state.clientsList.length > 0)) && (
                            <SelectMultiple
                              style={{
                                margin: '10px 0px 16px 0px', height: '50px', width: '300px', color: 'black',
                              }}
                              options={state.clientsList}
                              propLabel="NAME"
                              values={state.clients}
                              label={t('clientes')}
                              placeholder={t('selecioneClientes')}
                              onSelect={
                                (_item, _list, newValues) => {
                                  setState({ clients: newValues });
                                }
                              }
                            />
                            )}
                          </Box>
                        </Flex>
                        )}

                        <span style={{
                          fontFamily: 'Inter',
                          fontSize: '12px',
                          lineHeight: ' 12px',
                          marginBottom: '30px',
                          color: ' #000',
                        }}
                        >
                          {`${t('esseUsuario')} ${state.modalType === 'deactivate' ? t('desabilitado').toLowerCase() : t('reabilitado')}, ${t('desejaProsseguir')}`}
                        </span>

                        <Button
                          disabled={state.isButtonDisabled}
                          variant="primary"
                          style={{
                            width: '100%', paddingBlock: '10px', border: 'none', backgroundColor: state.isButtonDisabled ? colors.Grey200 : '#363BC4', marginInline: 'auto', marginBottom: '22px', alignItems: 'center', justifyContent: 'center', fontSize: '10px',
                          }}
                          onClick={() => {
                            state.isButtonDisabled = true;
                            render();
                            if (state.modalType === 'deactivate') {
                              deactivateUser(state.userSelected);
                            }
                            else {
                              reactivateUser(state.userSelected);
                            }
                          }}
                        >
                          {state.modalType === 'deactivate' ? t('desabilitar') : t('habilitar') }
                        </Button>
                        <CancelButton
                          onClick={() => modalClose()}
                        >
                          {t('cancelar')}
                        </CancelButton>
                      </Flex>

                    </Card>
                  </ModalWindow>
                </div>
                )}

                <Mobile>
                  {state.isLoading ? (
                    <Loader />
                  ) : (
                    filterMobile.map((item) => (
                      <DataCard key={item.EMAIL}>
                        <Card title={item.FULLNAME}>
                          <DataItem>{t('email')}</DataItem>
                          <StyledSpan>{item.EMAIL}</StyledSpan>

                          <DataItem>{t('perfil')}</DataItem>
                          <StyledSpan>{item.PERFIL_DESC}</StyledSpan>

                          <DataItem>{t('Último acesso')}</DataItem>
                          <StyledSpan>
                            {item.LAST_ACCESS}
                          </StyledSpan>
                        </Card>
                      </DataCard>
                    ))
                  )}
                </Mobile>
              </Box>
            </Flex>
          </>
        )
      }
    </>
  );
};

export default withTransaction('Users', 'component')(Users);

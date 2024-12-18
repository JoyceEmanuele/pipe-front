import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Flex, Box } from 'reflexbox';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import {
  Table, Button, Loader, Card,
} from '~/components';
import { getUserProfile } from '~/helpers/userProfile';
import { useStateVar } from '~/helpers/useStateVar';
import {
  DeleteNotificationIcon,
  EditIcon, EditNotificationIcon, TrashIcon,
} from '~/icons';
import { Desktop } from '~/pages/Users/Default/styles';
import { apiCall } from '~/providers';
import { colors } from '~/styles/colors';
import i18n from '~/i18n';
import { withTransaction } from '@elastic/apm-rum-react';
import { NewNotificationsLayout } from '~/pages/NewNotifications/Layout';
import { TListFilters, UtilFilter } from '~/pages/Analysis/Utilities/UtilityFilter';
import { ModalCreateNotification } from './ModalCreateNotification';

const t = i18n.t.bind(i18n);
const notifFreq = {
  DAY: t('diariamente'),
  WEEK: t('semanalmente'),
  MONTH: t('mensalmente'),
  NONE: t('naoEnviar'),
};

const KeyCodes = {
  comma: 188,
  slash: 191,
  enter: [10, 13],
};

export const Notifications = (): JSX.Element => {
  const { t } = useTranslation();
  const [profile] = useState(getUserProfile);
  const [state, render, setState] = useStateVar(() => {
    const state = {
      searchState: [] as { text: string }[],
      selectedClientFilter: [] as number[],
      selectedUnit: [] as number[],
      selectedNotificationType: [] as number[],
      selectedNotificationSubtype: [] as number[],
      selectedNotificationDestinatary: [] as string[],
      isLoading: false, // setIsLoading
      notifications: [] as { // setNotifications
        id: number|string
        notification: string
        filter: string
        destiny: string
        name?: string
        email?: string
      }[],
      modalDelete: {
        notifId: null as null|number,
      },
      modalWindow: false,

      columns: [
        {
          Header: t('notificacao'),
          accessor: 'notification',
          Cell: (props) => (
            <StyledSpan>
              {props.row.original.owner ? `${props.row.original.notification} (${props.row.original.owner})` : `${props.row.original.notification}`}
            </StyledSpan>
          ),
        },
        {
          Header: t('filtro'),
          accessor: 'filter',
          Cell: (props) => <StyledSpan>{props.row.original.filter}</StyledSpan>,
        },
        {
          Header: t('condicao'),
          accessor: 'condition',
          Cell: (props) => <StyledSpan>{props.row.original.condition}</StyledSpan>,
        },
        {
          Header: t('destinatario'),
          accessor: 'destiny',
          Cell: (props) => <StyledSpan>{props.row.original.destiny}</StyledSpan>,
        },
        {
          header: '',
          accessor: 'button',
          Cell: (props) => (
            <Flex alignItems="center" mb={2}>
              <Box>
                {
                (props.row.original.id === '[FalhaRepentina]' || props.row.original.id === '[RelatorioAutomatico]')
                  ? (
                    <Link to={`/notificacoes/editar-notificacao/?tipo=${props.row.original.notification}`}>
                      <EditNotificationIcon />
                    </Link>
                  )
                  : (profile.user === props.row.original.owner || profile.permissions.CLIENT_MANAGE.includes(props.row.original.clientId) || profile.permissions.isAdminSistema)
                    ? (
                      <Link
                        to={`/notificacoes/editar-notificacao/${props.row.original.id}`}
                      >
                        <EditNotificationIcon />
                      </Link>
                    )
                    : null
                }
              </Box>
              {(props.row.original.id !== '[FalhaRepentina]' && props.row.original.id !== '[RelatorioAutomatico]') && (
                <Box ml={10}>
                  {(profile.user === props.row.original.owner || profile.permissions.CLIENT_MANAGE.includes(props.row.original.clientId) || profile.permissions.isAdminSistema) && (
                    <Icon
                      onClick={() => {
                        setState({ modalDelete: { notifId: props.row.original.id }, modalWindow: true });
                      }}
                    >
                      <DeleteNotificationIcon width="18px" height="16px" />
                    </Icon>
                  )}
                </Box>
              )}
            </Flex>
          ),
        },
      ],
    };
    if (profile.manageAllClients) { state.columns.unshift({
      Header: t('cliente'),
      accessor: 'client',
      Cell: (props) => <StyledSpan>{props.row.original.clientName}</StyledSpan>,
    }); }
    return state;
  });

  const listFilters = [
    'cliente',
    'tipoNotificacao',
    'subtipoNotificacao',
    'unidade',
    'destinatario',
  ] as TListFilters[];

  const clearFilter = () => {
    setState({
      selectedState: [],
      selectedCity: [],
      selectedUnit: [],
      selectedNotificationType: [],
      selectedNotificationSubtype: [],
    });
  };

  async function handleGetNotification() {
    try {
      setState({ isLoading: true });
      const specials = [] as typeof state.notifications;
      if (!profile.isMasterUser) {
        const responseUnitrepList = await apiCall('/users/get-notif-unitrep', { USER: profile.user });
        specials.push({
          id: '[RelatorioAutomatico]',
          notification: 'RelatorioAutomatico',
          filter: responseUnitrepList.filter || '-',
          condition: notifFreq[responseUnitrepList.FREQ] || responseUnitrepList.FREQ || '?',
          destiny: responseUnitrepList.USER,
        });
      }
      const response = await apiCall('/dac/list-notification-requests', {
        searchTerms: state.searchState.map((x) => x.text.toLowerCase()),
        clientIds: state.selectedClientFilter,
        unitIds: state.selectedUnit,
        typeIds: state.selectedNotificationType,
        subtypeIds: state.selectedNotificationSubtype,
        destinataryIds: state.selectedNotificationDestinatary,
      });

      const formatterData = response.map((item) => ({
        id: item.id,
        notification: item.name || '-',
        condition: item.condition || '-',
        filter: item.filter || '-',
        destiny: (item.dests && item.dests.join(', ')) || '-',
        clientId: item.clientId,
        owner: item.owner,
        clientName: item.clientName,
      }));
      state.notifications = [...specials, ...formatterData];
    } catch (err) {
      console.log(err);
      toast.error(t('erroDados'));
    }
    setState({ isLoading: false });
  }

  async function handleDeleteNotification() {
    try {
      setState({ isLoading: true, modalOpen: false });
      setState({ modalWindow: false });
      await apiCall('/dac/remove-notification-request', { id: state.modalDelete.notifId! });
      handleGetNotification();
      toast.success(t('sucessoExcluirNotificacao'));
    } catch (err) {
      console.log(err);
      toast.error(t('erroExcluirNotificacao'));
    }
    setState({ isLoading: false });
  }

  useEffect(() => {
    handleGetNotification();
  }, []);

  function handleSearchAddition(tag) {
    state.searchState = [...state.searchState, tag];
    render();
    handleGetNotification();
  }

  function handleSearchDelete(i) {
    state.searchState = state.searchState.filter((_tag, index) => index !== i);
    render();
    handleGetNotification();
  }

  return (
    <>
      <Helmet>
        <title>{t('dielEnergiaNotificacoes')}</title>
      </Helmet>
      <NewNotificationsLayout />
      <Container>
        <UtilFilter
          state={state}
          render={render}
          setState={setState}
          onAply={() => {
            handleGetNotification();
          }}
          onClear={clearFilter}
          listFilters={listFilters}
          isFilterButton
          lengthArrayResult={state.notifications.length}
        />
        <ModalCreateNotification />

        <Desktop>
          <Flex>
            <Box width={1}>
              {state.isLoading ? (
                <Loader />
              ) : state.notifications ? (
                <Table variant="secondary" columns={state.columns} data={state.notifications} />
              ) : (
                <Flex justifyContent="center" alignItems="center">
                  <Box>
                    <StyledSpan>{t('aindaNaoExistemNotificacoes')}</StyledSpan>
                  </Box>
                </Flex>
              )}
            </Box>
          </Flex>
        </Desktop>
        <Mobile>
          {state.isLoading ? (
            <Loader />
          ) : (
            state.notifications.map((item) => (
              <StyledCard key={item.id}>
                <HeaderCard>
                  <Flex alignItems="center">
                    <Box width={1 / 2}>
                      <StyledSpan color={colors.White} fontWeight="bold">
                        {item.notification}
                      </StyledSpan>
                    </Box>
                    <Box width={1 / 2}>
                      <IconWrapper>
                        <Icon
                          mr="12px"
                          onClick={() => {
                            setState({ modalDelete: { notifId: item.id as number }, modalWindow: true });
                          }}
                        >
                          <TrashIcon color={colors.White} />
                        </Icon>
                        <Link to={`/notificacoes/editar-notificacao/${item.id}?tipo=${item.name}`}>
                          <EditIcon variant="secondary" />
                        </Link>
                      </IconWrapper>
                    </Box>
                  </Flex>
                </HeaderCard>
                <BodyCard>
                  <DataItem>{t('filtro')}</DataItem>
                  <StyledSpan fontWeight="normal">{item.filter}</StyledSpan>
                  <DataItem>{t('condicao')}</DataItem>
                  <StyledSpan fontWeight="normal">{item.email}</StyledSpan>
                  <DataItem>{t('destinatario')}</DataItem>
                  <StyledSpan fontWeight="normal">{item.destiny}</StyledSpan>
                </BodyCard>
              </StyledCard>
            ))
          )}
        </Mobile>
        <Modal modalOpen={state.modalWindow} />
        <ModalContainer modalOpen={state.modalWindow}>
          <Card title={t('desejaRealmenteExcluirNotificacao')}>
            <Box mb={12}>
              <Button variant="secondary" onClick={() => setState({ modalDelete: { notifId: null }, modalWindow: false })}>
                {t('botaoCancelar')}
              </Button>
            </Box>
            <Box>
              <Button variant="primary" onClick={handleDeleteNotification}>
                {t('botaoExcluir')}
              </Button>
            </Box>
          </Card>
        </ModalContainer>
      </Container>
    </>
  );
};

const Mobile = styled.div`
  display: block;
  @media (min-width: 768px) {
    display: none;
  }
`;

const Container = styled.div`
  position: relative;
`;

const StyledSpan = styled.h1<{ fontWeight? }>(
  ({ color = colors.Grey400, fontWeight = 'normal' }) => `
    font-size: 0.875em;
    color: ${color};
    font-weight: ${fontWeight};
    max-width: 300px;
    overflow: hidden;
    text-overflow: ellipsis;
`,
);
const DataItem = styled.div`
  display: block;
  font-size: 1em;
  color: ${colors.Grey400};
  font-weight: bold;
  &:not(:first-child) {
    margin-top: 16px;
  }
`;
const Icon = styled.div<{ mr? }>(
  ({ mr = 0 }) => `
  display: flex;
  cursor: pointer;
  margin-right: ${mr};
`,
);
const Modal = styled.div<{ modalOpen }>(
  ({ modalOpen }) => `
  position: fixed;
  display: block;
  top:0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: ${colors.Grey400};
  opacity: ${modalOpen ? '0.6' : '0'};
  visibility: ${modalOpen ? 'visible' : 'hidden'};
  z-index: 4;
  transition: all .5s ease-in-out;
`,
);
const ModalContainer = styled.div<{ modalOpen }>(
  ({ modalOpen }) => `
  position: fixed;
  display: block;
  top: 40%;
  left: 0;
  padding: 0 20px;
  z-index: 5;
  width: 100%;
  opacity: ${modalOpen ? '1' : '0'};
  transform: scale(${modalOpen ? 1 : 0});
  visibility: ${modalOpen ? 'visible' : 'hidden'};
  transition: all .3s linear;
  @media (min-width: 768px) {
    left: 30%;
    max-width: 556px;
  }
  @media (min-width: 1200px) {
    left: 35%;
    max-width: 600px;
  }
`,
);

const StyledCard = styled.div`
  position: relative;
  border-radius: 16px;
  box-shadow: 0px 3px 8px rgba(0, 0, 0, 0.24), 0px 3px 12px rgba(0, 0, 0, 0.12);
  &:not(:first-child) {
    margin-top: 24px;
  }
`;
const HeaderCard = styled.div`
  padding: 4px 16px 4px 24px;
  background-color: ${colors.Blue300};
  border-radius: 16px 16px 0px 0px;
`;
const BodyCard = styled.div`
  padding: 24px;
`;
const IconWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
`;

export default withTransaction('Notifications', 'component')(Notifications);

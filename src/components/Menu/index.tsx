import {
  useState, useContext, useEffect,
} from 'react';
import ExpandirMenu from '../../assets/img/sidebar/ExpandirMenu.svg';
import MenuExpandido from '../../assets/img/sidebar/MenuExpandido.svg';
import { withRouter } from 'react-router';
import { t } from 'i18next';
import Configuracoes from '../../assets/img/sidebar/configuracoes.svg';
import LogoDielPowered from '../../assets/img/logos/LogoDielPowered.svg';
import Analise from '../../assets/img/sidebar/NovoAnalise.svg';
import ClientPanelIcon from '../../assets/img/sidebar/NovoClientPanel.svg';
import Notificacoes from '../../assets/img/sidebar/NovoNotificacoes.svg';
import Usuarios from '../../assets/img/sidebar/NovoUsuarios.svg';
import VisaoGeral from '../../assets/img/sidebar/NovoVisaoGeral.svg';
import { getUserProfile } from '../../helpers/userProfile';
import MenuContext from '../../contexts/menuContext';
import { useLocation } from 'react-router-dom';

import {
  StyledLink,
  Background,
  LogoContainer,
  CustomLogo,
  MenuItem,
  MenuHighlight,
  MenuItemImg,
  MenuItemName,
  SubItemMenu,
  BorderSubItem,
  MenuSubItemName,
  ContainerSubItem,
  BorderHorizontalSubItem,
  Creditos,
  InfoHeader,
  MenuLinkActions,
  ModalTitle,
  ModalSubTitle,
  ModalCancel,
  AcceptationModalSubTitle,
  AcceptationModalButton,
  HorizontalLine,
  NotificationBadge,
  CustomSpringerLogo,
} from './styles';
import { ModalWindow } from '../ModalWindow';
import { Flex } from 'reflexbox';
import { Button } from '../Button';
import { DraggableArea } from './Draggable/DraggableArea';
import { toast } from 'react-toastify';
import { apiCall } from '../../providers';
import { ICard, useCard } from '../../contexts/CardContext';
import { AlertSignalIcon } from '../../icons';
import { TourPopover } from '../TourPopover';
import { useTour } from '../../contexts/TourContext';
import { useStateVar } from '~/helpers/useStateVar';
import { identifyUser } from '~/helpers/posthogHelper';

interface IClicked {
  highlight: boolean,
  background: boolean
}

const Menu = ({ history }) => {
  const isSubItem = true;
  const isVisible = true;
  const { pathname } = useLocation();

  const { cards, dispatch } = useCard();
  const [profile] = useState(getUserProfile);
  const [prevCards, setPrevCards] = useState<ICard[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toogleAnalise, setToogleAnalise] = useState(false);
  const [toggleNotificacoes, setToggleNotificacoes] = useState(false);
  const [isConfirmation, setIsConfirmation] = useState(false);
  const { menuToogle, setMenuToogle } = useContext(MenuContext);// true = open, false = not Open
  const [isClickedAnalise, setIsClicked] = useState<IClicked>({ highlight: false, background: false });
  const [isClickedNotificacoes, setIsClickedNotificacoes] = useState<IClicked>({ highlight: false, background: false });

  const [state, render] = useStateVar(() => ({
    countNotifications: 0 as number,
  }));

  const [clientIds, setClientIds] = useState<number[] | null>(null);
  const clientIdsMenuInclude = ((clientIds?.includes(157) || clientIds?.includes(158)) && clientIds?.filter((item) => (item !== 157 && item !== 158)).length === 0);
  function toggleModal() {
    setPrevCards(cards);
    setIsConfirmation(false);
    setIsModalOpen((prevState) => !prevState);
  }

  function toggleConfirmation() {
    setIsConfirmation((prevState) => !prevState);
  }

  const handleSubmitModal = () => {
    dispatch({ type: 'SAVE_STATE' });
    toast.success('Cards salvos com sucesso!');
    setIsConfirmation(false);
    setIsModalOpen(false);
  };

  function handleCancelModal() {
    localStorage.setItem('cards', JSON.stringify(prevCards));
    dispatch({ type: 'RESET_ALL', payload: prevCards });
    setIsConfirmation(false);
    setIsModalOpen(false);
  }

  function getMenuSubItemAnalise(name: string, link: string, isVisible: boolean) {
    return {
      menuToogle,
      linkTo: link,
      subItem: isSubItem,
      isVisible,
      name,
      isActive: history.location.pathname.includes(link),
      click: () => setIsClicked(() => ({ highlight: false, background: true })),
    };
  }
  function getMenuSubItemNotif(name: string, link: string, isVisible: boolean) {
    return {
      menuToogle,
      linkTo: link,
      subItem: isSubItem,
      isVisible,
      name,
      isActive: history.location.pathname.includes(link),
      click: () => setIsClickedNotificacoes(() => ({ highlight: false, background: true })),
    };
  }

  const subItemsAnalise = [
    getMenuSubItemAnalise(t('unidades'), '/analise/unidades', isVisible),
    getMenuSubItemAnalise(t('maquinas'), '/analise/maquinas', isVisible),
    getMenuSubItemAnalise(t('ambientes'), '/analise/ambientes', isVisible),
    getMenuSubItemAnalise(t('energia'), '/analise/energia', isVisible),
    getMenuSubItemAnalise(t('geolocalizacao'), '/analise/geolocalizacao', !profile.permissions.isInstaller),
    getMenuSubItemAnalise(t('dispositivos'), '/analise/dispositivos', isVisible),
    getMenuSubItemAnalise(t('utilitarios'), '/analise/utilitarios', isVisible),
  ];

  const subItemsNotificacoes = [
    getMenuSubItemNotif('Feed', '/notificacoes/feed', isVisible),
    getMenuSubItemNotif('Histórico', '/notificacoes/historico', isVisible),
    getMenuSubItemNotif('Gerenciamento', '/notificacoes/gerenciamento', isVisible),
  ];

  useEffect(() => {
    if (menuToogle && (history.location.pathname.includes('/analise') || history.location.pathname.includes('/integracoes'))) {
      setIsClicked({ background: true, highlight: false });
      setToogleAnalise(true);
    }
    if (menuToogle && (history.location.pathname.includes('/notificacoes'))) {
      setIsClickedNotificacoes({ background: true, highlight: false });
      setToggleNotificacoes(true);
    }
    localStorage.setItem('menuDiel', menuToogle.toString());
  }, [menuToogle]);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const dataResponse = await apiCall('/mainservice/notifications/get-count-notifications', {});
        state.countNotifications = dataResponse;
        render();
      } catch (err) {
        console.log(err);
        toast.error('Não foi possível carregar os dados das notificações');
      }
      render();
    };
    fetchCount();
  }, [pathname]);

  const menuIsActive = (links: string[]) => !menuToogle && links.some((link) => history.location.pathname.includes(link));
  const menuLinkIsActive = (link: string) => history.location.pathname.includes(link) && !isClickedAnalise.background && !isClickedNotificacoes.background;

  useEffect(() => {
    identifyUser(profile);
  }, []);

  const {
    tour, isTourActive, stepHistory,
  } = useTour();
  const firstStep = tour.findIndex((item) => item.step === 0);
  const secoundStep = tour.findIndex((item) => item.step === 1);
  const thirdStep = tour.findIndex((item) => item.step === 2);

  useEffect(() => {
    if (tour[0].isActive || tour[secoundStep].isActive || tour[firstStep].isActive) {
      setIsModalOpen(false);
    }

    if ((stepHistory[0] === 2 || stepHistory[0] === 3) && !isModalOpen) {
      setIsModalOpen(true);
    }
  }, [stepHistory, secoundStep, tour, isModalOpen]);

  return (
    <Background isOpen={menuToogle}>
      <>
        <MenuLogo
          menuToogle={menuToogle}
          setMenuToogle={setMenuToogle}
          setToogleAnalise={setToogleAnalise}
          setToggleNotificacoes={setToggleNotificacoes}
        />
        <MenuLink
          menuToogle={menuToogle}
          linkTo="/visao-geral"
          image={VisaoGeral}
          altImage="VisaoGeral"
          name={t('visaoGeral')}
          isActive={menuLinkIsActive('/visao-geral')}
          visible={!profile.permissions.isInstaller}
          click={() => {
            setIsClicked(() => ({ highlight: false, background: false }));
            setIsClickedNotificacoes(() => ({ highlight: false, background: false }));
            setToogleAnalise(false);
            setToggleNotificacoes(false);
          }}
          actions={
            isTourActive ? (
              <TourPopover tour={tour[secoundStep]} onNextStepClick={() => setIsModalOpen((state) => !state)}>
                <MenuLinkActions onClick={toggleModal}>
                  {t('editar')}
                </MenuLinkActions>
              </TourPopover>
            ) : (
              <MenuLinkActions onClick={toggleModal}>
                {t('editar')}
              </MenuLinkActions>
            )
          }
        />
        <MenuItem
          isActive={isClickedAnalise.background || menuIsActive(['/analise', 'integracoes'])}
          isOpen={menuToogle}
          onClick={() => {
            if (menuToogle) {
              // tirar seleçao de Análise
              setToogleAnalise(!toogleAnalise);
              if (!toogleAnalise) {
                setIsClicked(() => ({ highlight: true, background: true }));
              }
              else {
                setIsClicked(() => ({ highlight: false, background: false }));
              }
            }
            else {
              setMenuToogle(true);
              setIsClicked(() => ({ highlight: true, background: true }));
              setToogleAnalise(true);
            }
            setIsClickedNotificacoes(() => ({ highlight: false, background: false }));
            setToggleNotificacoes(false);
          }}
        >
          <MenuItemImg src={Analise} alt={t('analise')} />
          {menuToogle && <MenuItemName>{t('analise')}</MenuItemName>}
          <MenuHighlight isActive={isClickedAnalise.highlight || menuIsActive(['/analise', '/integracoes'])} />
        </MenuItem>
        { toogleAnalise && (
        <ContainerSubItem>
          {
            subItemsAnalise.map((item, index) => (
              item.isVisible && (
                <MenuLink
                  key={index + item.name}
                  menuToogle={item.menuToogle}
                  linkTo={item.linkTo}
                  name={item.name}
                  isActive={item.isActive}
                  click={item.click}
                  subItem={item.subItem}
                  visible={isVisible}
                />
              )
            ))
          }
          <BorderSubItem />
        </ContainerSubItem>
        )}
        <StyledLink to="/notificacoes/feed">
          <MenuItem
            isActive={isClickedNotificacoes.background || menuIsActive(['/notificacoes'])}
            isOpen={menuToogle}
            onClick={() => {
              if (menuToogle) {
                setToggleNotificacoes(!toggleNotificacoes);
                if (!toggleNotificacoes) {
                  setIsClickedNotificacoes(() => ({ highlight: true, background: true }));
                }
                else {
                  setIsClickedNotificacoes(() => ({ highlight: false, background: false }));
                }
              } else {
                setMenuToogle(true);
                setIsClickedNotificacoes(() => ({ highlight: true, background: true }));
                setToggleNotificacoes(true);
              }
              setIsClicked(() => ({ highlight: false, background: false }));
              setToogleAnalise(false);
            }}
          >
            <MenuItemImg src={Notificacoes} alt={t('notificacoes')} />
            <MenuItemName>
              {menuToogle && (
                <>
                  {t('notificacoes')}
                </>
              )}
              {state.countNotifications > 0 && (
              <NotificationBadge
                menuToogle={menuToogle}
                isActive={isClickedNotificacoes.background || menuIsActive(['/notificacoes'])}
                isPlus={state.countNotifications > 99}
              >
                {state.countNotifications > 99 ? '+99' : state.countNotifications}
              </NotificationBadge>
              )}
            </MenuItemName>

          </MenuItem>
        </StyledLink>
        {toggleNotificacoes && (
        <ContainerSubItem>
          {
                subItemsNotificacoes.map((item, index) => (
                  item.isVisible && (
                    <MenuLink
                      key={item.name}
                      menuToogle={item.menuToogle}
                      linkTo={item.linkTo}
                      name={item.name}
                      isActive={item.isActive}
                      click={item.click}
                      subItem={item.subItem}
                      visible={isVisible}
                    />
                  )
                ))
              }
          <BorderSubItem style={{ height: '82%' }} />
        </ContainerSubItem>
        )}
        <MenuLink
          menuToogle={menuToogle}
          linkTo="/usuarios"
          image={Usuarios}
          altImage={t('usuarios')}
          name={t('usuarios')}
          isActive={menuLinkIsActive('/usuarios')}
          visible={!profile.permissions.isInstaller}
          click={() => {
            setIsClicked(() => ({ highlight: false, background: false }));
            setIsClickedNotificacoes(() => ({ highlight: false, background: false }));
            setToogleAnalise(false);
            setToggleNotificacoes(false);
          }}
        />
        {/* {profile.permissions.isAdminSistema && (
          <MenuLink
            menuToogle={menuToogle}
            linkTo="/visita-tecnica"
            name="Instalação"
            image={VisitaTecnica}
            altImage={t('visitaTecnica')}
            isActive={menuLinkIsActive('/visita-tecnica')}
            visible={profile.permissions.isAdminSistema}
            click={() => {
              setIsClicked(() => ({ highlight: false, background: false }));
              setIsClickedNotificacoes(() => ({ highlight: false, background: false }));
              setToogleAnalise(false);
              setToggleNotificacoes(false);
            }}
          />
        )} */}
        { menuToogle
          && (
          <LogoContainer isOpen={menuToogle}>
            <InfoHeader>
              {t('CONTA')}
            </InfoHeader>
          </LogoContainer>
          )}
        { !menuToogle && (<div style={{ marginBottom: '35px' }} />)}
        <MenuLink
          menuToogle={menuToogle}
          linkTo="/painel/clientes/listagem"
          image={ClientPanelIcon}
          altImage={t('painel')}
          name={t('painel')}
          isActive={menuLinkIsActive('/painel')}
          visible={!!profile.manageAllClients}
          click={() => {
            setIsClicked(() => ({ highlight: false, background: false }));
            setIsClickedNotificacoes(() => ({ highlight: false, background: false }));
            setToogleAnalise(false);
            setToggleNotificacoes(false);
          }}
        />
        <MenuLink
          menuToogle={menuToogle}
          image={ClientPanelIcon}
          isActive={menuLinkIsActive('/painel')}
          name={t('painel')}
          linkTo="/painel/client-painel"
          altImage={t('painel')}
          visible={(!profile.manageAllClients) && (profile.manageSomeClient) && !profile.permissions.isInstaller || false}
          click={() => {
            setIsClicked(() => ({ highlight: false, background: false }));
            setIsClickedNotificacoes(() => ({ highlight: false, background: false }));
            setToogleAnalise(false);
            setToggleNotificacoes(false);
          }}
        />
        <MenuLink
          menuToogle={menuToogle}
          image={Configuracoes}
          isActive={menuLinkIsActive('/configuracoes')}
          name={t('configuracoes')}
          linkTo="/configuracoes"
          altImage={t('configuracoes')}
          visible={isVisible}
          click={() => {
            setIsClicked(() => ({ highlight: false, background: false }));
            setIsClickedNotificacoes(() => ({ highlight: false, background: false }));
            setToogleAnalise(false);
            setToggleNotificacoes(false);
          }}
        />
        <Creditos>
          { menuToogle && <> Powered by </> }
          <img src={LogoDielPowered} alt="diel logo" />
        </Creditos>
      </>
      {isModalOpen && (
        <ModalWindow
          borderTop
          style={{ width: '400px' }}
        >
          {isConfirmation ? (
            <>
              <Flex flexDirection="column" alignItems="flex-start" justifyContent="center" padding="16px" zIndex="100000">
                <Flex flexDirection="row" width="100%">
                  <AlertSignalIcon />
                  <Flex flexDirection="column" alignItems="flex-start" justifyContent="center" ml="8px">
                    <ModalTitle>
                      {t('gerenciarLista')}
                    </ModalTitle>
                    <AcceptationModalSubTitle>{t('voceTemCertezaCards')}</AcceptationModalSubTitle>
                  </Flex>
                </Flex>
              </Flex>
              <Flex justifyContent="center" alignItems="center" flexDirection="row" width="100%" style={{ gap: '8px' }}>
                <AcceptationModalButton onClick={handleSubmitModal} variant="primary">{t('botaoSalvar')}</AcceptationModalButton>
                <AcceptationModalButton onClick={handleCancelModal} variant="borderblue">{t('botaoSairSemSalvar')}</AcceptationModalButton>
              </Flex>
            </>
          ) : (
            <>
              <Flex flexDirection="column" alignItems="flex-start" justifyContent="center" zIndex="100000">
                <ModalTitle>
                  {t('gerenciarLista')}
                </ModalTitle>
                <ModalSubTitle>{t('gerenciarListaDescricao')}</ModalSubTitle>
              </Flex>
              <HorizontalLine />
              {isTourActive ? (
                <TourPopover tour={tour[thirdStep]} placement="left">
                  <DraggableArea closeModal={() => setIsModalOpen((state) => false)} />
                </TourPopover>
              ) : (
                <DraggableArea closeModal={() => setIsModalOpen((state) => false)} />
              )}
              <HorizontalLine />
              <Flex justifyContent="space-between" alignItems="center" flexDirection="row" width="100%">
                <ModalCancel style={{ cursor: 'pointer' }} onClick={prevCards === cards ? toggleModal : toggleConfirmation}>
                  {t('botaoCancelar')}
                </ModalCancel>
                <Button onClick={handleSubmitModal} variant="primary">{t('botaoSalvar')}</Button>
              </Flex>
            </>
          )}
        </ModalWindow>
      )}
    </Background>
  );
};

interface IMenuLogo {
  menuToogle: boolean
  setMenuToogle: (value: boolean) => void
  setToogleAnalise: (value: boolean) => void
  setToggleNotificacoes: (value: boolean) => void
}

const MenuLogo = ({
  menuToogle,
  setMenuToogle,
  setToogleAnalise,
  setToggleNotificacoes,
} : IMenuLogo) : JSX.Element => (
  <LogoContainer isOpen={menuToogle}>
    <div>
      <CustomLogo style={{ marginTop: '19px', marginBottom: '27px' }} src={!menuToogle ? ExpandirMenu : MenuExpandido} alt="openOrClose" onClick={() => { setMenuToogle(!menuToogle); setToogleAnalise(false); setToggleNotificacoes(false); }} />
    </div>
    <InfoHeader>
      { menuToogle ? t('PRINCIPAL') : ' '}
    </InfoHeader>
  </LogoContainer>
);

interface IMenuLink {
  isActive: any
  name: string
  linkTo: string
  image?: any
  altImage?: string
  click?: any
  subItem?: boolean
  menuToogle: boolean
  visible: boolean
  actions?: React.ReactNode
}

const MenuLink = ({
  isActive,
  name,
  linkTo,
  image,
  actions,
  altImage,
  click,
  subItem,
  menuToogle,
  visible,
} : IMenuLink) : JSX.Element => {
  if (!visible) {
    return (
      <>
      </>
    );
  }
  if (!menuToogle) {
    return (
      <StyledLink to={linkTo} onClick={click}>
        <MenuItem isOpen={menuToogle} isActive={isActive}>
          <MenuItemImg src={image} alt={altImage} />
          <MenuHighlight isActive={isActive} />
        </MenuItem>
      </StyledLink>
    );
  }
  return (
    <StyledLink to={linkTo} onClick={click}>
      {
        subItem
          ? (
            <>
              <SubItemMenu isActive={isActive}>
                <BorderHorizontalSubItem />
                <MenuSubItemName>{name}</MenuSubItemName>
                <MenuHighlight isActive={isActive} />
              </SubItemMenu>
            </>
          )
          : (
            <MenuItem isOpen={menuToogle} isActive={isActive}>
              <div>
                <MenuItemImg src={image} alt={altImage} />
                <MenuItemName>{name}</MenuItemName>
              </div>
              <MenuHighlight isActive={isActive} />
              {actions}
            </MenuItem>
          )
      }
    </StyledLink>
  );
};

const MenuWrapper = withRouter(Menu);
export { MenuWrapper as Menu };

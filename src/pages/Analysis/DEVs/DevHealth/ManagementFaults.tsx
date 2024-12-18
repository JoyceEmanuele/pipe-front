import { Helmet } from 'react-helmet';
import { t } from 'i18next';
import { Box, Flex } from 'reflexbox';
import { Title } from '../UsageCommon/styles';
import { CardWrapper, ModalTitle } from './styles';
import {
  IconButton, ListItem, TextareaAutosize,
} from '@material-ui/core';
import { apiCall, ApiResps } from '~/providers';
import { ListContainer } from '~/pages/TechnicalVisits/TechnicalUsersListing/components/TVList/styles';
import { Button, Loader, ModalWindow } from '~/components';
import { useEffect, useState } from 'react';
import { ContainerInputs, ModalCancel } from '~/pages/Admin/AdmCities/styles';

import Desativar from '~/assets/img/DesativarFalha.svg';
import Reativar from '~/assets/img/ReativarFalha.svg';
import { LoaderContainer } from '~/pages/Admin/FaultsList/styles';
import { useStateVar } from '~/helpers/useStateVar';
import { getUserProfile } from '~/helpers/userProfile';
import { toast } from 'react-toastify';
import { generateNameFormatted } from '~/helpers/titleHelper';

interface Props {
  devId: string;
  unitId: number;
  assetId: number;
}

export const ManagementFaults = ({ devId, unitId, assetId }: Props): JSX.Element => {
  const [showModal, setShowModal] = useState(false);
  const [active, setActive] = useState(false);
  const [faultIdPressed, setFaultIdPressed] = useState('');
  const [description, setDescription] = useState('');
  const [reload, setReload] = useState(false);
  const [state, render, setState] = useStateVar({
    loading: false,
    faults: [] as ApiResps['/asset/list-enabled-faults']['list'],
    unit: {} as ApiResps['/clients/get-unit-info'],
  });

  async function handleSubmit() {
    try {
      await apiCall('/asset/enable-faults', {
        assetId,
        faultId: faultIdPressed,
        enabled: !active,
        description,
        user: getUserProfile().fullName || getUserProfile().name || '',
        client: state.unit.CLIENT_NAME,
        unit: state.unit.UNIT_NAME,
        unitId,
      });
      setReload(!reload);
      setShowModal(false);
      render();
      active
        ? toast.success('Falha desativada com sucesso!')
        : toast.success('Falha reativada com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar falha!');
    }
  }
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    if (!assetId || !unitId) return;
    setState({ loading: true });
    try {
      const [
        responseFaults,
        responseUnit,
      ] = await Promise.all([
        apiCall('/asset/list-enabled-faults', {
          assetId,
        }),
        apiCall('/clients/get-unit-info', {
          unitId,
        }),
      ]);

      state.unit = responseUnit;
      state.faults = responseFaults.list;
      console.log(state.faults);
    } catch (error) {
      console.error(error);
    }
    setState({ loading: false });
  }

  return (
    <>
      <Helmet>
        <title>{generateNameFormatted(devId, t('gerenciamentoFalhas'))}</title>
      </Helmet>
      {state.loading ? (
        <LoaderContainer>
          <Loader variant="primary" />
          <span>Carregando</span>
        </LoaderContainer>
      ) : (
        <>
          <Flex flexDirection="column">
            <Box mt="32px" width="100%">
              <CardWrapper>
                <Title style={{ fontSize: '1rem' }}>{t('historicoFalhas')}</Title>
                <div style={{ margin: '20px 0px' }} />
                <Title>
                  {t('falha')}
                </Title>
                <ListContainer>
                  {
                    state.faults && state.faults.map((fault) => (
                      <ListItem style={{ width: '100%', justifyContent: 'space-between' }}>
                        {
                          fault.fault_id
                        }
                        <IconButton onClick={() => {
                          setShowModal(true);
                          setFaultIdPressed(fault.fault_id);
                          fault.enabled === false
                            ? setActive(false) : setActive(true);
                        }}
                        >
                          {
                            fault.enabled === false ? <img src={Reativar} alt="Reativar" />
                              : <img src={Desativar} alt="Desativar" />
                          }
                        </IconButton>
                      </ListItem>
                    ))
                  }
                </ListContainer>
              </CardWrapper>
            </Box>
          </Flex>
          {
        showModal && (
          <ModalWindow
            borderTop
            style={{ minWidth: '300px' }}
            onClickOutside={() => {
              setShowModal(false);
            }}
          >
            {
              active === true ? (
                <Flex justifyContent="center" flexDirection="column" alignItems="center">
                  <Flex width={1} flexDirection="column" alignItems="center" justifyContent="center">
                    <ModalTitle style={{ color: '#000' }}><b>{t('Atenção').toUpperCase()}</b></ModalTitle>
                    <div style={{ color: '#000', margin: '10px 0px', fontWeight: 'bold' }}>
                      Esta falha será desativada, deseja prosseguir?
                    </div>
                  </Flex>
                  <Box justifyContent="center" width={1}>
                    <ContainerInputs>
                      <Title>
                        Adicionar observação (opcional)
                      </Title>
                      <TextareaAutosize
                        onChange={(e) => { setDescription(e.target.value); }}
                        style={{
                          margin: '8px 0px', height: '50px', border: '1px solid #ccc', borderRadius: '4px',
                        }}
                        label={t('nome')}
                      />
                      <Button onClick={handleSubmit} variant="primary" style={{ marginTop: '20px' }}>
                        {t('desativar')}
                      </Button>
                      <ModalCancel
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                          setShowModal(false);
                        }}
                      >
                        {t('botaoCancelar')}
                      </ModalCancel>
                    </ContainerInputs>
                  </Box>
                </Flex>
              ) : (
                <Flex justifyContent="center" flexDirection="column" alignItems="center">
                  <Flex width={1} flexDirection="column" alignItems="center" justifyContent="center">
                    <ModalTitle style={{ color: '#000' }}><b>{t('Atenção').toUpperCase()}</b></ModalTitle>
                    <div style={{ color: '#000', margin: '10px 0px', fontWeight: 'bold' }}>
                      Esta falha será reativada, deseja prosseguir?
                    </div>
                  </Flex>
                  <Box justifyContent="center" width={1}>
                    <ContainerInputs>
                      <Button variant="primary" style={{ marginTop: '20px' }} onClick={handleSubmit}>
                        {t('reativar')}
                      </Button>
                      <ModalCancel
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                          setShowModal(false);
                        }}
                      >
                        {t('botaoCancelar')}
                      </ModalCancel>
                    </ContainerInputs>
                  </Box>
                </Flex>
              )
            }
          </ModalWindow>
        )
      }
        </>
      )}
    </>
  );
};

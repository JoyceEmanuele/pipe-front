import { useEffect } from 'react';
import { ContainerDuts, DutItemStyle, HeaderVisibility } from './styles';
import { useStateVar } from '~/helpers/useStateVar';
import { useParams } from 'react-router-dom';
import { apiCall } from '~/providers';
import { toast } from 'react-toastify';
import { t } from 'i18next';
import OlhoAberto from '~/icons/OlhoAberto';
import OlhoFechado from '~/icons/OlhoFechado';
import { Button, Loader } from '~/components';

type TDutsList = {
    DEV_ID: string;
    ISVISIBLE: number,
    ROOM_NAME: string
};

export const EnvironmentVisibility = (props: { unitId?: number, clientId?: number }): JSX.Element => {
  const routeParams = useParams<{ unitId: string }>();
  const [state, render, setState] = useStateVar({
    isLoading: true,
    unitId: Number(routeParams.unitId || 0),
    clientId: Number(props.clientId || 0),
    dutsList: [] as TDutsList[],
  });

  async function handleGetUnitInfo() {
    try {
      setState({ isLoading: true });
      const dutsList = await apiCall('/dut/get-visibility', { unitId: state.unitId, clientId: state.clientId });
      state.dutsList = dutsList;
    } catch (err) {
      console.log(err);
      toast.error(t('erroInformacaoUnidade'));
    }
    setState({ isLoading: false });
  }

  useEffect(() => {
    handleGetUnitInfo();
  }, []);

  async function handleChangeVisibility() {
    try {
      setState({ isLoading: true });
      const sendDuts = await apiCall('/dut/set-visibility', { dutsList: state.dutsList, unitId: state.unitId, clientId: state.clientId });
      state.dutsList = sendDuts;
      toast.success(t('sucessoSalvar'));
    } catch (err) {
      handleGetUnitInfo();
      console.log(err);
      toast.error(t('erroMudancaVisibilidade'));
    }
    setState({ isLoading: false });
  }

  if (state.isLoading) {
    return (
      <>
        <Loader variant="primary" />
      </>
    );
  }

  return (
    <>
      {
        state.dutsList.length === 0 ? (
          <p>
            <strong>{t('semDispositivo')}</strong>
          </p>
        ) : (
          <>
            <ContainerDuts>
              <HeaderVisibility>
                <p>{t('ambiente')}</p>
                <p>ID</p>
              </HeaderVisibility>
              {
                state.dutsList.map((dut, index) => <DutItem DEV_ID={dut.DEV_ID} ISVISIBLE={dut.ISVISIBLE} ROOM_NAME={dut.ROOM_NAME} index={index} setState={setState} state={state} render={render} key={dut.DEV_ID} />)
              }
            </ContainerDuts>
            <Button variant="primary" style={{ width: '100px', margin: '5px 0 0 5px' }} onClick={() => { handleChangeVisibility(); render(); }}>
              {t('botaoSalvar')}
            </Button>
          </>
        )
      }
    </>
  );
};

type DutItemProps = {
  DEV_ID: string,
  ISVISIBLE: number,
  ROOM_NAME: string,
  index: number,
  setState: (o: Partial<{
    isLoading: boolean;
    unitId: number;
    dutsList: TDutsList[];
  }>) => void,
  state: {
    isLoading: boolean;
    unitId: number;
    dutsList: TDutsList[];
  },
  render: () => void
}

function DutItem(props: DutItemProps) {
  function handlechangevisibility() {
    props.state.dutsList[props.index].ISVISIBLE === 1 ? props.state.dutsList[props.index].ISVISIBLE = 0 : props.state.dutsList[props.index].ISVISIBLE = 1;
    props.render();
  }
  return (
    <DutItemStyle>
      <figure onClick={() => handlechangevisibility()}>
        {props.ISVISIBLE === 1 ? <OlhoAberto /> : <OlhoFechado />}
      </figure>
      <div>
        <p>{props.ROOM_NAME}</p>
        <h6>{props.DEV_ID}</h6>
      </div>
    </DutItemStyle>
  );
}

import { useParams } from 'react-router-dom';
import { useStateVar } from '~/helpers/useStateVar';
import {
  ModalAddSimcard,
  ModalDeleteSimcard, ModalDescSimcard, NoSimcardAdd, SimcardContainerList,
} from '~/pages/ClientPanel/FormEditUnit';
import { t } from 'i18next';
import { apiCall, apiCallFormData } from '~/providers';
import { toast } from 'react-toastify';
import { useEffect, useState } from 'react';
import { Button } from '~/components/Button';
import {
  TSIMCARD,
} from '~/helpers/simcards';
import { ContainerSimcardsProfileInfo } from './styles';
import { Loader } from '~/components';

export default function Simcards(props: { unitId?: number, clientId?: number }): JSX.Element {
  const routeParams = useParams<{ unitId: string }>();
  const [files, setFiles] = useState<File[]>([]);
  const [state, render, setState] = useStateVar({
    isLoading: false,
    unitId: Number(routeParams.unitId || 0),
    clientId: Number(props.clientId || 0),
    listSimcards: [] as TSIMCARD[],
    listSimEdit: [] as TSIMCARD[],
    modalAddSimcard: false,
    formSimcard: {
      iccid: '',
      pontoAcesso: '',
      modem: '',
      macPontoAcesso: '',
      macRepetidor: '',
    },
    itemDesc: {} as TSIMCARD[],
    deleteSims: [] as { ICCID: string, OLDICCID?: string }[],
    isEdit: false,
    modalDesc: false,
    editDeleteSim: {} as TSIMCARD | null,
    listAddPhotos: [] as {
      iccid: string,
      file: Blob
    }[],
    deleteListPhotos: [] as {
      filename: string,
      iccid: string,
    }[],
    modalDeleteSim: false,
  });

  function returnFormatedNameSimcard() {
    if (state.listSimEdit.length > 1) return `S ${t('associados')}`;
    return ` ${t('associado')}`;
  }

  useEffect(() => {
    getListSimcards();
  }, []);

  async function submitSim() {
    try {
      setState({ isLoading: true });
      render();
      const listToSet = state.listSimEdit.filter((sim) => {
        const item = state.listSimcards.find((item) => item.ICCID === sim.ICCID || item.ICCID === sim.OLDICCID);
        if (!item || item.ICCID !== sim.ICCID || item.ACCESSPOINT !== sim.ACCESSPOINT || sim.MODEM !== item.MODEM || item.MACACCESSPOINT !== sim.MACACCESSPOINT || item.MACREPEATER !== sim.MACREPEATER) {
          return true;
        }
        return false;
      });
      const deleteArray = state.deleteSims.filter((sim) => state.listSimcards.find((item) => item.ICCID === sim.ICCID || item.ICCID === sim.OLDICCID));
      if (deleteArray.length) {
        await apiCall('/sims/delete-sim', { ICCIDS: deleteArray });
      }
      await Promise.all(listToSet.map((sim) => apiCall('/sims/set-sim-info', sim)));
      await Promise.all(state.listAddPhotos.map((item) => 
        {
          const simInfo = state.listSimcards.find((simcard) => simcard.ICCID === item.iccid);
          if (simInfo) {
            apiCallFormData('/upload-service/upload-image', { referenceId: simInfo.ID, referenceType: 'SIMCARDS' }, { file: item.file });
          }
        }));
      if (state.deleteListPhotos.length) {
        await Promise.all(state.deleteListPhotos.map((item) => 
        {
          const simInfo = state.listSimcards.find((simcard) => simcard.ICCID === item.iccid);
          if (simInfo) {
            apiCall('/upload-service/delete-image', { referenceId: simInfo.ID, referenceType: 'SIMCARDS', filename: item.filename });
          }
        }))
      }
      toast.success(t('sucessoSalvar'));
    } catch (err) {
      toast.error(t('erroSalvar'));
    }
    await getListSimcards();
    setState({ isLoading: false });
    render();
  }

  async function getListSimcards() {
    try {
      if (state.unitId) {
        const list = await apiCall('/sims/get-unit-sims', { unitId: state.unitId });
        setState({ listSimcards: list, listSimEdit: list });
      }
    } catch (err) {
      toast.error('Nao foi possivel buscar a lista de SIMCARD da unidade');
    }
  }

  if (state.isLoading) {
    return <Loader />;
  }
  return (
    <>
      <ContainerSimcardsProfileInfo>
        <div>
          <h4 style={{ color: 'blue', fontWeight: 'bold', fontSize: 14 }}>{t('associacoes')}</h4>
          <span><strong>{`SIMCARDs ${t('associados')}`}</strong></span>
          <p>
            {
              state.listSimEdit.length > 0 ? `${state.listSimEdit.length} SIMCARD${returnFormatedNameSimcard()}}` : t('nenhumSimcardAssociado')
            }
          </p>
        </div>

        <div>
          <Button variant="primary" style={{ width: 200 }} onClick={() => setState({ modalAddSimcard: true })}>
            {t('adicionar')}
          </Button>
        </div>
      </ContainerSimcardsProfileInfo>
      {
        state.listSimEdit.length > 0 ? (
          <SimcardContainerList state={state} setState={setState} total={false} botao={false} where="acima" />
        ) : (
          <NoSimcardAdd setState={setState} botao={false} where="acima" />
        )
      }
      {
        state.modalDesc && (
          <ModalDescSimcard sim={state.itemDesc} closeModal={() => setState({ modalDesc: false })} />
        )
      }
      {
        state.modalDeleteSim && (
          <ModalDeleteSimcard closeModal={() => { setState({ modalDeleteSim: false, editDeleteSim: null }); setFiles([]); }} sim={state.editDeleteSim} state={state} setState={setState} />
        )
      }
      {
        state.modalAddSimcard && (
          <ModalAddSimcard
            closeModal={() => { setState({ modalAddSimcard: false, isEdit: false, editSim: null }); setFiles([]); }}
            edit={state.isEdit}
            editSim={state.editDeleteSim}
            state={state}
            setState={setState}
            unitId={state.unitId}
            clientId={state.clientId}
            files={files}
            setFiles={setFiles}
          />
        )
      }
      <Button variant={state.isLoading ? 'disabled' : 'primary'} style={{ width: 150, marginTop: 20 }} onClick={() => submitSim()}>
        {t('salvar')}
      </Button>
    </>
  );
}

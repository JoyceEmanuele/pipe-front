import { toast } from 'react-toastify';
import { apiCall, apiCallFormData } from '~/providers';
import { t } from 'i18next';

export type TSIMCARD = {
  ID: number
  ICCID: string
  CLIENT?: number
  UNIT?: number
  ACCESSPOINT?: string
  MODEM?: string
  MACACCESSPOINT?: string
  MACREPEATER?: string
  ASSOCIATION_DATE?: string|null
  NAME?: string|null
  OLDICCID?: string|null
  IMAGES?: { name: string, url: string }[]
};

export async function handleSubmitSimcards(state, setState, render) {
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
    const deleteArray = state.deleteSims.filter((sim) => state.listSimcards.find((item) => item.ICCID === sim.ICCID));
    if (deleteArray.length) {
      await apiCall('/sims/delete-sim', { ICCIDS: deleteArray });
    }
    await Promise.all(listToSet.map((sim) => {
      apiCall('/sims/set-sim-info', sim);
    }));
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
      }));
    }
  } catch (err) {
    toast.error(t('erroSalvar'));
  }
  setState({ isLoading: false });
  render();
}

export async function deleteSims(state) {
  const deleteArray = state.deleteSims.filter((sim) => state.listSimcards.find((item) => item.ICCID === sim.ICCID || item.ICCID === sim.OLDICCID));
  if (deleteArray.length) {
    await apiCall('/sims/delete-sim', { ICCIDS: deleteArray });
  }
}

export async function editUpdateSims(state) {
  const listToSet = state.listSimEdit.filter((sim) => {
    const item = state.listSimcards.find((item) => item.ICCID === sim.ICCID || item.ICCID === sim.OLDICCID);
    if (!item || item.ICCID !== sim.ICCID || item.ACCESSPOINT !== sim.ACCESSPOINT || sim.MODEM !== item.MODEM || item.MACACCESSPOINT !== sim.MACACCESSPOINT || item.MACREPEATER !== sim.MACREPEATER) {
      return true;
    }
    return false;
  });
  await Promise.all(listToSet.map((sim) => {
    apiCall('/sims/set-sim-info', sim);
  }));
}

export async function addPhotosSims(state) {
  await Promise.all(state.listAddPhotos.map((item) =>
  {
    const simInfo = state.listSimcards.find((simcard) => simcard.ICCID === item.iccid);
    if (simInfo) {
      apiCallFormData('/upload-service/upload-image', { referenceId: simInfo.ID, referenceType: 'SIMCARDS' }, { file: item.file });
    }
  }));
}

export async function deletePhotosSims(state) {
  if (state.deleteListPhotos.length) {
    await Promise.all(state.deleteListPhotos.map((item) =>
    {
      const simInfo = state.listSimcards.find((simcard) => simcard.ICCID === item.iccid);
      if (simInfo) {
        apiCall('/upload-service/delete-image', { referenceId: simInfo.ID, referenceType: 'SIMCARDS', filename: item.filename });
      }
    }));
  }
}

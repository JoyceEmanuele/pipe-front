import {
  DocumentationContainer,
  DocumentationContainerArea,
  ExibInvisibleFile,
  SelectAndDownloadArea,
} from './styles';
import Checkbox from '@material-ui/core/Checkbox';
import {
  Button,
} from 'components';
import { t } from 'i18next';
import { BluePaper } from '../../../../icons/index';
import { useEffect, useState } from 'react';
import { apiCallDownload } from '~/providers';
import { toast } from 'react-toastify';
import { getUserProfile } from '~/helpers/userProfile';
import OlhoFechado from '~/icons/OlhoFechado';

type TDocumentationArea = {
  documentations: {
    UNIT_SKETCH_ID: number;
    FILENAME: string;
    IS_VISIBLE: boolean;
    SKETCH_NAME: string;
  }[],
  unitId: number
}

export function DocumentationFiles({ documentations, unitId }: TDocumentationArea) {
  const [selectedDocumentations, setSelectedDocumentations] = useState<number[]>([]);
  const [profile] = useState(getUserProfile);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAll, setSelectedAll] = useState(false);
  const [selectFiles, setSelectedFiles] = useState<{ UNIT_SKETCH_ID: number; FILENAME: string; IS_VISIBLE: boolean; SKETCH_NAME: string; }[]>([]);
  const [documentationsVisible, setDocumentationsVisible] = useState<{ UNIT_SKETCH_ID: number; FILENAME: string; IS_VISIBLE: boolean; SKETCH_NAME: string; }[]>([]);

  function handleSelectDocs(item) {
    if (!selectedDocumentations.includes(item.UNIT_SKETCH_ID)) {
      setSelectedDocumentations([...selectedDocumentations, item.UNIT_SKETCH_ID]);
      setSelectedFiles([...selectFiles, item]);
    } else {
      const filterDocs = selectedDocumentations.filter((doc) => doc !== item.UNIT_SKETCH_ID);
      const filterFile = selectFiles.filter((doc) => doc.UNIT_SKETCH_ID !== item.UNIT_SKETCH_ID);
      setSelectedDocumentations([...filterDocs]);
      setSelectedFiles([...filterFile]);
    }
  }

  function handleSelectAll() {
    if (selectedAll) {
      setSelectedDocumentations(documentations.map((doc) => doc.UNIT_SKETCH_ID));
      setSelectedFiles(documentations.map((doc) => doc));
    } else {
      setSelectedDocumentations([]);
      setSelectedFiles([]);
    }
  }

  async function downloadFiles() {
    setIsLoading(true);
    for (const item of selectFiles) {
      try {
        const params = { unitId, unitSketchId: item.UNIT_SKETCH_ID, filename: item.FILENAME };
        const pdfResponse = await apiCallDownload('/upload-service/download-sketches', params);
        const link: any = document.getElementById('downloadLink');
        if (link.href !== '#') {
          window.URL.revokeObjectURL(link.href);
        }
        link.href = window.URL.createObjectURL(pdfResponse.data);
        const extension = item.FILENAME.split('.');
        link.download = `${item.SKETCH_NAME}.${extension[1]}`;
        link.click();
        toast.success(t('documentoBaixadoComSucesso'));
      } catch (err) {
        console.log(err); toast.error(t('erroBaixarDocumento'));
      }
    }
    setIsLoading(false);
  }

  useEffect(() => {
    handleSelectAll();
  }, [selectedAll]);

  useEffect(() => {
    setDocumentationsVisible(documentations.filter((item) => item.IS_VISIBLE));
  }, [documentations]);

  return (
    <DocumentationContainerArea>
      <a href="#" style={{ display: 'none' }} id="downloadLink" />
      <h4>{t('documentacao')}</h4>
      <DocumentationContainer>
        {
          documentations.map((item) => (
            <div key={item.FILENAME}>
              <Checkbox
                checked={selectedDocumentations.includes(item.UNIT_SKETCH_ID)}
                onClick={() => { handleSelectDocs(item); }}
                style={{ marginLeft: '-10px' }}
                color="primary"
              />
              <p>{item.SKETCH_NAME ? item.SKETCH_NAME : item.FILENAME}</p>
              <ExibInvisibleFile>{!item.IS_VISIBLE && (profile.permissions.isAdminSistema || profile.permissions.isParceiroValidador) ? <OlhoFechado /> : '' }</ExibInvisibleFile>
            </div>
          ))
        }
        {
          (documentationsVisible.length === 0 && (!profile.permissions.isAdminSistema && !profile.permissions.isParceiroValidador)) && (
            <section>
              <BluePaper />
              <h3>{t('nenhumDocumentoCadastrado')}</h3>
            </section>
          )
        }
        {
          (documentations.length === 0 && (profile.permissions.isAdminSistema || profile.permissions.isParceiroValidador)) && (
            <section>
              <BluePaper />
              <h3>{t('nenhumDocumentoCadastrado')}</h3>
              <h4>{t('vocePodeInserir')}</h4>
            </section>
          )
        }
      </DocumentationContainer>
      {
        documentations.length > 0 && (
          <SelectAndDownloadArea>
            <div style={{ display: 'flex' }}>
              <Checkbox
                checked={selectFiles.length === documentations.length}
                onClick={() => { setSelectedAll(!selectedAll); }}
                style={{ marginLeft: '-10px' }}
                color="primary"
              />
              <p>{t('selecionarTodos')}</p>
            </div>
            <Button variant={isLoading ? 'disabled' : 'blue'} onClick={() => { downloadFiles(); }}>{t('baixar')}</Button>
          </SelectAndDownloadArea>
        )
      }
    </DocumentationContainerArea>
  );
}

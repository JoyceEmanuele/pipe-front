import { Accept, useDropzone } from 'react-dropzone';
import {
  DragContainer,
} from './styles';
import { t } from 'i18next';
import { BluePaper } from '~/icons';

interface IDropArea {
  maxFiles: number,
  fileDropped: (value: any) => void
  files: any[],
  title?: string,
  extensions: Accept
}

export const DropzoneArea = ({
  maxFiles, fileDropped, files, title, extensions,
}: IDropArea) => {
  const {
    acceptedFiles,
    fileRejections,
    isDragActive,
    getRootProps,
    getInputProps,
  } = useDropzone({
    maxFiles,
    accept: extensions,
    onDrop: (acceptedFiles) => {
      fileDropped(
        acceptedFiles.map((file) => Object.assign(file, {
          preview: URL.createObjectURL(file),
        })),
      );
    },
  });

  const filesNames = acceptedFiles.map((file: any) => <h6>{file.path}</h6>);

  function titleReturn() {
    if (title) return title;
    return t('arrasteNoMaximo5Documentos', { maxFiles });
  }

  return (
    <div className="container">
      <DragContainer isPadding={(!isDragActive && files.length === 0)} {...getRootProps({ className: 'dropzone' })}>
        <input {...getInputProps()} />
        {(acceptedFiles.length > 0) && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          >
            <h4>{t('arquivoAceito')}</h4>
            <h6>{filesNames}</h6>
          </div>
        )}
        {(fileRejections.length > 0) && (<h3>{t('arquivoRejeitado')}</h3>)}
        {(!isDragActive && files.length === 0) && (
          <>
            <BluePaper />
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'column',
            }}
            >
              <h6 style={{ margin: '0' }}>
                { maxFiles > 1 ? titleReturn() : t('arrasteUmDocumentoOu') }
              </h6>
              <p>{`${maxFiles === 1 ? t('facaUploadArquivo') : t('facaUploadArquivos')}`}</p>
            </div>
            <h5>{t('arquivosJpgPngBpmPdf')}</h5>
          </>
        )}
      </DragContainer>
    </div>
  );
};

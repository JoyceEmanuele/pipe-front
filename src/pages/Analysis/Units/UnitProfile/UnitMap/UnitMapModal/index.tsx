import { Button, Input } from '~/components';
import {
  FileDropContent, FileDropStyled, UnitMapFooter, UnitMapHeader, UnitMapModalStyled,
} from './styles';
import * as yup from 'yup';
import formFieldsValidator from '~/helpers/formFieldsValidator';
import { useStateVar } from '~/helpers/useStateVar';
import { UnitMapData } from '~/metadata/UnitMap.model';
import { ImageIcon, PinIcon } from '~/icons';
import moment from 'moment';
import i18n from '~/i18n';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { colors } from '~/styles/colors';

interface UnitMapModalProps {
  unitMap?: UnitMapData;
  isEditing?: boolean;
  handleConfirmModal: (unitMap: UnitMapData) => void;
  handleCloseModal: () => void;
}

export const UnitMapModal: React.FC<UnitMapModalProps> = ({
  unitMap,
  isEditing = false,
  handleCloseModal,
  handleConfirmModal,
}) => {
  moment.locale(i18n.language === 'pt' ? 'pt-BR' : 'en');
  const { t } = useTranslation();

  const [fileDropHasError, setFileDropHasError] = useState(false);

  const [state, render, setState] = useStateVar(() => {
    const unitMapSchema = {
      name: yup.string().required(t('campoObrigatorio')).test('apply-trim', t('campoObrigatorio'), (name) => (name ? name.trim().length > 0 : false)),
    };

    const unitMapValuesState = { name: unitMap ? unitMap.NAME_GP : '' };

    const initialFile: File[] = [];

    if (unitMap?.file) {
      initialFile.push(unitMap.file);
    }

    return {
      files: initialFile,
      formData: formFieldsValidator(unitMapSchema as any, unitMapValuesState),
    };
  });

  const {
    values: unitMapValues,
    handleChange,
    errors: unitMapErrors,
  } = state.formData;

  const handleValidateForm = async () => {
    const checkForm = await state.formData.checkAll();
    const checkFileDrop = !!state.files[0] || !!unitMap?.FILENAME;

    render();
    if (!checkFileDrop) {
      setFileDropHasError(true);
    }

    return checkForm && checkFileDrop;
  };

  return (
    <UnitMapModalStyled borderTop>
      <UnitMapHeader>
        <PinIcon />
        {!isEditing ? (
          <h2>{t('adicionarNovoMapa')}</h2>
        ) : (
          <h2>{t('editarMapa')}</h2>
        )}
      </UnitMapHeader>
      <Input
        label={t('nomeMapa')}
        value={unitMapValues.name}
        error={unitMapErrors.name}
        id="name"
        name="name"
        placeholder={t('nomeMapa')}
        onChange={(e) => {
          handleChange('name', e.target.value);
          render();
        }}
      />
      <FileDropStyled
        disabled={!!unitMap?.IMAGE}
        onError={() => setFileDropHasError(true)}
        onReset={() => setFileDropHasError(false)}
        fileDropConfig={{
          onDrop: (acceptedFiles) => {
            const files = acceptedFiles.map((file) => Object.assign(file, {
              preview: URL.createObjectURL(file),
            }));

            setState({ files });

            setFileDropHasError(false);
          },
          accept: { 'image/*': ['.png', '.jpg'] },
          maxFiles: 1,
        }}
      >
        <FileDropContent fileDropHasError={fileDropHasError}>
          <div className="filename">
            <ImageIcon {...(fileDropHasError && { color: colors.RedDark })} />
            {isEditing && unitMap?.FILENAME}
            {state.files[0] && state.files[0].name}
          </div>

          <p>
            {t('arrasteUmaImagemOu')}
            {' '}
            <span className="highlight">
              {t('facaUploadArquivo')}
            </span>
          </p>

          <span>
            {t('arquivosFiledrop')}
          </span>
        </FileDropContent>
      </FileDropStyled>
      <UnitMapFooter>
        <a onClick={handleCloseModal}>{t('cancelar')}</a>
        {!isEditing ? (
          <Button
            variant="primary"
            onClick={async () => {
              const validateForm = await handleValidateForm();
              if (!validateForm) return;

              handleConfirmModal({
                NAME_GP: unitMapValues.name,
                file: state.files[0],
              });
              handleCloseModal();
            }}
          >
            {t('carregarMapa')}
          </Button>
        ) : (
          <Button
            variant="primary"
            onClick={async () => {
              const validateForm = await handleValidateForm();
              if (!validateForm) return;

              handleConfirmModal({
                NAME_GP: unitMapValues.name,
                file: state.files[0],
              });
              handleCloseModal();
            }}
          >
            {t('salvarEdicao')}
          </Button>
        )}
      </UnitMapFooter>
    </UnitMapModalStyled>
  );
};

import {
  useEffect,
  useState,
  SetStateAction,
  Dispatch,
} from 'react';
import { toast } from 'react-toastify';
import { Box } from 'reflexbox';
import {
  Button,
  Input,
  Loader,
  ModalWindow,
} from 'components';
import { useStateVar } from 'helpers/useStateVar';
import { apiCall, apiCallFormData } from 'providers';
import { useParams, useHistory } from 'react-router-dom';
import { t } from 'i18next';
import { Select as SelectNew } from 'components/NewSelect';
import SelectSearch, { fuzzySearch } from 'react-select-search';
import {
  Label,
  SearchInput,
  DocumentationContainerArea,
  DocumentationContainer,
  ItemDoc,
  InibVisibilityAddDoc,
  EditAreaDocs,
  CustomInput,
} from './styles';
import OlhoFechado from '~/icons/OlhoFechado';
import OlhoAberto from '~/icons/OlhoAberto';
import { PenBlue, TrashSample } from '~/icons';
import { DropzoneArea } from '~/components/Dropzone';
import Checkbox from '@material-ui/core/Checkbox';

export default function GeneralData(props: Readonly<{
  unitId: number, unit_code_celsius: string, unit_code_api: string, timezoneUnitId: number, production: boolean, constructedArea?: number, amountPeople?: number,
}>): JSX.Element {
  const routeParams = useParams<{ unitId: string }>();
  const [files, setFiles] = useState<File[]>([]);
  const [state, render, setState] = useStateVar({
    unitId: Number(routeParams.unitId),
    unit_code_celsius: props.unit_code_celsius,
    unit_code_api: props.unit_code_api,
    isLoading: false,
    selectedTimezone: [] as any | any [],
    timezonesOptions: [] as { name: string, value: number }[],
    production: props.production,
    isLoadingModalAdd: false,
    originalDocs: [] as {
      UNIT_SKETCH_ID: number;
      FILENAME: string;
      IS_VISIBLE: boolean;
      SKETCH_NAME: string;
    }[],
    documentations: [] as {
      UNIT_SKETCH_ID: number;
      FILENAME: string;
      IS_VISIBLE: boolean;
      SKETCH_NAME: string;
    }[],
    deleteDocs: {} as {
      UNIT_SKETCH_ID: number;
      FILENAME: string;
      IS_VISIBLE: boolean;
      SKETCH_NAME: string;
    },
    numberDeleteDocs: [] as number[],
    modalEdit: false,
    modalAddDocs: false,
    modalDeleteDoc: false,
    checkInibVisibility: false,
    editDoc: {} as {
      UNIT_SKETCH_ID: number;
      FILENAME: string;
      IS_VISIBLE: boolean;
      SKETCH_NAME: string;
    },
    editDocsList: [] as {
      UNIT_SKETCH_ID: number;
      FILENAME: string;
      IS_VISIBLE: boolean;
      SKETCH_NAME: string;
    }[],
    deleteDocsList: [] as {
      UNIT_SKETCH_ID: number;
      FILENAME: string;
      IS_VISIBLE: boolean;
      SKETCH_NAME: string;
    }[],
    addDocsList: [] as {
      UNIT_SKETCH_ID: number;
      FILENAME: string;
      IS_VISIBLE: boolean;
      SKETCH_NAME: string;
      FILE: File,
    }[],
    isChangeName: false,
    constructedArea: props.constructedArea,
    numberPeople: props.amountPeople?.toString(),
  });

  const unitStatus = [
    t('emInstalacao'),
    t('emOperacao'),
  ];

  const history = useHistory();

  function onStatusUnitSelected(item) {
    if (item === t('emOperacao')) {
      console.log('em producao');
      state.production = true;
    } else if (item === t('emInstalacao')) {
      console.log('em instalacao');
      state.production = false;
    } else {
      console.log('erro');
    }
    render();
  }

  async function getTimeZonesOptions() {
    try {
      const { list: timezonesList } = await apiCall('/get-timezones-list-with-offset', {});

      state.timezonesOptions = timezonesList.map((timezoneItem) => ({
        name: `${timezoneItem.area} ( ${timezoneItem.offset} )`,
        value: timezoneItem.id,
      }));
      if (props.timezoneUnitId) {
        const filteredTimezone = timezonesList.find((timezone) => timezone.id === props.timezoneUnitId);
        if (filteredTimezone) {
          state.selectedTimezone = filteredTimezone.id;
          render();
        }
      }
    } catch (err) {
      console.log(err);
      toast.error(t('erroObterFusoHorarios'));
    }
  }

  function verifyExistNameSketch(a, b) {
    if (a.SKETCH_NAME !== null && b.SKETCH_NAME !== null) {
      return a.SKETCH_NAME.localeCompare(b.SKETCH_NAME);
    }
    return a.FILENAME.localeCompare(b.FILENAME);
  }

  function setDocumentations(sketchesList: {
    UNIT_SKETCH_ID: number;
    FILENAME: string;
    IS_VISIBLE: boolean;
    SKETCH_NAME: string;
}[]) {
    const sortedDocs = sketchesList.map((item) => item).sort((a, b) => verifyExistNameSketch(a, b));
    setState({ documentations: sortedDocs });
    setState({ originalDocs: sortedDocs });
  }

  async function getDocsUnit() {
    try {
      const { list: sketchesList } = await apiCall('/upload-service/get-sketches-list', { unitId: Number(routeParams.unitId) });
      const sketchesFormatted = sketchesList.map((item) => ({ ...item, UNIT_SKETCH_ID: item.ID }));
      setDocumentations(sketchesFormatted);
    } catch (err) {
      console.log(err);
      toast.error(t('erroBuscarDocumentacoes'));
    }
  }

  async function sendArrayEditUnit(timezoneId) {
    try {
      await apiCall('/clients/edit-unit', {
        UNIT_ID: props.unitId,
        TIMEZONE_ID: timezoneId,
        PRODUCTION: state.production,
        UNIT_CODE_CELSIUS: state.unit_code_celsius,
        UNIT_CODE_API: state.unit_code_api,
        ...(state.constructedArea?.toString() !== '' ? { CONSTRUCTED_AREA: state.constructedArea?.toString() } : { CONSTRUCTED_AREA: null }),
        ...(state.numberPeople?.toString() !== '' ? { AMOUNT_PEOPLE: state.numberPeople?.toString() } : { AMOUNT_PEOPLE: null }),
      });
    } catch (err) {
      console.log(err);
      toast.error(t('erroEditarUnidade'));
    }
  }

  async function saveTimezone(timezoneId) {
    setState({ isLoading: true });

    if (state.constructedArea && state.constructedArea <= 0) {
      toast.error(t('areaConstruidaMaiorQueZero'));
      setState({ isLoading: false });
      return;
    }
    if (state.numberPeople && (Number(state.numberPeople) <= 0 || Number.isNaN(Number(state.numberPeople)) || !Number.isInteger(Number(state.numberPeople)))) {
      toast.error(t('numeroPessoasDeveSerUmNumeroInteiro'));
      setState({ isLoading: false });
      return;
    }
    try {
      if (timezoneId || state.production || props.unitId) {
        await sendArrayEditUnit(timezoneId);
        await configArrayToSendAddDocs();
        await configArrayToEditSent();
        await configArrayToDeleteSend();
        history.push(`/analise/unidades/perfil/${props.unitId}`);
        toast.success(t('sucessoEditarUnidade'));
      } else {
        return;
      }
    } catch (err) { console.log(err); toast.error(t('houveErro')); }
    setState({ isLoading: false });
  }

  async function configArrayToDeleteSend() {
    if (state.deleteDocsList.length > 0) {
      try {
        await Promise.all(
          state.deleteDocsList.map(async (item) => {
            await apiCall('/upload-service/delete-sketch', { unitId: state.unitId, filename: item.FILENAME });
          }),
        );
        toast.success(t('sucessoDeletarDocumentacao'));
      } catch (err) {
        console.log(err);
        toast.error(t('erroDeletarDoc'));
      }
      setState({ isLoadingModalAdd: false });
    }
  }

  async function configArrayToSendAddDocs() {
    if (state.addDocsList.length > 0) {
      try {
        await Promise.all(
          state.addDocsList.map(async (doc) => {
            await apiCallFormData('/upload-service/upload-sketch', { unitId: state.unitId, isVisible: doc.IS_VISIBLE, nameSketch: doc.FILENAME }, { file: doc.FILE });
          }),
        );
        toast.success(t('arquivosAdicionadosComSucesso'));
      } catch (err) {
        console.log(err);
        toast.error(t('erroAoAdicionarNovoArquivo'));
      }
      setState({ isLoadingModalAdd: false });
    }
  }

  async function configArrayToEditSent() {
    if (state.editDocsList.length > 0) {
      try {
        await apiCall('/upload-service/edit-sketch',
          {
            sketchList: state.editDocsList.map((item) => (
              {
                unitSketchId: item.UNIT_SKETCH_ID,
                filename: item.FILENAME,
                isVisible: item.IS_VISIBLE || item.IS_VISIBLE,
                nameSketch: item.SKETCH_NAME || item.SKETCH_NAME,
              }
            )),
            unitId: state.unitId,
          });
        toast.success(t('arquivoEditadoComSucesso'));
      } catch (err) {
        console.log(err);
        toast.error(t('erroAoEditarArquivo'));
      }
      setState({ isLoadingModalAdd: false });
    }
  }

  function addDeleteInList() {
    const hasItem = state.addDocsList.filter((doc) => state.deleteDocs.UNIT_SKETCH_ID !== doc.UNIT_SKETCH_ID);
    if (hasItem.length !== state.addDocsList.length) {
      setState({ addDocsList: hasItem });
    } else {
      setState({ deleteDocsList: [...state.deleteDocsList, state.deleteDocs] });
    }
    setState({ documentations: state.documentations.filter((item) => item.UNIT_SKETCH_ID !== state.deleteDocs.UNIT_SKETCH_ID) });
    state.modalDeleteDoc = false;
  }

  useEffect(() => {
    getTimeZonesOptions();
    getDocsUnit();
  }, []);

  return (
    <>
      <Box width={[1, 1, 1, 1, 1, 1 / 3]} ml={[0, 0, 0, 0, 0, 2]}>
        <div style={{ paddingTop: '10px' }} />
        <CustomInput>
          <Input
            style={{ marginBottom: '20px', width: '100%' }}
            type="number"
            value={state.constructedArea?.toString() ?? ''}
            placeholder={t('digiteOValorEmM')}
            label={t('areaConstruida')}
            onChange={(event) => {
              state.constructedArea = Number(event.target.value);
              render();
            }}
            handleKeyPress={(event) => {
              const key = String.fromCharCode(event.which);
              if (key === '.') {
                event.preventDefault();
              }
            }}
            suffix="m²"
          />
        </CustomInput>
        <CustomInput style={{ marginTop: '20px' }}>
          <Input
            style={{ marginBottom: '20px', width: '100%' }}
            value={state.unit_code_celsius?.toString() ?? ''}
            placeholder={t('digitarCodigo')}
            label={t('codigoDaUnidadeCelsius')}
            onChange={(event) => {
              state.unit_code_celsius = event.target.value;
              render();
            }}
          />
        </CustomInput>
        <CustomInput style={{ marginTop: '20px' }}>
          <Input
            style={{ marginBottom: '20px', width: '100%' }}
            value={state.unit_code_api?.toString() ?? ''}
            placeholder={t('digitarCodigo')}
            label={t('codigoDaUnidadeApi')}
            onChange={(event) => {
              state.unit_code_api = event.target.value;
              render();
            }}
          />
        </CustomInput>
        <div style={{ paddingTop: '10px' }} />
        <SearchInput style={{ width: '100%', marginBottom: '20px', border: '1px solid #818181' }}>
          <div style={{ width: '100%', paddingTop: 2, paddingBottom: 3 }}>
            <Label>{t('fusoHorario')}</Label>
            <SelectSearch
              options={state.timezonesOptions}
              value={state.selectedTimezone}
              printOptions="on-focus"
              search
              filterOptions={fuzzySearch}
              placeholder={t('fusoHorario')}
              // eslint-disable-next-line react/jsx-no-bind
              onChange={(value) => { state.selectedTimezone = value; render(); }}
            />
          </div>
        </SearchInput>
        <div style={{ paddingTop: '10px' }} />
        <SelectNew
          style={{ width: '100%', height: '80px', fontSize: 12 }}
          options={unitStatus}
          value={state.production ? t('emOperacao') : t('emInstalacao')}
          label={t('statusDaUnidade')}
          placeholder={t('selecioneOStatusDaUnidade')}
          disabled={props.production}
          onSelect={
            (e) => {
              onStatusUnitSelected(e);
            }
          }
        />
        <CustomInput style={{ marginTop: '20px' }}>
          <Input
            style={{ marginBottom: '20px', width: '100%' }}
            type="number"
            value={state.numberPeople?.toString() ?? ''}
            placeholder={t('numeroPessoas')}
            label={t('numeroPessoas')}
            onChange={(event) => {
              state.numberPeople = event.target.value;
              render();
            }}
          />
        </CustomInput>
      </Box>
      <div style={{ paddingTop: '20px' }} />
      <Box width={[1, 1, 1, 1, 1, 1 / 2]} ml={[0, 0, 0, 0, 0, 2]}>
        <DocumentationContainerArea>
          <h4>{t('documentacao')}</h4>
          <DocumentationContainer>
            {
              state.documentations.length > 0 && state.documentations.map((item, index) => (
                <ItemDocElement
                  key={`${item.FILENAME} ${item.UNIT_SKETCH_ID} ${item.SKETCH_NAME}`}
                  item={item}
                  index={index}
                  setState={setState}
                  state={state}
                  render={render}
                />
              ))
            }
          </DocumentationContainer>
          <div style={{ display: 'flex', justifyContent: 'end' }}>
            <Button
              variant="blue"
              style={{ maxWidth: '100%', width: '240px', padding: '5px' }}
              onClick={() => { setState({ modalAddDocs: true }); }}
            >
              {t('adicionarDocumento')}
            </Button>
          </div>
        </DocumentationContainerArea>
      </Box>
      <Box width={[1, 1, 1, 1, 1, 1 / 4]} ml={[0, 0, 0, 0, 0, 2]} style={{ marginTop: '50px' }}>
        <Button style={{ width: '120px' }} onClick={() => saveTimezone(state.selectedTimezone)} variant={state.isLoading ? 'disabled' : 'primary'}>
          {t('botaoSalvar')}
        </Button>
      </Box>
      {
        state.modalAddDocs && <ModalSetInfo setFiles={setFiles} files={files} state={state} setState={setState} render={render} type="add" />
      }
      {
        state.modalEdit && <ModalSetInfo setFiles={setFiles} files={files} state={state} setState={setState} render={render} type="edit" />
      }
      {
        state.modalDeleteDoc && (
          <>
            <ModalWindow
              borderTop
              style={{
                padding: '0px',
                marginBottom: 'auto',
                marginTop: '8%',
                width: '450px',
                zIndex: 5,
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
              }}
              >
                <h4 style={{ margin: '22px' }}>
                  Tem certeza que deseja deletar o documento:
                </h4>
                <p>{state.deleteDocs.SKETCH_NAME ? state.deleteDocs.SKETCH_NAME : state.deleteDocs.FILENAME}</p>
              </div>
              <InibVisibilityAddDoc>
                <section>
                  <h6 onClick={() => { setState({ modalDeleteDoc: false }); }}>{t('cancelar')}</h6>
                  <Button variant={state.isLoadingModalAdd ? 'disabled' : 'blue'} onClick={() => { addDeleteInList(); render(); }}>
                    { state.isLoadingModalAdd ? <Loader size="small" /> : t('deletarDocumento')}
                  </Button>
                </section>
              </InibVisibilityAddDoc>
            </ModalWindow>
          </>
        )
      }
    </>
  );
}

type DocsItemProps = {
  item: {
    UNIT_SKETCH_ID: number;
    FILENAME: string;
    IS_VISIBLE: boolean;
    SKETCH_NAME: string;
  }
  index: number,
  setState: (o: any) => void,
  render: () => void
  state: any,
}

function ItemDocElement({
  item,
  setState,
  state,
  render,
}: DocsItemProps) {
  function filterExtension(name: string) {
    const splitString = name?.split('.');
    if (splitString) {
      splitString.pop();
      const newString = splitString.toString().replace(',', '');
      return newString;
    }
    return '';
  }

  function editMap(docs) {
    if (item.UNIT_SKETCH_ID === docs.UNIT_SKETCH_ID) {
      return ({ ...docs, IS_VISIBLE: !item.IS_VISIBLE });
    }
    return ({ ...docs });
  }

  async function setVisibility() {
    const hasItem = state.addDocsList.filter((doc) => item.UNIT_SKETCH_ID !== doc.UNIT_SKETCH_ID);
    if (hasItem.length !== state.addDocsList.length) {
      setState({ addDocsList: [...hasItem, { ...item, IS_VISIBLE: item.IS_VISIBLE ? 1 : 0 }] });
    }
    else if (state.editDocsList.length > 0) {
      const newEditDocs = state.editDocsList.find((doc) => doc.UNIT_SKETCH_ID === item.UNIT_SKETCH_ID);
      if (newEditDocs) {
        const newEditDocsList = state.editDocsList.map((docs) => editMap(docs));
        setState({ editDocsList: newEditDocsList });
      } else {
        setState({ editDocsList: [...state.editDocsList, { ...item, IS_VISIBLE: !item.IS_VISIBLE }] });
      }
    } else {
      setState({ editDocsList: [...state.editDocsList, { ...item, IS_VISIBLE: !item.IS_VISIBLE }] });
    }
    const newDocumentations = state.documentations.map((docs) => editMap(docs));
    setState({ documentations: newDocumentations });
    render();
  }

  return (
    <>
      <ItemDoc>
        <div onClick={() => { setVisibility(); }}>
          {item.IS_VISIBLE ? <OlhoAberto /> : <OlhoFechado />}
        </div>
        <p>{item.SKETCH_NAME ? item.SKETCH_NAME : item.FILENAME}</p>
        <div>
          <div onClick={() => {
            setState({ modalEdit: true });
            setState({
              editDoc: {
                UNIT_SKETCH_ID: item.UNIT_SKETCH_ID,
                FILENAME: item.FILENAME,
                IS_VISIBLE: item.IS_VISIBLE,
                SKETCH_NAME: filterExtension(item.SKETCH_NAME),
              },
            });
          }}
          >
            <PenBlue />
          </div>
          <div onClick={() => { setState({ modalDeleteDoc: true }); setState({ deleteDocs: item }); }}>
            <TrashSample />
          </div>
        </div>
      </ItemDoc>
    </>
  );
}

type TModalSet = {
  files: File[],
  setFiles: Dispatch<SetStateAction<File[]>>
  state: any,
  setState: (o: any) => void,
  render: () => void,
  type: string
}

function ModalSetInfo({
  files,
  setFiles,
  state,
  setState,
  render,
  type,
}: TModalSet) {
  const [checkInibVisibility, setCheckInibVisibility] = useState(state.editDoc.IS_VISIBLE === 0 ? 0 : 1);
  let Title = '';
  if (type === 'add') {
    Title = t('AdicionarNovoDocumento');
  } else if (type === 'edit') {
    Title = t('EditarDocumento');
  }

  function configArrayToSend() {
    const newFiles = [] as {
      UNIT_SKETCH_ID: string;
      FILENAME: string;
      IS_VISIBLE: number;
      SKETCH_NAME: string;
      FILE: File,
    }[];
    if (files) {
      for (const file of files) {
        const isVisible = checkInibVisibility === 0 ? 0 : 1;
        newFiles.push({
          IS_VISIBLE: isVisible,
          FILENAME: file.name,
          SKETCH_NAME: file.name,
          UNIT_SKETCH_ID: `${state.unitId.toString()}${file.size}${file.name}${file.lastModified}`,
          FILE: file,
        });
      }
      setState({ addDocsList: [...state.addDocsList, ...newFiles] });
      const sortedDocs = [...state.documentations, ...newFiles].sort((a, b) => a.SKETCH_NAME.localeCompare(b.SKETCH_NAME));
      setState({ documentations: sortedDocs });
      setFiles([]);
    }
    setState({ modalAddDocs: false });
    setState({ isLoadingModalAdd: false });
  }

  function editMap(docs, item) {
    if (item.UNIT_SKETCH_ID === docs.UNIT_SKETCH_ID) {
      return ({ ...docs, SKETCH_NAME: state.editDoc.SKETCH_NAME, IS_VISIBLE: checkInibVisibility === 0 ? 0 : 1 });
    }
    return ({ ...docs });
  }

  function configArrayToEditSent() {
    state.isLoadingModalAdd = true;
    const extension = state.editDoc.FILENAME.split('.');
    setState({
      editDoc: {
        UNIT_SKETCH_ID: state.editDoc.UNIT_SKETCH_ID,
        FILENAME: state.editDoc.FILENAME,
        IS_VISIBLE: checkInibVisibility === 0 ? 0 : 1,
        SKETCH_NAME: `${state.editDoc.SKETCH_NAME}.${extension[extension.length - 1]}`,
      },
    });
    const hasItem = state.addDocsList.filter((doc) => state.editDoc.UNIT_SKETCH_ID !== doc.UNIT_SKETCH_ID);
    if (hasItem.length !== state.addDocsList.length) {
      setState({ addDocsList: [...hasItem, { ...state.editDoc, IS_VISIBLE: state.editDoc.IS_VISIBLE }] });
    }
    else if (state.editDocsList.length > 0) {
      const newEditDocs = state.editDocsList.find((doc) => doc.UNIT_SKETCH_ID === state.editDoc.UNIT_SKETCH_ID);
      if (newEditDocs) {
        const newEditDocsList = state.editDocsList.map((docs) => editMap(docs, state.editDoc));
        setState({ editDocsList: newEditDocsList });
      } else {
        setState({ editDocsList: [...state.editDocsList, { ...state.editDoc, IS_VISIBLE: state.editDoc.IS_VISIBLE }] });
      }
    } else {
      setState({ editDocsList: [...state.editDocsList, { ...state.editDoc, IS_VISIBLE: state.editDoc.IS_VISIBLE }] });
    }
    const newDocumentations = state.documentations.map((docs) => editMap(docs, state.editDoc));
    setState({ documentations: newDocumentations });
    render();
    setState({ modalEdit: false });
    setState({ isLoadingModalAdd: false });
  }

  function decideFunction() {
    if (type === 'add') {
      configArrayToSend();
    } else if (type === 'edit') {
      configArrayToEditSent();
    }
  }

  function decideButton() {
    if (type === 'add') {
      return t('carregarDocumento');
    }
    if (type === 'edit') {
      return t('atualizarDocumento');
    }
    return '';
  }

  function cancelButton() {
    if (type === 'add') {
      setFiles([]);
      setState({ modalAddDocs: false });
    }
    if (type === 'edit') {
      setState({ modalEdit: false });
      setState({ modalEdit: false });
    }
    return '';
  }

  function changeName(e) {
    setState({
      editDoc: {
        ...state.editDoc,
        SKETCH_NAME: e.target.value,
      },
    });
  }

  return (
    <ModalWindow
      borderTop
      style={{
        padding: '0px',
        marginBottom: 'auto',
        marginTop: '8%',
        width: '450px',
        zIndex: 5,
      }}
    >
      <h3 style={{ margin: '22px', fontWeight: 'bold' }}>{Title}</h3>
      { type === 'add' && <DropzoneArea maxFiles={5} fileDropped={setFiles} files={files} extensions={{ 'image/*': ['.jpeg', '.png', '.jpg', '.bmp', '.pdf', '.xlsx', '.cad', '.doc', '.docx', '.xls', '.ppt', '.pptx', '.pages', '.odt', '.rtf'] }} />}
      { type === 'edit' && (
        <EditAreaDocs>
          {
            state.isChangeName
              ? <textarea onChange={changeName} defaultValue={state.editDoc.SKETCH_NAME} rows={4} cols={40} />
              : <p style={{ margin: '0px' }}>{state.editDoc.SKETCH_NAME ? state.editDoc.SKETCH_NAME : state.editDoc.FILENAME}</p>
          }
          {/* <p style={{ margin: '0px' }}>{state.editDoc.SKETCH_NAME ? state.editDoc.SKETCH_NAME : state.editDoc.FILENAME}</p> */}
          <div onClick={() => { setState({ isChangeName: !state.isChangeName }); }}>
            <PenBlue />
          </div>
        </EditAreaDocs>
      )}
      <InibVisibilityAddDoc>
        <div>
          <Checkbox
            checked={!checkInibVisibility}
            onClick={() => {
              setCheckInibVisibility(checkInibVisibility === 0 ? 1 : 0);
            }}
            style={{ marginLeft: '-10px', width: '10px', height: '10px' }}
            color="primary"
          />
          <p>{t('inibirVisibilityDocs')}</p>
        </div>
        <section>
          <h6 onClick={() => { cancelButton(); }}>{t('cancelar')}</h6>
          <Button variant={state.isLoadingModalAdd ? 'disabled' : 'blue'} onClick={() => { decideFunction(); render(); }}>
            { state.isLoadingModalAdd ? <Loader size="small" /> : decideButton()}
          </Button>
        </section>
      </InibVisibilityAddDoc>
    </ModalWindow>
  );
}

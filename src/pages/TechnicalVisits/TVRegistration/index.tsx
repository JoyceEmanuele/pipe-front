import { useEffect, useState, useRef } from 'react';

import {
  Checkbox, Switch, CheckboxOptionType,
} from 'antd';
import { CheckboxValueType } from 'antd/lib/checkbox/Group';
import moment from 'moment';
import { MdFileUpload } from 'react-icons/md';
import { Link, useHistory, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import { Button, Loader } from '~/components';
import { LoadingSpinner } from '~/components/LoadingSpinner';
import { InputDate } from '~/components/NewInputs/Date';
import { InputHour } from '~/components/NewInputs/Hour';
import { InputNumber } from '~/components/NewInputs/Number';
import { TextArea } from '~/components/NewInputs/TextArea';
import { Select } from '~/components/NewSelect';
import { GetClientsListType } from '~/metadata/GetClientsList';
import { GetTechnicalVisitInfoResponse } from '~/metadata/GetTechnicalVisitInfo';
import { GetUnitsBasicListType } from '~/metadata/GetUnitListBasic';
import { GetUsersListType } from '~/metadata/GetUsersList';
import { apiCall, apiCallFormData } from '~/providers';
import { colors } from '~/styles/colors';

import { DefaultCard } from '../components/StyledComponents';
import { PhotoBox } from './components/PhotoBox';
import {
  Content, Title, Col, ColSection, SectionTitle, SectionDescription, UploadPhotoBtn, Footer, ClimatizationValueBox, ClimatizationSwitchContainer, ClimatizationParameterContainer,
} from './styles';

const IDENTIFICADOR_DA_CARACTERISTICA_DE_REFRIGERACAO = 1;

type FieldsValidation = {
  client?: string;
  unit?: string;
  technician?: string;
  date?: string;
  time?: string;
  company?: string;
}

export const TVRegistration = (): JSX.Element => {
  const history = useHistory();
  const { id: technicalVisitId } = useParams<{ id }>();
  const [technicalVisitData, setTechnicalVisitData] = useState<GetTechnicalVisitInfoResponse & { COMPANY?: number }>();
  const [isLoading, setIsLoading] = useState(false);
  const [availableClients, setAvailableClients] = useState<GetClientsListType[]>([]);
  const [choosenClient, setChoosenClient] = useState<GetClientsListType>();
  const previousChoosenCompany = useRef<number>();
  const [availableUnits, setAvailableUnits] = useState<GetUnitsBasicListType[]>([]);
  const [choosenUnit, setChoosenUnit] = useState<GetUnitsBasicListType>();
  const [availableTvCharacteristics, setAvailableTvCharacteristics] = useState<CheckboxOptionType[]>([]);
  const [choosenTvCharacteristics, setChoosenTvCharacteristics] = useState<CheckboxValueType[]>([]);
  const [canSelectQuantityOfEnvironments, setCanSelectQuantityOfEnvironments] = useState(false);
  const [quantityOfEnvironments, setQuantityOfEnvironments] = useState(1);
  const [canSelectQuantityOfMachines, setCanSelectQuantityOfMachines] = useState(false);
  const [quantityOfMachines, setQuantityOfMachines] = useState(1);
  const [blueprintPictures, setBlueprintPictures] = useState<{ label: string; value: string }[]>([]);
  const [autorizationPictures, setAutorizationPictures] = useState<{ label: string; value: string }[]>([]);
  const [availableTechnicalUsers, setAvailableTechnicalUsers] = useState<GetUsersListType[]>([]);
  const [choosenTechnicalUser, setChoosenTechnicalUser] = useState<GetUsersListType>();
  const [choosenTVDate, setChoosenTVDate] = useState<moment.Moment>(moment());
  const [choosenTVScheduledTime, setChoosenTVScheduleTime] = useState<string>('10:00h');
  const [observations, setObservations] = useState<string>();
  const [fieldsValidation, setFieldsValidation] = useState<FieldsValidation>({});
  const [clientsMant, setClientsMant] = useState<GetClientsListType[]>([]);
  const [choosenCompany, setChoosenCompany] = useState<GetClientsListType>();

  useEffect(() => {
    getDefaultData();
  }, []);

  useEffect(() => {
    if (choosenClient) {
      if (!technicalVisitData) {
        handleClientChange();
      }
    }
  }, [choosenClient]);

  useEffect(() => {
    if (choosenCompany) {
      if (!technicalVisitData) {
        handleCompanyChange();
      } else if (previousChoosenCompany.current !== technicalVisitData.COMPANY) {
        handleCompanyChange();
      }

      previousChoosenCompany.current = choosenCompany.CLIENT_ID;
    }
  }, [choosenCompany]);

  const getDefaultData = async () => {
    try {
      setIsLoading(true);
      const { list: listOfClients } = await apiCall('/clients/get-clients-list', { withManagerPermission: true });
      const listOfTvCharacteristics = (await apiCall('/vt/list-vt-caracteristicas', { STATUS_ID: [] })).map((characteristic) => ({ label: characteristic.CHARACTERISTIC, value: characteristic.ID }));
      const filteredListOfTvCharacteristics = listOfTvCharacteristics.filter((characteristic) => !['Automação', 'Instalação'].includes(characteristic.label));
      setClientsMant(listOfClients.filter((x) => x.PERMS_C && x.PERMS_C.includes('[M]')));
      setAvailableClients(listOfClients.filter((x) => x.PERMS_C && x.PERMS_C.includes('[C]')));
      setAvailableTvCharacteristics(filteredListOfTvCharacteristics);
      if (technicalVisitId) {
        await getTechnicalVisitData(listOfClients);
      }
    } catch {
      toast.error('Ocorreu um erro.');
    } finally {
      setIsLoading(false);
    }
  };

  const getTechnicalVisitData = async (listOfClients: GetClientsListType[]) => {
    // Fetching required data
    const technicalVisitInfo = await apiCall('/vt/get-vt-info', { ID: technicalVisitId });
    const { list: listOfUnits } = await apiCall('/clients/get-units-list-basic', { CLIENT_ID: technicalVisitInfo.CLIENT_ID });
    const { list: listOfUsers } = await apiCall('/users/list-users', { CLIENT_ID: choosenCompany?.CLIENT_ID });

    // Setting other required states
    const technicalUser = listOfUsers.find((user) => user.USER === technicalVisitInfo.TECNICO_ID);
    setTechnicalVisitData(technicalVisitInfo);
    setAvailableUnits(listOfUnits);
    setAvailableTechnicalUsers(listOfUsers.filter((user) => (user.PERMS_U && user.PERMS_U.includes('[T]'))));

    // Filling the technical visit input's with the correct data
    setChoosenClient(listOfClients.find((client) => client.CLIENT_ID === technicalVisitInfo.CLIENT_ID));
    setChoosenUnit(listOfUnits.find((unit) => unit.UNIT_ID === technicalVisitInfo.UNIT_ID));
    setChoosenCompany(listOfClients.find((client) => client.CLIENT_ID === technicalUser?.CLIENT_BIND));
    setChoosenTechnicalUser(technicalUser);
    setChoosenTVDate(moment(technicalVisitInfo.VTDATE));
    setChoosenTVScheduleTime(technicalVisitInfo.VTTIME);
    if (technicalVisitInfo.AMBIENTES) {
      setCanSelectQuantityOfEnvironments(true);
      setQuantityOfEnvironments(technicalVisitInfo.AMBIENTES);
    }
    if (technicalVisitInfo.MAQUINAS) {
      setCanSelectQuantityOfMachines(true);
      setQuantityOfMachines(technicalVisitInfo.MAQUINAS);
    }
    if (technicalVisitInfo.CARACTERISTICA && technicalVisitInfo.CARACTERISTICA.length > 0) {
      setChoosenTvCharacteristics(technicalVisitInfo.CARACTERISTICA);
    }
    if (technicalVisitInfo.PLANTABAIXA_IMG && technicalVisitInfo.PLANTABAIXA_IMG.length > 0) {
      setBlueprintPictures(technicalVisitInfo.PLANTABAIXA_IMG.map((picture) => ({
        label: picture.split('vt_images')[1].trim(),
        value: picture,
      })));
    }
    if (technicalVisitInfo.AUTORIZACAO_IMG && technicalVisitInfo.AUTORIZACAO_IMG.length > 0) {
      setAutorizationPictures(technicalVisitInfo.AUTORIZACAO_IMG.map((picture) => ({
        label: picture.split('vt_images')[1].trim(),
        value: picture,
      })));
    }
    if (technicalVisitInfo.OBSERVACAO) setObservations(technicalVisitInfo.OBSERVACAO);
  };

  const handleClientChange = async () => {
    try {
      setIsLoading(true);
      const { list: listOfUnits } = await apiCall('/clients/get-units-list-basic', { CLIENT_ID: choosenClient?.CLIENT_ID });
      setAvailableUnits(listOfUnits);
      setChoosenUnit(undefined);
    } catch {
      toast.error('Ocorreu um erro.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompanyChange = async () => {
    try {
      setIsLoading(true);
      const { list: listOfUsers } = await apiCall('/users/list-users', { CLIENT_ID: choosenCompany?.CLIENT_ID });
      setAvailableTechnicalUsers(listOfUsers.filter((user) => (user.PERMS_U && user.PERMS_U.includes('[T]'))));
      setChoosenTechnicalUser(undefined);
    } catch (error) {
      toast.error('Ocorreu um erro.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePictureFileSelection = (type: 'blueprint' | 'autorization') => {
    const htmlNode: any = document.getElementById(`${type}-file-input`);
    if (htmlNode !== null) {
      htmlNode.onchange = (e) => {
        if (htmlNode.files.length === 1) {
          const reader = new FileReader();
          reader.addEventListener(
            'load',
            () => {
              const filename = htmlNode.files[0].name.split('.');
              if (!['jpg', 'jpeg', 'png'].includes(filename[1])) {
                toast.error('Os formatos válidos são: JPG, JPEG, PNG!');
                return;
              }
              const fileIdentifier = Math.floor(Math.random() * 1000).toString();
              const newFilename = `IMG_${fileIdentifier.length >= 4 ? fileIdentifier : new Array(4 - fileIdentifier.length + 1).join('0') + fileIdentifier}.${filename[1]}`;
              const file = { label: newFilename, value: String(reader.result) };
              if (type === 'blueprint') {
                setBlueprintPictures([...blueprintPictures, file]);
              } else {
                setAutorizationPictures([...autorizationPictures, file]);
              }
            },
            false,
          );
          reader.readAsDataURL(htmlNode.files[0]);
        }
      };
      htmlNode.onclick = (e) => {
        e.target.value = '';
      };

      htmlNode.click();
    }
  };

  const handlePictureDeleteRequest = (picture: { label: string, value: string }, type: 'blueprint' | 'autorization') => {
    if (type === 'blueprint') {
      const newBlueprintPictures = blueprintPictures.filter((item) => item !== picture);
      setBlueprintPictures(newBlueprintPictures);
    } else {
      const newAutorizationPictures = autorizationPictures.filter((item) => item !== picture);
      setAutorizationPictures(newAutorizationPictures);
    }
  };

  const validateFields = () => {
    const validation: FieldsValidation = {};
    if (!choosenClient) validation.client = 'O campo de cliente é necessário';
    if (!choosenUnit) validation.unit = 'O campo de unidade é necessário';
    if (!choosenTVDate) validation.date = 'O campo de data é necessário';
    if (!choosenTVScheduledTime) validation.time = 'O campo de horário é necessário';
    if (!choosenTechnicalUser) validation.technician = 'O campo de técnico é necessário';
    const doesDataIsValid = Object.values(validation).filter((item) => item !== undefined).length === 0;
    if (!doesDataIsValid) setFieldsValidation(validation);
    return doesDataIsValid;
  };

  const handleSubmit = async () => {
    try {
      if (!validateFields()) {
        toast.error('Dados inválidos.');
        return;
      }

      setIsLoading(true);

      const defaultData = {
        CLIENT_ID: String(choosenClient?.CLIENT_ID || ''),
        UNIT_ID: String(choosenUnit?.UNIT_ID || ''),
        TECNICO_ID: choosenTechnicalUser?.USER || '',
        VTDATE: choosenTVDate.format('YYYY-MM-DD'),
        VTTIME: choosenTVScheduledTime,
        AMBIENTES: String(canSelectQuantityOfEnvironments ? quantityOfEnvironments : 0),
        MAQUINAS: String(canSelectQuantityOfMachines ? quantityOfMachines : 0),
        CARACTERISTICA: (choosenTvCharacteristics && choosenTvCharacteristics.map((x) => String(x))) || '',
        OBSERVACAO: observations || '',
      };
      const files = {
        PLANTABAIXA_IMG: blueprintPictures.map((picture) => picture.value),
        AUTORIZACAO_IMG: autorizationPictures.map((picture) => picture.value),
      };

      if (technicalVisitId) {
        await apiCallFormData('/vt/update-vt-info', { ...defaultData, ID: technicalVisitId }, files);
        toast.success('Visita técnica editada com sucesso!');
      } else {
        await apiCallFormData('/vt/set-vt-info', defaultData, files);
        toast.success('Visita técnica cadastrada com sucesso!');
      }

      history.goBack();
    } catch (err) {
      toast.error(`Não possível ${technicalVisitId ? 'editar' : 'registrar'} a visita técnica.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DefaultCard>
      {
        autorizationPictures.length > 0 && (
          <span>Tem foto da autorização</span>
        )
      }
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <Title>{`${technicalVisitId ? 'Editar' : 'Criar Nova'} VT`}</Title>
        {
          technicalVisitId && (
            <span style={{ fontSize: 12, color: colors.Blue700 }}>
              ID VT
              <b>{` ${technicalVisitId}`}</b>
            </span>
          )
        }
      </div>
      <Content>
        <LoadingSpinner variant="primary" loading={isLoading} />
        <Col>
          <Select
            label="Cliente"
            placeholder="Selecione os cliente"
            options={availableClients}
            propLabel="NAME"
            value={choosenClient}
            error={fieldsValidation.client}
            onSelect={(item) => {
              setChoosenClient(item);
              if (item) setFieldsValidation({ ...fieldsValidation, client: undefined });
              else setFieldsValidation({ ...fieldsValidation, client: 'O campo de cliente é necessário' });
            }}
            notNull
            style={{ width: '100%', marginBottom: 20 }}
          />

          <Select
            label="Unidade"
            placeholder="Selecione a unidade"
            options={availableUnits}
            propLabel="UNIT_NAME"
            value={choosenUnit}
            disabled={choosenClient === undefined}
            error={fieldsValidation.unit}
            onSelect={(item) => {
              setChoosenUnit(item);
              if (item) setFieldsValidation({ ...fieldsValidation, unit: undefined });
              else setFieldsValidation({ ...fieldsValidation, unit: 'O campo de unidade é necessário' });
            }}
            notNull
            style={{ width: '100%', marginBottom: 20 }}
          />

          <ColSection style={{ marginBottom: 20 }}>
            <SectionTitle>Características da VT:</SectionTitle>
            <SectionDescription style={{ marginBottom: 15 }}>Selecione os itens necessários desta VT</SectionDescription>
            <Checkbox.Group value={choosenTvCharacteristics} options={availableTvCharacteristics} onChange={setChoosenTvCharacteristics} />
          </ColSection>

          {
            choosenTvCharacteristics.includes(IDENTIFICADOR_DA_CARACTERISTICA_DE_REFRIGERACAO) && (
              <>
                <ColSection style={{ marginBottom: 10 }}>
                  <SectionTitle>Ambientes</SectionTitle>
                  <ClimatizationParameterContainer>
                    <SectionDescription style={{ minWidth: 180 }}>
                      Selecionar quantidade de
                      <b> ambientes </b>
                      à serem adicionados?
                    </SectionDescription>

                    <ClimatizationValueBox>
                      <ClimatizationSwitchContainer>
                        <span style={{ color: '#4B4B4B', marginBottom: 9 }}>
                          {canSelectQuantityOfEnvironments ? 'Sim' : 'Não'}
                        </span>
                        <Switch
                          checked={canSelectQuantityOfEnvironments}
                          onChange={(value) => {
                            if (!value) setQuantityOfEnvironments(1);
                            setCanSelectQuantityOfEnvironments(value);
                          }}
                        />
                      </ClimatizationSwitchContainer>

                      <InputNumber
                        label="Quant."
                        disabled={!canSelectQuantityOfEnvironments}
                        value={quantityOfEnvironments}
                        onChange={(newValue) => setQuantityOfEnvironments(newValue)}
                      />

                    </ClimatizationValueBox>
                  </ClimatizationParameterContainer>
                </ColSection>
                <ColSection style={{ marginBottom: 20 }}>
                  <SectionTitle>Máquinas</SectionTitle>
                  <ClimatizationParameterContainer>
                    <SectionDescription style={{ minWidth: 180 }}>
                      Selecionar quantidade de
                      <b> máquinas </b>
                      à serem adicionados?
                    </SectionDescription>
                    <ClimatizationValueBox>
                      <ClimatizationSwitchContainer>
                        <span style={{ color: '#4B4B4B', marginBottom: 9 }}>
                          {canSelectQuantityOfMachines ? 'Sim' : 'Não'}
                        </span>
                        <Switch
                          checked={canSelectQuantityOfMachines}
                          onChange={(value) => {
                            if (!value) setQuantityOfMachines(1);
                            setCanSelectQuantityOfMachines(value);
                          }}
                        />
                      </ClimatizationSwitchContainer>

                      <InputNumber
                        label="Quant."
                        disabled={!canSelectQuantityOfMachines}
                        value={quantityOfMachines}
                        onChange={(newValue) => setQuantityOfMachines(newValue)}
                      />

                    </ClimatizationValueBox>
                  </ClimatizationParameterContainer>
                </ColSection>
              </>
            )
          }
        </Col>
        <Col>
          <ColSection style={{ marginBottom: 20, width: '60%' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div style={{
                display: 'flex', alignItems: 'flex-start', flexDirection: 'column',
              }}
              >
                <SectionTitle>Planta Baixa</SectionTitle>
                <SectionDescription style={{ width: 220 }}>
                  Faça o upload ou fotografe a planta baixa desta vt.
                </SectionDescription>

                <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap' }}>
                  {
                    blueprintPictures.map((picture, index) => (
                      <PhotoBox key={index} picture={picture} onDeleteRequest={(picture) => handlePictureDeleteRequest(picture, 'blueprint')} />
                    ))
                  }
                </div>
              </div>

              <UploadPhotoBtn onClick={() => handlePictureFileSelection('blueprint')}>
                <MdFileUpload color="#fff" size={28} />
                <input id="blueprint-file-input" type="file" name="clientLogo" style={{ display: 'none' }} accept="image/*" />
              </UploadPhotoBtn>
            </div>
          </ColSection>
          <ColSection style={{ marginBottom: 20, width: '60%' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div style={{
                display: 'flex', alignItems: 'flex-start', flexDirection: 'column',
              }}
              >
                <SectionTitle>Autorização</SectionTitle>
                <SectionDescription style={{ width: 220 }}>
                  Faça o upload de documentos que autorizem a visita técnica.
                </SectionDescription>

                <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap' }}>
                  {
                    autorizationPictures.map((picture, index) => (
                      <PhotoBox key={index} picture={picture} onDeleteRequest={(picture) => handlePictureDeleteRequest(picture, 'autorization')} />
                    ))
                  }
                </div>
              </div>
              <UploadPhotoBtn onClick={() => {
                handlePictureFileSelection('autorization');
              }}
              >
                <MdFileUpload color="#fff" size={28} />
                <input id="autorization-file-input" type="file" name="clientLogo" style={{ display: 'none' }} accept="image/*" />
              </UploadPhotoBtn>
            </div>
          </ColSection>
          <Select
            label="Empresa que realizará a VT"
            placeholder="Escolha a empresa"
            options={clientsMant}
            propLabel="NAME"
            value={choosenCompany}
            error={fieldsValidation.company}
            onSelect={(item) => {
              setChoosenCompany(item);
              if (item) setFieldsValidation({ ...fieldsValidation, company: undefined });
              else setFieldsValidation({ ...fieldsValidation, company: 'O campo de empresa é necessário' });
            }}
            notNull
            style={{ width: '100%', marginBottom: 20 }}
          />
          <Select
            label="Nome do Técnico da VT"
            placeholder="Selecione o técnico desta VT"
            disabled={choosenCompany === undefined}
            options={availableTechnicalUsers}
            propLabel="FULLNAME"
            value={choosenTechnicalUser}
            error={fieldsValidation.technician}
            onSelect={(item) => {
              setChoosenTechnicalUser(item);
              if (item) setFieldsValidation({ ...fieldsValidation, technician: undefined });
              else setFieldsValidation({ ...fieldsValidation, technician: 'O campo de técnico é necessário' });
            }}
            notNull
            style={{ width: '100%', marginBottom: 20 }}
          />
          <InputDate
            label="Data da VT"
            placeholder="Selecione a data"
            value={choosenTVDate}
            error={fieldsValidation.date}
            onChange={(newDate) => {
              if (newDate) {
                setChoosenTVDate(newDate);
                setFieldsValidation({ ...fieldsValidation, date: undefined });
              }
              else setFieldsValidation({ ...fieldsValidation, date: 'O campo de data é necessário' });
            }}
            style={{ width: '100%', marginBottom: 10 }}
          />
          <InputHour
            label="Horário Agendado"
            placeholder="10:00h"
            disabled={false}
            value={choosenTVScheduledTime}
            error={fieldsValidation.time}
            onChange={(newTime) => {
              setChoosenTVScheduleTime(newTime);
            }}
            style={{ width: '100%', marginBottom: 20 }}
          />
          <TextArea
            label="Observações Gerais"
            placeholder="Informações e observações importantes para a instalação e sucesso desta VT."
            value={observations}
            onChange={setObservations}
            error={undefined}
            style={{ width: '100%' }}
          />
        </Col>
      </Content>
      <Footer>
        <Link to="/visita-tecnica" style={{ color: colors.Blue700, borderBottom: `1px solid ${colors.Blue700}` }}>
          Voltar
        </Link>
        <Button variant="primary" type="button" style={{ width: 170 }} onClick={() => !isLoading && handleSubmit()}>
          { isLoading ? (<Loader variant="secondary" size="small" />) : (<span>{`${technicalVisitId ? 'EDITAR' : 'AGENDAR'} ESTA VT`}</span>)}
        </Button>
      </Footer>
    </DefaultCard>
  );
};

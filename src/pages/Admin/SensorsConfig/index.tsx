import { useState, useEffect } from 'react';

import { Helmet } from 'react-helmet';
import { toast } from 'react-toastify';

import {
  Input, ModalWindow, ActionButton, Button, Loader,
  Select,
} from 'components';
import parseDecimalNumber from 'helpers/parseDecimalNumber';
import { useStateVar } from 'helpers/useStateVar';
import {
  AddIcon, ArrowBackIcon, DeleteOutlineIcon, EditIcon, SaveIcon,
} from 'icons';
import { apiCall } from 'providers';
import { colors } from 'styles/colors';

import { AdminLayout } from '../AdminLayout';
import {
  TableContainer,
  TableHead,
  TableBody,
  HeaderCell,
  DataCell,
  Row,
  HeaderRow,
  SimpleButton,
} from './styles';

import { withTransaction } from '@elastic/apm-rum-react';
import { formatNumberWithFractionDigits } from '~/helpers/thousandFormatNumber';
import { t } from 'i18next';
import { AxiosError } from 'axios';

export const SensorsConfig = (): JSX.Element => {
  const [state, render, setState] = useStateVar(() => {
    const state = {
      curvesList: [] as { ID: number; SENSOR_ID: string; MULT_QUAD: number; MULT_LIN: number; OFST: number; MIN_FIRMWARE_VERSION: string; }[],
      validSensors: [] as { SENSOR_ID: string; SENSOR_NAME: string; }[],
      dacFwVers: [] as string[],
      openModal: false,
      newSensor: false,
      selectedSensor: null,
      loading: true,
    };
    return state;
  });

  useEffect(() => {
    fetchData();
  }, [state.curvesList?.length, state.validSensors?.length]);

  async function fetchData() {
    try {
      setState({ loading: true });
      const curvesList = (await apiCall('/config/get-pressure-curves', {})).list ?? [];
      const validSensors = (await apiCall('/config/get-pressure-sensors', {})).list ?? [];
      const fwVers = (
        (await apiCall('/devs/get-registered-firmware-versions', {}))
          .list
          .map((x) => ([
            x.fwVers,
            {
              vMajor: x.versionNumber?.vMajor ?? 0,
              vMinor: x.versionNumber?.vMinor ?? 0,
              vPatch: x.versionNumber?.vPatch ?? 0,
            }] as [string, { vMajor: number, vMinor: number, vPatch: number }]
          ))
      );
      const fwVersUnique = Object.fromEntries(fwVers);
      const dacFwVers = Object.entries(fwVersUnique).sort((left, right) => (
        left[1].vMajor - right[1].vMajor
          || left[1].vMinor - right[1].vMinor
          || left[1].vPatch - right[1].vPatch
      )).map((x) => x[0]);

      curvesList.sort((left, right) => {
        if (left.SENSOR_ID.toLowerCase() < right.SENSOR_ID.toLowerCase()) {
          return -1;
        }
        if (left.SENSOR_ID.toLowerCase() > right.SENSOR_ID.toLowerCase()) {
          return 1;
        }
        return 0;
      });

      setState({
        curvesList: curvesList.filter((item) => item.SENSOR_ID !== 'NO_CONV'),
        validSensors: validSensors.filter((item) => item.SENSOR_ID !== 'NO_CONV'),
        dacFwVers,
      });
    } catch (err) { console.log(err); toast.error(t('erro')); }
    setState({ loading: false });
  }
  function openCreateEditSensor(itemToEdit?) {
    state.selectedSensor = itemToEdit || null;
    setState({ openModal: true });
  }
  async function deleteSensor(item: (typeof state.curvesList)[number]) {
    try {
      if (window.confirm(t('excluirCurvaPrompt', { curveId: item.ID }))) {
        await apiCall('/config/delete-pressure-curve', { CURVE_ID: item.ID });
        state.curvesList = state.curvesList.filter((sensor) => sensor.ID !== item.ID);
        render();
        toast.success(t('sucesso'));
      }
    } catch (err) { console.log(err); toast.error(t('erro')); }
  }
  async function afterCreateEditCurve({ item: responseData, action }) {
    try {
      setState({ openModal: false });
      if (action === 'new') {
        state.curvesList.push(responseData);
        render();
      }
      else if (action === 'edit') {
        const found = state.curvesList.find((item) => item.ID === responseData.ID);
        if (found) {
          Object.assign(found, responseData);
          render();
        }
        else {
          await fetchData();
        }
      }
      else {
        await fetchData();
      }
      toast.success(t('sucesso'));
    } catch (err) { console.log(err); toast.error(t('erro')); }
  }

  return (
    <>
      <Helmet>
        <title>Diel Energia - Configurações</title>
      </Helmet>
      <AdminLayout />
      {state.loading && <Loader variant="primary" />}
      {(!state.loading)
        && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div>&nbsp;</div>
            <SimpleButton variant="primary" onClick={() => setState({ newSensor: true })}>Gerenciar Sensores</SimpleButton>
            <SimpleButton variant="primary" onClick={() => openCreateEditSensor()}>Adicionar Curva</SimpleButton>
          </div>
          <TableCurves
            list={state.curvesList}
            onDeleteClick={deleteSensor}
            onEditClick={openCreateEditSensor}
          />
          {state.openModal && (
            <ModalWindow onClickOutside={undefined}>
              <FormEditCurve
                curveInfo={state.selectedSensor}
                onCancel={() => { setState({ openModal: false }); }}
                onSuccess={afterCreateEditCurve}
                sensorList={state.validSensors}
                validFwVers={state.dacFwVers}
              />
            </ModalWindow>
          )}
          {state.newSensor && (
            <ModalWindow onClickOutside={() => setState({ newSensor: false })}>
              <TableSensors
                list={state.validSensors}
                onDeleteClick={({ sensor, res }) => {
                  if (res === 'success') {
                    setState({
                      validSensors: state.validSensors.filter((s) => sensor.sensorId !== s.SENSOR_ID),
                      curvesList: state.curvesList.filter((c) => c.SENSOR_ID !== sensor.sensorId),
                    });
                  }
                }}
                onEditClick={(x) => {
                  setState({
                    validSensors: state.validSensors.map((sensor) => {
                      if (sensor.SENSOR_ID === x.sensorId) {
                        return {
                          SENSOR_ID: sensor.SENSOR_ID,
                          SENSOR_NAME: x.sensorName,
                        };
                      }
                      return sensor;
                    }),
                  });
                }}
                onSubmitClick={({ item, action }) => {
                  toast.success(t('sucesso'));
                  if (action === 'new') {
                    setState({
                      validSensors: state.validSensors.concat({ SENSOR_ID: item.SENSOR_ID, SENSOR_NAME: item.SENSOR_NAME }),
                    });
                  }
                }}
              />
            </ModalWindow>
          )}
        </div>
        )}
    </>
  );
};

function TableSensors({
  list, onDeleteClick, onEditClick, onSubmitClick,
} : {
  readonly list: { SENSOR_ID: string, SENSOR_NAME: string }[],
  readonly onDeleteClick: (a: any) => void,
  readonly onEditClick: (a: any) => void,
  readonly onSubmitClick: (a: any) => void,
}) {
  const [state, render, setState] = useStateVar(() => {
    const state: {
      newSensorInputEnabled: boolean,
      sensorId: string;
      sensorName: string;
      submitting: boolean,
      rowIdEdited?: string
    } = {
      newSensorInputEnabled: false,
      sensorId: '',
      sensorName: '',
      submitting: false,
      rowIdEdited: undefined,
    };
    return state;
  });

  async function deleteSensor(sensorId: string) {
    let response;
    try {
      if (!sensorId) { toast.error(t('infoFaltando', { info: t('sensor') })); return; }
      setState({ submitting: true });
      const reqData = {
        SENSOR_ID: sensorId,
      };
      response = await apiCall('/config/delete-pressure-sensor', reqData);
    } catch (err) { toast.error(t('sensorDeleteErro')); }
    setState({ submitting: false });
    return (response != null) ? 'success' : 'fail';
  }

  async function confirm() {
    let response = null as null|{ SENSOR_ID: string };
    const action = (state.newSensorInputEnabled) ? 'new' : 'edit';
    try {
      if (!state.sensorId) { toast.error(t('infoFaltando', { info: t('sensor') })); return; }
      if (list.some((sensor) => (sensor.SENSOR_ID === state.sensorId))) { toast.error(t('sensorJaExiste', { sensor: state.sensorId })); return; }
      setState({ submitting: true });
      const reqData = {
        SENSOR_ID: state.sensorId,
        SENSOR_NAME: state.sensorName,
      };
      if (action === 'new') {
        response = await apiCall('/config/add-pressure-sensor', reqData);
      }
      else if (action === 'edit') {
        response = await apiCall('/config/edit-pressure-sensor', reqData);
      }
    } catch (err) {
      if ((err as AxiosError)?.response?.data === 'Sensor already exists') {
        toast.error(t('sensorJaExiste', { sensor: state.sensorId }));
      }
      else {
        console.log(err); toast.error(t('erro'));
      }
    }
    setState({ submitting: false });
    if (response && action) {
      onSubmitClick({ item: response, action });
    }
  }

  return (
    <TableContainer>
      <TableHead>
        <HeaderRow>
          <HeaderCell>Sensor</HeaderCell>
          <HeaderCell />
        </HeaderRow>
      </TableHead>
      <TableBody>
        {list.map((item) => (
          <EditableRow
            key={item.SENSOR_ID}
            values={[item.SENSOR_ID]}
            onDeleteRow={() => {
              deleteSensor(item.SENSOR_ID)
                .then((res) => {
                  onDeleteClick({ sensor: { sensorId: item.SENSOR_ID }, res });
                  render();
                });
            }}
          />
        ))}
        <Row key="new-sensor">
          {
            (state.newSensorInputEnabled && state.rowIdEdited == null) && (
              <DataCell style={{ textAlign: 'left' }}>
                <Input
                  type="text"
                  style={{
                    height: '35px',
                    fontSize: '0.71rem',
                    padding: '0 3px',
                    maxHeight: '30px',
                    minHeight: '20px',
                    margin: '5px',
                    border: 0,
                    outline: 0,
                  }}
                  value={state.sensorId}
                  placeholder="Sensor"
                  onChange={(event) => setState({ sensorId: event.target.value.trim() })}
                />
              </DataCell>
            )
          }
          <DataCell style={{ textAlign: 'left' }}>
            {
              (state.newSensorInputEnabled && state.rowIdEdited == null) ? (
                <>
                  <ActionButton onClick={() => setState({ newSensorInputEnabled: false })} variant="red-inv">
                    <DeleteOutlineIcon colors={colors.Red} />
                  </ActionButton>
                  <ActionButton
                    onClick={() => {
                      confirm();
                      setState({ newSensorInputEnabled: false, rowIdEdited: undefined });
                    }}
                    variant="blue-inv"
                  >
                    <SaveIcon color={colors.LightBlue} width="18px" />
                  </ActionButton>
                </>
              ) : (
                <ActionButton
                  onClick={() => {
                    setState({
                      newSensorInputEnabled: true,
                      rowIdEdited: undefined,
                    });
                    render();
                  }}
                  variant="blue-inv"
                >
                  <AddIcon color={colors.LightBlue} />
                </ActionButton>
              )
            }
          </DataCell>
        </Row>
      </TableBody>
    </TableContainer>
  );
}

function TableCurves({ list, onDeleteClick, onEditClick } : {
  readonly list: { ID: number; SENSOR_ID: string; MULT_QUAD: number; MULT_LIN: number; OFST: number; MIN_FIRMWARE_VERSION: string; }[],
  readonly onDeleteClick: (a: any) => void,
  readonly onEditClick: (a: any) => void,
}) {
  return (
    <TableContainer>
      <TableHead>
        <HeaderRow>
          <HeaderCell>{t('curveId')}</HeaderCell>
          <HeaderCell>{t('sensor')}</HeaderCell>
          <HeaderCell>{t('minFirmware')}</HeaderCell>
          <HeaderCell>{t('coefQuad')}</HeaderCell>
          <HeaderCell>{t('coefAng')}</HeaderCell>
          <HeaderCell>{t('coefLin')}</HeaderCell>
          <HeaderCell />
        </HeaderRow>
      </TableHead>
      <TableBody>
        {list.map((item) => (
          <Row key={item.ID}>
            <DataCell>{item.ID}</DataCell>
            <DataCell>{item.SENSOR_ID}</DataCell>
            <DataCell>{item.MIN_FIRMWARE_VERSION}</DataCell>
            <DataCell>{formatNumberWithFractionDigits(item.MULT_QUAD, { minimum: 0, maximum: 6 })}</DataCell>
            <DataCell>{formatNumberWithFractionDigits(item.MULT_LIN, { minimum: 0, maximum: 6 })}</DataCell>
            <DataCell>{formatNumberWithFractionDigits(item.OFST, { minimum: 0, maximum: 6 })}</DataCell>
            <DataCell>
              <ActionButton onClick={() => onDeleteClick(item)} variant="red-inv">
                <DeleteOutlineIcon colors={colors.Red} />
              </ActionButton>
              <ActionButton onClick={() => onEditClick(item)} variant="blue-inv">
                <EditIcon color={colors.LightBlue} />
              </ActionButton>
            </DataCell>
          </Row>
        ))}
      </TableBody>
    </TableContainer>
  );
}

function FormEditCurve({
  curveInfo,
  onSuccess,
  onCancel,
  sensorList,
  validFwVers,
}: {
  readonly curveInfo: { ID: number; SENSOR_ID: string; MULT_QUAD: number; MULT_LIN: number; OFST: number; MIN_FIRMWARE_VERSION: string; } | null,
  readonly sensorList: { SENSOR_ID: string; SENSOR_NAME: string; }[],
  readonly validFwVers: string[],
  readonly onSuccess: (a: {item: any, action: any}) => void,
  readonly onCancel: (a: any) => void
}) {
  const [state, render, setState] = useStateVar({
    submitting: false,
    CURVE_ID: curveInfo?.ID,
    SENSOR_ID: (curveInfo?.SENSOR_ID) ?? '',
    MULT_QUAD: String(curveInfo?.MULT_QUAD ?? ''),
    MULT_LIN: String(curveInfo?.MULT_LIN ?? ''),
    OFST: String(curveInfo?.OFST ?? ''),
    MIN_FW_VERSION: curveInfo?.MIN_FIRMWARE_VERSION,
    sensorList: sensorList.map((sensor) => sensor.SENSOR_ID),
    fwList: validFwVers,
    newSensor: false,
  });
  const isEdit = !!curveInfo?.ID;

  async function confirm() {
    let response = null as null|{ SENSOR_ID: string };
    let action = null as null|'new'|'edit';
    try {
      if (!state.MULT_QUAD) { toast.error(t('infoFaltando', { info: t('coefQuad') })); return; }
      if (!state.MULT_LIN) { toast.error(t('infoFaltando', { info: t('coefAng') })); return; }
      if (!state.OFST) { toast.error(t('infoFaltando', { info: t('coefLin') })); return; }
      if (!state.MIN_FW_VERSION) { toast.error(t('infoFaltando', { info: t('minFirmware') })); return; }
      if (!state.SENSOR_ID) {
        toast.error(t('infoFaltando', { info: t('sensor') }));
        return;
      }
      setState({ submitting: true });

      if (isEdit && state.CURVE_ID) {
        const reqData = {
          ID: state.CURVE_ID,
          SENSOR_ID: state.SENSOR_ID,
          MIN_FIRMWARE_VERSION: state.MIN_FW_VERSION,
          MULT_QUAD: parseDecimalNumber(state.MULT_QUAD)!,
          MULT_LIN: parseDecimalNumber(state.MULT_LIN)!,
          OFST: parseDecimalNumber(state.OFST)!,
        };
        response = await apiCall('/config/edit-pressure-curve', reqData);
        action = 'edit';
      } else if (!isEdit) {
        const reqData = {
          SENSOR_ID: state.SENSOR_ID,
          MIN_FIRMWARE_VERSION: state.MIN_FW_VERSION,
          MULT_QUAD: parseDecimalNumber(state.MULT_QUAD)!,
          MULT_LIN: parseDecimalNumber(state.MULT_LIN)!,
          OFST: parseDecimalNumber(state.OFST)!,
        };
        response = await apiCall('/config/add-pressure-curve', reqData);
        action = 'new';
      }
      else {
        toast.error(t('erro'));
      }
    } catch (err) { console.log(err); toast.error(t('erro')); }
    setState({ submitting: false });
    if (response && action) onSuccess({ item: response, action });
  }

  return (
    <div>
      <div style={{ display: 'flex' }}>
        <Select
          options={state.sensorList}
          value={state.SENSOR_ID}
          placeholder="Sensor"
          onSelect={(opt) => {
            setState({ SENSOR_ID: opt });
          }}
          style={{ width: '100%' }}
          notNull
        />
      </div>
      <div style={{ paddingTop: '10px' }} />
      <Select
        options={state.fwList}
        value={state.MIN_FW_VERSION}
        placeholder="Firmware"
        onSelect={(opt) => { setState({ MIN_FW_VERSION: opt }); }}
        notNull
      />
      <div style={{ paddingTop: '10px' }} />
      <Input
        type="text"
        value={state.MULT_QUAD}
        placeholder={t('coefQuad')}
        onChange={(event) => setState({ MULT_QUAD: event.target.value })}
      />
      <div style={{ paddingTop: '10px' }} />
      <Input
        type="text"
        value={state.MULT_LIN}
        placeholder={t('coefAng')}
        onChange={(event) => setState({ MULT_LIN: event.target.value })}
      />
      <div style={{ paddingTop: '10px' }} />
      <Input
        type="text"
        value={state.OFST}
        placeholder={t('coefLin')}
        onChange={(event) => setState({ OFST: event.target.value })}
      />
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '30px',
      }}
      >
        <Button style={{ width: '140px' }} onClick={confirm} variant="primary">
          {isEdit ? 'Salvar' : 'Adicionar'}
        </Button>
        <Button style={{ width: '140px', margin: '0 20px' }} onClick={onCancel} variant="grey">
          Cancelar
        </Button>
      </div>
    </div>
  );
}

function EditableRow<U extends string, T extends Array<U>>({
  key, values, onDeleteRow,
}: {
  readonly key: string,
  readonly values: T,
  readonly onDeleteRow: (a: any) => void,
}) {
  return (
    <Row key={key}>
      {
        values.map((v) => (
          <DataCell>{v}</DataCell>
        ))
      }
      <DataCell>
        <ActionButton onClick={() => onDeleteRow(key)} variant="red-inv">
          <DeleteOutlineIcon colors={colors.Red} />
        </ActionButton>
      </DataCell>
    </Row>
  );
}

export default withTransaction('SensorsConfig', 'component')(SensorsConfig);

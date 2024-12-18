import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import styled from 'styled-components';

import {
  Button,
  Loader,
  Select,
} from 'components';
import { useStateVar } from 'helpers/useStateVar';
import { apiCall, ApiResps } from 'providers';

type Customer = ApiResps['/coolautomation/get-units-and-systems']['customers']['']&{
  _sites: Site[]
};
type Site = ApiResps['/coolautomation/get-units-and-systems']['sites']['']&{
  _customer: Customer|null
  _devices: Device[]
};
type Device = ApiResps['/coolautomation/get-units-and-systems']['devices']['']&{
  _site: Site|null
  _systems: System[]
};
type System = ApiResps['/coolautomation/get-units-and-systems']['systems']['']&{
  _device: Device|null
  _units: Unit[]
};
type Unit = ApiResps['/coolautomation/get-units-and-systems']['units']['']&{
  _system: System|null
};

export const CoolAutomation = (): JSX.Element => {
  const [state, render, setState] = useStateVar(() => {
    const state = {
      loading: true,
      customers: [] as Customer[],
      sites: [] as Site[],
      devices: [] as (Device&{ comboLabel?: string })[],
      systems: [] as System[],
      coolAutUnits: [] as Unit[],
      gridCells: [] as { id: string, text: string|JSX.Element, span?: number, link?: string }[],
      gridColumns: [] as string[],
      associatedDevices: [] as { CLIENT_NAME: string, UNIT_NAME: string, integrId: string, dataSource: string }[],
      dielUnits: [] as { UNIT_ID: number, UNIT_NAME: string, CLIENT_NAME: string, comboLabel?: string }[],
      groupedEvents: [] as ApiResps['/coolautomation/debug-alerts']['groupedEvents'],
      combo_selectedDielUnit: null as null|{ UNIT_ID: number },
      combo_selectedCoolAutDevice: null as null|Device,
    };
    return state;
  });

  useEffect(() => {
    fetchData();
  }, []);
  async function fetchData() {
    try {
      setState({ loading: true });
      const [
        dielUnits,
        {
          customers,
          sites,
          devices,
          systems,
          units: coolAutUnits,
          valsTransl,
        },
        { list: associatedDevices },
        { groupedEvents },
      ] = await Promise.all([
        apiCall('/clients/get-units-list', {}),
        apiCall('/coolautomation/get-units-and-systems'),
        apiCall('/get-integrations-list', { supplier: 'coolautomation' }),
        apiCall('/coolautomation/debug-alerts', {}),
      ]);
      // TODO: falta rotas de cadastrar, listar e remover items do cool automation. Indicar na tabela os sistemas que estão ou não estão associados a unidade da Diel.
      state.customers = Object.values(customers).map((customer) => Object.assign(customer, { _sites: [] }));
      state.sites = Object.values(sites).map((site) => Object.assign(site, { _devices: [], _customer: null }));
      state.devices = Object.values(devices).map((devices) => Object.assign(devices, { _systems: [], _site: null }));
      state.systems = Object.values(systems).map((system) => Object.assign(system, { _units: [], _device: null }));
      state.coolAutUnits = Object.values(coolAutUnits).map((unit) => Object.assign(unit, { _system: null }));
      for (const customer of state.customers) {
        customer._sites = state.sites.filter((site) => site.customer === customer.id);
      }
      for (const site of state.sites) {
        site._devices = state.devices.filter((device) => device.site === site.id);
        site._customer = state.customers.find((customer) => customer.id === site.customer) || null;
      }
      for (const device of state.devices) {
        device._systems = state.systems.filter((system) => system.device === device.id);
        device._site = state.sites.find((site) => site.id === device.site) || null;
      }
      for (const system of state.systems) {
        system._units = state.coolAutUnits.filter((unit) => unit.system === system.id);
        system._device = state.devices.find((device) => device.id === system.device) || null;
      }
      for (const unit of state.coolAutUnits) {
        unit._system = state.systems.find((system) => system.id === unit.system) || null;
      }
      const { gridCells, gridColumns } = generateGrid(valsTransl);
      state.gridCells = gridCells;
      state.gridColumns = gridColumns;
      state.associatedDevices = associatedDevices;
      state.dielUnits = dielUnits;
      state.groupedEvents = groupedEvents;

      for (const evtGrp of state.groupedEvents) {
        evtGrp.firstTs = evtGrp.firstTs && evtGrp.firstTs.replaceAll('T', ' ').replaceAll('-0300', '');
        evtGrp.lastTs = evtGrp.lastTs && evtGrp.lastTs.replaceAll('T', ' ').replaceAll('-0300', '');
      }

      for (const device of state.devices) {
        const site = device._site;
        const customer = site && site._customer;
        device.comboLabel = `${customer && customer.name} > ${site && site.name} > ${device.name}`;
      }
      state.devices = state.devices.sort((a, b) => ((a.comboLabel! > b.comboLabel!) ? 1 : (a.comboLabel! < b.comboLabel!) ? -1 : 0));
      for (const unit of state.dielUnits) {
        unit.comboLabel = `${unit.CLIENT_NAME} > ${unit.UNIT_NAME}`;
      }
      state.dielUnits = state.dielUnits.sort((a, b) => ((a.comboLabel! > b.comboLabel!) ? 1 : (a.comboLabel! < b.comboLabel!) ? -1 : 0));
    } catch (err) { console.log(err); toast.error('Houve erro'); }
    setState({ loading: false });
  }

  function generateGrid(valsTransl: ApiResps['/coolautomation/get-units-and-systems']['valsTransl']) {
    if (!valsTransl.operationStatuses) valsTransl.operationStatuses = {};
    if (!valsTransl.operationModes) valsTransl.operationModes = {};
    if (!valsTransl.fanModes) valsTransl.fanModes = {};
    if (!valsTransl.swingModes) valsTransl.swingModes = {};
    if (!valsTransl.unitTypes) valsTransl.unitTypes = {};
    if (!valsTransl.outdoorUnitTasks) valsTransl.outdoorUnitTasks = {};
    const gridCells = [] as { id: string, text: string|JSX.Element, span?: number }[];
    for (const customer of state.customers) {
      const customerCells = [
        { id: customer.id, text: customer.name, span: 0 },
      ];
      customerCells.forEach((item) => gridCells.push(item));
      for (const site of ((customer._sites.length > 0) ? customer._sites : [{
        id: '',
        name: '',
        _devices: [],
      }])) {
        const siteCells = [
          { id: site.id, text: site.name, span: 0 },
        ];
        siteCells.forEach((item) => gridCells.push(item));
        for (const device of ((site._devices.length > 0) ? site._devices : [{
          id: '',
          name: '',
          isConnected: '',
          _systems: [],
        }])) {
          const deviceCells = [
            {
              id: device.id,
              text: (
                <span>
                  {device.name}
                  <br />
                  {device.id}
                </span>
              ),
              span: 0,
            },
            { id: `isConnected|${device.id}`, text: String(device.isConnected), span: 0 },
          ];
          deviceCells.forEach((item) => gridCells.push(item));
          for (const system of ((device._systems.length > 0) ? device._systems : [{
            id: '',
            name: '',
            operationMode: null,
            operationStatus: null,
            _units: [],
          }])) {
            const systemCells = [
              { id: system.id, text: system.name, span: 0 },
              { id: `operationMode|${system.id}`, text: (system.operationMode == null) ? '' : `${system.operationMode} ${valsTransl.operationModes[String(system.operationMode)]}`, span: 0 },
              { id: `operationStatus|${system.id}`, text: (system.operationStatus == null) ? '' : `${system.operationStatus} ${valsTransl.operationStatuses[String(system.operationStatus)]}`, span: 0 },
            ];
            systemCells.forEach((item) => gridCells.push(item));
            for (const unit of ((system._units.length > 0) ? system._units : [{
              id: '',
              name: '',
              activeFanMode: null,
              activeOperationMode: null,
              activeOperationStatus: null,
              activeSetpoint: null,
              activeSwingMode: null,
              ambientTemperature: null,
              line: null,
              task: null,
              type: null,
            }])) {
              gridCells.push({ id: `name|${unit.id}`, text: unit.name, link: `/painel/coolautomation/unit/${unit.id}` });
              gridCells.push({ id: `activeFanMode|${unit.id}`, text: (unit.activeFanMode == null) ? '' : `${unit.activeFanMode} ${valsTransl.fanModes[String(unit.activeFanMode)]}` });
              gridCells.push({ id: `activeOperationMode|${unit.id}`, text: (unit.activeOperationMode == null) ? '' : `${unit.activeOperationMode} ${valsTransl.operationModes[String(unit.activeOperationMode)]}` });
              gridCells.push({ id: `activeOperationStatus|${unit.id}`, text: (unit.activeOperationStatus == null) ? '' : `${unit.activeOperationStatus} ${valsTransl.operationStatuses[String(unit.activeOperationStatus)]}` });
              gridCells.push({ id: `activeSetpoint|${unit.id}`, text: (unit.activeSetpoint == null) ? '' : String(unit.activeSetpoint) });
              gridCells.push({ id: `activeSwingMode|${unit.id}`, text: (unit.activeSwingMode == null) ? '' : `${unit.activeSwingMode} ${valsTransl.swingModes[String(unit.activeSwingMode)]}` });
              gridCells.push({ id: `ambientTemperature|${unit.id}`, text: (unit.ambientTemperature == null) ? '' : String(unit.ambientTemperature) });
              gridCells.push({ id: `line|${unit.id}`, text: (unit.line == null) ? '' : String(unit.line) });
              gridCells.push({ id: `task|${unit.id}`, text: (unit.task == null) ? '' : `${unit.task} ${valsTransl.outdoorUnitTasks[String(unit.task)]}` });
              gridCells.push({ id: `type|${unit.id}`, text: (unit.type == null) ? '' : `${unit.type} ${valsTransl.unitTypes[String(unit.type)]}` });
            }
            systemCells.forEach((systemCell) => { systemCell.span += system._units.length || 1; });
            deviceCells.forEach((deviceCell) => { deviceCell.span += system._units.length || 1; });
            siteCells.forEach((siteCell) => { siteCell.span += system._units.length || 1; });
            customerCells.forEach((customerCell) => { customerCell.span += system._units.length || 1; });
          }
        }
      }
    }
    const gridColumns = [
      'Customer',
      'Site',
      'Device',
      'isConnected',
      'System',
      'operationMode',
      'operationStatus',
      'Unit',
      'activeFanMode',
      'activeOperationMode',
      'activeOperationStatus',
      'activeSetpoint',
      'activeSwingMode',
      'ambientTemperature',
      'line',
      'task',
      'type',
    ];
    return { gridCells, gridColumns };
  }

  async function saveAssociation() {
    try {
      const unitId = state.combo_selectedDielUnit && state.combo_selectedDielUnit.UNIT_ID;
      if (!unitId) {
        toast.error('Unidade inválida');
        return;
      }
      if (!state.combo_selectedCoolAutDevice) {
        toast.error('Selecione um device');
        return;
      }
      await apiCall('/coolautomation/associate-device-to-diel-unit', {
        dielUnitId: unitId,
        coolAutSystemId: state.combo_selectedCoolAutDevice.id,
      });
      window.location.reload();
    } catch (error) {
      toast.error('Houve erro');
    }
  }

  return (
    <>
      {state.loading && <Loader variant="primary" />}
      {(!state.loading) && (
        <>
          <div>
            <div style={{ display: 'flex' }}>
              <Select
                style={{ width: '400px', marginTop: '10px', marginRight: '10px' }}
                options={state.dielUnits}
                propLabel="comboLabel"
                value={state.combo_selectedDielUnit}
                placeholder="Unidade Diel"
                onSelect={(item) => { setState({ combo_selectedDielUnit: item }); }}
                notNull
              />
              <Select
                style={{ width: '500px', marginTop: '10px', marginRight: '10px' }}
                options={state.devices}
                propLabel="comboLabel"
                value={state.combo_selectedCoolAutDevice}
                placeholder="Device CoolAutomation"
                onSelect={(item) => { setState({ combo_selectedCoolAutDevice: item }); }}
                notNull
              />
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Button style={{ width: '100px' }} onClick={saveAssociation} variant="primary">
                  Salvar
                </Button>
              </div>
            </div>
          </div>

          <div style={{ paddingTop: '20px' }}>
            <h2>ASSOCIADOS</h2>
            <Table>
              <thead>
                <tr>
                  <th>Cliente DIEL</th>
                  <th>Unidades DIEL</th>
                  <th>Dispositivo CoolAutomation</th>
                  <th>ID CoolAutomation</th>
                </tr>
              </thead>
              <tbody>
                {(state.associatedDevices || []).map((row) => (
                  <tr key={row.integrId}>
                    <td>{row.CLIENT_NAME}</td>
                    <td>{row.UNIT_NAME}</td>
                    <td>{row.dataSource}</td>
                    <td>{row.integrId}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          <div style={{ paddingTop: '20px' }}>
            <h2>TABELA COOL AUTOMATION</h2>
            <GridContainer style={{ gridTemplateColumns: state.gridColumns.map((x) => 'auto').join(' ') }}>
              {state.gridColumns.map((header) => (
                <Cell id={header}>{header}</Cell>
              ))}
              {state.gridCells.map((cell) => (
                <Cell id={cell.id} style={cell.span ? { gridRowEnd: `span ${cell.span}` } : {}}>
                  {cell.link ? (<Link to={cell.link}>{cell.text}</Link>) : cell.text}
                </Cell>
              ))}
            </GridContainer>
          </div>

          <div style={{ paddingTop: '20px' }}>
            <h2>ALERTAS (últimas 24h)</h2>
            <Table>
              <thead>
                <tr>
                  <th>Site</th>
                  <th>Device</th>
                  <th>System</th>
                  <th>Resources</th>
                  <th>EventType</th>
                  <th>Code</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Horário</th>
                </tr>
              </thead>
              <tbody>
                {(state.groupedEvents || []).map((row, index) => (
                  <tr key={index} style={{ color: (row.colStatus === 'Closed') ? 'lightgrey' : undefined }}>
                    <td>{row.colSite}</td>
                    <td>{row.colDevice}</td>
                    <td>{row.colSystem}</td>
                    <td>{row.colResources}</td>
                    <td>{row.colEventType}</td>
                    <td>{row.colCode}</td>
                    <td>{row.colDescription}</td>
                    <td>{row.colStatus}</td>
                    <td>
                      {(row.evCount === 1) ? '' : `${row.evCount} eventos`}
                      {(row.firstTs === row.lastTs) ? row.firstTs : ` entre ${row.firstTs} e ${row.lastTs}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </>
      )}
    </>
  );
};

const TableBasic = styled.table`
  white-space: nowrap;
  & td,th {
    padding: 3px 10px;
    border: 1px solid grey;
  }
`;

const Cell = styled.div`
  border-right: 1px solid grey;
  border-bottom: 1px solid grey;
  padding: 3px;
`;

const GridContainer = styled.div`
  display: grid;
  border-top: 1px solid grey;
  border-left: 1px solid grey;
`;

const Table = styled.table`
  white-space: nowrap;
  & td,th {
    padding: 3px 10px;
    border: 1px solid grey;
  }
`;

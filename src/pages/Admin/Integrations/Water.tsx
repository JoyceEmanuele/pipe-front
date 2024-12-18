import { useEffect } from 'react';
import { toast } from 'react-toastify';
import styled from 'styled-components';

import {
  Button,
  Loader,
  Select,
} from 'components';
import { useStateVar } from 'helpers/useStateVar';
import { apiCall } from 'providers';

export const Water = (): JSX.Element => {
  const [state, render, setState] = useStateVar(() => {
    const state = {
      units: [] as {
        UNIT_ID: number
        CLIENT_NAME: string
        UNIT_NAME: string
        comboLabel?: string
        meter?: { dataSource: string }
      }[],
      sortedUnits: [] as {
        comboLabel?: string
      }[],
      freeMeters: [] as {
        dataSource: string
        comboLabel?: string
      }[],
      freeDmas: [] as {
        dataSource: string
        comboLabel?: string
      }[],
      loading: true,
      combo_dielUnit: null as null|{ UNIT_ID: number, CLIENT_ID: number},
      combo_meters: null as null| { dataSource: string },
      combo_supplier: null as null | string,
    };
    return state;
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      state.loading = true; render();
      const { list: metersList } = await apiCall('/laager/get-meters-list', {});
      const [
        dielUnits,
        { list: meters },
        { list: disassociatedDmas },
      ] = await Promise.all([
        apiCall('/clients/get-units-list', {}),
        apiCall('/get-integrations-list/water'),
        apiCall('/dma/get-disassociated-dmas'),
      ]);
      state.freeDmas = disassociatedDmas;
      const units2 = dielUnits.map((unit) => {
        const meter = meters.find((meter) => meter.UNIT_ID === unit.UNIT_ID);
        return Object.assign(unit, { meter });
      });
      const associatedUnits = units2.filter((x) => x.meter);
      const disassociatedUnits = units2.filter((x) => !x.meter);
      const associatedMetersId = meters.map((meter) => meter.dataSource);
      const disassociatedMeters = metersList.filter((meter) => !associatedMetersId.includes(meter.customer_id));
      state.units = [...associatedUnits, ...disassociatedUnits];
      state.freeMeters = disassociatedMeters.map((meter) => (
        { dataSource: meter.customer_id }
      ));

      for (const meter of state.freeMeters) {
        meter.comboLabel = `${meter.dataSource}`;
      }
      for (const meter of state.freeDmas) {
        meter.comboLabel = `${meter.dataSource}`;
      }
      state.freeMeters = state.freeMeters.sort((a, b) => ((a.comboLabel! > b.comboLabel!) ? 1 : (a.comboLabel! < b.comboLabel!) ? -1 : 0));
      for (const unit of state.units) {
        unit.comboLabel = `${unit.CLIENT_NAME} > ${unit.UNIT_NAME}`;
      }
      state.sortedUnits = state.units.sort((a, b) => ((a.comboLabel! > b.comboLabel!) ? 1 : (a.comboLabel! < b.comboLabel!) ? -1 : 0));
    } catch (err) { console.log(err); toast.error('Houve erro'); }
    state.loading = false; render();
  }

  async function saveAssociation() {
    try {
      const unitId = state.combo_dielUnit && state.combo_dielUnit.UNIT_ID;
      if (!unitId) {
        toast.error('Unidade inválida');
        return;
      }

      if (!state.combo_meters) {
        toast.error('Selecione um dispositivo');
        return;
      }

      const meterId = state.combo_meters?.dataSource || null;

      if (state.combo_supplier === 'Laager') {
        await apiCall('/laager/associate-meter-to-diel-unit', { unitId, meterId });
      } else if (state.combo_dielUnit && state.combo_dielUnit.CLIENT_ID && meterId) {
        await apiCall('/dma/set-dma-info', {
          DMA_ID: meterId,
          UNIT_ID: unitId,
          CLIENT_ID: state.combo_dielUnit.CLIENT_ID,
        });
      }
      window.location.reload();
    } catch (error) {
      toast.error('Houve erro');
    }
  }

  return (
    <>
      {state.loading && <Loader variant="primary" />}
      {(!state.loading) && (
        <div>
          <div>
            <div style={{ display: 'flex' }}>
              <Select
                style={{ width: '350px', marginTop: '10px', marginRight: '10px' }}
                options={state.sortedUnits}
                propLabel="comboLabel"
                value={state.combo_dielUnit}
                placeholder="Unidade Diel"
                onSelect={(item) => { setState({ combo_dielUnit: item }); }}
              />
              <Select
                style={{ width: '350px', marginTop: '10px', marginRight: '10px' }}
                options={['Diel', 'Laager']}
                propLabel="comboLabel"
                value={state.combo_supplier}
                placeholder="Fabricante"
                onSelect={(item) => { setState({ combo_supplier: item }); }}
              />
              <Select
                style={{ width: '350px', marginTop: '10px', marginRight: '10px' }}
                options={(state.combo_supplier === 'Laager' ? state.freeMeters : state.freeDmas)}
                propLabel="comboLabel"
                value={state.combo_meters}
                placeholder="Dispositivo"
                onSelect={(item) => { setState({ combo_meters: item }); }}
              />
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Button style={{ width: '100px' }} onClick={saveAssociation} variant="primary">
                  Salvar
                </Button>
              </div>
            </div>
          </div>

          <div style={{ paddingTop: '20px' }}>
            <h2>TABELA DIEL</h2>
            <TableBasic>
              <thead>
                <tr>
                  <th>Cliente DIEL</th>
                  <th>Unidades DIEL</th>
                  <th>Dispositivos Associado</th>
                </tr>
              </thead>
              <tbody>
                {(state.units || []).map((row) => (
                  <tr key={row.UNIT_ID}>
                    <td>{row.CLIENT_NAME}</td>
                    <td>{row.UNIT_NAME}</td>
                    <td>{row.meter && row.meter.dataSource}</td>
                  </tr>
                ))}
              </tbody>
            </TableBasic>
          </div>
          <div style={{ paddingTop: '20px' }}>
            <h2>TABELA DIEL</h2>
            <TableBasic>
              <thead>
                <tr>
                  <th>ID DO DMA</th>
                </tr>
              </thead>
              <tbody>
                {(state.freeDmas || []).map((row) => (
                  <tr key={row.dataSource}>
                    <td>{row.dataSource}</td>
                  </tr>
                ))}
              </tbody>
            </TableBasic>
          </div>
          <div style={{ paddingTop: '20px' }}>
            <h2>TABELA LAAGER</h2>
            <TableBasic>
              <thead>
                <tr>
                  <th>Medidor Laager</th>
                </tr>
              </thead>
              <tbody>
                {(state.freeMeters || []).map((row) => (
                  <tr key={row.dataSource}>
                    <td>{row.dataSource}</td>
                  </tr>
                ))}
              </tbody>
            </TableBasic>
          </div>

        </div>
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

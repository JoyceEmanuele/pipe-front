import { useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  Select, Button, Loader,
} from 'components';
import { useStateVar } from 'helpers/useStateVar';
import { apiCall } from 'providers';
import { Table } from './styles';

export const GreenAntMeters = (): JSX.Element => {
  const [state, render, setState] = useStateVar(() => {
    const state = {
      units: [] as {
        UNIT_ID: number
        CLIENT_NAME: string
        UNIT_NAME: string
        comboLabel?: string
        meter?: { label: string, uid?: string }
      }[],
      sortedUnits: [] as {
        comboLabel?: string
      }[],
      freeMeters: [] as {
        id: number
        organizationName: string
        label: string
        uid?: string
        comboLabel?: string
      }[],
      loading: true,
      combo_dielUnit: null as null|{ UNIT_ID: number },
      combo_greenantMeter: null as null|{ id: number },
    };
    return state;
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      state.loading = true; render();
      const { units, meters } = await apiCall('/clients/get-units-and-meters', {});
      const units2 = units.map((unit) => {
        const meter = meters.find((meter) => meter.id === unit.GA_METER);
        return Object.assign(unit, { meter });
      });
      const associatedUnits = units2.filter((x) => x.meter);
      const disassociatedUnits = units2.filter((x) => !x.meter);
      const disassociatedMeters = meters.filter((meter) => !associatedUnits.some((unit) => unit.meter === meter));
      state.units = [...associatedUnits, ...disassociatedUnits];
      state.freeMeters = disassociatedMeters;

      for (const meter of state.freeMeters) {
        meter.comboLabel = `${meter.organizationName} > ${meter.label}${meter.uid ? ` [${meter.uid}]` : ''}`;
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
      await apiCall('/clients/edit-unit', {
        UNIT_ID: unitId,
        GA_METER: (state.combo_greenantMeter || null) && state.combo_greenantMeter!.id,
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
        <div>
          <div>
            <div style={{ display: 'flex' }}>
              <Select
                style={{ width: '400px', marginTop: '10px', marginRight: '10px' }}
                options={state.sortedUnits}
                propLabel="comboLabel"
                value={state.combo_dielUnit}
                placeholder="Unidade Diel"
                onSelect={(item) => { setState({ combo_dielUnit: item }); }}
              />
              <Select
                style={{ width: '500px', marginTop: '10px', marginRight: '10px' }}
                options={state.freeMeters}
                propLabel="comboLabel"
                value={state.combo_greenantMeter}
                placeholder="Medidor GreenAnt"
                onSelect={(item) => { setState({ combo_greenantMeter: item }); }}
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
            <Table>
              <thead>
                <tr>
                  <th>Cliente DIEL</th>
                  <th>Unidades DIEL</th>
                  <th>Medidor Greenant Associado</th>
                  <th>UID Medidor GreenAnt</th>
                </tr>
              </thead>
              <tbody>
                {(state.units || []).map((row) => (
                  <tr key={row.UNIT_ID}>
                    <td>{row.CLIENT_NAME}</td>
                    <td>{row.UNIT_NAME}</td>
                    <td>{row.meter && row.meter.label}</td>
                    <td>{row.meter && row.meter.uid}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          <div style={{ paddingTop: '20px' }}>
            <h2>TABELA GREENANT</h2>
            <Table>
              <thead>
                <tr>
                  <th>Cliente GreenAnt</th>
                  <th>Medidor GreenAnt</th>
                  <th>UID Medidor GreenAnt</th>
                </tr>
              </thead>
              <tbody>
                {(state.freeMeters || []).map((row) => (
                  <tr key={row.id}>
                    <td>{row.organizationName}</td>
                    <td>{row.label}</td>
                    <td>{row.uid}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

        </div>
      )}
    </>
  );
};

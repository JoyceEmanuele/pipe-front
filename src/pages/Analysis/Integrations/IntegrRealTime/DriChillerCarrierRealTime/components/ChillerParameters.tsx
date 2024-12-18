import { Flex } from 'reflexbox';
import { Card, InputSearch, Table } from '~/components';
import {
  TopTitle,
  CellLabel,
} from './styles';
import { t } from 'i18next';
import { useEffect, useState } from 'react';
import { AddTooltipIfOverflow, GenerateItemColumn } from '~/components/Table';
import { formatNumberWithFractionDigits } from '~/helpers/thousandFormatNumber';

type RowsParameters = {
  tag: string,
  unitMeasurement: string|null,
  description: string|null,
  currentMeasurement: number|null,
  circuit: string|null,
  limits: {
    min: string|null,
    max: string|null,
  },
}[]

export default function ChillerParameters(props: { circuitAParams: any, circuitBParams: any, generalParams: any, circuitCParams?: any, hasCircuitC?: boolean, model: string }): JSX.Element {
  const [selectedCircuit, setSelectedCircuit] = useState('');
  const paramsLimitsByModel = props.model.startsWith('30xa') ? paramLimitsXA : paramLimits;
  const [generalParams, setGeneralParams] = useState<RowsParameters>([]);
  const [paramsCircuitA, setParamsCircuitA] = useState<RowsParameters>([]);
  const [paramsCircuitB, setParamsCircuitB] = useState<RowsParameters>([]);
  const [paramsCircuitC, setParamsCircuitC] = useState<RowsParameters>([]);
  const [filteredParams, setFilteredParams] = useState<RowsParameters>([]);
  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState({ column: '', desc: false });

  const isDesktop = window.matchMedia('(min-width: 768px)');

  const columns = [
    {
      Header: () => (
        GenerateItemColumn(t('descricao'), 'description', handleSort, sortBy)
      ),
      Cell: (props) => (
        AddTooltipIfOverflow(props.row.original.description, 70)
      ),
      accessor: 'description',
      disableSortBy: true,
    },
    {
      Header: () => (
        GenerateItemColumn(t('medicaoAtual'), 'currentMeasurement', handleSort, sortBy)
      ),
      Cell: (props) => (
        ReturnLabelContent(props.row.original.currentMeasurement, paramsLimitsByModel, props.row.original.tag, props.row.original.unitMeasurement)
      ),
      accessor: 'currentMeasurement',
      disableSortBy: true,
    },
    {
      Header: () => (
        GenerateItemColumn(t('limites'), 'limits', handleSort, sortBy)
      ),
      Cell: (props) => (
        ReturnLabelLimits(props.row.original.limits, props.row.original.unitMeasurement)
      ),
      accessor: 'limits',
      disableSortBy: true,
    },
    {
      Header: () => (
        GenerateItemColumn(t('circuito'), 'circuit', handleSort, sortBy)
      ),
      Cell: (props) => (
        ReturnLabelContent(props.row.original.circuit, paramsLimitsByModel)
      ),
      accessor: 'circuit',
      disableSortBy: true,
    },
  ];

  const personalizedValues = {
    CHIL_S_S: {
      0: t('parar'),
      1: t('iniciar'),
    },
    EMSTOP: {
      0: t('desligadoMin'),
      1: t('ligadoMin'),
    },
    CP_A1: {
      0: t('desligadoMin'),
      1: t('ligadoMin'),
    },
    CP_A2: {
      0: t('desligadoMin'),
      1: t('ligadoMin'),
    },
    CP_B1: {
      0: t('desligadoMin'),
      1: t('ligadoMin'),
    },
    CP_B2: {
      0: t('desligadoMin'),
      1: t('ligadoMin'),
    },
    CHIL_OCC: {
      0: t('nao'),
      1: t('sim'),
    },
    STATUS: {
      0: t('desligadoMinusculo'),
      1: t('emFuncionamento'),
      2: t('emParada'),
      3: t('emPartida'),
      4: t('Desarmado'),
      5: t('pronto'),
      6: t('forcado'),
      7: t('emDescongelamento'),
      8: t('emTesteCarga'),
      9: t('teste'),
    },
    CTRL_TYP: {
      0: t('local'),
      1: t('rede'),
      2: t('remoto'),
    },
    SLC_HM: {
      0: t('nao'),
      1: t('sim'),
    },
    DEM_LIM: {
      0: t('desativado'),
      1: t('ativado'),
      100: t('ativado'),
    },
    SP_OCC: {
      0: t('desativado'),
      1: t('ativado'),
    },
  };

  useEffect(() => {
    const circuitAParams = buildRowsFromParams(props.circuitAParams, 'A');
    const circuitBParams = buildRowsFromParams(props.circuitBParams, 'B');
    const circuitCParams = buildRowsFromParams(props.circuitCParams, 'C');
    const generalParams = buildRowsFromParams(props.generalParams, '');

    setParamsCircuitA(circuitAParams);
    setParamsCircuitB(circuitBParams);
    setParamsCircuitC(circuitCParams);

    setGeneralParams(generalParams);

    if (searchText) {
      handleSearch();
    } else if (!selectedCircuit) {
      setFilteredParams([
        ...generalParams,
        ...circuitAParams,
        ...circuitBParams,
        ...(props.hasCircuitC ? circuitCParams : []),
      ]);
    } else if (selectedCircuit === 'A') {
      setFilteredParams(circuitAParams);
    } else if (selectedCircuit === 'B') {
      setFilteredParams(circuitBParams);
    } else {
      setFilteredParams(circuitCParams);
    }

    if (sortBy.column) handleOrderRows(sortBy, filteredParams);
  }, [props]);

  function returnUnitMeasurementFormated(unitMeasurement) {
    if (unitMeasurement.toLowerCase() === 'horas') {
      return t('h');
    }
    if (unitMeasurement.toLowerCase() === 'kpa') {
      return 'kPa';
    }
    return unitMeasurement;
  }

  function buildRowsFromParams(params, circuitType) {
    const rows: RowsParameters = [];

    if (params) {
      Object.entries(params).forEach(([key, obj]: [string, any]) => {
        const param = obj;
        const unitMeasurement = param.unitMeasurement ?? '';

        rows.push({
          tag: key,
          description: t(`descricao_${key}`),
          currentMeasurement: key in personalizedValues ? personalizedValues[key][param.value] || '-' : param.value,
          limits: {
            min: paramsLimitsByModel[key]?.min,
            max: paramsLimitsByModel[key]?.max,
          },
          circuit: circuitType || t('geral'),
          unitMeasurement: returnUnitMeasurementFormated(unitMeasurement),
        });
      });
    }
    return rows;
  }

  function handleClickCircuitType(circuitType: string) {
    setSelectedCircuit(circuitType);
    setSearchText('');
    setSortBy({ column: '', desc: false });

    verifyCircuitType(circuitType);
  }

  function verifyCircuitType(circuitType) {
    let filteredRows: RowsParameters = [];
    if (!circuitType) {
      filteredRows = [
        ...generalParams,
        ...paramsCircuitA,
        ...paramsCircuitB,
        ...(props.hasCircuitC ? paramsCircuitC : []),
      ];
    } else if (circuitType === 'A') {
      filteredRows = paramsCircuitA;
    } else if (circuitType === 'C') {
      filteredRows = paramsCircuitC;
    } else {
      filteredRows = paramsCircuitB;
    }

    setFilteredParams(filteredRows);
    return filteredRows;
  }

  function handleSearch(search?: string) {
    let filteredRows: RowsParameters = [];
    if (!selectedCircuit) {
      filteredRows = [
        ...generalParams,
        ...paramsCircuitA,
        ...paramsCircuitB,
        ...(props.hasCircuitC ? paramsCircuitC : []),
      ].filter((row) => Object.values(row).some((value) => value?.toString().toLowerCase().includes((search ?? searchText).toLowerCase())));
    } else if (selectedCircuit === 'A') {
      filteredRows = paramsCircuitA.filter((row) => Object.values(row).some((value) => value?.toString().toLowerCase().includes((search ?? searchText).toLowerCase())));
    } else if (selectedCircuit === 'B') {
      filteredRows = paramsCircuitB.filter((row) => Object.values(row).some((value) => value?.toString().toLowerCase().includes((search ?? searchText).toLowerCase())));
    } else if (props.hasCircuitC) {
      filteredRows = paramsCircuitC.filter((row) => Object.values(row).some((value) => value?.toString().toLowerCase().includes((search ?? searchText).toLowerCase())));
    }

    setFilteredParams(filteredRows);
    return filteredRows;
  }

  function handleChangeSearchText(value) {
    setSearchText(value);
    const filteredRows = value ? handleSearch(value) : verifyCircuitType(selectedCircuit);

    if (sortBy.column) handleOrderRows(sortBy, filteredRows);
  }

  function handleSort(column: string) {
    let sortByAux: { column: string; desc: boolean; };

    if (sortBy.column === column) {
      sortByAux = { ...sortBy, desc: !sortBy.desc };
    } else {
      sortByAux = { column, desc: true };
    }

    setSortBy(sortByAux);
    handleOrderRows(sortByAux, filteredParams);
  }

  function handleOrderRows(sortBy, rows: RowsParameters) {
    const sortedParams = [...rows].sort((a, b) => {
      const columnA = a[sortBy.column];
      const columnB = b[sortBy.column];

      if (sortBy.column === 'limits') {
        return handleSortLimits(columnA.min, columnB.min, sortBy);
      }

      return handleOrderAux(columnA, columnB, sortBy);
    });

    setFilteredParams(sortedParams);
  }

  function handleOrderAux(columnA, columnB, sortBy) {
    const isStringA = typeof columnA === 'string';
    const isStringB = typeof columnB === 'string';

    if (isStringA && isStringB) {
      return columnA.localeCompare(columnB) * (sortBy.desc ? -1 : 1);
    }
    if (!isStringA && !isStringB) {
      return (columnA - columnB) * (sortBy.desc ? -1 : 1);
    }

    return isStringA ? 1 : -1;
  }

  function handleSortLimits(columnAValue, columnBValue, sortBy) {
    if (columnAValue == null) return sortBy.desc ? 1 : -1;
    if (columnBValue == null) return sortBy.desc ? -1 : 1;

    return (columnAValue - columnBValue) * (sortBy.desc ? -1 : 1);
  }

  function getGridColumns() {
    const isDesktopView = isDesktop.matches;

    if (props.hasCircuitC) {
      return isDesktopView ? '10% 10px 10% 10px 10% 10px 10% auto' : '20% 10px 20% 10px 20% 10px 20% auto';
    }

    return isDesktopView ? '10% 10px 10% 10px 10% auto' : '20% 10px 20% 10px 20% auto';
  }

  return (
    <Card overflowHidden noPadding wrapperStyle={{ marginTop: '10px' }}>
      <Flex flexDirection={isDesktop.matches ? 'row' : 'column'} mt="10px" mb="10px">
        <Flex
          flexWrap="wrap"
          justifyContent="space-between"
          alignItems="center"
          margin="10px 0 20px 20px"
        >
          <TopTitle>{t('parametros')}</TopTitle>
        </Flex>
        <Flex alignItems="right" margin={isDesktop.matches ? '0 20px 0 auto' : '10px auto 0 20px'}>
          <InputSearch
            id="search"
            name="search"
            placeholder={t('pesquisar')}
            value={searchText}
            onChange={(e) => { handleChangeSearchText(e.target.value); }}
            style={{
              border: '1px solid lightgrey',
              boxShadow: 'none',
              height: '10px',
            }}
          />
        </Flex>
      </Flex>
      <>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: getGridColumns(),
            height: '10px',
          }}
        >
          <span
            style={{
              borderTop: '1px solid lightgrey',
              borderLeft: '1px solid lightgrey',
              borderRight: '1px solid lightgrey',
              borderRadius: '6px 6px 0 0',
              backgroundColor: !selectedCircuit ? 'transparent' : '#f4f4f4',
            }}
          />
          <span />
          <span
            style={{
              border: '1px solid lightgrey',
              borderBottom: 'none',
              borderRadius: '6px 6px 0 0',
              backgroundColor: selectedCircuit === 'A' ? 'transparent' : '#f4f4f4',
            }}
          />
          <span />
          <span
            style={{
              border: '1px solid lightgrey',
              borderBottom: 'none',
              borderRadius: '6px 6px 0 0',
              backgroundColor: selectedCircuit === 'B' ? 'transparent' : '#f4f4f4',
            }}
          />
          <span />
          { props.hasCircuitC && (
            <>
              <span
                style={{
                  border: '1px solid lightgrey',
                  borderBottom: 'none',
                  borderRadius: '6px 6px 0 0',
                  backgroundColor: selectedCircuit === 'C' ? 'transparent' : '#f4f4f4',
                }}
              />
              <span />
            </>
          )}
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: getGridColumns(),
            marginBottom: '10px',
          }}
        >
          <CircuitTypeButton
            circuitType=""
            selectedCircuit={selectedCircuit}
            handleClick={handleClickCircuitType}
          />
          <CircuitTypeButton
            circuitType="A"
            selectedCircuit={selectedCircuit}
            handleClick={handleClickCircuitType}
          />
          <CircuitTypeButton
            circuitType="B"
            selectedCircuit={selectedCircuit}
            handleClick={handleClickCircuitType}
          />
          {props.hasCircuitC && (
          <CircuitTypeButton
            circuitType="C"
            selectedCircuit={selectedCircuit}
            handleClick={handleClickCircuitType}
          />
          )}
        </div>
        <Table
          columns={columns}
          data={filteredParams}
          noBorderBottom
          style={{
            padding: '0px 10px',
            boxShadow: 'none',
            maxHeight: '300px',
            overflowY: filteredParams.length > 7 ? 'scroll' : 'hidden',
          }}
        />
      </>
    </Card>
  );
}

function GetTemperatureColor(value: number, variable: string, paramsLimitsByModel: TParamLimits) {
  const limits = paramsLimitsByModel[variable];
  if (!limits) return '#E9E9E9';
  const { min, max } = limits;
  if (min == null || max == null) return 'transparent';
  if (value >= min && value <= max) return '#4EB73B';
  if (value < min) return '#2D81FF';
  return '#FF1818';
}

function ReturnLabelContent(value, paramsLimitsByModel: TParamLimits, tag?: string, unitMeasurement?: string) {
  const valueCell = value ?? '-';
  return (
    <CellLabel>
      {tag && value != null ? (
        <>
          <div style={{ display: 'inline-block', marginRight: '5px' }}>
            <div
              style={{
                width: '10px', height: '10px', backgroundColor: GetTemperatureColor(value, tag, paramsLimitsByModel), borderRadius: '2px',
              }}
            />
          </div>
          <div style={{ display: 'inline-block' }}>
            <div>
              <strong>{formatValue(valueCell)}</strong>
              {` ${unitMeasurement ?? ''}`}
            </div>
          </div>
        </>
      ) : (
        <div>{valueCell}</div>
      )}
    </CellLabel>
  );
}

function ReturnLabelLimits(limits?: { min?: string, max?: string }, unitMeasurement?: string) {
  return (
    <>
      {(limits?.min != null && limits?.max != null) ? (
        <div style={{ display: 'inline-block', color: '#8f8f8f' }}>
          <div style={{ display: 'inline-block', fontWeight: '550' }}>{formatValue(limits?.min)}</div>
          {` ${unitMeasurement} - `}
          <div style={{ display: 'inline-block', fontWeight: '550' }}>{formatValue(limits?.max)}</div>
          {` ${unitMeasurement}`}
        </div>
      ) : (
        <div>-</div>
      )}
    </>
  );
}

function ReturnColumnBackground(selectedCategory: string, category: string) {
  return (!selectedCategory && selectedCategory === category) || selectedCategory === category ? 'transparent' : '#f4f4f4';
}

function ReturnBorderBottom(selectedCategory: string, category: string) {
  return (!selectedCategory && selectedCategory === category) || selectedCategory === category ? 'none' : '1px solid lightgrey';
}

function ReturnFontWeight(selectedCategory: string, category: string) {
  return (!selectedCategory && selectedCategory === category) || selectedCategory === category ? '600' : '400';
}

function CircuitTypeButton({
  circuitType,
  selectedCircuit,
  handleClick,
}) {
  return (
    <>
      <span
        style={{
          borderLeft: circuitType && '1px solid lightgrey',
          borderRight: '1px solid lightgrey',
          textAlign: 'center',
          borderBottom: ReturnBorderBottom(selectedCircuit, circuitType),
          backgroundColor: ReturnColumnBackground(selectedCircuit, circuitType),
          fontWeight: ReturnFontWeight(selectedCircuit, circuitType),
          cursor: 'pointer',
          paddingBottom: '10px',
        }}
        onClick={() => handleClick(circuitType)}
      >
        {t(circuitType ? `circuito${circuitType}` : 'todos')}
      </span>
      <span
        style={{
          borderBottom: '1px solid lightgrey',
        }}
      />
    </>
  );
}

function formatValue(value) {
  const numberValue = parseFloat(value);

  if (!Number.isNaN(numberValue)) {
    const formattedNumber = formatNumberWithFractionDigits(value);
    return `${formattedNumber}`;
  }

  return `${value}`;
}

type Limit = {
  min: number | null;
  max: number | null;
};

type TParamLimits = {
  [key: string]: Limit;
};

const paramLimits = {
  CP_A1: { min: null, max: null },
  CP_A2: { min: null, max: null },
  CAPA_T: { min: 20, max: 100 },
  DP_A: { min: 550, max: 1000 },
  SP_A: { min: 200, max: 350 },
  SCT_A: { min: 26, max: 43 },
  SST_A: { min: 2, max: 12 },
  CPA1_OP: { min: 450, max: 900 },
  CPA2_OP: { min: 450, max: 900 },
  DOP_A1: { min: 110, max: 350 },
  DOP_A2: { min: 110, max: 350 },
  CPA1_DGT: { min: 10, max: 130 },
  CPA2_DGT: { min: 10, max: 130 },
  EXV_A: { min: 0, max: 100 },
  HR_CP_A1: { min: 0, max: 30000 },
  HR_CP_A2: { min: 0, max: 30000 },
  CPA1_TMP: { min: 25, max: 100 },
  CPA2_TMP: { min: 25, max: 100 },
  CPA1_CUR: { min: 0, max: 151 },
  CPA2_CUR: { min: 0, max: 151 },
  CP_B1: { min: null, max: null },
  CP_B2: { min: null, max: null },
  CAPB_T: { min: 40, max: 100 },
  DP_B: { min: 550, max: 1000 },
  SP_B: { min: 200, max: 350 },
  SCT_B: { min: 26, max: 43 },
  SST_B: { min: 2, max: 12 },
  CPB1_OP: { min: 450, max: 900 },
  CPB2_OP: { min: 450, max: 900 },
  DOP_B1: { min: 100, max: 350 },
  DOP_B2: { min: 100, max: 350 },
  CPB1_DGT: { min: 10, max: 130 },
  CPB2_DGT: { min: 10, max: 130 },
  EXV_B: { min: 0, max: 100 },
  HR_CP_B1: { min: null, max: null },
  HR_CP_B2: { min: null, max: null },
  CPB1_TMP: { min: 25, max: 100 },
  CPB2_TMP: { min: 25, max: 100 },
  CPB1_CUR: { min: 0, max: 151 },
  CPB2_CUR: { min: 0, max: 151 },
  CHIL_S_S: { min: null, max: null },
  CAP_T: { min: 10, max: 100 },
  DEM_LIM: { min: null, max: null },
  LAG_LIM: { min: 0, max: 100 },
  SP: { min: 5, max: 10 },
  CTRL_PNT: { min: 5, max: 10 },
  EMSTOP: { min: null, max: null },
  COND_LWT: { min: 25, max: 50 },
  COND_EWT: { min: 20, max: 45 },
  COOL_LWT: { min: 4, max: 15 },
  COOL_EWT: { min: 6.8, max: 21 },
  COND_SP: { min: 20, max: 29.5 },
  CHIL_OCC: { min: null, max: null },
  STATUS: { min: null, max: null },
  OP_A: { min: 450, max: 900 },
  SLT_A: { min: null, max: null },
  OP_B: { min: 450, max: 900 },
  SLT_B: { min: null, max: null },
  CTRL_TYP: { min: null, max: null },
  SLC_HM: { min: null, max: null },
  SP_OCC: { min: null, max: null },
  OAT: { min: null, max: null },
  HR_MACH: { min: null, max: null },
  HR_MACH_B: { min: null, max: null },
  HR_CP_A: { min: null, max: null },
  HR_CP_B: { min: null, max: null },
  SST_C: { min: 2, max: 12 },
  SCT_C: { min: 26, max: 46 },
  OP_C: { min: 450, max: 900 },
  SP_C: { min: 200, max: 350 },
  DP_C: { min: 550, max: 1000 },

};

const paramLimitsXA = {
  CP_A1: { min: null, max: null },
  CP_A2: { min: null, max: null },
  CAPA_T: { min: 20, max: 100 },
  DP_A: { min: 550, max: 1500 },
  SP_A: { min: 200, max: 350 },
  SCT_A: { min: 26, max: 55 },
  SST_A: { min: 2, max: 12 },
  CPA1_OP: { min: 450, max: 900 },
  CPA2_OP: { min: 450, max: 900 },
  DOP_A1: { min: 110, max: 350 },
  DOP_A2: { min: 110, max: 350 },
  CPA1_DGT: { min: 10, max: 130 },
  CPA2_DGT: { min: 10, max: 130 },
  EXV_A: { min: 0, max: 100 },
  HR_CP_A1: { min: 0, max: 30000 },
  HR_CP_A2: { min: 0, max: 30000 },
  CPA1_TMP: { min: 25, max: 100 },
  CPA2_TMP: { min: 25, max: 100 },
  CPA1_CUR: { min: 0, max: 151 },
  CPA2_CUR: { min: 0, max: 151 },
  CP_B1: { min: null, max: null },
  CP_B2: { min: null, max: null },
  CAPB_T: { min: 40, max: 100 },
  DP_B: { min: 550, max: 1500 },
  SP_B: { min: 200, max: 350 },
  SCT_B: { min: 26, max: 55 },
  SST_B: { min: 2, max: 12 },
  CPB1_OP: { min: 450, max: 900 },
  CPB2_OP: { min: 450, max: 900 },
  DOP_B1: { min: 100, max: 350 },
  DOP_B2: { min: 100, max: 350 },
  CPB1_DGT: { min: 10, max: 130 },
  CPB2_DGT: { min: 10, max: 130 },
  EXV_B: { min: 0, max: 100 },
  HR_CP_B1: { min: null, max: null },
  HR_CP_B2: { min: null, max: null },
  CPB1_TMP: { min: 25, max: 100 },
  CPB2_TMP: { min: 25, max: 100 },
  CPB1_CUR: { min: 0, max: 151 },
  CPB2_CUR: { min: 0, max: 151 },
  CHIL_S_S: { min: null, max: null },
  CAP_T: { min: 10, max: 100 },
  DEM_LIM: { min: null, max: null },
  LAG_LIM: { min: 0, max: 100 },
  SP: { min: 5, max: 10 },
  CTRL_PNT: { min: 5, max: 10 },
  EMSTOP: { min: null, max: null },
  COND_LWT: { min: 25, max: 50 },
  COND_EWT: { min: 20, max: 45 },
  COOL_LWT: { min: 4, max: 15 },
  COOL_EWT: { min: 6.8, max: 21 },
  COND_SP: { min: 20, max: 29.5 },
  CHIL_OCC: { min: null, max: null },
  STATUS: { min: null, max: null },
  OP_A: { min: 450, max: 1300 },
  SLT_A: { min: null, max: null },
  OP_B: { min: 450, max: 1300 },
  SLT_B: { min: null, max: null },
  CTRL_TYP: { min: null, max: null },
  SLC_HM: { min: null, max: null },
  SP_OCC: { min: null, max: null },
  OAT: { min: null, max: null },
  HR_MACH: { min: null, max: null },
  HR_MACH_B: { min: null, max: null },
  HR_CP_A: { min: null, max: null },
  HR_CP_B: { min: null, max: null },
  SST_C: { min: 2, max: 12 },
  SCT_C: { min: 26, max: 55 },
  OP_C: { min: 450, max: 1300 },
  SP_C: { min: 200, max: 350 },
  DP_C: { min: 550, max: 1500 },
};

import { useEffect } from 'react';

import { useStateVar } from 'helpers/useStateVar';

import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceArea,
  ResponsiveContainer,
} from 'recharts';

export const colorPalete = [
  '#1F77B4',
  '#FF7F0E',
  '#2CA02C',
  '#D62728',
  '#9467BD',
  '#8C564B',
  '#E377C2',
  '#7F7F7F',
  '#BCBD22',
  '#17BECF',
];

export function ChartLine(props: {
  commonX: number[]
  varsInfo: {
    name: string
    unit?: string
    color: string
    axisId: string
    y: (number|null)[]
    type?: 'step'|'linear' // https://github.com/d3/d3-shape#curves
  }[]
  axisInfo: {
    x: {
      domain: [number|string, number|string] // [minX, maxX], ['dataMin', 'dataMax+50']
    }
    y: {
      [axisId: string]: {
        domain: [number|string, number|string] // [minY, maxY]
        orientation?: 'right'
      }
    }
  }
  numDays?: number
  tooltipXLabelFormater?: (x: number) => string
  formaterXTick?: (x: number) => string
  tickSecondX?: (x: any) => JSX.Element
}) {
  const [state, _render, setState] = useStateVar({
    indexes: props.commonX.map((_v, i) => i),
    commonX: props.commonX,
    xDomain: null as null|([number, number]),
    refAreaLeft: null as null|number,
    refAreaRight: null as null|number,
  });

  useEffect(() => {
    setState({
      indexes: props.commonX.map((_v, i) => i),
      commonX: props.commonX,
    });
  }, props.commonX);

  function zoom() {
    let { refAreaLeft, refAreaRight } = state;

    if (refAreaLeft === refAreaRight || refAreaRight == null || refAreaLeft == null) {
      setState({
        refAreaLeft: null,
        refAreaRight: null,
      });
      return;
    }

    // xAxis domain
    if (refAreaLeft > refAreaRight) [refAreaLeft, refAreaRight] = [refAreaRight, refAreaLeft];

    setState({
      refAreaLeft: null,
      refAreaRight: null,
      indexes: state.indexes.slice(),
      xDomain: [refAreaLeft, refAreaRight],
    });
  }

  function zoomOut() {
    setState({
      refAreaLeft: null,
      refAreaRight: null,
      indexes: state.indexes.slice(),
      xDomain: null,
    });
  }

  function toolTipFormater(
    value: number,
    _accessor: string|Function,
    _payload: {
      value: number,
      payload: number // x index
    },
    index: number,
  ) {
    const varInfo = (index < props.varsInfo.length) && props.varsInfo[index];
    const name = (varInfo && varInfo.name) || String(index);
    return `${name}: ${value}${(varInfo && varInfo.unit) || ''}`;
  }

  return (
    <div className="highlight-bar-charts" style={{ userSelect: 'none', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'right' }}>
        <button type="button" className="btn update" onClick={zoomOut}>
          Zoom Out
        </button>
      </div>

      <ResponsiveContainer width="100%" height={700}>
        <LineChart
          width={800}
          height={700}
          data={state.indexes}
          onMouseDown={(e) => { setState({ refAreaLeft: e?.activeLabel }); }}
          onMouseMove={(e) => { (state.refAreaLeft != null) && setState({ refAreaRight: e.activeLabel }); }}
          onMouseUp={zoom}
        >
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis allowDataOverflow dataKey={(i) => state.commonX[i]} domain={state.xDomain || props.axisInfo.x.domain} type="number" tickFormatter={props.formaterXTick} />
          {props.numDays && props.numDays > 1 ? (<XAxis allowDataOverflow xAxisId="1" tickLine={false} axisLine={false} allowDuplicatedCategory={false} tick={props.tickSecondX} type="number" dataKey={(i) => state.commonX[i]} domain={state.xDomain || props.axisInfo.x.domain} />) : null}
          {Object.entries(props.axisInfo.y).map(([axisId, axisInfo]) => (
            <YAxis key={axisId} orientation={axisInfo.orientation} allowDataOverflow domain={axisInfo.domain} type="number" yAxisId={axisId} />
          ))}

          <Tooltip isAnimationActive={false} cursor={{ stroke: 'red', strokeWidth: 1 }} labelFormatter={props.tooltipXLabelFormater} formatter={toolTipFormater} />

          {props.varsInfo.map((varInfo) => (
            <Line key={varInfo.name} yAxisId={varInfo.axisId} type={varInfo.type || 'step'} dataKey={(i) => varInfo.y[i]} dot={false} stroke={varInfo.color} animationDuration={300} />
          ))}

          {state.refAreaLeft && state.refAreaRight ? (
            <ReferenceArea yAxisId={Object.keys(props.axisInfo.y)[0]} x1={state.refAreaLeft} x2={state.refAreaRight} strokeOpacity={0.3} />
          ) : null}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// <Tooltip isAnimationActive={false} cursor={{ stroke: 'red', strokeWidth: 1 }} content={<CustomTooltip />} />
// function CustomTooltip (props: {
//   active: boolean
//   payload: {
//     name: string
//     value: number
//     payload: {}
//   }[]
//   label: string
// }) {
//   const { active, payload, label } = props;
//   if (active && payload && payload.length >= 2) {
//     const groupInfo = payload[0].payload;
//     let temperature: number | null = null;
//     if (payload[1].name === 'temp') {
//       temperature = payload[1].value;
//     }
//     const hora = String(Math.trunc(payload[0].value)).padStart(2, '0');
//     const minuto = String(Math.trunc((payload[0].value % 1) * 60)).padStart(2, '0');
//     return (<div>...</div>);
//   }
//   return null;
// }

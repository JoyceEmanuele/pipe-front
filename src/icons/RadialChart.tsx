import { useState, useEffect } from 'react';

import { RadialBar, RadialBarChart } from 'recharts';

import { colors } from '../styles/colors';

type RadialChartIconProps = {
  data?: any;
  fill?: string;
}

type GraphData = {
  name: string;
  value: number;
  fill: string;
};

export const RadialChartIcon = ({ data = 0, fill }: RadialChartIconProps): JSX.Element => {
  const [graphData, setGraphData] = useState<GraphData[]>([]);

  useEffect(() => {
    setGraphData([
      {
        name: '18-24',
        value: 24,
        fill: colors.White,
      },
      {
        name: '18-24',
        value: 24,
        fill: colors.White,
      },
      {
        name: '18-24',
        value: 24,
        fill: colors.White,
      },
      {
        name: 'unknow',
        value: data,
        fill: (fill || colors.BlueChart),
      },
    ]);
  }, [data]);

  return (
    <RadialBarChart width={202} height={202} data={graphData} startAngle={90} endAngle={-270}>
      <RadialBar legendType="none" minAngle={15} clockWise dataKey="value" />
    </RadialBarChart>
  );
};

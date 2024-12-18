import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import i18n from '~/i18n';
import { Button, Card, Loader } from '~/components';
import {
  CardHeader, LoaderOverlay, TabOption, TabOptions, TelemetryCard,
} from './styles';
import { Heatmap } from './Heatmap';
import { Linechart } from './Linechart';
import { ApiResps } from '~/providers';

interface TelemetryDemandCardProps {
  loading: boolean;
  telemetryData: ApiResps['/energy/get-demand-hist'],
  filterMode: string;
  handleChangeRangeType: (day: string) => void;
  backBarchart: () => void;
  cardLabel: string;
  startDate: string;
  endDate: string;
}

export const TelemetryDemandCard: React.FC<TelemetryDemandCardProps> = ({
  loading, telemetryData, filterMode, handleChangeRangeType, backBarchart, cardLabel, startDate, endDate,
}) => {
  moment.locale(i18n.language === 'pt' ? 'pt-BR' : 'en');
  const { t } = useTranslation();

  const [typeChart, setTypeChart] = useState<string>(filterMode);

  const chartFactory = {
    heatmap: <Heatmap
      telemetryData={telemetryData}
      startDate={startDate}
      endDate={endDate}
      handleClick={({ name }) => {
        const date = moment(new Date(name)).format('YYYY-MM-DD');
        setTypeChart('linechart');
        handleChangeRangeType(date);
      }}
    />,
    linechart: <Linechart telemetryData={telemetryData} />,
  };

  useEffect(() => {
    if (filterMode) setTypeChart(filterMode);
  }, [filterMode]);

  return (
    <Card noPadding>
      <TelemetryCard>
        <CardHeader>
          <div>
            <h2>{t('demanda')}</h2>
            {typeChart === 'linechart' && (
              <Button
                variant="borderblue"
                style={{
                  width: 'fit-content', padding: '2px 15px', marginLeft: '20px', fontSize: '12px',
                }}
                onClick={() => {
                  backBarchart();
                  setTypeChart('heatmap');
                }}
              >
                {t('voltar')}
              </Button>
            )}
          </div>
          <span>
            {cardLabel}
          </span>

        </CardHeader>
        <div>
          <TabOptions>
            <TabOption active>
              {t('ativa')}
            </TabOption>
            {/* <TabOption>
            {t('reativa')}
          </TabOption> */}
          </TabOptions>
        </div>
        {chartFactory[typeChart]}

        {loading && (
          <LoaderOverlay>
            <Loader variant="primary" size="large" />
          </LoaderOverlay>
        )}
      </TelemetryCard>
    </Card>
  );
};

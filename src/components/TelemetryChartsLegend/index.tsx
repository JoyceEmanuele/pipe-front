import moment from 'moment';
import { CardFooter, FooterInfos } from './styles';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';
import { Divider } from '../Divider';
import { convertEnergy } from '../../helpers';
// eslint-disable-next-line import/no-duplicates
import { format } from 'date-fns';
// eslint-disable-next-line import/no-duplicates
import { ptBR, enUS } from 'date-fns/locale';
import { ApiResps } from '../../providers';
import { formatNumberWithFractionDigits } from '~/helpers/thousandFormatNumber';

interface TelemetryChartsLegendProps {
  telemetryData: ApiResps['/energy/get-demand-hist']
}

export const TelemetryChartsLegend: React.FC<TelemetryChartsLegendProps> = ({ telemetryData }) => {
  moment.locale(i18n.language === 'pt' ? 'pt-BR' : 'en');
  const { t } = useTranslation();

  return (
    <CardFooter>
      <Divider height={1} />
      <FooterInfos>
        <div className="infos">
          <div>
            <p>
              {t('max')}
              :
              {' '}
              {telemetryData.max_demand?.value != null ? formatNumberWithFractionDigits(convertEnergy(Number(telemetryData.max_demand.value))[0].toFixed(1)) : '-'}
              <span>
                {telemetryData.max_demand?.value != null ? convertEnergy(Number(telemetryData.max_demand.value))[1] : ''}
              </span>
            </p>
            <span>
              {telemetryData.max_demand?.timestamp && telemetryData.max_demand?.timestamp !== '' ? format(new Date(telemetryData.max_demand?.timestamp), 'dd LLL yyyy | HH:mm', { locale: i18n.language === 'pt' ? ptBR : enUS }) : ''}
            </span>
          </div>
          <div>
            <p>
              {t('media')}
              :
              {' '}
              {telemetryData.avg_demand != null ? formatNumberWithFractionDigits(convertEnergy(Number(telemetryData.avg_demand))[0].toFixed(1)) : '-'}
              <span>
                {telemetryData.avg_demand != null ? convertEnergy(Number(telemetryData.avg_demand))[1] : ''}
              </span>
            </p>
          </div>
          <div>
            <p>
              {t('min')}
              :
              {' '}
              {telemetryData.min_demand?.value != null ? formatNumberWithFractionDigits(convertEnergy(Number(telemetryData.min_demand.value))[0].toFixed(1)) : '-'}
              <span>
                {telemetryData.min_demand?.value != null ? convertEnergy(Number(telemetryData.min_demand.value))[1] : ''}
              </span>
            </p>
            <span>
              {telemetryData.min_demand?.timestamp ? format(new Date(telemetryData.min_demand?.timestamp), 'dd LLL yyyy | HH:mm', { locale: i18n.language === 'pt' ? ptBR : enUS }) : ''}
            </span>
          </div>
        </div>
      </FooterInfos>
    </CardFooter>
  ); };

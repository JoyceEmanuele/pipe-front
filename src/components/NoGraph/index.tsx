import {
  ComparativeIcon,
} from '../../icons';
import { colors } from '../../styles/colors';
import { Container } from './styles';
import { t } from 'i18next';
import { Card } from 'components';

export const NoGraph = (props): JSX.Element => {
  const { title, type } = props;

  function getDescription() {
    return type ? type === 'integratedAnalysis' ? t('selecioneUmaDataAnaliseIntegrada') : t('selecioneUmaDataIndiceDeUso') : t('selecioneUmaDataHistorico');
  }
  return (
    <Card>
      <Container>
        <ComparativeIcon color="#7D7D7D" width="42" height="42" />
        <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
          {title}
        </span>
        <span style={{
          width: '80%',
          maxWidth: '340px',
          textAlign: 'center',
          fontSize: '12px',
          fontWeight: '500',
        }}
        >
          { getDescription() }
        </span>
      </Container>
    </Card>
  ); };

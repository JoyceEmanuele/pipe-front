import {
  OutOfSpecificationIcon,
  UrgentMaintenanceIcon,
  OperatingCorrectlyIcon,
  ImminentRiskIcon,
  UnknownHealthIcon,
  UnknownHealthDarkIcon,
  HealthDisabledIcon,
  NewImminentRiskIcon,
} from '../../icons';
import { IconWrapperHealth } from '../../pages/Analysis/styles';
import { colors } from '../../styles/colors';
import i18n from '../../i18n';
import { HealthWrapper } from './styles';

const t = i18n.t.bind(i18n);

type HealthIconProps = {
  health: any;
  label?: string;
}

export const HealthIcon = ({ health, label }: HealthIconProps): JSX.Element => {
  switch (health) {
    case '25':
      return (
        <HealthWrapper color={colors.Red}>
          <UrgentMaintenanceIcon color={colors.Red} />
          {label && <span>{label}</span>}
        </HealthWrapper>
      );
    case '50':
      return (
        <HealthWrapper color={colors.Orange}>
          <ImminentRiskIcon color={colors.Orange} />
          {label && <span>{label}</span>}
        </HealthWrapper>
      );
    case '75':
      return (
        <HealthWrapper color={colors.Yellow}>
          <OutOfSpecificationIcon color={colors.Yellow} />
          {label && <span>{label}</span>}
        </HealthWrapper>
      );
    case '100':
      return (
        <HealthWrapper color={colors.Green}>
          <OperatingCorrectlyIcon color={colors.Green} />
          {label && <span>{label}</span>}
        </HealthWrapper>
      );
    case '4':
      return (
        <HealthWrapper color="#555555">
          <HealthDisabledIcon color="#555555" />
          {label && <span>{label}</span>}
        </HealthWrapper>
      );
    case '2':
      return (
        <HealthWrapper color={colors.Grey200}>
          <UnknownHealthIcon color={colors.Grey200} />
          {label && <span>{label}</span>}
        </HealthWrapper>
      );
    default:
      return (
        <HealthWrapper color={colors.Grey200}>
          <UnknownHealthIcon color={colors.Grey200} />
          {label && <span>{label}</span>}
        </HealthWrapper>
      );
  }
};

export function formatHealthIcon(health, color = 'white') {
  switch (health) {
    case 25: return <UrgentMaintenanceIcon color={color} />;
    case 50: return <NewImminentRiskIcon color={color} />;
    case 75: return <OutOfSpecificationIcon color={color} />;
    case 100: return <OperatingCorrectlyIcon color={color} />;
    case 4: return <HealthDisabledIcon color={color} />;
    default: return <UnknownHealthDarkIcon color={color} />;
  }
}

export function labelDescHealth(health) {
  switch (health) {
    case 25: return '[MANUTENÇÃO URGENTE]';
    case 50: return '[RISCO IMINENTE]';
    case 75: return '[FORA DA ESPECIFICAÇÃO]';
    case 100: return '[OPERANDO CORRETAMENTE]';
    case 4: return '[MÁQUINA DESATIVADA]';
    default: return '[DESCONHECIDO]';
  }
}

export const healthLevelDesc: { [level: string]: string } = {
  // '0': 'Sem informação',
  // '1': 'Recém instalado',
  // '3': 'Não monitorado',
  2: t('equipamentoOffline'),
  4: t('maquinaDesativada'),
  25: t('manutencaoUrgente'),
  50: t('riscoIminente'),
  75: t('foraDeEspecificacao'),
  100: t('operandoCorretamente'),
};

export function unitsHealthIcon(H_INDEX: number) {
  if (H_INDEX === 25) {
    return (
      <UrgentMaintenanceIcon
        style={{
          minWidth: 20, minHeight: 20, maxWidth: 20, maxHeight: 20,
        }}
        color={colors.Red}
      />
    );
  }
  if (H_INDEX === 50) {
    return (
      <ImminentRiskIcon
        style={{
          minWidth: 24, minHeight: 24, maxWidth: 24, maxHeight: 24,
        }}
        color={colors.Orange}
      />
    );
  }
  if (H_INDEX === 75) {
    return (
      <OutOfSpecificationIcon
        style={{
          minWidth: 24, minHeight: 24, maxWidth: 24, maxHeight: 24,
        }}
        color={colors.Yellow}
      />
    );
  }
  if (H_INDEX === 100) {
    return (
      <OperatingCorrectlyIcon
        style={{
          minWidth: 24, minHeight: 24, maxWidth: 24, maxHeight: 24,
        }}
        color={colors.Green}
      />
    );
  }
  if (H_INDEX === 4) {
    return (
      <HealthDisabledIcon
        style={{
          minWidth: 20, minHeight: 20, maxWidth: 20, maxHeight: 20,
        }}
        color="#555555"
      />
    );
  }
  return (
    <UnknownHealthIcon
      style={{
        minWidth: 20, minHeight: 20, maxWidth: 20, maxHeight: 20,
      }}
      color={colors.Grey200}
    />
  );
}

export function NewUnitsHealthIcon({ H_INDEX }) {
  if (H_INDEX === 25) {
    return (
      <IconWrapperHealth style={{ backgroundColor: '#E00030' }}>
        <UrgentMaintenanceIcon color="white" />
      </IconWrapperHealth>
    );
  }
  if (H_INDEX === 50) {
    return (
      <IconWrapperHealth style={{ backgroundColor: '#FF6C00' }}>
        <NewImminentRiskIcon color="white" />
      </IconWrapperHealth>
    );
  }
  if (H_INDEX === 75) {
    return (
      <IconWrapperHealth style={{ backgroundColor: '#FDB400' }}>
        <OutOfSpecificationIcon color="white" />
      </IconWrapperHealth>
    );
  }
  if (H_INDEX === 100) {
    return (
      <IconWrapperHealth style={{ backgroundColor: '#5ECA21' }}>
        <OperatingCorrectlyIcon color="white" />
      </IconWrapperHealth>
    );
  }
  if (H_INDEX === 4) {
    return (
      <IconWrapperHealth style={{ backgroundColor: '#4E4E4E', height: '5x', with: '5px' }}>
        <HealthDisabledIcon color="white" />
      </IconWrapperHealth>
    );
  }
  return (
    <IconWrapperHealth style={{ backgroundColor: '#C7C7C7' }}>
      <UnknownHealthDarkIcon color="white" />
    </IconWrapperHealth>
  );
}

export function healthLevelColor(H_INDEX: number) {
  if (H_INDEX === 25) return colors.Red;
  if (H_INDEX === 50) return colors.Orange;
  if (H_INDEX === 75) return colors.Yellow;
  if (H_INDEX === 100) return colors.Green;
  if (H_INDEX === 4) return '#555555';
  return colors.Grey200;
}

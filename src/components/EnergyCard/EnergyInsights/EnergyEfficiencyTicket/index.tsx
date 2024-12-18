import { colors } from '~/styles/colors';
import {
  EnergyEfficiencyBar,
  EnergyEfficiencyTicketData,
  EnergyEfficiencyTicketStyled,
} from './styles';
import { formatNumberWithFractionDigits } from '~/helpers/thousandFormatNumber';

interface EnergyEfficiencyTicketProps {
  isSelected: boolean;
  ticket: {
    label: string;
    units: number[];
    percentage: number;
    color: string;
    width: string;
  };
  handleClickTicket: (label, units) => void;
  handleRedirect: () => void;
}

export const EnergyEfficiencyTicket: React.FC<EnergyEfficiencyTicketProps> = ({
  isSelected, ticket, handleClickTicket, handleRedirect,
}) => (
  <EnergyEfficiencyTicketStyled isSelected={isSelected}>
    <EnergyEfficiencyTicketData onClick={() => ticket.units.length >= 1 && handleRedirect()}>
      <p>{formatNumberWithFractionDigits(ticket.units.length)}</p>
      <span>
        {formatNumberWithFractionDigits(ticket.percentage, { minimum: 0, maximum: 2 })}
        %
      </span>
    </EnergyEfficiencyTicketData>
    <div
      style={{
        background: colors.GreyDefaultCardBorder,
        width: '1px',
        height: '100%',
      }}
    />
    <EnergyEfficiencyBar
      isSelected={isSelected}
      isActivate={ticket.units.length >= 1}
      barColor={ticket.color}
      barWidth={ticket.width}
      onClick={() => ticket.units.length >= 1 && handleClickTicket(ticket.label, ticket.units)}
    >
      <div>
        <span>{ticket.label.toUpperCase()}</span>
      </div>
    </EnergyEfficiencyBar>
  </EnergyEfficiencyTicketStyled>
);

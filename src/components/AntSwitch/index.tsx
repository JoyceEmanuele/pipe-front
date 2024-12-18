import FormGroup from '@material-ui/core/FormGroup';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';
import OriginalAntSwitch from '@material-ui/core/Switch';
import Typography from '@material-ui/core/Typography';

import { colors } from '../../styles/colors';
import { SwitchButton, SwitchText } from './styles';

const AntSwitchWrapper = withStyles((theme) => ({
  root: {
    width: 32,
    height: 16,
    padding: 0,
    display: 'flex',
  },
  switchBase: {
    top: '-1px',
    padding: 2,
    color: colors.White,
    '&$checked': {
      transform: 'translateX(12px)',
      color: theme.palette.common.white,
      '& + $track': {
        opacity: 1,
        backgroundColor: theme.palette.primary.main,
        borderColor: theme.palette.primary.main,
      },
    },
  },
  thumb: {
    width: 12,
    height: 12,
    marginTop: '1px',
    boxShadow: 'none',
  },
  track: {
    border: `1px solid ${colors.White}`,
    borderRadius: 16 / 2,
    opacity: 1,
    backgroundColor: colors.Grey200,
    borderColor: colors.Grey200,
  },
  checked: {
    marginLeft: '4px',
  },
}))(OriginalAntSwitch);

type AntSwitchProps = {
  checked: boolean;
  label?: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void;
}

export const AntSwitch = ({ checked, label, onChange }: AntSwitchProps): JSX.Element => (
  <SwitchButton>
    <FormGroup>
      <Typography component="div">
        <Grid component="label" container alignItems="center" spacing={1}>
          <Grid item>
            <AntSwitchWrapper checked={checked} onChange={onChange} />
          </Grid>
          <SwitchText switchOn={checked}>
            {label}
          </SwitchText>
        </Grid>
      </Typography>
    </FormGroup>
  </SwitchButton>
);

import { ClickAwayListener } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Row from 'antd/lib/row';
import { useState } from 'react';
import { SelectButton } from './styles';
import moment from 'moment';
import i18n from '../../i18n';

const t = i18n.t.bind(i18n);

const defaultDateRanges = [
  {
    label: t('hoje'), start: () => moment(), end: () => moment(), changeSelectedPeriod: undefined,
  },
  {
    label: t('ontem'), start: () => moment().subtract(1, 'days'), end: () => moment().subtract(1, 'days'), changeSelectedPeriod: undefined,
  },
  {
    label: t('semanaAtual'), start: () => moment().startOf('week'), end: () => moment(), changeSelectedPeriod: undefined,
  },
  {
    label: t('ultimos7dias'), start: () => moment().subtract(7, 'days'), end: () => moment(), changeSelectedPeriod: undefined,
  },
  {
    label: t('semanaPassada'), start: () => moment().subtract(7, 'days').startOf('week'), end: () => moment(), changeSelectedPeriod: undefined,
  },
  {
    label: t('ultimos30dias'), start: () => moment().subtract(30, 'days'), end: () => moment(), changeSelectedPeriod: undefined,
  },
  {
    label: t('ultimos60dias'), start: () => moment().subtract(60, 'days'), end: () => moment(), changeSelectedPeriod: undefined,
  },
  {
    label: t('ultimos90dias'), start: () => moment().subtract(90, 'days'), end: () => moment(), changeSelectedPeriod: undefined,
  },
  {
    label: t('ultimos12meses'), start: () => moment().subtract(12, 'months'), end: () => moment(), changeSelectedPeriod: undefined,
  },
];

export const QuickSelectionV2 = (props: {
  setDate: (startDate, endDate, timeSelected?) => void,
  dateRanges?: {
    label: string,
    start: () => moment.Moment,
    end: () => moment.Moment,
    changeSelectedPeriod?: () => void
  }[],
  height?: string,
  twoColumns?: boolean,
}): JSX.Element => {
  const [showDialog, setShowDialog] = useState(false);
  const { setDate, dateRanges = defaultDateRanges, twoColumns } = props;
  const handleClickAway = () => {
    setShowDialog(false);
  };

  const leftColumn = twoColumns ? dateRanges.slice(0, 4) : dateRanges;
  const rightColumn = twoColumns ? dateRanges.slice(4) : [];

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <div>
        <Box
          m="3px"
          onClick={() => setShowDialog(!showDialog)}
          style={{
            color: '#363BC4', textDecorationLine: 'underline', cursor: 'pointer', fontSize: '10px',
          }}
        >
          {t('selecaoRapida')}
        </Box>
        {showDialog && (
          <Box
            position="absolute"
            marginTop="8px"
            padding="15px"
            height={props.height ?? '225px'}
            borderRadius="10px"
            style={{ background: '#FFFFFF', boxShadow: '0px 10px 10px rgba(0, 0, 0, 0.1)', zIndex: '10' }}
          >
            <Row style={{ fontWeight: 700, marginBottom: '10px' }}>
              {t('selecaoRapida')}
            </Row>
            <div style={{
              display: 'flex',
              height: props.height ? 'auto' : '156px',
              width: '100%',
              maxWidth: '400px',
              flexDirection: 'row',
            }}
            >
              <div style={{ width: twoColumns ? '50%' : '100%' }}>
                {leftColumn.map((range) => (
                  <div key={`quick-selection-option-${range.label}`} style={{ marginBottom: '8px' }}>
                    <SelectButton onClick={() => {
                      if (range.changeSelectedPeriod) range.changeSelectedPeriod();

                      setDate(range.start(), range.end(), range.label);
                      setShowDialog(false);
                    }}
                    >
                      {range.label}
                    </SelectButton>
                  </div>
                ))}
              </div>
              {
                rightColumn.length > 0 && (
                  <div style={{ width: '50%' }}>
                    {rightColumn.map((range) => (
                      <div key={`quick-selection-option-${range.label}`} style={{ marginBottom: '8px' }}>
                        <SelectButton onClick={() => {
                          if (range.changeSelectedPeriod) range.changeSelectedPeriod();

                          setDate(range.start(), range.end(), range.label);
                          setShowDialog(false);
                        }}
                        >
                          {range.label}
                        </SelectButton>
                      </div>
                    ))}
                  </div>
                )
              }
            </div>
          </Box>
        )}
      </div>
    </ClickAwayListener>
  );
};

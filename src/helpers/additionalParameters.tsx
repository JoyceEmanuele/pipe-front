import ReactTooltip from 'react-tooltip';
import React from 'react';
import { colors } from '../styles/colors';
import { AccordionV2 } from '../components/Accordion';
import i18n from '../i18n';

const t = i18n.t.bind(i18n);

export function verifyParameter(index: number, parameter: { COLUMN_NAME: string, COLUMN_VALUE: string }, panelScreen?: boolean): JSX.Element {
  const overExtended = parameter.COLUMN_NAME.length > 30;
  const nameDisplay = !overExtended ? parameter.COLUMN_NAME : `${parameter.COLUMN_NAME.substring(0, 30)}...`;
  return (
    <>
      <div
        data-tip
        data-for={`${index}-${nameDisplay}`}
        key={index}
        style={{
          maxWidth: 'calc(33.33% - 10px)',
          flexGrow: 1,
          marginBottom: '20px',
          marginRight: '3px',
          minWidth: '200px',
        }}
      >
        <span style={{ fontWeight: 'bold', color: panelScreen ? colors.Grey200 : colors.Black }}>{nameDisplay}</span>
        <br />
        {verifyColumnValue(parameter.COLUMN_VALUE)}
      </div>
      {overExtended && (
        <ReactTooltip
          id={`${index}-${nameDisplay}`}
          place="top"
          effect="solid"
          delayHide={100}
          offset={{ top: 0, left: 10 }}
          textColor="#000000"
          border
          backgroundColor="rgba(255, 255, 255, 0.97)"
        >
          <span style={{ marginTop: '6px', fontSize: '95%' }}>
            <strong>
              {parameter.COLUMN_NAME}
            </strong>
          </span>
        </ReactTooltip>
      )}
    </>
  );
}

export function verifyInfoAdditionalParameters(additionalParameters: { COLUMN_NAME: string, COLUMN_VALUE: string }[], panelScreen?: boolean): JSX.Element {
  return (
    <>
      <AccordionV2 color="#363BC4" style={{ fontSize: panelScreen ? '0.9rem' : '1.25em', marginBottom: '16px', marginTop: '16px' }} title={t('informacoesAdicionais')} opened={false}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: panelScreen ? 'space-between' : 'flex-start' }}>
          {additionalParameters.map((parameter, index) => (
            verifyParameter(index, parameter, panelScreen)
          ))}
        </div>
      </AccordionV2>
    </>
  );
}

function verifyColumnValue(COLUMN_VALUE) {
  const isLink = COLUMN_VALUE.includes('http') || COLUMN_VALUE.includes('www');
  if (isLink) {
    return (
      <a href={COLUMN_VALUE} target="_blank" rel="noopener noreferrer">
        {COLUMN_VALUE}
      </a>
    );
  }
  return COLUMN_VALUE;
}

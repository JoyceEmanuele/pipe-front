import { StyledLink } from '../Table/styles';
import { ShowProblemData } from '~/pages/General/TableConfigs';

export const DefaultTableLabel = (value) => {
  const haveInfo = value !== null && value !== undefined;
  return (
    <div style={{ fontSize: 11 }}>
      {haveInfo ? value : '-'}
    </div>
  );
};

export const DefaultTableLabelUnit = (value, unit, unitId) => {
  const haveInfo = value !== null && value !== undefined && parseFloat(value.replace(',', '.')) >= 0;
  if (!value && value !== 0) {
    return (
      <div
        style={{
          fontSize: 11, width: '50px', alignItems: 'center', display: 'flex', padding: '0px 10px',
        }}
      >
        -
      </div>
    );
  }
  return (
    <div
      style={{
        fontSize: 11, width: '50px', alignItems: 'center', display: 'flex', padding: '0px 10px',
      }}
    >
      {haveInfo ? `${value}${unit}` : <div><ShowProblemData value={value} tooltipId={`itemLabelWater${unitId}`} /></div>}
    </div>
  );
};

export const DefaultTableLabelUnitLink = (value, unitId, device_code) => {
  const haveInfo = value !== null && value !== undefined;
  const supplier = device_code?.startsWith('DMA') ? 'diel' : 'laager';
  return (
    <div>
      <StyledLink to={`/analise/unidades/integracao-agua/${unitId}?aba=historico&supplier=${supplier}`} style={{ textDecoration: 'underline', fontSize: 11, width: '300px' }}>{haveInfo ? value : '-'}</StyledLink>
    </div>
  );
};

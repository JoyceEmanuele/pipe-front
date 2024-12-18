import { FoldedSheet } from '~/icons';
import { useTranslation } from 'react-i18next';

export const AnalysisEmpty = (): JSX.Element => {
  const { t } = useTranslation();

  return (
    <div
      style={{
        width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundColor: '#F9F9F9', minHeight: 300, borderRadius: 5, color: '#7D7D7D', padding: 10,
      }}
    >
      <div
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginTop: 100,
        }}
      >
        <FoldedSheet width="21" height="27" color="#7D7D7D" />
        <span style={{ fontSize: 12, marginTop: 5 }}><strong>{t('resultadoDaAnalise')}</strong></span>
        <span style={{ fontSize: 10, fontWeight: 500 }}>{t('filtrarParaGerarAnalise')}</span>
        <span style={{ fontSize: 10, fontWeight: 500 }}>
          {t('filtrarParaGerarAnaliseContinuacao')}
          <strong>{t('analisarNegrito')}</strong>
        </span>
      </div>
    </div>
  );
};

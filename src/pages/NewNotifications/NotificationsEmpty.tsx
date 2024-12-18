import { FoldedSheet } from '~/icons';
import { useTranslation } from 'react-i18next';

export const NotificationsEmpty = (): JSX.Element => {
  const { t } = useTranslation();

  return (
    <div
      style={{
        width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundColor: '#F9F9F9', minHeight: '500px', borderRadius: 5, color: '#7D7D7D',
      }}
    >
      <div
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginTop: 100,
        }}
      >
        <FoldedSheet width="21" height="27" color="#7D7D7D" />
        <span style={{ fontSize: 12, marginTop: 5, marginBottom: 5 }}><strong>{t('nenhumaNotificacao')}</strong></span>
        <span style={{ fontSize: 10, fontWeight: 500 }}>{t('aoReceberUmaNotificacao')}</span>
        <span style={{ fontSize: 10, fontWeight: 500 }}>
          <strong>{t('numeroIndicativo')}</strong>
          {t('aoLadoDaAbaNotificacoes')}
        </span>
      </div>
    </div>
  );
};

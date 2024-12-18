import { useTranslation } from 'react-i18next';
import { ApiResps } from '~/providers';
import { InfoItem } from './styles';
import { t } from 'i18next';

export const IntegrDevInfo = (props: { devInfo: ApiResps['/get-integration-info']['info'] }): JSX.Element => {
  const { devInfo } = props;
  const { t } = useTranslation();

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
      <InfoItem>
        <b>{`${t('estado')}:`}</b>
        <br />
        {devInfo.STATE_ID || '-'}
      </InfoItem>
      <InfoItem>
        <b>{`${t('cidade')}:`}</b>
        <br />
        {devInfo.CITY_NAME || '-'}
      </InfoItem>
      <InfoItem>
        <b>{`${t('unidade')}:`}</b>
        <br />
        {devInfo.UNIT_NAME || '-'}
      </InfoItem>
      <InfoItem>
        <b>{`${t('cliente')}:`}</b>
        <br />
        {devInfo.CLIENT_NAME || '-'}
      </InfoItem>
      <InfoItem>
        <b>{`${t('vertical')}:`}</b>
        <br />
        {devInfo.vertical || '-'}
      </InfoItem>
      <InfoItem>
        <b>{t('fonteDados')}</b>
        <br />
        {devInfo.dataSource || '-'}
      </InfoItem>
      <InfoItem>
        <b>{`${t('metodo')}:`}</b>
        <br />
        {devInfo.method || '-'}
      </InfoItem>
      <InfoItem>
        <b>{`${t('maquina')}:`}</b>
        <br />
        {devInfo.machineName || '-'}
      </InfoItem>
      <InfoItem>
        <b>{`${t('ambiente')}:`}</b>
        <br />
        {devInfo.roomName || '-'}
      </InfoItem>
      <InfoItem>
        <b>{`${t('fornecedor')}:`}</b>
        <br />
        {devInfo.supplier || '-'}
      </InfoItem>
      <InfoItem>
        <b>{`${t('tipo')}:`}</b>
        <br />
        {devInfo.equipType || '-'}
      </InfoItem>
      <InfoItem>
        <b>{`${t('status')}:`}</b>
        <br />
        {devInfo.status || '-'}
      </InfoItem>
    </div>
  );
};

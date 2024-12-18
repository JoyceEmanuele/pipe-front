import { Flex, Box } from 'reflexbox';
import { LayerBackgroundModal } from 'components';
import {
  Card, CardTitle, TitleRow, ConfirmContainer, ConfirmStatus, DenyStatus, Title, SubTitle, DevId, Phrase,
} from './styles';
import { ExitButtonIcon, LightOnIcon, LightOffIcon } from '~/icons';
import { apiCall } from '~/providers';
import { toast } from 'react-toastify';
import { DamItem } from '.';
import { t } from 'i18next';
import { Trans } from 'react-i18next';

type CardProps = {
  devId: string;
  command: { label: string, value: string, dam: DamItem };
  closeConfirmStatusChange: () => void;
}

export const ConfirmStatusChange = ({
  devId, command, closeConfirmStatusChange,
}: CardProps): JSX.Element => {
  function updateDamStatus(message, dev) {
    dev.status = message.status;
    dev.Mode = message.Mode;
    dev.State = message.State;
  }

  async function sendDamRelay(dev, mode) {
    if (dev.safeWaitRelay) return;
    dev.safeWaitRelay = true;
    setTimeout(() => {
      delete dev.safeWaitRelay;
    }, 2500);
    try {
      const data = {
        dev_id: dev.DAM_ID,
        relay: mode,
      };
      const telemetry = await apiCall('/dam/set-dam-operation', data);
      updateDamStatus(telemetry, dev);
      toast.success(t('sucessoDAMStatus'));
    } catch (err) {
      console.log(err);
      toast.error(
        t('erroStatusDAM'),
      );
    }
  }

  return (
    <>
      <LayerBackgroundModal>
        <Flex width={1} justifyContent="center" alignItems="center">
          <Card>
            <CardTitle>
              <>
                <TitleRow>
                  <Title>{t('iluminacao')}</Title>
                  <SubTitle color="grey">{t('alterarStatus')}</SubTitle>
                </TitleRow>
                <DevId>{ devId }</DevId>
              </>
              <div onClick={() => closeConfirmStatusChange()} style={{ cursor: 'pointer' }}>
                <ExitButtonIcon />
              </div>
            </CardTitle>
            { command.label === t('ligar') ? (<LightOnIcon />) : (<LightOffIcon />)}
            <Phrase>
              <Trans i18nKey="ligarIluminacao" commandLabel={command.label}>
                Você tem certeza que deseja
                {' '}
                {{ commandLabel: command.label }}
                {' '}
                a iluminação do ambiente?
              </Trans>
            </Phrase>
            <ConfirmContainer>
              <ConfirmStatus
                onClick={() => {
                  sendDamRelay(command.dam, command.value);
                  closeConfirmStatusChange();
                }}
                style={{ cursor: 'pointer' }}
              >
                <>{t('sim')}</>
              </ConfirmStatus>
              <DenyStatus onClick={() => closeConfirmStatusChange()} style={{ cursor: 'pointer' }}>
                <>{t('nao')}</>
              </DenyStatus>
            </ConfirmContainer>
          </Card>
        </Flex>
      </LayerBackgroundModal>
    </>
  );
};

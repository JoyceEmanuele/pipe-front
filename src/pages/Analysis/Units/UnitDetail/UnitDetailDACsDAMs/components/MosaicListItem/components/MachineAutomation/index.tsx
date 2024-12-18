import { useState } from 'react';
import { toast } from 'react-toastify';
import { Loader } from '~/components';
import { getUserProfile } from '~/helpers/userProfile';
import { apiCall } from '~/providers';
import { DamItem, DatItem } from '../../../../..';
import { t } from 'i18next';
import {
  Container,
  Title,
  Label,
  SelectedInput,
  TransparentLink,
  IconWrapper,
} from './styles';
import { WatchIcon } from '~/icons';
import { colors } from '~/styles/colors';
import { Flex } from 'reflexbox';

type Props = {
  application: string;
  dam: DamItem;
  dat?: DatItem;
  openScheduleDialogFor: (devId: string) => void;
  openConfirmStatusChange: (devId: string, command: { label: string, value: string, dam: DamItem }) => void;
  manualCommandsEnabled: object;
  automationOption: object;
  statusOption: object;
  automationOptions: { label: string; value: string; }[];
  statusOptions: { label: string; value: string; }[];
};

function updateDamStatus(message, dev) {
  dev.status = message.status;
  dev.Mode = message.Mode;
  dev.State = message.State;
}

export const MachineAutomation = ({
  application,
  dam,
  dat,
  openScheduleDialogFor,
  openConfirmStatusChange,
  manualCommandsEnabled,
  automationOption,
  statusOption,
  automationOptions,
  statusOptions,
}: Props): React.ReactElement => {
  const [profile] = useState(getUserProfile);
  const [loading, setLoading] = useState(false);

  async function retrieveDamProgramming() {
    if (dam && dam.DAM_ID) {
      try {
        openScheduleDialogFor(dam.DAM_ID);
      } catch (err) {
        console.log(err);
      }
    }
  }

  async function sendDamMode(dev, mode, option) {
    if (!dev.safeWaitMode) {
      dev.safeWaitMode = true;
      setTimeout(() => {
        delete dev.safeWaitMode;
      }, 2500);
      try {
        const data = {
          dev_id: dam.DAM_ID,
          mode,
        };
        setLoading(true);
        const telemetry = await apiCall('/dam/set-dam-operation', data);
        updateDamStatus(telemetry, dev);
        automationOption[dam.DAM_ID] = option;
        toast.success(t('sucessoModoDamAlterado'));
      } catch (err) {
        console.log(err);
        toast.error(t('houveErro'));
      }
      setLoading(false);
    }
  }

  async function sendDamRelay(dev, mode, option) {
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
      setLoading(true);
      const telemetry = await apiCall('/dam/set-dam-operation', data);
      updateDamStatus(telemetry, dev);
      statusOption[dam.DAM_ID] = option;
      toast.success(t('sucessoDAMStatus'));
    } catch (err) {
      console.log(err);
      toast.error(
        t('erroStatusDAM'),
      );
    }
    setLoading(false);
  }

  return (
    <Container>
      {loading ? (
        <Loader />
      ) : (
        <>
          <Label>{t('automacao')}</Label>
          {(profile.manageAllClients || profile.permissions.isInstaller) && (
            <>
              <TransparentLink
                to={`/analise/dispositivo/${dam.DAM_ID}/informacoes`}
                style={{ marginBottom: 10, lineHeight: '11px' }}
              >
                <Title>{dam.DAM_ID}</Title>
              </TransparentLink>
              {dat && <Title>{dat.DAT_ID}</Title>}
            </>
          )}
          <Flex
            flexDirection="row"
            alignItems="flex-end"
            width="100%"
            height="100%"
            justifyContent="space-between"
          >
            <Flex flexDirection="column" width="78%">
              <Label>{t('modo')}</Label>
              <SelectedInput
                value={automationOption[dam.DAM_ID]}
                onSelect={(e) => {
                  sendDamMode(dam, e.value, e.label);
                }}
                options={automationOptions}
                defaultValue={dam.Mode ? dam.Mode : statusOptions[0].value}
                hideSelected
                styles={{ border: '10px' }}
              />
              <Label>{t('status')}</Label>
              <SelectedInput
                value={statusOption[dam.DAM_ID]}
                onSelect={(e) => {
                  application === 'iluminacao' ? openConfirmStatusChange(dam.DAM_ID, {
                    label: e.label, value: e.value, dam,
                  }) : sendDamRelay(dam, e.value, e.label);
                }}
                options={statusOptions}
                disabled={!manualCommandsEnabled[dam.DAM_ID]}
                defaultValue={dam.Mode ? dam.Mode : statusOptions[0].value}
                hideSelected
              />
            </Flex>
            <IconWrapper onClick={retrieveDamProgramming}>
              <WatchIcon color={colors.BlueSecondary} />
            </IconWrapper>
          </Flex>

        </>
      )}
    </Container>
  );
};

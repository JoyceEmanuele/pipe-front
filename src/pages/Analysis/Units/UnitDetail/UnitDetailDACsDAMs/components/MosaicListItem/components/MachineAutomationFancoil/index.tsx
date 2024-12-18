import { ReactElement } from 'react';
import ReactTooltip from 'react-tooltip';
import { ListItemContainer, ListItemDataContainer, TooltipContainer } from '../../styles';
import {
  DacItem, DamItem, DatItem, DriItem,
  DutDuoItem,
} from 'pages/Analysis/Units/UnitDetail';
import { MosaicListItemTitle } from '../..';
import { useTranslation } from 'react-i18next';
import { MachineDacInformation, MachineDatInformation, MachineDutDuoInformation } from '../MachineFancoilInformation';
import { MachineDriAutomation } from './MachineDriAutomation';
import { MachineDamAutomation } from './MachineDamAutomation';

interface MachineAutomationFancoilProps {
  devAut: string;
  devsAutData: Record<string, unknown>;
  groupId: number;
  title: string;
  size: number;
  damOptions: {
    openScheduleDialogFor: (devId: string) => void;
    openScheduleDialogForDutAut: (devId: string, clientId: number, unitId: number) => void;
    openConfirmStatusChange: (devId: string, command: { label: string, value: string, dam: DamItem }) => void;
    manualCommandsEnabled: object;
    automationOption: object;
    statusOption: object;
    statusOptions: { label: string; value: string; }[];
    automationOptions: { label: string; value: string; }[];
  };
  dam?: DamItem;
  dri?: DriItem;
  dacs?: DacItem[];
  dats?: DatItem[];
  dutsDuo?: DutDuoItem[];
}

export function MachineAutomationFancoil({
  devAut,
  devsAutData,
  damOptions,
  groupId,
  title,
  size,
  dam,
  dri,
  dacs,
  dats,
  dutsDuo,
}: MachineAutomationFancoilProps): ReactElement {
  const { t } = useTranslation();

  return (
    <>
      <div
        style={{
          borderTop: '10px solid #363BC4',
          borderRadius: '4px',
          margin: '0 1px 0 0',
        }}
      >
        <ListItemContainer size={size}>
          <MosaicListItemTitle
            groupId={groupId}
            size={size}
            title={title}
            dats={dats}
            devAut={devAut}
          />
          <ListItemDataContainer>
            {devAut?.startsWith('DRI') && (
              <MachineDriAutomation devAutData={devsAutData[devAut]} DEV_ID={devAut} />
            )}

            {dam && (dats && dats.length > 0 || dacs && dacs.length > 0) && (
            <MachineDamAutomation
              dam={dam}
              openScheduleDialogFor={damOptions.openScheduleDialogFor}
              manualCommandsEnabled={damOptions.manualCommandsEnabled}
              automationOption={damOptions.automationOption}
              statusOption={damOptions.statusOption}
            />
            )}

            {(dacs && dacs.map((dac) => (
              <MachineDacInformation
                dac={dac}
                dat={dats?.find((item) => item.DEV_ID === dac.DAC_ID)}
                key={dac.DAC_ID}
                expanded
              />
            )))}

            {dutsDuo && dutsDuo.map((dutDuo) => (
              <MachineDutDuoInformation
                dutDuo={dutDuo}
                dat={dats?.find((item) => item.DEV_ID === dutDuo.DUT_DUO_ID)}
                expanded
                key={dutDuo.DUT_DUO_ID}
              />
            ))}

            {dats?.map((datItem) => {
              if (datItem.DEV_ID === null || datItem.DEV_ID && dam && !dacs?.length) {
                return (
                  <MachineDatInformation
                    key={datItem.DEV_ID}
                    dat={datItem}
                    expanded
                  />
                );
              }
            })}
          </ListItemDataContainer>
        </ListItemContainer>
      </div>
      <ReactTooltip
        id={title}
        place="top"
        border
        textColor="#000000"
        backgroundColor="rgba(255, 255, 255, 0.97)"
        borderColor="#202370"
      >
        <TooltipContainer>
          <strong>{t('maquina')}</strong>
          <strong>{title}</strong>
        </TooltipContainer>
      </ReactTooltip>
    </>
  );
}

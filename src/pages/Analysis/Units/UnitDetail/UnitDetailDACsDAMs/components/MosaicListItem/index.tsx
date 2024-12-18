import { Fragment, ReactElement } from 'react';
import ReactTooltip from 'react-tooltip';
import { t } from 'i18next';
import {
  DamItem, DacItem, DatItem, DriItem, GroupItem,
  DutDuoItem,
} from '../../..';
import { TooltipContainer } from '../../styles';
import { DriAutMachine } from './components/DriAutMachine';
import { DutAutMachine } from './components/DutAutMachine';
import { HeatExchangerInfo } from './components/HeatExchanger';
import { MachineAutomation } from './components/MachineAutomation';
import { MachineInformation } from './components/MachineInformation';
import {
  ListItemContainer,
  ListItemDataContainer,
  Title,
  TransparentLink,
} from './styles';
import { MachineAutomationFancoil } from './components/MachineAutomationFancoil';
import { useTranslation } from 'react-i18next';

const statusOptionsDamApp = [{
  label: t('desligar'),
  value: 'forbid',
}, {
  label: t('ligar'),
  value: 'allow',
}];

type Props = {
  size: number;
  group: GroupItem;
  title: string;
  dam?: DamItem;
  dams?: DamItem[]
  dacs?: DacItem[];
  dats?: DatItem[];
  dri?: DriItem;
  dutsDuo?: DutDuoItem[];
  openScheduleDialogFor: (devId: string) => void;
  openScheduleDialogForDutAut: (devId: string, clientId: number, unitId: number) => void;
  openConfirmStatusChange: (devId: string, command: { label: string, value: string, dam: DamItem }) => void;
  manualCommandsEnabled: object;
  automationOption: object;
  statusOption: object;
  automationOptions: { label: string; value: string; }[];
  statusOptions: { label: string; value: string; }[];
  devsAutData: {};
  dutsCommands: {};
};

export function MosaicListItemTitle({
  dats,
  devAut,
  groupId,
  title,
  size,
}: {
  groupId: number;
  title: string;
  size: number;
  devAut?: string;
  dats?: DatItem[];
}): ReactElement {
  const { t } = useTranslation();

  function linkToMachine(): string {
    let urlResult = '';

    if (dats && dats.length > 0) {
      urlResult = `/analise/maquina/${groupId}/ativos/`;
    }
    else if (devAut) {
      urlResult = `/analise/dispositivo/${devAut}/informacoes`;
    }

    return urlResult;
  }

  return (
    <>
      {(dats && dats.length > 0 || devAut) ? (
        <TransparentLink
          style={{ width: '95%' }}
          to={linkToMachine()}
        >
          <div
            style={{
              display: 'flex', flexDirection: 'row', maxWidth: size * 220, paddingLeft: 15,
            }}
          >
            <Title style={{ textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }} data-tip data-for={title}>
              {title}
            </Title>
          </div>
        </TransparentLink>
      ) : (
        <div
          style={{
            display: 'flex', flexDirection: 'row', width: '95%', paddingLeft: 15,
          }}
        >
          <Title data-tip data-for={title}>
            {title.length > 25 * size
              ? title
              : `${title.substring(0, 20 * size * 2)}...`}
          </Title>
        </div>
      )}
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

export const MosaicListItem = ({
  size,
  group,
  title,
  dam,
  dri,
  dacs,
  dats,
  dutsDuo,
  openScheduleDialogFor,
  openScheduleDialogForDutAut,
  openConfirmStatusChange,
  manualCommandsEnabled,
  automationOption,
  statusOption,
  automationOptions,
  statusOptions,
  devsAutData,
  dutsCommands,
}: Props): React.ReactElement => {
  const hasHeatExchanger = (dacs?.filter((e) => e.DAC_APPL === 'trocador-de-calor' && e.DAC_TYPE === 'tipo-trocador-de-calor') || []).length !== 0;
  const isFancoil = group.application === 'fancoil';

  let heatExchangerInfo: any = null;

  if (isFancoil) {
    return (
      <MachineAutomationFancoil
        devAut={group.DEV_AUT}
        devsAutData={devsAutData}
        groupId={group.groupId}
        size={size}
        title={title}
        dats={dats}
        dri={group.dri}
        dacs={group.dacs}
        dam={dam}
        dutsDuo={group.dutsDuo}
        damOptions={{
          automationOption,
          automationOptions,
          manualCommandsEnabled,
          openConfirmStatusChange,
          openScheduleDialogFor,
          openScheduleDialogForDutAut,
          statusOption,
          statusOptions,
        }}
      />
    );
  }

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
            groupId={group?.groupId}
            size={size}
            title={title}
            dats={dats}
            devAut={group.DEV_AUT}
          />

          <ListItemDataContainer>
            {
                dam && (dats && dats.length > 0 || dacs && dacs.length > 0) && (
                  <>
                    <div>
                      <MachineAutomation
                        dam={dam}
                        application={group.application}
                        openScheduleDialogFor={openScheduleDialogFor}
                        openConfirmStatusChange={openConfirmStatusChange}
                        manualCommandsEnabled={manualCommandsEnabled}
                        automationOption={automationOption}
                        statusOption={statusOption}
                        automationOptions={automationOptions}
                        statusOptions={group.application === 'iluminacao' ? statusOptionsDamApp : statusOptions}
                      />
                    </div>

                  </>
                )
              }

            {dacs && dacs.map((dipositiv, key) => {
              if (hasHeatExchanger && dipositiv.DAC_APPL === 'trocador-de-calor' && dipositiv.DAC_TYPE === 'tipo-trocador-de-calor') {
                heatExchangerInfo = dipositiv;
                return;
              }
              if (key === 0) {
                if (dam) {
                  return (
                    <Fragment key={key}>
                      <div>
                        <MachineInformation expanded dac={dipositiv} dat={dats?.find((item) => item.DEV_ID === dipositiv.DAC_ID)} />
                      </div>
                    </Fragment>
                  );
                }
                if (!dam && group.DEV_AUT && group.DEV_AUT.startsWith('DUT') && !group.DEV_AUT.startsWith('DUT0') && !group.DEV_AUT.startsWith('DUT1') && !group.DEV_AUT.startsWith('DUT2')) {
                  return (
                    <Fragment key={key}>
                      <DutAutMachine openScheduleDialogForDutAut={openScheduleDialogForDutAut} devAutData={devsAutData[group.DEV_AUT]} dutCommands={dutsCommands[group.DEV_AUT]} DEV_ID={group.DEV_AUT} />
                      <div>
                        <MachineInformation expanded dac={dipositiv} dat={dats?.find((item) => item.DEV_ID === dipositiv.DAC_ID)} />
                      </div>
                    </Fragment>
                  );
                }

                if (!dam && group.DEV_AUT && group.DEV_AUT.startsWith('DRI')) {
                  return (
                    <Fragment key={key} style={{ width: '300px' }}>
                      <DriAutMachine devAutData={devsAutData[group.DEV_AUT]} DEV_ID={group.DEV_AUT} />
                      <div>
                        <MachineInformation expanded dac={dipositiv} dat={dats?.find((item) => item.DEV_ID === dipositiv.DAC_ID)} />
                      </div>
                    </Fragment>
                  );
                }

                if (!hasHeatExchanger && dacs && dacs?.length > 0)
                { return (
                  <div key={key}>
                    <MachineInformation
                      dac={dipositiv}
                      dat={dats?.find((item) => item.DEV_ID === dipositiv.DAC_ID)}
                      expanded
                    />
                  </div>
                ); }
              }
              return (
                <div key={key}>
                  <MachineInformation
                    expanded
                    dac={dipositiv}
                    dat={dats?.find((item) => item.DEV_ID === dipositiv.DAC_ID)}
                  />
                </div>
              );
            })}

            {group.dutsDuo && group.dutsDuo.map((dipositiv, key) => (
              <div key={key}>
                <MachineInformation
                  dutsDuo={dipositiv}
                  dat={dats?.find((item) => item.DEV_ID === dipositiv.DUT_DUO_ID)}
                  expanded
                />
              </div>
            ))}

            {group.dri && (
            <Fragment key={0} style={{ width: '300px' }}>
              <DriAutMachine devAutData={devsAutData[group.DEV_AUT]} DEV_ID={group.DEV_AUT} />
              <div>
                <MachineInformation expanded dat={dats?.find((item) => item.DEV_ID === group.DEV_AUT)} />
              </div>
            </Fragment>
            )}

            {group.duts?.map((dutItem, i) => (
              <div key={i}>
                <MachineInformation dut={dutItem} dat={dats?.find((item) => item.DEV_ID === dutItem.DEV_ID)} expanded />
              </div>
            ))}

            {dats?.map((datItem, i) => {
              if (datItem.DEV_ID === null || datItem.DEV_ID && dam && !dacs?.length) {
                return (
                  <div key={i}>
                    <MachineInformation dat={datItem} expanded />
                  </div>
                );
              }
            })}
            {
              !dacs?.length && !dats?.length && dam && (
                <>
                  <div>
                    <MachineAutomation
                      application={group.application}
                      dam={dam}
                      openScheduleDialogFor={openScheduleDialogFor}
                      openConfirmStatusChange={openConfirmStatusChange}
                      manualCommandsEnabled={manualCommandsEnabled}
                      automationOption={automationOption}
                      statusOption={statusOption}
                      automationOptions={automationOptions}
                      statusOptions={group.application === 'iluminacao' ? statusOptionsDamApp : statusOptions}
                    />
                  </div>
                </>
              )
            }

            {hasHeatExchanger && heatExchangerInfo
              ? (
                <div key={heatExchangerInfo?.DAC_ID}>
                  <HeatExchangerInfo
                    dat={dats?.find((item) => item.DEV_ID === heatExchangerInfo?.DAC_ID)}
                    expanded
                    dac={heatExchangerInfo}
                  />
                </div>
              ) : null}
          </ListItemDataContainer>
        </ListItemContainer>
      </div>

    </>
  );
};

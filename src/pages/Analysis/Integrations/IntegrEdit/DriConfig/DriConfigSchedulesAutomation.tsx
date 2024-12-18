import { ReactElement, useEffect, useRef } from 'react';
import { useStateVar } from 'helpers/useStateVar';
import { DevFullInfo } from 'store';
import { DriException, DriSchedule, DriScheduleContent } from 'pages/Analysis/SchedulesModals/DRI_ScheduleModal';
import { apiCall } from 'providers';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

interface DriConfigSchedulesAutomationProps {
  devInfo: DevFullInfo | null;
}

export function DriConfigSchedulesAutomation({
  devInfo,
}: DriConfigSchedulesAutomationProps): ReactElement | null {
  const isFirstRender = useRef(true);
  const { t } = useTranslation();

  const [driState, , setDriState] = useStateVar({
    schedules: [] as DriSchedule[],
    exceptions: [] as DriException[],
  });

  async function callDriSchedules(devId: string): Promise<void> {
    try {
      const { list: schedulesList } = await apiCall('/dri/get-dri-scheds', { DRI_ID: devId });
      const schedules: DriSchedule[] = [];
      const exceptions: DriException[] = [];

      for (const sched of schedulesList) {
        if (sched.EXCEPTION_DATE) {
          exceptions.push(sched);
        } else {
          schedules.push(sched);
        }
      }

      setDriState({
        exceptions,
        schedules,
      });
    } catch (error) {
      console.error(error);
      toast.error(t('naoFoiPossivelBuscarProgramacoesExcecoesDRI'));
    }
  }

  useEffect(() => {
    if (devInfo && isFirstRender.current) {
      isFirstRender.current = false;
      callDriSchedules(devInfo.DEV_ID);
    }
  }, [devInfo]);

  if (!devInfo) {
    return null;
  }

  return (
    <div>
      <DriScheduleContent
        devInfo={devInfo}
        schedules={driState.schedules}
        exceptions={driState.exceptions}
        refetch={() => callDriSchedules(devInfo.DEV_ID)}
        fixedContent
      />
    </div>
  );
}

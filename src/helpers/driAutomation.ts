import { t } from 'i18next';
import { apiCall } from 'providers';
import { toast } from 'react-toastify';

export async function sendDriOperationMode(driId: string, operationMode: number, setPoint?: number): Promise<void> {
  return new Promise(async (resolve, reject) => {
    try {
      switch (operationMode) {
        case 0: {
          setTimeout(async () => {
            await apiCall('/dri/send-dri-command', {
              DRI_ID: driId,
              TYPE: 'therm',
              VALUE: '1',
            });
            setTimeout(async () => {
              await apiCall('/dri/send-dri-command', {
                DRI_ID: driId,
                TYPE: 'mode',
                VALUE: '0',
              });
              await apiCall('/dri/send-dri-command', {
                DRI_ID: driId,
                TYPE: 'fanspeed',
                VALUE: '1',
              });
              if (setPoint) {
                await apiCall('/dri/send-dri-command', {
                  DRI_ID: driId,
                  TYPE: 'setpoint',
                  VALUE: setPoint.toString(),
                });
              }

              toast.success(t('sucessoModoOperacaoEnviado'));
              resolve();
            }, 8000);
          }, 5000);
          break;
        }
        case 1: {
          setTimeout(async () => {
            await apiCall('/dri/send-dri-command', {
              DRI_ID: driId,
              TYPE: 'therm',
              VALUE: '1',
            });
            setTimeout(async () => {
              await apiCall('/dri/send-dri-command', {
                DRI_ID: driId,
                TYPE: 'mode',
                VALUE: '2',
              });
              await apiCall('/dri/send-dri-command', {
                DRI_ID: driId,
                TYPE: 'fanspeed',
                VALUE: '1',
              });

              toast.success(t('sucessoModoOperacaoEnviado'));
              resolve();
            }, 8000);
          }, 5000);
          break;
        }
        default: {
          await apiCall('/dri/send-dri-command', {
            DRI_ID: driId,
            TYPE: 'therm',
            VALUE: '0',
          });
          await apiCall('/dri/send-dri-command', {
            DRI_ID: driId,
            TYPE: 'mode',
            VALUE: '2',
          });
          await new Promise((res) => setTimeout(res, 2000));

          toast.success(t('sucessoModoOperacaoEnviado'));
          resolve();
          break;
        }
      }
    } catch (error) {
      reject(error);
    }
  });
}

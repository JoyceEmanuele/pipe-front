import { ExceptionDut } from 'providers/types/api-private';
import { BaseComponentProps, BaseEditCardFormData } from '../ScheduleEditCard/types';

export interface ComponentProps extends BaseComponentProps {
  exception?: ExceptionDut | null,
}

export interface ExceptionEditCardFormData extends BaseEditCardFormData {
  DUT_EXCEPTION_ID: number,
  EXCEPTION_TITLE: string,
  REPEAT_YEARLY: boolean,
  EXCEPTION_DATE: string,
  EXCEPTION_STATUS_ID: number,
}

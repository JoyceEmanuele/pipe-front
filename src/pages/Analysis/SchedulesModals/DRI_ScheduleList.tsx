import { CSSProperties, ReactElement, useState } from 'react';
import { DriException, DriSchedule } from './DRI_ScheduleModal';
import { Flex } from 'reflexbox';
import { Button } from 'components';
import { useStateVar } from 'helpers/useStateVar';
import { ExceptionSchedCard, LimitExceedTooltip, SchedCard } from './DRI_Shedule';
import { useTranslation } from 'react-i18next';
import { getUserProfile } from '~/helpers/userProfile';
import { TabButton } from './styles';
import { ExceptionsHeader } from './components/ExceptionsHeader';

const LIMIT_EXCEPTIONS = 6;
const LIMIT_SCHEDULES = 6;

interface DriScheduleListProps {
  driCfg: { application: string, protocol: string};
  schedules: DriSchedule[];
  exceptions: DriException[];
  onAddEdit: (sched?: DriSchedule | DriException) => void;
  onDelete: (sched: DriSchedule | DriException) => void;
  onChangeShowException: (value: boolean) => void;
  size?: 'small';
  hideAddButton?: boolean;
  clientId?: number;
  loading?: boolean;
}

export const DriScheduleList = ({
  exceptions,
  schedules,
  driCfg,
  onDelete,
  onAddEdit,
  size,
  onChangeShowException,
  hideAddButton,
  clientId,
  loading,
}: DriScheduleListProps): ReactElement => {
  const { t } = useTranslation();
  const [profile] = useState(getUserProfile);

  const [state, , setState] = useStateVar({
    showExceptions: false,
  });

  function verifyProfileCanManageProgramming() {
    return !!(profile.manageAllClients || profile.adminClientProg?.CLIENT_MANAGE.some((item) => item === clientId));
  }

  const limitExceeded = state.showExceptions ? exceptions.length >= LIMIT_EXCEPTIONS : schedules.length >= LIMIT_SCHEDULES;

  const stylesTabButtonExceptions = (isActive: boolean): Partial<CSSProperties> => (
    isActive ? {
      borderBottom: 'none',
      backgroundColor: 'transparent',
      cursor: undefined,
      fontWeight: 'bold',
    } : {
      borderBottom: '1px solid lightgrey',
      backgroundColor: '#F4F4F4',
      cursor: 'pointer',
      fontWeight: 'normal',
    }
  );

  return (
    <Flex
      flexWrap="nowrap"
      flexDirection="column"
      alignItems="left"
      width={size === 'small' ? '791px' : undefined}
      style={{
        borderRadius: '5px',
        borderBottom: size === 'small' ? '1px solid lightgrey' : undefined,
      }}
    >
      <Flex
        flexWrap="nowrap"
        flexDirection="column"
        alignItems="left"
        width="768px"
        style={{
          borderRadius: '10px',
          width: '100%',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '150px 6px 150px auto',
            height: '5px',
            marginTop: '24px',
          }}
        >
          <span
            style={{
              borderTop: '1px solid lightgrey',
              borderRight: '1px solid lightgrey',
              borderLeft: '1px solid lightgrey',
              borderRadius: '6px 6px 0 0',
              backgroundColor: stylesTabButtonExceptions(!state.showExceptions).backgroundColor,
            }}
          />
          <span />
          <span
            style={{
              border: '1px solid lightgrey',
              borderBottom: 'none',
              borderRadius: '6px 6px 0 0',
              backgroundColor: stylesTabButtonExceptions(state.showExceptions).backgroundColor,
            }}
          />
          <span />
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '150px 6px 150px auto',
          }}
        >
          <TabButton
            style={{
              borderRight: '1px solid lightgrey',
              borderLeft: '1px solid lightgrey',
              textAlign: 'center',
              fontSize: '90%',
              padding: '4px 1px',
              ...stylesTabButtonExceptions(!state.showExceptions),
            }}
            onClick={() => {
              if (state.showExceptions) {
                onChangeShowException(false);
                setState({ showExceptions: false });
              }
            }}
          >
            {t('programacoes')}
          </TabButton>
          <span
            style={{
              borderBottom: '1px solid lightgrey',
            }}
          />
          <TabButton
            style={{
              borderLeft: '1px solid lightgrey',
              borderRight: '1px solid lightgrey',
              textAlign: 'center',
              fontSize: '90%',
              padding: '4px 1px',
              ...stylesTabButtonExceptions(state.showExceptions),
            }}
            onClick={() => {
              if (!state.showExceptions) {
                onChangeShowException(true);
                setState({ showExceptions: true });
              }
            }}
          >
            {t('excecoes')}
          </TabButton>
          <span
            style={{
              borderBottom: '1px solid lightgrey',
            }}
          />
        </div>
      </Flex>
      <div
        style={{
          padding: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          ...(size === 'small' && {
            borderLeft: '1px solid lightgrey',
            borderRight: '1px solid lightgrey',
          }),
        }}
      >
        <span style={{ fontSize: '18px' }}>
          {`${t('total')}: ${state.showExceptions ? exceptions.length : schedules.length}`}
        </span>
        {(!hideAddButton && verifyProfileCanManageProgramming()) && (
          <LimitExceedTooltip disabled={limitExceeded} isException={state.showExceptions}>
            <Button
              variant={limitExceeded || loading ? 'disabled' : 'primary'}
              style={{
                width: 'fit-content',
                padding: '6px 15px',
                ...(!limitExceeded && { backgroundColor: '#363BC4' }),
              }}
              onClick={() => onAddEdit()}
              disabled={limitExceeded || loading}
            >
              {t('botaoAdicionarProgramacaoExcecao', {
                value: state.showExceptions
                  ? t('excecao')
                  : t('Programacao'),
              })}
            </Button>
          </LimitExceedTooltip>
        )}
      </div>
      <div
        style={{
          padding: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          ...(size === 'small' && {
            height: '677px',
            overflowX: 'hidden',
            overflowY: 'scroll',
            justifyContent: 'start',
            borderLeft: '1px solid lightgrey',
            borderRight: '1px solid lightgrey',
            gap: state.showExceptions ? 0 : 10,
            width: '100%',
            flexDirection: state.showExceptions ? 'column' : 'row',
          }),
        }}
      >
        {!state.showExceptions && schedules.map((sched) => (
          <SchedCard
            key={sched.SCHED_ID}
            driCfg={driCfg}
            sched={sched}
            onEdit={() => onAddEdit(sched)}
            onDelete={() => onDelete(sched)}
            size={size}
            canManageProgramming={verifyProfileCanManageProgramming()}
            loading={loading}
          />
        ))}
        {state.showExceptions && exceptions.length > 0 && (
          <>
            <ExceptionsHeader />
            {exceptions.map((exception) => (
              <Flex
                style={{
                  marginTop: '5px',
                  marginLeft: '16px',
                }}
                flexDirection="column"
                key={exception.SCHED_ID}
              >
                <ExceptionSchedCard
                  sched={exception}
                  onEdit={() => onAddEdit(exception)}
                  onDelete={() => onDelete(exception)}
                  size={size}
                  loading={loading}
                />
              </Flex>
            ))}
          </>
        )}
      </div>
    </Flex>
  );
};

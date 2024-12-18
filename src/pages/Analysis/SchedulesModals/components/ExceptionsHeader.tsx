import { CSSProperties, ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Flex } from 'reflexbox';

interface ExceptionsHeaderProps {
  style?: CSSProperties;
}

export function ExceptionsHeader({ style }: ExceptionsHeaderProps): ReactElement {
  const { t } = useTranslation();
  return (
    <Flex
      style={{
        marginLeft: '43px',
        ...style,
      }}
      flexDirection="row"
    >
      <div
        style={{
          fontWeight: 'bold',
          width: '42px',
          fontSize: '13px',
        }}
      >
        {t('titulo')}
      </div>
      <div
        style={{
          fontWeight: 'bold',
          marginLeft: '193px',
          width: '42px',
          fontSize: '13px',
        }}
      >
        {t('Data')}
      </div>
      <div
        style={{
          fontWeight: 'bold',
          marginLeft: '61px',
          width: '111px',
          fontSize: '13px',
        }}
      >
        {t('repetirTodoAno')}
      </div>
      <div
        style={{
          fontWeight: 'bold',
          marginLeft: '28px',
          width: '42px',
          fontSize: '13px',
        }}
      >
        {t('inicio')}
      </div>
      <div
        style={{
          fontWeight: 'bold',
          marginLeft: '33px',
          width: '30px',
          fontSize: '13px',
        }}
      >
        {t('fim')}
      </div>
    </Flex>
  );
}

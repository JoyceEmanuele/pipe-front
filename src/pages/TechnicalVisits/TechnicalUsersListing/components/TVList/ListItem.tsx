import { FaTrashAlt } from 'react-icons/fa';

import { Button } from '~/components';
import { colors } from '~/styles/colors';

import { ListItemContainer, ListItemContent } from './styles';

const TVStatusValues = {
  Agendado: 1,
  EmAndamento: 2,
  AguardandoAprovacao: 3,
  Finalizado: 4,
  Reagendado: 5,
};

const data = {
  ID: 1,
  UNIT_ID: 1,
  UNIT_NAME: 'Pampulha',
  TECNICO_ID: 'roberpereira@gmail.com',
  TECNICO_NOME: 'Roberto',
  TECNICO_SOBRENOME: 'Pereira',
  VTDATE: '12/02/2020',
  VTTIME: '10:00h',
  STATUS_ID: TVStatusValues.Agendado,
  STATUS: 'Agendado',
};

export const ListItem = (): JSX.Element => {
  const id = 1;
  return (
    <ListItemContainer>
      <ListItemContent>
        <span>{data.ID}</span>
        <span>{data.VTDATE}</span>
        <span>{data.VTTIME}</span>
        <span>{data.UNIT_NAME}</span>
        <span>
          {`${data.TECNICO_NOME} ${data.TECNICO_SOBRENOME}`}
        </span>
        <span>{data.STATUS }</span>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 15, marginTop: -10,
        }}
        >
          <Button
            variant="secondary"
            type="button"
            style={{
              width: 70, height: 35, borderColor: '#374BFF', color: '#374BFF', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            Ver
          </Button>
          <Button
            variant="primary"
            type="button"
            style={{
              width: 115, height: 35, marginLeft: 10, backgroundColor: '#374BFF', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            Editar
          </Button>
          <FaTrashAlt size={18} color={colors.Red} style={{ marginLeft: 10 }} />
        </div>
      </ListItemContent>
    </ListItemContainer>
  );
};

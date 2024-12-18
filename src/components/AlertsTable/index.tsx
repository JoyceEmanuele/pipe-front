import { ActionButton } from '../StyledComponents/ActionButton';
import { DeleteOutlineIcon, EditIcon } from '../../icons';
import { colors } from '../../styles/colors';

import {
  TableBox,
  Expand,
  Field,
  FieldDelete,
  DataBox,
  HeaderItems,
  ItemBox,
  ItemBoxDelete,
  ItemName,
  CustomHr,
  EmptyMessage,
} from './styles';

type AlertsTableProps = {
  data: any;
  onDelete: (item: any) => void;
  onEdit: (item:any) => void;
}

export const AlertsTable = ({ data, onDelete, onEdit }: AlertsTableProps): JSX.Element => (
  <TableBox>
    <HeaderItems>
      <ItemBox>
        <ItemName>Notificação</ItemName>
        <Expand />
      </ItemBox>
      <ItemBox>
        <ItemName>Filtro</ItemName>
        <Expand />
      </ItemBox>
      <ItemBox>
        <ItemName>Condição</ItemName>
        <Expand />
      </ItemBox>
      <ItemBox>
        <ItemName>Destinatário</ItemName>
        <Expand />
      </ItemBox>
      <ItemBoxDelete />
    </HeaderItems>
    <hr style={{ marginBottom: '0' }} />

    {data && data.length ? (
      data.map((item) => (
        <DataBox key={item.name}>
          <Field>{item.name}</Field>
          <Field>{item.filter}</Field>
          <Field>{item.condition}</Field>
          <Field>{item.dest}</Field>
          <FieldDelete>
            <ActionButton onClick={() => onEdit && onEdit(item)} variant="blue-inv">
              <EditIcon color={colors.LightBlue} />
            </ActionButton>
            <ActionButton onClick={() => onDelete && onDelete(item)} variant="red-inv">
              <DeleteOutlineIcon colors={colors.Red} />
            </ActionButton>
          </FieldDelete>
        </DataBox>
      ))
    ) : (
      <>
        <CustomHr />
        <EmptyMessage>Ainda não existem notificações</EmptyMessage>
      </>
    )}
  </TableBox>
);

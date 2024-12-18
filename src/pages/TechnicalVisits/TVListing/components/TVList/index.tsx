import { FaCaretDown, FaCaretUp } from 'react-icons/fa';

import { GetTechnicalVisitsListType, TVStatusValues } from '~/metadata/GetTechnicalVisitsList';
import { colors } from '~/styles/colors';

import { ListItem } from './ListItem';
import {
  Caret, CaretsContainer, Container, Header, ListContainer, ListTitleContainer,
} from './styles';

type TVListProps = {
  activeTab: typeof TVStatusValues[keyof typeof TVStatusValues];
  data: GetTechnicalVisitsListType[];
  handleOrdenation: (column: string, asc: boolean) => void;
  handleDeleteItem: (id: number) => void;
  handleEditItem: (id: number) => void;
  handleAccompanyItem: (id: number) => void;
  handleVisualizeItem: (id: number) => void;
  handleApproveItem: (id: number) => void;
  handleRescheduleItem: (id: number) => void;
}

type ListTitleProps = {
  title: string;
  onClick: (column: string, asc: boolean) => void;
}

const ListTitle = ({ title, onClick }: ListTitleProps): JSX.Element => (
  <ListTitleContainer>
    <span>{title}</span>
    <CaretsContainer>
      <Caret>
        <FaCaretUp color={colors.Blue700} size={14} onClick={() => onClick(title, true)} />
      </Caret>
      <Caret>
        <FaCaretDown color={colors.Blue700} size={14} onClick={() => onClick(title, false)} />
      </Caret>
    </CaretsContainer>
  </ListTitleContainer>
);

export const TVList = (props: TVListProps):JSX.Element => {
  const {
    activeTab,
    data,
    handleOrdenation,
    handleDeleteItem,
    handleEditItem,
    handleAccompanyItem,
    handleVisualizeItem,
    handleApproveItem,
    handleRescheduleItem,
  } = props;

  return (
    <Container>
      <Header isDurationVisible={activeTab !== TVStatusValues.Agendado}>
        <ListTitle title="ID VT" onClick={handleOrdenation} />
        <ListTitle title="Data" onClick={handleOrdenation} />
        <ListTitle title="Hora" onClick={handleOrdenation} />
        <ListTitle title="Unidade" onClick={handleOrdenation} />
        <ListTitle title="Técnico" onClick={handleOrdenation} />
        <ListTitle title="Status" onClick={handleOrdenation} />
        {activeTab !== TVStatusValues.Agendado && (
          <ListTitle title="Duração" onClick={handleOrdenation} />
        )}
      </Header>
      <ListContainer>
        {
        data.map((item) => (
          <ListItem
            key={item.ID}
            data={item}
            handleDeleteItem={handleDeleteItem}
            handleEditItem={handleEditItem}
            handleAccompanyItem={handleAccompanyItem}
            handleVisualizeItem={handleVisualizeItem}
            handleApproveItem={handleApproveItem}
            handleRescheduleItem={handleRescheduleItem}
          />
        ))
      }
      </ListContainer>
    </Container>
  );
};

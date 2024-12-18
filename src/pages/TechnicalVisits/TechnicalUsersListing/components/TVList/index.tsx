import { ListItem } from './ListItem';
import { Container, Header, ListContainer } from './styles';

export const TVList = ():JSX.Element => {
  const item = 1;

  return (
    <Container>
      <Header>
        <span>ID VT</span>
        <span>Data</span>
        <span>Hora</span>
        <span>Unidade</span>
        <span>Técnico</span>
        <span>Status</span>
      </Header>
      <ListContainer>
        <ListItem />
        <ListItem />
        <ListItem />
        <ListItem />
        <ListItem />
        <ListItem />
        <ListItem />
        <ListItem />
        <ListItem />
        <ListItem />
        <ListItem />
        <ListItem />
        <ListItem />
        <ListItem />
        <ListItem />
        <ListItem />
        <ListItem />
      </ListContainer>
    </Container>
  );
};

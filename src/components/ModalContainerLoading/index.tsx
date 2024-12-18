import { ModalContainerLoading } from './styles';

// Para usar de loading é necessário importar o modal + o Loader na tela que for ser usada;
// obs: é utilizado position absolute no css para centralizar utilize position relative na div pai do modal

interface ComponentProps {
    display?: boolean;
    children?: JSX.Element | (JSX.Element[]) | null | string;
}

export const ModalLoading = (props : ComponentProps): JSX.Element => (
  <ModalContainerLoading display={props.display}>
    {props.children}
  </ModalContainerLoading>
);

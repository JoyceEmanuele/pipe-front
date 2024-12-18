import {
  Wrapper,
  Title,
  ChildrenWrapper,
  ChildrenWrapperNoPadding,
  ChildrenWrapperNoPaddingRelative,
  Text,
} from './styles';

type CardProps = {
  title?: string;
  children: JSX.Element | (JSX.Element[]) | null | string;
  IconsContainer?: React.ComponentType;
  noPadding?: boolean;
  noPaddingRelative?: boolean;
  overflowHidden?: boolean;
  wrapperStyle?: React.CSSProperties;
}

export const Card = ({
  title = '', children, IconsContainer, noPadding = false, noPaddingRelative = false, overflowHidden = false, wrapperStyle = {},
}: CardProps): JSX.Element => (
  <Wrapper overflowHidden={overflowHidden} style={wrapperStyle}>
    <Title>
      <Text>{title || ''}</Text>
      {IconsContainer && <IconsContainer />}
    </Title>
    {noPadding && !noPaddingRelative && (
    <ChildrenWrapperNoPadding>
      {' '}
      {children}
    </ChildrenWrapperNoPadding>
    )}
    {!noPadding && !noPaddingRelative && (
    <ChildrenWrapper>
      {' '}
      {children}
    </ChildrenWrapper>
    )}
    {noPaddingRelative && (
      <ChildrenWrapperNoPaddingRelative>
        {' '}
        {children}
      </ChildrenWrapperNoPaddingRelative>
    )}
  </Wrapper>
);

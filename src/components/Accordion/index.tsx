import { useState, useEffect } from 'react';

import { colors } from '../../styles/colors';

import {
  Wrapper,
  HeaderWrapper,
  StyledArrowIcon,
  Header, TitleWrapper,
  StyledTitle, StyledTitle3,
  CollapsedContent,
} from './styles';

interface AccordionProps {
  title: string;
  children: JSX.Element | JSX.Element[];
  opened: boolean;
  color?: string;
}

export const Accordion = ({ title, children, opened }: AccordionProps): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (opened) setIsOpen(true);
  }, []);

  return (
    <Wrapper>
      <Header onClick={() => setIsOpen(!isOpen)}>
        {title && <StyledTitle>{title}</StyledTitle>}
        <StyledArrowIcon color={colors.Black} isOpen={isOpen} />
      </Header>
      <CollapsedContent isOpen={isOpen}>{children}</CollapsedContent>
    </Wrapper>
  );
};

export const AccordionV2 = (cProps: AccordionProps&{
  openedExtraHeader?: any
}): JSX.Element => {
  const {
    title, children, opened, openedExtraHeader, color, ...props
  } = cProps;

  const [isOpen, setIsOpen] = useState(!!opened);

  return (
    <Wrapper>
      <HeaderWrapper {...props}>
        <TitleWrapper onClick={() => setIsOpen(!isOpen)}>
          {title && <StyledTitle3 color={color || colors.Black}>{title}</StyledTitle3>}
          <StyledArrowIcon color={color || colors.Black} isOpen={isOpen} />
        </TitleWrapper>
        {isOpen && openedExtraHeader}
      </HeaderWrapper>
      <CollapsedContent isOpen={isOpen}>{children}</CollapsedContent>
    </Wrapper>
  );
};

/*
        <div>
          <Checkbox color="primary" onClick={() => onClickprops()} onChange={() => setStateCheck(headerObject)} />
          <span style={{ fontWeight: 'bold' }}>Selecionar Todos</span>
        </div>

*/

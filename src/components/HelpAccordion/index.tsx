import { useState, useCallback } from 'react';

import { Flex, Box } from 'reflexbox';

import {
  SubItems,
  Header,
  Icon,
  IconWrapper,
  Item,
  Title,
  AccordionBox,
  Wrapper,
  Separator,
} from './styles';

export const HelpAccordion = ({ title, data }): JSX.Element => {
  const [idAccordion, setIdAccordion] = useState(null);

  const isOpened = useCallback((id) => id === idAccordion, [idAccordion]);

  return (
    <Flex mb="24px">
      <Box width={1}>
        <Title>{title}</Title>
        <Flex justifyContent="center" alignItems="center" flexWrap="wrap">
          <Box width={1} mt="24px">
            <AccordionBox>
              {data.map((item, index) => (
                <div key={index}>
                  <Wrapper>
                    <Header onClick={() => (!isOpened(index) ? setIdAccordion(index) : setIdAccordion(null))}>
                      <Item>{item.text || ''}</Item>
                      <IconWrapper>
                        <Icon rotation={isOpened(index)} />
                      </IconWrapper>
                    </Header>
                    {item.content && isOpened(index) && (
                      <SubItems display={isOpened(index) ? 'block' : 'none'}>
                        <div>{item.content}</div>
                      </SubItems>
                    )}
                  </Wrapper>
                  <Separator />
                </div>
              ))}
            </AccordionBox>
          </Box>
        </Flex>
      </Box>
    </Flex>
  );
};

import { useRef } from 'react';
import {
  Content,
  StyledList,
  StyledItem,
  StyledLink,
} from './styles';

function handleScrollTo(currCont: { current }, ulRef) {
  try {
    if (currCont && currCont.current && ulRef && ulRef.current && window !== undefined && window.innerWidth < currCont.current.offsetLeft) {
      ulRef.current.scrollLeft = currCont.current.offsetLeft;
    }
  } catch (err) { console.log(err); }
}

export function Tabs({ links }) {
  const ulRef = useRef(null);

  return (
    <Content>
      <StyledList ref={ulRef}>
        {links.map((link) => {
          if (link.isActive) handleScrollTo(link.ref, ulRef);
          return (
            <StyledItem key={link.title} ref={link.ref}>
              <StyledLink isActive={link.isActive} to={link.link}>{link.title}</StyledLink>
            </StyledItem>
          );
        })}
      </StyledList>
    </Content>
  );
}

import { useRef, createRef, useState } from 'react';

import { useRouteMatch } from 'react-router-dom';

import {
  Wrapper,
  Content,
  StyledList,
  StyledList2,
  StyledItem,
  StyledLink,
  StyledLink2,
  StyledLine,
} from './styles';
import ReactTooltip from 'react-tooltip';

export const Header = ({ children = undefined, links, linksRight = undefined }): JSX.Element => {
  const match = useRouteMatch();
  const ulRef = useRef(null);
  const headerRefs = useRef(links.map(() => createRef()));

  return (
    <Wrapper>
      <Content>
        <StyledList ref={ulRef}>
          {links.map((link, index) => {
            const isActive = match.url.includes(link.link?.split('?')[0]) || match.url.startsWith(link.prefix);

            if (isActive) {
              handleScrollTo(link.ref || headerRefs.current[index], ulRef);
            }

            return (
              <StyledItem key={link.title} ref={link.ref || headerRefs.current[index]}>
                <StyledLink
                  to={link.link}
                  isActive={() => isActive}
                >
                  {link.title}
                </StyledLink>
                <StyledLine isActive={isActive} />
              </StyledItem>
            );
          })}
        </StyledList>
        {/* @ts-ignore */}
        {(linksRight && linksRight.length > 0)
          && (
            <StyledList2>
              {/* @ts-ignore */}
              {linksRight.map((link) => (
                <StyledItem key={link.title}>
                  <StyledLink to={link.link}>{link.title}</StyledLink>
                  <StyledLine isActive={false} />
                </StyledItem>
              ))}
            </StyledList2>
          )}
      </Content>
      {children}
    </Wrapper>
  );
};

export function Headers2({ links, maxChar }: {links: any, maxChar?: number }) {
  const ulRef = useRef(null);
  let tooltip = false;

  function returnTitle(title) {
    if (maxChar) {
      if (title.length >= maxChar) {
        tooltip = true;
        return `${title.slice(0, 20)}...`;
      }
    }
    return title;
  }
  return (
    <Content>
      <StyledList ref={ulRef}>
        {links?.map((link) => {
          if (link.isActive) handleScrollTo(link.ref, ulRef);
          if (!link.visible) {
            return (
              <>
              </>
            );
          }
          return (
            <>
              <StyledItem data-tip data-for={link.title} key={link.title} ref={link.ref}>
                <StyledLink2 isActive={link.isActive} to={link.link}>{returnTitle(link.title)}</StyledLink2>
                <StyledLine isActive={link.isActive} />
              </StyledItem>
              {
                (tooltip) && (
                  <ReactTooltip
                    id={link.title}
                    place="top"
                    textColor="#000000"
                    backgroundColor="rgba(255, 255, 255, 1)"
                    border
                    borderColor="#cfcfcf73"
                  >
                    <div>
                      <strong>{link.title}</strong>
                    </div>
                  </ReactTooltip>
                )
              }
            </>
          );
        })}
      </StyledList>
    </Content>
  );
}

function handleScrollTo(currCont: { current }, ulRef) {
  try {
    if (currCont && currCont.current && ulRef && ulRef.current && window !== undefined && window.innerWidth < currCont.current.offsetLeft) {
      ulRef.current.scrollLeft = currCont.current.offsetLeft;
    }
  } catch (err) { console.log(err); }
}

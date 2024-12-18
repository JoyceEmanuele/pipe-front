import { Seta } from '~/icons';
import { Wrapper } from '../Breadcrumb/styles';
import {
  StyledLink,
  StyledLinkLast,
  Separator,
  TimezoneInfo,
} from './styles';
import { useContext } from 'react';
import MenuContext from '~/contexts/menuContext';
import { TimezoneWarn } from '../TimezoneWarn';
import { isGraterThan20 } from '../Breadcrumb';

export const Breadcrumb2 = ({
  items, timezoneArea, timezoneGmt, unitId,
}): JSX.Element => {
  const { menuToogle } = useContext(MenuContext);// true = open, false = not Open
  const isDesktop = window.matchMedia('(min-width: 765px)');
  function timezoneInfo() {
    if (timezoneArea && timezoneGmt !== undefined && unitId && timezoneGmt !== -3) {
      localStorage.setItem('UnTimezone', unitId?.toString());
      return <TimezoneWarn area={timezoneArea} gmt={timezoneGmt} unitId={unitId} />;
    }
  }
  const parts: JSX.Element[] = [];
  for (let index = 0; index < items.length; index++) {
    const linkPath = items[index].link;
    const itemText = items[index].text;
    const isLast = (index >= (items.length - 1));
    const isMobile = !isDesktop.matches;
    if (isLast) {
      parts.push(
        <StyledLinkLast key={linkPath} to={linkPath}>
          {itemText.length > 20 ? `${itemText.slice(0, 20)}...` : itemText}
          <span>{linkPath === `/analise/unidades/${unitId}` && (timezoneInfo())}</span>
        </StyledLinkLast>,
      );
    } else if (linkPath) {
      parts.push(
        <StyledLink key={linkPath} to={linkPath}>
          {isGraterThan20(itemText, isMobile)}
          <TimezoneInfo className="infoTimezone" style={{ margin: 0 }}>{linkPath === `/analise/unidades/${unitId}` && (timezoneInfo())}</TimezoneInfo>
          <Seta />
        </StyledLink>,
      );
    } else {
      parts.push(
        <Separator key={`lnk:${index}`}>
          {isGraterThan20(itemText, isMobile)}
          <Seta />
        </Separator>,
      );
    }
  }

  return (
    <Wrapper isDesktop={isDesktop.matches} MenuOpen={menuToogle}>
      {parts}
    </Wrapper>
  );
};

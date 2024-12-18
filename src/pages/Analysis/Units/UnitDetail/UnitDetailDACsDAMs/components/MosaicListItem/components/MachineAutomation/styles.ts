import styled from 'styled-components';
import {
  Base, List, ListItem, SelectedLabel, Wrapper,
} from '~/components/Select/styles';
import { Select as DropdownMenu } from '~/components';
import { colors } from '~/styles/colors';
import { Link as RouterLink } from 'react-router-dom';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 170px;
  height: 100%;
`;

export const Title = styled.span`
  font-size: 11px;
  font-weight: 500;
  color: #6d6d6d;
  line-height: 11px;

  /* padding: 8px 0 4px 0; */
  margin-bottom: 10px;
  cursor: pointer;
`;

export const Label = styled.strong`
  font-size: 13px;
  line-height: normal;

  /* margin-bottom: 5px; */
`;

export const Link = styled.div`
  font-size: 10px;
  line-height: 7.5px;
  color: #363bc4;
  text-decoration: underline;

  padding-top: 10px;

  cursor: pointer;
`;

export const SelectedInput = styled(DropdownMenu)`
  ${Base} {
    height: 30px;
    min-height: 0;
  }
  ${Wrapper} {
    height: 30px;
  }
  ${SelectedLabel} {
    margin-top: 0;
  }
  ${List} {
    overflow-y: hidden;
  }
  ${ListItem} {
    &:hover {
      background-color: ${colors.Blue300};
      span {
        color: ${colors.White};
      }
    }
  }
`;

export const TransparentLink = styled(RouterLink)`
  color: inherit;
  text-decoration: inherit;
  &:hover {
    color: inherit;
    text-decoration: inherit;
  }
`;

export const IconWrapper = styled.div`
 svg {
  width: 27px;
  cursor: pointer;
 }
`;

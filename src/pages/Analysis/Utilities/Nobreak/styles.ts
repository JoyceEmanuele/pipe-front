import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { colors } from '~/styles/colors';

export const StyledLink = styled(Link)`
  color: ${colors.Grey300};
  &:hover {
    color: ${colors.Grey400};
  }
`;

export const InfoItemShort = styled.div`
  width: 150px;
  margin-right: 10px;
  margin-bottom: 20px;
`;

export const Title = styled.h1`
  font-weight: bold;
  font-size: 1.25em;
  margin-bottom: 16px;
  color: #363BC4;
`;

export const InfoItem = styled.div`
  width: 150px;
  margin-right: 20px;
  margin-bottom: 30px;
`;

export const Card = styled.div`
  padding: 32px;
  margin-top: 24px;
  border-radius: 10px;
  box-shadow: 0px 3px 8px rgba(0, 0, 0, 0.24), 0px 3px 12px rgba(0, 0, 0, 0.12);
`;

export const CustomInput = styled.div`
  min-height: 48px;
  margin: 0;
  font-size: 12px;
  color: #000;
  width: 100%;
  border: 1px solid #E9E9E9;
  border-radius: 5px;
  box-sizing: border-box !important;
  display: inline-flex;
  border: 0.7px solid ${colors.GreyInputBorder};
`;

export const Label = styled.span`
  transition: all 0.2s;
  margin-top: -6px;
  margin-left: 16px;
  margin-right: 16px;
  color: ${colors.Blue700};
  font-size: 11px;
  font-weight: bold;
`;

export const BtnClean = styled.div`
  cursor: pointer;
  color: ${colors.BlueSecondary};
  margin-top: 7px;
  text-decoration: underline;
  font-size: 14px;

  &:hover {
    color: ${colors.Blue400};
  }
`;

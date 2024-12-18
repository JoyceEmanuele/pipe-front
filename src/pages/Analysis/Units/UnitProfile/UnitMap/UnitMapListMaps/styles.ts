import styled from 'styled-components';
import { InputSearch } from '~/components/NewInputs/Search';
import { colors } from '~/styles/colors';

export const UnitMapListMapsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  padding: 22px;

  h2 {
    color: #000;
    font-family: Inter;
    font-size: 14px;
    font-style: normal;
    font-weight: 700;
    line-height: normal;

    margin: 0;
  }
`;

export const NewUnitMapButton = styled.div`
  width: 269px;
  height: 161px;

  display: flex;
  justify-content: center;
  align-items: center;

  padding: 64px 46px;

  border-radius: 8px;
  border: 1px solid #363BC4;

  color: #363BC4;

  font-family: Inter;
  font-size: 13px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;

  cursor: pointer;
`;

export const UnitMapListMapsContent = styled.div`
  padding: 25px;
  display: flex;
  gap: 20px;
  flex-wrap: wrap;

  overflow-y: scroll;

  height: 450px;
`;

export const UnitMapSearchInput = styled(InputSearch)`
  height: 50px
  width: 270px
  padding: 15px 26px 4px 14px
  border-radius: 5px

  &::placeholder, &::-webkit-input-placeholder, &::-moz-placeholder {
    font-family: Inter;
    font-size: 12px;
    font-style: normal;
    font-weight: 400;

    color: ${colors.Black};
  }
`;

export const UnitMapSearchWrapper = styled.div`
  border: unset;

  label {
    border: 1px solid #DADADA;
  }

  input {
    border: unset;
  }

  svg {
    width: 14px;
    height: 14px;

    path {
      fill: ${colors.Blue700};
    }
  }

  span {
    top: calc(50% - 20px);

    font-family: Inter;
    font-size: 11px;
    font-style: normal;
    font-weight: 700;

    color: ${colors.Blue700};
  }
`;

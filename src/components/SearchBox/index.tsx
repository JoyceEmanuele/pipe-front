import PropTypes from 'prop-types';

import { colors } from '../../styles/colors';

import {
  Container,
  Base,
  SearhcIcon,
} from './styles';

export const SearchBox = ({ ...props }): JSX.Element => (
  <Container>
    <Base {...props} />
    <SearhcIcon width="20" color={colors.DarkGrey} />
  </Container>
);

SearchBox.propTypes = {
  value: PropTypes.string,
};

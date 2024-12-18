import { Flex } from 'reflexbox';
import { MoreIcon } from '../../icons/More';
import { Dropdown, DropdownItem, DropdownItemTitle } from './styles';
import { useState, useRef, useEffect } from 'react';
import { ICard, useCard } from '../../contexts/CardContext';
import { t } from 'i18next';
import { CloseIcon, CollapseIcon, ExpandCardIcon } from '../../icons';

interface CardManagerProps {
  card: ICard;
}

export const CardManager = ({ card }: CardManagerProps): JSX.Element => {
  const { dispatch } = useCard();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleToggleExpanded = () => {
    dispatch({ type: 'TOGGLE_EXPANDED', payload: card?.type });
    setIsDropdownOpen(false);
  };

  const handleToggleVisibility = () => {
    dispatch({ type: 'TOGGLE_ACTIVE', payload: card?.type });
    setIsDropdownOpen(false);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <Flex
      alignItems="center"
      padding="12px"
      style={{ cursor: 'pointer', position: 'relative' }}
      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
    >
      <MoreIcon />
      {isDropdownOpen && (
        <Dropdown ref={dropdownRef}>
          <DropdownItem onClick={handleToggleExpanded}>
            <DropdownItemTitle>
              {card?.isExpanded ? (
                <>
                  <CollapseIcon style={{ marginRight: 4 }} />
                  <span>{t('recolher')}</span>
                </>
              ) : (
                <>
                  <ExpandCardIcon />
                  <span>{t('expandir')}</span>
                </>
              )}
            </DropdownItemTitle>
          </DropdownItem>
          <DropdownItem onClick={handleToggleVisibility}>
            <DropdownItemTitle>
              <CloseIcon style={{ marginRight: 8 }} color="#4950CC" />
              {t('desabilitarVisualizacao')}
            </DropdownItemTitle>
          </DropdownItem>
        </Dropdown>
      )}
    </Flex>
  );
};

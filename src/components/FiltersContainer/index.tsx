import { useEffect, useRef, useState } from 'react';
import {
  BtnActionFilters, BtnBasic, BtnFilters, BtnFiltersDropdown, BtnFiltersWrapper, Filters,
} from './styles';
import { CloseIcon, SearchInputIcon, TrashRoundedIcon } from '~/icons';
import { t } from 'i18next';

interface FiltersContainerProps {
  handleRemoveAllFilters?: () => void;
  handleSearchWithFilters?: () => void;
  handleRemoveFilter?: (key, index) => void;
  handleRemoveCategoryFilter?: (label) => void;
  filtersSelected?: {
    [key: string]: {
      label: string;
      values: {
        value: string | number;
        name: string;
      }[]
    };
  }
}

export const FiltersContainer: React.FC<FiltersContainerProps> = ({
  handleRemoveAllFilters,
  handleSearchWithFilters,
  handleRemoveCategoryFilter,
  handleRemoveFilter,
  filtersSelected,
}) => {
  const wrapperRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (openDropdown && wrapperRefs.current[openDropdown] && !wrapperRefs.current[openDropdown]?.contains(event.target)) {
        setOpenDropdown(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdown]);

  function verifyCountFilter(filterLength: number) {
    return filterLength > 1 ? `(${filterLength})` : '';
  }

  return (
    <>
      {filtersSelected && Object.values(filtersSelected).some((item) => item.values.length > 0) && (
        <Filters>
          {handleSearchWithFilters && (
            <BtnActionFilters style={{ height: '25px' }} onClick={handleSearchWithFilters}>
              <SearchInputIcon color="#363BC4" />
              {t('pesquisar')}
            </BtnActionFilters>
          )}
          <BtnActionFilters style={{ height: '25px' }} isActive={!!handleRemoveAllFilters} onClick={handleRemoveAllFilters}>
            <TrashRoundedIcon color="#ED193F" height="16px" />
            {t('limparFiltrosCap')}
          </BtnActionFilters>
          {Object.keys(filtersSelected).map((key) => (
            filtersSelected[key].values.length > 0 && (
              <BtnFiltersWrapper ref={(el) => (wrapperRefs.current[key] = el)} key={`wrapper-${key}`}>
                <BtnFilters
                  key={`item-${filtersSelected[key].label}-${key}`}
                  isActive={!!handleRemoveCategoryFilter}
                  onClick={() => {
                    setOpenDropdown(openDropdown === key ? null : key);
                  }}
                >
                  <span>
                    {`${filtersSelected[key].label} `}
                    <b>{verifyCountFilter(filtersSelected[key].values.length)}</b>
                  </span>
                  <CloseIcon onClick={() => handleRemoveCategoryFilter && handleRemoveCategoryFilter(key)} cursor="pointer" color="#363BC4" />
                </BtnFilters>
                {openDropdown === key && filtersSelected[key].values.length > 0 && (
                  <BtnFiltersDropdown>
                    {filtersSelected[key].values.map((filter, index) => (
                      <BtnBasic key={`dropdown-option-${filter.value}-${filter.name}`} isActive={!!handleRemoveFilter}>
                        <span>{filter.name}</span>
                        <CloseIcon
                          onClick={() => {
                            handleRemoveFilter && handleRemoveFilter(key, index);
                          }}
                          cursor="pointer"
                          color="#363BC4"
                        />
                      </BtnBasic>
                    ))}
                  </BtnFiltersDropdown>
                )}
              </BtnFiltersWrapper>
            )
          ))}
        </Filters>
      )}
    </>
  );
};

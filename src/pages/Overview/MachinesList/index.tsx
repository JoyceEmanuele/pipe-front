import { useEffect, useState } from 'react';

import { Flex, Box } from 'reflexbox';

import { Loader } from '~/components';
import { formatHealthIcon, healthLevelColor } from '~/components/HealthIcon';
import { ArrowIcon } from '~/icons';

import {
  WrapperTable,
  StyledTable,
  HeadItem,
  HeadData,
  BodyItem,
  StyledLink,
  StyledDiv,
  IconWrapper,
  HealthIconBox,
  StyledSpan,
  StyledToggle,
  ViewMoreArrow,
  MobileSelect,
  DesktopSelect,
} from './styles';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const MachinesList = ({ machineList }): JSX.Element => {
  // eslint-disable-next-line prefer-const
  let [viewMore, setViewMore] = useState(false);
  const [isSelected, setIsSelected] = useState('');
  const [orderedData, setOrderedData] = useState([]);

  const selectKeyName = (key) => {
    switch (key) {
      case 'Cidade':
        return 'CITY_NAME';
      case 'Estado':
        return 'STATE_ID';
      default:
        return 'UNIT_NAME';
    }
  };

  const handleFilterData = (key) => {
    const selectedKey = selectKeyName(key);

    const formatted = machineList.reduce((acc, cur) => {
      const selected = cur[selectedKey];

      if (selected) {
        if (!acc[selected]) {
          acc[selected] = {
            name: selected, bad: 0, medium: 0, good: 0, great: 0, others: 0, total: 0,
          };
        }

        const counts = acc[selected];

        counts.total++;
        switch (true) {
          case cur.H_INDEX === 25: counts.bad++; break;
          case cur.H_INDEX === 50: counts.medium++; break;
          case cur.H_INDEX === 75: counts.good++; break;
          case cur.H_INDEX === 100: counts.great++; break;
          default: counts.others++; break;
        }
      }

      return acc;
    }, {});

    const filteredData: any[] = Object.values(formatted);
    // @ts-ignore
    setOrderedData(filteredData.sort((a, b) => b.bad - a.bad || b.medium - a.medium));
  };

  useEffect(() => {
    if (isSelected) {
      return handleFilterData(isSelected);
    }
    handleFilterData('Cidade');
  }, [isSelected, machineList]);

  if (orderedData.length <= 5) { viewMore = true; }

  return (
    <>
      {orderedData?.length ? (
        <>
          <WrapperTable viewMore={viewMore}>
            <StyledTable>
              <thead>
                <tr>
                  <HeadItem>
                    <StyledDiv>
                      <DesktopSelect
                        name="search"
                        placeholder="Filtrar por"
                        onSelect={setIsSelected}
                        value={isSelected}
                        options={['Cidade', 'Estado', 'Unidade']}
                      />
                      <MobileSelect
                        name="search"
                        placeholder="Filtrar"
                        onSelect={setIsSelected}
                        value={isSelected}
                        options={['Cidade', 'Estado', 'Unidade']}
                      />
                    </StyledDiv>
                  </HeadItem>
                  <HeadData>
                    <IconWrapper>
                      <HealthIconBox color={healthLevelColor(25)}>
                        {formatHealthIcon(25)}
                      </HealthIconBox>
                    </IconWrapper>
                  </HeadData>
                  <HeadData>
                    <IconWrapper>
                      <HealthIconBox color={healthLevelColor(50)}>
                        {formatHealthIcon(50)}
                      </HealthIconBox>
                    </IconWrapper>
                  </HeadData>
                  <HeadData>
                    <IconWrapper>
                      <HealthIconBox color={healthLevelColor(75)}>
                        {formatHealthIcon(75)}
                      </HealthIconBox>
                    </IconWrapper>
                  </HeadData>
                  <HeadData>
                    <IconWrapper>
                      <HealthIconBox color={healthLevelColor(100)}>
                        {formatHealthIcon(100)}
                      </HealthIconBox>
                    </IconWrapper>
                  </HeadData>
                  <HeadData>
                    <IconWrapper>
                      <HealthIconBox color={healthLevelColor(0)}>
                        {formatHealthIcon(0)}
                      </HealthIconBox>
                    </IconWrapper>
                  </HeadData>
                  <HeadData>
                    <StyledSpan>
                      T
                      <StyledToggle>otal</StyledToggle>
                    </StyledSpan>
                  </HeadData>
                </tr>
              </thead>
              <tbody>
                {orderedData.map((item, index) => (
                  <tr key={index}>
                    <BodyItem align="left" padding="16px 0 0 25px">
                      {/* @ts-ignore */}
                      <StyledLink to={`/analise/maquinas?preFiltered=${item.name}`}>{item.name}</StyledLink>
                    </BodyItem>
                    {/* @ts-ignore */}
                    <BodyItem>{item.bad}</BodyItem>
                    {/* @ts-ignore */}
                    <BodyItem>{item.medium}</BodyItem>
                    {/* @ts-ignore */}
                    <BodyItem>{item.good}</BodyItem>
                    {/* @ts-ignore */}
                    <BodyItem>{item.great}</BodyItem>
                    {/* @ts-ignore */}
                    <BodyItem>{item.others}</BodyItem>
                    {/* @ts-ignore */}
                    <BodyItem>{item.total}</BodyItem>
                  </tr>
                ))}
              </tbody>
            </StyledTable>
          </WrapperTable>
          {(orderedData.length > 5)
            && (
            <Flex justifyContent="center">
              <Box>
                <ViewMoreArrow viewMore={viewMore} onClick={() => setViewMore(!viewMore)}>
                  <span>{viewMore ? 'Ver menos' : 'Ver mais'}</span>
                  <ArrowIcon />
                </ViewMoreArrow>
              </Box>
            </Flex>
            )}
        </>
      ) : (
        <Loader variant="primary" size="large" />
      )}
    </>
  );
};

export default MachinesList;

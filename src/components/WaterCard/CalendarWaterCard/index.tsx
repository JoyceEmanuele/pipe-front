import { useEffect, useState } from 'react';
import { ApiResps, apiCall } from '~/providers';
import {
  ContainerCalendar, ContainerDatesCalendar, ContainerInfoCalendar, ContainerItemDateCalendar,
} from '../style';
import { ArrowLeftIcon, ArrowRightIcon } from '~/icons';
import moment from 'moment';

type TCalendar = {
  period: 'day'|'month'|'year',
  startDate: moment.Moment,
  endDate: moment.Moment,
  setDateCalendar: (date) => void,
  selectedYear: number,
}

export function CalendarWater({
  period, startDate, endDate, setDateCalendar, selectedYear,
} : Readonly<TCalendar>) {
  const [openDates, setOpenDates] = useState(false);
  const [dates, setDates] = useState<ApiResps['/dma/get-dates-usage']['times']>([]);
  const [neighbors, setNeighbors] = useState({
    previous: null as string | null,
    next: null as string | null,
  });
  async function getDatesOfCalendar() {
    const params = {
      client_ids: [],
      state_ids: [],
      city_ids: [],
      unit_ids: [],
      period,
      startDate: startDate.format('YYYY-MM-DD'),
      endDate: endDate.format('YYYY-MM-DD'),
    };
    const dates = await apiCall('/dma/get-dates-usage', params);
    setDates(dates.times);
    if (period === 'year') {
      findNeighbors(selectedYear, dates.times);
    }
  }

  useEffect(() => {
    getDatesOfCalendar();
  }, []);

  useEffect(() => {
    if (period === 'year') {
      findNeighbors(selectedYear, dates);
    }
  }, [selectedYear]);

  function findNeighbors(selectedYear, data: ApiResps['/dma/get-dates-usage']['times']) {
    let previousYear = null as string | null;
    let nextYear = null as string | null;
    let selectedIndex = null as number | null;
    data.forEach((item, index) => {
      if (item.name === selectedYear.toString()) {
        selectedIndex = index;
      }
    });
    if (selectedIndex === null) {
      return { previousYear, nextYear };
    }
    data.forEach((item, index) => {
      if (item.hasUsage && index > selectedIndex! && !nextYear) {
        nextYear = item.name;
      }
      if (item.hasUsage && index < selectedIndex!) {
        previousYear = item.name;
      }
    });
    setNeighbors({ previous: previousYear, next: nextYear });
  }

  return (
    <ContainerCalendar>
      {
        (dates.length > 0 && period === 'year') && (
          <ContainerInfoCalendar>
            {
              neighbors.previous ? (
                <div onClick={() => setDateCalendar(neighbors.previous)}>
                  <ArrowLeftIcon color="black" />
                </div>
              ) : (
                <ArrowLeftIcon color="#B7B7B7" />
              )
            }
            <span onClick={() => setOpenDates(!openDates)}>{selectedYear}</span>
            {
              neighbors.next ? (
                <div onClick={() => setDateCalendar(neighbors.next)}>
                  <ArrowRightIcon color="black" />
                </div>
              ) : (
                <ArrowRightIcon color="#B7B7B7" />
              )
            }
          </ContainerInfoCalendar>
        )
      }
      {
        (openDates && period === 'year') && (
          <>
            <ContainerDatesCalendar style={{ overflow: dates.length > 6 ? 'scroll' : 'unset' }}>
              {
                dates.map((item) => (
                  <ContainerItemDateCalendar onClick={() => { if (item.hasUsage) { setDateCalendar(item.name); } }} key={item.name} haveData={item.hasUsage} selected={selectedYear === Number(item.name)}>
                    {item.name}
                  </ContainerItemDateCalendar>
                ))
              }
            </ContainerDatesCalendar>
            <div
              style={{
                top: 0, bottom: 0, left: 0, right: 0, position: 'fixed', zIndex: 10,
              }}
              onClick={() => setOpenDates(false)}
            />
          </>
        )
      }
    </ContainerCalendar>
  );
}

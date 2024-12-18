import { DevList } from '../types';

export const getRowSpanKeyValue = (devsList: DevList[], keyValue: string): number[] => {
  const namesArr = {};
  return devsList.reduce((result: number[], item, key) => {
    if (namesArr[item[keyValue]] === undefined) {
      namesArr[item[keyValue]] = key;
      result[key] = 1;
    } else {
      const firstIndex = namesArr[item[keyValue]];
      if (
        firstIndex === key - 1
          || (item[keyValue] === devsList[key - 1][keyValue] && result[key - 1] === 0)
      ) {
        result[firstIndex]++;
        result[key] = 0;
      } else {
        result[key] = 1;
        namesArr[item[keyValue]] = key;
      }
    }
    return result;
  }, []);
};

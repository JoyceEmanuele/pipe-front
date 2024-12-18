import queryString from 'query-string';

export function getDevTab(linkBase: string, queryPars: any, title: string, ref, dev?: string) {
  return {
    title,
    link: `${linkBase}?${queryString.stringify({ ...queryPars, dispositivo: dev })}`,
    isActive: (queryPars.dispositivo === dev),
    visible: true,
    ref,
  };
}

export const reorderList = <T>(list: T[], from: number, to: number): T[] => {
  const itemsList = [...list];
  const item = list[from];

  itemsList.splice(from, 1);

  itemsList.splice(to, 0, item);

  return itemsList;
};

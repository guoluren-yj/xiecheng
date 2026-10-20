export function getTabKeys<U extends string>(allTabKeys: U[]) {
  return allTabKeys.reduce<Record<string, U[]>>((total, item) => {
    if (item.startsWith('stage')) total.stageKeys.push(item);
    else total.sourceKeys.push(item);
    return total;
  }, { sourceKeys: [], stageKeys: [] });
};

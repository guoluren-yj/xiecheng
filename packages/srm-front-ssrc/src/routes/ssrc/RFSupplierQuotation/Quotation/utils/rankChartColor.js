// 排名
const getRankChartColor = (realRank = null) => {
  let color = null;
  switch (realRank) {
    case 1:
      color = '#F13131';
      break;
    case 2:
      color = '#FFC800';
      break;
    case 3:
      color = '#29BECE';
      break;
    default:
      color = '#D5DAE0';
      break;
  }

  return color;
};

export { getRankChartColor };

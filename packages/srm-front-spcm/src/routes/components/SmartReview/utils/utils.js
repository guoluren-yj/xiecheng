import intl from 'utils/intl';

// 获取下拉菜单
export const getMenus = () => {
  return [
    {
      key: 'riskLevel',
      title: intl.get('spcm.workspace.view.title.orderByRiskLevel').d('按风险等级排序'),
    },
    {
      key: 'validationType',
      title: intl.get('spcm.workspace.view.title.orderByValidationType').d('按校验类型排序'),
    },
    // {
    //   key: "riskAggre",
    //   title: intl.get('spcm.workspace.view.title.aggreByRiskLevel').d('按风险等级聚合'),
    // },
  ];
};

// 审查结果状态tag颜色
export const getReviewResultColor = (value) => {
  const colorMap = {
    PASSED: 'green',
    FAILED: 'red',
    NEW: 'yellow',
    PROCESSING: 'yellow',
    NO_PROCESS: 'yellow',
  };
  return value ? colorMap[value] : 'yellow';
};

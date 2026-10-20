/**
 * 通用render
 */

/**
 * 渲染列居左居中居右
 */
const renderAlign = (field) => {
  let align = 'left';
  switch (field.fieldWidget) {
    case 'INPUT_NUMBER':
      align = 'right';
      break;
    // case 'SWITCH':
    //   align = 'center';
    //   break;
    default:
      align = 'left';
      break;
  }
  // 涨跌幅靠右对齐
  if (['changePercent'].includes(field.dimensionCode)) {
    align = 'right';
  }
  return align;
};

export { renderAlign };

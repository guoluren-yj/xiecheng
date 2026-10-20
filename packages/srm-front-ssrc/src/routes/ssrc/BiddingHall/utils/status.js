/**
 * 判断状态未开始或者签到中
 * status string 当前单据状态
 * pausedStatus string 暂停状态
 * @return Boolean
 */
const notStartOrSignStatus = (status = '', pausedStatus = '') => {
  const Flag =
    status === 'NOT_START' ||
    status === 'SIGN_IN' ||
    (status === 'IN_PROGRESS' && (pausedStatus === 'NOT_START' || pausedStatus === 'SIGN_IN')) ||
    pausedStatus === 'NOT_START' ||
    pausedStatus === 'SIGN_IN';
  return Flag;
};

export { notStartOrSignStatus };

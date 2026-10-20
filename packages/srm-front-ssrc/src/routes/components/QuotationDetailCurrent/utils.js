import intl from 'utils/intl';

export const getExportFileName = (param = {}) => {
  const { baseDS } = param || {};
  const { current } = baseDS || {};

  const { exportExcelName } = current ? current.get(['exportExcelName']) : {};

  const name =
    exportExcelName || intl.get('ssrc.common.view.message.title.quotationDetail').d('报价明细');

  return name;
};

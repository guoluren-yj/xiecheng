/*
 * @date: 2020/10/26 15:12:06
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import intl from 'utils/intl';
import querystring from 'querystring';

export const getTitle = (param = {}) => {
  const { isEdit, historyVersionFlag, dataSet } = param;
  const versionNumber = dataSet?.current?.get('versionNumber');
  if (historyVersionFlag) {
    return intl
      .get('sslm.investTempConfig.view.title.viewTemplateVersion', {
        version: versionNumber,
      })
      .d(`查看调查表模板-版本v${versionNumber}`);
  } else if (isEdit) {
    return intl.get('sslm.investTempConfig.view.title.editInvestTemp').d('编辑调查表模板');
  }
  return intl.get('sslm.investTempConfig.view.title.viewInvestTemp').d('查看调查表模板');
};

// 详情页返回路径
export const getBackPath = ({ historyVersionFlag, sourceNewTemplateId, sourceOldTemplateId }) => {
  if (historyVersionFlag) {
    if (!sourceNewTemplateId || !sourceOldTemplateId) {
      return '/sslm/investigation-template-config/list';
    }
    const search = querystring.stringify({
      sourceNewTemplateId,
      sourceOldTemplateId,
    });
    return `/sslm/investigation-template-config/detail/${sourceNewTemplateId}/${sourceOldTemplateId}/view?${search}`;
  }
  return '/sslm/investigation-template-config/list';
};

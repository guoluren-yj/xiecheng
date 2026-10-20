/**
 * 导入历史-多语言
 * @author baitao.huang@hand-china.com
 * @date 2021-9-23
 * @version: 0.0.1
 * @copyright: Copyright (c) 2021, Hand
 */

import intl from 'hzero-front/lib/utils/intl';

const getLang = (key) => {
  const PREFIX = 'hitf.importHistory';
  const LANGS = {
    PREFIX,
    CLOSE: intl.get('hzero.common.button.close').d('关闭'),

    BELONG_TENANT: intl.get('hzero.common.model.common.belongTenant').d('所属租户'),

    HEADER: intl.get(`${PREFIX}.view.title.importHistory`).d('导入历史'),

    REQUEST_NUM: intl.get(`${PREFIX}.model.importHistory.requestNum`).d('请求编号'),
    IMPORT_USER: intl.get(`${PREFIX}.model.importHistory.importUser`).d('导入人'),
    IMPORT_URL: intl.get(`${PREFIX}.model.importHistory.importUrl`).d('导入地址'),
    IMPORT_STATUS: intl.get(`${PREFIX}.model.importHistory.importStatus`).d('导入状态'),
    IMPORT_MESSAGE: intl.get(`${PREFIX}.model.importHistory.importMessage`).d('导入消息'),
  };
  return LANGS[key];
};

export default getLang;

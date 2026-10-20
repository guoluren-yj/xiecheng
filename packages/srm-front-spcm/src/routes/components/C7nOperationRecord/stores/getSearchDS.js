/*
 * @Date: 2024-12-18 15:28:11
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2024, Hand
 */
import intl from 'utils/intl';

export const getSearchDs = ({ documentId, documentType } = {}) => ({
  queryFields: [
    {
      name: 'operateNode',
      display: true,
      noCache: true,
      lookupCode: 'SPCM.DOCUMENT_OPERATED_ACTION',
      lovPara: { documentId, documentType },
      label: intl.get('spcm.common.operate.node').d('操作节点'),
    },
    {
      name: 'operateTime',
      type: 'dateTime',
      range: true,
      display: true,
      label: intl.get('spcm.common.operate.time').d('操作时间'),
    },
  ],
});

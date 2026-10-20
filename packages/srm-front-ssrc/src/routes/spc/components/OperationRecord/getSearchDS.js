/*
 * @Date: 2024-12-18 15:28:11
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2024, Hand
 */
import intl from 'utils/intl';

export const getSearchDs = (docId, docType) => ({
  queryFields: [
    {
      name: 'operateNode',
      display: true,
      noCache: true,
      lookupCode: 'SPC.DOCUMENT_OPERATED_ACTION',
      lovPara: { documentId: docId, documentType: docType },
      label: intl.get('hzero.common.operate.node').d('操作节点'),
    },
    {
      name: 'operateTime',
      type: 'dateTime',
      range: true,
      display: true,
      label: intl.get('hzero.common.operate.time').d('操作时间'),
    },
  ],
});

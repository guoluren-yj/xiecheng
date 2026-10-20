import { DataSet } from 'choerodon-ui/pro';

import { sendTableDS } from './modalDS';
import { waitTableDS } from './ThingReceipts/indexDS';
import { returnTableDS } from './ThingReceipts/returnIndexDS';
import { endAsnTableDS, endTableDS } from './ThingReceipts/endIndexDS';
import { courseAsnTableDS, courseTableDS } from './ThingReceipts/courseIndexDS';
import { waitConfirmTableDS, waitConfirmAsnTableDS } from './ThingReceipts/waitConfirmDs';

/**
 * withProps 缓存
 */
export default {
  history,
  custTabParams: {
    one: {},
    two: {},
    three: {},
    four: {},
    five: {},
  },
  cacheTab: new Map(), // 缓存tab
  cacheNode: new Map(), // 缓存节点
  endTableDs: new DataSet(endTableDS()), // 已完成
  sendTableDs: new DataSet(sendTableDS()), // 退货modal
  waitTableDs: new DataSet(waitTableDS()), // 待收货
  endAsnTableDs: new DataSet(endAsnTableDS()), // 已完成按行
  returnTableDs: new DataSet(returnTableDS()), // 退货
  courseTableDs: new DataSet(courseTableDS()), // 进行中
  courseAsnTableDs: new DataSet(courseAsnTableDS()), // 进行中按行
  waitConfirmTableDs: new DataSet(waitConfirmTableDS()), // 待确认
  waitConfirmAsnTableDs: new DataSet(waitConfirmAsnTableDS()), // 待确认按行
};

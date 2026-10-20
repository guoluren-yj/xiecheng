/**
 * 对于标准组件的高阶进行再一次封装 - 适用于二开高阶
 * 返回高阶修饰后的标准组件
 */
import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';

import withProps from 'utils/withProps';
import formatterCollections from 'utils/intl/formatterCollections';
import { DataSet } from 'choerodon-ui/pro';
import remote from 'hzero-front/lib/utils/remote';
import { noop } from 'lodash';

import { SearchDS } from './SearchDS';
import {
  AllDS,
  ToBeReleasedDS,
  WaitingDS,
  PendingDS,
  FinishedDS,
  rfiTemplateDS,
  rfpTemplateDS,
} from './LineDS';

export function withStandardCompEnhancer(Comp) {
  const HOCComponent = WithCustomizeC7N({
    unitCode: [
      'SSRC.PROJECT_SETUP.NEW_LIST.HEADER_BUTTONS',
      'SSRC.PROJECT_SETUP.NEW_LIST.TABS',
      'SSRC.PROJECT_SETUP.NEW_LIST.TO_BE_RELEASED', // 待发布
      'SSRC.PROJECT_SETUP.NEW_LIST.PENDING', // 待处理
      'SSRC.PROJECT_SETUP.NEW_LIST.PENDING_APPROVAL', // 待审批
      'SSRC.PROJECT_SETUP.NEW_LIST.FINISHED', // 完成
      'SSRC.PROJECT_SETUP.NEW_LIST.ALL', // 全部
    ],
  })(
    formatterCollections({
      code: ['ssrc.projectSetup', 'ssrc.common', 'ssrc.inquiryHall', 'scux.ssrc'],
    })(
      withProps(
        () => ({
          // 全部
          allDS: new DataSet(AllDS()),

          // 待发布
          toBeReleasedDS: new DataSet(ToBeReleasedDS()),

          // 进行中_待处理
          waitingDS: new DataSet(WaitingDS()),

          // 进行中_待审批
          pendingDS: new DataSet(PendingDS()),

          // 完成
          finishedDS: new DataSet(FinishedDS()),

          // 高级搜索
          advancedSearchDS: new DataSet(SearchDS()),

          rfiTemplateDs: new DataSet(rfiTemplateDS()),

          rfpTemplateDs: new DataSet(rfpTemplateDS()),
        }),
        {
          cacheState: true,
          // keepOriginDataSet: true,
          cleanWhenClose: false,
          keepOriginDataSet: true,
        }
      )(
        remote(
          {
            code: 'SSRC_PROJECT_SETUP_NEW',
            name: 'remote',
          },
          {
            events: {
              remoteHandleChangeEvent(eventProps) {
                const { handleJumpChange = noop, ...others } = eventProps;
                handleJumpChange(others);
              },
              // 新建RFQ去掉选择寻源模版弹框
              handleCreateRFQEvent(eventProps) {
                const { openRfxTemplateModal = noop, record } = eventProps || {};
                openRfxTemplateModal(record);
              },
            },
          }
        )(Comp)
      )
    )
  );
  return HOCComponent;
}

import { connect } from 'dva';
import { DataSet } from 'choerodon-ui/pro';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { noop } from 'lodash';

import withProps from 'utils/withProps';
import formatterCollections from 'utils/intl/formatterCollections';
import remote from 'hzero-front/lib/utils/remote';
import CombineComponent from '@/routes/components/CombineComponent';
import { BID } from '@/utils/globalVariable';

import { TableDS } from './RF/RFDS';
import { RFQTableDS } from './RFX/RFQDS';

import { Supplierquotation } from './index';

const hocComponent = (NewComponent) => {
  return withCustomize({
    unitCode: [
      'SSRC.BID_SUPPLIER_REPLY.RF_LIST.ALL', // 全部
      'SSRC.BID_SUPPLIER_REPLY.RF_LIST.DONE_SUGGESTED', // 已完成-已获选
      'SSRC.BID_SUPPLIER_REPLY.RF_LIST.DONE_UN_SUGGESTED', // 已完成-未获选
      'SSRC.BID_SUPPLIER_REPLY.RF_LIST.DONE_ABANDONED', // 已完成-已放弃
      'SSRC.BID_SUPPLIER_REPLY.RF_LIST.PARTAKE', // 可参与
      'SSRC.BID_SUPPLIER_REPLY.RF_LIST.PEND_PROCESSING', // 待处理-进行中
      'SSRC.BID_SUPPLIER_REPLY.RF_LIST.PEND_UN_RESPONSE', // 待处理-未响应
      'SSRC.BID_SUPPLIER_REPLY.RF_LIST.ATTENTION', // 需要关注
      'SSRC.BID_SUPPLIER_REPLY.RF_LIST.TABS', // RF的TABS
      'SSRC.BID_SUPPLIER_REPLY.RFX_LIST.TABS', // RFX的TABS
      'SSRC.BID_SUPPLIER_REPLY.RFX_LIST.PARTICITION_INVITEME', // 未参与-邀请我的
      'SSRC.BID_SUPPLIER_REPLY.RFX_LIST.PARTICITION_OPENINQUIRY', // 未参与-公开征询
      'SSRC.BID_SUPPLIER_REPLY.RFX_LIST.ONGOING_NEEDDEAL', // 进行中-需要处理
      'SSRC.BID_SUPPLIER_REPLY.RFX_LIST.ONGOING_NEEDATTENTION', // 进行中-需要关注
      'SSRC.BID_SUPPLIER_REPLY.RFX_LIST.FINISH_NOTPAR', // 已结束-未参与
      'SSRC.BID_SUPPLIER_REPLY.RFX_LIST.FINISH_NOTWONBID', // 已结束-未中标
      'SSRC.BID_SUPPLIER_REPLY.RFX_LIST.FINISH_WONBID', // 已结束-已中标
      'SSRC.BID_SUPPLIER_REPLY.RFX_LIST.RFXALL_ALL', // 全部-整单
      'SSRC.BID_SUPPLIER_REPLY.RFX_LIST.RFXALL_DETAIL', // 全部-明细
    ],
  })(
    formatterCollections({
      code: [
        'ssrc.supplierQuotation',
        'ssrc.common',
        'ssrc.inquiryHall',
        'ssrc.rf',
        'ssrc.biddingHall',
        'ssrc.scux',
      ],
    })(
      connect(({ supplierQuotation, loading }) => ({
        supplierQuotation,
        // Loading: loading.effects['supplierQuotation/fetchEntranceList'],
        selectPreApplyLoading: loading.effects['supplierQuotation/fetchPretrialApplication'],
        savePreApplyLoading: loading.effects['supplierQuotation/savePretrialApplication'],
        submitPreApplyLoading: loading.effects['supplierQuotation/submitPretrialApplication'],
        selectPreApplyGroupLoading: loading.effects['supplierQuotation/querySupplierPrequalHeader'],
        savePreApplyGroupLoading: loading.effects['supplierQuotation/saveSupplierPrequalHeader'],
        submitPreApplyGroupLoading:
          loading.effects['supplierQuotation/submitSupplierPrequalHeader'],
        fetchPretrialPanelLoading: loading.effects['supplierQuotation/fetchPretrialPanel'],
        queryIndicateDataLoading: loading.effects['supplierQuotation/fetchQueryIndicateData'],
        saveConfirmMatterLoading: loading.effects['supplierQuotation/fetchSaveConfirmMatter'],
      }))(
        withProps(
          () => {
            const bidFlag = true;
            const custKey = 'BID_';
            // RFX
            // 邀请我的
            const invitationDS = new DataSet(
              RFQTableDS({
                customizeUnitCode: `SSRC.${custKey}SUPPLIER_REPLY.RFX_LIST.PARTICITION_INVITEME,SSRC.${custKey}SUPPLIER_REPLY.RFX_LIST.PARTICITION_FILTER`,

                currentTable: 'invite',
                custKey,
                bidFlag,
              })
            );
            // 公开征询
            const openInquiryDS = new DataSet(
              RFQTableDS({
                customizeUnitCode: `SSRC.${custKey}SUPPLIER_REPLY.RFX_LIST.PARTICITION_OPENINQUIRY,SSRC.${custKey}SUPPLIER_REPLY.RFX_LIST.PARTICITION_FILTER`,

                currentTable: 'open',
                bidFlag,
              })
            );
            // 需要处理
            const needDealDS = new DataSet(
              RFQTableDS({
                customizeUnitCode: `SSRC.${custKey}SUPPLIER_REPLY.RFX_LIST.ONGOING_NEEDDEAL,SSRC.${custKey}SUPPLIER_REPLY.RFX_LIST.ONGOING_FILTER`,

                currentTable: 'processing',
                bidFlag,
              })
            );
            // 需要关注
            const needAttentionDS = new DataSet(
              RFQTableDS({
                customizeUnitCode: `SSRC.${custKey}SUPPLIER_REPLY.RFX_LIST.ONGOING_NEEDATTENTION,SSRC.${custKey}SUPPLIER_REPLY.RFX_LIST.ONGOING_FILTER`,

                currentTable: 'attention',
                bidFlag,
              })
            );
            // 已中标
            const wonBidDS = new DataSet(
              RFQTableDS({
                customizeUnitCode: `SSRC.${custKey}SUPPLIER_REPLY.RFX_LIST.FINISH_WONBID,SSRC.${custKey}SUPPLIER_REPLY.RFX_LIST.FINISH_FILTER`,

                currentTable: 'suggested',
                bidFlag,
              })
            );
            // 未中标
            const notWonBidDS = new DataSet(
              RFQTableDS({
                customizeUnitCode: `SSRC.${custKey}SUPPLIER_REPLY.RFX_LIST.FINISH_NOTWONBID,SSRC.${custKey}SUPPLIER_REPLY.RFX_LIST.FINISH_FILTER`,

                currentTable: 'un-suggested',
                bidFlag,
              })
            );
            // 未参与
            const notParDS = new DataSet(
              RFQTableDS({
                customizeUnitCode: `SSRC.${custKey}SUPPLIER_REPLY.RFX_LIST.FINISH_NOTPAR,SSRC.${custKey}SUPPLIER_REPLY.RFX_LIST.FINISH_FILTER`,

                currentTable: 'other',
                bidFlag,
              })
            );
            // 全部-整单
            const rfxAllDS = new DataSet(
              RFQTableDS({
                customizeUnitCode: `SSRC.${custKey}SUPPLIER_REPLY.RFX_LIST.RFXALL_ALL,SSRC.${custKey}SUPPLIER_REPLY.RFX_LIST.ALL_FILTER`,

                currentTable: 'all',
                bidFlag,
                pageSize: 20,
              })
            );
            // 全部-明细
            // rfxDetailLineDS = new DataSet(
            //   RFQTableDS({
            //     customizeUnitCode:
            //       'SSRC.${custKey}SUPPLIER_REPLY.RFX_LIST.RFXALL_DETAIL,SSRC.${custKey}SUPPLIER_REPLY.RFX_LIST.ALL_FILTER',
            //
            //     currentTable: 'line',
            //   })
            // );

            // RF
            // 进行中-需要处理
            const onGoingDS = new DataSet(
              TableDS({
                customizeUnitCode: `SSRC.${custKey}SUPPLIER_REPLY.RF_LIST.PEND_PROCESSING,SSRC.${custKey}SUPPLIER_REPLY.RF_LIST.PEND_FILTER_BAR`,
                currentTable: 'processing',
              })
            );
            // 进行中-需要关注
            const attentionDS = new DataSet(
              TableDS({
                customizeUnitCode: `SSRC.${custKey}SUPPLIER_REPLY.RF_LIST.PEND_PROCESSING,SSRC.${custKey}SUPPLIER_REPLY.RF_LIST.PEND_FILTER_BAR`,
                currentTable: 'attention',
              })
            );
            // 未参与-邀请我的
            const notResponseDS = new DataSet(
              TableDS({
                customizeUnitCode: `SSRC.${custKey}SUPPLIER_REPLY.RF_LIST.PEND_UN_RESPONSE,SSRC.${custKey}SUPPLIER_REPLY.RF_LIST.PEND_FILTER_BAR`,
                currentTable: 'un-response',
              })
            );
            // 未参与-公开征询
            const canParticipateDS = new DataSet(
              TableDS({
                customizeUnitCode: `SSRC.${custKey}SUPPLIER_REPLY.RF_LIST.PARTAKE,SSRC.${custKey}SUPPLIER_REPLY.RF_LIST.PARTAKE_FILTER_BAR`,
                currentTable: 'can-participate',
              })
            );
            // 已获选
            const suggestedDS = new DataSet(
              TableDS({
                customizeUnitCode: `SSRC.${custKey}SUPPLIER_REPLY.RF_LIST.DONE_ABANDONED,SSRC.${custKey}SUPPLIER_REPLY.RF_LIST.DONE_FILTER_BAR`,
                currentTable: 'suggested',
              })
            );
            // 未获选
            const unSuggestedDS = new DataSet(
              TableDS({
                customizeUnitCode: `SSRC.${custKey}SUPPLIER_REPLY.RF_LIST.DONE_UN_SUGGESTED,SSRC.${custKey}SUPPLIER_REPLY.RF_LIST.DONE_FILTER_BAR`,
                currentTable: 'un-suggested',
              })
            );
            // 已放弃
            const abandonedDS = new DataSet(
              TableDS({
                customizeUnitCode: `SSRC.${custKey}SUPPLIER_REPLY.RF_LIST.DONE_ABANDONED,SSRC.${custKey}SUPPLIER_REPLY.RF_LIST.DONE_FILTER_BAR`,
                currentTable: 'abandoned',
              })
            );
            // 全部
            const allDS = new DataSet(
              TableDS({
                customizeUnitCode: `SSRC.${custKey}SUPPLIER_REPLY.RF_LIST.ALL,SSRC.${custKey}SUPPLIER_REPLY.RF_LIST.ALL_FILTER_BAR`,
                currentTable: 'all',

                pageSize: 20,
              })
            );
            return {
              invitationDS,
              openInquiryDS,
              needDealDS,
              needAttentionDS,
              wonBidDS,
              notWonBidDS,
              notParDS,
              rfxAllDS,
              onGoingDS,
              attentionDS,
              notResponseDS,
              canParticipateDS,
              suggestedDS,
              unSuggestedDS,
              abandonedDS,
              allDS,
            };
          },
          {
            cacheState: true,
            keepOriginDataSet: true,
          }
        )(
          remote(
            {
              code: 'SSRC_RFSUPPLIER_QUOTATION_NEW_LIST',
              name: 'remoteHoc',
            },
            {
              events: {
                // 操作按钮方法埋点
                remoteCuxOperate() {},
                // 单据参与方法埋点
                remoteParticipate(remoteProps = {}) {
                  const { handleParticipate = noop } = remoteProps || {};
                  handleParticipate();
                },
              },
            }
          )(NewComponent)
        )
      )
    )
  );
};

export default CombineComponent({
  sourceKey: BID,
})(hocComponent(Supplierquotation));

export { hocComponent, Supplierquotation };

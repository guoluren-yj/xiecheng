import mixCustomize from 'srm-front-cuz/lib/mixCustomize';
import { Form } from 'hzero-ui';
import { connect } from 'dva';
import formatterCollections from 'utils/intl/formatterCollections';
import remote from 'hzero-front/lib/utils/remote';

import { getCurrentOrganizationId, getCurrentUserId } from 'utils/utils';

import CombineComponent from '@/routes/components/CombineComponent';
import { BID } from '@/utils/globalVariable';
import { Detail } from './index';

const HOCComponent = (Comp) => {
  return CombineComponent({
    sourceKey: BID,
  })(
    mixCustomize({
      unitCode: [
        'SSRC.BID_OFFLINE_RESULT_ENTRY.DETAIL.HEADINFO',
        'SSRC.BID_OFFLINE_RESULT_ENTRY.LINE',
        'SSRC.BID_OFFLINE_RESULT_ENTRY.BUTTON_GROUP',
        'SSRC.BID_OFFLINE_RESULT_ENTRY.BATCH_ADD_QUOTATION',
        'SSRC.BID_OFFLINE_RESULT_ENTRY.BATCH_ITEM_FORM',
        'SSRC.BID_OFFLINE_RESULT_ENTRY.TABS',
        'SSRC.BID_OFFLINE_RESULT_ENTRY.ATTACHMENT_FORM',
        'SSRC.BID_OFFLINE_RESULT_ENTRY.HEADER_ATTACHMENT_TABLE',
      ],
      c7nUnit: [
        'SSRC.BID_OFFLINE_RESULT_ENTRY.LINE',
        'SSRC.BID_OFFLINE_RESULT_ENTRY.BUTTON_GROUP',
        'SSRC.BID_OFFLINE_RESULT_ENTRY.BATCH_ITEM_FORM',
        'SSRC.BID_OFFLINE_RESULT_ENTRY.ATTACHMENT_FORM',
        'SSRC.BID_OFFLINE_RESULT_ENTRY.HEADER_ATTACHMENT_TABLE',
      ],
    })(
      Form.create({ fieldNameProp: null })(
        connect(({ offlineResultEntryBid, commonModel, loading, importExcel: { namespace } }) => ({
          offlineResultEntryBid,
          modelName: 'offlineResultEntryBid',
          namespace,
          commonModel,
          uploadExcelLoading: loading.effects['importExcel/uploadExcel'],
          validateDataLoading: loading.effects['importExcel/validateData'],
          loadDataSourceLoading: loading.effects['importExcel/loadDataSource'],
          importDataLoading: loading.effects['importExcel/importData'],
          queryStatusLoading: loading.effects['importExcel/queryStatus'],
          queryPrefixPatchLoading: loading.effects['importExcel/queryPrefixPatch'],
          fetchInquiryHeaderLoading: loading.effects['offlineResultEntryBid/fetchInquiryHeader'],
          fetchQuoteLineListLoading: loading.effects['offlineResultEntryBid/fetchQuoteLineList'],
          saveQuoteLineLading: loading.effects['offlineResultEntryBid/saveQuoteLine'],
          submitQuoteLineLading: loading.effects['offlineResultEntryBid/submitQuoteData'],
          fetchItemListLading: loading.effects['offlineResultEntryBid/fetchItemList'],
          ladderLoading: loading.effects['offlineResultEntryBid/saveLadderList'],
          organizationId: getCurrentOrganizationId(),
          userId: getCurrentUserId(),
        }))(
          formatterCollections({
            code: [
              'ssrc.offlineResultEntry',
              'ssrc.inquiryHall',
              'ssrc.common',
              'ssrc.supplierQuotation',
              'ssrc.bidHall',
              'ssrc.priceLibraryNew',
              'sscux.ssrc',
            ],
          })(
            remote(
              {
                code: 'SSRC_OFFLINE_RESULT_ENTRY_DETAIL',
                name: 'offlineResultRemote',
              },
              {
                events: {
                  getChangeTab(eventProps) {
                    const { key, that } = eventProps || {};
                    that.setState({
                      activeKey: key,
                    });
                  },
                  remoteBatchUpdateLineAfterHandle() {},
                  remoteBatchUpdateLineBeforeHandle() {},
                },
              }
            )(Comp)
          )
        )
      )
    )
  );
};

export default HOCComponent(Detail);

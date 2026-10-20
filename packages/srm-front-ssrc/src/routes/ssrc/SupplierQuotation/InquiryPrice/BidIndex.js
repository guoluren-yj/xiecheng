import { BID } from '@/utils/globalVariable';
import CombineComponent from '@/routes/components/CombineComponent';

import { connect } from 'dva';
import { Form } from 'hzero-ui';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { isEmpty, noop } from 'lodash';
import remote from 'hzero-front/lib/utils/remote';

import { getCurrentOrganizationId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import { InquiryPrice } from './index';

const custKey = 'BID_';

const HOCComponent = (com) => {
  return withCustomize({
    unitCode: [
      `SSRC.${custKey}SUPPLIER_QUOTATION.LINE`,
      `SSRC.${custKey}SUPPLIER_QUOTATION.LINE_FORM`,
      `SSRC.${custKey}SUPPLIER_QUOTATION.BASE_FORM`,
      `SSRC.${custKey}SUPPLIER_QUOTATION.ITEM`,
      `SSRC.${custKey}SUPPLIER_QUOTATION.HEADER_BUTTONS`,
      `SSRC.${custKey}SUPPLIER_QUOTATION.BATCH_MAINTAIN_MATERIAL`,
      `SSRC.${custKey}SUPPLIER_QUOTATION.ROUND_QUOTATION_TABLE`,
    ],
  })(
    formatterCollections({
      code: [
        'ssrc.supplierQuotation',
        'ssrc.inquiryHall',
        'ssrc.common',
        'ssrc.bidHall',
        'ssrc.priceLibrary',
        'ssrc.offlineResultEntry',
        'ssrc.scux',
        'sscux.ssrc',
      ],
    })(
      Form.create({
        fieldNameProp: null,
        onValuesChange: (props, value) => {
          const { dispatch } = props;
          if (isEmpty(value) || typeof dispatch !== 'function') {
            return;
          }

          dispatch({
            type: 'supplierQuotationNewBid/updateState',
            payload: {
              supplierFormChangeFlag: 1,
            },
          });
        },
      })(
        connect(
          ({
            supplierQuotationNewBid,
            quotationTemplate,
            loading,
            importExcel: { namespace },
          }) => ({
            supplierQuotationNewBid,
            modelName: 'supplierQuotationNewBid',
            supplierQuotation: supplierQuotationNewBid,
            quotationTemplate,
            namespace,
            allLoading: loading.global,
            uploadExcelLoading: loading.effects['importExcel/uploadExcel'],
            validateDataLoading: loading.effects['importExcel/validateData'],
            loadDataSourceLoading: loading.effects['importExcel/loadDataSource'],
            importDataLoading: loading.effects['importExcel/importData'],
            queryStatusLoading: loading.effects['importExcel/queryStatus'],
            queryPrefixPatchLoading: loading.effects['importExcel/queryPrefixPatch'],
            queryQuotationHeaderLoading:
              loading.effects['supplierQuotationNewBid/queryQuotationHeader'],
            fetchListLoading: loading.effects['supplierQuotationNewBid/queryQuotationLines'], // 报价行loading
            fetchQuestionLineLoading:
              loading.effects['supplierQuotationNewBid/queryBiddingQuotationLine'], // 查询单行报价loading
            saveQuotationLinesLoading:
              loading.effects['supplierQuotationNewBid/saveQuotationLines'],
            submitReferencePriceLoading:
              loading.effects['supplierQuotationNewBid/submitReferencePrice'],
            queryQuotationLinesLoading:
              loading.effects['supplierQuotationNewBid/queryQuotationLines'],
            submitQuotationLinesLoading:
              loading.effects['supplierQuotationNewBid/submitQuotationLines'],
            fetchLadderListLoading: loading.effects['supplierQuotationNewBid/fetchLadderList'],
            saveLadderListLoading: loading.effects['supplierQuotationNewBid/saveLadderList'],
            deleteLadderQuotLoading: loading.effects['supplierQuotationNewBid/deleteLadderQuot'],
            queryRoundQuotationLineDetailLoading:
              loading.effects['supplierQuotationNewBid/queryRoundQuotationLineDetail'],
            validateLadderLoading:
              loading.effects['supplierQuotationNewBid/validateLadderQuotation'], // 阶梯报价保存前的校验loading
            queryPrintLoading: loading.effects['supplierQuotationNewBid/queryPrint'],
            organizationId: getCurrentOrganizationId(),
          })
        )(
          formatterCollections({
            code: [
              'ssrc.supplierQuotation',
              'ssrc.inquiryHall',
              'ssrc.common',
              'ssrc.bidHall',
              'ssrc.priceLibrary',
              'ssrc.offlineResultEntry',
            ],
          })(
            remote(
              {
                code: 'SSRC_SUPPLIER_QUOTATION_INQUIRY_PRICE',
              },
              {
                events: {
                  remoteBackQuoLine(props = {}) {
                    const { handleBackQuoLine = noop } = props;
                    handleBackQuoLine(props);
                  },
                  remoteSectionBatchBeforeSubmit(props) {
                    const { handleQuotationSectionBatchSubmitFunc = () => {} } = props || {};
                    handleQuotationSectionBatchSubmitFunc();
                  },
                  remoteBeforeHandleSubmit() {},
                  remoteBeforeSubmitDetailBiddingOfferSingle() {},
                },
              }
            )(com)
          )
        )
      )
    )
  );
};

export default CombineComponent({
  sourceKey: BID,
})(HOCComponent(InquiryPrice));

export { HOCComponent };

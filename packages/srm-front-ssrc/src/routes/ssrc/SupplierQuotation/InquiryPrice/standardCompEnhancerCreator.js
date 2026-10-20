import { connect } from 'dva';
import { Form } from 'hzero-ui';
import { isEmpty, noop } from 'lodash';
import remote from 'hzero-front/lib/utils/remote';

import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId } from 'utils/utils';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

export function withStandardCompEnhancer(Comp, bidFlag = false) {
  const custKey = bidFlag ? 'BID_' : '';
  const HOCComponent = withCustomize({
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
            type: 'supplierQuotation/updateState',
            payload: {
              supplierFormChangeFlag: 1,
            },
          });
        },
      })(
        connect(
          ({ supplierQuotation, quotationTemplate, loading, importExcel: { namespace } }) => ({
            supplierQuotation,
            quotationTemplate,
            namespace,
            allLoading: loading.global,
            uploadExcelLoading: loading.effects['importExcel/uploadExcel'],
            validateDataLoading: loading.effects['importExcel/validateData'],
            loadDataSourceLoading: loading.effects['importExcel/loadDataSource'],
            importDataLoading: loading.effects['importExcel/importData'],
            queryStatusLoading: loading.effects['importExcel/queryStatus'],
            queryPrefixPatchLoading: loading.effects['importExcel/queryPrefixPatch'],
            queryQuotationHeaderLoading: loading.effects['supplierQuotation/queryQuotationHeader'],
            fetchListLoading: loading.effects['supplierQuotation/queryQuotationLines'], // 报价行loading
            fetchQuestionLineLoading:
              loading.effects['supplierQuotation/queryBiddingQuotationLine'], // 查询单行报价loading
            saveQuotationLinesLoading: loading.effects['supplierQuotation/saveQuotationLines'],
            submitReferencePriceLoading: loading.effects['supplierQuotation/submitReferencePrice'],
            queryQuotationLinesLoading: loading.effects['supplierQuotation/queryQuotationLines'],
            submitQuotationLinesLoading: loading.effects['supplierQuotation/submitQuotationLines'],
            fetchLadderListLoading: loading.effects['supplierQuotation/fetchLadderList'],
            saveLadderListLoading: loading.effects['supplierQuotation/saveLadderList'],
            deleteLadderQuotLoading: loading.effects['supplierQuotation/deleteLadderQuot'],
            queryRoundQuotationLineDetailLoading:
              loading.effects['supplierQuotation/queryRoundQuotationLineDetail'],
            validateLadderLoading: loading.effects['supplierQuotation/validateLadderQuotation'], // 阶梯报价保存前的校验loading
            queryPrintLoading: loading.effects['supplierQuotation/queryPrint'],
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
              'sscux.ssrc',
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
                  remoteHandleItemLineDidMount() {},
                  remoteBeforeHandleSubmit() {},
                  remoteBeforeSubmitDetailBiddingOfferSingle() {},
                },
              }
            )(Comp)
          )
        )
      )
    )
  );
  return HOCComponent;
}

import { connect } from 'dva';
import { Form } from 'hzero-ui';
import remote from 'hzero-front/lib/utils/remote';

import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { getCurrentOrganizationId, getCurrentUserId } from 'utils/utils';

export function withStandardCompEnhancer(Comp) {
  const HOCComponent = withCustomize({
    unitCode: [
      'SSRC.QUOTATION_CONTROLLER_DETAIL.ITEM_LINE',
      'SSRC.QUOTATION_CONTROLLER_DETAIL.HEADER',
      'SSRC.QUOTATION_CONTROLLER_DETAIL.OTHER',
      'SSRC.QUOTATION_CONTROLLER_DETAIL.OTHER.INFO',
      'SSRC.QUOTATION_CONTROLLER_DETAIL.SUPPLIERLIST',
      'SSRC.QUOTATION_CONTROLLER_DETAIL.ITEM_FILTER_SUPPLIER',
      'SSRC.QUOTATION_CONTROLLER_DETAIL.HEADER_BUTTONS',
    ],
  })
  (
    Form.create({ fieldNameProp: null })(
      formatterCollections({ code: ['ssrc.quoController', 'ssrc.inquiryHall', 'ssrc.common', 'scux.ssrc'] })(
        connect(({ quotationController, inquiryHall, queryRfq, loading }) => ({
          quotationController,
          inquiryHall,
          queryRfq,
          fetchInquiryHallUpdateLoading:
            loading.effects['quotationController/fetchInquiryHeaderDetail'],
          fetchItemLineLoading: loading.effects['quotationController/fetchItemLine'],
          fetchSupplierLineLoading: loading.effects['quotationController/fetchSupplierLine'],
          fetchMaterialLoading: loading.effects['quotationController/fetchMaterial'],
          saveSupplierLoading: loading.effects['inquiryHall/saveSupplier'],
          pauseLoading: loading.effects['quotationController/pause'],
          closeLoading: loading.effects['quotationController/close'],
          resumeLoading: loading.effects['quotationController/resume'],
          fetchScoringElementLoading:
            loading.effects['quotationController/fetchScoringElementData'],
          fetchLadderLevelTableLoading:
            loading.effects['quotationController/fetchLadderLevelTable'],

          fetchItemLineQuotationDetailLoading:
            loading.effects['inquiryHall/fetchItemLineQuotationDetail'],
          saveAdjustTimeLoading: loading.effects['quotationController/handleAdjustTime'],
          stopLoading: loading.effects['quotationController/finishQuotation'],
          organizationId: getCurrentOrganizationId(),
          userId: getCurrentUserId(),
        }))(
          remote({
            code: 'SSRC_QUOTATION_CONTROLLER_DETAIL',
            name: 'remote',
          })(Comp)
        )
      )
    )
  );
  return HOCComponent;
}

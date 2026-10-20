/*
 * @Description:
 * @Version: 2.0
 * @Autor: wangmiao
 * @Date: 2021-07-09 17:34:01
 * @LastEditors: wangmiao
 * @LastEditTime: 2021-09-17 14:30:35
 */
import { connect } from 'dva';
import { Form } from 'hzero-ui';
import { getCurrentOrganizationId } from 'utils/utils';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import formatterCollections from 'utils/intl/formatterCollections';

import BidEvaluation from '../BidEvaluation';

@withCustomize({
  unitCode: [
    'SSRC.EXPERT_SCORE_MANAGE.SUPPLIER_LINE',
    'SSRC.EXPERT_SCORE_MANAGE.EXPERT_LINE',
    'SSRC.EXPERT_SCORE_MANAGE.EXPERT_LINE_RFI',
    'SSRC.EXPERT_SCORE_MANAGE.HEADER_BUTTON',
  ],
})
@connect(({ bidHall, loading }) => ({
  bidHall,
  modelName: 'bidHall',
  fetchSupplierListLoading: loading.effects['bidHall/fetchSupplierList'],
  saveEvaluateSummaryLoading: loading.effects['bidHall/saveEvaluateSummary'],
  submitEvaluateSummaryLoading: loading.effects['bidHall/submitEvaluateSummary'],
  fetchIPCoincidenceRateLoading: loading.effects['bidHall/fetchIPCoincidenceRate'],
  organizationId: getCurrentOrganizationId(),
}))
@Form.create({ fieldNameProp: null })
@formatterCollections({
  code: [
    'ssrc.bidHall',
    'ssrc.inquiryHall',
    'ssrc.expertScoring',
    'ssrc.common',
    'ssrc.supplierQuotation',
  ],
})
export default class Main extends BidEvaluation {}

import { connect } from 'dva';
import { compose } from 'lodash';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import { Create } from '../index';

const HOCComponent = (Comp) =>
  compose(
    formatterCollections({ code: ['ssrc.inquiryHall', 'ssrc.common'] }),
    withCustomize({
      unitCode: [`SSRC.EXPERT_SCORE_MANAGE.SUPPLIER.REVIEW_NEW_BASICS`],
    }),
    connect(({ inquiryHallBid, loading }) => ({
      inquiryHallBid,
      modelName: 'inquiryHallBid',
      inquiryHall: inquiryHallBid,
      questionInformationHeader: inquiryHallBid.questionInformationHeader,
      questionRowsList: inquiryHallBid.questionRowsList,
      fetchQuestionRowsLoading: loading.effects['inquiryHallBid/fetchQuestionRows'],
      deleteLoading: loading.effects['inquiryHallBid/deleteQuestion'],
      submitLoading: loading.effects['inquiryHallBid/submitQuestion'],
      saveLoading: loading.effects['inquiryHallBid/saveQuestion'],
      questionRowsPagination: inquiryHallBid.questionRowsPagination,
      code: inquiryHallBid.code,
      loading: loading.effects['inquiryHallBid/fetchQuestionRows'],
      deleteRowsLoading: loading.effects['inquiryHallBid/deleteQuestionRows'],
      saveQuestRowLineLoading: loading.effects['inquiryHallBid/saveQuestRowLine'],
    }))
  )(Comp);
export default HOCComponent(Create);

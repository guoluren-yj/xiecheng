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
    connect(({ inquiryHallNew, loading }) => ({
      inquiryHallNew,
      modelName: 'inquiryHallNew',
      inquiryHall: inquiryHallNew,
      questionInformationHeader: inquiryHallNew.questionInformationHeader,
      questionRowsList: inquiryHallNew.questionRowsList,
      fetchQuestionRowsLoading: loading.effects['inquiryHallNew/fetchQuestionRows'],
      deleteLoading: loading.effects['inquiryHallNew/deleteQuestion'],
      submitLoading: loading.effects['inquiryHallNew/submitQuestion'],
      saveLoading: loading.effects['inquiryHallNew/saveQuestion'],
      questionRowsPagination: inquiryHallNew.questionRowsPagination,
      code: inquiryHallNew.code,
      loading: loading.effects['inquiryHallNew/fetchQuestionRows'],
      deleteRowsLoading: loading.effects['inquiryHallNew/deleteQuestionRows'],
      saveQuestRowLineLoading: loading.effects['inquiryHallNew/saveQuestRowLine'],
    }))
  )(Comp);
export default HOCComponent(Create);

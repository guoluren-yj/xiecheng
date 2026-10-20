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
    connect(({ inquiryHallExpert, loading }) => ({
      inquiryHallExpert,
      inquiryHall: inquiryHallExpert,
      modelName: 'inquiryHallExpert',
      questionInformationHeader: inquiryHallExpert.questionInformationHeader,
      questionRowsList: inquiryHallExpert.questionRowsList,
      fetchQuestionRowsLoading: loading.effects['inquiryHallExpert/fetchQuestionRows'],
      deleteLoading: loading.effects['inquiryHallExpert/deleteQuestion'],
      submitLoading: loading.effects['inquiryHallExpert/submitQuestion'],
      saveLoading: loading.effects['inquiryHallExpert/saveQuestion'],
      questionRowsPagination: inquiryHallExpert.questionRowsPagination,
      code: inquiryHallExpert.code,
      loading: loading.effects['inquiryHallExpert/fetchQuestionRows'],
      deleteRowsLoading: loading.effects['inquiryHallExpert/deleteQuestionRows'],
      saveQuestRowLineLoading: loading.effects['inquiryHallExpert/saveQuestRowLine'],
    }))
  )(Comp);
export default HOCComponent(Create);

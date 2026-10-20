import { compose } from 'lodash';
import { connect } from 'dva';
import formatterCollections from 'utils/intl/formatterCollections';
import { Create } from '../index';

const HOCComponent = (Comp) =>
  compose(
    formatterCollections({ code: ['ssrc.inquiryHall'] }),
    connect(({ inquiryHallNew, loading }) => ({
      inquiryHallNew,
      inquiryHall: inquiryHallNew,
      modelName: 'inquiryHallNew',
      questionInformationHeader: inquiryHallNew.questionInformationHeader,
      questionRowsList: inquiryHallNew.questionRowsList,
      fetchQuestionRowsLoading: loading.effects['inquiryHallNew/fetchQuestionRows'],
      deleteLoading: loading.effects['inquiryHallNew/deleteQuestion'],
      submitLoading: loading.effects['inquiryHallNew/submitQuestion'],
      saveLoading: loading.effects['inquiryHallNew/saveQuestion'],
      questionRowsPagination: inquiryHallNew.questionRowsPagination,
    }))
  )(Comp);

export default HOCComponent(Create);

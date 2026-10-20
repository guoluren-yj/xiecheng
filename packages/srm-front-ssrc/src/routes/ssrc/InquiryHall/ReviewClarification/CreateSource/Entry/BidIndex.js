import { compose } from 'lodash';
import { connect } from 'dva';
import formatterCollections from 'utils/intl/formatterCollections';
import { Create } from '../index';

const HOCComponent = (Comp) =>
  compose(
    formatterCollections({ code: ['ssrc.inquiryHall'] }),
    connect(({ inquiryHallBid, loading }) => ({
      inquiryHallBid,
      inquiryHall: inquiryHallBid,
      modelName: 'inquiryHallBid',
      questionInformationHeader: inquiryHallBid.questionInformationHeader,
      questionRowsList: inquiryHallBid.questionRowsList,
      fetchQuestionRowsLoading: loading.effects['inquiryHallBid/fetchQuestionRows'],
      deleteLoading: loading.effects['inquiryHallBid/deleteQuestion'],
      submitLoading: loading.effects['inquiryHallBid/submitQuestion'],
      saveLoading: loading.effects['inquiryHallBid/saveQuestion'],
      questionRowsPagination: inquiryHallBid.questionRowsPagination,
    }))
  )(Comp);

export default HOCComponent(Create);

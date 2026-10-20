import { connect } from 'dva';
import { compose } from 'lodash';
import { Form } from 'hzero-ui';

import { CreateTable } from '../CreateTable.js';

const HOCComponent = (Comp) =>
  compose(
    Form.create({ fieldNameProp: null }),
    connect(({ inquiryHallBid, loading }) => ({
      inquiryHallBid,
      inquiryHall: inquiryHallBid,
      modelName: 'inquiryHallBid',
      code: inquiryHallBid.code,
      loading: loading.effects['inquiryHallBid/fetchQuestionRows'],
      questionRowsList: inquiryHallBid.questionRowsList,
      questionRowsPagination: inquiryHallBid.questionRowsPagination,
      deleteRowsLoading: loading.effects['inquiryHallBid/deleteQuestionRows'],
      saveQuestRowLineLoading: loading.effects['inquiryHallBid/saveQuestRowLine'],
    }))
  )(Comp);
export default HOCComponent(CreateTable);

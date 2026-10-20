import { connect } from 'dva';
import { compose } from 'lodash';
import { Form } from 'hzero-ui';

import { CreateTable } from '../CreateTable.js';

const HOCComponent = (Comp) =>
  compose(
    Form.create({ fieldNameProp: null }),
    connect(({ inquiryHallNew, loading }) => ({
      inquiryHallNew,
      inquiryHall: inquiryHallNew,
      modelName: 'inquiryHallNew',
      code: inquiryHallNew.code,
      loading: loading.effects['inquiryHallNew/fetchQuestionRows'],
      questionRowsList: inquiryHallNew.questionRowsList,
      questionRowsPagination: inquiryHallNew.questionRowsPagination,
      deleteRowsLoading: loading.effects['inquiryHallNew/deleteQuestionRows'],
      saveQuestRowLineLoading: loading.effects['inquiryHallNew/saveQuestRowLine'],
    }))
  )(Comp);
export default HOCComponent(CreateTable);

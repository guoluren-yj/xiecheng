import { connect } from 'dva';
import { AttributeTable } from '../Components/FieldTable';

const HOCComponent = (Comp) => {
  return connect(({ expert, expertQuery, loading }) => ({
    expert,
    expertQuery,
    modelName: 'expertQuery',
    deleting: loading.effects['expertQuery/tableDelete'],
  }))(Comp);
};

export default HOCComponent(AttributeTable);

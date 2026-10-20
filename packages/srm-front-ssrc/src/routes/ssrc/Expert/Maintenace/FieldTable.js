import { connect } from 'dva';
import { AttributeTable } from '../Components/FieldTable';

const HOCComponent = (Comp) => {
  return connect(({ expert, expertMaintence, loading }) => ({
    expert,
    expertMaintence,
    modelName: 'expertMaintence',
    deleting: loading.effects['expertMaintence/tableDelete'],
  }))(Comp);
};

export default HOCComponent(AttributeTable);

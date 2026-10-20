import { connect } from 'dva';
import { AttributeTable } from '../Components/FieldTable';

const HOCComponent = (Comp) => {
  return connect(({ expert, expertPersonal, loading }) => ({
    expert,
    expertPersonal,
    modelName: 'expertPersonal',
    deleting: loading.effects['expertPersonal/tableDelete'],
  }))(Comp);
};

export default HOCComponent(AttributeTable);

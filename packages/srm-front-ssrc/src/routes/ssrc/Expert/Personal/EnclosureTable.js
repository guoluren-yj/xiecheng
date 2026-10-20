import { connect } from 'dva';
import { EnclosureTable } from '../Components/EnclosureTable';

const HOCComponent = (Comp) => {
  return connect(({ expert, expertPersonal, loading }) => ({
    expert,
    expertPersonal,
    modelName: 'expertPersonal',
    deleting: loading.effects['expertPersonal/tableDelete'],
  }))(Comp);
};

export default HOCComponent(EnclosureTable);

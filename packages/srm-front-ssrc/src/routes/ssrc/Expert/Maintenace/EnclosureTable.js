import { connect } from 'dva';
import { EnclosureTable } from '../Components/EnclosureTable';

const HOCComponent = (Comp) => {
  return connect(({ expert, expertMaintence, loading }) => ({
    expert,
    expertMaintence,
    modelName: 'expertMaintence',
    deleting: loading.effects['expertMaintence/tableDelete'],
  }))(Comp);
};

export default HOCComponent(EnclosureTable);

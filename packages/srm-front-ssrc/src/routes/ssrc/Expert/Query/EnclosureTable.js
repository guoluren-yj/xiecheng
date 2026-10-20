import { connect } from 'dva';
import { EnclosureTable } from '../Components/EnclosureTable';

const HOCComponent = (Comp) => {
  return connect(({ expert, expertQuery, loading }) => ({
    expert,
    expertQuery,
    modelName: 'expertQuery',
    deleting: loading.effects['expertQuery/tableDelete'],
  }))(Comp);
};

export default HOCComponent(EnclosureTable);

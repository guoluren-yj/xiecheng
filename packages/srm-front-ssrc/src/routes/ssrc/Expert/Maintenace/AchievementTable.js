import { connect } from 'dva';
import { AchievementTable } from '../Components/AchievementTable';

const HOCComponent = (Comp) => {
  return connect(({ expert, expertMaintence, loading }) => ({
    expert,
    expertMaintence,
    modelName: 'expertMaintence',
    deleting: loading.effects['expertMaintence/tableDelete'],
  }))(Comp);
};

export default HOCComponent(AchievementTable);

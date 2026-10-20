import { connect } from 'dva';
import { AchievementTable } from '../Components/AchievementTable';

const HOCComponent = (Comp) => {
  return connect(({ expert, expertPersonal, loading }) => ({
    expert,
    expertPersonal,
    modelName: 'expertPersonal',
    deleting: loading.effects['expertPersonal/tableDelete'],
  }))(Comp);
};

export default HOCComponent(AchievementTable);

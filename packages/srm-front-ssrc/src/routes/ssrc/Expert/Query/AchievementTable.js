import { connect } from 'dva';
import { AchievementTable } from '../Components/AchievementTable';

const HOCComponent = (Comp) => {
  return connect(({ expert, expertQuery, loading }) => ({
    expert,
    expertQuery,
    modelName: 'expertQuery',
    deleting: loading.effects['expertQuery/tableDelete'],
  }))(Comp);
};

export default HOCComponent(AchievementTable);

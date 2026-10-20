import { connect } from 'dva';
import { EducationExperienceTable } from '../Components/EducationExperienceTable';

const HOCComponent = (Comp) => {
  return connect(({ expert, expertQuery, loading }) => ({
    expert,
    expertQuery,
    modelName: 'expertQuery',
    deleting: loading.effects['expertQuery/tableDelete'],
  }))(Comp);
};

export default HOCComponent(EducationExperienceTable);

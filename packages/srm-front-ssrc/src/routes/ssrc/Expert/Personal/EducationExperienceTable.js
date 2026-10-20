import { connect } from 'dva';
import { EducationExperienceTable } from '../Components/EducationExperienceTable';

const HOCComponent = (Comp) => {
  return connect(({ expert, expertPersonal, loading }) => ({
    expert,
    expertPersonal,
    modelName: 'expertPersonal',
    deleting: loading.effects['expertPersonal/tableDelete'],
  }))(Comp);
};

export default HOCComponent(EducationExperienceTable);

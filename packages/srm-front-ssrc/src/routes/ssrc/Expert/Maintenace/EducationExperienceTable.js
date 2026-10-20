import { connect } from 'dva';
import { EducationExperienceTable } from '../Components/EducationExperienceTable';

const HOCComponent = (Comp) => {
  return connect(({ expert, expertMaintence, loading }) => ({
    expert,
    expertMaintence,
    modelName: 'expertMaintence',
    deleting: loading.effects['expertMaintence/tableDelete'],
  }))(Comp);
};

export default HOCComponent(EducationExperienceTable);

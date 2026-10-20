import { connect } from 'dva';
import { CareerPortfolioTable } from '../Components/CareerPortfolioTable';

const HOCComponent = (Comp) => {
  return connect(({ expert, expertPersonal, loading }) => ({
    expert,
    expertPersonal,
    modelName: 'expertPersonal',
    deleting: loading.effects['expertPersonal/tableDelete'],
  }))(Comp);
};

export default HOCComponent(CareerPortfolioTable);

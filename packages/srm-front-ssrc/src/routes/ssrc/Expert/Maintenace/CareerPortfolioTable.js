import { connect } from 'dva';
import { CareerPortfolioTable } from '../Components/CareerPortfolioTable';

const HOCComponent = (Comp) => {
  return connect(({ expert, expertMaintence, loading }) => ({
    expert,
    expertMaintence,
    modelName: 'expertMaintence',
    deleting: loading.effects['expertMaintence/tableDelete'],
  }))(Comp);
};

export default HOCComponent(CareerPortfolioTable);

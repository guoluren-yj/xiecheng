import React, { useContext, Fragment } from 'react';
import { observer } from 'mobx-react';
import { Spin } from 'choerodon-ui/pro';

import { Header } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import BasicInfo from './CardManage/BasicInfo';
import AppliedRange from './CardManage/AppliedRange';
import BusinessRule from './CardManage/BusinessRule';
import MainParameter from './CardManage/MainParameter/index';
import OtherParameter from './CardManage/OtherParameter';
import CountFormula from './CardManage/CountFormula';
import Card from './components/Card';
import styles from './common.less';
import Store, { StoreProvider } from './store/index';

const Update = () => {
  const {
    commonDs: { headerDs },
  } = useContext(Store);

  return (
    <Fragment>
      <Header
        title={intl.get('spc.priceModel.view.title.modelDefine').d('模型定义')}
        backPath="/spc/price-model/list"
      />
      <div className={styles['price-model-wrapper']}>
        <Spin dataSet={headerDs}>
          <Card title={intl.get('spc.priceModel.view.card.title.basicInfos').d('基本信息')}>
            <BasicInfo />
          </Card>
          <Card title={intl.get('spc.priceModel.view.card.title.appliedRange').d('应用范围')}>
            <AppliedRange />
          </Card>
          <Card title={intl.get('spc.priceModel.view.card.title.businessRule').d('业务规则')}>
            <BusinessRule />
          </Card>
          <Card title={intl.get('spc.priceModel.view.card.title.mainParameter').d('主要参数')}>
            <MainParameter />
          </Card>
          <Card title={intl.get('spc.priceModel.view.card.title.otherParameter').d('其他参数')}>
            <OtherParameter />
          </Card>
          <Card title={intl.get('spc.priceModel.view.card.title.countFormula').d('计算公式')}>
            <CountFormula />
          </Card>
        </Spin>
      </div>
    </Fragment>
  );
};

// 所有功能组件都是StoreProvider的子组件 所以context能传递到任何子组件
const Index = (props) => {
  return (
    <StoreProvider {...props}>
      <Update {...props} />
    </StoreProvider>
  );
};

export default formatterCollections({ code: ['spc.priceModel'] })(observer(Index));

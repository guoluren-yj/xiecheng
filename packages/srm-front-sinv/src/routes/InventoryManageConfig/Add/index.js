import React, { useEffect, useState } from 'react';
import { Select, Form, CheckBox, Row, Col } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import FlowConfig from './FlowConfig';
import noData from '@/assets/noAutoConfig.svg';
import WeekTotalConfig from './WeekTotalConfig';
import AutoOrderConfig from './AutoOrderConfig';

import styles from './index.less';

function Index(props) {
  const { ds, processFactory, AutoDs, WeekDs, strategyHeaderId } = props;
  const [isFlag, setIsFlag] = useState(false);
  useEffect(() => {
    WeekDs.setState('strategyHeaderId', strategyHeaderId);
  }, [strategyHeaderId]);

  const handleChange = (value) => {
    setIsFlag(value);
    AutoDs.map((i) => i.set('cycleAuto', value));
  };

  return processFactory === 1 ? (
    <div className={styles.line}>
      <h3 className={styles.title}>
        <div className={styles.block} />
        {intl.get('sinv.inventoryBench.model.view.createProcessConfiguration').d('业务流程配置')}
      </h3>
      <FlowConfig
        configDs={ds}
        processFactory={processFactory}
        strategyHeaderId={strategyHeaderId}
      />

      <h3 className={styles.title2}>
        <div className={styles.block} />
        {intl
          .get('sinv.inventoryBench.model.supplierProcessConfiguration')
          .d('发料/消耗周期类汇总类型配置')}
      </h3>
      <Form style={{ margin: '16px 0' }} labelLayout="float" columns={2} dataSet={props.AutoDs}>
        <Select name="cycleDimension" />
      </Form>
      <WeekTotalConfig WeekDs={WeekDs} strategyHeaderId={strategyHeaderId} />

      <Row justify="space-between">
        <Col span={12}>
          <h3 className={styles.title3}>
            <div className={styles.block} />
            {intl.get('sinv.inventoryBench.model.view.auto').d('自动生单配置')}
          </h3>
        </Col>

        <Col span={12}>
          <Form style={{ float: 'right', marginTop: '16px' }} labelWidth="auto">
            <CheckBox
              labelWidth={150}
              label={intl.get(`sinv.inventoryBench.model.view.cycleAuto`).d('按周期时间自动生成')}
              onChange={handleChange}
            />
          </Form>
        </Col>
      </Row>
      {!isFlag ? (
        <div className={styles.noData}>
          <img src={noData} alt="img" />
          <h3 className={styles.tip}>
            {intl.get(`sinv.inventoryBench.model.view.configQuery`).d('请勾选启用此配置')}
          </h3>
        </div>
      ) : (
        <AutoOrderConfig AutoDs={AutoDs} />
      )}
    </div>
  ) : (
    <div className={styles.line}>
      <h3 className={styles.title}>
        <div className={styles.block} />
        {intl.get('sinv.inventoryBench.model.view.createProcessConfiguration').d('业务流程配置')}
      </h3>
      <FlowConfig configDs={ds} processFactory={processFactory} />
    </div>
  );
}

export default Index;

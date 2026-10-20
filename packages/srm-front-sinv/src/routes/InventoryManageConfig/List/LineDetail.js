import React, { useEffect, memo, useState } from 'react';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import {
  Form,
  TextField,
  Lov,
  Select,
  IntlField,
  CheckBox,
  Row,
  Col,
  Output,
  Button,
} from 'choerodon-ui/pro';
import noData from '@/assets/noAutoConfig.svg';
import notification from 'utils/notification';
import FlowConfig from '../Add/FlowConfig';
import WeekTotalConfig from '../Add/WeekTotalConfig';
import { c7nModal } from '@/routes/components/CustomSpecsModal';
import PermissionComp from '../Add/PermissionComp';
import {
  queryInventoryDetail,
  queryInventoryList,
  queryInventoryWeek,
  savePermissonModal,
} from '@/services/inventoryManageService';
import AutoOrderConfig from '../Add/AutoOrderConfig';

import styles from '../Add/index.less';

function Index(props) {
  const {
    ConfigDs,
    strategyHeaderId,
    processFactory,
    HeaderDetailDs,
    WeekDs,
    PermissionCompDS,
  } = props;
  ConfigDs.setState('processFactory', Number(processFactory));
  const [isFlag, setIsFlag] = useState(false);

  useEffect(() => {
    if (strategyHeaderId) {
      HeaderDetailDs.status = 'submitting';
      ConfigDs.status = 'submitting';
      WeekDs.setState('strategyHeaderId', strategyHeaderId);
      if (processFactory === 1) {
        queryInventoryWeek(strategyHeaderId).then((res) => {
          if (getResponse(res)) {
            WeekDs.loadData(res);
          }
          WeekDs.status = 'ready';
        });
      }
      queryInventoryDetail(strategyHeaderId)
        .then((res) => {
          if (getResponse(res)) {
            HeaderDetailDs.loadData([res]);
            HeaderDetailDs.status = 'ready';
            setIsFlag(res.cycleAuto);
          }
        })
        .finally(() => {
          HeaderDetailDs.status = 'ready';
        });
      queryInventoryList(strategyHeaderId)
        .then((res) => {
          if (getResponse(res)) {
            ConfigDs.loadData(res);
            ConfigDs.status = 'ready';
          }
        })
        .finally(() => {
          ConfigDs.status = 'ready';
        });
    }
  }, [strategyHeaderId]);

  // 权限维护
  const openModal = (id) => {
    const permissionProps = { tableDs: PermissionCompDS, strategyHeaderId: id };
    c7nModal({
      style: { width: 742 },
      title: intl.get('slod.shipmentsConfiguration.model.queryOperate').d('操作/查询权限角色维护'),
      children: <PermissionComp {...permissionProps} />,
      okText: intl.get(`hzero.common.button.save`).d('保存'),
      onOk: async () => {
        const data = PermissionCompDS.toData();
        const params = { strategyHeaderId, data };
        const flag = await PermissionCompDS.validate();
        if (flag) {
          const res = await savePermissonModal(params);
          if (getResponse(res)) {
            notification.success();
            PermissionCompDS.query();
          }
          return false;
        } else {
          return false;
        }
      },
    });
  };

  const BaseInfo = () => (
    <div style={{ marginBottom: 32 }}>
      <Form labelLayout="float" columns={2} dataSet={HeaderDetailDs}>
        <TextField name="strategyCode" />
        <IntlField name="strategyName" />
        <Select name="processFactory" />
        <Lov name="cuszDocTmplCodeObj" />
        <Lov name="codeRuleLov" />
        <Select name="enableFlag" />
        <TextField name="creationName" disabled />
        <Output
          name="per"
          renderer={({ record }) => (
            <>
              {/* <span>标题：</span> */}
              <Button
                icon="assignment_ind"
                style={{
                  float: 'left',
                  width: ' 100%',
                  textAlign: 'left',
                  // borderColor: ' #ffbc00',
                  border: 'none',
                  color: '#29BECE',
                }}
                onClick={() => openModal(record.get('strategyHeaderId'))}
              >
                {intl
                  .get('slod.shipmentsConfiguration.model.queryOperate')
                  .d('操作/查询权限角色维护')}
              </Button>
            </>
          )}
        />
      </Form>
    </div>
  );

  const handleChange = (value) => {
    setIsFlag(!isFlag);
    HeaderDetailDs.map((i) => i.set('cycleAuto', value));
  };

  return processFactory === 1 ? (
    <div className={styles.line}>
      <h3 className={styles.title}>
        <div className={styles.block} />
        {intl.get('sinv.inventoryBench.model.view.createProcessConfiguration').d('基本信息')}
      </h3>
      <BaseInfo />
      <h3 className={styles.title2}>
        <div className={styles.block} />
        {intl.get('sinv.inventoryBench.model.view.automaticConfiguration').d('业务流程配置')}
      </h3>
      <FlowConfig
        configDs={ConfigDs}
        processFactory={processFactory}
        strategyHeaderId={strategyHeaderId}
      />

      <h3 className={styles.title3}>
        <div className={styles.block} />
        {intl
          .get('sinv.inventoryBench.model.view.supplierProcessConfiguration')
          .d('发料/消耗周期类汇总类型配置')}
      </h3>
      <Form style={{ margin: '16px 0' }} labelLayout="float" columns={2} dataSet={HeaderDetailDs}>
        <Select name="cycleDimension" />
      </Form>
      <WeekTotalConfig WeekDs={WeekDs} strategyHeaderId={strategyHeaderId} />

      <Row justify="space-between">
        <Col span={12}>
          <h3 className={styles.title4}>
            <div className={styles.block} />
            {intl.get('sinv.inventoryBench.model.view.auto').d('自动生单配置')}
          </h3>
        </Col>

        <Col span={12}>
          <Form style={{ float: 'right', marginTop: '16px' }} labelWidth="auto">
            <CheckBox
              checked={isFlag}
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
        <AutoOrderConfig AutoDs={HeaderDetailDs} />
      )}
    </div>
  ) : (
    <div className={styles.line}>
      <h3 className={styles.title}>
        <div className={styles.block} />
        {intl.get('sinv.inventoryBench.model.view.createProcessConfiguration').d('基本信息')}
      </h3>
      <BaseInfo />
      <h3 className={styles.title2}>
        <div className={styles.block} />
        {intl.get('sinv.inventoryBench.model.view.automaticConfiguration').d('业务流程配置')}
      </h3>
      <FlowConfig
        configDs={ConfigDs}
        processFactory={processFactory}
        strategyHeaderId={strategyHeaderId}
      />
    </div>
  );
}

export default memo(Index);

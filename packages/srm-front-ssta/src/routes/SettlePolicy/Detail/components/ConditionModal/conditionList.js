// 该页面暂时不用，为多做页面，如果设置多条时可用到
import React, { useEffect, useMemo, useCallback } from 'react';
import { Modal, Table } from 'choerodon-ui/pro';
import { DataSet } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { observer } from 'mobx-react-lite';
import notification from 'utils/notification';

import { configConditionListDS, conditionSelectDS } from '@/stores/SettleStrategyDS';
import ConditionConfig from './condition';

// 暂时没用到，因为是单个设置
const Index = (props) => {
  const {
    recordCondition,
    configType,
    settleConfigId,
    editFlag,
    activeKey,
    idField,
    parentConfigType,
  } = props;

  const conditionSelectDs = useMemo(
    () =>
      new DataSet(
        conditionSelectDS({ modelCode: 'ssta_bill_header', documentType: activeKey.toUpperCase() })
      ),
    [conditionSelectDS]
  );
  const configConditionListDs = useMemo(() => new DataSet(configConditionListDS()), [
    configConditionListDS,
  ]);

  useEffect(() => {
    configConditionListDs.setQueryParameter('settleConfigId', settleConfigId);
    configConditionListDs.setQueryParameter('documentType', activeKey.toUpperCase());
    configConditionListDs.setQueryParameter(
      'parentConfigType',
      parentConfigType[`${activeKey}_${idField}`]
    );
    configConditionListDs.setQueryParameter('parentConfigId', recordCondition?.get(idField));
    configConditionListDs.query();
  }, [configConditionListDs]);

  const handleAddOrEdit = useCallback(
    (record) => {
      if (settleConfigId === 'create') {
        notification.warning({
          message: intl
            .get('ssta.settleStrategy.view.notification.saveStrategyFirst')
            .d('无法编辑，请填写策略名称，点击保存生成策略编码后，维护详情'),
        });
        return;
      }
      const title = intl.get('ssta.settleStrategy.model.config.condition').d('条件配置');
      const formProps = {
        recordCondition,
        configType,
        editFlag,
        activeKey,
        settleConfigId,
        configConditionListDs,
        idField,
        parentConfigType,
        conditionInfo: record,
        conditionSelectDs,
      };
      Modal.open({
        key: Modal.key(),
        style: { width: 742 },
        drawer: true,
        title,
        children: <ConditionConfig {...formProps} />,
        closable: true,
        movable: false,
        okText: editFlag
          ? intl.get(`hzero.common.button.ok`).d('确定')
          : intl.get(`hzero.common.button.close`).d('关闭'),
        cancelButton: editFlag,
        destroyOnClose: true,
      });
    },
    [recordCondition, configType, editFlag, activeKey, settleConfigId, conditionSelectDs]
  );

  const columns = useMemo(() => {
    return [
      {
        name: 'conditionName',
        width: 120,
      },
      {
        name: 'description',
        width: 120,
      },
      {
        name: 'priority',
        width: 120,
      },
      {
        name: 'conditionExpression',
        width: 120,
      },
      {
        name: 'operation',
        width: 120,
        renderer: ({ record }) => (
          <a onClick={() => handleAddOrEdit(record)}>
            {intl.get('hzero.common.button.edit').d('编辑')}
          </a>
        ),
      },
    ];
  }, [handleAddOrEdit]);

  const buttons = useMemo(() => {
    return editFlag
      ? [
          [
            'add',
            {
              onClick: () => {
                handleAddOrEdit();
              },
            },
          ],
        ]
      : [];
  }, [editFlag, handleAddOrEdit]);

  return (
    <Table
      columns={columns}
      buttons={buttons}
      dataSet={configConditionListDs}
      customizedCode="SSTA_STRATEGY_DETAIL.CONDITION_CONFIG"
    />
  );
};

export default observer(Index);

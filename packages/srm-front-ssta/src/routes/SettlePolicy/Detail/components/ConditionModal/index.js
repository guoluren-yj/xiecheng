import React, { useContext, useCallback, useState } from 'react';
import { Modal, Button } from 'choerodon-ui/pro';
import { Badge } from 'choerodon-ui';
import intl from 'utils/intl';
import { observer } from 'mobx-react-lite';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';

import { getConditionList } from '@/services/settleStrategyServices';
import Condition from './condition';
import { Store } from '../../StoreProvider';
import styles from './index.less';
import commonStyles from '@/routes/common.less';

const parentConfigType = {
  bill_billModeId: 'BILL_MODE',
  invoice_collaborativeModeId: 'SETTLE_MODE',
  payment_collaborativeModeId: 'SETTLE_MODE',
  bill_configId: 'BILL_APPROVE_CONFIG',
  invoice_configId: 'SETTLE_APPROVE_CONFIG',
  payment_configId: 'SETTLE_APPROVE_CONFIG',
};

const Index = (props) => {
  const { record, configType, idField, tableDs } = props;
  const {
    editFlag,
    activeKey,
    settleConfigId,
    billConditionSelectDs,
    invConditionSelectDs,
    payConditionSelectDs,
  } = useContext(Store) || {};
  const [loading, setLoading] = useState(false);

  const openModal = useCallback(async () => {
    if (settleConfigId === 'create') {
      notification.warning({
        message: intl
          .get('ssta.settleStrategy.view.notification.saveStrategyFirst')
          .d('无法编辑，请填写策略名称，点击保存生成策略编码后，维护详情'),
      });
      return;
    }
    setLoading(true);
    const res = getResponse(
      await getConditionList({
        settleConfigId,
        documentType: activeKey.toUpperCase(),
        parentConfigType: parentConfigType[`${activeKey}_${idField}`],
        parentConfigId: record?.get(idField),
      })
    );
    const { content = [] } = res || {};
    const title = intl.get('ssta.settleStrategy.model.config.condition').d('条件配置');
    const formProps = {
      recordCondition: record,
      configType,
      editFlag,
      activeKey,
      settleConfigId,
      idField,
      parentConfigType,
      conditionInfo: content[0],
      conditionSelectDs:
        activeKey === 'bill'
          ? billConditionSelectDs
          : activeKey === 'invoice'
          ? invConditionSelectDs
          : payConditionSelectDs,
      tableDs,
    };
    setLoading(false);
    Modal.open({
      key: Modal.key(),
      drawer: true,
      title,
      children: <Condition {...formProps} />,
      closable: true,
      movable: false,
      className: commonStyles['ssta-medium-modal'],
      okText: editFlag
        ? intl.get(`hzero.common.button.ok`).d('确定')
        : intl.get(`hzero.common.button.close`).d('关闭'),
      cancelButton: editFlag,
      destroyOnClose: true,
    });
  }, [
    configType,
    editFlag,
    activeKey,
    settleConfigId,
    idField,
    record,
    parentConfigType,
    billConditionSelectDs,
    invConditionSelectDs,
    payConditionSelectDs,
    tableDs,
    setLoading,
  ]);

  return (
    <Badge dot={record?.get('enableCondFlag')} className={styles['condition-link-badge']}>
      <Button loading={loading} funcType="link" onClick={() => openModal()}>
        {intl.get('ssta.settleStrategy.model.config.condition').d('条件配置')}
      </Button>
    </Badge>
  );
};

export default observer(Index);

import React from 'react';
import { Alert } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';

import intl from 'utils/intl';

import styles from './index.less';

/**
 * ChangeOuAlert 公司/业务实体 变更后 行展示Alert
 * dataSet 交易方采买组织信息dataSet
 * otherAlert 其他Alert
 */
const ChangeOuAlert = observer(({ dataSet, otherAlert }) => {
  const dsCurrent = dataSet?.current;
  if (!dsCurrent) return null;
  const companyField = dsCurrent.getField('companyId');
  const ouField = dsCurrent.getField('ouId');
  return companyField.dirty || ouField.dirty ? (
    <Alert
      type="info"
      closable
      showIcon
      className={styles['order-alert-title']}
      message={intl
        .get('sodr.workspace.view.alert.ouChangeInfo')
        .d('您变更了公司/业务实体信息，请检查/重新维护所有订单明细行库存组织。')}
    />
  ) : (
    otherAlert
  );
});

export default ChangeOuAlert;

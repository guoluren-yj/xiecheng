import React from 'react';
import { observer } from 'mobx-react-lite';

import intl from 'utils/intl';
import OverflowTip from '@/components/OverflowTip';
import { ReactComponent as NoRules } from '@/assets/noRules.svg';
import styles from './index.less';

function FxListReadOnly({
  dataSet,
  customizeDS,
}) {
  function getText(name, record) {
    return record.getField(name).getText(record.get(name));
  }
  return !customizeDS.current.get('conditionExpression') ? (
    <div className={styles['no-rules']}>
      <NoRules />
      <p>{intl.get('small.common.model.noLimit').d('无条件限制')}</p>
    </div>
  ) : (
    <div className={styles["rule-config-list"]}>
      {dataSet.map((record, index) => {
        return (
          <div className="rule-config-item">
            <OverflowTip className="rule-config-index">#{index + 1}</OverflowTip>
            <OverflowTip className="rule-config-prev">
              {record.get('dimensionName')}
            </OverflowTip>
            <OverflowTip className="rule-config-compare">
              {getText('conditionExpression', record)}
            </OverflowTip>
            <OverflowTip className="rule-config-next">
              {getText('targetType', record)} - {record.get('targetValueMeaning') || record.get('targetValue')}
            </OverflowTip>
          </div>
        );
      })}
      {
        customizeDS.map((record) => (
          <>
            <div className="rule-config-footer">
              <div>
                <span>{intl.get(`small.common.model.customRule`).d('自定义组合规则')}：</span>
                <span>{record.get('conditionExpression')}</span>
              </div>
              <div>
                {(!!record.get('valueName') || !!record.get('value')) && (
                <>
                  <span>{intl.get('small.common.detail.field.defaultValue').d('默认值')}：</span>
                  <span>{record.get('valueName') || record.get('value')}</span>
                </>
                )}
              </div>
            </div>
          </>
))}
    </div>
  );
}

export default observer(FxListReadOnly);

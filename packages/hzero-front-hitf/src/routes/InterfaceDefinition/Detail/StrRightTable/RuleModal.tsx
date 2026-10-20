import React from 'react';

import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';

import ExpressionEngine from 'srm-front-boot/lib/components/ExpressionEngine';

import { isTenantRoleLevel } from 'hzero-front/lib/utils/utils';

import styles from './index.less';

// 是否为租户
const isTenant = isTenantRoleLevel();

const RuleModal: React.FC<any> = (props) => {
  const { record, recordObj, defaultSelectId, expressionEngineRef } = props;
  const code = record.get('conditionCode');

  // 过滤【变量/常量】下拉选择
  const handleFilter = (rightValueTypeRecord) => {
    return rightValueTypeRecord.get('value') !== 'variable';
  };

  return (
    <div className={styles['rule-content']}>
      <ExpressionEngine
        code={code}
        dataSource={recordObj}
        childRef={expressionEngineRef}
        leftValueCode={isTenant ? "HITF.OPEN_INTEFACE_PARAM_CONDITION_QUERY_TENANT" : "HITF.OPEN_INTEFACE_PARAM_CONDITION_QUERY"}
        leftValueLovQueryPara={{ interfaceParamHeaderId: defaultSelectId }}
        rightValueTypeFilter={handleFilter}
      />
    </div>
  );
};

export default React.memo(formatterCollections({
  code: ['hzero.common', 'hzero.commom', 'hitf.common', 'hitf.application', 'component.ExpressionEngine'],
})(RuleModal));

// 租户级处理个性化逻辑

import { isEmpty, isArray } from 'lodash';

const updateCollapseActiveKeys = (data = {}) => {
  const { code, custConfig = {}, oldKeys = [] } = data || {};

  if (!code) {
    return;
  }

  const { [code]: collapses = {} } = custConfig || {};
  const { fields: collapseFields = [] } = collapses || {};

  if (isEmpty(collapseFields) || !isArray(oldKeys)) {
    return;
  }

  const collapseActiveFieldCode = [...oldKeys];
  let tenantChangeFlag = 0;
  collapseFields.forEach((item) => {
    const { defaultActive, fieldCode: collapseFieldCode } = item || {};

    if (defaultActive === 1) {
      tenantChangeFlag = 1;
      collapseActiveFieldCode.push(collapseFieldCode);
    }

    if (defaultActive === 0) {
      tenantChangeFlag = 1;
      const removeNeedIndex = collapseActiveFieldCode.findIndex(
        (activeItem) => activeItem === collapseFieldCode
      );

      if (removeNeedIndex !== -1) {
        collapseActiveFieldCode.splice(removeNeedIndex, 1);
      }
    }
  });
  const duplicateCollapseActiveFieldCode = [...new Set(collapseActiveFieldCode)];

  return { tenantChangeFlag, newKeys: duplicateCollapseActiveFieldCode };
};

export { updateCollapseActiveKeys };

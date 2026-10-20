/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2024-03-27 17:43:19
 * @LastEditors: yanglin
 * @LastEditTime: 2024-03-29 08:47:38
 */
import React from 'react';
import intl from 'utils/intl';
import { Form, Output } from 'choerodon-ui/pro';
import { Select } from 'choerodon-ui';

import { colorRender } from '../../util';
// 设置sbdm国际化前缀 - common - model
const commonPrompt = 'sbdm.common.model.common';

const Base = ({ baseInfoDs, isMutlTemplate }) => {
  return (
    <div className="config-right-content">
      <Form
        dataSet={baseInfoDs}
        showLines={6}
        columns={3}
        useColon={false}
        labelLayout="vertical"
        labelAlign="left"
        useWidthPercent
        className="c7n-pro-vertical-form-display"
      >
        <Output name="budgetStrategyCode" />
        <Output name="budgetStrategyDesc" />
        <Output
          name="strangeStatus"
          renderer={({ value, record }) => colorRender(value, record.get('strangeStatusMeaning'))}
        />

        {isMutlTemplate && (
          <>
            <Output
              name="budgetControlSelectBox"
              clearButton={false}
              renderer={({ value }) =>
                value === 'internalBudgetFlag'
                  ? intl.get(`${commonPrompt}.internalBudgetFlag`).d('启用内部预算控制')
                  : intl.get(`${commonPrompt}.externalBudgetFlag`).d('启用外部预算控制')
              }
            />
            {baseInfoDs?.current?.get('budgetControlSelectBox') === 'internalBudgetFlag' && (
              <Output name="newBudgetStrategyTemplateList" />
            )}
          </>
        )}

        <Output name="createdByName" />
        <Output name="creationDate" />

        <Output name="updateDate" />
        <Output name="version" />
      </Form>
    </div>
  );
};

export default Base;

/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2024-02-19 15:58:34
 * @LastEditors: yanglin
 * @LastEditTime: 2024-03-27 08:16:45
 */
import React from 'react';
import intl from 'utils/intl';
import { Form, TextField, Select, DatePicker, Lov, IntlField } from 'choerodon-ui/pro';
// 设置sbdm国际化前缀 - common - model
const commonPrompt = 'sbdm.common.model.common';

const { Option } = Select;

const Base = ({ baseInfoDs, isMutlTemplate }) => {
  return (
    <div className="config-right-content">
      <Form
        dataSet={baseInfoDs}
        showLines={6}
        columns={3}
        labelLayout="float"
        useColon={false}
        useWidthPercent
      >
        <TextField name="budgetStrategyCode" />
        <IntlField name="budgetStrategyDesc" />
        <TextField name="strangeStatusMeaning" />

        {isMutlTemplate && (
          <>
            <Select
              name="budgetControlSelectBox"
              clearButton={false}
              disabled={baseInfoDs?.current?.get('version') > 1}
            >
              <Option value="internalBudgetFlag">
                {intl.get(`${commonPrompt}.internalBudgetFlag`).d('启用内部预算控制')}
              </Option>
              <Option style={{ marginTop: '12px' }} value="externalBudgetFlag">
                {intl.get(`${commonPrompt}.externalBudgetFlag`).d('启用外部预算控制')}
              </Option>
            </Select>
            {baseInfoDs?.current?.get('budgetControlSelectBox') === 'internalBudgetFlag' && (
              <Lov name="newBudgetStrategyTemplateList" />
            )}
          </>
        )}

        <TextField name="createdByName" />
        <DatePicker name="creationDate" />

        <DatePicker name="updateDate" />
      </Form>
    </div>
  );
};

export default Base;

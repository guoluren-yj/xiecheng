import React, { useContext } from 'react';
import {
  TextField,
  DatePicker,
  TextArea,
  IntlField,
  DateTimePicker,
  Select,
} from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import CollapseForm from '_components/CollapseForm';

import C7nPrecisionInputNumber from '@/routes/components/Precision/C7nPrecisionInputNumber';

import { StoreContext } from '../store/StoreProvider';

// 基础信息卡片
const BaseInfoCmp = observer(() => {
  const { commonDs: { headerDs } = {}, customizeCollapseForm, getCustomizeUnitCode } = useContext(
    StoreContext
  );

  return customizeCollapseForm(
    {
      code: getCustomizeUnitCode('baseInfoForm'),
      dataSet: headerDs,
    },
    <CollapseForm dataSet={headerDs} columns={3} labelLayout="float" useWidthPercent>
      <TextField name="sourceProjectNum" restrict={/[^a-zA-Z0-9]/g} />
      <IntlField name="sourceProjectName" />
      <C7nPrecisionInputNumber
        name="budgetAmount"
        record={headerDs.current}
        dataSet={headerDs}
        financial="currencyCode"
      />
      <C7nPrecisionInputNumber
        name="totalEstimatedAmount"
        record={headerDs.current}
        dataSet={headerDs}
        financial="currencyCode"
      />
      <DatePicker name="estimatedDate" />
      <DateTimePicker name="sourceDate" />
      <Select name="subjectMatterRule" />
      <TextArea name="sourceProjectRemark" resize="vertical" newLine colSpan={2} />
    </CollapseForm>
  );
});

export default BaseInfoCmp;

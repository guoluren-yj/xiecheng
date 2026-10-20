import React from 'react';
import { Form, Select, NumberField } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import intl from 'hzero-front/lib/utils/intl';
import { getCurrentTenant } from 'hzero-front/lib/utils/utils';

function CycleBlockSetting({ formDs, isMasterBlock, reportType, isApproveCycleBlock }) {
  const { tenantNum } = getCurrentTenant() || {};
  const disabledHorizontal = isApproveCycleBlock || (reportType === "PDF" && tenantNum !== 'SRM-SINCETECH');
  return (
    <Form dataSet={formDs} labelLayout="float">
      <Select name="cycleBlockType" clearButton={false}>
        <Select.Option value='horizontal' disabled={disabledHorizontal} style={disabledHorizontal ? { color: "#aaa" } : undefined}>
          {intl.get('hrpt.reportDesign.cycleBlock.type.horizontal').d('横向循环')}
        </Select.Option>
        <Select.Option value='verticalPaging'>
          {intl.get('hrpt.reportDesign.cycleBlock.type.verticalPaging').d('纵向循环（分页）')}
        </Select.Option>
        <Select.Option value='verticalNoPaging'>
          {intl.get('hrpt.reportDesign.cycleBlock.type.verticalNoPaging').d('纵向循环')}
        </Select.Option>
      </Select>
      {formDs.current && formDs.current.get('cycleBlockType') === 'horizontal' && (
        <NumberField name="cycleCols" />
      )}
      {!isMasterBlock && (
        <NumberField
          name="fixedRowSize"
          label={
            disabledHorizontal ? intl.get('hrpt.reportDesign.cycleBlock.fixedRowSize').d('固定行数')
              : intl.get('hrpt.reportDesign.cycleBlock.fixedRowColSize').d('固定行/列数')
          }
        />
      )}
      <NumberField name="mockQuantity" />
    </Form>
  );
}

export default observer(CycleBlockSetting);

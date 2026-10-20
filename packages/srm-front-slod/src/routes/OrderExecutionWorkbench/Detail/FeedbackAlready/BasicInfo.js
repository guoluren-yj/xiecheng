/*
 * BasicInfo - 订单明细页-基础信息
 * @date: 2021/05/13 11:47:39
 * @author: mjq <jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

import React from 'react';
import { Form, Output } from 'choerodon-ui/pro';
import { isNil } from 'lodash';

import { yesOrNoRender } from 'utils/renderer';
import { usePrecisionRender } from '@/routes/OrderExecutionWorkbench/hooks';
import { renderStatus } from '@/routes/OrderExecutionWorkbench/components/utils';

const BasicInfo = (props) => {
  const { ds, customizeForm, bySourceCode, oldTermHideFlag } = props;
  return customizeForm(
    {
      code: 'SINV.ORDER_EXECUTION_FEDBACKALREADY_DETAIL.BASICINFO',
    },
    <Form
      dataSet={ds}
      columns={3}
      labelLayout="vertical"
      className="c7n-pro-vertical-form-display"
      useWidthPercent
    >
      <Output name="displayPoNum" />
      <Output name="releaseNum" />
      <Output name="versionNum" />
      <Output name="poTypeDesc" />
      <Output
        name="amount"
        renderer={({ record, value, dataSet }) =>
          usePrecisionRender(record, 'amount', { bySourceCode })({ record, value, dataSet })
        }
      />
      <Output
        name="taxIncludeAmount"
        renderer={({ record, value, dataSet }) =>
          usePrecisionRender(record, 'amount', { bySourceCode })({ record, value, dataSet })
        }
      />
      <Output name="quantityTotal" />
      <Output name="currencyCode" />
      <Output name="creationDate" />
      <Output
        name="poSourcePlatform"
        renderer={({ record }) => record.get('poSourcePlatformMeaning')}
      />
      {!oldTermHideFlag && <Output name="termsName" />}
      <Output name="remark" newLine colSpan={2} />
      {/* 默认隐藏字段 */}
      <Output newLine name="domesticCurrencyCode" />
      <Output
        name="domesticTaxIncludeAmount"
        renderer={({ record, value, dataSet }) =>
          usePrecisionRender(record, 'localAmount', { bySourceCode })({ record, value, dataSet })
        }
      />
      <Output
        name="domesticAmount"
        renderer={({ record, value, dataSet }) =>
          usePrecisionRender(record, 'localAmount', { bySourceCode })({ record, value, dataSet })
        }
      />
      <Output name="originalPoNum" />
      <Output
        name="sourceOfTransferOrder"
        renderer={({ record }) => record.get('sourceOfTransferOrderMeaning')}
      />
      <Output
        name="sourceBillTypeCode"
        renderer={({ record }) => record.get('sourceBillTypeCodeMeaning')}
      />
      <Output name="supplierOrderTypeCode" />
      <Output
        name="electricSignFlag"
        renderer={({ value }) => (isNil(value) ? null : yesOrNoRender(value))}
      />
      <Output
        name="electricSignStatus"
        renderer={({ record }) =>
          renderStatus(record.get('electricSignStatus'), record.get('electricSignStatusMeaning'))
        }
      />
      <Output
        name="electricSignOrder"
        renderer={({ record }) => record.get('electricSignOrderMeaning')}
      />
      <Output
        name="electricSignStage"
        renderer={({ record }) => record.get('electricSignStageMeaning')}
      />
      <Output name="pcNum" />
      <Output
        name="terminateSignStatus"
        renderer={({ record }) =>
          renderStatus(record.get('terminateSignStatus'), record.get('terminateSignStatusMeaning'))
        }
      />
    </Form>
  );
};

export default BasicInfo;

/*
 * BasicInfo - 订单明细页-基础信息
 * @date: 2021/05/13 11:47:39
 * @author: mjq <jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

import React, { useCallback } from 'react';
import {
  Form,
  TextField,
  TextArea,
  NumberField,
  Lov,
  Output,
  Button,
  DateTimePicker,
} from 'choerodon-ui/pro';

import { openTermsModal } from '@/routes/components/utils';
import { useAmountRender, useLocalAmountRender } from '@/routes/OrderWorkspace/hooks';

const BasicInfo = (props) => {
  const { ds, customizeForm, remote } = props;
  const dsCurrent = ds?.current;
  const detailInfoDs = ds.getState('detailInfoDs');
  const { paymentPlanNum, oldTermHideFlag } = dsCurrent?.get(['paymentPlanNum', 'oldTermHideFlag']);

  const handleOpenTermsModal = useCallback(() => {
    const poLineDetailDTOs = detailInfoDs?.all.map((i) => {
      return {
        ...i.toJSONData(),
        poLineId: i.status === 'add' ? null : i.get('poLineId'),
      };
    });
    const data = {
      fieldMap: detailInfoDs?.getState('fieldMap'),
      poHeaderId: dsCurrent.get('poHeaderId'),
      poHeaderDetailDTO: {
        ...dsCurrent.toJSONData(),
        poWorkbenchFlag: 1,
      },
      poLineDetailDTOs,
    };
    return openTermsModal({ record: dsCurrent }, data);
  }, [dsCurrent, detailInfoDs]);

  return customizeForm(
    {
      code: 'SODR.WORKSPACE_CHANGE_DETAIL.BASICINFO',
      __force_record_to_update__: true,
    },
    <Form dataSet={ds} columns={3} labelLayout="float" useWidthPercent>
      <TextField name="displayPoNum" />
      <TextField name="releaseNum" />
      <TextField name="versionNum" />
      <TextField name="poTypeDesc" />
      <NumberField name="amount" renderer={useAmountRender(ds?.current)} />
      <NumberField name="taxIncludeAmount" renderer={useAmountRender(ds?.current)} />
      {paymentPlanNum && (
        <Output
          name="paymentPlanNum"
          renderer={({ value }) => (
            <Button funcType="link" onClick={handleOpenTermsModal}>
              {value}
            </Button>
          )}
        />
      )}
      <NumberField name="quantityTotal" />
      <TextField name="currencyCode" />
      <DateTimePicker name="creationDate" />
      <TextField
        name="poSourcePlatform"
        renderer={({ record }) => record.get('poSourcePlatformMeaning')}
      />
      {!oldTermHideFlag && <Lov name="termsId" />}
      <TextArea name="remark" newLine colSpan={2} rows={3} resize="vertical" />
      {/* 默认隐藏字段 */}
      <TextField newLine name="domesticCurrencyCode" />
      <NumberField name="domesticTaxIncludeAmount" renderer={useLocalAmountRender(ds?.current)} />
      <NumberField name="domesticAmount" renderer={useLocalAmountRender(ds?.current)} />
      <TextField name="originalPoNum" />
      <TextField
        name="sourceOfTransferOrder"
        renderer={({ record }) => record.get('sourceOfTransferOrderMeaning')}
      />
      <TextField
        name="sourceBillTypeCode"
        renderer={({ record }) => record.get('sourceBillTypeCodeMeaning')}
      />
      <TextField name="supplierOrderTypeCode" />
      <Lov name="createdUnitId" />
      <Lov name="pcHeaderIdLov" disabled />
      {remote.process('basicInfoExtraForm', null, props)}
    </Form>
  );
};

export default BasicInfo;

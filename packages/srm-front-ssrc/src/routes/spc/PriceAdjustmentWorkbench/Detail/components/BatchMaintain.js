/*
 * @Description: 调价单明细批量维护
 * @Date: 2024-11-29 17:48:44
 * @Author: MYT<yitian.mao@going-link.com>
 * @Version: 1.0.0
 * @Copyright: Copyright (c) 2021, ZhenYun
 */
import React from 'react';
import { Button, Form, Modal, DataSet, Lov } from 'choerodon-ui/pro';
import { Popover } from 'choerodon-ui';
// import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import intl from 'utils/intl';
import { isEmpty } from 'lodash';

import { batchPriceDS } from '../../stores/getDetailsDs';

const BatchMaintainContent = (props) => {
  const { customizeForm, ds } = props;
  return customizeForm(
    {
      code: 'SPC.PRICEADJUSTMENTWORKBENCH.DETAIL.LINEBATCH',
      dataSet: ds,
    },
    <Form labelLayout="float" dataSet={ds} columns={1}>
      <Lov name="itemId" />
      <Lov name="itemCategoryId" />
      <Lov name="companyId" />
      <Lov name="supplierCompanyId" />
      <Lov name="purOrganizationId" />
      <Lov name="purchaseAgentId" />
      <Lov name="uomId" />
      <Lov name="currencyCode" />
    </Form>
  );
};

export default function BatchMaintain(props) {
  const { dataSet, remote } = props;

  const batchMaintain = async (lineDataSet) => {
    const ds = new DataSet(batchPriceDS());
    Modal.open({
      destroyOnClose: true,
      closable: true,
      key: Modal.key(),
      drawer: true,
      title: intl
        .get('ssrc.priceAdjustmentWorkBench.title.priceDetail.batchMaintain')
        .d('调价单明细信息批量编辑'),
      children: <BatchMaintainContent {...props} ds={ds} />,
      style: { width: '380px' },
      onOk: async () => {
        const { _status, __dirty, ...batchInfo } = ds?.current?.toJSONData() || {};
        if (remote?.event) {
          const res = await remote.event.fireEvent('handleCuxBatchPrice', {
            props,
            lineDataSet,
            batchInfo,
            ds,
          });
          if (!res) {
            return;
          }
        }
        const dsData = isEmpty(lineDataSet.currentSelected)
          ? lineDataSet
          : lineDataSet.currentSelected;
        const keys = Object.keys(batchInfo) || [];
        dsData.forEach((record) => {
          if (record?.get('sourceFrom') === 'MANUAL') {
            keys.forEach((key) => {
              const value = batchInfo[key];
              const fields = lineDataSet.getField(key);
              const lovCode = fields?.get('lovCode');
              if (fields && key.includes('attribute') && lovCode) {
                const valueField = fields.get('valueField');
                const textField = fields.get('textField');
                let valueObj = { [valueField]: value, [textField]: batchInfo[`${key}Meaning`] };
                if (fields.get('multiple')) {
                  const meaningList = batchInfo?.[`${key}Meaning`]?.split(',');
                  valueObj = value
                    ?.split(',')
                    .map((val, idx) => ({ [valueField]: val, [textField]: meaningList[idx] }));
                }
                record.set(key, valueObj);
              } else {
                record.set(key, value);
              }
            });
          }
        });
      },
    });
  };

  return (
    <Popover
      content={intl
        .get('ssrc.priceAdjustmentWorkBench.msg.batchMaintain')
        .d('仅支持批量编辑来源为"手工新建"的数据')}
    >
      <Button disabled={!dataSet.length} funcType="link" onClick={() => batchMaintain(dataSet)}>
        {dataSet.selected.length > 0
          ? intl.get(`ssrc.priceAdjustmentWorkBench.btn.batchMaintainSelected`).d('批量维护所选')
          : intl.get(`ssrc.priceAdjustmentWorkBench.btn.batchMaintain`).d('批量维护')}
      </Button>
    </Popover>
  );
}

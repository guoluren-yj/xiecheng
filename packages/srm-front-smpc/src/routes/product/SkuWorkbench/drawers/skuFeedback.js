import React from 'react';
import { Form, DataSet, TextArea, CheckBox } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';

import c7nModal from '@/utils/c7nModal';
import { fetchSaveFeedBack } from '../api';

const feedbackDS = () => ({
  autoCreate: true,
  fields: [
    {
      name: 'feedbackType',
      // label: intl.get('smpc.workbench.view.feedbackType').d('反馈类型'),
      type: 'number',
      multiple: true,
    },
    {
      name: 'feedbackRemark',
      label: intl.get('smpc.product.model.remark').d('备注'),
      maxLength: 100,
      dynamicProps: {
        required: ({ record }) => record.get('feedbackType').includes(3),
      },
    },
  ],
});

export default function openSkuFeedback({ selected, callBack }) {
  const feedbackDs = new DataSet(feedbackDS());
  c7nModal({
    style: { width: 420 },
    title: intl.get('smpc.product.view.skuFeedback').d('商品反馈'),
    children: (
      <Form dataSet={feedbackDs} labelLayout="float" columns={1}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ paddingTop: '0.07rem' }}>
            {intl.get('smpc.workbench.view.feedbackType').d('反馈类型：')}
          </span>
          <CheckBox name="feedbackType" value={1}>
            {intl.get('smpc.workbench.view.priceTooHeigh').d('价格过高')}
          </CheckBox>
          <CheckBox name="feedbackType" value={2}>
            {intl.get('smpc.workbench.view.skuInfoBad').d('商品信息不完整/有误')}
          </CheckBox>
          <CheckBox name="feedbackType" value={3}>
            {intl.get('smpc.workbench.view.other').d('其他')}
          </CheckBox>
        </div>
        <TextArea name="feedbackRemark" showLengthInfo />
      </Form>
    ),
    onOk: async () => {
      const flag = await feedbackDs.validate();
      if (!flag) return false;
      const form = feedbackDs.current.toJSONData();
      const params = {
        skuList: selected.map((m) => m.toData()),
        remark: form.feedbackRemark,
        feedbackTypeString: form.feedbackType.join('/'),
      };
      const res = await fetchSaveFeedBack(params);
      if (getResponse(res)) {
        callBack();
      }
    },
  });
}

/*
 * @Description: 确认生效弹框
 * @Date: 2024-10-09 11:16:46
 * @Author: MYT<yitian.mao@going-link.com>
 * @Version: 1.0.0
 * @Copyright: Copyright (c) 2021, ZhenYun
 */
import React, { Component } from 'react';
import { Modal, Form, TextField, DataSet, DatePicker, Attachment } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { PRIVATE_BUCKET } from 'srm-front-boot/lib/utils/config';
import { SRM_SPCM } from '_utils/config';
import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';

const organizationId = getCurrentOrganizationId();

const confirmEffectDS = () => {
  return {
    selection: false,
    autoCreate: false,
    fields: [
      {
        name: 'pcNum',
        type: 'string',
        label: intl.get(`spcm.common.model.common.pcNum`).d('协议编号'),
      },
      {
        name: 'pcName',
        type: 'string',
        label: intl.get(`spcm.common.model.common.pcName`).d('协议名称'),
      },
      {
        name: 'createByRealName',
        type: 'string',
        label: intl.get(`spcm.common.model.common.createByRealName`).d('创建人'),
      },
      {
        name: 'startDateActive',
        type: 'date',
        label: intl.get('spcm.common.model.startDateActive').d('协议起始日期'),
      },
      {
        name: 'endDateActive',
        type: 'date',
        label: intl.get('spcm.common.model.endDateActive').d('协议终止日期'),
      },
      {
        name: 'signDate',
        type: 'date',
        label: intl.get(`spcm.purchaseContractView.model.signDate`).d('签订日期'),
      },
      {
        name: 'offlineMutualSignUuid',
        type: 'attachment',
        label: intl.get(`spcm.common.model.offlineMutualSignUuid`).d('线下双方签章文件'),
        dynamicProps: {
          required: ({ record }) =>
            record.get('pcStatusCode') === 'TO_BE_VALID' && !record.get('electricSignFlag'),
        },
      },
    ],
    queryParameter: {
      customizeUnitCode: 'SPCM.WORKSPACE_DETAIL.CONFIRMEFFECT',
    },
    transport: {
      submit: ({ data = [] }) => {
        return {
          url: `${SRM_SPCM}/v1/${organizationId}/purchase-contract/comfirm-effect`,
          method: 'POST',
          data: data[0] || {},
        };
      },
    },
  };
};

@WithCustomizeC7N({
  unitCode: ['SPCM.WORKSPACE_DETAIL.CONFIRMEFFECT'],
})
class ConfirmEffect extends Component {
  render() {
    const { ds, customizeForm } = this.props;
    return customizeForm(
      {
        code: 'SPCM.WORKSPACE_DETAIL.CONFIRMEFFECT',
      },
      <Form dataSet={ds} columns={1} labelWidth={130} labelAlign="left" labelLayout="float">
        <TextField disabled name="pcNum" />
        <TextField disabled name="pcName" />
        <TextField disabled name="createByRealName" />
        <DatePicker name="startDateActive" />
        <DatePicker name="endDateActive" />
        <DatePicker name="signDate" />
        <Attachment
          bucketName={PRIVATE_BUCKET}
          name="offlineMutualSignUuid"
          // 可编辑条件为：协议状态=待生效且非电签；
          readOnly={
            !(
              ds.current.get('pcStatusCode') === 'TO_BE_VALID' &&
              !ds.current.get('electricSignFlag')
            )
          }
        />
      </Form>
    );
  }
}

export default function showConfirmEffectModal(props) {
  const { headerInfo, callBack } = props;
  const ds = new DataSet(confirmEffectDS());
  ds.create(headerInfo);

  Modal.open({
    key: Modal.key(),
    drawer: true,
    title: intl.get(`spcm.common.view.message.title.comfirmEffect`).d('确认协议生效'),
    children: <ConfirmEffect ds={ds} />,
    style: {
      width: '380px',
    },
    onOk: async () => {
      const validate = await ds.validate();
      if (!validate) {
        return false;
      }
      const res = await ds.submit();
      if (res) {
        callBack();
      }
    },
  });
}

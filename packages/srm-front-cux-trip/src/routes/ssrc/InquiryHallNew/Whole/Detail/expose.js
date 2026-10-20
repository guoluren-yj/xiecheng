import React from 'react';
import { Modal, DataSet, Attachment, TextArea, Form } from 'choerodon-ui/pro';
import { isFunction } from 'lodash';

import { Expose } from 'utils/remote';
import request from 'utils/request';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { PRIVATE_BUCKET } from '_utils/config';
import intl from 'utils/intl';
import notification from 'utils/notification';

// 退回接口
const returnInterface = (bodyParams) => {
  return request(
    `/marmot/v1/${getCurrentOrganizationId()}/marmot-api/x1SFjCSrspyNzcDxKTic1FHSPClPMjs7IniacY4IYLQHOaEIgc88384KEFeITQAArS`,
    {
      method: 'POST',
      body: bodyParams,
    }
  );
};

// 退回
const handleReturn = async ({ basicFormDS, initPage, toggleLoading }) => {
  const rfxHeaderId = basicFormDS?.current?.get('rfxHeaderId');
  if (!rfxHeaderId) return;
  if (toggleLoading) {
    toggleLoading(true);
  }
  const res = await returnInterface({
    rfxHeaderId,
    validateFlag: 1, // 校验传，提交不传
  });
  if (toggleLoading) {
    toggleLoading(false);
  }
  if (!getResponse(res)) {
    return;
  }
  const formDs = new DataSet({
    autoCreate: true,
    forceValidate: true,
    fields: [
      {
        name: 'attributeLongtext14',
        type: 'string',
        label: intl.get('sscux.common.view.model.wholeDetail.trip.returnReason').d('退回理由'),
        required: true,
      },
      {
        name: 'attributeLongtext23',
        type: 'attachment',
        label: intl.get('sscux.common.view.model.wholeDetail.trip.returnAttachment').d('退回附件'),
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'ssrc-rfx-quotationline',
      },
    ],
  });
  Modal.open({
    key: Modal.key(),
    title: intl.get('sscux.common.view.title.wholeDetail.trip.cuxReturn').d('退回'),
    destroyOnClose: true,
    drawer: true,
    children: (
      <Form dataSet={formDs} labelLayout="float" columns={1}>
        <TextArea name="attributeLongtext14" resize="vertical" />
        <Attachment name="attributeLongtext23" />
      </Form>
    ),
    onOk: async () => {
      if (toggleLoading) {
        toggleLoading(true);
      }
      if (await formDs.validate()) {
        const result = await returnInterface({
          rfxHeaderId,
          ...(formDs.toData()[0] || {}),
        });
        if (toggleLoading) {
          toggleLoading(false);
        }
        if (getResponse(result)) {
          notification.success({});
          if (initPage && isFunction(initPage)) {
            initPage();
          }
          return true;
        }
        return false;
      }
      return false;
    },
  });
};

export default new Expose({
  process: {
    SSRC_WHOLE_OFFLINE_ENTRY_DETAIL_PROCESS_HEADER_BUTTONS: (sourceButtons, otherProps) => {
      const { basicFormDS, initPage, toggleLoading, loading } = otherProps;
      return [
        ...(sourceButtons || []),
        {
          name: 'cuxReturn',
          btnType: 'c7n-pro',
          child: '退回',
          hidden: basicFormDS?.current?.get('rfxStatus') !== 'FINISHED',
          btnProps: {
            icon: 'return',
            funcType: 'flat',
            loading,
            onClick: () => handleReturn({ basicFormDS, initPage, toggleLoading }),
          },
        },
      ];
    },
  },
});

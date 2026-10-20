/**
 * closeRFX - 关闭询价单
 * */

import React from 'react';
import { DataSet, Modal } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { isEmpty, isArray } from 'lodash';
import { getRfxRefundData } from '@/services/inquiryHallNewService';

import { closeRfxDS } from './closeRfxDs';
import CloseInquiryListDrawer from './CloseInquiryListDrawer';
import closeRfxRefund from './CloseRfxRefund';

const organizationId = getCurrentOrganizationId();
/**
 * c7n关闭询价单通用方法
 * @param {*} rfxHeaderId 关闭单据ID
 * @param {*} afterClose 确定关闭的回调
 */
export default function closeRfxDrawer(
  rfxHeaderId,
  afterClose = () => {},
  documentTypeName,
  sourceKey = 'INQUIRY',
  serviceChargeFlag = false,
  remote
) {
  const formDS = new DataSet(
    remote
      ? remote.process(
          'SSRC_INQUIRY_HALL_NEW_LIST_PROCESS_CLOSE_RFX_DRAWER_DS',
          closeRfxDS(rfxHeaderId, afterClose)
        )
      : closeRfxDS(rfxHeaderId, afterClose)
  );
  formDS.setQueryParameter('sourceKey', sourceKey);
  const closeProps = { formDS, remote, sourceKey };

  const handleClose = async () => {
    const validate = await formDS.validate();
    if (!validate) {
      return false;
    }
    try {
      // 暂时解决接口请求为200，返回failed为true的情况
      if (serviceChargeFlag) {
        return getRfxRefundData({ organizationId, rfxHeaderId }).then(async (res) => {
          if (!isEmpty(res) && isArray(res) && !res.failed) {
            const { code = '' } = res[0] || {};
            if (!code) {
              await formDS.submit();
              afterClose();
            } else {
              closeRfxRefund(res[0], formDS, sourceKey);
            }
          }
        });
      } else {
        await formDS.submit();
        afterClose();
      }
    } catch (e) {
      return false;
    }
  };

  Modal.open({
    destroyOnClose: true,
    closable: true,
    drawer: true,
    style: { width: 380 },
    key: Modal.key(),
    title: intl
      .get(`ssrc.inquiryHall.view.message.button.commonCloseInquiryList`, { documentTypeName })
      .d(`关闭{documentTypeName}`),
    children: <CloseInquiryListDrawer {...closeProps} />,
    onOk: () => {
      if (remote && remote.event && remote.event.closeRfxOnOk) {
        return remote.event.fireEvent('closeRfxOnOk', {
          sourceKey,
          handleClose,
          documentTypeName,
        });
      } else {
        return handleClose();
      }
    },
  });
}

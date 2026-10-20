import React from 'react';
import { observer } from 'mobx-react-lite';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import { Button } from 'choerodon-ui/pro';
import ExcelExport from 'components/ExcelExport';
import ExcelExportPro from 'components/ExcelExportPro';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const HeaderBtn = observer(
  ({
    customizeBtnGroup,
    activeKey,
    closeLoading = false,
    queryLoading = false,
    lineDs,
    handleClose = () => {},
    handleParams = () => {},
  }) => {
    // 是否是“按明细查询”tab页
    const isDetailQuery = activeKey !== 'sampleApplyQuery';
    const requestUrl = isDetailQuery
      ? `sample-send-reqs/lines/pageSampleSendReq/export`
      : `sample-send-reqs/pageSampleSendReq/fetch/purchase/export`;
    const templateCode = isDetailQuery
      ? 'SRM_C_SRM_SSLM_SAMPLE_SEND_REQ_DATAIL'
      : 'SRM_C_SRM_SSLM_SAMPLE_SEND_REQ_EXPORT';

    const disabled =
      !lineDs.selected.length ||
      lineDs.selected.some(
        record =>
          record.data.reqStatus !== 'PUBLISHED' &&
          record.data.reqStatus !== 'RETURNED' &&
          record.data.reqStatus !== 'CONFIRM_REJECT'
      );

    const noSelectLineFlag = isEmpty(lineDs.selected);

    return customizeBtnGroup(
      {
        code: isDetailQuery
          ? 'SSLM.SAMPLE_DELIVERY_SEND.LIST.BTN_GROUP_BY_DETAIL'
          : 'SSLM.SAMPLE_DELIVERY_SEND.LIST.BTN_GROUP',
      },
      [
        <Button
          data-name="close"
          color="primary"
          loading={closeLoading || queryLoading}
          icon="close"
          onClick={handleClose}
          disabled={disabled}
          wait={500}
          waitType="throttle"
          style={{ display: isDetailQuery ? 'none' : 'inline-block' }}
        >
          {intl.get('sslm.sample.view.header.closeButton').d('关闭')}
        </Button>,
        <ExcelExportPro
          data-name="newDetailExportPro"
          templateCode={templateCode}
          requestUrl={`${SRM_SSLM}/v1/${organizationId}/${requestUrl}`}
          queryParams={() => handleParams(activeKey)}
          otherButtonProps={{
            funcType: 'flat',
            style: { display: isDetailQuery ? 'inline-block' : 'none' },
            permissionList: [
              {
                code: 'srm.partner.buyer-apply-publish.buyer-apply-query.ps.sample.send.detail.new',
                type: 'button',
                meaning: '按明细查询-新导出',
              },
            ],
          }}
          buttonText={intl.get('hzero.common.button.newExport').d('(新)导出')}
        />,
        <ExcelExport
          data-name="detailExportPro"
          requestUrl={`${SRM_SSLM}/v1/${organizationId}/${requestUrl}`}
          otherButtonProps={{
            type: 'c7n-pro',
            icon: 'unarchive',
            funcType: 'flat',
            style: { display: isDetailQuery ? 'inline-block' : 'none' },
            permissionList: [
              {
                code: 'srm.partner.buyer-apply-publish.buyer-apply-query.ps.sample.send.detail.old',
                type: 'button',
                meaning: '按明细查询-导出',
              },
            ],
          }}
          queryParams={() => handleParams(activeKey)}
        />,
        <ExcelExportPro
          data-name="newApplyExportPro"
          templateCode={templateCode}
          requestUrl={`${SRM_SSLM}/v1/${organizationId}/${requestUrl}`}
          queryParams={() => handleParams(activeKey)}
          otherButtonProps={{
            funcType: 'flat',
            style: { display: isDetailQuery ? 'none' : 'inline-block' },
            permissionList: [
              {
                code:
                  'srm.partner.buyer-apply-publish.buyer-apply-query.ps.sample.send.list.export.new',
                type: 'button',
                meaning: '送样申请单查询-新导出',
              },
            ],
          }}
          buttonText={
            noSelectLineFlag
              ? intl.get('hzero.common.button.export').d('导出')
              : intl.get('hzero.common.button.selectedExport').d('勾选导出')
          }
        />,
        <ExcelExport
          data-name="applyExportPro"
          requestUrl={`${SRM_SSLM}/v1/${organizationId}/${requestUrl}`}
          otherButtonProps={{
            type: 'c7n-pro',
            icon: 'unarchive',
            funcType: 'flat',
            style: { display: isDetailQuery ? 'none' : 'inline-block' },
            permissionList: [
              {
                code:
                  'srm.partner.buyer-apply-publish.buyer-apply-query.ps.sample.send.list.export.old',
                type: 'button',
                meaning: '送样申请单查询-导出',
              },
            ],
          }}
          queryParams={() => handleParams(activeKey)}
          buttonText={
            noSelectLineFlag
              ? intl.get('hzero.common.button.export').d('导出')
              : intl.get('hzero.common.button.selectedExport').d('勾选导出')
          }
        />,
      ]
    );
  }
);

export default HeaderBtn;

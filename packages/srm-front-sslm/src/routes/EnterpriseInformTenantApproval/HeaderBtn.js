import { isEmpty, head } from 'lodash';
import React, { useMemo } from 'react';
import { observer } from 'mobx-react-lite';

import intl from 'utils/intl';
import { Button } from 'choerodon-ui/pro';
import DynamicButtons from '_components/DynamicButtons';
import ExcelExportPro from 'components/ExcelExportPro';
import { SRM_SSLM } from '_utils/config';
import ApproveButton from '_components/ApproveButton';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const HeaderBtn = observer(
  ({
    remote,
    activeKey = '',
    dataSetList = {},
    loading = false,
    handleApprove = () => {},
    handleOpenApprovelModal = () => {},
    handleConfirm = () => {},
    getExportParams = () => {},
    customizeBtnGroup,
  }) => {
    const ds = dataSetList[activeKey];
    const selectedData = ds.selected;
    const noSelectRows = selectedData.filter(i => {
      if (activeKey === 'tenantApproval') {
        return !['WAIT_CONFIRMED', 'REJECTED@WFL'].includes(i.get('reqStatus'));
      } else {
        return (
          !['CONFIRM_REJECTED', 'WAIT_TENANT_CONFIRMED', 'REJECTED@WFL'].includes(
            i.get('reqStatus')
          ) || !i.get('platformConfirmNewestFlag')
        );
      }
    });

    const isDisabled = isEmpty(selectedData) || !isEmpty(noSelectRows);

    // 工作流审批指定审批人
    const designatedFlag = useMemo(
      () => selectedData.some(record => record.get('businessApvMethod') === 'PUR_WFL_DYNAMICALLY'),
      [selectedData]
    );

    // 审批通过指定审批人
    const submitDesignatedProps = {
      businessKey: head(selectedData)?.get('businessKey'),
      customizeCode: 'SSLM.ENTERPRISE_TENANT_APPROVAL_DETAIL.APPROVAL.DESIGNATED_APPROVER',
      documentCode: 'SSLM.FIRM_CHANGE_DOCUMENT',
      beforeClick: () => handleOpenApprovelModal('designated'),
      onSuccess: () => handleApprove('approved'),
      buttonText: intl.get('hzero.common.view.message.title.approved').d('审批通过'),
      buttonProps: {
        loading,
        icon: 'check_circle',
        color: 'primary',
      },
    };

    const buttons =
      activeKey === 'tenantApproval'
        ? [
            {
              name: 'approve',
              btnComp: designatedFlag ? ApproveButton : Button,
              btnProps: {
                icon: 'check_circle',
                color: 'primary',
                disabled: isDisabled,
                onClick: () => handleOpenApprovelModal('approved'),
                loading,
                ...(designatedFlag ? submitDesignatedProps : {}),
              },
              child: intl.get('hzero.common.view.message.title.approved').d('审批通过'),
            },
            {
              btnComp: Button,
              name: 'reject',
              btnProps: {
                icon: 'cancel',
                disabled: isDisabled,
                funcType: 'flat',
                onClick: () => handleOpenApprovelModal('reject'),
                wait: 200,
                waitType: 'throttle',
                loading,
              },
              child: intl.get('hzero.common.view.message.title.reject').d('审批拒绝'),
            },
            {
              btnComp: ExcelExportPro,
              childFor: 'buttonText',
              name: 'export',
              child: isEmpty(selectedData)
                ? intl.get('hzero.common.button.export').d('导出')
                : intl.get('hzero.common.button.selectedExport').d('勾选导出'),
              btnProps: {
                templateCode: 'SRM_C_SRM_SSLM_FIRM_CHANGE_CONFIRM_EXPORT',
                requestUrl: `${SRM_SSLM}/v1/${organizationId}/firm-change-confirms/new/export`,
                queryParams: () => getExportParams(),
                otherButtonProps: {
                  type: 'c7n-pro',
                  funcType: 'flat',
                  icon: 'unarchive',
                },
              },
            },
          ]
        : [
            {
              btnComp: Button,
              name: 'confirm',
              btnProps: {
                icon: 'check',
                color: 'primary',
                disabled: isDisabled,
                onClick: () => handleConfirm(),
                loading,
              },
              child: intl.get('hzero.common.button.confirm').d('确认'),
            },
            {
              btnComp: ExcelExportPro,
              childFor: 'buttonText',
              name: 'export',
              child: isEmpty(selectedData)
                ? intl.get('hzero.common.button.export').d('导出')
                : intl.get('hzero.common.button.selectedExport').d('勾选导出'),
              btnProps: {
                templateCode: 'SRM_C_SRM_SSLM_FIRM_CHANGE_CONFIRM_EXPORT',
                requestUrl: `${SRM_SSLM}/v1/${organizationId}/firm-change-confirms/platform-tenant-confirm-list-new/export`,
                queryParams: () => getExportParams(),
                otherButtonProps: {
                  type: 'c7n-pro',
                  funcType: 'flat',
                  icon: 'unarchive',
                },
              },
            },
          ];

    const remoteBtnProps = {
      activeKey,
      dataSetList,
    };
    const customizeCode = {
      tenantApproval: 'SSLM.ENTERPRISE_TENANT_APPROVAL.BTNS',
      platformConfirm: 'SSLM.ENTERPRISE_TENANT_APPROVAL.PLARFORM.BTNS',
    };
    const btns = remote
      ? remote.process('SSLM_ENTERPRISE_INFO_TENANT_APPROVAL_HEADER_BTNS', buttons, remoteBtnProps)
      : buttons;
    // 按钮权限集
    const permissions = [];
    const newPermissions = remote
      ? remote.process('SSLM_ENTERPRISE_INFO_TENANT_APPROVAL_HEADER_BTNS_PERMISSIONS', permissions)
      : permissions;
    // return <DynamicButtons buttons={btns} permissions={newPermissions} />;
    // 仅租户级增加个性化
    return customizeBtnGroup ? (
      customizeBtnGroup(
        {
          code: customizeCode[activeKey],
          pro: true,
        },
        <DynamicButtons
          maxNum={5}
          buttons={btns}
          permissions={newPermissions}
          defaultBtnType="c7n-pro"
        />
      )
    ) : (
      <DynamicButtons
        maxNum={5}
        buttons={btns}
        permissions={newPermissions}
        defaultBtnType="c7n-pro"
      />
    );
  }
);

export default HeaderBtn;

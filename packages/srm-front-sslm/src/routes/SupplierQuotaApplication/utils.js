/*
 * @Date: 2023-10-25
 * @Author: zlh
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { isEmpty } from 'lodash';
import { observer } from 'mobx-react-lite';
import { Button, Icon } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import CommonImport from 'components/Import';
import ExcelExportPro from 'components/ExcelExportPro';
import DynamicButtons from '_components/DynamicButtons';
import { Button as PerButton } from 'components/Permission';
import { getCurrentOrganizationId } from 'utils/utils';

import { renderStatus } from '@/routes/components/utils';
import { getPermissionList } from '@/routes/components/utils/utils';
import { renderApprovaBtn, renderApproveProgress } from '@/routes/components/WorkFlowApproval';

import styles from './index.less';

const organizationId = getCurrentOrganizationId();
const btnsPermissions = [
  {
    name: 'batchDelete',
    code: 'srm.partner.supplier-quota-manage.quota-application.button.list.batch-delete',
    meaning: '删除',
  },
];

// 明细头标题
export const getHeaderTitle = (status, source, versionNum) => {
  switch (status) {
    case 'create':
      return intl.get('sslm.common.view.message.createApplication').d('新建申请单');
    case 'view':
      return source === 'application'
        ? intl.get('sslm.common.view.message.search').d('查看申请单')
        : source === 'masterData'
        ? intl.get('sslm.common.view.message.viewMasterData').d('查看主数据')
        : `${intl.get('sslm.common.view.message.viewMasterData').d('查看主数据')} ${intl
            .get('sslm.common.version.number')
            .d('版本')}v${versionNum}`;
    default:
      return intl.get('sslm.common.view.message.editApplication').d('编辑申请单');
  }
};

export const OperationButtons = observer(
  ({
    dataSet,
    loading,
    customizeBtnGroup,
    customizeBtnGroupCode = '',
    onDelete = () => {},
    handleGoDetail = () => {},
    handleBatchSumbit = () => {},
    onExportParams = () => {},
    currentKey,
  }) => {
    // 批量提交标识
    const sumbitFlag =
      isEmpty(dataSet.toJSONData()) ||
      !isEmpty(
        dataSet.toJSONData().filter(e => !['NEW', 'UPDATAED', 'REJECTED'].includes(e.evalStatus))
      );
    // 批量删除标识
    const deleteFlag = isEmpty(dataSet.toJSONData());
    const showSubmit = ['toSubmitted'].includes(currentKey);
    const buttons = [
      {
        name: 'newExport',
        btnComp: ExcelExportPro,
        btnProps: {
          method: 'POST',
          allBody: true,
          hidden: currentKey !== 'all',
          queryParams: () => onExportParams(),
          templateCode: 'SRM_C_SRM_SSLM_SUPPLIER_QUOTA_HEADER_REQ',
          requestUrl: `${SRM_SSLM}/v1/${organizationId}/supplier-quota-headers/req-export`,
          buttonText: intl.get('hzero.common.button.export').d('导出'),
          otherButtonProps: {
            type: 'c7n-pro',
            funcType: 'flat',
          },
        },
      },
      {
        name: 'batchDelete',
        child: intl.get('hzero.common.button.delete').d('删除'),
        btnProps: {
          loading,
          wait: 200,
          icon: 'delete',
          funcType: 'flat',
          waitType: 'throttle',
          hidden: !showSubmit,
          disabled: deleteFlag,
          onClick: () => onDelete(),
        },
      },
      {
        name: 'submit',
        btnComp: PerButton,
        btnProps: {
          icon: 'check',
          type: 'c7n-pro',
          funcType: 'flat',
          loading,
          onClick: () => handleBatchSumbit(),
          disabled: sumbitFlag,
          hidden: !showSubmit,
          wait: 200,
          waitType: 'throttle',
          // permissionList: [
          //   {
          //     code: 'srm.partner.supplier-quota-manage.manage.ps.btn-release',
          //     type: 'button',
          //     meaning: '配额申请单-提交',
          //   },
          // ],
        },
        child: intl.get('hzero.common.button.sumbit').d('提交'),
      },
      {
        name: 'create',
        group: true,
        child: (
          <Button icon="add" color="primary" loading={loading}>
            {intl.get(`hzero.common.button.create`).d('新建')}
            <Icon type="keyboard_arrow_down" />
          </Button>
        ),
        children: [
          {
            name: 'manualCreate',
            child: intl.get('sslm.common.view.createType.manual').d('手工新建'),
            btnProps: {
              loading,
              onClick: () => handleGoDetail(),
            },
          },
          {
            name: 'batchImport',
            childFor: 'buttonText',
            btnComp: CommonImport,
            child: intl.get('hzero.common.button.batchImport').d('批量导入'),
            btnProps: {
              buttonProps: {
                icon: '',
                type: 'c7n-pro',
                funcType: 'flat',
                permissionList: [
                  {
                    code: 'srm.partner.supplier-quota-manage.quota-application.button.batch-import',
                    type: 'button',
                  },
                ],
              },
              refreshButton: true,
              prefixPatch: SRM_SSLM,
              businessObjectTemplateCode: 'SRM_C_SRM_SSLM_SUPPLIER_QUOTA_HEADER_REQ_IMPORT',
              successCallBack: () => {
                dataSet.query();
              },
            },
          },
        ],
      },
    ].filter(e => !e.hidden);

    return customizeBtnGroup(
      {
        code: customizeBtnGroupCode,
        pro: true,
      },
      <DynamicButtons buttons={buttons} defaultBtnType="c7n-pro" permissions={btnsPermissions} />
    );
  }
);

/**
 * @description: 标签页配置
 * @return {*}
 */
export const getTabsConfig = () => {
  return [
    {
      key: 'toSubmitted',
      countKey: 'WAIT_SUBMIT',
      tabPane: intl.get('sslm.supplierQuotaApplication.view.content.toBeSubmitted').d('待提交'),
      searchBarCode: 'SSLM.SUP_QUOTA_APPLICATIONS_LIST.TO_SUBMITTED_SEARCH',
      customizeUnitCode: 'SSLM.SUP_QUOTA_APPLICATIONS_LIST.TO_SUBMITTED_TABLE',
    },
    {
      key: 'approval',
      countKey: 'APPROVING',
      tabPane: intl.get('sslm.supplierQuotaApplication.view.content.approval').d('审批中'),
      searchBarCode: 'SSLM.SUP_QUOTA_APPLICATIONS_LIST.APPROVAL_SEARCH',
      customizeUnitCode: 'SSLM.SUP_QUOTA_APPLICATIONS_LIST.APPROVAL_TABLE',
    },
    {
      key: 'all',
      countKey: 'ALL',
      tabPane: intl.get('sslm.supplierQuotaApplication.view.content.all').d('全部'),
      searchBarCode: 'SSLM.SUP_QUOTA_APPLICATIONS_LIST.ALL_SEARCH',
      customizeUnitCode: 'SSLM.SUP_QUOTA_APPLICATIONS_LIST.ALL_TABLE',
    },
  ];
};

const getPermissionCode = key => {
  const permissionCodeList = {
    approvaPermission: {
      code: ['all'].includes(key)
        ? 'srm.partner.supplier-quota-manage.quota-application.button.all-list.approval'
        : 'srm.partner.supplier-quota-manage.quota-application.button.approving-list.approval',
      type: 'approva',
    },
    revokePermission: {
      code: ['all'].includes(key)
        ? 'srm.partner.supplier-quota-manage.quota-application.button.all-list.repeal-approval'
        : 'srm.partner.supplier-quota-manage.quota-application.button.approving-list.repeal-approval',
      type: 'revoke',
    },
  };
  return getPermissionList(permissionCodeList);
};

// 获取行上操作按钮
const getLineBtns = (
  record,
  handleGoDetail,
  handleCopy,
  handleSumbit,
  tabPaneKey,
  dataSet,
  approvalBtnInfo = {}
) => {
  const { evalStatus } = record.get(['evalStatus']);
  const { approvalInfo, allInfo } = approvalBtnInfo || {};
  return (
    <div className={styles['more-btn-wrap']}>
      {['all'].includes(tabPaneKey) && (
        <>
          <Button
            funcType="link"
            style={{ marginRight: 16 }}
            hidden={!['NEW', 'UPDATAED', 'REJECTED'].includes(evalStatus)}
            onClick={() => handleGoDetail(record, 'edit')}
          >
            {intl.get('hzero.common.button.edit').d('编辑')}
          </Button>
          <PerButton
            type="text"
            hidden={!['NEW', 'UPDATAED', 'REJECTED'].includes(evalStatus)}
            onClick={() => handleSumbit(record)}
            style={{ marginRight: 16 }}
            permissionList={[
              {
                code: `srm.partner.supplier-quota-manage.manage.ps.btn-feild-release`,
                type: 'button',
                meaning: '提交',
              },
            ]}
          >
            {intl.get('hzero.common.button.sumbit').d('提交')}
          </PerButton>
          <Button funcType="link" style={{ marginRight: 16 }} onClick={() => handleCopy(record)}>
            {intl.get('hzero.common.button.copy').d('复制')}
          </Button>
          {renderApprovaBtn({
            processDataMap: allInfo,
            record,
            onSuccess: () => dataSet.query(),
            permissionListMap: getPermissionCode(tabPaneKey),
          })}
        </>
      )}
      {['approval'].includes(tabPaneKey) &&
        (renderApprovaBtn({
          processDataMap: approvalInfo,
          record,
          onSuccess: () => dataSet.query(),
          permissionListMap: getPermissionCode(tabPaneKey),
        }) ||
          '-')}
    </div>
  );
};

export const getColumns = ({
  tabPaneKey,
  handleGoDetail = () => {},
  handleCopy = () => {},
  handleSumbit = () => {},
  approvalBtnInfo = {},
}) => {
  return [
    {
      name: 'evalStatusMeaning',
      width: 100,
      hidden: ['approval'].includes(tabPaneKey),
      renderer: renderStatus,
    },
    {
      name: 'option',
      width: 160,
      hidden: !['all', 'approval'].includes(tabPaneKey),
      renderer: ({ dataSet, record }) =>
        getLineBtns(
          record,
          handleGoDetail,
          handleCopy,
          handleSumbit,
          tabPaneKey,
          dataSet,
          approvalBtnInfo
        ),
    },
    {
      name: 'quotaAgreementNum',
      width: 120,
      renderer: ({ value, record }) => {
        const { evalStatus } = record.get(['evalStatus']);
        const editFlag = ['NEW', 'UPDATAED', 'REJECTED'].includes(evalStatus);
        const type = ['all'].includes(tabPaneKey) ? 'view' : editFlag ? 'edit' : 'view';
        return <a onClick={() => handleGoDetail(record, type)}>{value}</a>;
      },
    },
    {
      name: 'quotaAgreementDescription',
      width: 150,
    },
    {
      name: 'companyName',
      width: 150,
    },
    {
      name: 'ouName',
      width: 150,
    },
    {
      name: 'itemName',
      width: 150,
    },
    {
      name: 'itemCategoryName',
      width: 150,
    },
    {
      name: 'effectiveDateFrom',
      width: 100,
    },
    {
      name: 'effectiveDateTo',
      width: 100,
    },
    {
      name: 'createName',
      width: 100,
    },
    {
      name: 'creationDate',
      width: 150,
    },
    {
      name: 'approvalProgress',
      width: 160,
      title: intl.get('sslm.common.view.title.approvalProgress').d('审批进度'),
      hidden: !['all', 'approval'].includes(tabPaneKey),
      renderer: ({ record }) => {
        const { approvalInfo, allInfo } = approvalBtnInfo || {};
        const info = ['approval'].includes(tabPaneKey) ? approvalInfo : allInfo;
        const { approvalHistoryMap } = info || {};
        return renderApproveProgress({ approvalHistoryMap, record });
      },
    },
  ].filter(e => !e.hidden);
};

import React, { Fragment } from 'react';
import { Icon, Tooltip, Dropdown, Button, Modal } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { routerRedux } from 'dva/router';
import CommonImport from 'components/Import';
import ExcelExport from 'components/ExcelExport';
import { SRM_SSLM, SRM_PLATFORM } from '_utils/config';
import ExcelExportPro from 'components/ExcelExportPro';
import { getCurrentOrganizationId } from 'utils/utils';

import styles from '@/routes/index.less';
import { renderMenus } from './utils';
import OperationGuide from './PlatformSupplier/OperationGuide';

const organizationId = getCurrentOrganizationId();

// 操作指引回调
const handleOperationGuide = ({ dispatch, guideRef }) => {
  Modal.open({
    drawer: true,
    closable: false,
    style: { width: 380 },
    okProps: { disabled: true },
    title: intl.get('sslm.common.btn.operationGuide').d('操作指引'),
    children: <OperationGuide dispatch={dispatch} ref={guideRef} />,
    onOk: () => {
      if (guideRef.current) {
        guideRef.current.handleJumpDetail();
      }
    },
  });
};

// 获取导出url
const getRequestUrl = ({ isPlatform, supplierDimension, exportType }) => {
  if (isPlatform && supplierDimension === 'SUPPLIER') {
    // 平台供应商，供应商维度导出
    return exportType === 'NEW'
      ? `${SRM_SSLM}/v1/${organizationId}/supplier-workbench/supplier/export-new`
      : `${SRM_SSLM}/v1/${organizationId}/supplier-workbench/supplier/export`;
  } else if (isPlatform && supplierDimension === 'ITEM') {
    // 平台供应商，品类物料维度导出
    return exportType === 'NEW'
      ? `${SRM_SSLM}/v1/${organizationId}/supplier-workbench/itemOrCateogry/export-new`
      : `${SRM_SSLM}/v1/${organizationId}/supplier-workbench/itemOrCateogry/export`;
  } else if (!isPlatform && exportType === 'NEW') {
    // 本地供应商新导出
    return `${SRM_SSLM}/v1/${organizationId}/external-suppliers/export_new`;
  } else {
    // 本地供应商导出
    return `${SRM_SSLM}/v1/${organizationId}/supplier-workbench/external-supplier/export`;
  }
};

// 跳转供应商文档清单
const jumpSupplierDoc = ({ dispatch }) => {
  dispatch(
    routerRedux.push({
      pathname: `/sslm/supplier-document-list/list`,
    })
  );
};

// 跳转【供应商邀约管理】
const jumpInvitingSupplier = ({ dispatch }) => {
  dispatch(
    routerRedux.push({
      pathname: `/sslm/supplier-invite-manage/list`,
    })
  );
};

export const getHeaderBtns = ({
  guideRef,
  valueList,
  isPlatform,
  createMenus,
  inviteManage,
  handleImport,
  getExportParams,
  dispatch,
  supplierDimension,
  createMenusLodaing,
  handleOverlayClick,
  batchUpdateSupplier,
}) => {
  const supplierDimensionFlag = supplierDimension === 'SUPPLIER';
  // 平台供应商与本地供应商共用按钮
  const commonButton = [
    {
      name: 'create',
      noNest: true,
      child: (
        <Dropdown
          data-name="create"
          placement="bottomRight"
          overlay={renderMenus({ menus: createMenus, isGroup: true })}
          onOverlayClick={handleOverlayClick}
        >
          <Button icon="add" type="primary" color="primary" loading={createMenusLodaing}>
            {intl.get(`hzero.common.button.create`).d('新建')}
            <Icon type="expand_more" style={{ fontSize: '16px', marginLeft: 4, fontWeight: 400 }} />
          </Button>
        </Dropdown>
      ),
    },
  ];
  // 平台供应商按钮
  const platformButton = [
    ...commonButton,
    {
      name: 'operationGuide',
      child: intl.get('sslm.common.btn.operationGuide').d('操作指引'),
      btnProps: {
        icon: 'assistant_navigation',
        type: 'c7n-pro',
        funcType: 'flat',
        onClick: () => handleOperationGuide({ dispatch, guideRef }),
      },
    },
    {
      name: 'invitingSupplier',
      hidden: !inviteManage,
      child: intl.get('sslm.workbench.view.btn.invitingSupplier').d('邀约供应商'),
      btnProps: {
        icon: 'how_to_reg-o',
        type: 'c7n-pro',
        funcType: 'flat',
        onClick: () => jumpInvitingSupplier({ dispatch }),
      },
    },
    {
      name: 'invite',
      group: true,
      hidden: inviteManage,
      children: valueList?.businessInvite?.map(item => ({
        name: item.value,
        btnType: 'c7n-pro',
        child: item.meaning,
        btnProps: {
          value: item.value,
          router: item.tag,
          menuParams: item,
          onClick: handleOverlayClick,
        },
      })),
      child: (
        <Button type="c7n-pro" funcType="flat" icon="how_to_reg-o">
          {intl.get('sslm.workbench.view.btn.enterpriseInvite').d('企业邀约')}
          <Icon type="expand_more" style={{ fontSize: '16px', marginLeft: 4, fontWeight: 400 }} />
        </Button>
      ),
    },
    {
      name: 'document',
      child: intl.get('sslm.workbench.view.btn.supplierDoc').d('供应商文档'),
      btnProps: {
        icon: 'sutask',
        type: 'c7n-pro',
        funcType: 'flat',
        onClick: () => jumpSupplierDoc({ dispatch }),
      },
    },
    {
      name: 'platform-import-new',
      btnComp: CommonImport,
      childFor: 'buttonText',
      child: intl.get(`spfm.companySearch.view.option.importSupplierGenerate`).d('供应商导入生成'),
      btnProps: {
        refreshButton: true,
        autoExecute: false,
        prefixPatch: SRM_PLATFORM,
        businessObjectTemplateCode: 'SPFM.ORG_COMPANY.IMPORT',
        buttonProps: {
          icon: 'archive',
          type: 'c7n-pro',
          funcType: 'flat',
        },
      },
    },
    {
      name: supplierDimensionFlag ? 'supplierExport' : 'supplierCategoryExport', // 需兼容个性化配置，无法优化
      btnComp: ExcelExport,
      childFor: 'buttonText',
      child: intl.get('hzero.common.button.export').d('导出'),
      btnProps: {
        requestUrl: getRequestUrl({ isPlatform, supplierDimension, exportType: 'OLD' }),
        queryParams: getExportParams,
        otherButtonProps: {
          type: 'c7n-pro',
          funcType: 'flat',
          icon: 'unarchive',
        },
      },
    },
    {
      name: supplierDimensionFlag ? 'newSupplierExport' : 'newSupplierCategoryExport', // 需兼容个性化配置，无法优化
      btnComp: ExcelExportPro,
      childFor: 'buttonText',
      child: intl.get('hzero.common.button.export').d('导出'),
      btnProps: {
        templateCode: supplierDimensionFlag
          ? 'SRM_C_SRM_SPFM_PARTNER_SUPPLIER_EXPORT_C'
          : 'SRM_C_SRM_SPFM_PARTNER_SUPPLIER_EXPORT_P',
        requestUrl: getRequestUrl({ isPlatform, supplierDimension, exportType: 'NEW' }),
        queryParams: getExportParams,
        otherButtonProps: {
          type: 'c7n-pro',
          funcType: 'flat',
          icon: 'unarchive',
        },
      },
    },
    {
      name: 'platform-import',
      child: (
        <Fragment>
          {intl.get('hzero.common.button.import').d('导入')}
          <Tooltip
            title={intl
              .get(`spfm.companySearch.view.option.importSupplierPrompt`)
              .d('供应商信息导入生成并建立邀约')}
          >
            <Icon type="help" className={styles['btn-help']} />
          </Tooltip>
        </Fragment>
      ),
      btnProps: {
        icon: 'archive',
        type: 'c7n-pro',
        funcType: 'flat',
        onClick: () => handleImport(false),
      },
    },
  ];
  // 本地供应商按钮
  const localButton = [
    ...commonButton,
    {
      name: 'newLocalSupplierExport',
      btnComp: ExcelExportPro,
      childFor: 'buttonText',
      child: intl.get('hzero.common.button.export').d('导出'),
      btnProps: {
        templateCode: 'SRM_C_SRM_SSLM_EXTERNAL_SUPPLIER_EXPORT_NATIVE',
        requestUrl: getRequestUrl({ isPlatform: false, exportType: 'NEW' }),
        queryParams: getExportParams,
        otherButtonProps: {
          type: 'c7n-pro',
          funcType: 'flat',
          icon: 'unarchive',
        },
      },
    },
    {
      name: 'localSupplierExport',
      btnComp: ExcelExport,
      childFor: 'buttonText',
      child: intl.get('hzero.common.button.export').d('导出'),
      btnProps: {
        requestUrl: getRequestUrl({ isPlatform }),
        queryParams: getExportParams,
        otherButtonProps: {
          type: 'c7n-pro',
          funcType: 'flat',
          icon: 'unarchive',
        },
      },
    },
    {
      name: 'commonImport',
      btnComp: CommonImport,
      childFor: 'buttonText',
      child: intl.get('hzero.common.button.import').d('导入'),
      btnProps: {
        refreshButton: true,
        prefixPatch: SRM_SSLM,
        businessObjectTemplateCode: 'SSLM.BATCH_IMPORT_ERP',
        buttonProps: {
          type: 'c7n-pro',
          funcType: 'flat',
          icon: 'archive',
        },
      },
    },
    {
      name: 'import',
      child: intl.get('hzero.common.button.import').d('导入'),
      btnProps: {
        icon: 'archive',
        type: 'c7n-pro',
        funcType: 'flat',
        onClick: () => handleImport(true),
      },
    },
    {
      name: 'batchUpdateSupplierData',
      child: (
        <Fragment>
          {intl
            .get('sslm.workbench.model.workbench.batchUpdateSupplierData')
            .d('批量更新单据供应商数据')}
          <Tooltip
            title={intl
              .get('sslm.workbench.model.workbench.batchUpdateSupplierDataMsg')
              .d(
                '可批量将历史单据中平台/本地供应商为空的数据更新为当前最新关联的平台和本地供应商。业务单据每晚执行刷新'
              )}
          >
            <Icon type="help" className={styles['btn-help']} />
          </Tooltip>
        </Fragment>
      ),
      btnProps: {
        icon: 'sync_records',
        type: 'c7n-pro',
        funcType: 'flat',
        onClick: batchUpdateSupplier,
      },
    },
  ];
  return isPlatform ? platformButton : localButton;
};

/*
 * @Date: 2023-10-25
 * @Author: zlh
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { isEmpty } from 'lodash';
import { observer } from 'mobx-react-lite';
import { SRM_SSLM } from '_utils/config';
import intl from 'utils/intl';
import { Button, Dropdown, Icon } from 'choerodon-ui/pro';
import { Button as PerButton } from 'components/Permission';
import DynamicButtons from '_components/DynamicButtons';
import ExcelExportPro from 'components/ExcelExportPro';
import CommonImport from 'components/Import';
import { Tag } from 'choerodon-ui';
import { getCurrentOrganizationId } from 'utils/utils';
import HistoryVersion from './HistoryVersion';
import styles from './index.less';

const organizationId = getCurrentOrganizationId();

export const OperationButtons = observer(
  ({
    remote,
    quotaDimension,
    customizeBtnGroup,
    customizeBtnGroupCode = '',
    handleParams = () => {},
    handleQuery = () => {},
    dataSet,
  }) => {
    const noSelectFlag = isEmpty(dataSet.selected);
    const buttons = [
      {
        name: 'exportPro',
        btnComp: ExcelExportPro,
        btnProps: {
          requestUrl:
            quotaDimension === 'SUPPLIER'
              ? `${SRM_SSLM}/v1/${organizationId}/new-supplier-quota-headers/list/export`
              : `${SRM_SSLM}/v1/${organizationId}/new-supplier-quota-headers/listItem/export`,
          queryParams: () => handleParams(),
          templateCode: 'SRM_C_SRM_SSLM_SUPPLIER_QUOTA_HEADER_EXPORT',
          buttonText: noSelectFlag
            ? intl.get('hzero.common.button.export').d('导出')
            : intl.get('hzero.common.button.selectedExport').d('勾选导出'),
          otherButtonProps: {
            type: 'c7n-pro',
            funcType: 'flat',
            permissionList: [
              {
                code: 'srm.partner.supplier-quota-manage.quota-master-data.api.import',
                type: 'button',
                meaning: '配额主数据-导出',
              },
            ],
          },
        },
      },
      {
        name: 'commonImport',
        btnComp: CommonImport,
        btnProps: {
          buttonText: intl.get('hzero.common.button.import').d('导入'),
          businessObjectTemplateCode: 'SRM_C_SRM_SSLM_SUPPLIER_QUOTA_HEADER_MAIN_DATA_IMPORT',
          prefixPatch: SRM_SSLM,
          refreshButton: true,
          successCallBack: () => {
            handleQuery();
          },
          buttonProps: {
            type: 'c7n-pro',
            funcType: 'flat',
            permissionList: [
              {
                code: 'srm.partner.supplier-quota-manage.quota-master-data.button.batch-import',
                type: 'button',
                meaning: '配额主数据-导入',
              },
            ],
          },
        },
      },
    ].filter(e => !e.hidden);

    const remoteBtns = remote
      ? remote.process('SSLM_SUP_QUOTA_MASTER_DATA_LIST_HEADER_BUTTONS', buttons, {
          dataSet,
          quotaDimension,
          handleQuery,
        })
      : buttons;

    return customizeBtnGroup(
      {
        code: customizeBtnGroupCode,
        pro: true,
      },
      <DynamicButtons buttons={remoteBtns} />
    );
  }
);

// 获取行上操作按钮
const getLineBtns = (record, dispatch, handleChange, handleEnableFun) => {
  const { enableFlag, evalStatus, versionNum } = record.get([
    'enableFlag',
    'evalStatus',
    'versionNum',
  ]);
  return (
    <div className={styles['more-btn-wrap']}>
      <PerButton
        type="text"
        style={{ marginRight: 16 }}
        hidden={!['PUBLISHED', 'ALREADY_UPDATE'].includes(evalStatus)}
        onClick={() => handleChange(record)}
        permissionList={[
          {
            code: `srm.partner.supplier-quota-manage.quota-master-data.api.change`,
            type: 'button',
            meaning: '变更',
          },
        ]}
      >
        {intl.get('hzero.common.button.change').d('变更')}
      </PerButton>
      <PerButton
        type="text"
        onClick={() => handleEnableFun(record)}
        style={{ marginRight: 16, display: enableFlag ? 'inline-block' : 'none' }}
        permissionList={[
          {
            code: `srm.partner.supplier-quota-manage.quota-master-data.api.disable`,
            type: 'button',
            meaning: '禁用',
          },
        ]}
      >
        {intl.get('hzero.common.button.disable').d('禁用')}
      </PerButton>
      <PerButton
        type="text"
        onClick={() => handleEnableFun(record)}
        style={{ marginRight: 16, display: enableFlag ? 'none' : 'inline-block' }}
        permissionList={[
          {
            code: `srm.partner.supplier-quota-manage.quota-master-data.api.enable`,
            type: 'button',
            meaning: '启用',
          },
        ]}
      >
        {intl.get('hzero.common.button.enable').d('启用')}
      </PerButton>
      {versionNum > 1 && (
        <Dropdown
          overlay={() => (
            <HistoryVersion
              record={record}
              type="view"
              source="masterDataVersion"
              entranceSource="masterDataVersion"
              dispatch={dispatch}
            />
          )}
        >
          <Button funcType="link">
            <span>{intl.get('hzero.common.button.historyVerison').d('历史版本')}</span>
            <Icon type="expand_more" style={{ fontSize: 16, marginTop: -2, marginRight: 0 }} />
          </Button>
        </Dropdown>
      )}
    </div>
  );
};

export const getColumns = ({
  tabPaneKey,
  dispatch,
  handleGoDetail = () => {},
  handleChange = () => {},
  handleEnableFun = () => {},
}) => {
  return [
    {
      name: 'evalStatusMeaning',
      width: 80,
      renderer: ({ record }) => {
        const { enableFlag } = record.get(['enableFlag']);
        const valueDes = +enableFlag
          ? intl.get('hzero.common.status.enable').d('启用')
          : intl.get('hzero.common.status.disable').d('禁用');
        return (
          <Tag color={+enableFlag === 0 ? 'red' : 'green'} style={{ border: 'none' }}>
            {valueDes}
          </Tag>
        );
      },
    },
    {
      name: 'option',
      width: 200,
      tooltipProps: {
        getPopupContainer: () =>
          document.getElementsByClassName('page-content')[0] || document.body,
      },
      renderer: ({ record }) => getLineBtns(record, dispatch, handleChange, handleEnableFun),
    },
    {
      name: 'quotaAgreementNum',
      width: 120,
      renderer: ({ value, record }) => {
        return <a onClick={() => handleGoDetail(record, 'view')}>{value}</a>;
      },
    },
    {
      name: 'quotaAgreementDescription',
      width: 150,
    },
    {
      name: 'versionNum',
      width: 50,
    },
    {
      name: 'companyName',
      width: 180,
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
      name: 'supplierName',
      hidden: !['SUPPLIER'].includes(tabPaneKey),
      width: 150,
    },
    {
      name: 'quotaRatio',
      hidden: !['SUPPLIER'].includes(tabPaneKey),
      width: 100,
    },
    {
      name: 'creationDate',
      width: 150,
    },
    {
      name: 'createName',
      width: 150,
    },
  ].filter(e => !e.hidden);
};

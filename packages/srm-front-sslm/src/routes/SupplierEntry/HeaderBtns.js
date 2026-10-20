import React from 'react';
import { observer } from 'mobx-react-lite';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import DynamicButtons from '_components/DynamicButtons';
import CommonImport from 'components/Import';
import { SRM_PLATFORM, SRM_SSLM } from '_utils/config';
import ExcelExportPro from 'components/ExcelExportPro';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const HeaderBtns = observer(
  ({
    handleCreate = () => {},
    loading = false,
    deleteLoading = false,
    handleDelete = () => {},
    queryList = () => {},
    dataSet,
    currentTabKey = 'all',
    entryListRemote,
  }) => {
    const noSelected = isEmpty(dataSet?.selected);
    const notDeleteFlag = (dataSet?.selected || []).some(
      r => !['NEW', 'REJECTED'].includes(r.get('reqStatus'))
    );

    const buttons = [
      {
        name: 'create',
        child: intl.get('hzero.common.button.create').d('新建'),
        btnProps: {
          icon: 'add',
          color: 'primary',
          onClick: handleCreate,
          loading,
        },
      },
      {
        name: 'newExport',
        hidden: currentTabKey !== 'all',
        btnComp: ExcelExportPro,
        childFor: 'buttonText',
        child: noSelected
          ? intl.get('hzero.common.button.export').d('导出')
          : intl.get('hzero.common.button.selectedExport').d('勾选导出'),
        btnProps: {
          templateCode: 'SRM_C_SRM_SSLM_ENTERING_LIST_EXPORT',
          requestUrl: `${SRM_SSLM}/v1/${organizationId}/enterprise-change/enteringReq/export`,
          queryParams: () => {
            let params = {};
            const queryParams = dataSet.queryDataSet && dataSet.queryDataSet.current.toData();
            const { __dirty, ...others } = queryParams || {};
            const changeReqIdList = (dataSet?.selected || []).map(r => r.get('changeReqId'));
            params = {
              ...others,
              changeReqIdList,
            };
            return filterNullValueObject(params);
          },
          otherButtonProps: {
            type: 'c7n-pro',
            funcType: 'flat',
            icon: 'unarchive',
            permissionList: [
              {
                code: 'srm.partner.my-partner.supplier-entering.api.export',
                type: 'button',
                meaning: '供应商录入-导出',
              },
            ],
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
          prefixPatch: SRM_PLATFORM,
          autoExecute: false,
          businessObjectTemplateCode: 'SPFM.ORG_COM_ENTRY.IMPORT',
          buttonProps: {
            funcType: 'flat',
            permissionList: [
              {
                code: 'srm.partner.my-partner.supplier-entering.button.sup-import',
                type: 'button',
                meaning: '导入',
              },
            ],
          },
          successCallBack: () => {
            queryList();
          },
        },
      },
      {
        name: 'delete',
        child: intl.get('hzero.common.button.delete').d('删除'),
        btnProps: {
          icon: 'delete',
          funcType: 'flat',
          disabled: notDeleteFlag || noSelected,
          onClick: handleDelete,
          loading: loading || deleteLoading,
        },
      },
    ];

    const reomteButtons = entryListRemote ? entryListRemote.process('SSLM_SUPPLIER_ENTRY_HEADERBUTTONS', buttons, {currentTabKey, dataSet}) : buttons;

    return <DynamicButtons maxNum={5} trigger="hover" buttons={reomteButtons} defaultBtnType="c7n-pro" />;
  }
);

export default HeaderBtns;

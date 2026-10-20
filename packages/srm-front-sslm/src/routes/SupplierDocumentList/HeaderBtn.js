/*
 * @Date: 2024-02-07 11:38:35
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { isEmpty } from 'lodash';
import { observer } from 'mobx-react-lite';
import { Icon, Button } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import ExcelExportPro from 'components/ExcelExportPro';
import DynamicButtons from '_components/DynamicButtons';
import { getCurrentOrganizationId } from 'utils/utils';

const tenantId = getCurrentOrganizationId();

const permissionList = [
  {
    name: 'exportPro',
    meaning: '供应商文档清单-导出',
    code: 'srm.investigation.investigation-po.investigate-attachments-report.ps.export.new',
  },
  {
    name: 'batchDownload',
    meaning: '批量下载附件',
    code: `srm.investigation.investigation-po.investigate-attachments-report.ps.batch.download`,
  },
];

const HeaderBtn = observer(
  ({ remote, dataSet, loading, activeKey, queryParams, onBatchDownload }) => {
    const isSelect = isEmpty(dataSet?.selected);
    const selectedOne = (dataSet?.selected || []).length === 1;

    const btns = [
      {
        name: 'exportPro',
        btnComp: ExcelExportPro,
        btnProps: {
          requestUrl: `${SRM_SSLM}/v1/${tenantId}/investigate-attachments-report/export/new`,
          queryParams: () => queryParams(),
          buttonText: isSelect
            ? intl.get('hzero.common.button.export').d('导出')
            : intl.get('hzero.common.button.selectedExport').d('勾选导出'),
          templateCode: 'SRM_C_SRM_SSLM_SUPPLIER_ATTACHMENT_EXPORT',
          otherButtonProps: {
            loading,
            funcType: 'flat',
            icon: 'unarchive',
          },
        },
      },
      {
        name: 'batchDownload',
        child: (
          <Button
            type="c7n-pro"
            funcType="flat"
            icon="file_download_black-o"
            disabled={isSelect}
            loading={loading}
          >
            {intl.get('sslm.supplierDoc.view.title.batchDownloadAttachments').d('批量下载附件')}
            <Icon type="keyboard_arrow_down" />
          </Button>
        ),
        group: true,
        children: [
          {
            name: 'classifyDownload',
            child: intl.get('sslm.supplierDoc.view.title.classifyPackDownload').d('分类打包下载'),
            btnProps: {
              disabled: isSelect || selectedOne,
              onClick: () => onBatchDownload(dataSet, 'classifyPack'),
            },
          },
          {
            name: 'allDownload',
            child: intl.get('sslm.supplierDoc.view.title.allPackDownload').d('统一打包下载'),
            btnProps: {
              disabled: isSelect,
              onClick: () => onBatchDownload(dataSet, 'all'),
            },
          },
        ],
      },
    ];
    const buttons = remote
      ? remote.process('SUPPLIER_DOCUMENT_LIST_HEADER_BTNS', btns, { activeKey })
      : btns;

    return (
      <DynamicButtons
        maxNum={5}
        trigger="hover"
        buttons={buttons}
        defaultBtnType="c7n-pro"
        permissions={permissionList}
      />
    );
  }
);

export default HeaderBtn;

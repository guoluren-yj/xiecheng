import React from 'react';
import { Button } from 'choerodon-ui/pro';
import { yesOrNoRender } from 'utils/renderer';
import intl from 'srm-front-boot/lib/utils/intl/index.js';
import { PRIVATE_BUCKET } from 'srm-front-boot/lib/utils/config.js';

import { bucketDirectory } from '@/routes/utils/utils';
import HistoryButton from '../SupplierHistory';
import { viewSupplierFiles } from '../utils';

// 供应商响应
export function supItemColumns({ activeTab, currentTab, setLoading }) {
  const isExpired = currentTab?.processStatus === 'EXPIRED';
  const supplierInfo = [
    {
      type: 'number',
      name: 'totalPrice',
      label: intl.get('sslm.outsideProjectSetup.modal.totalPrice').d('响应报价总额'),
    },
    {
      type: 'dateTime',
      name: 'responseDate',
      label: intl.get('sslm.outsideProjectSetup.modal.responseDate').d('响应时间'),
    },
    {
      name: 'realName',
      label: intl.get('sslm.outsideProjectSetup.modal.companyContactId').d('联系人'),
    },
    {
      name: 'phone',
      label: intl.get('hzero.common.cellphone').d('手机号'),
      hidden: isExpired,
    },
    {
      name: 'email',
      label: intl.get('hzero.common.email').d('邮箱'),
      hidden: isExpired,
    },
    {
      name: 'remark',
      label: intl.get('sslm.outsideProjectSetup.modal.xiangyuRemark').d('响应说明'),
    },
    {
      name: 'supplierProfile',
      label: intl.get('sslm.common.modal.field.supplierProfile').d('供应商档案'),
      hidden: isExpired,
      renderer: ({ record }) => (
        <Button funcType="link" onClick={() => viewSupplierFiles(record.toData(), setLoading)}>
          {intl.get('hzero.common.button.view').d('查看')}
        </Button>
      ),
    },
    {
      type: 'attachment',
      name: 'attachmentUuid',
      isEdit: true,
      readOnly: true,
      viewMode: 'popup',
      funcType: 'link',
      componentType: 'ATTACHMENT',
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: bucketDirectory.outsideProject,
      label: intl.get('sslm.outsideProjectSetup.modal.attachmentUuid').d('响应附件'),
    },
    {
      name: 'historyQuote', // 弹框，字段不需要，只是用来占位
      label: intl.get('sslm.outsideProjectSetup.modal.historyQuote').d('历史报价'),
      renderer: ({ record }) => (
        <HistoryButton
          activeTab={activeTab}
          versionNumber={record?.get('versionNumber')}
          btnText={intl.get('hzero.common.button.look').d('查看')}
          extSourceReqId={record?.get('extSourceReqId')}
          supplierCompanyId={record?.get('supplierCompanyId')}
          title={record?.get('supplierCompanyName') || record?.get('itemName')}
        />
      ),
    },
    {
      name: 'matchMessage',
      label: intl.get('sslm.outsideProjectSetup.modal.matchMessage').d('撮合失败'),
      hidden: !isExpired,
    },
  ];

  const itemInfo = [
    {
      type: 'number',
      name: 'quotaQuantity',
      label: intl.get('sslm.outsideProjectSetup.modal.quotaQuantity').d('报价数量'),
    },
    {
      type: 'number',
      name: 'targetPrice',
      label: intl.get('sslm.outsideProjectSetup.modal.targetPrice').d('目标采购单价'),
    },
    {
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      name: 'pricePublicFlag',
      label: intl.get('sslm.outsideProjectSetup.modal.pricePublicFlag').d('目标采购单价对外公开'),
      renderer: ({ value }) => yesOrNoRender(value) || '-',
    },
    {
      name: 'itemDesc',
      label: intl.get('sslm.outsideProjectSetup.modal.itemDesc').d('物料描述'),
    },
    {
      type: 'attachment',
      name: 'pictureUuid',
      isEdit: true,
      readOnly: true,
      viewMode: 'popup',
      funcType: 'link',
      componentType: 'ATTACHMENT',
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: bucketDirectory.outsideProject,
      label: intl.get('sslm.outsideProjectSetup.modal.pictureUuid').d('图纸'),
    },
  ];

  // 行信息
  const lineColumns = [
    {
      name: 'itemName',
      width: 180,
      hidden: activeTab === 'item',
      label: intl.get('sslm.common.item.itemName').d('物料名称'),
    },
    {
      name: 'supplierCompanyName',
      width: 180,
      hidden: activeTab === 'supplier',
      label: intl.get('sslm.outsideProjectSetup.modal.supplierName').d('供应商名称'),
      renderer: ({ value, record }) => {
        return record?.get('processStatus') === 'EXPIRED' ? (
          value
        ) : (
          <Button
            funcType="link"
            onClick={() =>
              viewSupplierFiles(
                { ...record.toData(), extSourceReqId: currentTab.extSourceReqId },
                setLoading
              )
            }
          >
            {value}
          </Button>
        );
      },
    },
    {
      type: 'number',
      width: 120,
      name: 'quotaTotalPrice',
      label: intl.get('sslm.outsideProjectSetup.modal.quotaTotalPrice').d('总价'),
    },
    {
      type: 'number',
      width: 120,
      name: 'quotaQuantity',
      label: intl.get('sslm.outsideProjectSetup.modal.quotaQuantity').d('报价数量'),
    },
    {
      type: 'number',
      width: 120,
      name: 'quotaPrice',
      label: intl.get('sslm.outsideProjectSetup.modal.quotaPrice').d('零件单价'),
    },
    {
      type: 'number',
      width: 120,
      name: 'sumPrice',
      label: intl.get('sslm.outsideProjectSetup.modal.partsTotalPrice').d('零件总价'),
    },
    {
      type: 'number',
      name: 'mold',
      width: 120,
      label: intl.get('sslm.outsideProjectSetup.modal.custCard.mold').d('模具费'),
    },
    {
      type: 'number',
      width: 120,
      name: 'miscellaneous',
      label: intl.get('sslm.outsideProjectSetup.modal.miscellaneous').d('杂费'),
    },
    {
      type: 'number',
      width: 120,
      name: 'transportation',
      label: intl.get('sslm.outsideProjectSetup.modal.transportation').d('运费'),
    },
    {
      name: 'quotationHistorical',
      width: 100,
      hidden: activeTab === 'supplier',
      label: intl.get('sslm.outsideProjectSetup.modal.quotationHistorical').d('历史报价'),
      renderer: ({ record }) => (
        <HistoryButton
          activeTab={activeTab}
          versionNumber={record?.get('versionNumber')}
          btnText={intl.get('hzero.common.button.look').d('查看')}
          extSourceReqId={currentTab.extSourceReqId}
          supplierCompanyId={record?.get('supplierCompanyId')}
          title={currentTab?.supplierCompanyName || currentTab?.itemName}
        />
      ),
    },
  ];

  return { supplierInfo, itemInfo, lineColumns };
}

import type { DataSetProps } from "choerodon-ui/dataset/data-set/DataSet";
import { FieldType } from "choerodon-ui/dataset/data-set/enum";
import { getCurrentOrganizationId } from "hzero-front/lib/utils/utils";

import intl from 'utils/intl';
import { SRM_SBDM, PRIVATE_BUCKET } from '_utils/config';

import { amountFormatterOptions } from "../../../utils/utils";
import { BUCKET_DIRECTORY } from "../utils/type";

export const batchInfoDS = (batchId): DataSetProps => {
  return {
    paging: false,
    autoQuery: true,
    primaryKey: 'batchId',
    fields: [],
    transport: {
      read: {
        url: `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/pay-headers/batch-approve/${batchId}`,
        method: 'get',
      },
    },
  };
};

export const payListDS = (): DataSetProps => {
  return {
    paging: false,
    selection: false,
    fields: [
      {
        name: 'payNum',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.payDocNum').d('支付单编号'),
      },
      {
        name: 'companyNum',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.companyNum').d('公司编号'),
      },
      {
        name: 'companyName',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.companyName').d('公司名称'),
      },
      {
        name: 'displaySupplierNum',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.supplierNum').d('供应商编码'),
      },
      {
        name: 'displaySupplierName',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.supplierName').d('供应商名称'),
      },
      {
        name: 'currencyCode',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.currency').d('币种'),
      },
      {
        name: 'payTypeName',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.paymentMethod').d('付款方式'),
      },
      {
        name: 'payFormMeaning',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.paymentForm').d('付款形式'),
      },
      {
        name: 'payAmount',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.totalAmount').d('总金额'),
        type: FieldType.number,
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'remark',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.remark').d('备注'),
      },
      {
        name: 'createdByName',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.createdBy').d('创建人'),
      },
      {
        name: 'creationDate',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.creationTime').d('创建时间'),
      },
      {
        name: 'attachmentUuid',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.attachment').d('附件'),
        type: FieldType.attachment,
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: BUCKET_DIRECTORY,
      },
    ],
  };
};
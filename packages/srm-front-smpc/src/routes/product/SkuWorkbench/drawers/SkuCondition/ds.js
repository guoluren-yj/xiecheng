import { DataSet } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

import { maxSMPCMessageValidator } from '@/utils/validator';

const conditionDS = () => ({
  autoCreate: true,
  fields: [
    {
      name: 'allSkuFlag',
      label: intl.get('smpc.product.model.skuRange').d('商品范围'),
      type: 'number',
      defaultValue: 0,
      options: new DataSet({
        data: [
          { value: 1, meaning: intl.get('smpc.product.model.allSku').d('全部商品') },
          { value: 0, meaning: intl.get('smpc.product.model.partSku').d('部分商品') },
        ],
      }),
    },
    {
      label: intl.get('smpc.product.model.supplier').d('供应商'),
      name: 'supplierLov',
      type: 'object',
      lovCode: 'SSLM.SUPPLIER',
      textField: 'supplierCompanyName',
      valueField: 'supplierCompanyId',
      ignore: 'always',
    },
    {
      name: 'supplierCompanyId',
      bind: `supplierLov.supplierCompanyId`,
    },
    {
      name: 'supplierCompanyName',
      bind: `supplierLov.supplierCompanyName`,
    },
    {
      name: 'priceRange',
      label: intl.get('smpc.product.model.priceRange').d('价格区间'),
      type: 'number',
      range: ['start', 'end'],
      ignore: 'always',
      validator(value, n, record) {
        if (!record.get('allSkuFlag')) {
          const { start, end } = value || {};
          let flag = true;
          if (start) {
            flag = maxSMPCMessageValidator(start);
          }
          if (end) {
            flag = maxSMPCMessageValidator(end);
          }
          return flag;
        }
        return true;
      },
    },
    {
      name: 'priceFrom',
      type: 'number',
      bind: 'priceRange.start',
    },
    {
      name: 'priceTo',
      type: 'number',
      bind: 'priceRange.end',
    },
    {
      name: 'directOperationType',
      label: intl.get('smpc.workbench.model.operateType').d('操作类型'),
      required: true,
      lookupCode: 'SMPC.DIRECT_OPERATION_TYPE',
    },
    {
      name: 'labelList',
      label: intl.get('smpc.product.view.skuLabel').d('商品标签'),
      type: 'object',
      lookupCode: 'SMPC.SKU_LABEL',
      multiple: true,
      textField: 'labelName',
      valueField: 'labelId',
      validator(value, name, record) {
        if (record.get('labelList')?.length > 10) {
          return intl.get('smpc.workbench.view.skuLabelMax').d('最多选择10个标签');
        }
      },
    },
    {
      name: 'unshelveRemark',
      label: intl.get('smpc.product.view.unshelveRemark').d('下架原因'),
      type: 'string',
      dynamicProps: {
        required: ({ record }) => record.get('directOperationType') === 'UNSHELF',
      },
    },
  ],
});

const executeListDS = () => ({
  auoQuery: true,
  selection: false,
  pageSize: 20,
  fields: [
    {
      name: 'statusMeaning',
      label: intl.get('smpc.product.model.statusMeaning').d('执行状态'),
    },
    {
      name: 'directOperationTypeMeaning',
      label: intl.get('smpc.product.model.b').d('操作类型'),
    },
    {
      name: 'skuCondition',
      label: intl.get('smpc.product.model.skuCondition').d('商品条件'),
    },
    {
      name: 'operationTime',
      label: intl.get('smpc.product.model.startTime').d('开始时间'),
    },
    {
      name: 'process',
      label: intl.get('smpc.product.model.process').d('执行进度'),
    },
    {
      name: 'operationUserName',
      label: intl.get('smpc.product.model.operateName').d('操作人'),
    },
    {
      name: 'operationReason',
      label: intl.get('smpc.product.view.errorReason').d('失败原因'),
    },
  ],
  transport: {
    read: {
      url: `/smec/v1/${getCurrentOrganizationId()}/sku-direct-operations`,
      method: 'GET',
    },
  },
});

export { conditionDS, executeListDS };

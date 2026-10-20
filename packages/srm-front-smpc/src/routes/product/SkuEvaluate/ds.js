import { DataSet } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

import { END_TIME_DEFAULT_FORMAT } from '@/utils/const';

const organizationId = getCurrentOrganizationId();

const tableDs = () => ({
  autoQuery: true,
  queryFields: [
    {
      label: intl.get('smpc.product.model.productCode').d('商品编码'),
      name: 'skuCode',
      type: 'string',
    },
    {
      label: intl.get('smpc.product.model.productName').d('商品名称'),
      name: 'skuName',
      type: 'string',
    },
    {
      name: 'skuType',
      label: intl.get('smpc.product.model.productSource').d('商品来源'),
      lookupCode: 'SMAL.SUPPLIER_SOURCE_FROM',
      required: true,
      defaultValue: 'CATA',
    },
    {
      label: intl.get('smpc.product.model.supplier').d('供应商'),
      name: 'supplierCompanyLov',
      type: 'object',
      valueField: 'supplierId',
      textField: 'supplierName',
      ignore: 'always',
      lovCode: 'SMAL.SUPPLIER_BY_PUR',
      lovPara: { tenantId: organizationId },
    },
    {
      name: 'supplierCompanyId',
      type: 'string',
      bind: 'supplierCompanyLov.supplierId',
    },
    {
      label: intl.get('smpc.productEvaluate.model.scoreFrom').d('评分范围从'),
      type: 'number',
      name: 'scoreFrom',
    },
    {
      label: intl.get('smpc.productEvaluate.model.scoreTo').d('评分范围至'),
      type: 'number',
      name: 'scoreTo',
    },
    {
      label: intl.get('smpc.product.view.showMethod').d('展示方式'),
      type: 'number',
      name: 'hiddenFlag',
      textField: 'meaning',
      valueField: 'value',
      options: new DataSet({
        data: [
          { value: 0, meaning: intl.get('smpc.product.model.show').d('显示') },
          { value: 1, meaning: intl.get('smpc.product.model.hidden').d('隐藏') },
        ],
      }),
    },
    {
      label: intl.get('smpc.productEvaluate.model.assessDateFrom').d('评论日期从'),
      type: 'date',
      name: 'assessDateFrom',
    },
    {
      label: intl.get('smpc.productEvaluate.model.assessDateTo').d('评论日期至'),
      name: 'assessDateTo',
      type: 'date',
      transformRequest(_, record) {
        const to = record.get('assessDateTo');
        return to && to.format(END_TIME_DEFAULT_FORMAT);
      },
    },
    {
      name: 'logicDeleteFlag',
      label: intl.get('smpc.product.model.isDelete').d('是否已删除'),
      defaultValue: 0,
      lookupCode: 'HPFM.FLAG',
    },
  ],
  fields: [
    {
      label: intl.get('smpc.product.model.productInfo').d('商品信息'),
      name: 'skuInfo',
    },
    {
      label: intl.get('smpc.product.model.supplier').d('供应商'),
      name: 'supplierCompanyName',
      type: 'string',
    },
    {
      label: intl.get('smpc.productEvaluate.model.scoreAccount').d('评分账号'),
      name: 'loginName',
      type: 'string',
    },
    {
      label: intl.get('smpc.product.view.evaluate').d('评价'),
      name: 'score',
    },
    {
      label: intl.get('smpc.productEvaluate.model.commentDate').d('评论日期'),
      name: 'assessmentDate',
    },
    {
      label: intl.get('smpc.product.view.imagePreview').d('图片预览'),
      name: 'imageDTO',
    },
    {
      label: intl.get('smpc.product.view.appendContent').d('追加评论'),
      name: 'appendContent',
    },
    {
      label: intl.get('smpc.product.view.appendFileList').d('追评图片预览 '),
      name: 'appendFileList',
    },
    {
      label: intl.get('hzero.common.action').d('操作'),
      name: 'operation',
    },
  ],
  record: {
    dynamicProps: {
      selectable: (record) => record.get('logicDeleteFlag') !== 1,
    },
  },
  transport: {
    read: ({ data, params }) => {
      return {
        url: `/smpc/v1/${organizationId}/assessments/assessment-list`,
        method: 'GET',
        data: { ...data, ...params, tenantId: organizationId, assessmentBy: -1 },
      };
    },
  },
});

export { tableDs };

import { SRM_MALL } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

const organizationId = getCurrentOrganizationId();

const barTableDS = () => ({
  primaryKey: 'barId',
  autoQuery: false,
  // table表单显示的字段
  fields: [
    {
      name: 'barName',
      type: 'string',
      label: intl.get('small.mallHomePlate.model.barName').d('自定义栏名称'),
    },
    {
      name: 'orderSeq',
      type: 'string',
      label: intl.get('small.mallHomePlate.model.orderSeq').d('楼层'),
    },
    {
      name: 'mallBarName',
      type: 'string',
      label: intl.get(`small.mallHomePlate.model.quickPositName`).d('快速定位栏名称'),
    },
    {
      name: 'barTypeName',
      type: 'string',
      label: intl.get('small.mallHomePlate.model.barType').d('自定义栏类型'),
    },
    {
      name: 'barSourceTypeName',
      type: 'string',
      label: intl.get('small.mallHomePlate.model.barSource').d('自定义栏来源'),
    },
    {
      name: 'startDate',
      type: 'dateTime',
      label: intl.get('small.common.model.startTime').d('开始时间'),
    },
    {
      name: 'endDate',
      type: 'dateTime',
      label: intl.get('small.common.model.endTime').d('截止时间'),
    },
    {
      name: 'barStatusName',
      type: 'string',
      label: intl.get('hzero.common.status').d('状态'),
    },
    {
      name: 'option',
      type: 'string',
      label: intl.get('hzero.common.action').d('操作'),
    },
    {
      name: 'productList',
      type: 'string',
      label: intl.get(`small.customBar.model.customBar.productList`).d('商品列表'),
    },
  ],
  queryFields: [
    {
      name: 'barName',
      type: 'string',
      label: intl.get('small.mallHomePlate.model.barName').d('自定义栏名称'),
    },
    {
      name: 'startDate',
      type: 'dateTime',
      label: intl.get('small.common.model.startTime').d('开始时间'),
    },
    {
      name: 'endDate',
      type: 'dateTime',
      label: intl.get('small.common.model.endTime').d('截止时间'),
    },
    {
      name: 'barStatus',
      type: 'string',
      label: intl.get('small.mallHomePlate.model.shelfStatus').d('上架状态'),
      lookupCode: 'SMAL.CUSTOM_BAR_STATUS',
    },
  ],
  events: {
    load: ({ dataSet }) => {
      dataSet.forEach((record) => {
        if (record.data.barStatus === '1' || record.data.barSourceType !== '1') {
          Object.assign(record, { selectable: false });
        }
      });
    },
  },
  transport: {
    read: ({ data }) => {
      return {
        url: `${SRM_MALL}/v1/${organizationId}/custom-bars`,
        method: 'GET',
        data: {
          companyId: -1,
          ...data,
        },
      };
    },
    destroy: ({ data, dataSet }) => {
      return {
        url: `${SRM_MALL}/v1/${organizationId}/custom-bars/batch-remove`,
        data,
        method: 'POST',
        transformResponse: (res) => {
          if (!res) {
            dataSet.query();
          }
        },
      };
    },
  },
});

const historyDs = () => ({
  autoQuery: false,
  selection: false,
  fields: [
    {
      label: intl.get('small.common.model.action.user').d('操作人'),
      name: 'operatedByName',
    },
    {
      label: intl.get('small.common.model.action.time').d('操作时间'),
      name: 'operatedDate',
    },
    {
      label: intl.get('hzero.common.action').d('操作'),
      name: 'operationName',
    },
    {
      label: intl.get('hzero.common.explain').d('说明'),
      name: 'operatedRemark',
    },
  ],
  transport: {
    read({ data }) {
      return {
        url: `${SRM_MALL}/v1/${organizationId}/custom-bars/${data.barId}/history`,
        method: 'GET',
      };
    },
  },
});

const productListDs = () => ({
  autoQuery: false,
  selection: false,
  fields: [
    {
      label: intl.get(`small.customBar.model.customBar.orderSeq`).d('序号'),
      name: 'orderSeq',
    },
    {
      label: intl.get(`small.customBar.model.customBar.supplierCompanyName`).d('供应商'),
      name: 'supplierCompanyName',
    },
    {
      label: intl.get(`small.customBar.model.customBar.productNum`).d('商品编码'),
      name: 'productNum',
    },
    {
      label: intl.get(`small.customBar.model.customBar.productName`).d('商品名称'),
      name: 'productName',
    },
    {
      label: intl.get('small.common.model.product.status').d('商品状态'),
      name: 'shelfFlag',
    },
  ],
  queryFields: [
    {
      name: 'productName',
      type: 'string',
      label: intl.get(`small.customBar.view.customBar.productNameOrCode`).d('商品编码/商品名称'),
    },
  ],
  transport: {
    read({ data }) {
      const { queryParams, ...others } = data;
      return {
        url: `${SRM_MALL}/v1/${organizationId}/custom-bar-assigns`,
        method: 'GET',
        data: { ...queryParams, ...others },
      };
    },
  },
});

export { barTableDS, historyDs, productListDs };

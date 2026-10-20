import moment from 'moment';
import { DataSet } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { isNil } from 'lodash';
import { SRM_SPUC } from '_utils/config';
import { HZERO_PLATFORM } from 'utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import notification from 'utils/notification';
import { math } from 'choerodon-ui/dataset';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';

const organizationId = getCurrentOrganizationId();

const queryFields = () => [
  {
    name: 'asnNum',
    label: intl.get('sinv.common.model.common.asnNum').d('送货单号'),
  },
  {
    name: 'displayAsnLineNum',
    label: intl.get('sinv.common.model.common.displayAsnLineNum').d('送货单行号'),
  },
  {
    name: 'itemName',
    label: intl.get('sinv.common.model.common.item').d('物料'),
  },
];

const asnStatusOptionDs = new DataSet({
  selection: 'single',
  paging: false,
  transport: {
    read: () => {
      return {
        url: `${HZERO_PLATFORM}/v1/${organizationId}/lovs/data?lovCode=SINV.ASN_HEADERS_STATUS`,
        method: 'GET',
      };
    },
  },
});

const formDs = () => ({
  queryUrl: `${SRM_SPUC}/v1/${organizationId}/label-configs/list-count`,
  fields: [
    {
      name: 'condition',
      type: 'string',
    },
  ],
});

const lineDs = () => ({
  primaryKey: 'asnLineId',
  fields: [
    {
      name: 'asnNum',
      label: intl.get('sinv.common.model.common.asnNum').d('送货单号'),
    },
    {
      name: 'displayAsnLineNum',
      label: intl.get('sinv.common.model.common.asnLineNum').d('行号'),
    },
    {
      name: 'itemCode',
      label: intl.get('sinv.common.model.common.itemCode').d('物料编码'),
    },
    {
      name: 'itemName',
      label: intl.get('sinv.common.model.common.itemName').d('物料名称'),
    },
    {
      name: 'uomName',
      label: intl.get('sinv.common.model.common.unit').d('单位'),
    },
    {
      name: 'shipQuantity',
      label: intl.get('sinv.common.model.common.deliveryNumber').d('送货数量'),
    },
    {
      name: 'unitPackageQuantity',
      label: intl.get('sinv.common.model.common.unitPackageQuantity').d('单包装数'),
      type: 'number',
      min: 0,
      dynamicProps: {
        required: ({ record }) => !record.get('mixedPackageFlag'),
        max: ({ record }) => record.get('shipQuantity'),
        step: ({ record }) => {
          const uomPrecision = !isNil(record.get('uomPrecision')) ? record.get('uomPrecision') : 10;
          const num = 1 / 10 ** uomPrecision;
          return num;
        },
        // min: ({ record }) => {
        //   if ([0, '0'].includes(record.get('uomPrecision'))) {
        //     return 1;
        //   }
        //   const uomPrecision = !isNil(record.get('uomPrecision')) ? record.get('uomPrecision') : 10;
        //   const textNum = `0.${Array(Number(uomPrecision)).join('0')}1`;
        //   return textNum;
        // },
      },
    },
    {
      name: 'packageQuantity',
      label: intl.get('sinv.boxLabelCreation.model.boxLabelCreation.packageQuantity').d('比例份数'),
    },
    {
      name: 'remainderQuantity',
      label: intl.get('sinv.common.model.common.remainderQuantity').d('尾数'),
    },
    {
      name: 'lotNum',
      label: intl.get('sinv.common.model.common.lotNum').d('批次号'),
    },
    {
      name: 'productionDate',
      label: intl.get('sinv.common.model.common.productionDate').d('生产日期'),
    },
    {
      name: 'lotExpirationDate',
      label: intl.get('sinv.common.model.common.lotExpirationDate').d('批次有效期'),
    },
    {
      name: 'serialNum',
      label: intl.get('sinv.common.model.common.serialNum').d('序列号'),
    },
    // {
    //   name: 'companyName',
    //   label: intl.get('sinv.common.model.common.customer').d('客户'),
    // },
    {
      name: 'companyName',
      label: intl.get('sinv.common.model.common.companyName').d('公司'),
    },
  ],
  queryFields: [
    {
      name: 'asnNum',
      label: intl.get('sinv.common.model.common.asnNum').d('送货单号'),
    },
    {
      name: 'itemCode',
      label: intl.get('sinv.common.model.common.itemCode').d('物料编码'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { labelConfigId, ...others } = data;
      if (!labelConfigId) {
        notification.warning({
          message: intl
            .get('sinv.boxLabelCreation.view.message.query')
            .d('请先在标签管理配置中进行维护'),
        });
        return false;
      }
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/label-asn-lines/${labelConfigId}/can-create`,
        method: 'GET',
        data: {
          ...others,
        },
      };
    },
  },
  events: {
    unSelect: ({ record }) => {
      record.reset();
    },
    update: ({ record, name, value }) => {
      if (name === 'unitPackageQuantity' && value) {
        const uomPrecision = !isNil(record.get('uomPrecision')) ? record.get('uomPrecision') : null;
        const unitPackageQuantity = math.toFixed(value, uomPrecision || math.dp(value));
        record.set('unitPackageQuantity', unitPackageQuantity);
        record
          .getField('unitPackageQuantity')
          .checkValidity()
          .then((res) => {
            if (res) {
              const shipQuantity = record.get('shipQuantity');
              const packageQuantity = math.floor(
                math.div(
                  math.multipliedBy(shipQuantity, 100000),
                  math.multipliedBy(unitPackageQuantity, 100000)
                )
              );
              const remainderQuantity = math.minus(
                shipQuantity,
                math.multipliedBy(unitPackageQuantity, packageQuantity)
              );
              record.set('packageQuantity', packageQuantity);
              record.set(
                'remainderQuantity',
                math.toFixed(remainderQuantity, uomPrecision || math.dp(remainderQuantity))
              );
            }
          });
      }
    },
  },
});

const generatingDs = () => ({
  primaryKey: 'asnLineId',
  fields: [
    {
      name: 'statusCode',
      label: intl.get('sinv.common.model.common.statusMeaning').d('状态'),
      lookupCode: 'SINV.LABEL_HEADER_STATUS',
    },
    {
      name: 'labelNum',
      label: intl.get('sinv.boxLabelCreation.model.boxLabelCreation.labelNum').d('临时标签号'),
    },
    {
      name: 'creationDate',
      type: 'date',
      label: intl.get('sinv.common.model.common.creationDate').d('创建日期'),
    },
    {
      name: 'realName',
      label: intl.get('sinv.common.model.common.creator').d('创建人'),
    },
    {
      name: 'supplierName',
      label: intl.get('sinv.common.model.common.supplierCompanyName').d('供应商'),
    },
    {
      name: 'companyName',
      label: intl.get('sinv.common.model.common.companyName').d('公司'),
    },
    {
      name: 'createCampCode',
      label: intl.get('sinv.common.model.common.createCampCode').d('创建方'),
    },
  ],
  queryFields: queryFields(),
  transport: {
    read: ({ data }) => {
      const { labelConfigId, ...others } = data;
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/label-headers/list/${labelConfigId}`,
        method: 'GET',
        data: {
          ...others,
        },
      };
    },
  },
});

const printDs = () => ({
  fields: [
    {
      name: 'labelLineCode',
      label: intl.get('sinv.common.model.common.tagNum').d('标签编号'),
    },
    {
      name: 'labelLineNum',
      label: intl.get('sinv.boxLabelCreation.model.boxLabelCreation.labelLineNum').d('标签行'),
    },
    {
      name: 'unitPackageQuantity',
      label: intl.get('sinv.common.model.common.unitPackageQuantity').d('单包装数'),
    },
    {
      name: 'printCode',
      lookupCode: 'SINV.LABEL_LINE_PRINT_STATUS ',
      label: intl.get('sinv.boxLabelCreation.model.boxLabelCreation.printCode').d('可打印'),
    },
    {
      name: 'itemCode',
      label: intl.get('sinv.common.model.common.itemCode').d('物料编码'),
    },
    {
      name: 'itemName',
      label: intl.get('sinv.common.model.common.itemName').d('物料名称'),
    },
    {
      name: 'asnNum',
      label: intl.get('sinv.common.model.common.asnNum').d('送货单号'),
    },
    {
      name: 'displayAsnLineNum',
      label: intl.get('sinv.common.model.common.displayAsnLineNum').d('送货单行号'),
    },
    {
      name: 'asnStatus',
      lookupCode: 'SINV.ASN_HEADERS_STATUS',
      label: intl.get('sinv.common.model.common.asnStatus').d('送货单状态'),
    },
    {
      name: 'supplierName',
      label: intl.get('sinv.common.model.common.supplierCompanyName').d('供应商'),
    },
    {
      name: 'companyName',
      label: intl.get('sinv.common.model.common.companyName').d('公司'),
    },
    {
      name: 'productionDate',
      label: intl.get('sinv.common.model.common.productionDate').d('生产日期'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get('sinv.common.model.common.creationDate').d('创建日期'),
    },
    {
      name: 'createCampCode',
      label: intl.get('sinv.common.model.common.createCampCode').d('创建方'),
    },
  ],
  queryFields: [
    ...queryFields(),
    {
      name: 'asnStatus',
      // lookupCode: 'SINV.ASN_HEADERS_STATUS',
      label: intl.get('sinv.common.model.common.asnStatus').d('送货单状态'),
      defaultValue: 'SHIPPED',
      options: asnStatusOptionDs,
    },
    {
      name: 'creationDateFrom',
      type: 'date',
      label: intl.get('sinv.common.model.common.creationDateFrom').d('创建日期从'),
      max: 'creationDateTo',
      defaultValue: moment().subtract(1, 'months'),
      transformRequest: (val) => val && val.format(DATETIME_MIN),
    },
    {
      name: 'creationDateTo',
      type: 'date',
      label: intl.get('sinv.common.model.common.creationDateTo').d('创建日期至'),
      min: 'creationDateFrom',
      transformRequest: (val) => val && val.format(DATETIME_MAX),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { labelConfigId, ...others } = data;
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/label-lines/query-print/${labelConfigId}`,
        method: 'GET',
        data: {
          ...others,
        },
      };
    },
    destroy: () => {
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/label-lines/lineAndHeader`,
        method: 'DELETE',
      };
    },
  },
});

const onlyLabelPrintDs = () => ({
  fields: [
    {
      name: 'asnNum',
      label: intl.get('sinv.common.model.common.asnNum').d('送货单号'),
    },
    {
      name: 'displayAsnLineNum',
      label: intl.get('sinv.common.model.common.asnLineNum').d('行号'),
    },
    {
      name: 'printCode',
      lookupCode: 'SINV.LABEL_LINE_PRINT_STATUS ',
      label: intl.get('sinv.boxLabelCreation.model.boxLabelCreation.printCode').d('可打印'),
    },
    {
      name: 'itemCode',
      label: intl.get('sinv.common.model.common.itemCode').d('物料编码'),
    },
    {
      name: 'itemName',
      label: intl.get('sinv.common.model.common.itemName').d('物料名称'),
    },
    {
      name: 'shipQuantity',
      label: intl.get('sinv.common.model.common.deliveryNumber').d('送货数量'),
    },
    {
      name: 'unitPackageQuantity',
      label: intl.get('sinv.common.model.common.unitPackageQuantity').d('单包装数'),
    },
    {
      name: 'packageQuantity',
      label: intl.get('sinv.boxLabelCreation.model.boxLabelCreation.packageQuantity').d('比例份数'),
    },
    {
      name: 'remainderQuantity',
      label: intl.get('sinv.common.model.common.remainderQuantity').d('尾数'),
    },
    {
      name: 'lotNum',
      label: intl.get('sinv.common.model.common.lotNum').d('批次号'),
    },
    {
      name: 'productionDate',
      label: intl.get('sinv.common.model.common.productionDate').d('生产日期'),
    },
    {
      name: 'lotExpirationDate',
      label: intl.get('sinv.common.model.common.lotExpirationDate').d('批次有效期'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get('sinv.common.model.common.creationDate').d('创建日期'),
    },
    {
      name: 'createCampCode',
      label: intl.get('sinv.common.model.common.createCampCode').d('创建方'),
    },
  ],
  queryFields: [
    ...queryFields(),
    {
      name: 'asnStatus',
      lookupCode: 'SINV.ASN_HEADERS_STATUS',
      label: intl.get('sinv.common.model.common.asnStatus').d('送货单状态'),
      defaultValue: 'SHIPPED',
      options: asnStatusOptionDs,
    },
    {
      name: 'creationDateFrom',
      type: 'date',
      label: intl.get('sinv.common.model.common.creationDateFrom').d('创建日期从'),
      max: 'creationDateTo',
      defaultValue: moment().subtract(1, 'months'),
      transformRequest: (val) => val && val.format(DATETIME_MIN),
    },
    {
      name: 'creationDateTo',
      type: 'date',
      label: intl.get('sinv.common.model.common.creationDateTo').d('创建日期至'),
      min: 'creationDateFrom',
      transformRequest: (val) => val && val.format(DATETIME_MAX),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { labelConfigId, ...others } = data;
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/label-asn-lines/query-print/${labelConfigId}`,
        method: 'GET',
        data: {
          ...others,
        },
      };
    },
    destroy: () => {
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/label-asn-lines`,
        method: 'DELETE',
      };
    },
  },
});

const detailHeaderDs = () => ({
  autoCreate: true,
  primaryKey: 'labelHeaderId',
  fields: [
    {
      name: 'labelNum',
      label: intl.get('sinv.boxLabelCreation.model.boxLabelCreation.labelCode').d('临时编码'),
    },
    {
      name: 'volumeLength',
      label: intl
        .get('sinv.boxLabelCreation.model.boxLabelCreation.volumeLength')
        .d('体积长（CM）'),
    },
    {
      name: 'volumeWide',
      label: intl.get('sinv.boxLabelCreation.model.boxLabelCreation.volumeWide').d('体积宽（CM）'),
    },
    {
      name: 'volumeHeight',
      label: intl
        .get('sinv.boxLabelCreation.model.boxLabelCreation.volumeHeight')
        .d('体积高（CM）'),
    },
    {
      name: 'netWeight',
      label: intl.get('sinv.boxLabelCreation.model.boxLabelCreation.netWeight').d('净重（KG）'),
    },
    {
      name: 'grossWeight',
      label: intl.get('sinv.boxLabelCreation.model.boxLabelCreation.grossWeight').d('毛重（KG）'),
    },
    {
      name: 'packageMode',
      type: 'string',
      lookupCode: 'SINV.LABEL_PACKAGE_MODE',
      defaultValue: 'MIX',
      label: intl.get('sinv.boxLabelCreation.model.boxLabelCreation.packageMode').d('包装模式'),
    },
  ],
});

const detailLineDs = () => ({
  fields: [
    {
      name: 'serialNumber',
      label: intl.get('sinv.common.model.common.serialNumber').d('序号'),
    },
    {
      name: 'asnNum',
      label: intl.get('sinv.common.model.common.asnNum').d('送货单号'),
    },
    {
      name: 'asnLineNum',
      label: intl.get('sinv.common.model.common.displayAsnLineNum').d('送货单行号'),
    },
    {
      name: 'itemCode',
      label: intl.get('sinv.common.model.common.itemCode').d('物料编码'),
    },
    {
      name: 'itemName',
      label: intl.get('sinv.common.model.common.itemName').d('物料名称'),
    },
    {
      name: 'shipQuantity',
      label: intl.get('sinv.common.model.common.shipments').d('发货数量'),
    },
    {
      name: 'toPackageQuantity',
      label: intl.get('sinv.boxLabelCreation.model.boxLabelCreation.packless').d('未包装数'),
    },
    {
      name: 'unitPackageQuantity',
      type: 'number',
      label: intl.get('sinv.common.model.common.unitPackageQuantity').d('单包装数'),
      // min: 0.000001,
      dynamicProps: {
        min: ({ record }) => {
          if ([0, '0'].includes(record.get('uomPrecision'))) {
            return 1;
          }
          const uomPrecision = !isNil(record.get('uomPrecision')) ? record.get('uomPrecision') : 10;
          const textNum = `0.${Array(Number(uomPrecision)).join('0')}1`;
          return textNum;
        },
        required: ({ record }) => record.get('toPackageQuantity') !== 0,
        step: ({ record }) => {
          const uomPrecision = !isNil(record.get('uomPrecision')) ? record.get('uomPrecision') : 10;
          const num = 1 / 10 ** uomPrecision;
          return num;
        },
      },
      nonStrictStep: true,
    },
    {
      name: 'packageQuantity',
      label: intl.get('sinv.boxLabelCreation.model.boxLabelCreation.packageQuantity').d('比例份数'),
      // min: 0.000001,
      type: 'number',
      dynamicProps: {
        min: ({ record }) => {
          if ([0, '0'].includes(record.get('uomPrecision'))) {
            return 1;
          }
          const uomPrecision = !isNil(record.get('uomPrecision')) ? record.get('uomPrecision') : 10;
          const textNum = `0.${Array(Number(uomPrecision)).join('0')}1`;
          return textNum;
        },
        required: ({ record }) => record.get('toPackageQuantity') !== 0,
        max: ({ record }) => {
          return math.ceil(
            math.div(record.get('toPackageQuantity'), record.get('unitPackageQuantity'))
          );
        },
        step: ({ record }) => {
          const uomPrecision = !isNil(record.get('uomPrecision')) ? record.get('uomPrecision') : 10;
          const num = 1 / 10 ** uomPrecision;
          return num;
        },
      },
      nonStrictStep: true,
    },
    {
      name: 'lotNum',
      label: intl.get('sinv.common.model.common.lotNum').d('批次号'),
    },
    {
      name: 'productionDate',
      label: intl.get('sinv.common.model.common.productionDate').d('生产日期'),
    },
  ],
  events: {
    update: ({ record, name, value }) => {
      if (name === 'unitPackageQuantity' && value) {
        const uomPrecision = !isNil(record.get('uomPrecision')) ? record.get('uomPrecision') : null;
        const unitPackageQuantity = math.toFixed(value, uomPrecision || math.dp(value));
        record.set('unitPackageQuantity', unitPackageQuantity);
        record.set(
          'packageQuantity',
          math.floor(math.div(record.get('toPackageQuantity'), unitPackageQuantity))
        );
      }
    },
    load: ({ dataSet }) => {
      dataSet.forEach((record) => {
        if (record.get('toPackageQuantity') === 0) {
          Object.assign(record, { selectable: false });
        } else {
          record.set('status', 'update');
        }
      });
    },
  },
  feedback: {
    loadSuccess: (resp) => {
      if (Array.isArray(resp.content)) {
        resp.content.forEach((item, index) => {
          Object.assign(item, { serialNumber: index + 1 });
        });
      }
    },
  },
});

const detailCreatedLabelDs = () => ({
  fields: [
    {
      name: 'labelLineCode',
      label: intl.get('sinv.boxLabelCreation.model.boxLabelCreation.labelLineCode').d('标签编码'),
    },
    {
      name: 'labelLineNum',
      label: intl.get('sinv.boxLabelCreation.model.boxLabelCreation.labelLineNum').d('标签行'),
    },
    {
      name: 'itemCode',
      label: intl.get('sinv.common.model.common.itemCode').d('物料编码'),
    },
    {
      name: 'itemName',
      label: intl.get('sinv.boxLabelCreation.model.boxLabelCreation.itemName').d('物料描述'),
    },
    {
      name: 'volumeLength',
      label: intl
        .get('sinv.boxLabelCreation.model.boxLabelCreation.volumeLength')
        .d('体积长（CM）'),
    },
    {
      name: 'volumeWide',
      label: intl.get('sinv.boxLabelCreation.model.boxLabelCreation.volumeWide').d('体积宽（CM）'),
    },
    {
      name: 'volumeHeight',
      label: intl
        .get('sinv.boxLabelCreation.model.boxLabelCreation.volumeHeight')
        .d('体积高（CM）'),
    },
    {
      name: 'netWeight',
      label: intl.get('sinv.boxLabelCreation.model.boxLabelCreation.netWeight').d('净重（KG）'),
    },
    {
      name: 'grossWeight',
      label: intl.get('sinv.boxLabelCreation.model.boxLabelCreation.grossWeight').d('毛重（KG）'),
    },
    {
      name: 'unitPackageQuantity',
      label: intl.get('sinv.common.model.common.unitPackageQuantity').d('单包装数'),
    },
  ],
});

export {
  lineDs,
  generatingDs,
  formDs,
  detailHeaderDs,
  detailLineDs,
  printDs,
  onlyLabelPrintDs,
  detailCreatedLabelDs,
  asnStatusOptionDs,
};

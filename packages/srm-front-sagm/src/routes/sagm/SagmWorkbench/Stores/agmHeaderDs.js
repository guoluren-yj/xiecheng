import moment from 'moment';
import intl from 'utils/intl';
import { DATETIME_MIN } from 'utils/constants';
import { getCurrentOrganizationId } from 'utils/utils';
import { isEmpty } from 'lodash';

import { protocolEventLoad } from '../../commonUtils';

// 将字符串的1,0转化
function getNumber(value) {
  return value ? +value : value;
}

export default function getAgmHeaderDs(config = {}, dsProps = {}, funcs = {}, options = {}) {
  const organizationId = getCurrentOrganizationId();
  const { url, queryParams = {} } = config;
  const { setAgmInfo = (e) => e } = funcs;
  const { orderLimitDs } = options;
  return {
    autoQuery: true,
    // selection: false,
    primaryKey: 'agreementHeaderId',
    cacheSelection: true,
    ...dsProps,
    fields: [
      { name: 'statusCodeMeaning', label: intl.get('hzero.common.status').d('状态') },
      {
        name: 'agreementHeaderNum',
        label: intl.get('sagm.common.model.agreementCode').d('协议编码'),
      },
      {
        name: 'agreementHeaderName',
        required: true,
        label: intl.get('sagm.saleAgreement.model.agreementName').d('协议名称'),
      },
      {
        name: 'showSupplierType',
        label: intl.get('sagm.saleAgreement.model.mallSupplierShow').d('商城供应商展示'),
        lookupCode: 'SAGM.SHOW_SUPPLIER_TYPE',
        defaultValue: 'ORIGINAL_SUPPLIER',
        required: true,
        dynamicProps: {
          disabled: ({ record }) => record.get('agreementHeaderType') === 'RECEIVE',
        },
      },
      {
        name: 'proxyCompanyLov',
        label: intl.get('sagm.saleAgreement.view.saleMainBody').d('销售主体'),
        type: 'object',
        required: true,
        ignore: 'always',
        lovCode: 'SPFM.USER_AUTHORITY_COMPANY',
        lovPara: { tenantId: organizationId },
      },
      {
        name: 'proxyCompanyId',
        bind: 'proxyCompanyLov.companyId',
      },
      {
        name: 'proxyCompanyName',
        bind: 'proxyCompanyLov.companyName',
        label: intl.get('sagm.saleAgreement.view.saleMainBody').d('销售主体'),
      },
      {
        name: 'agreementHeaderType',
        label: intl.get('sagm.saleAgreement.model.agreementType').d('协议类型'),
        lookupCode: 'SAGM.AGREEMENT_HEADER_TYPE',
        required: true,
        dynamicProps: {
          disabled: ({ record }) => record.get('agreementHeaderId'),
        },
      },
      {
        name: 'agreementHeaderTypeMeaning',
        label: intl.get('sagm.saleAgreement.model.agreementType').d('协议类型'),
      },
      {
        name: 'creationDate',
        type: 'dateTime',
        label: intl.get('sagm.common.model.creationTime').d('创建时间'),
      },
      {
        name: 'validDate',
        label: intl.get('sagm.common.model.validDate').d('有效期'),
        ignore: 'always',
        type: 'date',
        min: moment().format(DATETIME_MIN),
        range: ['start', 'end'],
      },
      {
        name: 'validDateFrom',
        type: 'date',
        bind: 'validDate.start',
      },
      {
        name: 'validDateTo',
        type: 'date',
        bind: 'validDate.end',
      },
      {
        name: 'realName',
        label: intl.get('sagm.common.model.createName').d('创建人'),
      },
      {
        name: 'creationDate',
        type: 'dateTime',
        label: intl.get('sagm.common.model.creationTime').d('创建时间'),
      },
      {
        name: 'paymentType',
        lookupCode: 'SAGM.PAYMENT_TYPE',
        label: intl.get('sagm.common.model.paymentType').d('支付方式'),
        computedProps: {
          // 新建时不展示支付方式故不校验
          required: ({ record }) =>
            record.get('agreementHeaderId') && record.get('agreementHeaderType') === 'MEMBER',
        },
      },
      {
        name: 'paymentMethod',
        lookupCode: 'SAGM.PAYMENT_METHOD',
        label: intl.get('sagm.common.model.paymentType').d('支付方式'),
        computedProps: {
          required: ({ record }) =>
            record.get('agreementHeaderId') &&
            !['MEMBER', 'RECEIVE'].includes(record.get('agreementHeaderType')),
        },
      },
      {
        name: 'salePointsDetails',
        multiple: true,
        type: 'object',
        textField: 'pointsTypeName',
        valueField: 'pointsTypeId',
        lookupUrl: `/sigl/v1/${organizationId}/points-types/list-no-cache`,
        label: intl.get('sagm.common.view.hasPotinsType').d('支持的积分类型'),
        computedProps: {
          required: ({ record }) =>
            record.get('agreementHeaderId') &&
            record.get('agreementHeaderType') === 'MEMBER' &&
            record.get('paymentType') !== 'CASH_PAYMENT',
        },
      },
      {
        name: 'inventoryLov',
        ignore: 'always',
        type: 'object',
        lovCode: 'SPFM.USER_AUTH.INVORG',
        valueField: 'organizationId',
        textField: 'organizationName',
        dynamicProps: {
          lovPara: ({ record }) => ({ companyId: record.get('proxyCompanyId') }),
          required: ({ record }) => record.get('agreementHeaderType') !== 'RECEIVE',
        },
        label: intl.get('sagm.common.model.inventory.organization').d('库存组织'),
      },
      {
        name: 'invOrganizationId',
        bind: 'inventoryLov.organizationId',
      },
      {
        name: 'invOrganizationName',
        bind: 'inventoryLov.organizationName',
      },
      {
        name: 'purchaseLov',
        ignore: 'always',
        type: 'object',
        lovCode: 'SPFM.USER_AUTH.PURCHASE_ORG',
        valueField: 'purchaseOrgId',
        textField: 'organizationName',
        label: intl.get('sagm.common.model.purchase.organization').d('采购组织'),
        dynamicProps: {
          required: ({ record }) => record.get('agreementHeaderType') !== 'RECEIVE',
        },
      },
      {
        name: 'purOrganizationId',
        bind: 'purchaseLov.purchaseOrgId',
      },
      {
        name: 'purOrganizationName',
        bind: 'purchaseLov.organizationName',
      },
      {
        name: 'remark',
        label: intl.get('sagm.common.model.remark').d('备注'),
      },
      // {
      //   name: 'saleAgreementInventories',
      //   type: 'object',
      //   multiple: true,
      //   lovCode: 'HPFM.INVENTORY',
      //   lovPara: { tenantId: organizationId, enabledFlag: 1 },
      //   valueField: 'inventoryId',
      //   textField: 'inventoryName',
      //   dynamicProps: {
      //     required: ({ record }) => record.get('agreementHeaderType') === 'RECEIVE',
      //   },
      //   label: intl.get('sagm.common.view.reveiveInventory').d('领用库房'),
      // },
      {
        name: 'autoLabelFlag',
        dynamicProps: {
          ignore: ({ record }) =>
            record.get('agreementHeaderType') === 'RECEIVE' || record.get('agreementHeaderId')
              ? 'never'
              : 'always',
        },
        defaultValue: '0',
        trueValue: '1',
        falseValue: '0',
        label: intl.get('sagm.common.view.autoLabel').d('自动打标'),
      },
      {
        name: 'labelLov',
        type: 'object',
        lovCode: 'SMPC.SKU_LABEL',
        ignore: 'always',
        valueField: 'labelId',
        textField: 'labelName',
        lovPara: { tenantId: organizationId, enabledFlag: 1, noSupplierFlag: 1 },
        label: intl.get('sagm.common.view.skuLabel').d('商品标签'),
        dynamicProps: {
          required: ({ record }) =>
            getNumber(record.get('autoLabelFlag')) &&
            record.get('agreementHeaderType') === 'RECEIVE',
          disabled: ({ record }) => !getNumber(record.get('autoLabelFlag')),
        },
      },
      {
        name: 'skuLabelName',
        bind: 'labelLov.labelName',
      },
      {
        name: 'skuLabelId',
        bind: 'labelLov.labelId',
      },
    ],
    record: {
      dynamicProps: {
        selectable: (record) => record.get('statusCode') !== 'WORKFLOW_WAITING',
      },
    },
    events: {
      load: ({ dataSet }) => {
        if (dataSet.current) {
          setAgmInfo({ ...dataSet.current.toJSONData() });
        }
        // 处理工作流审批按钮
        protocolEventLoad({ dataSet });
      },
      update: ({ record, name, value, oldValue }) => {
        if (name === 'agreementHeaderType') {
          setAgmInfo({ agreementHeaderType: value });
          if (value === 'RECEIVE') {
            record.set('showSupplierType', 'SALES_BODY');
          }
        }
        // 公司变更
        if (name === 'proxyCompanyLov' && record.get('inventoryLov')) {
          if ((value && oldValue && value.companyId !== oldValue.companyId) || !value) {
            record.set('inventoryLov', null);
          }
        }
        // 库存组织变更
        if (name === 'inventoryLov' && value && !record.get('proxyCompanyLov')) {
          record.set('proxyCompanyId', value.companyId);
          record.set('proxyCompanyName', value.companyName);
        }
        // 清空积分类型
        if (name === 'paymentType' && value === 'CASH_PAYMENT') {
          record.set('salePointsDetails', null);
        }
        // 清空积分类型 和积分类型
        if (name === 'agreementHeaderType' && value !== 'MEMBER') {
          record.set('salePointsDetails', null);
          record.set('paymentType', null);
        }
        if (name === 'salePointsDetails') {
          // 清空行可选择积分类型
          orderLimitDs.forEach((r) => {
            const limitPointsType = r.get('pointsTypeObj');
            const salePointsTypes = Array.isArray(value) ? value : [];
            if (
              !isEmpty(limitPointsType) &&
              salePointsTypes.every((p) => p.pointsTypeId !== limitPointsType.pointsTypeId)
            ) {
              r.set('pointsTypeObj', null);
            }
          });
        }
      },
    },
    transport: {
      read({ data }) {
        return {
          url: url || `/sagm/v1/${organizationId}/sale-agreement-headers`,
          method: 'GET',
          data: { ...queryParams, ...data },
        };
      },
    },
  };
}

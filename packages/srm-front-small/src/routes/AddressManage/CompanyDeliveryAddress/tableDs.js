import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_MALL } from '_utils/config';
import { EMAIL, PHONE, NOT_CHINA_PHONE } from 'utils/regExp';
import { isEmpty } from 'lodash';

const organizationId = getCurrentOrganizationId();

export const tableDs = () => ({
  paging: 'true',
  pageSize: 20,
  autoQuery: false,
  selection: 'multiple',
  caches: false,
  fields: [
    {
      name: 'belongTypeMeaning',
      label: intl.get(`small.common.model.addressType`).d('地址类型'),
    },
    {
      name: 'companyName',
      label: intl.get(`small.common.model.companyName`).d('公司名称'),
    },
    {
      name: 'invOrganizationName',
      label: intl.get('small.common.model.inventory.organization').d('库存组织'),
    },
    {
      name: 'inventoryName',
      label: intl.get('small.common.model.inventory.wareHouse').d('库房'),
    },
    {
      name: 'loginName',
      label: intl.get(`small.common.view.contact.user`).d('联系人账户'),
    },
    {
      name: 'contactName',
      label: intl.get(`small.common.model.contact`).d('联系人'),
    },
    {
      label: intl.get('small.common.model.phone').d('手机'),
      name: 'mobile',
    },
    {
      label: intl.get('small.common.model.email').d('邮箱'),
      name: 'email',
    },
    {
      label: intl.get(`small.common.model.regionArea`).d('地址区域'),
      width: 170,
      name: 'regionName',
    },
    {
      label: intl.get(`small.common.model.detailAddress`).d('详细地址'),
      name: 'address',
    },
    {
      label: intl.get('small.common.model.status').d('状态'),
      name: 'enabledFlag',
      type: 'number',
    },
    {
      label: intl.get(`small.common.model.isDefaultFlag`).d('是否默认'),
      name: 'defaultFlag',
      type: 'number',
    },
    {
      name: 'zip',
      label: intl.get(`small.ecAcquirerAddress.model.zip`).d('邮编'),
    },
    {
      label: intl.get('small.common.model.remark').d('备注'),
      name: 'remark',
    },
    {
      label: intl.get('small.common.model.operation').d('操作'),
      name: 'edit',
    },
  ],
  transport: {
    read: ({ data }) => {
      const { params, ...other } = data;
      return {
        url: `${SRM_MALL}/v1/${organizationId}/addresss/receiver/merge`,
        method: 'GET',
        data: {
          ...data.params,
          ...other,
          addressType: 'RECEIVER',
        },
        transformResponse: (res) => {
          const resp = JSON.parse(res);
          const { addressList, ...others } = resp;
          return res
            ? {
                ...addressList,
                ...others,
              }
            : [];
        },
      };
    },
  },
});

export const optionDs = () => ({
  transport: {
    read({ data: { parentRegionCode, countryId } }) {
      return {
        url: !parentRegionCode
          ? `${SRM_MALL}/v1/mall-regions/${getCurrentOrganizationId()}/country-list-by-config`
          : `${SRM_MALL}/v1/mall-regions/${getCurrentOrganizationId()}/Subordinate?page=-1&countryId=${countryId}`,
        method: 'GET',
        // eslint-disable-next-line eqeqeq
        data: { regionCode: parentRegionCode != countryId ? parentRegionCode : null },
        transformResponse: (res) => {
          const resp = JSON.parse(res);
          const { content } = resp;
          const getRegionCodeMap = (value)=>{
            return [{
              condition: value.virtualFlag || value.isNAFlag,
              result: `${value.regionCode}1`, // 处理暂不选择的regionCode为更低层级 渲染
            },
            {
              condition: !parentRegionCode,
              result: value.countryId,
            },
            {
              condition: parentRegionCode,
              result: value.regionCode,
            }].find(c=>c.condition).result;
          };
          const getParentRegionCodeMap = (value)=>{
            return [{
              condition: value.virtualFlag || value.isNAFlag,
              result: parentRegionCode, // 处理暂不选择的parentRegionCode为同层级
            },
            {
              condition: !parentRegionCode,
              result: '',
            },
            {
              condition: parentRegionCode,
              result: value.parentRegionCode || value.countryId,
            }].find(c=>c.condition).result;
          };
          const newNationRes = content.map((val) =>{
            const value = val;
            if(parentRegionCode && val?.regionIdList?.length >= 2){ // 针对N/A处理为暂不选择虚拟字段
              value.isNAFlag = true;
              value.regionName = intl.get('small.common.view.tempNotSecelt').d('暂不选择');
            }
            return {
              ...value,
              countryFlag: !parentRegionCode, // 是否为countryList 请求出的数据
              countryId: value.countryId,
              countryName: value.countryName,
              regionName: parentRegionCode ? value.regionName : value.countryName, // 国家地区数据没有regionName
              regionId: parentRegionCode ? value.regionId : value.countryId,
              regionCode: getRegionCodeMap(value),
              parentRegionCode: getParentRegionCodeMap(value),
              oldParentRegionCode: parentRegionCode ? value.parentRegionCode || value.countryId : '', // 保存真实的parentRegionCode
              oldRegionCode: parentRegionCode ? value.regionCode : value.countryId,
              _token: value._token,
            };
          });
          return newNationRes;
        },
      };
    },
  },
  autoQuery: true,
  parentField: 'parentRegionCode',
  idField: 'regionCode',
  fields: [
    { name: 'regionId', type: 'string' },
    { name: 'regionName', type: 'string' },
    { name: 'regionCode', type: 'string' },
    { name: 'expand', type: 'boolean' },
    { name: 'parentRegionCode', type: 'string' },
  ],
});

export const formDs = ({ optionsDs }) => ({
  autoQuery: false,
  fields: [
    {
      name: 'companyIdLov',
      type: 'object',
      label: intl.get(`small.common.model.companyName`).d('公司名称'),
      lovCode: 'SPFM.USER_AUTHORITY_COMPANY',
      valueField: 'companyId',
      textField: 'companyName',
      required: true,
    },
    {
      name: 'companyId',
      bind: 'companyIdLov.companyId',
    },
    {
      name: 'companyName',
      bind: 'companyIdLov.companyName',
    },
    {
      name: 'invOrganizationIdLov',
      type: 'object',
      label: intl.get('small.companyDeliveryAddress.view.stockName').d('库存组织'),
      lovCode: 'SPFM.USER_AUTH.INVORG',
      valueField: 'organizationId',
      textField: 'organizationName',
    },
    {
      name: 'invOrganizationId',
      bind: 'invOrganizationIdLov.organizationId',
    },
    {
      name: 'invOrganizationName',
      bind: 'invOrganizationIdLov.organizationName',
    },
    {
      name: 'inventoryIdLov',
      type: 'object',
      label: intl.get('small.companyDeliveryAddress.view.warehouse').d('库房'),
      lovCode: 'SMCT.INVENTORY_WITH_PERMISSION',
      valueField: 'inventoryId',
      textField: 'inventoryName',
      computedProps: {
        lovPara: ({ record }) => {
          return {
            invOrganizationId: record.get('invOrganizationId'),
            tenantId: organizationId,
            enabledFlag: 1,
          };
        },
      },
    },
    {
      name: 'inventoryId',
      bind: 'inventoryIdLov.inventoryId',
    },
    {
      name: 'inventoryName',
      bind: 'inventoryIdLov.inventoryName',
    },
    {
      name: 'inventoryCode',
      bind: 'inventoryIdLov.inventoryCode',
    },
    {
      name: 'userIdLov',
      type: 'object',
      label: intl.get(`small.common.view.contact.user`).d('联系人账户'),
      lovCode: 'SMAL.QUERY_USER',
      valueField: 'id',
      textField: 'loginName',
    },
    {
      name: 'userId',
      bind: 'userIdLov.id',
    },
    {
      name: 'loginName',
      bind: 'userIdLov.loginName',
    },
    {
      name: 'contactName',
      label: intl.get(`small.common.model.contact`).d('联系人'),
      computedProps: {
        disabled: ({ record }) => {
          return !!record.get('loginName');
        },
      },
      required: true,
    },
    {
      name: 'internationalTelCode',
      // label: intl.get('small.common.model.internationalTelCode').d('区号'),
      lookupCode: 'HPFM.IDD',
      defaultValue: '+86',
      required: true,
    },
    {
      name: 'phoneChange',
    },
    {
      name: 'mobile',
      type: 'tel',
      regionField: 'internationalTelCode',
      label: intl.get('hzero.common.phone').d('手机'),
      computedProps: {
        pattern: ({ record }) => {
          return record.get('phoneChange') !== 1
            ? null
            : record.get('internationalTelCode') === '+86'
            ? PHONE
            : NOT_CHINA_PHONE;
        },
      },
      required: true,
    },
    {
      name: 'phone',
      label: intl.get(`small.common.model.fixedPhone`).d('固定电话'),
      pattern: /\d[ #-]|^\d+$/,
    },
    {
      name: 'email',
      label: intl.get(`small.common.model.email`).d('邮箱'),
      computedProps: {
        pattern: ({ record, name }) => {
          // 新值
          const value = record.get(name);
          // 初始值
          const pristineValue = record.getPristineValue(name);
          return value !== pristineValue ? EMAIL : null;
        },
      },
    },
    {
      name: 'emailEditFlag',
      transformRequest: (value, record) => (record.getField('email').isDirty() ? 1 : 0),
    },
    {
      name: 'region',
      type: 'object',
      label: intl.get(`small.common.model.regionArea`).d('地址区域'),
      textField: 'regionName',
      valueField: 'regionCode',
      required: true,
      options: optionsDs,
      computedProps: {
        defaultValue: ({ record }) => {
          return (record.get('regionNameList') || []).join('/');
        },
      },
      validator: (value, name, record) => {
        const isNAFlag = record.get('regionIdList')?.length >= 4 && value?.slice()?.length > 1; // 新建的地址为isNAFlag，编辑的是有regionIdList > 4
        const isNormalFlag = (value?.slice()?.length >= 4);
        if (isNAFlag || isNormalFlag) {
          return true;
        } else {
          return intl.get('small.common.model.errorAddress').d('地区不完整');
        }
      },
    },
    {
      name: 'address',
      label: intl.get(`small.common.model.detailAddress`).d('详细地址'),
      required: true,
    },
    {
      name: 'remark',
      label: intl.get('small.common.model.remark').d('备注'),
    },
    {
      name: 'enabledFlag',
      label: intl.get(`hzero.common.status.enable`).d('启用'),
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
    },
    {
      name: 'defaultFlag',
      label: intl.get(`small.common.model.isDefaultFlag`).d('是否默认'),
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
    },
  ],
  events: {
    update: ({ record, name, value }) => {
      if (name === 'userIdLov') {
        const data = record.get('userIdLov') || {};
        if (!isEmpty(data)) {
          record.init('mobile', data.phone);
          record.init('email', data.email);
          record.set('phoneChange', 0);
        }
      }
      if (name === 'mobile') {
        record.set('phoneChange', 1);
      }
      if (name === 'phone' && record.get('addressId')) {
        record.set('phoneEditFlag', 1);
      }
      if (name === 'phoneChange') {
        record.set('editFlag', record.get('phoneChange'));
      }
      if (name === 'invOrganizationIdLov') {
        record.set('inventoryIdLov', null);
      }
      if (name === 'userIdLov') {
        record.set('contactName', value?.realName);
      }
    },
  },
});

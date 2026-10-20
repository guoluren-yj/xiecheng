import { getUserOrganizationId } from 'utils/utils';

import intl from 'utils/intl';

import { PHONE, NOT_CHINA_PHONE } from 'utils/regExp';

const tenantId = getUserOrganizationId();

const formDs = () => ({
  selection: false,
  fields: [
    {
      name: 'supplierCompanyLov',
      type: 'object',
      label: intl.get('smodr.afterSaleManage.model.CompanyLov').d('公司'),
      lovCode: 'HPFM.COMPANY',
      lovPara: { tenantId },
      textField: 'companyName',
      required: true,
      ignore: 'always',
    },
    {
      name: 'supplierCompanyName',
      bind: 'supplierCompanyLov.companyName',
    },
    {
      name: 'supplierCompanyId',
      bind: 'supplierCompanyLov.companyId',
    },
    {
      label: intl.get('smodr.afterSaleManage.model.contact').d('联系人'),
      type: 'string',
      name: 'contactName',
      required: true,
    },
    {
      label: intl.get('smodr.afterSaleManage.model.internationalTelCode').d('区号'),
      type: 'string',
      name: 'internationalTelCode',
      dynamicProps: ({ record }) => {
        return {
          required: !record.get('phone'),
        };
      },
    },
    {
      name: 'mobilePhone',
      type: 'string',
      label: intl.get('smodr.afterSaleManage.model.mobile').d('手机'),
      dynamicProps: ({ record }) => {
        return {
          required: !record.get('phone'),
          pattern: record.get('internationalTelCode') === '+86' ? PHONE : NOT_CHINA_PHONE,
        };
      },
    },
    {
      label: intl.get('smodr.afterSaleManage.model.phone').d('电话号码'),
      type: 'string',
      name: 'phone',
      dynamicProps: ({ record }) => {
        return {
          required: !record.get('mobilePhone'),
        };
      },
    },
    {
      label: intl.get('smodr.afterSaleManage.model.addressDetail').d('详细地址'),
      type: 'string',
      name: 'address',
      required: true,
    },
    {
      label: intl.get('smodr.afterSaleManage.model.postal').d('邮政编码'),
      type: 'string',
      name: 'postCode',
    },
    {
      label: intl.get('smodr.afterSaleManage.view.default').d('设为默认'),
      name: 'addressFlag',
    },
    {
      label: intl.get('smodr.afterSaleManage.model.addressArea').d('地址区域'),
      name: 'regionIdList',
      type: 'string',
      textField: 'regionName',
      valueField: 'regionId',
      required: true,
      ignore: 'always',
      validator: (value) => {
        if (escape(value?.[0]).indexOf('%u') < 0 && value?.length < 4) {
          return intl.get('smodr.afterSaleManage.model.addressTip').d('请维护完整地址！');
        }
      },
    },
  ],
});

export { formDs };

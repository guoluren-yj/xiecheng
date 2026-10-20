import { getCurrentOrganizationId, getUserOrganizationId } from 'utils/utils';
import { SMALL_ORDER } from '_utils/config';
import intl from 'utils/intl';

const organizationId = getCurrentOrganizationId(); // 租户ID
const userOrganizationId = getUserOrganizationId();

const tableDs = () => ({
  autoQuery: true,
  selection: false,
  fields: [
    {
      label: intl.get('smodr.afterSaleManage.model.companyName').d('公司名称'),
      type: 'string',
      name: 'supplierCompanyName',
    },
    {
      label: intl.get('smodr.afterSaleManage.model.contact').d('联系人'),
      type: 'string',
      name: 'contactName',
    },
    {
      label: intl.get('smodr.afterSaleManage.model.telephone').d('手机号码'),
      type: 'string',
      name: 'phoneNumber',
    },
    {
      label: intl.get('smodr.afterSaleManage.model.phone').d('电话号码'),
      type: 'string',
      name: 'phone',
    },
    {
      label: intl.get('smodr.afterSaleManage.model.region').d('所属地区'),
      type: 'string',
      name: 'fullAddress',
    },
    {
      label: intl.get('smodr.afterSaleManage.model.addressDetail').d('详细地址'),
      type: 'string',
      name: 'address',
    },
    {
      label: intl.get('smodr.afterSaleManage.model.postal').d('邮政编码'),
      type: 'string',
      name: 'postCode',
    },
    {
      label: intl.get('smodr.afterSaleManage.model.options').d('操作'),
      type: 'string',
      name: 'options',
    },
  ],
  transport: {
    read({ data }) {
      return {
        url: `${SMALL_ORDER}/v1/${organizationId}/supplier-after-sale-addresss/${userOrganizationId}/list`,
        method: 'GET',
        data: { ...data },
      };
    },
    destroy: ({ data, dataSet }) => {
      return {
        url: `${SMALL_ORDER}/v1/${organizationId}/supplier-after-sale-addresss`,
        method: 'DELETE',
        data,
        transformResponse: (res) => {
          if (!res) {
            dataSet.query();
          }
        },
      };
    },
  },
});

export { tableDs };

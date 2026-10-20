import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

// function flatUnit(units) {
//   let initArr = [];
//   const flatArr = (arr) => {
//     initArr = [...initArr, ...arr];
//     arr.forEach((item) => {
//       if (!isEmpty(item.children)) {
//         flatArr(item.children);
//       }
//     });
//   };
//   flatArr(units);
//   return initArr;
// }

export default function ds() {
  const organizationId = getCurrentOrganizationId();
  return {
    expandField: 'expend',
    primaryKey: 'unitId',
    autoQuery: true,
    idField: 'unitId',
    parentField: 'parentUnitId',
    fields: [
      {
        label: intl.get('hzero.common.common.status').d('状态'),
        defaultValue: 0,
        name: 'enableFlag',
      },
      {
        label: intl.get('small.common.purchase.buy.unitCode').d('采买组织编码'),
        name: 'unitCode',
      },
      {
        name: 'unitId',
      },
      {
        label: intl.get('small.common.purchase.buy.unitName').d('采买组织名称'),
        name: 'unitName',
      },
      {
        label: intl.get('small.common.purchase.buy.unitLogo').d('采买组织LOGO'),
        name: 'unitIconUrl',
      },
      {
        label: intl.get('hzero.common.btn.action').d('操作'),
        name: 'action',
      },
    ],
    transport: {
      read: () => {
        return {
          url: `/smal/v1/${organizationId}/page-icon-units/list`,
          method: 'GET',
          // transformResponse: (data) => {
          //   return flatUnit(JSON.parse(data));
          // },
        };
      },
      submit: {
        url: `/smal/v1/${organizationId}/page-icon-units`,
        method: 'POST',
      },
    },
  };
}

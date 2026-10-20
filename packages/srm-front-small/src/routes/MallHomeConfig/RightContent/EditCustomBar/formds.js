import { isEmpty } from 'lodash';
import intl from 'utils/intl';

// [2, 3].includes(customType)
export default function formds({ currentRole, unitId, mallType }) {
  return {
    autoCreate: true,
    fields: [
      {
        name: 'customName',
        required: true,
        type: 'intl',
        label: intl.get('small.mallHomeConfig.view.custom.name').d('栏目名称'),
      },
      {
        name: 'location',
        lookupCode: 'SMAL.PAGE_LOCATION',
        required: true,
        label: intl.get('small.mallHomeConfig.view.name.weizhi').d('名称位置'),
      },
      {
        name: 'simpleCustomName',
        required: true,
        type: 'intl',
        label: intl.get('small.mallHomeConfig.view.name.quickName').d('快速定位栏名称'),
        validator: (val) => {
          if (val.length > 6) {
            return intl.get('small.common.view.field.maxLength', { value: 6 }).d(`最大长度为${6}`);
          }
        },
      },
      {
        name: 'imageUrl',
        computedProps: {
          required: ({ record }) => [2, 3].includes(record.get('customType')),
        },
      },
      {
        name: 'imageUrlTwo',
        computedProps: {
          required: ({ record }) => record.get('jumpPage') === 1,
        },
      },
      {
        name: 'moduleType',
        lookupCode: 'SMAL.PAGE_NEW_CUSTOM_TYPE',
      },
      {
        name: 'pageConfigAuthList',
        label: intl.get('small.mallHomeConfig.view.purchase.fenpei').d('采买组织分配'),
        required: currentRole === 'tenant' && mallType !== 'sigl',
        type: 'object',
        textField: 'unitCodeName',
        valueField: 'unitId',
        multiple: true,
        transformResponse: (_, record) => {
          const { pageConfigAuthList } = record;
          const allUnit = {
            unitId: 'ALL',
            unitName: intl.get('small.common.model.allOrganizations').d('所有组织'),
          };
          const list = isEmpty(pageConfigAuthList) ? [allUnit] : pageConfigAuthList;
          return list
            ? list.map((m) => ({
                ...m,
                unitCodeName: m.unitCode ? `${m.unitCode}-${m.unitName}` : m.unitName,
              }))
            : list;
        },
      },
      {
        name: 'productGroupLov',
        type: 'object',
        label: intl.get('small.mallHomeConfig.view.choose.productsRecom').d('选择商品推荐列表'),
        lovCode: 'SMAL.PRODUCT_GROUP_LIST',
        lovPara: {
          belongType: currentRole === 'purchase' ? 1 : 0,
          unitId,
          groupAttribute: mallType === 'sigl' ? 1 : 0,
        },
        computedProps: {
          required: ({ record }) => {
            return record.get('customType') !== 4;
          },
        },
      },
      {
        name: 'productGroupId',
        bind: 'productGroupLov.groupId',
      },
      {
        name: 'productGroupName',
        bind: 'productGroupLov.groupName',
      },
      {
        name: 'jumpPage',
        label: intl.get('small.mallHomeConfig.view.jumpPageFlag').d('跳转二级页面'),
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
      },
      {
        name: 'hotZoneFlag',
        label: intl.get('small.mallHomeConfig.view.hotEnabled').d('启用热区'),
        trueValue: 1,
        falseValue: 0,
        defaultValue: 1,
      },
    ],
  };
}

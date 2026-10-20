import { isEmpty } from 'lodash';
import { SRM_MALL } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { STRICT_URL } from 'utils/regExp';
import intl from 'utils/intl';

export const tableds = () => {
  const organizationId = getCurrentOrganizationId();
  return {
    paging: false,
    autoQuery: false,
    fields: [
      {
        name: 'orderSeq',
        label: intl.get('hzero.common.view.serialNumber').d('序号'),
      },
      {
        name: 'blockTitle',
        label: intl.get('small.mallHomeConfig.view.zhuanqu.Name').d('专区名称'),
      },
      // {
      //   label: intl.get('small.common.model.zhuanqu.sourceFrom').d('专区来源'),
      // },
      {
        name: 'aboutContent',
        label: intl.get('small.mallHomeConfig.view.bannerlist.aboutContent').d('关联内容'),
      },
      {
        name: 'operate',
        label: intl.get('hzero.common.action').d('操作'),
      },
    ],
    transport: {
      destroy: ({ data }) => {
        return {
          url: `${SRM_MALL}/v1/${organizationId}/special-blocks/delete`,
          data: data,
          method: 'DELETE',
        };
      },
    },
  };
};

export const formds = ({ currentRole, mallType }) => {
  return {
    autoCreate: true,
    fields: [
      {
        name: 'fontColor',
        defaultValue: '#000',
      },
      {
        name: 'blockTitle',
        label: intl.get('small.mallHomeConfig.view.zhuanqu.Name').d('专区名称'),
        required: true,
        type: 'intl',
        maxLength: 8,
        // validator: (val) => {
        //   if (val.length > 6) {
        //     return intl.get('small.common.field.maxLength', { value: 6 }).d('最大长度为6');
        //   }
        // },
      },
      {
        name: 'boldFlag',
        label: intl.get('small.mallHomeConfig.view.fontWeightFlag').d('字体加粗'),
        trueValue: 1,
        falseValue: 0,
        // lookupCode: 'HPFM.FLAG',
      },
      {
        name: 'slantFlag',
        label: intl.get('small.mallHomeConfig.view.fontItalicsFlag').d('字体斜体'),
        trueValue: 1,
        falseValue: 0,
        // lookupCode: 'HPFM.FLAG',
      },
      {
        name: 'blockType',
        required: true,
        label: intl.get('small.common.model.zhuanqu.type').d('专区类型'),
        lookupCode: 'SMAL.SPECIAL_BLOCK_TYPE',
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
        name: 'specialBlockAssignList', // 会员购专区增加标签选择
        label: intl.get('small.mallHomeConfig.view.purchase.selectSiglLabel').d('选择会员标签'),
        type: 'object',
        lovCode: 'SIGL.MEMBER_LABEL',
        multiple: true,
        required: currentRole === 'tenant' && mallType === 'sigl',
        lovPara: {
          enabledFlag: 1,
        },
      },
      {
        name: 'quickUrl',
        pattern: STRICT_URL,
        computedProps: {
          required: ({ record }) => {
            return +record.get('blockType') === 2;
          },
        },
        label: intl.get('small.mallHomeConfig.create.fileds.quick.links').d('快速链接'),
      },
      {
        name: 'productGroupLov',
        type: 'object',
        label: intl.get('small.mallHomeConfig.view.choose.productsRecom').d('选择商品推荐列表'),
        lovCode: 'SMAL.PRODUCT_GROUP_LIST',
        lovPara: {
          belongType: currentRole === 'purchase' ? 1 : 0,
          groupAttribute: mallType === 'sigl' ? 1 : 0,
        },
        computedProps: {
          required: ({ record }) => {
            return +record.get('blockType') === 1;
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
        name: 'jumpPageFlag',
        label: intl.get('small.mallHomeConfig.view.jumpPageFlag').d('跳转二级页面'),
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
      },
    ],
  };
};

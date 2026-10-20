import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import { STRICT_URL } from 'utils/regExp';

export const configFormDs = () => {
  return {
    autoCreate: true,
    fields: [
      {
        name: 'speed',
        defaultValue: 3,
        min: 1,
        step: 1,
        label: intl.get('small.mallHomeConfig.view.bannerConfig.speed').d('滚动播报速度(s) '),
      },
    ],
  };
};

export const tableds = ({currentRole}) => {
  return {
    paging: false,
    record: {
      dynamicProps: {
        selectable: record => !(currentRole === 'purchase' && record.get('bannerLevel') === '0'),
      },
    },
    fields: [
      {
        name: 'lineNum',
        label: intl.get('small.mallHomeConfig.view.bannerlist.lineNum').d('序号'),
      },
      {
        name: 'bannerName',
        label: intl.get('small.mallHomeConfig.view.bannerlist.bannerName').d('Banner名称'),
      },
      {
        name: 'bannerLevel',
        label: intl.get('small.mallHomeConfig.view.bannerlist.bannerFrom').d('Banner来源'),
      },
      {
        name: 'productGroupName',
        label: intl.get('small.mallHomeConfig.view.bannerlist.aboutContent').d('关联内容'),
      },
      {
        name: 'operate',
        label: intl.get('hzero.common.action').d('操作'),
      },
    ],
  };
};

export const bannerds = ({ currentRole, unitId, mallType }) => {
  return {
    autoCreate: true,
    fields: [
      {
        name: 'imageUrl',
        required: true,
      },
      {
        name: 'imgaeUrlTwo',
        computedProps: {
          required: ({ record }) => {
            return +record.get('jumpPageFlag') === 1;
          },
        },
      },
      {
        name: 'defaultBackgroundColor',
      },
      {
        name: 'backgroundColor',
        pattern: /^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/,
        computedProps: {
          required: ({ record }) => {
            return +record.get('backgroundColorFlag') === 1;
          },
        },
        label: intl.get('small.mallHomeConfig.view.bannerlist.bgColor').d('首页背景色'),
      },
      {
        name: 'backgroundColorFlag',
        label: intl.get('small.mallHomeConfig.view.backgroundColorFlag').d('自定义首页背景色'),
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
      },
      {
        name: 'jumpPageFlag',
        label: intl.get('small.mallHomeConfig.view.jumpPageFlag').d('跳转二级页面'),
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
      },
      {
        name: 'orderSeq',
        label: intl.get('small.mallHomeConfig.view.bannerlist.lineNum').d('序号'),
      },
      {
        name: 'bannerName',
        required: true,
        type: 'intl',
        label: intl.get('small.mallHomeConfig.view.bannerlist.bannerName').d('Banner名称'),
      },
      {
        name: 'bannerLevel',
        label: intl.get('small.mallHomeConfig.view.bannerlist.bannerFrom').d('Banner来源'),
      },
      {
        name: 'productGroupName',
        label: intl.get('small.mallHomeConfig.view.bannerlist.aboutContent').d('关联内容'),
      },
      {
        name: 'bannerType',
        type: 'string',
        required: true,
        label: intl
          .get('small.mallHomeConfig.create.fileds.ssociated.content.type')
          .d('关联内容类型'),
        lookupCode: 'SMAL.PAGE_NEW_BANNER_TYPE',
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
            return record.get('bannerType') === '4';
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
        name: 'productLov',
        type: 'object',
        label: intl.get('small.mallHomeConfig.view.choose.product').d('选择商品'),
        textField: 'skuName',
        valueField: 'skuId',
        computedProps: {
          required: ({ record }) => {
            return record.get('bannerType') === '1';
          },
        },
      },
      {
        name: 'skuId',
        bind: 'productLov.skuId',
      },
      {
        name: 'skuName',
        bind: 'productLov.skuName',
      },
      {
        name: 'linkUrl',
        pattern: STRICT_URL,
        computedProps: {
          required: ({ record }) => {
            return record.get('bannerType') === '3';
          },
        },
        label: intl.get('small.mallHomeConfig.create.fileds.quick.links').d('快速链接'),
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
        name: 'hotZoneFlag',
        label: intl.get('small.mallHomeConfig.view.hotEnabled').d('启用热区'),
        trueValue: 1,
         falseValue: 0,
        defaultValue: 1,
      },
    ],
  };
};

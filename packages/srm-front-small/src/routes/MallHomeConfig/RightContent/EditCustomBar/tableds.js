/* eslint-disable eqeqeq */
import intl from 'utils/intl';

import { STRICT_URL } from 'utils/regExp';

export default function tableds({ currentRole, unitId, mallType }) {
  return {
    paging: false,
    fields: [
      {
        name: 'orderSeq',
      },
      {
        name: 'lineId',
      },
      {
        name: 'lineNum',
        label: intl.get('small.common.view.seq').d('序号'),
      },
      {
        name: 'moduleName',
        required: true,
        type: 'intl',
        label: intl.get('small.mallHomeConfig.model.moduleName').d('板块名称'),
      },
      {
        name: 'imageUrl',
        required: true,
        label: intl.get('small.common.modal.create.image').d('图片'),
      },
      {
        name: 'moduleType',
        label: intl
          .get('small.mallHomeConfig.create.fileds.ssociated.content.type')
          .d('关联内容类型'),
        required: true,
        lookupCode: 'SMAL.PAGE_NEW_CUSTOM_TYPE',
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
            return record.get('moduleType') == '2';
          },
          disabled: ({ record }) => record.get('moduleType') != '2',
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
        name: 'quickLink',
        label: intl.get('small.mallHomeConfig.create.fileds.quick.links').d('快速链接'),
        pattern: STRICT_URL,
        computedProps: {
          required: ({ record }) => {
            return record.get('moduleType') == '1';
          },
          disabled: ({ record }) => record.get('moduleType') != '1',
        },
      },
      {
        name: 'imageUrlTwo',
        label: intl.get('small.mallHomeConfig.model.webBanner').d('二级页面Banner'),
      },
      {
        name: 'operation',
        label: intl.get('hzero.common.action').d('操作'),
      },
    ],
  };
}

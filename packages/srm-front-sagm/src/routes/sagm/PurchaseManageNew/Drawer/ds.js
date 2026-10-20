// import { math } from 'choerodon-ui/dataset';

import intl from 'utils/intl';

const dimensionDS = (tenantExist) => ({
  paging: false,
  selection: false,
  fields: [
    {
      name: 'dimensionCodeMeaning',
      label: intl.get('sagm.purchaseManageNew.model.dimensionName').d('维度名称'),
    },
    { name: 'dimensionCode' },
    { name: 'customDimensionName' },
    { name: 'dimensionType' },
    { name: 'dimensionId' },
    { name: 'unitDimensionList', ignore: 'always' },
    {
      name: 'showFlag',
      label: intl.get('sagm.purchaseManageNew.model.isShow').d('是否显示'),
      lookupCode: 'HPFM.FLAG ',
      defaultValue: 1,
      required: true,
      dynamicProps: {
        disabled: ({ record }) => {
          return record.get('unitDimensionList') && tenantExist;
        },
      },
    },
    {
      name: 'editFlag',
      label: intl.get('sagm.purchaseManageNew.model.isEdit').d('是否编辑'),
      lookupCode: 'HPFM.FLAG ',
      defaultValue: 1,
      required: true,
      dynamicProps: {
        disabled: ({ record }) => {
          return Number(record.get('showFlag')) === 0;
        },
      },
    },
    {
      name: 'orderSeq',
      label: intl.get('sagm.purchaseManageNew.model.order').d('顺序'),
      type: 'number',
      step: 1,
      min: 0,
      max: 9999999999,
      required: true,
      validator: (val, name, record) => {
        if (record.get('orderRepeat')) {
          return intl.get('sagm.purchaseManageNew.model.orderSeq.validator').d('请勿输入相同顺序');
        }
        return null;
      },
      dynamicProps: {
        disabled: ({ record }) => {
          return record.get('unitDimensionList') && tenantExist;
        },
      },
    },
  ],
  events: {
    update: ({ dataSet, record, name, value, oldValue }) => {
      if (name === 'orderSeq') {
        const otherRecords = dataSet.filter((f) => f.index !== record.index);
        const hasRepeat = otherRecords.some((r) => r.get('orderSeq') === value);
        if (hasRepeat) {
          record.set('orderRepeat', true);
        } else {
          record.set('orderRepeat', false);
        }
        // 序号 2,4,6 => 2,2,2
        // 当前修改项未触发校验时， 遍历其他项，如有重复，取消一个已触发校验的项
        if (!record.get('orderRepeat')) {
          otherRecords.some((r) => {
            if (r.get('orderSeq') === oldValue) {
              r.set('orderRepeat', false);
              // 强行触发validator
              r.set('orderSeq', oldValue);
              return true;
            }
            return false;
          });
        }
      }
      if (name === 'showFlag') {
        if (Number(value) === 0) {
          record.set('editFlag', 0);
        }
      }
    },
  },
});

const elmDS = () => ({
  paging: false,
  selection: false,
  fields: [
    {
      name: 'elementCode',
    },
    {
      name: 'elementCodeMeaning',
    },
    {
      name: 'elementType',
    },
    {
      name: 'orderSeq',
      type: 'number',
    },
  ],
});

const baseConfigDS = () => ({
  fields: [
    {
      name: 'orgSource',
      label: intl.get('sagm.purchaseManageNew.model.orgSource').d('采买组织来源'),
    },
    {
      name: 'customDimension',
      label: intl.get('sagm.purchaseManageNew.model.customDimension').d('自定义维度'),
    },
  ],
});

export { dimensionDS, elmDS, baseConfigDS };

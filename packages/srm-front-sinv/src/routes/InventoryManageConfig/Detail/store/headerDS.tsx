
import intl from 'utils/intl';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { FieldType, FieldIgnore } from 'choerodon-ui/pro/lib/data-set/enum';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SPUC } from '_utils/config';

const organizationId = getCurrentOrganizationId();

// 列表ds
const HeaderDetailDataSet = (create):DataSetProps => ({
    primaryKey: 'strategyHeaderId',
    forceValidate: true,
    autoCreate: create ==="1",
    fields: [
      {
        name: 'strategyCode',
       type: FieldType.string,
        label: intl.get(`sinv.inventoryBench.model.view.strategyCode`).d('类型编码'),
        required: true,
        dynamicProps: {
          disabled: ({ record }) => record.get('dataFlag') === '1',
        },
      },
      {
        name: 'strategyName',
        type: FieldType.intl,
        label: intl.get(`sinv.inventoryBench.model.view.strategyName`).d('类型描述'),
        required: true,
      },
      {
        name: 'cuszDocTmplCodeObj',
       type: FieldType.object,
        label: intl.get(`sinv.inventoryBench.model.view.cuszDocTmplCode`).d('单据样式模版'),
        lovCode: 'HPFM.CUSZ.DOC_TEMPLATE_LAST',
        valueField: 'templateCode',
        textField: 'templateCode',
        dynamicProps: {
          lovPara: ({ record }) => {
            return {
              docCode:
                record.get('processFactory') === 1
                  ? 'SINV_COLLABORATIVE_WORKBENCH_ONE_INVENTORY'
                  : record.get('processFactory') === 2
                  ? 'SINV_COLLABORATIVE_WORKBENCH_TWO_ORDINARY'
                  : 'SINV_COLLABORATIVE_WORKBENCH_ZERO_TRANSFER',
            };
          },
        },
      },
      {
        name: 'cuszDocTmplCode',
       type: FieldType.string,
        bind: 'cuszDocTmplCodeObj.templateCode',
      },
      {
        name: 'processFactory',
        type: FieldType.number,
        lookupCode: 'SPUC.SINV_STOCK_OUT_TYPE',
        label: intl.get(`sinv.inventoryBench.model.view.processFactory`).d('类型属性'),
        required: true,
        dynamicProps: {
          disabled: ({ record }) => record.get('objectVersionNumber'),
        },
      },
      // {
      //   name: 'enableFlag',
      //   type: FieldType.number,
      //   label: intl.get(`sinv.inventoryBench.model.view.enableFlags`).d('启用标记'),
      //   lookupCode: 'HPFM.FLAG',
      //   trueValue: 1,
      //   falseValue: 0,
      //   required: true,
      // },
      {
        name: 'codeRuleLov',
        type: FieldType.object,
        label: intl.get(`sinv.inventoryBench.model.view.codeRule`).d('编码规则'),
        lovCode: 'HMDE.CODE_RULE',
        valueField: 'codeRule',
        textField: 'ruleName',
        ignore: FieldIgnore.always,
      },
      {
        name: 'codeRule',
       type: FieldType.string,
        bind: 'codeRuleLov.ruleCode',
      },
      {
        name: 'ruleName',
       type: FieldType.string,
        bind: 'codeRuleLov.ruleName',
      },
      {
        name: 'creationName',
       type: FieldType.string,
        label: intl.get(`sinv.inventoryBench.model.view.creationName`).d('创建人'),
      },
      {
        name: 'per',
        label: intl.get(`slod.shipmentsConfiguration.model.queryOperate`).d('操作/查询权限角色维护'),
      },
      {
        name: 'action',
        label: intl.get(`sinv.inventoryBench.model.view.action`).d('操作'),
      },
      {
        name: 'cycleRange',
       type: FieldType.string,
        label: intl.get(`sinv.inventoryBench.model.view.cycleRanges`).d('周期范围'),
        lookupCode: 'SPUC.SINV_STOCK_OUT_CYCLE_DIMENSION',
        // required: true,
        dynamicProps: {
          required: ({ record }) =>
            record.get('processFactory') === 1 && record.get('cycleAuto') === 1,
        },
      },
      {
        name: 'cycleDimension',
       type: FieldType.string,
        label: intl.get(`sinv.inventoryBench.model.view.cycleDimension`).d('自动生单维度'),
        lookupCode: 'SPUC.SINV_STOCK_OUT_AUTO_DIMENSION',
        multiple: true,
        valueField: 'value',
        textField: 'meaning',
        transformResponse: (value) => {
          return value && value.split(',');
        },
        transformRequest: (val) => val && val.join(','),
      },
      {
        name: 'cycleAuto',
        type: FieldType.number,
        label: intl.get(`sinv.inventoryBench.model.view.cycleAuto`).d('按周期时间自动生成'),
        lookupCode: 'HPFM.FLAG',
        defaultValue: 0,
      },
      {
        name: 'cycleDate',
        type: FieldType.date,
        label: intl.get(`sinv.inventoryBench.model.view.cycleDate`).d('周期起始日'),
        // required: true,
        dynamicProps: {
          required: ({ record }) =>
            record.get('processFactory') === 1 && record.get('cycleAuto') === 1,
        },
      },
      // {
      //   name: 'cycleConsumeQuantity',
      //  type: FieldType.string,
      //   label: intl
      //     .get(`sinv.inventoryBench.model.view.cycleConsumeQuantity`)
      //     .d('系统自动统计周期内发料/消耗数量'),
      //   lookupCode: 'HPFM.FLAG',
      //   // required: true,
      //   dynamicProps: {
      //     required: ({ record }) => record.get('processFactory') === '1',
      //   },
      // },
    ],
    transport: {
      read: ({ data }) => {
        const { strategyHeaderId } = data?.params;
        return {
          url: `${SRM_SPUC}/v1/${organizationId}/stockout/strategy/${strategyHeaderId}`,
          method: 'GET',
        };
      },
    },
});

export { HeaderDetailDataSet };

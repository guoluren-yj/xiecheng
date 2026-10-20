import intl from 'utils/intl';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';
import { labelTooltipRender } from '@/common/utils';
import { HZERO_SRDM } from '@/common/config';

const organizationId = getCurrentOrganizationId();

function getTableStructureDSProps({ objectId }) {
  return {
    fields: [
      {
        type: 'string',
        name: 'tableName',
        required: true,
        label: intl.get('hpdm.config-object-tbl.model.tableName').d('表名'),
      },
      {
        type: 'string',
        name: 'schemaName',
        required: true,
        label: intl.get('hpdm.config-object-tbl.model.schemaName').d('数据库'),
      },
      {
        type: 'string',
        name: 'objectTblName',
        required: true,
        label: intl.get('hpdm.config-object-tbl.model.objectTblName').d('表名称'),
      },
      {
        type: 'string',
        name: 'objectTblDesc',
        label: intl.get('hpdm.config-object-tbl.model.objectTblDesc').d('表说明'),
      },
      {
        type: 'string',
        name: 'tblPriority',
        required: true,
        label: labelTooltipRender(
          intl.get('hpdm.config-object-tbl.model.tblPriority').d('迁移优先级'),
          intl
            .get('hpdm.config-object-tbl.help.tblPriority')
            .d('同个对象多个表迁移时，优先级值越小优先级别越高')
        ),
      },
      {
        type: 'string',
        name: 'relateType',
        label: labelTooltipRender(
          intl.get('hpdm.config-object-tbl.model.relateType').d('数据别名关联类型'),
          intl
            .get('hpdm.config-object-tbl.help.relateType')
            .d('数据别名关联的类型，SQL则为子查询关联，字段则为当前表字段')
        ),
        lookupCode: 'HPDM.RELATE_TYPE',
      },
      // {
      //   type: 'string',
      //   name: 'displayField',
      //   label: labelTooltipRender(
      //     intl.get('hpdm.config-object-tbl.model.displayField').d('表的显示逻辑(字段/SQl)'),
      //     intl.get('hpdm.config-object-tbl.help.displayField')
      //       .d(`设置数据收集需要展示的字段，便于分配时定位数据来源
      //   字段规范：
      //   <pri>.lov_name
      //   SQL规范：
      //   1、SQL都需要指定表别名，例如：hpfm_lov hl；
      //   2、SQL都需要指定schema，例如：#<hzero_platform>.；
      //   3、SQL都需要关联主SQL，固定使用<pri>.。
      //   例如：
      //   SELECT hl.lov_name
      //     FROM #<hzero_platform>.hpfm_lov hl
      //    WHERE hl.lov_id = <pri>.lov_id
      //   `)
      //   ),
      // },
      {
        type: 'string',
        name: 'displayFieldTitle',
        label: labelTooltipRender(
          '数据别名标题',
          '设置数据的别名title标题，便于提交时定位数据来源'
        ),
      },
      {
        type: 'string',
        name: 'displayFieldDesc',
        label: labelTooltipRender(
          intl.get('hpdm.config-object-tbl.model.displayFieldDesc').d('数据别名字段/SQL'),
          intl.get('hpdm.config-object-tbl.help.displayFieldDesc')
            .d(`设置数据收集需要展示的字段，便于分配时定位数据来源
        字段规范：
        <pri>.lov_name
        SQL规范：
        1、SQL都需要指定表别名，例如：hpfm_lov hl；
        2、SQL都需要指定schema，例如：#<hzero_platform>.；
        3、SQL都需要关联主SQL，固定使用<pri>.。
        例如：
        SELECT hl.lov_name
          FROM #<hzero_platform>.hpfm_lov hl
         WHERE hl.lov_id = <pri>.lov_id
        `)
        ),
      },
      {
        type: 'string',
        name: 'tenantField',
        label: labelTooltipRender(
          intl.get('hpdm.config-object-tbl.model.tenantField').d('租户字段SQL'),
          intl.get('hpdm.config-object-tbl.help.tenantField')
            .d(`设置表的租户编码来源，作为当前迁移表的租户编码
        SQL规范：
        1、SQL都需要指定表别名，例如：hpfm_tenant ht；
        2、SQL都需要指定schema，例如：#<hzero_platform>.；
        3、SQL都需要关联主SQL，固定使用<pri>.。
        例如：
        SELECT ht.tenant_num
          FROM #<hzero_platform>.hpfm_tenant ht
         WHERE hl.tenant_id = <pri>.tenant_id
      `)
        ),
      },
      {
        type: 'string',
        name: 'conditionField',
        label: labelTooltipRender(
          intl.get('srdm.config-object.model.conditionField').d('公有云条件SQL'),
          intl.get('hpdm.config-object-tbl.help.conditionField').d(`设置表的固定条件
            SQL规范：
            1、SQL都需要关联主SQL，固定使用<pri>.。 例如： <pri>.lov_type_code='IDP'；
            2、如果为子查询SQL，需要同一个数据源同一个schema架构。
        `)
        ),
        required: false,
      },
      {
        type: 'string',
        name: 'mainTableSql',
        label: labelTooltipRender(
          intl.get('srdm.config-object.model.mainTableSql').d('主展示表ID关联SQL'),
          intl
            .get('hpdm.config-object-tbl.help.mainTableSql')
            .d(
              `设置表的主展示表 id查询 sql, 根据SQL可以关联出主展示表的 id字段,如果本身就是主展示表, 则无需配置`
            )
        ),
        required: false,
      },
      {
        type: 'string',
        name: 'lastUpdDateField',
        label: labelTooltipRender(
          intl.get('hpdm.config-object-tbl.model.lastUpdDateField').d('表的来源日期关系(SQL)'),
          intl.get('hpdm.config-object-tbl.help.lastUpdDateField')
            .d(`设置表的更新日期来源，作为当前迁移表无last_update_date字段时的时间范围
              SQL规范：
              1、SQL都需要指定表别名，例如：hpfm_tenant ht；
              2、SQL都需要指定schema，例如：#<hzero_platform>.；
              3、SQL都需要关联主SQL，固定使用<pri>.。
              例如：
              SELECT hl.last_update_date
                FROM #<hzero_platform>.hpfm_lov hl
              WHERE hl.lov_id = <pri>.lov_id
          `)
        ),
        required: false,
      },
      {
        type: 'number',
        name: 'updateFlag',
        required: true,
        label: labelTooltipRender(
          intl.get('srdm.config-object.model.updateFlag').d('是否更新'),
          intl
            .get('srdm.config-object.model.help.updateFlag')
            .d(`不存在时都会新增, 这个开关控制是否更新表, 优先级最高`)
        ),
        lookupCode: 'HPDM.Y_N_FLAG',
        defaultValue: 1,
      },
      {
        type: 'number',
        name: 'cacheFlag',
        label: intl.get('hpdm.config-object-tbl.model.cacheFlag').d('是否刷新缓存'),
        lookupCode: 'HPDM.Y_N_FLAG',
        defaultValue: 0,
      },
      {
        type: 'string',
        name: 'cacheMode',
        label: intl.get('hpdm.config-object-tbl.model.cacheMode').d('刷新方式'),
        lookupCode: 'HPDM.CACHE_MODE',
      },
      {
        type: 'string',
        name: 'fullMethod',
        label: intl.get('hpdm.config-object-tbl.model.fullMethod').d('全量刷新'),
      },
      {
        type: 'string',
        name: 'incrementalMethod',
        label: intl.get('hpdm.config-object-tbl.model.incrementalMethod').d('增量刷新'),
      },
      {
        type: 'number',
        name: 'sortFlag',
        required: true,
        label: labelTooltipRender(
          intl.get('srdm.config-object.model.transfer.sortFlag').d('迁移是否排序'),
          intl
            .get('hpdm.config-object-tbl.help.sortFlag')
            .d(
              `设置迁移方式，当按排序处理时，按单条记录进行顺序迁移，避免同对象同表不同表记录之间存在父子依赖`
            )
        ),
        lookupCode: 'HPDM.Y_N_FLAG',
        defaultValue: 0,
      },
      {
        type: 'number',
        name: 'enabledFlag',
        required: true,
        label: intl.get('hpdm.config-object-tbl.model.enabledFlag').d('是否启用'),
        lookupCode: 'HPDM.Y_N_FLAG',
        defaultValue: 1,
      },
      {
        type: 'string',
        name: 'callbackService',
        label: intl
          .get('srdm.config-object.model.callbackService')
          .d('回调服务(服务路由例如 iam, 例如 hpfm)'),
      },
      {
        type: 'string',
        name: 'callbackServiceParam',
        label: intl
          .get('srdm.config-object.model.callbackServiceParam')
          .d('回调参数(JSON),测试回调到本地, 配置x-virtual-env=UUAP'),
      },
      {
        type: 'number',
        name: 'publicCloudFlag',
        required: true,
        label: intl.get('srdm.config-object.model.publicCloudFlag').d('公有云是否迁移'),
        lookupCode: 'HPDM.Y_N_FLAG',
        defaultValue: 0,
      },
      {
        type: 'number',
        name: 'multiCloudFlag',
        required: true,
        label: intl.get('srdm.config-object.model.multiCloudFlag').d('多云是否迁移'),
        lookupCode: 'HPDM.Y_N_FLAG',
        defaultValue: 0,
      },
      {
        type: 'number',
        name: 'srmTenantFlag',
        required: true,
        label: intl.get('srdm.config-object.model.srmTenantFlag').d('SRM租户(0租户)数据'),
        lookupCode: 'HPDM.Y_N_FLAG',
        defaultValue: 0,
      },
      {
        type: 'number',
        name: 'multiCloudTenantFlag',
        required: true,
        label: intl.get('srdm.config-object.model.multiCloudTenantFlag').d('多云租户数据'),
        lookupCode: 'HPDM.Y_N_FLAG',
        defaultValue: 0,
      },
      {
        type: 'string',
        name: 'multiCloudBehavior',
        label: intl.get('srdm.config-object.model.multiCloudBehavior').d('更新到多云行为'),
        lookupCode: 'SRDM.MULTI_CLOUD_BEHAVIOR',
      },
      {
        type: 'string',
        name: 'multiCloudConditionField',
        label: intl
          .get('srdm.config-object.model.multiCloudConditionField')
          .d('多云条件SQL,tl表可不配置,自动使用主表配置'),
      },
      {
        type: 'number',
        name: 'postFlag',
        label: intl.get('hpdm.config-object-tbl.model.postFlag').d('是否后置逻辑'),
        lookupCode: 'HPDM.Y_N_FLAG',
        defaultValue: 0,
      },
      {
        type: 'string',
        name: 'postMethod',
        label: intl.get('hpdm.config-object-tbl.model.postMethod').d('后置逻辑'),
      },
    ],
    autoQuery: true,
    autoCreate: false,
    queryFields: [
      {
        type: 'string',
        name: 'tableName',
        label: intl.get('hpdm.config-object-tbl.model.tableName').d('表名'),
      },
      {
        type: 'number',
        name: 'multiCloudFlag',
        label: intl.get('srdm.config-object.model.multiCloudFlag').d('多云是否迁移'),
        lookupCode: 'HPDM.Y_N_FLAG',
      },
      {
        type: 'number',
        name: 'publicCloudFlag',
        label: intl.get('srdm.config-object.model.publicCloudFlag').d('公有云是否迁移'),
        lookupCode: 'HPDM.Y_N_FLAG',
      },
    ],
    transport: {
      read: (config) => {
        const { data, params } = config;
        const url = isTenantRoleLevel()
          ? `${HZERO_SRDM}/v1/${organizationId}/hpdm-config-object-tbls/query?objectId=${objectId}`
          : `${HZERO_SRDM}/v1/hpdm-config-object-tbls/query?objectId=${objectId}`;
        return {
          data,
          params,
          url,
          method: 'GET',
        };
      },
      submit: ({ data }) => {
        return {
          data,
          url: isTenantRoleLevel()
            ? `${HZERO_SRDM}/v1/${organizationId}/hpdm-config-object-tbls/createAndUpdate`
            : `${HZERO_SRDM}/v1/hpdm-config-object-tbls/createAndUpdate`,
          method: 'POST',
        };
      },
      destroy: ({ data }) => {
        return {
          data,
          url: isTenantRoleLevel()
            ? `${HZERO_SRDM}/v1/${organizationId}/hpdm-config-object-tbls/deleteTblAndField`
            : `${HZERO_SRDM}/v1/hpdm-config-object-tbls/deleteTblAndField`,
          method: 'POST',
        };
      },
    },
    events: {},
  };
}

export default getTableStructureDSProps;

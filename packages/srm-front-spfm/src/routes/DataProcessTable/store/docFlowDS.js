/*
 * @Description:
 * @Version: 2.0
 * @Autor: lhl
 * @Date: 2021-08-23 17:22:00
 * @LastEditors: lhl
 * @LastEditTime: 2021-09-09 17:27:18
 */
import intl from 'utils/intl';
import { SRM_DATA_PROCESS } from '_utils/config';

// 获取当前用户的租户ID

// ds配置，
export default function getTableDocFlowDs() {
  return {
    // 指定 DataSet 初始化后自动查询  请求transport中的指定接口的数据
    autoQuery: true,
    // 初始化时，如果没有记录且 autoQuery 为 false，则自动创建记录
    autoCreate: true,
    fields: [
      {
        name: 'nodeDefinitionCode',
        type: 'string',
        label: intl.get('spfm.dataProcessTable.model.table.nodeDefinitionCode').d('节点code'),
      },
      {
        name: 'tableCode',
        type: 'string',
        label: intl.get('spfm.dataProcessTable.model.table.tableCode').d('表名'),
      },
      {
        name: 'tableName',
        type: 'string',
        label: intl.get('spfm.dataProcessTable.model.table.tableName').d('表描述'),
      },
      // {
      //   name: 'tableFieldConfiguration',
      //   type: 'string',
      //   label: intl.get('trainee.order.model.table.tableFieldConfiguration').d('表字段配置'),
      //   // lookupCode: 'SCUX.ST.SO_STATUS_34431',
      // },
      {
        name: 'mainTableFlag',
        type: 'number',
        label: intl
          .get('spfm.dataProcessTable.model.table.mainTableFlag')
          .d('是否为节点展示主体表'),
      },
      {
        name: 'tableFieldSet',
        type: 'string',
        label: intl.get('spfm.dataProcessTable.model.table.tableFieldSet').d('表配置'),
      },
    ],

    // 2视频  35.0
    transport: {
      read: {
        url: `${SRM_DATA_PROCESS}/v1/node-table-rels`,
        method: 'get',
      },
      update: ({ data }) => {
        return {
          url: `${SRM_DATA_PROCESS}/v1/node-table-rels`,
          method: 'put',
          data: data[0],
        };
      },
      create: ({ data }) => {
        return {
          url: `${SRM_DATA_PROCESS}/v1/node-table-rels`,
          method: 'POST',
          data: data[0],
        };
      },
      destroy: ({ data }) => {
        return {
          url: `${SRM_DATA_PROCESS}/v1/node-table-rels`,
          method: 'delete',
          data: data[0],
        };
      },
    },
  };
}

import React, { PureComponent } from 'react';
import { Form } from 'hzero-ui';
import { routerRedux } from 'dva/router';
import { dateRender } from 'utils/renderer';

import intl from 'utils/intl';
import EditTable from 'components/EditTable';
import { tableScrollWidth } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';

@Form.create({ fieldNameProp: null })
@formatterCollections({
  code: ['sqam.quoteIncomingInspection'],
})
class SourceInfoPanel extends PureComponent {
  render() {
    const {
      dispatch,
      loading = false,
      dataSource = [],
      rowSelection = null,
      prefixToPath = '',
      backPath = '/sqam/incoming-inspection-query/list',
      customizeTable,
      code,
    } = this.props;
    const promptCode = 'sqam.quoteIncomingInspection.model.quoteIncomingInspection';
    const columns = [
      {
        title: intl.get(`${promptCode}.inspectionNum`).d('检验单号'),
        width: 200,
        fixed: 'left',
        dataIndex: 'inspectionNum',
        render: (val, record) => (
          <a
            onClick={() =>
              dispatch(
                routerRedux.push({
                  pathname: `/sqam${prefixToPath}/incoming-inspection-query/detail/${record.inspectionId}`,
                  state: { backPath },
                })
              )
            }
          >
            {val}
          </a>
        ),
      },
      {
        title: intl.get(`entity.item.code`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 150,
        fixed: 'left',
      },
      {
        title: intl.get(`entity.item.name`).d('物料名称'),
        dataIndex: 'itemName',
        fixed: 'left',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.assessmentResult`).d('评估结果'),
        dataIndex: 'assessmentResultMeaning',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.decisionResult`).d('决策结果'),
        dataIndex: 'decisionResultMeaning',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.poNum`).d('采购订单编号'),
        dataIndex: 'poNum',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.transactionNum`).d('事务编号'),
        dataIndex: 'transactionNum',
        width: 150,
      },

      {
        title: intl.get(`hzero.common.date.creation`).d('创建日期'),
        dataIndex: 'creationDate',
        width: 150,
        render: dateRender,
      },
      {
        title: intl.get(`${promptCode}.startDate`).d('检验开始日期'),
        dataIndex: 'startDate',
        width: 150,
        render: dateRender,
      },
      {
        title: intl.get(`${promptCode}.endDate`).d('检验结束日期'),
        dataIndex: 'endDate',
        width: 150,
        render: dateRender,
      },
    ];
    return customizeTable(
      { code },
      <EditTable
        bordered
        rowKey="inspectionId"
        loading={loading}
        columns={columns}
        dataSource={dataSource}
        rowSelection={rowSelection}
        scroll={{ x: tableScrollWidth(columns) }}
      />
    );
  }
}
export default SourceInfoPanel;

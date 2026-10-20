import React, { PureComponent } from 'react';
import { Table } from 'hzero-ui';
import { isNumber, sum } from 'lodash';
import intl from 'utils/intl';
// import { dateRender } from 'utils/renderer';
import { dateRender } from 'utils/renderer';
import queryString from 'querystring';

/**
 * 年度考评结果列表
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Object} dataSource - 数据源
 * @reactProps {Boolean} loading - 加载状态
 * @reactProps {Object} pagination - 分页器
 * @return React.element
 */
export default class EvaluationList extends PureComponent {
  /**
   * @returns React.element
   */
  render() {
    const {
      evalLoading = false,
      // evalPagination = {},
      evalDataSource = [],
      // onChange = (e) => e,
      history,
      pageSource = '',
    } = this.props;
    const columns = [
      {
        title: intl.get(`sslm.evaluationQuery.model.archive.status`).d('档案状态'),
        dataIndex: 'evalStatusMeaning',
        width: 120,
      },
      {
        title: intl.get(`sslm.evaluationQuery.model.archive.num`).d('档案编码'),
        dataIndex: 'evalNum',
        width: 140,
        render: (val, record) => {
          const { evalStatus, evalHeaderId, evalGranularity, tenantId } = record;
          // 【质量整改反馈】【我收到的质量整改】仅「已发布」供应商可跳转，其他状态仅查询）
          const check = ['feedback8D', 'received8D'].includes(pageSource)
            ? ['PUBLISHED'].includes(evalStatus)
            : true;
          return check ? (
            <a
              onClick={() => {
                const pathSource = ['feedback8D', 'received8D'].includes(pageSource)
                  ? 'received-query'
                  : 'evaluation-query';

                history.push({
                  pathname: `/sslm/${pathSource}/detail/${evalHeaderId}`,
                  search: queryString.stringify({ evalGranularity, partnerTenantId:tenantId }),
                });
              }}
            >
              {val}
            </a>
          ) : (
            val
          );
        },
      },
      {
        title: intl.get(`sslm.evaluationQuery.model.archive.describe`).d('档案描述'),
        dataIndex: 'evalName',
        width: 200,
      },
      {
        title: intl.get(`sslm.evaluationQuery.model.evaluation.cycle`).d('考评周期'),
        dataIndex: 'evalCycleMeaning',
        width: 150,
      },
      {
        title: intl.get(`sslm.evaluationQuery.model.evaluation.startDate`).d('考评日期从'),
        dataIndex: 'evalDateFrom',
        render: dateRender,
        width: 150,
      },
      {
        title: intl.get(`sslm.evaluationQuery.model.evaluation.endDate`).d('考评日期至'),
        dataIndex: 'evalDateTo',
        render: dateRender,
        width: 150,
      },
      {
        title: intl.get(`sslm.evaluationQuery.model.evaluation.charger`).d('考评负责人'),
        dataIndex: 'processUserName',
        width: 150,
      },
    ];

    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 150)));
    return (
      <Table
        bordered
        rowKey="problemHeaderId"
        columns={columns}
        dataSource={evalDataSource}
        // pagination={evalPagination}
        scroll={{ x: scrollX }}
        loading={evalLoading}
        pagination={false}
        // rowSelection={rowSelection}
        // onChange={page => onChange(page)}
      />
    );
  }
}

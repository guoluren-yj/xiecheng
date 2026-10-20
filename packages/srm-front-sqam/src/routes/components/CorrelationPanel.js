import React, { Component, Fragment } from 'react';
import { Form, Popover } from 'hzero-ui';
import intl from 'utils/intl';
import { connect } from 'dva';
import { Link } from 'dva/router';

import { dateRender } from 'utils/renderer';
import { getCurrentOrganizationId } from 'utils/utils';
import EditTable from 'components/EditTable';

@connect(({ create8D }) => ({
  create8D,
  tenantId: getCurrentOrganizationId(),
}))
@Form.create({ fieldNameProp: null })
export default class CorrelationPanel extends Component {
  onChangePage = (page = {}) => {
    const { fetchCorrelation } = this.props;
    if (fetchCorrelation) fetchCorrelation(page);
  };

  render() {
    const {
      dataSource = [],
      loading,
      supplier = false,
      backPath,
      customizeTable,
      customCode,
      pagination,
    } = this.props;
    const columns = [
      {
        title: intl.get('sqam.common.model.qualityRectification.code').d('整改报告编号'),
        dataIndex: 'problemNum',
        width: 150,
        fixed: 'left',
        render: (val, record) => (
          <Link
            to={{
              pathname: supplier
                ? `/sqam/received8D/detail/${record.associateProblemHeaderId}`
                : `/sqam/initiated8D/detail/${record.associateProblemHeaderId}`,
              state: { backPath },
            }}
          >
            {val}
          </Link>
        ),
      },
      {
        title: intl.get('sqam.common.model.qualityRectification.title').d('整改报告标题'),
        dataIndex: 'problemTitle',
        width: 200,
        fixed: 'left',
      },
      {
        title: intl.get('entity.item.code').d('物料编码'),
        dataIndex: 'itemCode',
        width: 120,
      },
      {
        title: intl.get('entity.item.name').d('物料名称'),
        dataIndex: 'itemName',
        width: 120,
      },
      {
        title: intl.get('hzero.common.date.creation').d('创建日期'),
        dataIndex: 'creationDate',
        render: dateRender,
        width: 120,
      },
      {
        title: intl.get('entity.roles.creator').d('创建人'),
        dataIndex: 'createdName',
        width: 120,
      },
      {
        title: intl.get('entity.company.tag').d('公司'),
        dataIndex: 'companyName',
        width: 150,
      },
      {
        title: intl.get(`entity.business.tag`).d('业务实体'),
        dataIndex: 'ouName',
        width: 120,
      },
      {
        title: intl.get('entity.organization.class.inventory').d('库存组织'),
        dataIndex: 'invOrganizationName',
        width: 120,
      },
      {
        title: intl.get(`sqam.common.model.qualityRectification.sourceNum`).d('来源单据编号'),
        dataIndex: 'sourceNum',
        width: 120,
        render: (val) => <Popover content={val}>{val}</Popover>,
      },
      {
        title: intl.get(`sqam.common.model.8d.problemDetail`).d('问题详述'),
        dataIndex: 'problemDetail',
        width: 120,
      },
    ];
    return (
      <Fragment>
        {customizeTable ? (
          customizeTable(
            {
              code: customCode,
            },
            <EditTable
              loading={loading}
              columns={columns}
              bordered
              rowKey="problemTeamId"
              dataSource={dataSource}
              pagination={pagination || false}
              onChange={this.onChangePage}
            />
          )
        ) : (
          <EditTable
            loading={loading}
            columns={columns}
            bordered
            rowKey="problemTeamId"
            dataSource={dataSource}
            pagination={pagination || false}
            onChange={this.onChangePage}
          />
        )}
      </Fragment>
    );
  }
}

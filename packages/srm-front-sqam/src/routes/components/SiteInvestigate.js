import React, { PureComponent } from 'react';
import { Form } from 'hzero-ui';
import intl from 'utils/intl';
import { withRouter } from 'react-router-dom';
import EditTable from 'components/EditTable';
import { tableScrollWidth } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import { Bind } from 'lodash-decorators';
import { dateTimeRender } from 'utils/renderer';

@Form.create({ fieldNameProp: null })
@formatterCollections({
  code: ['sslm.siteInvestigateReport'],
})
@withRouter
class SiteInvestigate extends PureComponent {
  @Bind()
  handleJumpDetail(record) {
    const { history } = this.props;
    const { evalHeaderId, evalType, evalStatus } = record;
    history.push(
      `/sslm/site-investigate-report/result/detail/${evalHeaderId}/${evalType}/${evalStatus}`
    );
  }

  render() {
    const { loading = false, dataSource = [] } = this.props;

    const columns = [
      {
        title: intl.get('hzero.common.status').d('状态'),
        dataIndex: 'evalStatusMeaning',
        width: 100,
      },
      {
        title: intl.get('sslm.siteInvestigateReport.modal.mange.code').d('考察报告编码'),
        dataIndex: 'evalNum',
        width: 150,
        render: (value, record) => <a onClick={() => this.handleJumpDetail(record)}>{value}</a>,
      },
      {
        title: intl.get('sslm.siteInvestigateReport.modal.mange.describe').d('考察报告描述'),
        dataIndex: 'evalDescription',
      },
      {
        title: intl.get('sslm.siteInvestigateReport.modal.mange.supplierName').d('供应商'),
        width: 200,
        dataIndex: 'supplierName',
      },
      {
        title: intl.get('sslm.siteInvestigateReport.modal.mange.company').d('公司'),
        dataIndex: 'companyName',
        width: 200,
      },
      {
        title: intl.get('sslm.siteInvestigateReport.modal.mange.template').d('考察模板'),
        dataIndex: 'evalTplName',
        width: 200,
      },
      {
        title: intl.get('sslm.siteInvestigateReport.modal.mange.score').d('得分'),
        width: 100,
        dataIndex: 'finalScore',
      },
      {
        title: intl.get('sslm.siteInvestigateReport.modal.mange.grade').d('等级'),
        width: 100,
        dataIndex: 'grade',
      },
      {
        title: intl.get('sslm.siteInvestigateReport.modal.mange.approvedDate').d('审批时间'),
        width: 160,
        dataIndex: 'approvedDate',
        render: dateTimeRender,
      },
      {
        title: intl.get('sslm.siteInvestigateReport.modal.mange.creationDate').d('创建时间'),
        dataIndex: 'creationDate',
        width: 160,
        render: dateTimeRender,
      },
      {
        title: intl.get('sslm.siteInvestigateReport.modal.mange.createdBy').d('创建人'),
        dataIndex: 'realName',
        width: 120,
      },
    ];

    return (
      <EditTable
        bordered
        loading={loading}
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        scroll={{ x: tableScrollWidth(columns) }}
      />
    );
  }
}
export default SiteInvestigate;

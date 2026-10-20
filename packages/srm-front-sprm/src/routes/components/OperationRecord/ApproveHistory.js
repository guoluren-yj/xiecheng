import React, { PureComponent } from 'react';
import { Table, Tag } from 'hzero-ui';

import UploadModal from 'srm-front-boot/lib/components/Upload';

import request from 'utils/request';
import intl from 'utils/intl';

import { dateTimeRender } from 'utils/renderer';
import { tableScrollWidth, getCurrentOrganizationId, getResponse } from 'utils/utils';
import { BKT_HWFP } from 'utils/config';
import { SRM_SPRM } from '_utils/config';
import { approveNameRender } from 'hzero-front-hwfp/lib/utils/util';
import formatterCollections from 'utils/intl/formatterCollections';

const organizationId = getCurrentOrganizationId();

@formatterCollections({
  code: ['hwfp.common'],
})
export default class ApproveHistory extends PureComponent {
  constructor(props) {
    super();
    if (props.onRef) props.onRef(this);
    this.state = {};
  }

  componentDidMount() {
    const {
      record: { prHeaderId },
    } = this.props;
    this.queryApproveRecords({ prHeaderId }).then((res = []) => {
      if (getResponse(res)) {
        const allHistoricTaskExtList = res?.map(ele => ele.historicTaskExtList);
        this.setState({
          dataSource: [].concat(...allHistoricTaskExtList),
          loading: false,
        });
      }
    });
  }

  queryApproveRecords(params = {}) {
    const { prHeaderId } = params;
    this.setState({
      loading: true,
    });
    return request(
      `${SRM_SPRM}/v1/${organizationId}/purchase-requests/prHeader/list-history-approval`,
      {
        method: 'GET',
        query: { prHeaderId },
      }
    );
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { dataSource = [], loading = false } = this.state;
    const columns = [
      {
        title: intl.get('hwfp.common.model.approval.time').d('审批时间'),
        dataIndex: 'endTime',
        width: 180,
        render: dateTimeRender,
      },
      {
        title: intl.get('hwfp.common.model.approval.action').d('审批动作'),
        dataIndex: 'action',
        width: 120,
        render: (action, record) => {
          if (action && action.includes('EXTERNAL_APPROVAL_')) {
            const [, externalActionMeaning] = action.split('EXTERNAL_APPROVAL_');
            return ['approved', 'rejected'].includes(externalActionMeaning.toLowerCase()) ? (
              approveNameRender(externalActionMeaning)
            ) : (
              <Tag>{externalActionMeaning}</Tag>
            );
          } else if (action) {
            return approveNameRender(action);
          } else if (record.actType === 'startEvent') {
            return <Tag color="volcano">{intl.get('hwfp.common.status.start').d('开始')}</Tag>;
          } else if (record.actType === 'endEvent') {
            return <Tag>{intl.get('hwfp.common.status.end').d('结束')}</Tag>;
          } else if (record.actType) {
            return <Tag>{intl.get('hwfp.common.view.message.approvaling').d('审批中')}</Tag>;
          } else {
            return '';
          }
        },
      },
      {
        title: intl.get('hwfp.common.model.approval.step').d('审批环节'),
        dataIndex: 'name',
        width: 150,
      },
      {
        title: intl.get('hwfp.common.model.approval.owner').d('审批人'),
        dataIndex: 'assigneeName',
        width: 150,
      },
      {
        title: intl.get('hwfp.common.model.approval.opinion').d('审批意见'),
        dataIndex: 'comment',
        width: 150,
      },
      {
        title: intl.get('hwfp.common.model.approval.file').d('附件'),
        dataIndex: 'attachmentUuid',
        fixed: 'right',
        width: 100,
        render: (val, record) => {
          if (record.attachmentUuid) {
            return (
              <UploadModal
                attachmentUUID={val}
                bucketName={BKT_HWFP}
                bucketDirectory="hwfp01"
                viewOnly
              />
            );
          }
        },
      },
    ];
    return (
      <Table
        bordered
        rowKey="taskDefinitionKey"
        loading={loading}
        pagination={false}
        dataSource={dataSource}
        columns={columns}
        scroll={{ x: tableScrollWidth(columns) }}
      />
    );
  }
}

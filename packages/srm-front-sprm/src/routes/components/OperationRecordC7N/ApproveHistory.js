import React, { PureComponent } from 'react';
import { Tag } from 'hzero-ui';

// import UploadModal from 'srm-front-boot/lib/components/Upload';
import { Table, DataSet } from 'choerodon-ui/pro';

import request from 'utils/request';
import intl from 'utils/intl';

import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { SRM_SPRM } from '_utils/config';
import { approveNameRender } from 'hzero-front-hwfp/lib/utils/util';
import formatterCollections from 'utils/intl/formatterCollections';
import { workHistoryDs } from './operationDs';

const organizationId = getCurrentOrganizationId();

@formatterCollections({
  code: ['hwfp.common'],
})
export default class ApproveHistory extends PureComponent {
  constructor(props) {
    super();
    if (props.onRef) props.onRef(this);
    this.historyList = new DataSet(workHistoryDs());
    this.state = {};
  }

  componentDidMount() {
    const {
      record: { prHeaderId },
    } = this.props;
    this.queryApproveRecords({ prHeaderId }).then((res = []) => {
      if (getResponse(res)) {
        const allHistoricTaskExtList = res?.map(ele => ele.historicTaskExtList);
        this.setState(
          {
            loading: false,
          },
          () => {
            this.historyList.loadData([].concat(...allHistoricTaskExtList));
          }
        );
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
    const { loading = false } = this.state;
    const columns = [
      {
        name: 'endTime',
        width: 180,
      },
      {
        name: 'action',
        width: 120,
        renderer: ({ value, record }) => {
          if (value) {
            return approveNameRender(value);
          } else if (record.get('actType') === 'startEvent') {
            return <Tag color="volcano">{intl.get('hwfp.common.status.start').d('开始')}</Tag>;
          } else if (record.get('actType') === 'endEvent') {
            return <Tag>{intl.get('hwfp.common.status.end').d('结束')}</Tag>;
          } else if (record.get('actType')) {
            return <Tag>{intl.get('hwfp.common.view.message.approvaling').d('审批中')}</Tag>;
          } else {
            return '';
          }
        },
      },
      { name: 'name', width: 150 },
      { name: 'assigneeName', width: 150 },
      { name: 'comment', width: 150 },
      {
        name: 'attachmentUuid',
        width: 100,
        // renderer: ({ value }) => {
        //   if (value) {
        //     return (
        //       <UploadModal
        //         attachmentUUID={value}
        //         bucketName={BKT_HWFP}
        //         bucketDirectory="hwfp01"
        //         viewOnly
        //       />
        //     );
        //   }
        // },
      },
    ];
    return (
      <Table
        bordered
        rowKey="taskDefinitionKey"
        loading={loading}
        columns={columns}
        dataSet={this.historyList}
      />
    );
  }
}

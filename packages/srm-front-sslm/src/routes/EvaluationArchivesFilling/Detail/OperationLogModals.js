import React, { Component } from 'react';
import { Modal, Tabs, Tag } from 'hzero-ui';
import { sum, isNumber, head, isEmpty } from 'lodash';
import intl from 'utils/intl';
import EditTable from 'components/EditTable';
import { getResponse } from 'utils/utils';
import { dateTimeRender, approveNameRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';
import { queryApproveRecords } from '@/services/commonService';

const { TabPane } = Tabs;

/**
 *考评档案填制 操作记录 组件
 *
 * @export
 * @class DetailModal
 * @extends {Component} - React.element
 * @reactProps {boolean} visible - modal 是否可以
 * @reactProps {object} modalData - modal 中表格的数据源
 * @reactProps {object} pagination - modal 中表格的分页数据
 * @reactProps {function} onLoad - 加载 modal 中的数据的方法
 * @reactProps {function} onClose - 关闭 modal 的方法
 * @returns React.element
 */
@formatterCollections({
  code: ['sslm.supplierDocManage', 'sslm.common'],
})
export default class DetailModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: '',
      rowKey: null,
      columns: [],
      dataSource: [],
      approveDataSource: [],
    };
  }

  /**
   *react 组件更新
   * @memberof DetailModal
   */
  componentDidUpdate(prevProps) {
    const { modalCode = '', onLoad, visible, evalHeaderId } = this.props;
    if (!prevProps.visible && visible) {
      onLoad(modalCode).then(() => {
        this.setModalProps(modalCode);
      });
      // 查询工作流审批记录
      queryApproveRecords({
        documentId: evalHeaderId,
        documentType: 'KPI_EVAL_SUBMIT',
      }).then(response => {
        const res = getResponse(response);
        if (res) {
          const newData = isEmpty(res)
            ? []
            : head(head(res).approvalHistories).historicTaskExtList.reverse();
          this.setState({ approveDataSource: newData });
        }
      });
    }
  }

  setModalProps = (modalCode = '') => {
    const { modalData = [] } = this.props;
    let dataSource = [];
    const rowKeyObj = {
      viewLog: 'evalOprHistoryId',
    };
    const titleObj = {
      viewLog: intl.get(`sslm.supplierDocManage.model.docManage.activityLog`).d('操作记录'),
    };
    const colsObj = {
      viewLog: [
        {
          title: intl.get(`sslm.supplierDocManage.model.docManage.activityPerson`).d('操作人'),
          dataIndex: 'operatedName',
          width: 150,
        },
        {
          title: intl.get(`sslm.supplierDocManage.model.docManage.activityTime`).d('操作时间'),
          dataIndex: 'operatedDate',
          width: 170,
          render: dateTimeRender,
        },
        {
          title: intl.get('hzero.common.button.action').d('操作'),
          dataIndex: 'operationCodeMeaning',
          width: 150,
        },
        {
          title: intl.get('sslm.common.model.operate.remark').d('操作说明'),
          dataIndex: 'operatedRemark',
        },
      ],
    };
    dataSource = modalData;

    this.setState({
      title: titleObj[modalCode] || null,
      rowKey: rowKeyObj[modalCode] || null,
      columns: colsObj[modalCode] || null,
      dataSource,
    });
  };

  onCell() {
    return {
      style: {
        overflow: 'hidden',
        maxWidth: 120,
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
      onClick: e => {
        const { target } = e;
        if (target.style.whiteSpace === 'normal') {
          target.style.whiteSpace = 'nowrap';
        } else {
          target.style.whiteSpace = 'normal';
        }
      },
    };
  }

  /**
   * 关闭 Modal
   */
  handleClose = () => {
    const { onClose = e => e } = this.props;
    this.setState({
      dataSource: [],
      columns: [],
    });
    onClose();
  };

  /**
   * 分页change事件
   */
  handleChange = (pagination = {}) => {
    const { onLoad, modalCode } = this.props;
    onLoad(modalCode, pagination).then(() => {
      this.setModalProps(modalCode);
    });
  };

  /**
   * @return React.element
   */
  render() {
    const { title, columns, dataSource, rowKey, approveDataSource } = this.state;
    const { visible, modalPagination, loading } = this.props;
    const scrollX = sum(columns.map(n => (isNumber(n.width) ? n.width : 150)));
    const actionType = {
      startEvent: intl.get('hzero.common.text.startEvent').d('开始'),
      userTask: intl.get('hzero.common.text.userTask').d('审批中'),
      endEvent: intl.get('hzero.common.text.endEvent').d('结束'),
    };
    const reviewColumns = [
      {
        key: 'name',
        title: intl.get('sslm.operatingRecord.model.approveHistory.approvalNode').d('审批节点'),
        dataIndex: 'name',
        render: (val, { actType }) => val || actionType[actType],
      },
      {
        key: 'action',
        title: intl.get('sslm.operatingRecord.model.approveHistory.action').d('审批动作'),
        dataIndex: 'action',
        render: (action, { actType }) => {
          if (action) {
            return approveNameRender(action);
          } else if (actType === 'startEvent') {
            return <Tag color="green">{intl.get('hwfp.common.status.start').d('开始')}</Tag>;
          } else if (actType === 'endEvent') {
            return <Tag>{intl.get('hwfp.common.status.end').d('结束')}</Tag>;
          } else if (actType) {
            return <Tag>{intl.get('hwfp.common.view.message.approvaling').d('审批中')}</Tag>;
          } else {
            return '';
          }
        },
      },
      {
        key: 'assigneeName',
        title: intl.get('sslm.operatingRecord.model.approveHistory.assigneeName').d('审批人'),
        dataIndex: 'assigneeName',
      },
      {
        key: 'comment',
        title: intl.get('sslm.operatingRecord.model.approveHistory.comment').d('审批意见'),
        dataIndex: 'comment',
      },
      {
        key: 'endTime',
        title: intl.get('sslm.operatingRecord.model.approveHistory.assigneeDate').d('审批时间'),
        dataIndex: 'endTime',
        render: dateTimeRender,
      },
    ];

    return (
      <Modal title={title} visible={visible} onCancel={this.handleClose} footer={null} width={900}>
        <Tabs animated={false} defaultActiveKey="operationRecord">
          <TabPane
            tab={intl.get('sslm.operatingRecord.view.operatingRecord.record').d('操作记录')}
            key="operationRecord"
          >
            <EditTable
              columns={columns}
              dataSource={dataSource}
              bordered
              loading={loading}
              pagination={modalPagination}
              onChange={page => this.handleChange(page)}
              rowKey={rowKey}
              scroll={{ x: scrollX }}
            />
          </TabPane>
          <TabPane
            tab={intl.get('sslm.operatingRecord.view.reviewRecord.record').d('审批记录')}
            key="reviewRecord"
          >
            <EditTable
              bordered
              rowKey="recordId"
              loading={loading}
              pagination={null}
              columns={reviewColumns}
              dataSource={approveDataSource}
            />
          </TabPane>
        </Tabs>
      </Modal>
    );
  }
}

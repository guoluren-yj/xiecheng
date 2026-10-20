import React, { PureComponent } from 'react';
import { Table, Modal, Tooltip } from 'hzero-ui';
import { Bind, Debounce } from 'lodash-decorators';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';

export default class ExectModal extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: [],
    };
  }

  componentDidMount() {
    const { pcHeaderId } = this.props;
    if (pcHeaderId) {
      this.handleSearchExect({ pcHeaderId });
    }
  }

  /**
   * 查询导入
   * @param {Object, Number} { page = {}, asnHeaderId }
   * @returns Promise
   */
  @Bind()
  handleSearchExect({ pcHeaderId }) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'purchaseContractView/queryPushExternalSystemData',
      payload: pcHeaderId,
    }).then((res) => {
      if (res) {
        const dataSource = res;
        this.setState({
          // pagination,
          dataSource: dataSource || [],
        });
      }
    });
  }

  @Bind()
  @Debounce(500)
  syncAlignModal(record) {
    const { dispatch, recordList, remote } = this.props;
    const { importType } = record;
    const params =
      importType === 'SYNC_CONTRACT_TO_RECEIPT'
        ? {
            type: 'purchaseContractView/triggerPush',
            payload: [recordList],
          }
        : {
            type: 'purchaseContractView/againPushExternalSystemData',
            payload: record,
          };
    const promiseFunc = remote
      ? remote.process('SPCM_PUR_CONTRACT_VIEW_LIST_EXECTMODAL_SYNCAlIGN', () => dispatch(params), {
          record,
          current: this,
        })
      : () => dispatch(params);
    promiseFunc().then((res) => {
      if (getResponse(res)) {
        const { pcHeaderId } = this.props;
        this.handleSearchExect({
          pcHeaderId,
        });
      }
    });
  }

  render() {
    const { dataSource } = this.state;
    const { loading, hideModal, visible } = this.props;
    const columns = [
      {
        title: intl.get(`spcm.purchaseContractView.model.pushsap.status`).d('推送状态'),
        dataIndex: 'importStatus',
        width: 120,
        render: (_, record) =>
          record.importStatus === '1' ? (
            <span style={{ color: '#00DD00' }}>{record.importStatusMeaning}</span>
          ) : record.importStatus === '0' ? (
            <span style={{ color: '#FF0000' }}>{record.importStatusMeaning}</span>
          ) : (
            <span style={{ color: '#0066FF' }}>{record.importStatusMeaning}</span>
          ),
      },
      {
        title: intl.get(`spcm.purchaseContractView.model.pushsap.async`).d('同步执行'),
        dataIndex: 'sync',
        width: 120,
        render: (_, record) =>
          record.importStatus === '1' ? null : (
            <a onClick={() => this.syncAlignModal(record)}>
              {intl.get(`spcm.purchaseContractView.model.pushsap.againAsync`).d('重新同步')}
            </a>
          ),
      },
      {
        title: intl.get(`spcm.purchaseContractView.model.pushsap.importMessage`).d('反馈信息'),
        dataIndex: 'importMessage',
        width: 120,
        render: (value, record) => (
          <Tooltip title={value}>
            <span>{record.importMessage}</span>
          </Tooltip>
        ),
      },
      {
        title: intl.get(`spcm.purchaseContractView.model.pushsap.importType`).d('推送类型'),
        dataIndex: 'importType',
        width: 180,
        render: (_, record) => <span>{record.importTypeMeaning}</span>,
      },
      {
        title: intl
          .get(`spcm.purchaseContractView.model.pushsap.sourceDocumentTable`)
          .d('来源表单'),
        dataIndex: 'sourceDocumentTable',
        width: 180,
      },
      {
        title: intl.get(`spcm.purchaseContractView.model.pushsap.lastUpdateDate`).d('推送时间'),
        dataIndex: 'lastUpdateDate',
        width: 180,
      },
      {
        dataIndex: 'externalSystemCode',
        title: intl.get(`spcm.common.model.externalSystemCode`).d('外部系统'),
        width: 120,
      },
    ];
    const tableProps = {
      loading,
      pagination: false,
      columns,
      dataSource,
      bordered: true,
      rowKey: 'recordId',
    };
    return (
      <Modal
        title={intl.get(`spcm.purchaseContractView.model.pushsap.status`).d('推送状态')}
        width={820}
        visible={visible}
        bodyStyle={{ maxHeight: '600px', overflow: 'auto' }}
        onCancel={hideModal}
        footer={null}
      >
        <Table {...tableProps} />
      </Modal>
    );
  }
}

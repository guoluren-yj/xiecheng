import React from 'react';
import { Modal, Table } from 'hzero-ui';
import { sum } from 'lodash';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';

import { fetchPriceList } from '@/services/mallProtocolManagementService';
import './index.less';

export default class LadderPriceModal extends React.Component {
  state = {
    loading: false,
    dataSource: [],
  };

  componentDidMount() {
    this.fetchPriceList();
  }

  @Bind()
  fetchPriceList() {
    const {
      currentSku: { agreementLineId },
    } = this.props;
    this.setState(
      {
        loading: true,
      },
      () => {
        fetchPriceList({ agreementLineId })
          .then((res) => {
            if (res) {
              this.setState({
                dataSource: res.map((r, index) => ({
                  ...r,
                  lineNum: index + 1,
                })),
              });
            }
          })
          .finally(() => {
            this.setState({
              loading: false,
            });
          });
      }
    );
  }

  // 当前价格表格
  @Bind()
  feedLadderPriceTable() {
    const { loading, dataSource } = this.state;
    const columns = [
      {
        title: intl.get('small.common.model.lineNumber').d('行号'),
        dataIndex: 'lineNum',
        width: 60,
      },
      {
        title: intl.get('small.common.model.numberFrom').d('数量从(>=)'),
        dataIndex: 'ladderFrom',
        width: 80,
      },
      {
        title: intl.get('small.common.model.numberTo').d('数量至(<)'),
        dataIndex: 'ladderTo',
        width: 80,
      },
      {
        title: intl.get('small.common.model.noTaxPrice').d('不含税单价'),
        dataIndex: 'unitPrice',
        width: 80,
        align: 'right',
      },
      {
        title: intl.get('small.common.model.taxPrice').d('含税单价'),
        dataIndex: 'taxPrice',
        width: 80,
        align: 'right',
      },
    ];
    const scrollWidth = sum(columns.map((n) => n.width));
    return (
      <Table
        className="small-table-all-space"
        bordered
        scroll={{ x: scrollWidth }}
        rowKey="ladderId"
        columns={columns}
        pagination={false}
        dataSource={dataSource}
        loading={loading}
      />
    );
  }

  render() {
    const { visible, onClose } = this.props;
    return (
      <Modal
        visible={visible}
        width={550}
        footer={null}
        onCancel={onClose}
        title={intl.get('small.common.model.ladderPrice').d('阶梯价格')}
      >
        {this.feedLadderPriceTable()}
      </Modal>
    );
  }
}

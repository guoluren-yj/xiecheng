import React from 'react';
import { Modal, Form, Table } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';

import styles from './LadderPriceModal.less';

export default class LadderPriceModal extends React.Component {
  @Bind()
  scrollWidth(columns, fixWidth) {
    const total = columns.reduce((prev, current) => prev + (current.width ? current.width : 0), 0);
    return total + fixWidth + 1;
  }

  // 当前价格表格
  feedLadderPriceTable() {
    const { ladderPriceData = [] } = this.props;
    const columns = [
      {
        title: intl.get('scec.common.model.lineNumber').d('行号'),
        dataIndex: 'lineNum',
        width: 60,
      },
      {
        title: intl.get('scec.common.model.numberFrom').d('数量从(>=)'),
        dataIndex: 'ladderFrom',
        width: 80,
      },
      {
        title: intl.get('scec.common.model.numberTo').d('数量至(<)'),
        dataIndex: 'ladderTo',
        width: 80,
      },
      {
        title: intl.get('scec.common.model.unitPrice').d('单价'),
        dataIndex: 'unitPrice',
        width: 80,
      },
    ];
    const scrollWidth = this.scrollWidth(columns, 0);
    return (
      <React.Fragment>
        <Table
          bordered
          scroll={{ x: scrollWidth }}
          rowKey="ladderId"
          columns={columns}
          pagination={false}
          dataSource={ladderPriceData}
        />
      </React.Fragment>
    );
  }

  render() {
    const { hideModal, visible } = this.props;
    return (
      <Modal
        visible={visible}
        width={550}
        footer={null}
        onCancel={hideModal}
        title={
          <React.Fragment>
            <div className={styles['ladder-lever']} style={{ minHeight: '20px' }}>
              <Form layout="inline">
                <span style={{ position: 'absolute', left: '24px', top: '18px' }}>
                  {intl.get('scec.common.model.ladderPrice').d('阶梯价格')}
                </span>
              </Form>
            </div>
          </React.Fragment>
        }
      >
        {this.feedLadderPriceTable()}
      </Modal>
    );
  }
}

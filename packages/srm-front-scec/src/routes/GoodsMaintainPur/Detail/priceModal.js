import React from 'react';
import { Modal, Form, Button, InputNumber, Input } from 'hzero-ui';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import EditTable from 'components/EditTable';
import styles from './LadderPriceModal.less';

export default class LadderPriceModal extends React.Component {
  @Bind()
  scrollWidth(columns, fixWidth) {
    const total = columns.reduce((prev, current) => prev + (current.width ? current.width : 0), 0);
    return total + fixWidth + 1;
  }

  /**
   * 检查表格内容值发生变化
   */
  @Bind()
  hasChangeData(record, changeValues) {
    const { onChangeLadderTableData } = this.props;
    if (!isEmpty(changeValues)) {
      onChangeLadderTableData();
    }
  }

  /**
   * 删除
   */
  @Bind()
  haeRemoveData(productId) {
    const { onDeleteLadderLines } = this.props;
    onDeleteLadderLines(productId);
  }

  /**
   * 新建
   */
  @Bind()
  haeAddData(productId) {
    const { onCreateLadderLine } = this.props;
    onCreateLadderLine(productId);
  }

  /**
   * 保存
   */
  @Bind()
  haeSaveData(productId) {
    const { onSaveLadderLine } = this.props;
    onSaveLadderLine(productId);
  }

  // 当前价格表格
  feedLadderPriceTable() {
    const {
      ladderPriceData,
      ladderPriceRowSelection,
      fetchLadderPriceLoading,
      sourceFromType,
    } = this.props;

    const columnsOnly = [
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
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('ladderFrom', {
                initialValue: val,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('scec.common.model.numberFromMsg').d('数量从'),
                    }),
                  },
                ],
              })(<InputNumber min={0} max={99999999999999} style={{ width: '100%' }} />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get('scec.common.model.numberTo').d('数量至(<)'),
        dataIndex: 'ladderTo',
        width: 80,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('ladderTo', {
                initialValue: val,
                rules: [
                  {
                    required:
                      record.ladderId !== ladderPriceData[ladderPriceData.length - 1].ladderId,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('scec.common.model.numberToMsg').d('数量至'),
                    }),
                  },
                ],
              })(<InputNumber min={0} max={99999999999999} style={{ width: '100%' }} />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get('scec.common.model.unitPrice').d('单价'),
        dataIndex: 'unitPrice',
        width: 80,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('unitPrice', {
                initialValue: val,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('scec.common.model.unitPrice').d('单价'),
                    }),
                  },
                ],
              })(<Input />)}
            </Form.Item>
          ) : (
            val
          ),
      },
    ];
    const scrollWidth = this.scrollWidth(columns, 0);
    return (
      <React.Fragment>
        <EditTable
          bordered
          style={{ marginBottom: '24px' }}
          scroll={{ x: scrollWidth }}
          rowKey="ladderId"
          columns={sourceFromType !== 'SHARE' && sourceFromType !== 'PRICE' ? columns : columnsOnly}
          pagination={false}
          dataSource={ladderPriceData}
          onDataChange={this.hasChangeData}
          loading={fetchLadderPriceLoading}
          rowSelection={
            sourceFromType !== 'SHARE' && sourceFromType !== 'PRICE' && ladderPriceRowSelection
          }
        />
      </React.Fragment>
    );
  }

  render() {
    const {
      hideModal,
      visible,
      productId,
      saveLadderPriceLoading,
      ladderPriceSelectedRowKeys,
      sourceFromType,
    } = this.props;
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
        <p>
          {intl
            .get('scec.goodsMaintainPur.view.message.header')
            .d(
              '最后一行数量至若不维护则上限为无穷大，若维护则上限为维护的数量。一次性只能购买维护的数量范围内的商品。'
            )}
        </p>
        {sourceFromType !== 'SHARE' && (
          <p style={{ textAlign: 'right' }}>
            <Button
              onClick={() => this.haeRemoveData(productId)}
              disabled={ladderPriceSelectedRowKeys.length === 0}
            >
              {intl.get('hzero.common.button.delete').d('删除')}
            </Button>
            <Button
              onClick={() => this.haeAddData(productId)}
              style={{ margin: '0px 0px 0px 8px' }}
            >
              {intl.get('hzero.common.button.create').d('新建')}
            </Button>
            <Button
              type="primary"
              style={{ margin: '0px 0px 0px 8px' }}
              onClick={() => this.haeSaveData(productId)}
              loading={saveLadderPriceLoading}
            >
              {intl.get('hzero.common.button.save').d('保存')}
            </Button>
          </p>
        )}
      </Modal>
    );
  }
}

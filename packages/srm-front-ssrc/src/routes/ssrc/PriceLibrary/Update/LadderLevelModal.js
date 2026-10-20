/**
 * LadderLevelModal - 阶梯价格
 * @date: 2019-10-27
 * @author: jing.chen05@hand-china.com
 * @version: 1.0.0
 * @copyright Copyright (c) 2019, Hand
 */
import React from 'react';
import { Modal, Form, Col, Row, Button, Input, InputNumber, Table } from 'hzero-ui';
import EditTable from 'components/EditTable';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import Checkbox from 'components/Checkbox';

import styles from './LadderLevelModal.less';
import common from '@/routes/ssrc/common.less';

@Form.create({ fieldNameProp: null })
export default class LadderLevelModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  @Bind()
  scrollWidth(columns, fixWidth) {
    const total = columns.reduce((prev, current) => prev + (current.width ? current.width : 0), 0);
    return total + fixWidth + 1;
  }

  /**
   * 阶梯价格头信息查询
   */
  @Bind()
  fetchLadderLevelyHeader() {
    const {
      ladderListHeaderInfo: { itemCode, itemName, currencyCode, taxRate },
    } = this.props;
    return (
      <Form>
        <Row gutter={48} className={common['fixed-form-row']}>
          <Col span={12}>
            <Row className="read-row">
              <Col span={8} className="item-label">
                {intl.get(`ssrc.priceLibrary.model.library.itemsCode`).d('物料编码')}
              </Col>
              <Col span={16}>{itemCode}</Col>
            </Row>
          </Col>
          <Col span={12}>
            <Row className="read-row">
              <Col span={8}>{intl.get(`ssrc.priceLibrary.model.library.name`).d('物料名称')}</Col>
              <Col span={16}>{itemName}</Col>
            </Row>
          </Col>
        </Row>
        <Row gutter={48} className={common['fixed-form-row']}>
          <Col span={12}>
            <Row className="read-row">
              <Col span={8} className="item-label">
                {intl.get(`ssrc.priceLibrary.model.library.curryCode`).d('币种')}
              </Col>
              <Col span={16}>{currencyCode}</Col>
            </Row>
          </Col>
          <Col span={12}>
            <Row className="read-row">
              <Col span={8}>{intl.get(`ssrc.priceLibrary.model.library.taxRate`).d('税率')}</Col>
              <Col span={16}>{taxRate ? `${taxRate}%` : taxRate}</Col>
            </Row>
          </Col>
        </Row>
      </Form>
    );
  }

  // 当前价格库表格
  feedLadderLevelyTable() {
    const {
      ladderLevelData = [],
      fetchLadderListLoading,
      ladderLevelRowSelection,
      onlyReadFlag,
      returnRedValue,
      onlyReadNotRedFlag,
    } = this.props;
    const onlyReadColumns = [
      {
        title: intl.get(`ssrc.priceLibrary.model.library.ladderLineNum`).d('行号'),
        dataIndex: 'ladderLineNum',
        width: 80,
      },
      {
        title: (
          <span>
            {intl.get(`ssrc.priceLibrary.model.library.ladderFrom`).d('数量从')}
            {`(>=)`}
          </span>
        ),
        dataIndex: 'ladderFrom',
        width: 80,
        render: (val, record) =>
          returnRedValue(record, val, false, val, record.oldLadderFrom, true),
      },
      {
        title: (
          <span>
            {intl.get(`ssrc.priceLibrary.model.library.ladderTo`).d('数量至')} {`(<)`}
          </span>
        ),
        dataIndex: 'ladderTo',
        width: 80,
        render: (val, record) => returnRedValue(record, val, false, val, record.oldLadderTo, true),
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.library.price`).d('价格'),
        dataIndex: 'ladderPrice',
        width: 80,
        render: (val, record) =>
          returnRedValue(record, val, false, val, record.oldLadderPrice, true),
      },
      {
        title: intl.get(`hzero.common.remark`).d('备注'),
        dataIndex: 'ladderPriceRemark',
        width: 80,
        render: (val, record) =>
          returnRedValue(record, val, false, val, record.oldLadderPriceRemark, true),
      },
    ];
    const columns = [
      {
        title: intl.get(`ssrc.priceLibrary.model.library.ladderLineNum`).d('行号'),
        dataIndex: 'ladderLineNum',
        width: 80,
      },
      {
        title: (
          <span>
            {intl.get(`ssrc.priceLibrary.model.library.ladderFrom`).d('数量从')}
            {`(>=)`}
          </span>
        ),
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
                      name: intl.get(`ssrc.priceLibrary.model.library.ladderFrom`).d('数量从'),
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
        title: (
          <span>
            {intl.get(`ssrc.priceLibrary.model.library.ladderTo`).d('数量至')} {`(<)`}
          </span>
        ),
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
                      record.ladderPriceLibId !==
                      ladderLevelData[ladderLevelData.length - 1].ladderPriceLibId,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`ssrc.priceLibrary.model.library.ladderTo`).d('数量至'),
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
        title: intl.get(`ssrc.priceLibrary.model.library.price`).d('价格'),
        dataIndex: 'ladderPrice',
        width: 80,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('ladderPrice', {
                initialValue: val,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`ssrc.priceLibrary.model.library.price`).d('价格'),
                    }),
                  },
                ],
              })(<Input />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.library.cumulativeFlag`).d('累计阶梯价格'),
        dataIndex: 'cumulativeFlag',
        width: 120,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('cumulativeFlag', {
                initialValue: val || 0,
              })(<Checkbox />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`hzero.common.remark`).d('备注'),
        dataIndex: 'ladderPriceRemark',
        width: 80,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('ladderPriceRemark', {
                initialValue: val,
              })(<Input />)}
            </Form.Item>
          ) : (
            val
          ),
      },
    ];
    const onlyReadNotRedColumns = [
      {
        title: intl.get(`ssrc.priceLibrary.model.library.ladderLineNum`).d('行号'),
        dataIndex: 'ladderLineNum',
        width: 80,
      },
      {
        title: (
          <span>
            {intl.get(`ssrc.priceLibrary.model.library.ladderFrom`).d('数量从')}
            {`(>=)`}
          </span>
        ),
        dataIndex: 'ladderFrom',
        width: 80,
      },
      {
        title: (
          <span>
            {intl.get(`ssrc.priceLibrary.model.library.ladderTo`).d('数量至')} {`(<)`}
          </span>
        ),
        dataIndex: 'ladderTo',
        width: 80,
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.library.price`).d('价格'),
        dataIndex: 'ladderPrice',
        width: 80,
      },
      {
        title: intl.get(`hzero.common.remark`).d('备注'),
        dataIndex: 'ladderPriceRemark',
        width: 80,
      },
    ];
    const scrollWidth = this.scrollWidth(columns, 0);
    return (
      <React.Fragment>
        {onlyReadFlag || onlyReadNotRedFlag ? (
          <Table
            bordered
            scroll={{ x: scrollWidth }}
            rowKey="ladderPriceLibId"
            loading={fetchLadderListLoading}
            columns={onlyReadNotRedFlag ? onlyReadNotRedColumns : onlyReadColumns}
            pagination={false}
            dataSource={ladderLevelData}
          />
        ) : (
          <EditTable
            bordered
            scroll={{ x: scrollWidth }}
            rowKey="ladderPriceLibId"
            loading={fetchLadderListLoading}
            rowSelection={ladderLevelRowSelection}
            columns={columns}
            pagination={false}
            dataSource={ladderLevelData}
          />
        )}
      </React.Fragment>
    );
  }

  render() {
    const {
      hideModal,
      visible,
      onCreateLadder,
      onDeleteLadder,
      onSaveLadder,
      saveLadderListLoading,
      deleteLadderQuotLoading,
      ladderLevelSelectedRowKeys,
      onlyReadFlag = false,
      onlyReadNotRedFlag = false,
      ladderListHeaderInfo: { priceLibraryId, newPriceLibraryId },
    } = this.props;
    return (
      <Modal
        visible={visible}
        width={700}
        onCancel={hideModal}
        title={intl.get(`ssrc.priceLibrary.view.message.title.ladQuotate`).d('阶梯报价')}
        footer={null}
      >
        {this.fetchLadderLevelyHeader()}
        {!onlyReadFlag && !onlyReadNotRedFlag ? (
          <div className={styles['ladder-lever']}>
            <Form layout="inline">
              <Button
                type="primary"
                style={{ marginRight: '24px' }}
                onClick={() => onCreateLadder(priceLibraryId)}
              >
                {intl.get('hzero.common.button.create').d('新建')}
              </Button>
              <Button
                icon="save"
                onClick={() => onSaveLadder(priceLibraryId, newPriceLibraryId)}
                loading={saveLadderListLoading}
              >
                {intl.get('hzero.common.button.save').d('保存')}
              </Button>
              <Button
                loading={saveLadderListLoading || deleteLadderQuotLoading}
                onClick={() => onDeleteLadder(priceLibraryId)}
                disabled={ladderLevelSelectedRowKeys.length === 0}
              >
                {intl.get('hzero.common.button.delete').d('删除')}
              </Button>
            </Form>
          </div>
        ) : (
          ''
        )}
        {this.feedLadderLevelyTable()}
      </Modal>
    );
  }
}

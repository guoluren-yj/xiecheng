/**
 * LadderLevelModal - 寻源服务/寻源大厅-明细-阶梯报价
 * @date: 2019-3-26
 * @author: HZL <zili.hou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { Modal, Form, Col, Row, Table } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { getLadderFrom, getLadderTo } from '@/utils/utils';
import styles from './LadderLevelModal.less';

export default class LadderLevelModal extends React.Component {
  @Bind()
  scrollWidth(columns, fixWidth) {
    const total = columns.reduce((prev, current) => prev + (current.width ? current.width : 0), 0);
    return total + fixWidth + 1;
  }

  /**
   * 阶梯报价头信息查询
   */
  @Bind()
  fetchLadderLevelyHeader() {
    const { itemCode, itemName } = this.props.LadderLevelHeaderData;
    return (
      <Form className={styles['ssrc-ladder-level-header']}>
        <Row className="items-row">
          <Col span={12}>
            <Row>
              <Col span={8} className="item-label">
                {intl.get(`ssrc.supplierQuotation.model.supQuo.itemCode`).d('物料编码')}
              </Col>
              <Col span={16}>{itemCode}</Col>
            </Row>
          </Col>
          <Col span={12}>
            <Row>
              <Col span={8} className="item-label">
                {intl.get(`ssrc.supplierQuotation.model.supQuo.itemName`).d('物料名称')}
              </Col>
              <Col span={16}>{itemName}</Col>
            </Row>
          </Col>
        </Row>
      </Form>
    );
  }

  // 当前供应商分类表格
  feedLadderLevelyTable() {
    const { ladderLevelData, fetchLadderLevelLoading, doubleUnitFlag = false } = this.props;
    const columns = [
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.lineNo.`).d('行号'),
        dataIndex: 'rfxLadderLineNum',
        width: 80,
      },
      doubleUnitFlag
        ? {
            title: (
              <span>
                {intl.get(`ssrc.supplierQuotation.model.supQuo.ladderFrom`).d('数量从')}
                {`(>=)`}
              </span>
            ),
            dataIndex: 'secondaryLadderFrom',
            width: 80,
          }
        : null,
      doubleUnitFlag
        ? {
            title: (
              <span>
                {intl.get(`ssrc.supplierQuotation.model.supQuo.ladderTo`).d('数量至')}
                {`(<)`}
              </span>
            ),
            dataIndex: 'secondaryLadderTo',
            width: 80,
          }
        : null,
      {
        title: (
          <span>
            {getLadderFrom(doubleUnitFlag)}
            {`(>=)`}
          </span>
        ),
        dataIndex: 'ladderFrom',
        width: 120,
      },
      {
        title: (
          <span>
            {getLadderTo(doubleUnitFlag)}
            {`(<)`}
          </span>
        ),
        dataIndex: 'ladderTo',
        width: 120,
      },
      {
        title: intl.get(`hzero.common.remark`).d('备注'),
        dataIndex: 'remark',
        width: 80,
      },
    ].filter(Boolean);
    const scrollWidth = this.scrollWidth(columns, 0);
    return (
      <React.Fragment>
        <Table
          bordered
          scroll={{ x: scrollWidth }}
          rowKey="rfxLadderLineNum"
          columns={columns}
          pagination={false}
          dataSource={ladderLevelData}
          loading={fetchLadderLevelLoading}
        />
      </React.Fragment>
    );
  }

  render() {
    const { hideModal, visible } = this.props;
    return (
      <Modal
        visible={visible}
        width={700}
        footer={null}
        onCancel={hideModal}
        title={intl.get(`ssrc.inquiryHall.model.inquiryHall.ladderInquiryFlag`).d('阶梯报价')}
      >
        {this.fetchLadderLevelyHeader()}
        {this.feedLadderLevelyTable()}
      </Modal>
    );
  }
}

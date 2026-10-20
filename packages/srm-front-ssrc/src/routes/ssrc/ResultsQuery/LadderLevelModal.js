/**
 * LadderLevelModal - 寻源服务/询价大厅-明细-阶梯报价
 * @date: 2019-3-26
 * @author: HZL <zili.hou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { Modal, Form, Col, Row, Table } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { EDIT_FORM_ITEM_LAYOUT, FORM_COL_2_LAYOUT } from 'utils/constants';

const FormItem = Form.Item;
const UEDDisplayFormItem = props => {
  const { label, value } = props;
  return (
    <FormItem label={label} {...EDIT_FORM_ITEM_LAYOUT}>
      {value}
    </FormItem>
  );
};

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
      <Form>
        <Row gutter={48} className="read-row ssrc-ladder-level-header">
          <Col {...FORM_COL_2_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.itemsCode`).d('物料编码')}
              value={itemCode}
            />
          </Col>
          <Col {...FORM_COL_2_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.itemsName`).d('物料名称')}
              value={itemName}
            />
          </Col>
        </Row>
      </Form>
    );
  }

  // 当前供应商分类表格
  feedLadderLevelyTable() {
    const { ladderLevelData, fetchLadderLevelLoading } = this.props;
    const columns = [
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.lineNo.`).d('行号'),
        dataIndex: 'rfxLadderLineNum',
        width: 80,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.ladderFrom`).d('数量从'),
        dataIndex: 'ladderFrom',
        width: 80,
      },
      {
        title: (
          <span>
            {intl.get(`ssrc.inquiryHall.model.inquiryHall.ladderTo`).d('数量至')}
            {`(<)`}
          </span>
        ),
        dataIndex: 'ladderTo',
        width: 80,
      },
      {
        title: intl.get('hzero.common.remark').d('备注'),
        dataIndex: 'remark',
        width: 120,
      },
    ];
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

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
   * 头信息查询
   */
  @Bind()
  fetchScoreDetailsHeader() {
    const { supplierCompanyName, sectionName } = this.props.scoreDetailsHeaderData;
    return (
      <Form>
        <Row gutter={48} className="read-row ssrc-ladder-level-header">
          <Col {...FORM_COL_2_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`ssrc.bidHall.model.bidHall.supplierName`).d('供应商名称')}
              value={supplierCompanyName}
            />
          </Col>
          <Col {...FORM_COL_2_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`ssrc.bidHall.model.bidHall.sectionName`).d('标段名称')}
              value={sectionName}
            />
          </Col>
        </Row>
      </Form>
    );
  }

  // 当前表格
  feedScoreDetailsTable() {
    const { scoreDetailsData, fetchScoreDetailing } = this.props;
    const columns = [
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.indicateNames`).d('要素名称'),
        dataIndex: 'indicateName',
        width: 100,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.team`).d('所属组别'),
        dataIndex: 'teamMeaning',
        width: 100,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.weight`).d('权重'),
        dataIndex: 'weight',
        width: 80,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.averageScore`).d('平均分'),
        dataIndex: 'averageScore',
        width: 80,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.passStatus`).d('是否通过'),
        dataIndex: 'passStatusMeaning',
        width: 120,
      },
    ];
    const scrollWidth = this.scrollWidth(columns, 0);
    return (
      <React.Fragment>
        <Table
          bordered
          scroll={{ x: scrollWidth }}
          rowKey="evaluateIndicId"
          columns={columns}
          pagination={false}
          dataSource={scoreDetailsData}
          loading={fetchScoreDetailing}
        />
      </React.Fragment>
    );
  }

  render() {
    const { hideModal, scoreDetailsVisble } = this.props;
    return (
      <Modal
        visible={scoreDetailsVisble}
        width={600}
        footer={null}
        onCancel={hideModal}
        title={intl.get(`ssrc.bidHall.view.title.scoreDetail`).d('评分明细')}
      >
        {this.fetchScoreDetailsHeader()}
        {this.feedScoreDetailsTable()}
      </Modal>
    );
  }
}

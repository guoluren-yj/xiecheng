/**
 * inquiryHall - 寻源服务/寻源大厅-报价查看
 * @date: 2020-04-08
 * @author: zoukang <kang.zou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2019, Hand
 */

import React, { Component } from 'react';
import { Form, Row, Col, Collapse, Icon, Table, Popover } from 'hzero-ui';

import { FORM_COL_3_LAYOUT, EDIT_FORM_ITEM_LAYOUT } from 'utils/constants';
import { tableScrollWidth } from 'utils/utils';
import intl from 'utils/intl';
import { noop } from 'lodash';

import { phoneRender } from '@/utils/renderer';

const { Panel } = Collapse;

export default class InQuotation extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  renderFormContent(dataSource = {}) {
    const {
      customizeForm = noop,
      header = {},
      form: { getFieldDecorator },
    } = this.props;

    return customizeForm(
      {
        code: 'SSRC.BID_HALL_DETAIL.MARKED_BASIC_INFO',
        form: this.props.form,
        dataSource: header,
      },
      <Form className="read-row-custom">
        <Row type="flex" justify="start" gutter={48} className="read-row-custom">
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item label={intl.get('ssrc.common.company').d('公司')} {...EDIT_FORM_ITEM_LAYOUT}>
              {getFieldDecorator('companyName', {
                initialValue: dataSource.companyName,
              })(<span>{dataSource.companyName}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`ssrc.qualiExam.model.qualiExam.sourceCategory`).d('寻源类别')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('sourceCategory', {
                initialValue: dataSource.sourceCategory,
              })(<span>{dataSource.sourceCategoryMeaning}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`ssrc.qualiExam.model.qualiExam.sourceMethod`).d('寻源方式')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('sourceMethod', {
                initialValue: dataSource.sourceMethod,
              })(<span>{dataSource.sourceMethodMeaning}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`ssrc.bidHall.model.bidHall.quotationStartDate`).d('投标开始时间')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('quotationStartDate', {
                initialValue: dataSource.quotationStartDate,
              })(<span>{dataSource.quotationStartDate}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`ssrc.bidHall.model.bidHall.quotationDeadline`).d('投标截止时间')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('quotationEndDate', {
                initialValue: dataSource.quotationEndDate,
              })(<span>{dataSource.quotationEndDate}</span>)}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }

  renderQuotationHeader() {
    const { header = {}, InQuotationCollapseKeys = [] } = this.props;

    return (
      <Panel
        showArrow={false}
        header={
          <React.Fragment>
            <h3>
              {header.bidNum}
              {header.bidTitle ? `-${header.bidTitle}` : null}
            </h3>
            <a>
              {InQuotationCollapseKeys.includes('quotationHeader')
                ? intl.get(`hzero.common.button.up`).d('收起')
                : intl.get(`hzero.common.button.expand`).d('展开')}
            </a>
            <Icon type={InQuotationCollapseKeys.includes('quotationHeader') ? 'up' : 'down'} />
          </React.Fragment>
        }
        key="quotationHeader"
      >
        {this.renderFormContent(header)}
      </Panel>
    );
  }

  renderTableColumns() {
    return [
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidEventQuery.supplierName`).d('供应商名称'),
        dataIndex: 'supplierCompanyName',
        width: 180,
        render: (value) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidEventQuery.contacts`).d('联系人'),
        dataIndex: 'contactName',
        width: 180,
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidEventQuery.tel`).d('联系电话'),
        dataIndex: 'contactMobilephone',
        width: 250,
        render: (_, record) =>
          phoneRender(record.internationalTelCodeMeaning, record.contactMobilephone),
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidEventQuery.participate`).d('是否参与'),
        dataIndex: 'feedbackStatusMeaning',
        width: 100,
      },
      {
        title: intl.get('ssrc.bidEventQuery.model.bidEventQuery.whetherQuotation').d('是否投标'),
        dataIndex: 'quotationStatusMeaning',
        width: 100,
      },
    ];
  }

  renderQuotationSupplier() {
    const {
      quotationDetailBidDetailLoading,
      bidDetailQuotationList = [],
      bidDetailQuotationPagination,
      quotationDetailBidDetail,
      InQuotationCollapseKeys = [],
      customizeTable = noop,
    } = this.props;

    const columns = this.renderTableColumns();
    const scrollX = tableScrollWidth(columns);

    return (
      <Panel
        showArrow={false}
        header={
          <React.Fragment>
            <h3>
              {intl.get(`ssrc.bidEventQuery.model.bidEventQuery.quotationDetail`).d('投标详情')}
            </h3>
            <a>
              {InQuotationCollapseKeys.includes('quotationDetail')
                ? intl.get(`hzero.common.button.up`).d('收起')
                : intl.get(`hzero.common.button.expand`).d('展开')}
            </a>
            <Icon type={InQuotationCollapseKeys.includes('quotationDetail') ? 'up' : 'down'} />
          </React.Fragment>
        }
        key="quotationDetail"
      >
        {customizeTable(
          {
            code: 'SSRC.BID_HALL_DETAIL.MARKED_LINE_INFO',
            dataSource: bidDetailQuotationList,
          },
          <Table
            bordered
            rowKey="quotationHeaderId"
            loading={quotationDetailBidDetailLoading}
            columns={columns}
            scroll={{ x: scrollX }}
            dataSource={bidDetailQuotationList}
            pagination={bidDetailQuotationPagination}
            onChange={(page) => quotationDetailBidDetail(page)}
          />
        )}
      </Panel>
    );
  }

  render() {
    const { InQuotationCollapseKeys = [], setCollapseByKey } = this.props;

    return (
      <Collapse
        onChange={(keys) => setCollapseByKey('InQuotationCollapseKeys', keys)}
        className="form-collapse"
        activeKey={InQuotationCollapseKeys}
      >
        {this.renderQuotationHeader()}
        {this.renderQuotationSupplier()}
      </Collapse>
    );
  }
}

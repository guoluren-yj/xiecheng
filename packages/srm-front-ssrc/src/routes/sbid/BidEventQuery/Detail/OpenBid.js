/**
 * bidEventQuery - -招标事件查询-预审-开标查看
 * @date: 2020-05-25
 * @author: lvshuo <shuo.lv@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2019, Hand
 */

import React, { PureComponent } from 'react';
import { Form, Row, Col, Collapse, Icon, Table } from 'hzero-ui';

import { FORM_COL_3_LAYOUT } from 'utils/constants';
import { tableScrollWidth } from 'utils/utils';
import intl from 'utils/intl';

import { phoneRender } from '@/utils/renderer';

const { Panel } = Collapse;

export default class OpenBid extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {};
  }

  renderFormContent(dataSource = {}) {
    const { UEDDisplayFormItem } = this.props;

    return (
      <Form className="read-row-custom">
        <Row type="flex" justify="start" gutter={48} className="read-row-custom">
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get('ssrc.common.company').d('公司')}
              value={dataSource.companyName}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`ssrc.qualiExam.model.qualiExam.sourceCategory`).d('寻源类别')}
              value={dataSource.sourceCategoryMeaning}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`ssrc.qualiExam.model.qualiExam.sourceMethod`).d('寻源方式')}
              value={dataSource.sourceMethodMeaning}
            />
          </Col>
        </Row>
      </Form>
    );
  }

  renderPrequalHeader() {
    const { header = {}, OpenBidCollapseKeys = [] } = this.props;

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
              {OpenBidCollapseKeys.includes('openBidHeader')
                ? intl.get(`hzero.common.button.up`).d('收起')
                : intl.get(`hzero.common.button.expand`).d('展开')}
            </a>
            <Icon type={OpenBidCollapseKeys.includes('openBidHeader') ? 'up' : 'down'} />
          </React.Fragment>
        }
        key="openBidHeader"
      >
        {this.renderFormContent(header)}
      </Panel>
    );
  }

  renderTableColumns() {
    return [
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidEventQuery.openBidder`).d('开标员'),
        dataIndex: 'userName',
        width: 200,
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidEventQuery.openBidStatus`).d('开标状态'),
        dataIndex: 'openedFlagMeaning',
        width: 100,
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidEventQuery.tel`).d('联系电话'),
        dataIndex: 'phone',
        width: 180,
        render: (_, record) => phoneRender(record.internationalTelCodeMeaning, record.phone),
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidEventQuery.email`).d('电子邮件'),
        dataIndex: 'email',
        width: 200,
      },
    ];
  }

  renderPrequalSupplier() {
    const {
      bidDetailOpenBidList = [],
      openBidDetail,
      openBidDetailLoading,
      OpenBidCollapseKeys = [],
    } = this.props;

    const columns = this.renderTableColumns();
    const scrollX = tableScrollWidth(columns);

    return (
      <Panel
        showArrow={false}
        header={
          <React.Fragment>
            <h3>{intl.get('ssrc.bidHall.model.bidHall.openBidDetails').d('开标详情')}</h3>
            <a>
              {OpenBidCollapseKeys.includes('openBidDetail')
                ? intl.get(`hzero.common.button.up`).d('收起')
                : intl.get(`hzero.common.button.expand`).d('展开')}
            </a>
            <Icon type={OpenBidCollapseKeys.includes('openBidDetail') ? 'up' : 'down'} />
          </React.Fragment>
        }
        key="openBidDetail"
      >
        <Table
          bordered
          rowKey="openUserId"
          loading={openBidDetailLoading}
          columns={columns}
          scroll={{ x: scrollX }}
          dataSource={bidDetailOpenBidList}
          pagination={false}
          onChange={(page) => openBidDetail(page)}
        />
      </Panel>
    );
  }

  render() {
    const { OpenBidCollapseKeys = [], setCollapseByKey } = this.props;

    return (
      <Collapse
        onChange={(keys) => setCollapseByKey('OpenBidCollapseKeys', keys)}
        className="form-collapse"
        defaultActiveKey={OpenBidCollapseKeys}
      >
        {this.renderPrequalHeader()}
        {this.renderPrequalSupplier()}
      </Collapse>
    );
  }
}

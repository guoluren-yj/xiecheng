/**
 * inquiryHall - 寻源服务/寻源大厅-明细-报价中-工作流审批
 * @date: 2019-6-3
 */

import React, { Component } from 'react';
import { Form, Icon, Collapse, Row, Col, Table, Popover } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import classnames from 'classnames';

import { Header, Content } from 'components/Page';
import {
  EDIT_FORM_ITEM_LAYOUT,
  FORM_COL_3_LAYOUT,
  EDIT_FORM_ITEM_LAYOUT_COL_3,
} from 'utils/constants';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import {
  tableScrollWidth,
  getResponse,
  createPagination,
  getCurrentOrganizationId,
} from 'utils/utils';

import { phoneRender } from '@/utils/renderer';
import OperateRecords from '@/routes/share/OperateRecords/DrawerModal';
import {
  fetchHeaderInfoApproval,
  quotationDetailInInquiryDetailApproval,
} from '@/services/inquiryHallService';

import styles from '../index.less';

const { Panel } = Collapse;
const FormItem = Form.Item;
const UEDDisplayFormItem = (props) => {
  const { label, value, ...others } = props;
  return (
    <FormItem label={label} {...EDIT_FORM_ITEM_LAYOUT} {...others}>
      {value}
    </FormItem>
  );
};

@formatterCollections({
  code: [
    'ssrc.inquiryHall',
    'ssrc.common',
    'ssrc.qualiExam',
    'ssrc.sourceTemplate',
    'ssrc.expertScoring',
    'ssrc.bidHall',
    'ssrc.scux',
  ],
})
export default class InQuoting extends Component {
  constructor(props) {
    super(props);

    this.organizationId = getCurrentOrganizationId();

    this.state = {
      header: {},
      InQuotationCollapseKeys: ['quotationHeader', 'quotationDetail'], // 报价折叠面板
      rfxDetailQuotationList: [],
      rfxDetailQuotationPagination: {},
    };
  }

  componentDidMount() {
    this.fetchHeaderInfoApproval();
    this.quotationDetailInInquiryDetailApproval();
  }

  async fetchHeaderInfoApproval() {
    const {
      match: {
        params: { rfxId: rfxHeaderId = null },
      },
    } = this.props;

    try {
      let data = await fetchHeaderInfoApproval({
        organizationId: this.organizationId,
        rfxHeaderId,
      });
      data = getResponse(data);
      if (!data) {
        return;
      }

      this.setState({
        header: data,
      });
    } catch (e) {
      throw e;
    }
  }

  @Bind()
  async quotationDetailInInquiryDetailApproval(page = {}) {
    const {
      match: {
        params: { rfxId: sourceHeaderId = null },
      },
    } = this.props;

    try {
      let data = await quotationDetailInInquiryDetailApproval({
        organizationId: this.organizationId,
        sourceHeaderId,
        sourceFrom: 'RFX',
        page,
      });
      data = getResponse(data);
      if (!data) {
        return;
      }

      const { content = [] } = data || {};
      this.setState({
        rfxDetailQuotationList: content,
        rfxDetailQuotationPagination: createPagination(data),
      });
    } catch (e) {
      throw e;
    }
  }

  @Bind()
  setCollapseByKey(values = []) {
    this.setState({
      InQuotationCollapseKeys: values,
    });
  }

  renderFormContent(dataSource = {}) {
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
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl
                .get(`ssrc.inquiryHall.model.inquiryHall.quotationStartTime`)
                .d('报价开始时间')}
              value={dataSource.quotationStartDate}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl
                .get(`ssrc.inquiryHall.model.inquiryHall.quotationDeadline`)
                .d('报价截止时间')}
              value={dataSource.quotationEndDate}
            />
          </Col>
        </Row>
      </Form>
    );
  }

  renderQuotationHeader() {
    const { header = {}, InQuotationCollapseKeys = [] } = this.state;

    return (
      <Panel
        showArrow={false}
        header={
          <React.Fragment>
            <h3>
              {header.rfxNum}
              {header.rfxTitle ? `-${header.rfxTitle}` : null}
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
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierName`).d('供应商名称'),
        dataIndex: 'supplierCompanyName',
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
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.contacts`).d('联系人'),
        dataIndex: 'contactName',
        width: 180,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.tel`).d('联系电话'),
        dataIndex: 'contactMobilephone',
        width: 200,
        render: (_, record) =>
          phoneRender(record.internationalTelCodeMeaning, record.contactMobilephone),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.participate`).d('是否参与'),
        dataIndex: 'feedbackStatusMeaning',
        width: 100,
      },
      {
        title: intl.get('ssrc.inquiryHall.model.inquiryHall.whetherQuotation').d('是否报价'),
        dataIndex: 'quotationStatusMeaning',
        width: 100,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationIP`).d('报价IP'),
        dataIndex: 'supplierCompanyIp',
        width: 150,
        render: (val, record) => {
          if (record.quotationStatus === 'QUOTED') {
            if (record.repeatIpFlag) {
              return <span style={{ color: 'red' }}> {val} </span>;
            } else {
              return val;
            }
          } else {
            return null;
          }
        },
      },
    ];
  }

  renderQuotationSupplier() {
    const {
      InQuotationCollapseKeys = [],
      rfxDetailQuotationList = [],
      rfxDetailQuotationPagination = {},
    } = this.state;

    const columns = this.renderTableColumns();
    const scrollX = tableScrollWidth(columns);

    return (
      <Panel
        showArrow={false}
        header={
          <React.Fragment>
            <h3>{intl.get(`ssrc.bidHall.model.bidHall.quotationDetail`).d('报价详情')}</h3>
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
        <Table
          bordered
          rowKey="quotationHeaderId"
          columns={columns}
          scroll={{ x: scrollX }}
          dataSource={rfxDetailQuotationList}
          pagination={rfxDetailQuotationPagination}
          onChange={(page) => this.quotationDetailInInquiryDetailApproval(page)}
        />
      </Panel>
    );
  }

  renderReason() {
    const { header = {} } = this.state;
    const { terminatedRemark = null } = header;

    return (
      <div className={styles['close-reason-fields']}>
        <Form className="read-row-custom">
          <Row type="flex" justify="start" gutter={48} className="read-row-custom">
            <Col span={24}>
              <FormItem
                label={intl.get(`ssrc.inquiryHall.model.inquiryHall.closeReason`).d('关闭理由')}
                {...EDIT_FORM_ITEM_LAYOUT_COL_3}
              >
                {terminatedRemark}
              </FormItem>
            </Col>
          </Row>
        </Form>
      </div>
    );
  }

  render() {
    const {
      match: {
        params: { rfxId = null },
      },
    } = this.props;
    const { InQuotationCollapseKeys = [] } = this.state;

    const OperateRecordsProps = {
      organizationId: this.organizationId,
      id: rfxId,
      isButton: 0,
      modalProps: {
        drawer: true,
        footer: null,
      },
    };

    return (
      <React.Fragment>
        <Header
          backPath={null}
          title={
            <span className={styles['header-title']}>
              {intl.get(`ssrc.inquiryHall.view.message.title.RFXDetail`).d('RFX明细')}
            </span>
          }
        >
          <OperateRecords {...OperateRecordsProps} />
        </Header>

        <Content className={classnames(styles['quoting-approval-detail'], 'ued-detail-wrapper')}>
          {this.renderReason()}

          <Collapse
            onChange={(keys) => this.setCollapseByKey(keys)}
            className="form-collapse"
            activeKey={InQuotationCollapseKeys}
          >
            {this.renderQuotationHeader()}
            {this.renderQuotationSupplier()}
          </Collapse>
        </Content>
      </React.Fragment>
    );
  }
}

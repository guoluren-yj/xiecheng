/**
 * HistoryPriceModal - 价格库/历史价格
 * @date: 2019-10-24
 * @author: jing.chen05@hand-china.com
 * @version: 1.0.0
 * @copyright Copyright (c) 2019, Hand
 */
import React from 'react';
import { Table, Modal, Form, Col, Row, Button, Spin, Select, DatePicker, Popover } from 'hzero-ui';
import { isEmpty, isUndefined } from 'lodash';
import { Bind } from 'lodash-decorators';
import moment from 'moment';

import intl from 'utils/intl';
import { getDateTimeFormat } from 'utils/utils';
import { yesOrNoRender } from 'utils/renderer';
import EditTable from 'components/EditTable';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';

const { Option } = Select;

const formLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};

@Form.create({ fieldNameProp: null })
export default class HistoryPriceModal extends React.Component {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  state = {};

  /**
   * 重置表单
   *
   * @memberof QueryForm
   */
  @Bind()
  handleFormReset() {
    this.props.form.resetFields();
  }

  /**
   * 提交查询表单
   *
   * @memberof QueryForm
   */
  @Bind()
  handleSearch(page = {}) {
    const { form, onSearch } = this.props;
    form.validateFields((err) => {
      if (isEmpty(err)) {
        onSearch(page);
      }
    });
  }

  @Bind()
  scrollWidth(columns, fixWidth) {
    const total = columns.reduce((prev, current) => prev + (current.width ? current.width : 0), 0);
    return total + fixWidth + 1;
  }

  /**
   *跳转到寻源明细页面
   *
   */
  @Bind()
  inquiryDetail(record) {
    const { onInquiryDetail } = this.props;
    onInquiryDetail(record);
  }

  /**
   *跳转到寻源明细页面
   *
   */
  @Bind()
  contractDetail(record) {
    const { onContractDetail } = this.props;
    onContractDetail(record);
  }

  /**
   *跳转到寻源明细页面
   *
   */
  @Bind()
  orderDetail(record) {
    const { onOrderDetail } = this.props;
    onOrderDetail(record);
  }

  /**
   * 渲染阶梯价格明细
   * @param {String} value
   * @param {Object} record
   * @param {Object} item
   */
  renderLadderDetailTable(ladderPriceLibList = []) {
    const columns = [
      {
        title: intl.get(`ssrc.priceLibrary.model.library.ladderLineNum`).d('行号'),
        dataIndex: 'ladderLineNum',
        width: 100,
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.library.numberRange`).d('数量范围'),
        dataIndex: 'numberRange',
        width: 100,
        render: (val, record) =>
          `[${record.ladderFrom},${isUndefined(record.ladderTo) ? '-' : record.ladderTo})`,
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.library.price`).d('价格'),
        dataIndex: 'ladderPrice',
        width: 100,
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.library.ladderPriceRemark`).d('备注'),
        dataIndex: 'historyRemark',
        width: 120,
        render: (val) => <Popover content={val}>{val}</Popover>,
      },
    ];
    return (
      <Table
        bordered
        columns={columns}
        rowKey="ladderPriceLibId"
        dataSource={ladderPriceLibList}
        pagination={false}
      />
    );
  }

  renderHistoryForm() {
    const {
      form: { getFieldDecorator, getFieldValue },
      priceSource = [],
    } = this.props;
    return (
      <React.Fragment>
        <Form layout="inline" className="more-fields-form">
          <Row gutter={12}>
            <Col span={18}>
              <Row>
                <Col span={8}>
                  <Form.Item
                    label={intl.get(`ssrc.priceLibrary.model.library.priceSource`).d('价格来源')}
                    {...formLayout}
                  >
                    {getFieldDecorator('priceSource')(
                      <Select allowClear>
                        {priceSource &&
                          priceSource.map((item) => (
                            <Option key={item.value} value={item.value}>
                              {item.meaning}
                            </Option>
                          ))}
                      </Select>
                    )}
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label={intl
                      .get(`ssrc.priceLibrary.model.library.creationDateFrom`)
                      .d('创建时间从')}
                    {...formLayout}
                  >
                    {getFieldDecorator('creationDateFrom')(
                      <DatePicker
                        format={getDateTimeFormat()}
                        placeholder={null}
                        style={{ width: '100%' }}
                        showTime={{
                          defaultValue: moment('00:00:00', 'HH:mm:ss'),
                        }}
                        disabledDate={(currentDate) =>
                          getFieldValue('creationDateTo') &&
                          moment(getFieldValue('creationDateTo')).isBefore(currentDate, 'day')
                        }
                      />
                    )}
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label={intl
                      .get(`ssrc.priceLibrary.model.library.creationDateTo`)
                      .d('创建时间至')}
                    {...formLayout}
                  >
                    {getFieldDecorator('creationDateTo')(
                      <DatePicker
                        format={getDateTimeFormat()}
                        placeholder={null}
                        style={{ width: '100%' }}
                        showTime={{
                          defaultValue: moment('00:00:00', 'HH:mm:ss'),
                        }}
                        disabledDate={(currentDate) =>
                          getFieldValue('creationDateFrom') &&
                          moment(getFieldValue('creationDateFrom')).isAfter(currentDate, 'day')
                        }
                      />
                    )}
                  </Form.Item>
                </Col>
              </Row>
            </Col>
            <Col span={6} className="search-btn-more">
              <Form.Item>
                <Button data-code="reset" onClick={this.handleFormReset}>
                  {intl.get('hzero.common.button.reset').d('重置')}
                </Button>
                <Button
                  data-code="search"
                  type="primary"
                  htmlType="submit"
                  onClick={this.handleSearch}
                >
                  {intl.get('hzero.common.button.search').d('查询')}
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </React.Fragment>
    );
  }

  // 当前供应商分类表格
  renderHistoryTable() {
    const { loading, dataSource, pagination } = this.props;
    const columns = [
      {
        title: intl.get(`ssrc.priceLibrary.model.library.buyer`).d('采购员'),
        dataIndex: 'purchaseAgentName',
        width: 120,
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.library.taxPrice`).d('单价(含税)'),
        dataIndex: 'taxPrice',
        width: 100,
        align: 'right',
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.library.noTaxPrice`).d('单价(不含税)'),
        dataIndex: 'unitPrice',
        width: 100,
        align: 'right',
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.library.biUomId`).d('双单位'),
        dataIndex: 'biUomName',
        width: 100,
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.library.conversionRatio`).d('转换比例'),
        dataIndex: 'uomConversionRate',
        width: 100,
        render: (val) => <div> 1: {val}</div>,
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.library.priceQuantity`).d('价格批量'),
        dataIndex: 'priceBatchQuantity',
        width: 100,
        align: 'right',
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.library.taxRate`).d('税率'),
        dataIndex: 'taxRate',
        width: 100,
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.library.currencyCode`).d('币种'),
        dataIndex: 'currencyCode',
        width: 100,
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.library.exchangeRate`).d('汇率'),
        dataIndex: 'exchangeRate',
        width: 80,
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.library.ladderInquiryFlag`).d('启用阶梯价格'),
        dataIndex: 'ladderInquiryFlag',
        width: 120,
        render: yesOrNoRender,
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.library.ladderPrice`).d('阶梯价格'),
        dataIndex: 'unitPrice',
        width: 100,
        render: (val, record) =>
          record.ladderInquiryFlag === 1 ? (
            <Popover
              placement="bottomLeft"
              content={this.renderLadderDetailTable(record.ladderPriceLibList)}
              arrowPointAtCenter
            >
              <a>
                {`${intl.get(`ssrc.priceLibrary.view.message.button.ladderPrice`).d('阶梯价格')}`}
              </a>
            </Popover>
          ) : null,
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.library.quotationExpiryDateFrom`).d('有效期从'),
        dataIndex: 'quotationExpiryDateFrom',
        width: 120,
        render: (value) => value && moment(value).format(DEFAULT_DATE_FORMAT),
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.library.quotationExpiryDateTo`).d('有效期至'),
        dataIndex: 'quotationExpiryDateTo',
        width: 120,
        render: (value) => value && moment(value).format(DEFAULT_DATE_FORMAT),
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.library.orderNum`).d('订单编号'),
        dataIndex: 'orderNum',
        width: 150,
        render: (val, record) => <a onClick={() => this.orderDetail(record)}>{val}</a>,
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.library.contractNum`).d('合同编号'),
        dataIndex: 'contractNum',
        width: 155,
        render: (val, record) => <a onClick={() => this.contractDetail(record)}>{val}</a>,
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.library.sourceNum`).d('寻源单号'),
        dataIndex: 'sourceNum',
        width: 150,
        render: (val, record) => <a onClick={() => this.inquiryDetail(record)}>{val}</a>,
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.library.externalSystemNumber`).d('外部系统编号'),
        dataIndex: 'externalSystemNumber',
        width: 120,
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.library.priceSource`).d('价格来源'),
        dataIndex: 'priceSourceMeaning',
        width: 120,
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.library.infoType`).d('信息类型'),
        dataIndex: 'infoTypeMeaning',
        width: 120,
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.library.creationDateTime`).d('创建时间'),
        dataIndex: 'creationDate',
        width: 150,
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.library.realName`).d('创建人'),
        dataIndex: 'realName',
        width: 100,
      },
    ];
    const scrollWidth = this.scrollWidth(columns, 0);
    return (
      <React.Fragment>
        <EditTable
          bordered
          scroll={{ x: scrollWidth }}
          rowKey="quotationLineId"
          columns={columns}
          dataSource={dataSource}
          pagination={pagination}
          loading={loading}
          onChange={this.handleSearch}
        />
      </React.Fragment>
    );
  }

  render() {
    const { visible, onCancel, loading, historyPriceLineInfo } = this.props;
    const anchor = 'right';
    return (
      <Modal
        visible={visible}
        width={1020}
        maskClosable
        wrapClassName={`ant-modal-sidebar-${anchor}`}
        transitionName={`move-${anchor}`}
        onCancel={() => onCancel()}
        footer={
          <Button key="back" type="primary" onClick={() => onCancel()}>
            {intl.get('hzero.common.button.ok').d('确定')}
          </Button>
        }
        title={`${historyPriceLineInfo.itemName}(${
          historyPriceLineInfo.supplierCompanyName
        })${intl.get(`ssrc.priceLibrary.view.message.title.historyPrice`).d('历史价格')}`}
      >
        <Spin spinning={loading}>
          <div className="table-list-search">{this.renderHistoryForm()}</div>
          {this.renderHistoryTable()}
        </Spin>
      </Modal>
    );
  }
}

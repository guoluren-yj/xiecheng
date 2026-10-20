import React, { Component } from 'react';
import { Table, Modal, Button, Row, Col, Form, Input, Select, DatePicker } from 'hzero-ui';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { isFunction, throttle } from 'lodash';
import { connect } from 'dva';
import moment from 'moment';
import {
  filterNullValueObject,
  getCurrentOrganizationId,
  getDateFormat,
  tableScrollWidth,
  createPagination,
} from 'utils/utils';
import {
  SEARCH_FORM_ITEM_LAYOUT,
  SEARCH_FORM_ROW_LAYOUT,
  FORM_COL_3_LAYOUT,
  FORM_COL_3_4_LAYOUT,
  FORM_COL_4_LAYOUT,
  DATETIME_MIN,
  DATETIME_MAX,
} from 'utils/constants';
import { dateTimeRender } from 'utils/renderer';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import { fetchAddPurchaseOrder } from '@/services/create8DService';

const { Option } = Select;
const modelPrompt = 'sodr.sendOrder.model.common';

@formatterCollections({
  code: [
    'hzero.common',
    'sqam.common',
    'sodr.common',
    'sodr.sendOrder',
    'entity.order',
    'entity.business',
    'entity.organization',
  ],
})
@connect(({ create8D, loading }) => ({
  create8D,
  fetchAddRelation8DLoading: loading.effects['create8D/fetchAddRelation8D'],
  tenantId: getCurrentOrganizationId(),
}))
@Form.create({ fieldNameProp: null })
export default class AddPurchaseOrderModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedRowKeys: [],
      dataSource: [],
      pagination: {},
      loading: true,
    };
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
  }

  componentDidMount() {
    this.handleSearch();
  }

  @Bind()
  statusRender(record) {
    const { statusCode, evaluationFlag, statusCodeMeaning } = record;
    if (statusCode === 'CONFIRMED') {
      return evaluationFlag
        ? intl.get(`sqam.common.view.option.evaluated`).d('已评价')
        : intl.get(`sqam.common.view.option.unEvaluated`).d('待评价');
    } else {
      return statusCodeMeaning;
    }
  }

  // 保存新增关联8D
  @Bind()
  handleSave() {
    const { id, dispatch, tenantId, onFetch, onModal = (e) => e } = this.props;
    const { selectedRowKeys } = this.state;
    dispatch({
      type: 'create8D/savePurchaseOrder',
      payload: {
        tenantId,
        problemHeaderId: id,
        list: selectedRowKeys.map((item) => ({
          poHeaderId: item,
          problemHeaderId: id,
          tenantId,
        })),
      },
    }).then((res) => {
      if (res) {
        onFetch();
        onModal();
        notification.success();
      }
    });
  }

  // 表单重置事件
  @Bind()
  reset() {
    this.props.form.resetFields();
  }

  /**
   * 设置选中行
   */
  @Bind()
  handleSelectRows(selectedRowKeys) {
    this.setState({ selectedRowKeys });
  }

  @Bind()
  handleSearch(page = {}) {
    const {
      tenantId,
      detail,
      form: { getFieldsValue },
    } = this.props;
    const formValue = filterNullValueObject(getFieldsValue());
    const { releasedDateAfter, releasedDateBefore, statusCode } = formValue;
    const { companyId, extSupplierId, supplierCompanyId } = detail;
    const statusObj = {
      statusCode: ['EVALUATED', 'UNEVALUATED'].includes(statusCode) ? 'CONFIRMED' : statusCode,
      confirmedFlag: ['EVALUATED', 'UNEVALUATED'].includes(statusCode) ? 1 : null,
      evaluationFlag: statusCode === 'UNEVALUATED' ? 0 : statusCode === 'EVALUATED' ? 1 : null,
    };
    fetchAddPurchaseOrder({
      tenantId,
      page,
      ...formValue,
      ...statusObj,
      companyId,
      supplierCompanyId,
      supplierId: extSupplierId,
      releasedDateAfter: releasedDateAfter && releasedDateAfter.format(DATETIME_MIN),
      releasedDateBefore: releasedDateBefore && releasedDateBefore.format(DATETIME_MAX),
    }).then((res) => {
      if (res) {
        this.setState({
          loading: false,
          dataSource: res.content,
          pagination: createPagination(res),
        });
      }
    });
  }

  render() {
    const { selectedRowKeys } = this.state;
    const { dataSource = [], pagination, loading } = this.state;
    const {
      form: { getFieldDecorator, getFieldValue },
      onModal,
      visible = false,
    } = this.props;
    const columns = [
      {
        title: intl.get(`${modelPrompt}.orderNum`).d('订单号'),
        dataIndex: 'displayPoNum',
        width: 180,
        fixed: 'left',
      },
      {
        title: intl.get(`${modelPrompt}.orderStatus`).d('订单状态'),
        dataIndex: 'statusCodeMeaning',
        width: 90,
        render: (_, record) => this.statusRender(record),
      },
      {
        title: intl.get(`entity.order.type`).d('订单类型'),
        dataIndex: 'orderTypeName',
        width: 150,
      },
      {
        title: intl.get(`${modelPrompt}.purchaseAgent`).d('采购员'),
        dataIndex: 'purchaseAgentName',
        width: 120,
      },
      {
        title: intl.get(`entity.business.tag`).d('业务实体'),
        dataIndex: 'ouName',
        width: 150,
      },
      {
        title: intl.get(`entity.organization.class.purchase`).d('采购组织'),
        dataIndex: 'organizationName',
        width: 150,
      },
      {
        title: intl.get(`${modelPrompt}.srmPoNum`).d('SRM订单号'),
        dataIndex: 'poNum',
        width: 150,
      },
      {
        title: intl.get('sodr.common.model.common.contractNumber').d('协议编号'),
        dataIndex: 'pohPcNum',
        width: 120,
      },
      {
        title: intl.get(`${modelPrompt}.dataSourceCode`).d('来源系统'),
        dataIndex: 'sourceCode',
        width: 120,
      },
      {
        title: intl.get(`hzero.common.date.release`).d('发布日期'),
        dataIndex: 'releasedDate',
        width: 150,
        render: dateTimeRender,
      },
    ];
    const rowSelection = {
      selectedRowKeys,
      onChange: this.handleSelectRows,
    };
    const modalProps = {
      visible,
      width: 1200,
      onOk: throttle(this.handleSave, 1500, { trailing: false }),
      title: intl.get(`sqam.common.model.common.addRelatedPurchaseOrder`).d('新增关联采购订单'),
      onCancel: () => onModal(),
    };
    const tableProps = {
      columns,
      dataSource,
      pagination,
      loading,
      bordered: true,
      rowSelection,
      rowKey: 'poHeaderId',
      onChange: this.handleSearch,
      scroll: { x: tableScrollWidth(columns) },
    };
    const poStatusCodes = [
      { value: 'CONFIRMED', meaning: intl.get(`sqam.common.view.option.confirmed`).d('已确认') },
      { value: 'CLOSED', meaning: intl.get(`sqam.common.view.option.closed`).d('已关闭') },
      {
        value: 'UNEVALUATED',
        meaning: intl.get(`sqam.common.view.option.unEvaluated`).d('待评价'),
      },
      { value: 'EVALUATED', meaning: intl.get(`sqam.common.view.option.evaluated`).d('已评价') },
    ];
    const threeMonthsAgo = `${new Date().getFullYear()}-${new Date().getMonth() - 2}-1`;
    return (
      <Modal {...modalProps}>
        <Form layout="inline" className="more-fields-search-form">
          <Row {...SEARCH_FORM_ROW_LAYOUT}>
            <Col {...FORM_COL_3_4_LAYOUT}>
              <Row {...SEARCH_FORM_ROW_LAYOUT}>
                <Col {...FORM_COL_3_LAYOUT}>
                  <Form.Item
                    label={intl.get(`${modelPrompt}.orderNum`).d('订单号')}
                    {...SEARCH_FORM_ITEM_LAYOUT}
                  >
                    {getFieldDecorator('displayPoNum')(<Input inputChinese={false} />)}
                  </Form.Item>
                </Col>
                <Col {...FORM_COL_3_LAYOUT}>
                  <Form.Item
                    label={intl.get(`entity.order.status`).d('订单状态')}
                    {...SEARCH_FORM_ITEM_LAYOUT}
                  >
                    {getFieldDecorator('statusCode')(
                      <Select style={{ width: '100%' }} allowClear>
                        {poStatusCodes.map((n) => (
                          <Option key={n.value} value={n.value}>
                            {n.meaning}
                          </Option>
                        ))}
                      </Select>
                    )}
                  </Form.Item>
                </Col>
                <Col {...FORM_COL_3_LAYOUT}>
                  <Form.Item
                    {...SEARCH_FORM_ITEM_LAYOUT}
                    label={intl.get(`hzero.common.date.release.from`).d('发布日期从')}
                  >
                    {getFieldDecorator('releasedDateAfter', {
                      initialValue: moment(threeMonthsAgo, 'YYYY-MM-DD'),
                    })(
                      <DatePicker
                        format={getDateFormat()}
                        placeholder={null}
                        disabledDate={(currentDate) =>
                          getFieldValue('releasedDateBefore') &&
                          moment(getFieldValue('releasedDateBefore')).isBefore(currentDate, 'day')
                        }
                      />
                    )}
                  </Form.Item>
                </Col>
              </Row>
              <Row {...SEARCH_FORM_ROW_LAYOUT}>
                <Col {...FORM_COL_3_LAYOUT}>
                  <Form.Item
                    {...SEARCH_FORM_ITEM_LAYOUT}
                    label={intl.get(`hzero.common.date.release.to`).d('发布日期至')}
                  >
                    {getFieldDecorator('releasedDateBefore', {
                      initialValue: moment(),
                    })(
                      <DatePicker
                        disabledDate={(currentDate) =>
                          getFieldValue('releasedDateAfter') &&
                          moment(getFieldValue('releasedDateAfter')).isAfter(currentDate, 'day')
                        }
                        format={getDateFormat()}
                        placeholder={null}
                      />
                    )}
                  </Form.Item>
                </Col>
              </Row>
            </Col>
            <Col {...FORM_COL_4_LAYOUT} className="search-btn-more">
              <Form.Item>
                <Button onClick={this.reset}>
                  {intl.get('hzero.common.button.reset').d('重置')}
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  onClick={this.handleSearch}
                  loading={loading}
                >
                  {intl.get('hzero.common.button.search').d('查询')}
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
        <Table {...tableProps} />
      </Modal>
    );
  }
}

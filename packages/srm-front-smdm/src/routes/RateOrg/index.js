/**
 * Rate - 汇率定义-租户级
 * @date: 2018-7-15
 * @author: wangjiacheng <jiacheng.wang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Button, Input, Table, Select, Row, Col, DatePicker } from 'hzero-ui';
import { isUndefined } from 'lodash';
import { Bind, Debounce } from 'lodash-decorators';
import queryString from 'querystring';
import moment from 'moment';
import BigNumber from 'bignumber.js';

import { Content, Header } from 'components/Page';
import Lov from 'components/Lov';
// import OptionInput from 'components/OptionInput';
import CommonImport from 'hzero-front/lib/components/Import';
import { SRM_MDM } from '_utils/config';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import { DATETIME_MIN } from 'utils/constants';
import notification from 'utils/notification';
import { openTab } from 'utils/menuTab';
import { enableRender, dateRender } from 'utils/renderer';

import { Button as PermissionButton } from 'components/Permission';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import intl from 'utils/intl';

import RateForm from './RateForm';

const FormItem = Form.Item;
@withCustomize({
  unitCode: ['SMDM_RATE.EDIT_FORM', 'SMDM_RATE.LIST', 'SMDM_RATE.SEARCH'],
})
@Form.create({ fieldNameProp: null })
@connect(({ loading, rateOrg }) => ({
  rateOrg,
  createLoading: loading.effects['rateOrg/createRate'],
  updateLoading: loading.effects['rateOrg/updateRate'],
  initLoading: loading.effects['rateOrg/fetchRateData'],
}))
@formatterCollections({ code: 'smdm.rateOrg' })
export default class RateOrg extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      organizationId: getCurrentOrganizationId(),
      rateFormData: {},
    };
  }

  RateForm;

  componentDidMount() {
    const { custLoading, dispatch } = this.props;
    dispatch({ type: 'rateOrg/init' });
    if (!custLoading) {
      this.fetchRateOrgList();
    }
  }

  componentDidUpdate(prevProps) {
    const { custLoading } = this.props;

    const custLoadingChange = prevProps.custLoading !== custLoading && !custLoading;
    if (custLoadingChange) {
      this.fetchRateOrgList();
    }
  }

  /**
   * @function fetchRateOrgList - 查询汇率列表数据
   * @param {object} params - 查询参数
   */
  fetchRateOrgList(params = {}) {
    const {
      dispatch,
      form,
      rateOrg: { pagination = {} },
    } = this.props;
    const { forCurrency, toCurrency, rateDate, ...other } = form.getFieldsValue();
    const { organizationId } = this.state;
    const data = rateDate ? moment(rateDate).format(DATETIME_MIN) : rateDate;
    dispatch({
      type: 'rateOrg/fetchRateData',
      payload: {
        ...forCurrency,
        ...toCurrency,
        ...other,
        rateDate: data,
        organizationId,
        page: pagination,
        ...params,
        customizeUnitCode: 'SMDM_RATE.LIST,SMDM_RATE.SEARCH',
      },
    });
  }

  /**
   * 控制modal显示与隐藏
   * @param {boolean}} flag 是否显示modal
   */
  handleModalVisible(flag) {
    const { dispatch } = this.props;
    if (flag === false && this.RateForm) {
      this.RateForm.resetForm();
    }
    dispatch({
      type: 'rateOrg/updateState',
      payload: {
        modalVisible: !!flag,
      },
    });
  }

  /**
   * @function showModal - 新建显示模态框
   */
  @Bind()
  showModal() {
    this.setState({
      rateFormData: {},
    });
    this.handleModalVisible(true);
  }

  /**
   * @function showModal - 新建显示模态框
   */
  @Bind()
  hideModal() {
    const { saving = false } = this.props;
    if (!saving) {
      this.handleModalVisible(false);
    }
  }

  /**
   * @function handleSearchRate - 搜索表单
   */
  @Bind()
  handleSearchRate() {
    this.fetchRateOrgList({ page: {} });
  }

  /**
   * @function handleResetSearch - 重置查询表单
   */
  @Bind()
  handleResetSearch() {
    this.props.form.resetFields();
  }

  /**
   * @function handleStandardTableChange - 分页操作
   * @param {object} pagination - 分页数据对象
   */
  @Bind()
  handleStandardTableChange(pagination) {
    this.fetchRateOrgList({
      page: pagination,
    });
  }

  /**
   * @function handleUpdateRate - 更新显示模态框
   * @param {object} record - 更新的数据
   */
  @Bind()
  handleUpdateRate(record) {
    this.setState({
      rateFormData: record,
    });
    this.handleModalVisible(true);
  }

  /**
   * @function handleAdd - 更新汇率定义
   * @param {object} record - 更新的数据
   */
  @Bind()
  @Debounce(50)
  handleAdd(fieldsValue) {
    const { dispatch } = this.props;
    const { rateFormData } = this.state;
    const params = {
      customizeUnitCode: 'SMDM_RATE.LIST,SMDM_RATE.EDIT_FORM',
      organizationId: this.state.organizationId,
      body: {
        ...rateFormData,
        ...fieldsValue,
        enabledFlag: fieldsValue.enabledFlag ? 1 : 0,
        startDate: moment(fieldsValue.startDate).format(DATETIME_MIN),
        endDate: moment(fieldsValue.endDate).format(DATETIME_MIN),
        rate: BigNumber(fieldsValue.exchangeNumber)
          .dividedBy(BigNumber(fieldsValue.currencyNumber))
          .toFixed(10),
        currencyNumber: undefined,
      },
    };
    if (Number(params.body.rate) === 0) {
      notification.warning({
        message: intl
          .get('smdm.rateOrg.view.validation.rateError')
          .d(`保留10位小数后，汇率不能为零`),
      });
      return;
    }
    dispatch({
      type: `rateOrg/${rateFormData.exchangeRateId ? 'updateRate' : 'createRate'}`,
      payload: params,
    }).then((response) => {
      if (Array.isArray(response) && response.length > 0) {
        notification.warning({
          message: intl
            .get('smdm.rateOrg.view.validation.repeatData')
            .d(`所选日期区间存在重复数据：${response.join('、')}`),
        });
      } else {
        // eslint-disable-next-line
        if (response) {
          notification.success();
          this.hideModal();
          this.fetchRateOrgList();
        }
      }
    });
  }

  /**
   * 多查询条件展示
   */
  @Bind()
  toggleForm() {
    const { display } = this.state;
    this.setState({
      display: !display,
    });
  }

  renderFilterForm() {
    const {
      form,
      rateOrg: { enabledList = [] },
      customizeFilterForm,
    } = this.props;
    const { getFieldDecorator } = form;
    const formItemLayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
    };
    const { display } = this.state;
    return customizeFilterForm(
      {
        code: 'SMDM_RATE.SEARCH',
        form,
        expand: display,
      },
      <Form layout="inline" className="more-fields-form">
        <Row>
          <Col span={18}>
            <Row>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get('smdm.rateOrg.modal.rateOrg.fromCurrencyCode').d('币种代码')}
                >
                  {getFieldDecorator('fromCurrencyCode')(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get('smdm.rateOrg.modal.rateOrg.fromCurrencyName').d('币种名称')}
                >
                  {getFieldDecorator('fromCurrencyName')(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get('smdm.rateOrg.modal.rateOrg.toCurrencyCode').d('兑换币种代码')}
                >
                  {getFieldDecorator('toCurrencyCode')(<Input />)}
                </FormItem>
              </Col>
            </Row>
            <Row style={{ display: display ? 'block' : 'none' }}>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get('smdm.rateOrg.modal.rateOrg.toCurrencyName').d('兑换币种名称')}
                >
                  {getFieldDecorator('toCurrencyName')(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get('smdm.rateOrg.modal.rateOrg.rateTypeName').d('汇率类型')}
                >
                  {getFieldDecorator('rateTypeCode')(
                    <Lov queryParams={{ enabledFlag: '1' }} code="SMDM.EXCHANGE_RATE_TYPE" />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get('smdm.rateOrg.modal.rateOrg.rateDate').d('兑换日期')}
                >
                  {getFieldDecorator('rateDate')(<DatePicker placeholder="" format="YYYY-MM-DD" />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`smdm.rateOrg.modal.rateOrg.enabledFlag`).d('是否启用')}
                >
                  {getFieldDecorator('enabledFlag', {
                    initialValue: '1',
                  })(
                    <Select allowClear>
                      {enabledList.map((m) => (
                        <Select.Option key={m.value} value={m.value}>
                          {m.meaning}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <Form.Item>
              <Button
                style={{ display: !display ? 'inline-block' : 'none' }}
                onClick={this.toggleForm}
              >
                {intl.get('hzero.common.button.viewMore').d('更多查询')}
              </Button>
              <Button
                style={{ display: !display ? 'none' : 'inline-block' }}
                onClick={this.toggleForm}
              >
                {intl.get('hzero.common.button.collected').d('收起查询')}
              </Button>
              <Button onClick={this.handleResetSearch}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button
                type="primary"
                style={{ marginLeft: 8 }}
                htmlType="submit"
                onClick={this.handleSearchRate}
              >
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }

  /**
   * 批量导入
   */
  @Bind()
  handleBatchImport(code) {
    let retitle = '';
    if (code === 'SMDM.EXCHANGE_RATE_IMPORT') {
      retitle = intl.get('hzero.common.title.batchImport').d('批量导入');
    }
    openTab({
      key: `/smdm/rate-org/data-import/${code}`,
      search: queryString.stringify({
        key: `/smdm/rate-org/data-import/${code}`,
        title: retitle,
        action: retitle,
      }),
    });
  }

  /**
   * 获取form数据
   */
  @Bind()
  handleGetFormValue() {
    const { form } = this.props;
    const filterValues = isUndefined(form) ? {} : filterNullValueObject(form.getFieldsValue());
    return {
      ...filterValues,
      customizeUnitCode: 'SMDM_RATE.LIST,SMDM_RATE.SEARCH',
    };
  }

  render() {
    const {
      initLoading,
      updateLoading,
      createLoading,
      rateOrg: { rateList = [], modalVisible, rateMethodList, pagination = {} },
      customizeForm,
      customizeTable,
    } = this.props;
    const { rateFormData, organizationId } = this.state;
    const title = rateFormData.exchangeRateId
      ? intl.get('smdm.rateOrg.view.message.edit').d('编辑汇率定义')
      : intl.get('smdm.rateOrg.view.message.create').d('新建汇率定义');
    const rateFormProps = {
      title,
      modalVisible,
      rateMethodList,
      anchor: 'right',
      confirmLoading: updateLoading || createLoading,
      onCancel: this.hideModal,
      onHandleAdd: this.handleAdd,
      initData: rateFormData,
      customizeForm,
    };
    const columns = [
      {
        title: intl.get('smdm.rateOrg.modal.rateOrg.fromCurrencyCode').d('币种代码'),
        width: 120,
        dataIndex: 'fromCurrencyCode',
      },
      {
        title: intl.get('smdm.rateOrg.modal.rateOrg.fromCurrencyName').d('币种名称'),
        dataIndex: 'fromCurrencyName',
        minWidth: 200,
      },
      {
        title: intl.get('smdm.rateOrg.modal.rateOrg.toCurrencyCode').d('兑换币种代码'),
        width: 120,
        dataIndex: 'toCurrencyCode',
      },
      {
        title: intl.get('smdm.rateOrg.modal.rateOrg.toCurrencyName').d('兑换币种名称'),
        dataIndex: 'toCurrencyName',
        minWidth: 200,
      },
      {
        title: intl.get('smdm.rateOrg.modal.rateOrg.rateTypeName').d('汇率类型'),
        key: 'rateTypeName',
        align: 'left',
        width: 100,
        dataIndex: 'rateTypeName',
      },
      {
        title: intl.get('smdm.rateOrg.modal.rateOrg.rateDate').d('兑换日期'),
        align: 'left',
        width: 150,
        dataIndex: 'rateDate',
        render: dateRender,
      },
      {
        title: intl.get('smdm.rateOrg.modal.rateOrg.currencyNumber').d('货币数量'),
        align: 'left',
        width: 100,
        dataIndex: 'currencyNumber',
        render: () => {
          return <span>1</span>;
        },
      },
      {
        title: intl.get('smdm.rateOrg.modal.rateOrg.exchangeNumber').d('兑换数量'),
        align: 'left',
        width: 100,
        dataIndex: 'exchangeNumber',
        render: (text, record) => {
          return <span>{record.rate ? BigNumber(record.rate).toFixed(10) : ''}</span>;
        },
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        align: 'left',
        width: 100,
        dataIndex: 'enabledFlag',
        render: (val) => ['0', 0, '1', 1].includes(val) ? enableRender(Number(val)) : val,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        align: 'left',
        width: 100,
        fixed: 'right',
        dataIndex: 'option',
        render: (text, record) => {
          return (
            <a onClick={() => this.handleUpdateRate(record)}>
              {intl.get('hzero.common.button.edit').d('编辑')}
            </a>
          );
        },
      },
    ];
    return (
      <React.Fragment>
        <Header title={intl.get('smdm.rateOrg.view.message.title').d('汇率定义')}>
          <Button icon="plus" type="primary" onClick={this.showModal}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
          <CommonImport
            prefixPatch="/smdm"
            businessObjectTemplateCode="SMDM.EXCHANGE_RATE_IMPORT"
            buttonProps={{
              permissionList: [
                {
                  code: `srm.fin.rate.ps.new.exchange-rate.import`,
                  type: 'button',
                  meaning: '批量导入-新',
                },
              ],
            }}
            buttonText={intl.get('hzero.common.title.batchImport.new').d('批量导入-新')}
          />
          <PermissionButton
            type="c7n-pro"
            icon="archive"
            onClick={() => this.handleBatchImport('SMDM.EXCHANGE_RATE_IMPORT')}
            permissionList={[
              {
                code: `srm.fin.rate.ps.exchange-rate.import`,
                type: 'button',
                meaning: '批量导入',
              },
            ]}
          >
            {intl.get('hzero.common.title.batchImport').d('批量导入')}
          </PermissionButton>
          <ExcelExportPro
            templateCode="SMDM.EXCHANGE_RATE_EXPORT"
            otherButtonProps={{
              icon: 'unarchive',
              permissionList: [
                {
                  code: 'srm.fin.rate.button.export',
                  type: 'button',
                },
              ],
            }}
            buttonText={intl.get('hzero.common.export.new').d('导出-新')}
            requestUrl={`${SRM_MDM}/v1/${organizationId}/exchange-rates/exchange-rate/export-modeler`}
            queryParams={this.handleGetFormValue()}
            method="POST"
            allBody
          />
        </Header>
        <Content>
          <div className="table-list-search">{this.renderFilterForm()}</div>
          {customizeTable(
            {
              code: 'SMDM_RATE.LIST',
            },
            <Table
              bordered
              scroll={{ x: 1300 }}
              rowKey="exchangeRateId"
              loading={initLoading}
              dataSource={rateList}
              columns={columns}
              pagination={pagination}
              onChange={this.handleStandardTableChange}
            />
          )}
          <RateForm {...rateFormProps} />
        </Content>
      </React.Fragment>
    );
  }
}

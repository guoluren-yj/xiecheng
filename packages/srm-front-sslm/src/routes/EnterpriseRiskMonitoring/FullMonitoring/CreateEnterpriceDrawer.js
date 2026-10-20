/**
 * CreateEnterpriceDrawer - 新建企业监控
 * @date: 2019-07-02
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import uuidv4 from 'uuid/v4';
import { connect } from 'dva';
import { isEmpty } from 'lodash';
import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import { Drawer, Button, Form, Input, Table, Checkbox, Row, Col, Modal, Radio } from 'hzero-ui';

import intl from 'utils/intl';
import EditTable from 'components/EditTable';
import notification from 'utils/notification';
import { getEditTableData } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';

const { confirm } = Modal;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;

/**
 * 全量监控企业管理
 * @extends {Component} - Component
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} FullMonitoring - 数据源
 * @reactProps {Boolean} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {String} organizationId - 租户Id
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
@connect(({ riskMonitoring, loading }) => ({
  riskMonitoring,
  loading: loading.effects['riskMonitoring/querySupplier'],
  checkLoading: loading.effects['riskMonitoring/checkNameRepeat'],
}))
@formatterCollections({ code: ['sslm.riskMonitoring'] })
export default class CreateEnterpriceDrawer extends Component {
  state = {
    step: 'current',
    checkedValues: [],
    selectedRowKeys: [],
    // selectedRows: [],
    radioDefaultValue: 'platformBusiness',
    notPlatformDataSource: [], // 非平台企业数据源
  };

  componentDidMount() {
    const {
      queryGroupsList,
      riskMonitoring: { supplierPagination = {} },
    } = this.props;
    this.handleSearchSupplier(supplierPagination);
    queryGroupsList();
  }

  /**
   * 查询选择供应商的数据
   * @param {Object} page 分页参数
   */
  @Bind()
  handleSearchSupplier(page = {}) {
    const { dispatch, form } = this.props;
    const filterValues = form.getFieldsValue();
    dispatch({
      type: 'riskMonitoring/querySupplier',
      payload: {
        page,
        ...filterValues,
      },
    });
  }

  /**
   * 校验非平台企业是否重复
   */
  @Bind()
  checkNameRepeat() {
    const { dispatch } = this.props;
    const { notPlatformDataSource } = this.state;
    const tableData = getEditTableData(notPlatformDataSource);
    dispatch({
      type: 'riskMonitoring/checkNameRepeat',
      payload: {
        companyNameList: tableData.map((n) => n.companyName),
      },
    }).then((res) => {
      if (res) {
        this.setState({ step: 'next', notPlatformDataSource: tableData });
      }
    });
  }

  /**
   * 修改step状态
   */
  @Bind()
  handleGoNextStep() {
    const { selectedRowKeys, radioDefaultValue, notPlatformDataSource } = this.state;
    const tableData = getEditTableData(notPlatformDataSource);
    if (radioDefaultValue === 'platformBusiness' && isEmpty(selectedRowKeys)) {
      notification.warning({
        message: intl
          .get(`sslm.riskMonitoring.view.message.selectOneBusiness`)
          .d('至少选择一个企业'),
      });
    } else if (radioDefaultValue === 'notPlatformBusiness' && isEmpty(notPlatformDataSource)) {
      notification.warning({
        message: intl
          .get(`sslm.riskMonitoring.view.message.maintainOneBusiness`)
          .d('至少维护一个企业'),
      });
    } else if (
      radioDefaultValue === 'notPlatformBusiness' &&
      !isEmpty(notPlatformDataSource) &&
      isEmpty(tableData)
    ) {
      return false;
    } else if (radioDefaultValue === 'notPlatformBusiness') {
      this.checkNameRepeat();
    } else {
      this.setState({ step: 'next' });
    }
  }

  /**
   * 修改step状态
   */
  @Bind()
  handleGoLastStep() {
    this.setState({ step: 'current' });
  }

  /**
   * 保存选择组的值
   * @param {Array} checkedValues 已选的值
   */
  @Bind()
  handleCheckboxChange(checkedValues) {
    this.setState({ checkedValues });
  }

  /**
   * 确认加入监控
   */
  @Bind()
  handlePopConfirm() {
    const {
      dispatch,
      onSearchMonitoring,
      onClose,
      riskMonitoring: { monitoringPagination = {} },
    } = this.props;
    const { checkedValues, selectedRowKeys, radioDefaultValue, notPlatformDataSource } = this.state;
    if (isEmpty(checkedValues)) {
      notification.warning({
        message: intl.get(`sslm.riskMonitoring.view.message.selectOneGroup`).d('至少选择一个分组'),
      });
    } else {
      confirm({
        title: intl
          .get(`sslm.riskMonitoring.view.message.popconfirm.monitor`)
          .d('加入监控将会扣除监控额度，是否确认加入？'),
        // content: '',
        onOk: () => {
          dispatch({
            type: 'riskMonitoring/createMonitor',
            payload: {
              supplierDTO: selectedRowKeys,
              resultGroup: checkedValues,
              companyNameList: notPlatformDataSource.map((n) => n.companyName),
              isPlatformEnterprise: radioDefaultValue === 'platformBusiness' ? 1 : 0,
            },
          }).then((res) => {
            if (res) {
              notification.success();
              onSearchMonitoring(monitoringPagination);
              onClose();
            }
          });
        },
      });
    }
  }

  /**
   * 保存选中的行
   * @param {Array} selectedRowKeys
   */
  @Bind()
  handleSelectChange(selectedRowKeys) {
    this.setState({ selectedRowKeys });
  }

  /**
   * 重置
   */
  @Bind()
  handleFormReset() {
    this.props.form.resetFields();
  }

  /**
   * 选择企业类型回调
   */
  @Bind()
  handleRadioChange(e) {
    this.setState({ radioDefaultValue: e.target.value });
    if (e.target.value === 'platformBusiness') {
      this.setState({ notPlatformDataSource: [] });
    }
    if (e.target.value === 'notPlatformBusiness') {
      this.setState({ selectedRowKeys: [] });
    }
  }

  /**
   * 非平台企业新增
   */
  @Bind()
  handleAdd() {
    const { notPlatformDataSource } = this.state;
    this.setState({
      notPlatformDataSource: [
        { notPlatformId: uuidv4(), _status: 'create' },
        ...notPlatformDataSource,
      ],
    });
  }

  /**
   * 非平台企业取消操作
   */
  @Bind()
  handleCancel(record) {
    const { notPlatformId } = record;
    const { notPlatformDataSource } = this.state;
    const newList = notPlatformDataSource.filter((n) => n.notPlatformId !== notPlatformId);
    this.setState({ notPlatformDataSource: newList });
  }

  renderSelectSupplier() {
    const {
      loading,
      form: { getFieldDecorator },
      riskMonitoring: { supplierList = [], supplierPagination = {} },
    } = this.props;
    const { selectedRowKeys, radioDefaultValue, notPlatformDataSource } = this.state;
    const columns = [
      {
        title: intl.get(`sslm.riskMonitoring.model.riskMonitoring.companyNum`).d('企业编码'),
        dataIndex: 'companyNum',
        width: 180,
      },
      {
        title: intl.get(`sslm.riskMonitoring.model.riskMonitoring.companyName`).d('企业名称'),
        dataIndex: 'companyName',
      },
    ];
    const rowSelection = {
      selectedRowKeys,
      onChange: this.handleSelectChange,
    };
    const notPlatformColumns = [
      {
        title: intl.get(`sslm.riskMonitoring.model.riskMonitoring.companyName`).d('企业名称'),
        dataIndex: 'companyName',
        render: (_, record) => (
          <FormItem>
            {record.$form.getFieldDecorator('companyName', {
              initialValue: record.companyName,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl
                      .get(`sslm.riskMonitoring.model.riskMonitoring.companyName`)
                      .d('企业名称'),
                  }),
                },
              ],
            })(<Input />)}
          </FormItem>
        ),
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'option',
        width: 80,
        render: (_, record) => (
          <a onClick={() => this.handleCancel(record)}>
            {intl.get('hzero.common.button.cancel').d('取消')}
          </a>
        ),
      },
    ];
    return (
      <React.Fragment>
        <Row style={{ marginBottom: 24 }}>
          <Col span={3}>
            {intl
              .get(`sslm.riskMonitoring.model.riskMonitoring.selectBusinessType`)
              .d('选择企业类型')}
            :
          </Col>
          <Col span={21}>
            <RadioGroup onChange={this.handleRadioChange} value={radioDefaultValue}>
              <Radio value="platformBusiness">
                {intl
                  .get(`sslm.riskMonitoring.model.riskMonitoring.platformBusiness`)
                  .d('已合作平台企业')}
              </Radio>
              <Radio value="notPlatformBusiness">
                {intl
                  .get(`sslm.riskMonitoring.model.riskMonitoring.notPlatformBusiness`)
                  .d('非平台企业')}
              </Radio>
            </RadioGroup>
          </Col>
        </Row>
        {radioDefaultValue === 'platformBusiness' ? (
          <React.Fragment>
            <div className="table-list-search">
              <Form layout="inline">
                <Form.Item
                  label={intl
                    .get(`sslm.riskMonitoring.model.riskMonitoring.companyNum`)
                    .d('企业编码')}
                >
                  {getFieldDecorator('companyNum')(<Input inputChinese={false} />)}
                </Form.Item>
                <Form.Item
                  label={intl
                    .get(`sslm.riskMonitoring.model.riskMonitoring.companyName`)
                    .d('企业名称')}
                >
                  {getFieldDecorator('companyName')(<Input dbc2sbc={false} />)}
                </Form.Item>
                <Form.Item className="search-btn-more">
                  <Button onClick={this.handleFormReset}>
                    {intl.get('hzero.common.button.reset').d('重置')}
                  </Button>
                  <Button type="primary" htmlType="submit" onClick={this.handleSearchSupplier}>
                    {intl.get('hzero.common.button.search').d('查询')}
                  </Button>
                </Form.Item>
              </Form>
            </div>
            <Table
              bordered
              rowKey="companyId"
              loading={loading}
              dataSource={supplierList}
              columns={columns}
              pagination={supplierPagination}
              rowSelection={rowSelection}
              onChange={this.handleSearchSupplier}
            />
          </React.Fragment>
        ) : (
          <React.Fragment>
            <div style={{ textAlign: 'right', marginBottom: 24 }}>
              <Button type="primary" onClick={this.handleAdd}>
                {intl.get('hzero.common.button.add').d('新增')}
              </Button>
            </div>
            <EditTable
              bordered
              footer={null}
              pagination={false}
              rowKey="notPlatformId"
              columns={notPlatformColumns}
              dataSource={notPlatformDataSource}
            />
          </React.Fragment>
        )}
      </React.Fragment>
    );
  }

  renderSelectGroup() {
    const {
      riskMonitoring: { groupsList = [] },
    } = this.props;
    return (
      <React.Fragment>
        <div>
          {intl
            .get(`sslm.riskMonitoring.view.message.selectGroup.explain`)
            .d('请为您的供应商选择分组（至少选择一个）：')}
        </div>
        <Checkbox.Group style={{ width: '100%' }} onChange={this.handleCheckboxChange}>
          {groupsList.map((g) => (
            <Row style={{ marginTop: 16 }}>
              <Checkbox value={g.monitorGroupId}>{g.monitorGroupName}</Checkbox>
            </Row>
          ))}
        </Checkbox.Group>
      </React.Fragment>
    );
  }

  render() {
    const { createEnterpriceVisible, onClose, checkLoading } = this.props;
    const { step } = this.state;
    return (
      <Drawer
        title={
          step === 'current'
            ? intl.get(`sslm.riskMonitoring.view.message.title.selectSupplier`).d('选择企业')
            : intl.get(`sslm.riskMonitoring.view.message.title.selectGroup`).d('选择分组')
        }
        width={720}
        placement="right"
        onClose={onClose}
        maskClosable={false}
        visible={createEnterpriceVisible}
        style={{
          height: 'calc(100% - 55px)',
          overflow: 'auto',
          paddingBottom: 53,
        }}
      >
        {step === 'current' ? this.renderSelectSupplier() : this.renderSelectGroup()}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            width: '100%',
            padding: '10px 24px',
            textAlign: 'right',
            left: 0,
            background: '#fff',
            borderRadius: '0 0 4px 4px',
          }}
        >
          {step === 'current' ? (
            <Button onClick={this.handleGoNextStep} type="primary" loading={checkLoading}>
              {intl.get(`sslm.riskMonitoring.view.option.nextStep`).d('下一步')}
            </Button>
          ) : (
            <React.Fragment>
              <Button onClick={this.handleGoLastStep}>
                {intl.get(`sslm.riskMonitoring.view.option.lastStep`).d('上一步')}
              </Button>
              <Button type="primary" style={{ marginLeft: 8 }} onClick={this.handlePopConfirm}>
                {intl.get('hzero.common.button.confirm').d('确认')}
              </Button>
            </React.Fragment>
          )}
        </div>
      </Drawer>
    );
  }
}

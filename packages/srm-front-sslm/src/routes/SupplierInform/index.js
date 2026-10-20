/**
 * ChangeApplication - 供应商信息变更申请
 * @date: 2019-12-13
 * @author: WXM <xiaomin.wang01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import React, { Component, Fragment } from 'react';
import { Form, Spin, Modal, Input, Select, Row, Col } from 'hzero-ui';
import { isEmpty, isUndefined, pullAllBy, cloneDeep } from 'lodash';
import querystring from 'querystring';

import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import Lov from 'components/Lov';
import { Record } from 'choerodon-ui/dataset';
import CommonImport from 'components/Import';
import LovMulti from 'srm-front-cuz/lib/components/Customize/LovMulti/index';
import { dateRender } from 'utils/renderer';
import notification from 'utils/notification';
import EditTable from 'components/EditTable';
import { Button } from 'components/Permission';
import { Header, Content } from 'components/Page';
import ExcelExportPro from 'components/ExcelExportPro';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import formatterCollections from 'utils/intl/formatterCollections';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';

import ListTooltip from '@/routes/components/AiApprove/ListTooltip';
import FilterForm from './FilterForm';
import '@/routes/index.less';
import OperationRecords from './OperationRecords';

const FormItem = Form.Item;
const { Option } = Select;
const formLayOut = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

const customizeUnitCode = [
  'SSLM.SUPPLIER_INFORM_CHANGE_LIST.TABLE',
  'SSLM.SUPPLIER_INFORM_CHANGE_LIST.CREATE_FORM',
  'SSLM.SUPPLIER_INFORM_CHANGE_LIST.SEARCH',
];

@connect(({ supplierInform, loading }) => ({
  supplierInform,
  saveApplicationLoading: loading.effects['supplierInform/saveApplication'],
  operateLoading:
    loading.effects['supplierInform/deleteApplication'] ||
    loading.effects['supplierInform/queryApplication'] ||
    loading.effects['supplierInform/querySupplierInfo'],
  queryRecordLoading: loading.effects['supplierInform/queryApplicationRecord'],
  tenantId: getCurrentOrganizationId(),
}))
@formatterCollections({
  code: ['sslm.supplierInform', 'sslm.enterpriseInform', 'sslm.supplierKpiIndicator'],
})
@Form.create({ fieldNameProp: null })
@withCustomize({
  unitCode: [
    'SSLM.SUPPLIER_INFORM_CHANGE_LIST.TABLE',
    'SSLM.SUPPLIER_INFORM_CHANGE_LIST.CREATE_FORM',
    'SSLM.SUPPLIER_INFORM_CHANGE_LIST.SEARCH',
    'SSLM.SUPPLIER_INFORM_CHANGE_LIST.BTNS',
  ],
})
export default class ChangeApplication extends Component {
  state = {
    selectedRowKeys: [], // 选中的rowKeys
    operReVisible: false, // 操作记录模态框的显示/隐藏
    changeReqId: null, // 当前申请单id
    supplierVisible: false, // 新增模态框的显示/隐藏
    code: {}, // 值集数据集合
  };

  form;

  componentDidMount() {
    const {
      supplierInform: { applicationPagination },
    } = this.props;
    this.queryCode();
    this.handleApplication(applicationPagination);
  }

  /**
   * 绑定form
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  /**
   * 值集查询
   */
  @Bind()
  queryCode() {
    const { dispatch, tenantId } = this.props;
    const lovCodes = {
      applicationStatus: 'SSLM.SUPPLIER_CHANGE_REQ_STATUS',
      latitudeList: 'SSLM.SUPPLIER_CHANGE_LEVEL',
      tenantId,
    };
    dispatch({
      type: 'supplierInform/init',
      payload: lovCodes,
    }).then(res => {
      if (res) {
        this.setState({ code: res });
      }
    });
  }

  /**
   * 选中项发生变化时的回调
   */
  @Bind()
  handleSelectChange(selectedRowKeys) {
    this.setState({ selectedRowKeys });
  }

  /**
   * 操作记录模态框的显示/隐藏
   */
  @Bind
  handleVisible(record) {
    const { operReVisible } = this.state;
    this.setState({
      operReVisible: !operReVisible,
      changeReqId: record.changeReqId,
    });
  }

  /**
   * 查询操作记录
   */
  @Bind()
  handleRecords(page) {
    const { dispatch } = this.props;
    const { changeReqId } = this.state;
    dispatch({
      type: 'supplierInform/queryApplicationRecord',
      payload: {
        page,
        changeReqId,
      },
    });
  }

  /**
   * 查询申请单
   */
  @Bind()
  handleApplication(page) {
    const { dispatch } = this.props;
    const formValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    const filterValues = {
      ...formValues,
      startDate: formValues.startDate && formValues.startDate.format(DATETIME_MIN),
      endDate: formValues.endDate && formValues.endDate.format(DATETIME_MAX),
    };
    dispatch({
      type: 'supplierInform/queryApplication',
      payload: {
        page,
        ...filterValues,
        customizeUnitCode: [customizeUnitCode[0], customizeUnitCode[2]].join(),
      },
    });
  }

  /**
   * 新建申请单
   */
  @Bind()
  handleAddApplication() {
    const {
      form: { resetFields },
    } = this.props;
    const { supplierVisible } = this.state;
    this.setState({ supplierVisible: !supplierVisible });
    resetFields();
  }

  /**
   * 取消关闭模态框
   */
  @Bind()
  handleCancelApplication() {
    this.setState({ supplierVisible: false });
  }

  /**
   * 保存申请单
   */
  @Bind()
  handleSaveApplication() {
    const {
      dispatch,
      form: { validateFields },
    } = this.props;
    validateFields((err, fieldsValue) => {
      if (!err) {
        const tableValues = [{ ...fieldsValue }];
        dispatch({
          type: 'supplierInform/saveApplication',
          payload: {
            tableValues,
            customizeUnitCode: customizeUnitCode[1],
          },
        }).then(res => {
          if (res && Array.isArray(res) && res.length !== 0) {
            notification.success();
            this.handleDetails(res[0]);
          }
        });
      }
    });
  }

  /**
   * 接口删除
   */
  @Bind()
  deleteExistRows(deleteRowKeys) {
    const {
      dispatch,
      supplierInform: { applicationPagination },
    } = this.props;
    dispatch({
      type: 'supplierInform/deleteApplication',
      payload: {
        changeReqIdList: deleteRowKeys,
      },
    }).then(res => {
      if (res) {
        this.setState({ selectedRowKeys: [] });
        notification.success();
        this.handleApplication(applicationPagination);
      }
    });
  }

  /**
   * 更新数据删除
   */
  @Bind()
  deleteNewRows(newList) {
    const { dispatch } = this.props;
    dispatch({
      type: 'supplierInform/updateState',
      payload: {
        applicationList: newList,
      },
    });
    notification.success();
    this.setState({ selectedRowKeys: [] });
  }

  /**
   * 删除提示框
   */
  @Bind()
  deleteConfirm(onOk) {
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据?'),
      onOk,
    });
  }

  /**
   * 删除行
   */
  @Bind()
  handleDeleteApplication() {
    const {
      dispatch,
      supplierInform: { applicationList, applicationPagination },
    } = this.props;
    const { selectedRowKeys } = this.state;
    const newApplicationList = cloneDeep(applicationList);
    // 根据selectedRowKeys查找出选中行
    const selectedRows = [];
    applicationList.forEach(i => {
      selectedRowKeys.forEach(j => {
        if (i.changeReqId === j) {
          selectedRows.push(i);
        }
      });
    });

    if (!isEmpty(selectedRows)) {
      // 选中行的新建行
      const newRows = selectedRows.filter(n => n._status === 'create');
      // 选中行的已有行
      const existRows = selectedRows.filter(n => n._status !== 'create');

      const newList = pullAllBy(newApplicationList, newRows, 'changeReqId');
      if (isEmpty(newRows)) {
        this.deleteConfirm(() => this.deleteExistRows(selectedRowKeys));
      } else if (isEmpty(existRows)) {
        this.deleteConfirm(() => this.deleteNewRows(newList));
      } else {
        Modal.confirm({
          title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据?'),
          onOk: () => {
            dispatch({
              type: 'supplierInform/deleteApplication',
              payload: {
                changeReqIdList: existRows.map(n => n.changeReqId),
              },
            }).then(res => {
              if (res) {
                this.handleApplication(applicationPagination);
                dispatch({
                  type: 'supplierInform/updateState',
                  payload: {
                    applicationList: newList,
                  },
                });
                notification.success();
                this.setState({ selectedRowKeys: [] });
              }
            });
          },
        });
      }
    }
  }

  /**
   * 跳转至供应商变更明细界面
   */
  @Bind()
  handleDetails(record) {
    const { history } = this.props;
    const { changeReqId, companyId, supplierCompanyId } = record;
    history.push({
      pathname: `/sslm/supplier-inform-change/detail/${changeReqId}/${companyId}`,
      search: querystring.stringify({
        supplierCompanyId,
      }),
    });
  }

  /**
   * 变更纬度改变时的回调
   */
  @Bind()
  handleLevelChange(setFieldsValue) {
    setFieldsValue({
      companyNum: null,
      companyIds: null,
    });
  }

  // 获取导出参数
  @Bind()
  handleExportParams() {
    const { selectedRowKeys } = this.state;
    const formValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    const filterValues = {
      ...formValues,
      startDate: formValues.startDate && formValues.startDate.format(DATETIME_MIN),
      endDate: formValues.endDate && formValues.endDate.format(DATETIME_MAX),
    };
    const changeReqIds = selectedRowKeys.join();
    return { ...filterValues, changeReqIds };
  }

  render() {
    const {
      saveApplicationLoading,
      operateLoading,
      queryRecordLoading,
      supplierInform: { applicationList, applicationPagination, recordsList, recordsPagination },
      tenantId,
      customizeTable,
      customizeForm,
      customizeFilterForm,
      customizeBtnGroup,
      form,
      form: { getFieldDecorator, getFieldValue, setFieldsValue },
    } = this.props;
    const { operReVisible, selectedRowKeys, supplierVisible, code = {} } = this.state;

    const columns = [
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.applicationState').d('申请状态'),
        dataIndex: 'reqStatusMeaning',
        width: 100,
      },
      {
        dataIndex: 'aiApproveStatus',
        title: intl.get('sslm.common.button.intelligentReview').d('智能预审'),
        width: 140,
        render: (value, record) => {
          return value ? (
            <ListTooltip value={value} name="aiApproveStatus" record={new Record(record)} />
          ) : (
            '-'
          );
        },
      },
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.applicationNum').d('申请单号'),
        dataIndex: 'changeReqNumber',
        width: 140,
        render: (val, record) => <a onClick={() => this.handleDetails(record)}>{val}</a>,
      },
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.latitudeChange').d('变更维度'),
        dataIndex: 'changeLevelMeaning',
        width: 140,
      },
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.enterpriseNum').d('企业编码'),
        dataIndex: 'companyNum',
        width: 130,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('companyNum', {
                initialValue: val,
              })(<Input disabled />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.enterpriseName').d('企业名称'),
        dataIndex: 'companyName',
        width: 180,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('companyId', {
                initialValue: record.companyId,
                rules: [
                  {
                    required: record.$form.getFieldValue('changeLevel') === 'COMPANY',
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('sslm.supplierInform.model.supplierInform.enterpriseName')
                        .d('企业名称'),
                    }),
                  },
                ],
              })(
                <Lov
                  code="SPFM.USER_AUTHORITY_COMPANY"
                  queryParams={{ tenantId }}
                  disabled={record.$form.getFieldValue('changeLevel') !== 'COMPANY'}
                  onChange={(_, lovRecord) => {
                    record.$form.setFieldsValue({
                      companyNum: lovRecord.companyNum,
                      supplierCompanyId: null,
                    });
                  }}
                />
              )}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.supplier').d('对应变更供应商'),
        dataIndex: 'supplierCompanyName',
        width: 180,
      },
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.creator').d('创建人'),
        dataIndex: 'createUserName',
        width: 80,
      },
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.creationDate').d('创建日期'),
        dataIndex: 'creationDate',
        width: 100,
        render: dateRender,
      },
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.operationRecords').d('操作记录'),
        width: 100,
        dataIndex: 'option',
        render: (_, record) => (
          <a onClick={() => this.handleVisible(record)}>
            {intl.get('sslm.supplierInform.model.supplierInform.operationRecords').d('操作记录')}
          </a>
        ),
      },
    ];

    const rowSelection = {
      selectedRowKeys,
      onChange: this.handleSelectChange,
    };
    const filterFormProps = {
      code,
      tenantId,
      onRef: this.handleBindRef,
      onSearch: this.handleApplication,
      customizeFilterForm,
      customizeCode: 'SSLM.SUPPLIER_INFORM_CHANGE_LIST.SEARCH',
    };
    const operationRecordsProps = {
      loading: queryRecordLoading,
      onChange: this.handleRecords,
      dataSource: recordsList,
      pagination: recordsPagination,
    };

    return (
      <Fragment>
        <Header
          title={intl.get('sslm.supplierInform.view.title.changeSupplier').d('供应商信息变更')}
        >
          {customizeBtnGroup(
            {
              code: 'SSLM.SUPPLIER_INFORM_CHANGE_LIST.BTNS',
            },
            [
              <Button
                data-name="add"
                icon="plus"
                type="primary"
                loading={operateLoading}
                onClick={this.handleAddApplication}
                permissionList={[
                  {
                    code: 'srm.partner.my-partner.supplier-inform-change.ps.head.add',
                    type: 'button',
                    meaning: '供应商信息变更-新建',
                  },
                ]}
              >
                {intl.get('hzero.common.button.create').d('新建')}
              </Button>,
              <Button
                data-name="delete"
                icon="delete"
                disabled={isEmpty(selectedRowKeys)}
                loading={operateLoading}
                onClick={this.handleDeleteApplication}
                permissionList={[
                  {
                    code: 'srm.partner.my-partner.supplier-inform-change.ps.head.delete',
                    type: 'button',
                    meaning: '供应商信息变更-删除',
                  },
                ]}
              >
                {intl.get('hzero.common.button.delete').d('删除')}
              </Button>,
              <CommonImport
                refreshButton
                tenantId={tenantId}
                prefixPatch={SRM_SSLM}
                data-name="buyerImport"
                businessObjectTemplateCode="SRM_C_SRM_SSLM_SUPPLIER_CHANGE_REQ_PURCHASE_AGENT_IMPORT"
                buttonText={intl
                  .get('sslm.supplierInform.button.buyerUpdateImport')
                  .d('供应商信息更新导入')}
                buttonTooltip={intl
                  .get('sslm.supplierInform.view.message.buyerUpdateImportMsg')
                  .d(
                    '该导入成功后会直接依据导入表格数据从上到下依次按行数据修改供应商主数据信息，不产生单据不触发审批！'
                  )}
                buttonProps={{
                  permissionList: [
                    {
                      code: 'srm.partner.my-partner.supplier-inform-change.api.purchase.agent',
                      type: 'button',
                      meaning: '供应商信息变更-供应商信息更新导入',
                    },
                  ],
                }}
              />,
              <ExcelExportPro
                data-name="excelExport"
                requestUrl={`${SRM_SSLM}/v1/${tenantId}/supplier-change-reqs/export`}
                templateCode="SRM_C_SRM_SSLM_SUPPLIER_CHANGE_REQ_EXPORT"
                buttonText={intl.get('hzero.common.button.export').d('导出')}
                otherButtonProps={{
                  type: 'c7n-pro',
                  icon: 'unarchive',
                }}
                queryParams={() => this.handleExportParams()}
              />,
            ]
          )}
        </Header>
        <Content>
          <Spin spinning={operateLoading || false}>
            <div className="table-list-search">
              <FilterForm {...filterFormProps} />
            </div>
            {customizeTable(
              {
                code: 'SSLM.SUPPLIER_INFORM_CHANGE_LIST.TABLE',
                clearCache: (a, b, cb) => {
                  if (a !== b) cb(a);
                },
                useNewValid: true,
              },
              <EditTable
                bordered
                rowKey="changeReqId"
                columns={columns}
                rowSelection={rowSelection}
                dataSource={applicationList}
                onChange={this.handleApplication}
                pagination={applicationPagination}
                scroll={{ y: 'calc(100vh - 386px)' }}
              />
            )}
          </Spin>
        </Content>
        <Modal
          width={620}
          footer={null}
          destroyOnClose
          visible={operReVisible}
          onCancel={this.handleVisible}
          title={intl
            .get('sslm.supplierInform.model.supplierInform.operationRecords')
            .d('操作记录')}
        >
          <OperationRecords {...operationRecordsProps} />
        </Modal>
        <Modal
          width={480}
          className="choose-enterprise-modal"
          visible={supplierVisible}
          onOk={this.handleSaveApplication}
          onCancel={this.handleCancelApplication}
          confirmLoading={saveApplicationLoading}
          title={intl.get('sslm.supplierKpiIndicator.view.title.choiceClassify').d('选择供应商')}
        >
          <Spin spinning={saveApplicationLoading || false}>
            {getFieldDecorator('companyName')}
            {getFieldDecorator('supplierCompanyName')}
            {customizeForm(
              {
                code: 'SSLM.SUPPLIER_INFORM_CHANGE_LIST.CREATE_FORM',
                form,
                isCreate: true,
              },
              <Form className="choose-enterprise">
                <Row>
                  <Col span={24}>
                    <FormItem
                      label={intl
                        .get('sslm.supplierInform.model.supplierInform.latitudeChange')
                        .d('变更维度')}
                      {...formLayOut}
                    >
                      {getFieldDecorator('changeLevel', {
                        rules: [
                          {
                            required: true,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl
                                .get('sslm.supplierInform.model.supplierInform.latitudeChange')
                                .d('变更维度'),
                            }),
                          },
                        ],
                      })(
                        <Select
                          allowClear
                          style={{ width: '100%' }}
                          onChange={() => this.handleLevelChange(setFieldsValue)}
                        >
                          {code.latitudeList &&
                            code.latitudeList.map(n => (
                              <Option value={n.value} key={n.value}>
                                {n.meaning}
                              </Option>
                            ))}
                        </Select>
                      )}
                    </FormItem>
                  </Col>
                </Row>
                <Row>
                  <Col span={24}>
                    <FormItem
                      label={intl
                        .get('sslm.supplierInform.model.supplierInform.purchasingCompany')
                        .d('采购方公司')}
                      {...formLayOut}
                    >
                      {getFieldDecorator('companyId', {
                        rules: [
                          {
                            required: getFieldValue('changeLevel') === 'COMPANY',
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl
                                .get('sslm.supplierInform.model.supplierInform.purchasingCompany')
                                .d('采购方公司'),
                            }),
                          },
                        ],
                      })(
                        <Lov
                          code="SPFM.USER_AUTHORITY_COMPANY"
                          queryParams={{
                            tenantId,
                            supplierCompanyId: getFieldValue('supplierCompanyId'),
                          }}
                          textField="companyName"
                          disabled={getFieldValue('changeLevel') !== 'COMPANY'}
                          onChange={(_, lovRecord) => {
                            setFieldsValue({
                              companyNum: lovRecord.companyNum,
                              companyIds: null,
                            });
                          }}
                        />
                      )}
                      {getFieldDecorator('companyNum', {})}
                    </FormItem>
                  </Col>
                </Row>
                <Row>
                  <Col span={24}>
                    <FormItem
                      label={intl
                        .get('sslm.supplierInform.model.supplierInform.title.supplier')
                        .d('供应商')}
                      {...formLayOut}
                    >
                      {getFieldDecorator('supplierCompanyId', {
                        rules: [
                          {
                            required: true,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl
                                .get('sslm.supplierInform.model.supplierInform.title.supplier')
                                .d('供应商'),
                            }),
                          },
                        ],
                      })(
                        <Lov
                          code="SSLM.TENANT_SUPPLIER_CATE"
                          textField="supplierCompanyName"
                          queryParams={{
                            companyId: getFieldValue('companyId'),
                            tenantId,
                            asyncCountFlag: 'Y',
                          }}
                          onChange={(_, lovRecord) => {
                            setFieldsValue({
                              supplierTenantId: lovRecord.supplierTenantId,
                            });
                          }}
                          lovOptions={{
                            displayField: 'supplierCompanyName',
                            valueField: 'supplierCompanyId',
                          }}
                        />
                      )}
                      {getFieldDecorator('supplierTenantId', {})}
                    </FormItem>
                  </Col>
                </Row>
                {/* 变更维度等于集团集时隐藏 */}
                {getFieldValue('changeLevel') === 'COMPANY' && (
                  <Row>
                    <Col span={24}>
                      <FormItem
                        label={intl
                          .get('sslm.supplierInform.model.supplierInform.expandCompany')
                          .d('拓展公司')}
                        {...formLayOut}
                        extra={intl
                          .get('sslm.supplierInform.model.supplierInform.title.expandCompanyInfo')
                          .d('此次变更的内容将自动同步至选择的其他子公司')}
                      >
                        {getFieldDecorator('companyIds')(
                          <LovMulti
                            delimma=","
                            code="SSLM_SUPPLIER_CHANGE_EXTEND_COMPANY"
                            queryParams={{
                              tenantId,
                              supplierCompanyId: getFieldValue('supplierCompanyId'),
                              companyIds: getFieldValue('companyId'),
                            }}
                          />
                        )}
                      </FormItem>
                    </Col>
                  </Row>
                )}
              </Form>
            )}
          </Spin>
        </Modal>
      </Fragment>
    );
  }
}

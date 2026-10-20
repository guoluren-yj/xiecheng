/**
 * TermsForm - 付款条款定义弹出框
 * @date: 2018-7-11
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { connect } from 'dva';
import uuidv4 from 'uuid/v4';
import { Row, Col, Form, Input, Button, Modal, InputNumber } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty, filter, isArray } from 'lodash';
import intl from 'utils/intl';
import Lov from 'components/Lov';
import EditTable from 'components/EditTable';
import Checkbox from 'components/Checkbox';
import TLEditor from 'components/TLEditor';
import Switch from 'components/Switch';
import { enableRender } from 'utils/renderer';
import { addItemToPagination, delItemToPagination, getEditTableData } from 'utils/utils';
import classNames from 'classnames';
import { EDIT_FORM_ROW_LAYOUT, FORM_COL_2_LAYOUT } from 'utils/constants';

// import TopForm from './TopForm';
import styles from './index.less';

/**
 * 使用 Form.Item 组件
 */
const FormItem = Form.Item;
/**
 * modal的侧滑属性
 */
const otherProps = {
  wrapClassName: 'ant-modal-sidebar-right',
  transitionName: 'move-right',
};

/**
 * 付款条款弹出框
 * @extends {Component} - React.Component
 * @reactProps {Object} paymentTerms - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */

@connect(({ paymentTerms, loading }) => ({
  paymentTerms,
  fetchAllDataLoading: loading.effects['paymentTerms/fetchAllData'],
}))
@Form.create({ fieldNameProp: null })
export default class TermsForm extends React.PureComponent {
  /**
   *Creates an instance of TermsForm.
   * @param {object} props 属性
   */
  constructor(props) {
    super(props);
    this.PageSize = 10;
  }

  /**
   * modal点击确认方法
   */
  @Bind()
  okHandle() {
    const {
      form,
      handleAdd,
      paymentTerms: { allData = {}, termData = [] },
    } = this.props;
    let datalist = {};
    const editDataSource = filter(termData, (r) => r._status);
    form.validateFields((err, fieldsValue) => {
      if (!err) {
        const params = getEditTableData(editDataSource, ['termDtlId']);
        if (isArray(params) && !(editDataSource.length !== 0 && params.length === 0)) {
          datalist = {
            ...allData,
            ...fieldsValue,
            paymentTermDtlDTOList: undefined,
            paymentTermDtlList: params,
          };
          handleAdd(datalist, form);
        }
      }
    });
  }

  /**
   * modal点击取消
   */
  @Bind()
  cancelHandle() {
    const { showEditModal } = this.props;
    this.PageSize = 10;
    showEditModal(false);
  }

  /**
   * 新增一条数据
   * @memberof paymentUsages
   */
  @Bind()
  addData() {
    const {
      dispatch,
      paymentTerms: { tenantId, termData = [], termPagination = {} },
    } = this.props;
    const termDtlId = `usageId${uuidv4()}`;
    const newRecord = {
      termDtlId,
      enabledFlag: 1,
      acceptFlag: 1,
      invoiceFlag: 1,
      isCreate: true,
      _status: 'create',
      tenantId,
    };
    const newTermData = [newRecord, ...termData];
    dispatch({
      type: 'paymentTerms/updateState',
      payload: {
        termData: newTermData,
        termPagination: addItemToPagination(newTermData.length, termPagination),
      },
    });
  }

  /**
   * 点击行内取消按钮
   * @param {Object} record 当前行记录
   * @memberof paymentUsages
   */
  @Bind()
  cancel(record) {
    const {
      paymentTerms: { termData = [], termPagination = {} },
      dispatch,
    } = this.props;
    if (record._status === 'create') {
      const newDataSource = termData.filter((item) => item.termDtlId !== record.termDtlId);
      dispatch({
        type: 'paymentTerms/updateState',
        payload: {
          termData: newDataSource,
          termPagination: delItemToPagination(newDataSource.length, termPagination),
        },
      });
    } else {
      this.editTerms(record, false);
    }
  }

  /**
   * 使当前行变成可编辑状态
   * @param {Object} record 当前行记录
   * @param {boolean} flag 编辑状态
   * @memberof paymentUsages
   */
  @Bind()
  editTerms(record, flag) {
    const {
      dispatch,
      paymentTerms: { termData = [] },
    } = this.props;
    const index = termData.findIndex((item) => item.termDtlId === record.termDtlId);
    dispatch({
      type: 'paymentTerms/updateState',
      payload: {
        termData: [
          ...termData.slice(0, index),
          {
            ...record,
            _status: flag,
          },
          ...termData.slice(index + 1),
        ],
      },
    });
  }

  /**
   * 分页change事件
   */
  handleTableChange = (payload = {}) => {
    const { dispatch, editRowData } = this.props;
    dispatch({
      type: 'paymentTerms/fetchAllData',
      payload: {
        termId: editRowData.termId,
        page: isEmpty(payload) ? {} : payload,
        customizeUnitCode: 'SMDM.PAYMENT-TERMS.DETAIL_LIST,SMDM.PAYMENT-TERMS.DETAIL',
      },
    });
  };

  @Bind()
  renderForm() {
    const {
      form,
      paymentTerms: { allData = {} },
      customizeForm,
      readOnlyFlag,
    } = this.props;
    const {
      termCode,
      termName,
      enabledFlag,
      defaultFlag,
      _token,
      externalSystemCode,
      priority,
      companyId,
      companyName,
    } = allData;
    const formLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 12 },
    };
    const formLayoutSwith = {
      labelCol: { span: 16 },
      wrapperCol: { span: 8 },
    };
    return customizeForm(
      {
        code: 'SMDM.PAYMENT-TERMS.DETAIL', // 必传，和unitCode一一对应
        form, // 无论个性化单元是否只读，均必传
        dataSource: allData, // 必传，从后端接口获取到的数据
      },
      <Form>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_2_LAYOUT}>
            <FormItem
              {...formLayout}
              label={intl.get('smdm.paymentTerms.model.paymentTerms.termCode').d('条款代码')}
            >
              {form.getFieldDecorator('termCode', {
                initialValue: termCode,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('smdm.paymentTerms.model.paymentTerms.termCode').d('条款代码'),
                    }),
                  },
                  {
                    max: 30,
                    message: intl.get('hzero.common.validation.max', {
                      max: 30,
                    }),
                  },
                ],
              })(
                <Input inputChinese={false} disabled={!!termCode || externalSystemCode === 'ERP' || readOnlyFlag} />
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_2_LAYOUT}>
            <FormItem
              {...formLayout}
              label={intl.get('smdm.paymentTerms.model.paymentTerms.termName').d('条款名称')}
            >
              {form.getFieldDecorator('termName', {
                initialValue: termName,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('smdm.paymentTerms.model.paymentTerms.termName').d('条款名称'),
                    }),
                  },
                  {
                    max: 80,
                    message: intl.get('hzero.common.validation.max', {
                      max: 80,
                    }),
                  },
                ],
              })(
                <TLEditor
                  label={intl.get('smdm.paymentTerms.model.paymentTerms.termName').d('条款名称')}
                  field="termName"
                  token={_token}
                  disabled={externalSystemCode === 'ERP' || readOnlyFlag}
                />
                // <Input disabled={externalSystemCode === 'ERP'} />
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_2_LAYOUT}>
            <FormItem {...formLayoutSwith} label={intl.get('hzero.common.status.enable').d('启用')}>
              {form.getFieldDecorator('enabledFlag', {
                initialValue: enabledFlag === undefined ? 1 : enabledFlag,
              })(<Switch disabled={externalSystemCode === 'ERP' || readOnlyFlag} />)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_2_LAYOUT}>
            <FormItem
              {...formLayout}
              label={intl.get('smdm.paymentTerms.model.paymentTerms.defaultFlag').d('是否默认')}
            >
              {form.getFieldDecorator('defaultFlag', {
                initialValue: defaultFlag === undefined ? 0 : defaultFlag,
              })(<Switch disabled={externalSystemCode === 'ERP' || readOnlyFlag} />)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_2_LAYOUT}>
            <FormItem
              {...formLayout}
              label={intl.get('smdm.common.model.common.externalSystemCode').d('来源系统')}
            >
              {form.getFieldDecorator('externalSystemCode', {
                initialValue: externalSystemCode,
              })(<Input disabled />)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_2_LAYOUT}>
            <FormItem
              {...formLayout}
              label={intl.get('smdm.paymentTerms.model.paymentTerms.priority').d('优先级')}
            >
              {form.getFieldDecorator('priority', {
                initialValue: priority,
              })(<InputNumber min={0} step={1} precision={0} disabled={readOnlyFlag} />)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_2_LAYOUT}>
            <FormItem {...formLayout} label={intl.get('entity.company.tag').d('公司')}>
              {form.getFieldDecorator('companyId', {
                initialValue: companyId,
              })(
                <Lov
                  code="SPFM.USER_AUTHORITY_COMPANY"
                  extSetMap="companyName"
                  textValue={companyName}
                  disabled={readOnlyFlag}
                />
              )}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }

  /**
   * 渲染方法
   * @returns
   */
  render() {
    const {
      modalLoading,
      modalVisible,
      fetchAllDataLoading,
      paymentTerms: { allData = {}, termData = [], termPagination = {} },
      customizeTable,
      readOnlyFlag
    } = this.props;
    const { externalSystemCode } = allData;
    const columns = [
      {
        title: intl.get('smdm.paymentTerms.model.paymentTerms.termDtlCode').d('明细代码'),
        dataIndex: 'termDtlCode',
        width: 100,
        render: (text, record) => {
          const { $form } = record;
          return record._status ? (
            <FormItem>
              {$form.getFieldDecorator(`termDtlCode`, {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('smdm.paymentTerms.model.paymentTerms.termDtlCode')
                        .d('明细代码'),
                    }),
                  },
                  {
                    max: 30,
                    message: intl.get('hzero.common.validation.max', {
                      max: 30,
                    }),
                  },
                ],
                initialValue: record.termDtlCode,
              })(<Input trim inputChinese={false} maxLength={30} disabled={!record.isCreate} />)}
            </FormItem>
          ) : (
            <div>{text}</div>
          );
        },
      },
      {
        title: intl.get('smdm.paymentTerms.model.paymentTerms.termDtlDesc').d('明细条款'),
        dataIndex: 'termDtlDesc',
        width: 200,
        render: (text, record) => {
          const { $form } = record;
          return record._status ? (
            <FormItem>
              {$form.getFieldDecorator(`termDtlDesc`, {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('smdm.paymentTerms.model.paymentTerms.termDtlDesc')
                        .d('明细条款'),
                    }),
                  },
                  {
                    max: 120,
                    message: intl.get('hzero.common.validation.max', {
                      max: 120,
                    }),
                  },
                ],
                initialValue: record.termDtlDesc,
              })(<Input />)}
            </FormItem>
          ) : (
            <div>{text}</div>
          );
        },
      },
      {
        title: intl.get('smdm.paymentTerms.model.paymentTerms.invoiceFlag').d('需要发票'),
        dataIndex: 'invoiceFlag',
        width: 120,
        // align: 'center',
        render: (text, record) => {
          const { $form } = record;
          return record._status ? (
            <FormItem>
              {$form.getFieldDecorator(`invoiceFlag`, {
                initialValue: record.invoiceFlag,
              })(<Checkbox />)}
            </FormItem>
          ) : (
            <div>{enableRender(text)}</div>
          );
        },
      },
      {
        title: intl.get('smdm.paymentTerms.model.paymentTerms.acceptFlag').d('需要验收'),
        dataIndex: 'acceptFlag',
        width: 120,
        // align: 'center',
        render: (text, record) => {
          const { $form } = record;
          return record._status ? (
            <FormItem>
              {$form.getFieldDecorator(`acceptFlag`, {
                initialValue: record.acceptFlag,
              })(<Checkbox />)}
            </FormItem>
          ) : (
            <div>{enableRender(text)}</div>
          );
        },
      },
      {
        title: intl.get('hzero.common.status.enable').d('启用'),
        dataIndex: 'enabledFlag',
        width: 80,
        align: 'center',
        render: (text, record) => {
          const { $form } = record;
          return record._status ? (
            <FormItem>
              {$form.getFieldDecorator(`enabledFlag`, {
                initialValue: record.enabledFlag,
              })(<Checkbox />)}
            </FormItem>
          ) : (
            <div>{enableRender(text)}</div>
          );
        },
      },
      !readOnlyFlag && {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'option',
        width: 150,
        // align: 'center',
        render: (_, record) => {
          return (
            <div>
              {record._status ? (
                <a onClick={() => this.cancel(record)}>
                  {record.isCreate
                    ? intl.get('hzero.common.button.clean').d('清除')
                    : intl.get('hzero.common.button.cancel').d('取消')}
                </a>
              ) : record.sourceName === 'ERP' ? (
                <div>{intl.get('hzero.common.button.edit').d('编辑')}</div>
              ) : (
                <a onClick={() => this.editTerms(record, 'update')}>
                  {intl.get('hzero.common.button.edit').d('编辑')}
                </a>
              )}
            </div>
          );
        },
      },
    ].filter((v) => v);
    return (
      <Modal
        {...otherProps}
        title={intl.get('smdm.paymentTerms.view.message.title.list.modal').d('付款条款')}
        confirmLoading={modalLoading}
        visible={modalVisible}
        destroyOnClose
        // onOk={() => this.okHandle()}
        width={800}
        onCancel={() => this.cancelHandle()}
        footer={
          <div className={styles['footer-btn']}>
            {
              readOnlyFlag ? [
                <Button key="cancel" type="primary" onClick={() => this.cancelHandle()}>
                  {intl.get('hzero.common.button.close').d('关闭')}
                </Button>,
              ] : <React.Fragment>
                  <Button key="back" onClick={() => this.cancelHandle()}>
                    {intl.get('hzero.common.button.cancel').d('取消')}
                  </Button>
                  <Button  type="primary" loading={modalLoading} key="submit" onClick={() => this.okHandle()}>
                    {intl.get('hzero.common.button.sure').d('确定')}
                  </Button>
              </React.Fragment>
            }
          </div>
        }
      >
        <React.Fragment>
          <Row>{this.renderForm()}</Row>
          <Row>
            <Col offset={2}>
              {externalSystemCode !== 'ERP' && !readOnlyFlag && (
                <div className="table-list-operator" style={{ textAlign: 'right' }}>
                  <Button icon="plus" type="primary" onClick={() => this.addData()}>
                    {intl.get('smdm.paymentTerms.view.detail.button.create').d('新建明细代码')}
                  </Button>
                </div>
              )}
            </Col>
          </Row>
          <Row>
            <Col offset={2}>
              {customizeTable(
                {
                  code: 'SMDM.PAYMENT-TERMS.DETAIL_LIST',
                },
                <EditTable
                  loading={fetchAllDataLoading}
                  rowKey="termDtlId"
                  dataSource={termData}
                  columns={columns}
                  pagination={termPagination}
                  onChange={this.handleTableChange}
                  className={classNames(styles['smdm-paymentTerms-list'])}
                  bordered
                />
              )}
            </Col>
          </Row>
        </React.Fragment>
      </Modal>
    );
  }
}

/**
 * QuotationTemplate - 报价模板
 * @date: 2019-08-15
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2019, Hand
 */

import uuidv4 from 'uuid/v4';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { isUndefined, isEmpty } from 'lodash';
import React, { Component, Fragment } from 'react';
import { Button, Form, Input, Select, Spin, Tooltip, Icon, Modal } from 'hzero-ui';

import intl from 'utils/intl';
import { routerRedux } from 'dva/router';
import TLEditor from 'components/TLEditor';
import EditTable from 'components/EditTable';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import { filterNullValueObject, getEditTableData } from 'utils/utils';

import FilterForm from './FilterForm';
import AssignCategoryModal from './AssignCategoryModal';
import AssignMaterialModal from './AssignMaterialModal';

const FormItem = Form.Item;
const { Option } = Select;
const promptCode = 'ssrc.quotationTemplate';

@formatterCollections({ code: ['ssrc.quotationTemplate', 'spfm.investigationDefinition'] })
@connect(({ quotationTemplate, loading }) => ({
  quotationTemplate,
  queryTemplateLoading: loading.effects['quotationTemplate/queryQuotationTemplate'],
  saveTemplateLoading: loading.effects['quotationTemplate/saveQuotationTemplate'],
  unlockLoading: loading.effects['quotationTemplate/unlockQuotationTemplate'],
  releaseLoading: loading.effects['quotationTemplate/releaseQuotationTemplate'],
}))
export default class QuotationTemplate extends Component {
  state = {
    templateId: undefined, // 当前行id
    currentRow: {}, // 当前行
    quotationDimensionType: undefined, // 维度
    assignCategoryVisible: false, // 分配品类的visible
    assignMaterialVisible: false, // 分配物料的visible
  };

  form;

  componentDidMount() {
    this.handleDimensionCode();
    this.handleQuotationTemplate();
  }

  /**
   * 查询模板纬度值集
   */
  @Bind()
  handleDimensionCode() {
    const { dispatch } = this.props;
    const lovCodes = {
      dimensionCode: 'SSRC.QUOTATION_TEMPLATE_DIMENSION',
      statusCode: 'SSRC.QUOTATION_TEMPLATE_STATUS',
      moduleRule: 'SSRC_QUOTATION_TEMPLATE_RULE',
    };
    dispatch({
      type: 'quotationTemplate/batchCode',
      payload: {
        lovCodes,
      },
    });
  }

  /**
   * 绑定表单的this
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  /**
   * 模板明细Drawer
   */
  @Bind()
  handleTemplateDetail(record = {}) {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/ssrc/quotation-template/detail/${record.templateId}`,
      })
    );
  }

  /**
   * 分配品类Modal
   */
  @Bind()
  handleAssignCategory(record = {}) {
    const { assignCategoryVisible } = this.state;
    this.setState({
      currentRow: record,
      templateId: record.templateId,
      assignCategoryVisible: !assignCategoryVisible,
      quotationDimensionType: record.templateDimension,
    });
  }

  /**
   * 分配物料Modal
   */
  @Bind()
  handleAssignMaterial(record = {}) {
    const { assignMaterialVisible } = this.state;
    this.setState({
      templateId: record.templateId,
      currentRow: record,
      assignMaterialVisible: !assignMaterialVisible,
      quotationDimensionType: record.templateDimension,
    });
  }

  /**
   * 查询报价模板
   */
  @Bind()
  handleQuotationTemplate(page = {}) {
    const { dispatch } = this.props;
    const tableValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: 'quotationTemplate/queryQuotationTemplate',
      payload: {
        page,
        ...tableValues,
      },
    });
  }

  /**
   * 新建
   */
  @Bind()
  handleAdd() {
    const {
      dispatch,
      quotationTemplate: { quotationTemplateList },
    } = this.props;
    dispatch({
      type: 'quotationTemplate/updateState',
      payload: {
        quotationTemplateList: [
          { _status: 'create', templateId: uuidv4() },
          ...quotationTemplateList,
        ],
      },
    });
  }

  /**
   * 保存
   */
  @Bind()
  handleSave() {
    const {
      dispatch,
      quotationTemplate: { quotationTemplateList },
    } = this.props;
    const editTableValues = getEditTableData(quotationTemplateList, ['templateId', '_status']);

    if (!isEmpty(editTableValues)) {
      dispatch({
        type: 'quotationTemplate/saveQuotationTemplate',
        payload: editTableValues,
      }).then((res) => {
        if (res) {
          notification.success();
          this.handleQuotationTemplate();
        }
      });
    }
  }

  /**
   * 编辑/取消编辑
   */
  @Bind()
  handleEdit(record, flag) {
    const {
      dispatch,
      quotationTemplate: { quotationTemplateList },
    } = this.props;
    const newList = quotationTemplateList.map((item) => {
      if (item.templateId === record.templateId) {
        const { ...newItem } = item;
        return { ...newItem, _status: flag ? 'update' : '' };
      } else {
        return item;
      }
    });
    dispatch({
      type: 'quotationTemplate/updateState',
      payload: {
        quotationTemplateList: newList,
      },
    });
  }

  /**
   * 取消新建行
   */
  @Bind()
  handleCancel(record) {
    const {
      dispatch,
      quotationTemplate: { quotationTemplateList },
    } = this.props;
    const newList = quotationTemplateList.filter((item) => item.templateId !== record.templateId);
    dispatch({
      type: 'quotationTemplate/updateState',
      payload: {
        quotationTemplateList: newList,
      },
    });
  }

  /**
   * 发布
   */
  @Bind()
  handleRelease(record) {
    const { dispatch } = this.props;
    const { _status, ...newRecord } = record;
    dispatch({
      type: 'quotationTemplate/releaseQuotationTemplate',
      payload: newRecord,
    }).then((res) => {
      if (res) {
        notification.success();
        this.handleQuotationTemplate();
      }
    });
  }

  /**
   * 解锁
   */
  @Bind()
  handleUnlock(record) {
    const {
      dispatch,
      quotationTemplate: { quotationTemplatePagination = {} },
    } = this.props;
    dispatch({
      type: 'quotationTemplate/unlockQuotationTemplate',
      payload: {
        templateId: record.templateId,
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.handleQuotationTemplate(quotationTemplatePagination);
      }
    });
  }

  /**
   * 改变报价模板规则
   */
  @Bind()
  changeModuleRule(value, record) {
    if (record._status !== 'create') {
      const preValue = record.$form.getFieldValue('moduleRule');
      if (value !== preValue) {
        Modal.confirm({
          title: intl
            .get(`${promptCode}.view.tips.moduleRuleChange`)
            .d('切换模板规则后，将清空原有报价明细列、行配置，是否继续？'),
          onOk: () => false,
          onCancel: () => {
            record.$form.setFieldsValue({ moduleRule: preValue });
          },
        });
      }
    }
  }

  render() {
    const {
      unlockLoading,
      releaseLoading,
      queryTemplateLoading,
      saveTemplateLoading,
      quotationTemplate: {
        quotationTemplateList,
        quotationTemplatePagination,
        code: { dimensionCode = [], moduleRule = [] },
      },
    } = this.props;
    const {
      templateId,
      currentRow,
      assignCategoryVisible,
      assignMaterialVisible,
      quotationDimensionType,
    } = this.state;
    const filterFormProps = {
      dimensionCode,
      onRef: this.handleBindRef,
      onSearch: this.handleQuotationTemplate,
    };
    const assignCategoryProps = {
      currentRow,
      templateId,
      assignCategoryVisible,
      quotationDimensionType,
      onCancel: this.handleAssignCategory,
    };
    const assignMaterialProps = {
      currentRow,
      templateId,
      assignMaterialVisible,
      quotationDimensionType,
      onCancel: this.handleAssignMaterial,
    };
    const columns = [
      {
        title: intl.get(`${promptCode}.model.template.code`).d('报价模板编码'),
        dataIndex: 'templateNum',
        width: 150,
        render: (val, record) =>
          ['create'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('templateNum', {
                initialValue: record.templateNum,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.model.template.code`).d('报价模板编码'),
                    }),
                  },
                  {
                    max: 30,
                    message: intl.get('hzero.common.validation.max', {
                      max: 30,
                    }),
                  },
                ],
              })(<Input trim inputChinese={false} typeCase="upper" />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${promptCode}.model.template.name`).d('报价模板名称'),
        dataIndex: 'templateName',
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('templateName', {
                initialValue: record.templateName,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.model.template.name`).d('报价模板名称'),
                    }),
                  },
                  {
                    max: 180,
                    message: intl.get('hzero.common.validation.max', {
                      max: 180,
                    }),
                  },
                ],
              })(
                <TLEditor
                  label={intl.get(`${promptCode}.model.template.name`).d('报价模板名称')}
                  field="templateName"
                  token={record._token}
                />
              )}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${promptCode}.model.template.dimension`).d('模板维度'),
        dataIndex: 'templateDimensionMeaning',
        width: 140,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('templateDimension', {
                initialValue: record.templateDimension,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.model.template.dimension`).d('模板维度'),
                    }),
                  },
                ],
              })(
                <Select style={{ width: '100%' }} allowClear>
                  {dimensionCode.map((n) => (
                    <Option value={n.value}>{n.meaning}</Option>
                  ))}
                </Select>
              )}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: (
          <span>
            {intl.get(`${promptCode}.model.template.moduleRule`).d('模板规则')}
            <Tooltip
              title={intl
                .get(`${promptCode}.view.message.moduleRule.tips`)
                .d('【用于定义报价模板是否划分为多个模块，按模块分别定义明细列、行。】')}
            >
              <Icon style={{ marginLeft: '4px' }} type="question-circle-o" />
            </Tooltip>
          </span>
        ),
        dataIndex: 'moduleRuleMeaning',
        width: 140,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('moduleRule', {
                initialValue: record.moduleRule || 'NO_DISTINCTION',
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.model.template.moduleRule`).d('模板规则'),
                    }),
                  },
                ],
              })(
                <Select
                  style={{ width: '100%' }}
                  onChange={(value) => this.changeModuleRule(value, record)}
                >
                  {moduleRule.map((n) => (
                    <Option value={n.value}>{n.meaning}</Option>
                  ))}
                </Select>
              )}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${promptCode}.model.template.version`).d('版本'),
        dataIndex: 'versionNumber',
        width: 80,
      },
      {
        title: intl.get(`${promptCode}.model.template.status`).d('状态'),
        dataIndex: 'templateStatusMeaning',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.template.assignOperation`).d('分配适用品类或物料'),
        dataIndex: 'assignOperation',
        width: 160,
        render: (_, record) => (
          <Fragment>
            {record.templateDimension === 'ITEM_CATEGORY' && (
              <a onClick={() => this.handleAssignCategory(record)}>
                {intl.get(`${promptCode}.model.template.assignCategory`).d('分配适用品类')}
              </a>
            )}
            {record.templateDimension === 'ITEM' && (
              <a onClick={() => this.handleAssignMaterial(record)}>
                {intl.get(`${promptCode}.model.template.assignMaterial`).d('分配适用物料')}
              </a>
            )}
          </Fragment>
        ),
      },
      {
        title: intl.get(`${promptCode}.model.template.detail`).d('明细'),
        width: 80,
        render: (_, record) => (
          <Fragment>
            {record._status !== 'create' && (
              <a onClick={() => this.handleTemplateDetail(record)}>
                {intl.get(`${promptCode}.model.template.detail`).d('明细')}
              </a>
            )}
          </Fragment>
        ),
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 100,
        render: (_, record) => (
          <Fragment>
            {record._status !== 'update' &&
              record._status !== 'create' &&
              record.templateStatus !== 'RELEASED' && (
                <a style={{ marginRight: 8 }} onClick={() => this.handleEdit(record, true)}>
                  {intl.get('hzero.common.button.edit').d('编辑')}
                </a>
              )}
            {record._status === 'update' && (
              <a style={{ marginRight: 8 }} onClick={() => this.handleEdit(record, false)}>
                {intl.get('hzero.common.button.cancel').d('取消')}
              </a>
            )}
            {(record.templateStatus === 'NEW' || record.templateStatus === 'UPDATED') && (
              <Fragment>
                <a onClick={() => this.handleRelease(record)}>
                  {intl.get('hzero.common.button.release').d('发布')}
                </a>
              </Fragment>
            )}
            {record.templateStatus === 'RELEASED' && (
              <Fragment>
                <a onClick={() => this.handleUnlock(record)}>
                  {intl.get(`${promptCode}.view.button.unlock`).d('解锁')}
                </a>
              </Fragment>
            )}
            {record._status === 'create' && (
              <a onClick={() => this.handleCancel(record)}>
                {intl.get('hzero.common.button.cancel').d('取消')}
              </a>
            )}
          </Fragment>
        ),
      },
    ];
    return (
      <Fragment>
        <Header title={intl.get(`${promptCode}.view.title.quoteTemplateDefinen`).d('报价模板定义')}>
          <Button type="primary" icon="plus" onClick={this.handleAdd}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
          <Button icon="save" onClick={this.handleSave} loading={saveTemplateLoading}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
        </Header>
        <Content>
          <div className="table-list-search">
            <FilterForm {...filterFormProps} />
          </div>
          <Spin spinning={unlockLoading || releaseLoading || queryTemplateLoading}>
            <EditTable
              bordered
              rowKey="templateId"
              columns={columns}
              dataSource={quotationTemplateList}
              onChange={this.handleQuotationTemplate}
              pagination={quotationTemplatePagination}
            />
          </Spin>
          {assignCategoryVisible && <AssignCategoryModal {...assignCategoryProps} />}
          {assignMaterialVisible && <AssignMaterialModal {...assignMaterialProps} />}
        </Content>
      </Fragment>
    );
  }
}

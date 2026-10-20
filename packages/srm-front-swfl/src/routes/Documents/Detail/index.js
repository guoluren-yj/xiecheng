/*
 * index.js - 流程单据详情
 * @date: 2019-04-29
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import {
  Button,
  Col,
  Form,
  Input,
  Popconfirm,
  Row,
  Spin,
  Tag,
  InputNumber,
  Tooltip,
} from 'hzero-ui';
import { Tabs, Text, Icon } from 'choerodon-ui';
import { Modal } from 'choerodon-ui/pro';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Bind } from 'lodash-decorators';
import { isUndefined, isEmpty } from 'lodash';
import classnames from 'classnames';

import Switch from 'components/Switch';
import { Content, Header } from 'components/Page';
import Lov from 'components/Lov';
import TLEditor from 'components/TLEditor';

import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import notification from 'utils/notification';

import {
  getCurrentOrganizationId,
  isTenantRoleLevel,
  getResponse,
  getCurrentLanguage,
  createPagination,
} from 'utils/utils';
import { fetchSupportLanguageList } from 'hzero-front/lib/services/api';
import { openTab } from 'utils/menuTab';
import { CODE_UPPER } from 'utils/regExp';
import {
  DETAIL_EDIT_FORM_CLASSNAME,
  EDIT_FORM_CLASSNAME,
  EDIT_FORM_ITEM_LAYOUT,
  EDIT_FORM_ITEM_LAYOUT_COL_3,
  FORM_COL_3_LAYOUT,
  ROW_READ_ONLY_CLASSNAME,
  ROW_READ_WRITE_CLASSNAME,
  ROW_WRITE_ONLY_CLASSNAME,
} from 'utils/constants';

import styles from './index.less';
import VariableList from './VariableList';
import VariableDrawer from './VariableDrawer';
import FormDrawer from './FormDrawer';
import CategoriesModal from './CategoriesModal';
import FormList from './FormList';
import EmailList from './EmailList';
import EmailDrawer from './EmailDrawer';
import ApprovalGroup from './ApprovalGroup';
import ApprovalGroupDrawer from './ApprovalGroupDrawer';
import ColumnDefinition from './ColumnDefinition';
import DataMaintenance from './DataMaintenance';

/**
 * 流程单据详情
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {!Object} documents - 数据源
 * @reactProps {!Object} loading - 数据加载是否完成
 * @reactProps {!Object} saving - 保存是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */

const editModalKey = Modal.key();
@Form.create({ fieldNameProp: null })
@connect(({ documents, loading }) => ({
  documents,
  isSiteFlag: !isTenantRoleLevel(),
  loading: loading.effects['documents/fetchDetailHeader'],
  saving: loading.effects['documents/createDocuments'] || loading.effects['documents/updateHeader'],
  fetchingVariableList: loading.effects['documents/fetchVariableList'],
  fetchingCategories: loading.effects['documents/handleSearchCategories'],
  savingVariable:
    loading.effects['documents/handleSaveVariables'] ||
    loading.effects['documents/handleUpdateVariables'],
  savingForm:
    loading.effects['documents/handleSaveForm'] || loading.effects['documents/handleUpdateForm'],
  savingEmail:
    loading.effects['documents/handleSaveEmail'] || loading.effects['documents/handleUpdateEmail'],
  savingApprovalGroup: loading.effects['documents/handleSaveApprovalGroup'],
  fetchingFormList: loading.effects['documents/fetchFormList'],
  fetchingEmailList: loading.effects['documents/fetchEmailList'],
  fetchApprovalList: loading.effects['documents/fetchApprovalList'],
}))
@formatterCollections({ code: ['hwfp.documents', 'hwfp.common', 'hzero.common', 'spfm.button'] })
export default class Detail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      categoryVisible: false,
      formDrawerVisible: false,
      variableDrawerVisible: false,
      emailDrawerVisible: false,
      approvalDrawerVisible: false,
      columnDefinitionVisible: false,
      predefined: false, // 预定义标志
      variableDataSource: [],
      approvalDataSource: [{ code: 'code', name: 'name', description: 'description' }],
      variableRecord: {},
      formRecord: {}, // 表单当前编辑行
      emailRecord: {}, // 邮件表单当前编辑行
      approvalRecord: {}, // 审批组当前编辑行
      headerInfo: {},
      processCategoryList: [], // 流程分类
      formDataSource: [], // 表单列表
      emailDataSource: [], // 邮件列表
      id: props.match.params.id,
      tenantId: getCurrentOrganizationId(),
      customizeField: {},
      initialModelCodeValue: null,
      canUpdateCode: false, // 字段编码输入框是否可编辑
      languageList: [],
      approvalGroupPagination: {},
    };
  }

  componentDidMount() {
    this.handleSearch();
  }

  @Bind()
  handleSearch() {
    this.fetchHeader();
    this.fetchFormList();
    this.fetchEmailList();
    this.fetchEnumMap();
    this.fetchLanguageList();
  }

  /**
   * 查询头
   */
  @Bind()
  fetchHeader() {
    const { tenantId } = this.state;
    const { dispatch, match } = this.props;
    const { id } = match.params;
    if (!isUndefined(id)) {
      dispatch({
        type: 'documents/fetchDetailHeader',
        payload: {
          documentId: id,
        },
      }).then((res) => {
        if (res) {
          this.setState(
            {
              headerInfo: res,
              initialModelCodeValue: res.modelCode,
              processCategoryList: res.processCategoryList || [],
              predefined: tenantId !== res.tenantId && isTenantRoleLevel(),
            },
            this.handleQueryCustomizeField
          );
        }
        this.fetchVariableList();
        this.fetchApprovalList();
      });
    }
  }

  // 根据headerInfo返回的关联视图查询变量维护-模型-字段名
  handleQueryCustomizeField() {
    const {
      headerInfo: { modelCode },
    } = this.state;
    if (modelCode) {
      // 关联视图有值，查询自定义字段名
      const { dispatch } = this.props;
      dispatch({
        type: 'documents/fetchCustomizeField',
        payload: {
          modelCode,
        },
      }).then((res) => {
        if (res) {
          this.setState({
            customizeField: res,
          });
        }
      });
    }
  }

  /**
   * 查询变量列表
   */
  @Bind()
  fetchVariableList() {
    const { dispatch, match } = this.props;
    const { id } = match.params;
    const {
      headerInfo: { tenantId },
    } = this.state;
    if (!isUndefined(id)) {
      dispatch({
        type: 'documents/fetchVariableList',
        payload: {
          sourceId: id,
          tenantId,
          sourceType: 'DOCUMENT',
        },
      }).then((res) => {
        if (res) {
          this.setState({
            variableDataSource: res || [],
          });
        }
      });
    }
  }

  /**
   * 查询表单列表
   */
  @Bind()
  fetchFormList() {
    const { dispatch, match } = this.props;
    const { id } = match.params;
    if (!isUndefined(id)) {
      dispatch({
        type: 'documents/fetchFormList',
        payload: {
          sourceId: id,
        },
      }).then((res) => {
        if (res) {
          this.setState({
            formDataSource: res || [],
          });
        }
      });
    }
  }

  /**
   * 查询邮件列表
   */
  @Bind()
  fetchEmailList() {
    const { dispatch, match } = this.props;
    const { id } = match.params;
    if (!isUndefined(id)) {
      dispatch({
        type: 'documents/fetchEmailList',
        payload: {
          documentId: id,
        },
      }).then((res) => {
        if (res) {
          this.setState({
            emailDataSource: res.content || [],
          });
        }
      });
    }
  }

  /**
   * 查询值集
   */
  @Bind()
  fetchEnumMap() {
    const { dispatch } = this.props;
    dispatch({
      type: 'documents/fetchEnumMap',
    });
  }

  /**
   * 查询当前系统支持的语言
   */
  @Bind()
  fetchLanguageList() {
    fetchSupportLanguageList().then((res) => {
      if (getResponse(res)) {
        this.setState({ languageList: res });
      }
    });
  }

  /**
   * 添加变量
   */
  @Bind()
  handleAddVariable() {
    this.setState({ variableDrawerVisible: true });
  }

  @Bind()
  handleAddForm() {
    this.setState({ formDrawerVisible: true });
  }

  @Bind()
  handleAddEmail() {
    this.setState({ emailDrawerVisible: true });
  }

  /**
   * 保存流程单据头
   */
  @Bind()
  handleSave() {
    const { dispatch, form, match = {} } = this.props;
    const { headerInfo, processCategoryList } = this.state;
    const {
      params: { id },
    } = match;
    form.validateFields((err, values) => {
      if (!err) {
        if (isUndefined(id)) {
          dispatch({
            type: 'documents/createDocuments',
            payload: {
              ...values,
              modelCode: values.modelCode || '',
              categoryIdSet: processCategoryList.map((n) => n.categoryId),
            },
          }).then((res) => {
            if (res) {
              notification.success();
              dispatch(
                routerRedux.push({
                  pathname: `/hwfp/setting/documents/detail/${res.documentId}`,
                })
              );
              if (!headerInfo.documentId) {
                this.setState({ id: res.documentId });
              }
            }
          });
        } else {
          const { variableList, ...otherHeaderInfo } = headerInfo;
          dispatch({
            type: 'documents/updateHeader',
            payload: {
              documentId: id,
              processDocument: {
                ...otherHeaderInfo,
                ...values,
                categoryIdSet: processCategoryList.map((n) => n.categoryId),
              },
            },
          }).then((res) => {
            if (res) {
              notification.success();
              this.handleSearch();
            }
          });
        }
      }
    });
  }

  /**
   * 编辑变量
   * @param {object} variableRecord - 变量对象
   */
  @Bind()
  handleEditVariable(variableRecord) {
    this.setState({ variableDrawerVisible: true, variableRecord, canUpdateCode: true });
  }

  /**
   * 编辑表单
   * @param {object} formRecord - 变量对象
   */
  @Bind()
  handleEditForm(formRecord) {
    this.setState({ formDrawerVisible: true, formRecord });
  }

  /**
   * 编辑邮件
   * @param {object} emailRecord - 变量对象
   */
  @Bind()
  handleEditEmail(emailRecord) {
    this.setState({ emailDrawerVisible: true, emailRecord });
  }

  /**
   * 删除变量
   * @param {obejct} variableRecord - 变量对象
   */
  @Bind()
  handleDeleteVariable(variableRecord) {
    const {
      headerInfo: { documentCode, tenantId },
    } = this.state;
    const { dispatch } = this.props;
    const { variableId } = variableRecord;
    const fieldType = !variableRecord.modelCode ? 'customize' : 'model';
    const processVariable = documentCode
      ? { ...variableRecord, documentCode, tenantId, fieldType }
      : { ...variableRecord, tenantId, fieldType };
    dispatch({
      type: 'documents/deleteVariable',
      payload: {
        variableId,
        processVariable,
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.fetchVariableList();
      }
    });
  }

  /**
   * 删除表单
   * @param {obejct} record - 表单对象
   */
  @Bind()
  handleDeleteForm(record) {
    const { dispatch } = this.props;
    const { formId } = record;
    dispatch({
      type: 'documents/deleteForm',
      payload: {
        formId,
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.fetchFormList();
      }
    });
  }

  /**
   * 删除邮件
   * @param {obejct} emailRecord - 邮件对象
   */
  @Bind()
  handleDeleteEmail(emailRecord) {
    const { dispatch } = this.props;
    // const { templateId } = emailRecord;
    dispatch({
      type: 'documents/deleteEmail',
      payload: {
        processVariable: emailRecord,
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.fetchEmailList();
      }
    });
  }

  /**
   * 保存流程变量
   * @param {object} values - 保存数据
   */
  @Bind()
  handleSaveVariables(values) {
    const { dispatch } = this.props;
    const {
      id,
      headerInfo: { documentCode, tenantId },
    } = this.state;
    const { variableId } = values;
    if (!variableId) {
      dispatch({
        type: 'documents/handleSaveVariables',
        payload: {
          ...values,
          sourceId: id,
          sourceType: 'DOCUMENT',
          documentCode,
          tenantId,
        },
      }).then((res) => {
        if (res) {
          this.fetchVariableList();
          notification.success();
          this.handleCancelOption();
        }
      });
    } else {
      dispatch({
        type: 'documents/handleUpdateVariables',
        payload: {
          variableId,
          processVariable: { ...values, tenantId },
        },
      }).then((res) => {
        if (res) {
          this.fetchVariableList();
          notification.success();
          this.handleCancelOption();
        }
      });
    }
  }

  /**
   * 保存流程表单
   * @param {object} values - 保存数据
   */
  @Bind()
  handleSaveForm(values) {
    const { dispatch } = this.props;
    const { id } = this.state;
    const { formId } = values;
    if (!formId) {
      dispatch({
        type: 'documents/handleSaveForm',
        payload: {
          ...values,
          documentId: id,
        },
      }).then((res) => {
        if (res) {
          this.fetchFormList();
          notification.success();
          this.handleCancelFormDrawer();
        }
      });
    } else {
      dispatch({
        type: 'documents/handleUpdateForm',
        payload: {
          formId,
          processVariable: values,
        },
      }).then((res) => {
        if (res) {
          this.fetchFormList();
          notification.success();
          this.handleCancelFormDrawer();
        }
      });
    }
  }

  /**
   * 保存邮件表单
   * @param {object} values - 保存数据
   */
  @Bind()
  handleSaveEmail(values) {
    const { dispatch } = this.props;
    const { id } = this.state;
    const { templateId } = values;
    if (!templateId) {
      dispatch({
        type: 'documents/handleSaveEmail',
        payload: {
          ...values,
          documentId: id,
        },
      }).then((res) => {
        if (res) {
          this.fetchEmailList();
          notification.success();
          this.handleCancelEmailDrawer();
        }
      });
    } else {
      dispatch({
        type: 'documents/handleUpdateEmail',
        payload: {
          templateId,
          processVariable: values,
        },
      }).then((res) => {
        if (res) {
          this.fetchEmailList();
          notification.success();
          this.handleCancelEmailDrawer();
        }
      });
    }
  }

  /**
   * 变量滑窗取消操作
   */
  @Bind()
  handleCancelOption() {
    this.setState({
      variableDrawerVisible: false,
      variableRecord: {},
      canUpdateCode: false,
    });
  }

  /**
   * 变量滑窗取消操作
   */
  @Bind()
  handleCancelFormDrawer() {
    this.setState({
      formDrawerVisible: false,
      formRecord: {},
    });
  }

  /**
   * 变量滑窗取消操作
   */
  @Bind()
  handleCancelEmailDrawer() {
    this.setState({
      emailDrawerVisible: false,
      emailRecord: {},
    });
  }

  /**
   * handleModalVisible - 改变弹窗显隐
   * @param {*} field
   * @param {*} value
   */
  @Bind()
  handleModalVisible(field, value) {
    this.setState({ [field]: value });
  }

  /**
   *
   * 查询流程分类列表
   * @param {*} fields
   */
  @Bind()
  handleSearchCategories(fields) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'documents/handleSearchCategories',
      payload: fields,
    });
  }

  /**
   * 添加流程分类
   * @param {Array} [selectedRows=[]]
   */
  @Bind()
  handleAddCategories(selectedRows = []) {
    const { processCategoryList } = this.state;
    this.setState({
      processCategoryList: [...processCategoryList, ...selectedRows],
    });
  }

  /**
   * 关闭流程分类tag
   * @param {String} categoryId
   */
  @Bind()
  handleCloseTag(categoryId) {
    const { processCategoryList } = this.state;
    this.setState({
      processCategoryList: processCategoryList.filter((n) => n.categoryId !== categoryId),
    });
  }

  /**
   * 阻止tag默认删除事件
   * @param {*} e
   */
  @Bind()
  preventDefault(e) {
    e.preventDefault();
  }

  // 针对旧的流程单据，可修改组合业务对象值
  @Bind()
  handleModelCodeChange(value) {
    const { headerInfo } = this.state;
    const newHeaderInfo = { ...headerInfo };
    newHeaderInfo.modelCode = value;
    this.setState({ headerInfo: newHeaderInfo }, this.handleQueryCustomizeField);
    if (!value) {
      const { form } = this.props;
      form.setFieldsValue({
        documentServiceName: undefined,
      });
    }
  }

  /**
   * 租户发生改变后对组合业务对象进行清除
   */
  @Bind()
  changeTenant() {
    const { form } = this.props;
    form.setFieldsValue({
      modelCode: undefined,
    });
  }

  @Bind()
  routeWflCategories(categoryId) {
    const { id } = this.props.match.params;
    openTab({
      title: 'hzero.wp.setup.process-category',
      key: `/hwfp/setting/categories/detail/${categoryId}`,
      path: `/hwfp/setting/categories/detail/${categoryId}`,
      closable: true,
      state: {
        routeFrom: `/setting/documents/detail/${id}`,
      },
    });
  }

  /**
   * 删除某条审批组
   */
  @Bind()
  handleDeleteApproval(approvalRecord) {
    const { tenantId, id } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: 'documents/deleteApprovalGroup',
      payload: {
        recordData: {
          ...approvalRecord,
          sourceId: id,
          sourceType: 'DOCUMENT',
          tenantId,
          enabledFlag: 1,
        },
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.fetchApprovalList();
      }
    });
  }

  /**
   * 保存审批组表单
   * @param {object} values - 保存数据
   */
  @Bind()
  handleSaveApproval(values) {
    const { dispatch } = this.props;
    const { tenantId, id } = this.state;
    dispatch({
      type: 'documents/handleSaveApprovalGroup',
      payload: {
        recordData: { ...values, sourceId: id, sourceType: 'DOCUMENT', tenantId, enabledFlag: 1 },
      },
    }).then((res) => {
      if (res) {
        this.fetchApprovalList();
        notification.success();
        this.handleCancelApprovalDrawer();
      }
    });
  }

  /**
   * 审批组滑窗取消操作
   */
  @Bind()
  handleCancelApprovalDrawer() {
    this.setState({
      approvalDrawerVisible: false,
      approvalRecord: {},
    });
  }

  /**
   * 编辑审批组
   * @param {object} approvalRecord - 变量对象
   */
  @Bind()
  handleEditApproval(approvalRecord) {
    this.setState({ approvalDrawerVisible: true, approvalRecord });
  }

  /**
   * 查询审批组列表
   */
  @Bind()
  fetchApprovalList(params) {
    const { dispatch, match, isSiteFlag } = this.props;
    const { tenantId: headerTenantId } = this.state.headerInfo;
    const { id } = match.params;
    if (!isUndefined(id)) {
      dispatch({
        type: 'documents/fetchApprovalList',
        payload: isSiteFlag
          ? {
              sourceId: id,
              sourceType: 'DOCUMENT',
              tenantId: headerTenantId,
              ...(params || {}),
            }
          : {
              sourceId: id,
              sourceType: 'DOCUMENT',
              ...(params || {}),
            },
      }).then((res) => {
        if (res) {
          this.setState({
            approvalDataSource: res.content || [],
            approvalGroupPagination: createPagination(res),
          });
        }
      });
    }
  }

  /**
   * 关闭列定义模态框
   */
  @Bind()
  handleCancelColumnDef() {
    this.setState({
      columnDefinitionVisible: false,
      approvalRecord: {},
    });
  }

  /**
   * 打开列定义模态框
   */
  @Bind()
  columnDef(record) {
    this.setState({ columnDefinitionVisible: true, approvalRecord: record });
  }

  @Bind()
  dataMaintenance(record) {
    const { isSiteFlag } = this.props;
    const { tenantId: headerTenantId } = this.state.headerInfo;
    const dataMaintenanceProps = { record };
    Modal.open({
      key: editModalKey,
      title: intl.get('hwfp.documents.view.message.title.dataMaintenance').d('数据维护'),
      children: (
        <DataMaintenance
          {...dataMaintenanceProps}
          isSiteFlag={isSiteFlag}
          headerTenantId={headerTenantId}
        />
      ),
      style: { width: '60vw' },
      closable: true,
      drawer: true,
      footer: (okBtn, cancelBtn) => cancelBtn,
    });
  }

  render() {
    const {
      form,
      isSiteFlag,
      dispatch,
      loading,
      fetchingVariableList,
      saving,
      savingVariable,
      savingForm,
      savingEmail,
      savingApprovalGroup,
      fetchingCategories,
      fetchingFormList,
      fetchingEmailList,
      documents: { line = [], dataType = [], operator = [], enumMap = {} },
    } = this.props;
    const {
      id,
      predefined,
      categoryVisible,
      tenantId,
      variableDataSource,
      variableRecord = {},
      formRecord = {},
      emailRecord = {},
      approvalRecord = {},
      formDataSource = [],
      emailDataSource = [],
      approvalDataSource = [],
      approvalGroupPagination,
      variableDrawerVisible = false,
      formDrawerVisible = false,
      emailDrawerVisible = false,
      approvalDrawerVisible = false,
      columnDefinitionVisible = false,
      headerInfo = {},
      processCategoryList = [],
      customizeField = {},
      initialModelCodeValue,
      canUpdateCode,
      languageList,
    } = this.state;
    const headerTitle = intl.get('hwfp.common.view.message.title.document').d('流程单据');
    const { getFieldDecorator, getFieldValue } = form;
    const formListProps = {
      predefined,
      isSiteFlag,
      dataSource: formDataSource,
      loading: fetchingFormList,
      onEdit: this.handleEditForm,
      onDelete: this.handleDeleteForm,
    };
    const emailListProps = {
      predefined,
      isSiteFlag,
      dataSource: emailDataSource,
      loading: fetchingEmailList,
      onEdit: this.handleEditEmail,
      onDelete: this.handleDeleteEmail,
    };
    const {
      enabledFlag,
      documentCode,
      modelCode,
      modelName,
      description,
      tenantName,
      _token,
      tenantId: headerTenantId,
      sourceParentName,
      orderSeq,
      sourceParentId,
      cuszDocCode,
      cuszDocName,
      documentServiceName,
      cuszUnitCode,
    } = headerInfo;
    const variableListProps = {
      predefined,
      documentServiceName,
      dataSource: variableDataSource,
      loading: fetchingVariableList,
      onEdit: this.handleEditVariable,
      onDelete: this.handleDeleteVariable,
    };
    const variableDrawerProps = {
      dispatch,
      enumMap,
      tenantId,
      dataType,
      operator,
      headerTenantId,
      loading: savingVariable,
      anchor: 'right',
      visible: variableDrawerVisible,
      itemData: variableRecord,
      ruleList: line,
      onHandleOk: this.handleSaveVariables,
      onCancel: this.handleCancelOption,
      title: intl.get('hwfp.common.view.message.title.variableMaintain').d('变量维护'),
      fieldSource: isEmpty(variableRecord) || !variableRecord.modelCode ? 'customize' : 'model',
      isHeaderSelectModalCode: initialModelCodeValue,
      customizeField,
      canUpdateCode,
      documentServiceName,
    };
    const approvalGroupProps = {
      headerTenantId,
      predefined,
      dataSource: approvalDataSource,
      pagination: approvalGroupPagination,
      loading: fetchingEmailList,
      onEdit: this.handleEditApproval,
      onAdd: this.handleEditApproval,
      dataMaintenance: this.dataMaintenance,
      columnDef: this.columnDef,
      onDelete: this.handleDeleteApproval,
      handleChangePagination: this.fetchApprovalList,
    };
    const formDrawerProps = {
      dispatch,
      enumMap,
      tenantId,
      dataType,
      operator,
      isSiteFlag,
      loading: savingForm,
      anchor: 'right',
      visible: formDrawerVisible,
      itemData: formRecord,
      documentCode,
      cuszDocCode,
      ruleList: line,
      onHandleOk: this.handleSaveForm,
      onCancel: this.handleCancelFormDrawer,
      title: intl.get('hwfp.common.view.message.title.formMaintain').d('表单维护'),
      fieldSource: formRecord && formRecord.cuszStageCode ? 'cuszStage' : 'customize',
    };
    const emailDrawerProps = {
      dispatch,
      enumMap,
      tenantId,
      dataType,
      operator,
      isSiteFlag,
      loading: savingEmail,
      anchor: 'right',
      visible: emailDrawerVisible,
      itemData: emailRecord,
      ruleList: line,
      onHandleOk: this.handleSaveEmail,
      onCancel: this.handleCancelEmailDrawer,
      title: intl.get('hwfp.common.view.message.title.emailMaintain').d('邮件维护'),
      languageList,
      currentLanguage: getCurrentLanguage(),
    };
    const approvalDrawerProps = {
      dispatch,
      enumMap,
      tenantId,
      headerTenantId,
      dataType,
      operator,
      loading: savingApprovalGroup,
      anchor: 'right',
      visible: approvalDrawerVisible,
      itemData: approvalRecord,
      ruleList: line,
      onHandleOk: this.handleSaveApproval,
      onCancel: this.handleCancelApprovalDrawer,
      title: intl.get('hwfp.documents.view.message.title.approvalDrawer').d('审批组维护'),
    };
    const columnDefinitionProps = {
      id,
      dispatch,
      enumMap,
      tenantId,
      headerTenantId,
      dataType,
      operator,
      customizeField,
      loading: savingApprovalGroup,
      anchor: 'right',
      visible: columnDefinitionVisible,
      itemData: approvalRecord,
      onCancel: this.handleCancelColumnDef,
      title: intl.get('hwfp.documents.view.message.title.columnDefinition').d('列定义'),
    };

    const copyFlag = !!sourceParentId;
    return (
      <>
        <Header title={headerTitle} backPath="/hwfp/setting/documents/list">
          <Button
            icon="save"
            type="primary"
            onClick={this.handleSave}
            disabled={predefined || saving}
            loading={saving}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
        </Header>
        <Content>
          <Spin spinning={loading || false}>
            <Form
              className={classnames(
                styles['detail-form'],
                DETAIL_EDIT_FORM_CLASSNAME,
                EDIT_FORM_CLASSNAME
              )}
            >
              {isSiteFlag && (
                <Row className={id ? ROW_READ_ONLY_CLASSNAME : ROW_WRITE_ONLY_CLASSNAME}>
                  <Col {...FORM_COL_3_LAYOUT}>
                    <Form.Item
                      label={intl.get('entity.tenant.tag').d('租户')}
                      {...EDIT_FORM_ITEM_LAYOUT}
                    >
                      {getFieldDecorator('tenantId', {
                        initialValue: headerTenantId,
                        rules: [
                          {
                            required: !id,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl.get('entity.tenant.tag').d('租户'),
                            }),
                          },
                        ],
                      })(
                        id ? (
                          <>{tenantName}</>
                        ) : (
                          <Lov
                            textValue={tenantName}
                            code="HPFM.TENANT"
                            onChange={this.changeTenant}
                          />
                        )
                      )}
                    </Form.Item>
                  </Col>
                </Row>
              )}
              <Row
                className={classnames({
                  [ROW_WRITE_ONLY_CLASSNAME]: !id && !predefined,
                  [ROW_READ_WRITE_CLASSNAME]: id ? !predefined : predefined,
                  [ROW_READ_ONLY_CLASSNAME]: id && predefined,
                })}
              >
                <Col {...FORM_COL_3_LAYOUT}>
                  <Form.Item
                    label={intl.get('hwfp.common.model.common.documentCode').d('流程单据编码')}
                    {...EDIT_FORM_ITEM_LAYOUT}
                  >
                    {getFieldDecorator('documentCode', {
                      initialValue: documentCode,
                      rules: [
                        {
                          required: !id,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl
                              .get('hwfp.common.model.common.documentCode')
                              .d('流程单据编码'),
                          }),
                        },
                        {
                          pattern: CODE_UPPER,
                          message: intl
                            .get('hzero.common.validation.codeUpper')
                            .d('全大写及数字，必须以字母、数字开头，可包含“-”、“_”、“.”、“/”'),
                        },
                        {
                          max: 30,
                          message: intl.get('hzero.common.validation.max', {
                            max: 30,
                          }),
                        },
                      ],
                    })(
                      id ? (
                        <>{documentCode}</>
                      ) : (
                        <Input trim inputChinese={false} disabled={id} typeCase="upper" />
                      )
                    )}
                  </Form.Item>
                </Col>
              </Row>
              <Row className={predefined ? ROW_READ_ONLY_CLASSNAME : ROW_WRITE_ONLY_CLASSNAME}>
                <Col {...FORM_COL_3_LAYOUT}>
                  <Form.Item
                    label={intl
                      .get('hwfp.common.model.common.documentDescription')
                      .d('流程单据描述')}
                    {...EDIT_FORM_ITEM_LAYOUT}
                  >
                    {getFieldDecorator('description', {
                      rules: [
                        {
                          required: !predefined,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl
                              .get('hwfp.common.model.common.documentDescription')
                              .d('流程单据描述'),
                          }),
                        },
                        {
                          max: 240,
                          message: intl.get('hzero.common.validation.max', {
                            max: 240,
                          }),
                        },
                      ],
                      initialValue: description,
                    })(
                      predefined ? (
                        <>{description}</>
                      ) : (
                        <TLEditor
                          label={intl
                            .get('hwfp.common.model.common.documentDescription')
                            .d('流程单据描述')}
                          field="description"
                          inputSize={{ zh: 240, en: 240 }}
                          token={_token}
                          disabled={predefined}
                        />
                      )
                    )}
                  </Form.Item>
                </Col>
              </Row>
              <Row
                className={classnames({
                  [ROW_WRITE_ONLY_CLASSNAME]: !id && !predefined,
                  [ROW_READ_WRITE_CLASSNAME]: id ? !predefined : predefined,
                  [ROW_READ_ONLY_CLASSNAME]: id && predefined,
                })}
              >
                <Col {...FORM_COL_3_LAYOUT}>
                  <Form.Item
                    label={intl
                      .get('hwfp.common.model.common.associatedView')
                      .d('关联组合业务对象')}
                    {...EDIT_FORM_ITEM_LAYOUT}
                  >
                    {/* isSiteFlag: true平台，false租户 */}
                    {getFieldDecorator('modelCode', {
                      initialValue: modelCode,
                    })(
                      <Lov
                        textValue={modelName}
                        code={isSiteFlag && 'HMDE.BUSINESS_COMBINE.LIST'}
                        queryParams={
                          form.getFieldValue('tenantId')
                            ? { tenantId: form.getFieldValue('tenantId') }
                            : {}
                        }
                        disabled={
                          !isSiteFlag ||
                          initialModelCodeValue ||
                          form.getFieldValue('tenantId') === undefined ||
                          copyFlag
                        }
                        // 提交到test，暂时将组合业务对象禁用
                        // disabled={initialModelCodeValue || true}
                        onChange={this.handleModelCodeChange}
                      />
                    )}
                  </Form.Item>
                </Col>
              </Row>
              <Row className={predefined ? ROW_READ_ONLY_CLASSNAME : ROW_WRITE_ONLY_CLASSNAME}>
                <Col {...FORM_COL_3_LAYOUT}>
                  <Form.Item
                    label={
                      <>
                        <Text>
                          {intl
                            .get('hwfp.common.model.common.documentServiceName')
                            .d('流程单据服务')}
                        </Text>
                        <Tooltip
                          title={intl
                            .get('hwfp.common.model.common.documentServiceName.help')
                            .d('流程单据对应服务选择，用于动态查询组合业务对象字段值')}
                        >
                          <Icon type="help" style={{ marginLeft: '4px', verticalAlign: 'sub' }} />
                        </Tooltip>
                      </>
                    }
                    {...EDIT_FORM_ITEM_LAYOUT}
                  >
                    {getFieldDecorator('documentServiceName', {
                      initialValue: documentServiceName,
                      rules: [
                        {
                          required: isSiteFlag && getFieldValue('modelCode') && !copyFlag,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl
                              .get('hwfp.common.model.common.documentServiceName')
                              .d('流程单据服务'),
                          }),
                        },
                      ],
                    })(<Input disabled={!isSiteFlag || !getFieldValue('modelCode') || copyFlag} />)}
                  </Form.Item>
                </Col>
              </Row>
              <Row className={predefined ? ROW_READ_ONLY_CLASSNAME : ROW_WRITE_ONLY_CLASSNAME}>
                <Col {...FORM_COL_3_LAYOUT}>
                  <Form.Item
                    label={intl.get('hwfp.common.model.common.cuszDocCode').d('单据样式编码')}
                    {...EDIT_FORM_ITEM_LAYOUT}
                  >
                    {/* isSiteFlag: true平台，false租户 */}
                    {getFieldDecorator('cuszDocCode', {
                      initialValue: cuszDocCode,
                    })(
                      <Lov
                        textValue={cuszDocName}
                        code="HPFM.CUSZ.DOC_LIST"
                        disabled={copyFlag || cuszDocCode || !isSiteFlag}
                        lovOptions={{
                          displayField: 'docName',
                          valueField: 'docCode',
                        }}
                      />
                    )}
                  </Form.Item>
                </Col>
              </Row>
              {Number(headerTenantId) !== 0 && id && sourceParentName && (
                <Row className={ROW_WRITE_ONLY_CLASSNAME}>
                  <Col {...FORM_COL_3_LAYOUT}>
                    <Form.Item
                      label={intl
                        .get('hwfp.common.model.common.sourceParentName')
                        .d('复制自流程单据')}
                      {...EDIT_FORM_ITEM_LAYOUT}
                    >
                      {getFieldDecorator('sourceParentName', {
                        initialValue: sourceParentName,
                      })(<>{sourceParentName}</>)}
                    </Form.Item>
                  </Col>
                </Row>
              )}
              <Row className={ROW_WRITE_ONLY_CLASSNAME}>
                <Col {...FORM_COL_3_LAYOUT}>
                  <Form.Item
                    {...EDIT_FORM_ITEM_LAYOUT}
                    label={intl.get('hzero.common.view.orderSeq').d('排序号')}
                  >
                    {getFieldDecorator('orderSeq', {
                      initialValue: orderSeq,
                    })(<InputNumber precision={0} min={1} />)}
                  </Form.Item>
                </Col>
              </Row>
              <Row className={predefined ? ROW_READ_ONLY_CLASSNAME : ROW_WRITE_ONLY_CLASSNAME}>
                <Col {...FORM_COL_3_LAYOUT}>
                  <Form.Item
                    {...EDIT_FORM_ITEM_LAYOUT}
                    label={intl.get('hzero.common.view.cuszUnitCode').d('个性化单元编码')}
                  >
                    {getFieldDecorator('cuszUnitCode', {
                      initialValue: cuszUnitCode,
                    })(<Lov
                      code='HWFP.PROCESS_CUSZ_UNIT_CODE'
                      lovOptions={{
                        displayField: 'unitCode',
                      }}
                      disabled={!isSiteFlag || !getFieldValue('modelCode') || copyFlag}
                    />)}
                  </Form.Item>
                </Col>
              </Row>
              <Row className={ROW_WRITE_ONLY_CLASSNAME}>
                <Col {...FORM_COL_3_LAYOUT}>
                  <Form.Item
                    {...EDIT_FORM_ITEM_LAYOUT}
                    label={intl.get('hzero.common.status.enable').d('启用')}
                  >
                    {getFieldDecorator('enabledFlag', {
                      initialValue: enabledFlag === 0 ? 0 : 1,
                    })(<Switch disabled={predefined || copyFlag} />)}
                  </Form.Item>
                </Col>
              </Row>
              <Row className={ROW_READ_ONLY_CLASSNAME}>
                <Form.Item
                  {...EDIT_FORM_ITEM_LAYOUT_COL_3}
                  className={styles['add-document-form']}
                  label={intl.get(`hwfp.common.view.message.title.category`).d('流程分类')}
                >
                  {!predefined && (
                    <Button
                      disabled={predefined || processCategoryList.length >= 1 || copyFlag}
                      className={styles['button-margin-bottom']}
                      onClick={() => this.handleModalVisible('categoryVisible', true)}
                    >
                      {intl.get(`hwfp.common.view.button.addCategory`).d('新增流程分类')}
                    </Button>
                  )}
                  <div className={styles['form-item-control-wrapper']}>
                    {processCategoryList.map(
                      (item) =>
                        item.categoryId &&
                        (!predefined && !copyFlag ? (
                          <Popconfirm
                            placement="topRight"
                            title={intl
                              .get('hzero.common.message.confirm.delete')
                              .d('是否删除此条记录？')}
                            onConfirm={() => this.handleCloseTag(item.categoryId)}
                          >
                            <Tag color="blue" closable onClose={this.preventDefault}>
                              <a
                                onClick={() => {
                                  this.routeWflCategories(item.categoryId);
                                }}
                              >
                                {`${item.description}(${item.categoryCode})`}
                              </a>
                            </Tag>
                          </Popconfirm>
                        ) : (
                          <Tag
                            color="blue"
                            closable={!predefined && !copyFlag}
                            onClose={this.preventDefault}
                          >
                            <a
                              onClick={() => {
                                this.routeWflCategories(item.categoryId);
                              }}
                            >
                              {`${item.description}(${item.categoryCode})`}
                            </a>
                          </Tag>
                        ))
                    )}
                  </div>
                </Form.Item>
              </Row>
              <Row className={ROW_WRITE_ONLY_CLASSNAME}>
                {id && (
                  <Tabs defaultActiveKey="basicInformation">
                    <Tabs.TabPane
                      tab={intl
                        .get(`hwfp.common.view.message.title.basicInformation`)
                        .d('基本信息')}
                      key="basicInformation"
                    >
                      <Row className={ROW_WRITE_ONLY_CLASSNAME}>
                        <Form.Item
                          {...EDIT_FORM_ITEM_LAYOUT_COL_3}
                          className={styles['add-document-form']}
                          label={intl.get(`hwfp.common.view.message.title.variable`).d('流程变量')}
                        >
                          {!predefined && (
                            <Button
                              className={styles['button-margin-bottom']}
                              onClick={this.handleAddVariable}
                              disabled={!id || predefined}
                            >
                              {intl.get('hwfp.common.view.button.addVariable').d('添加流程变量')}
                            </Button>
                          )}
                          <div className={classnames(styles['form-item-control-wrapper'])}>
                            <VariableList {...variableListProps} />
                          </div>
                        </Form.Item>
                      </Row>
                      <Row
                        className={classnames(ROW_WRITE_ONLY_CLASSNAME, styles['list-margin-top'])}
                      >
                        <Form.Item
                          {...EDIT_FORM_ITEM_LAYOUT_COL_3}
                          className={styles['add-document-form']}
                          label={intl.get('hwfp.common.view.message.title.form').d('流程表单')}
                        >
                          {/* 仅平台级显示新增按钮 */}
                          {isSiteFlag && (
                            <Button
                              className={styles['button-margin-bottom']}
                              onClick={this.handleAddForm}
                              disabled={!id || predefined}
                            >
                              {intl.get('hwfp.common.view.button.addForm').d('新增流程表单')}
                            </Button>
                          )}
                          <div className={classnames(styles['form-item-control-wrapper'])}>
                            <FormList {...formListProps} />
                          </div>
                        </Form.Item>
                      </Row>
                      <Row
                        className={classnames(ROW_WRITE_ONLY_CLASSNAME, styles['list-margin-top'])}
                      >
                        <Form.Item
                          {...EDIT_FORM_ITEM_LAYOUT_COL_3}
                          className={styles['add-document-form']}
                          label={intl.get('hwfp.common.view.message.title.email').d('邮件审批表单')}
                        >
                          {/* 仅平台级显示新增按钮 */}
                          {isSiteFlag && (
                            <Button
                              className={styles['button-margin-bottom']}
                              onClick={this.handleAddEmail}
                              disabled={!id || predefined}
                            >
                              {intl.get('hwfp.common.view.button.addEmail').d('新增邮件审批表单')}
                            </Button>
                          )}
                          <div className={classnames(styles['form-item-control-wrapper'])}>
                            <EmailList {...emailListProps} />
                          </div>
                        </Form.Item>
                      </Row>
                    </Tabs.TabPane>
                    {headerTenantId !== undefined && Number(headerTenantId) !== 0 && (
                      <Tabs.TabPane
                        tab={intl.get(`hwfp.common.view.message.title.approvalGroup`).d('审批组')}
                        key="approvalGroup"
                      >
                        <ApprovalGroup {...approvalGroupProps} />
                      </Tabs.TabPane>
                    )}
                  </Tabs>
                )}
              </Row>
            </Form>
          </Spin>
          {variableDrawerVisible && <VariableDrawer {...variableDrawerProps} />}
          {approvalDrawerVisible && <ApprovalGroupDrawer {...approvalDrawerProps} />}
          {columnDefinitionVisible && <ColumnDefinition {...columnDefinitionProps} />}
          {formDrawerVisible && <FormDrawer {...formDrawerProps} />}
          <EmailDrawer {...emailDrawerProps} />
          <CategoriesModal
            headerInfo={headerInfo}
            dataSource={processCategoryList}
            loading={fetchingCategories}
            visible={categoryVisible}
            onHandleAddCategories={this.handleAddCategories}
            onCloseCategoryModal={() => this.handleModalVisible('categoryVisible', false)}
            onHandleSearchCategories={this.handleSearchCategories}
          />
        </Content>
      </>
    );
  }
}

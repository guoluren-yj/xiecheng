import React from 'react';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { isEmpty, isArray, isFunction } from 'lodash';
import { Button, Card, Col, Form, Input, Row, Select, Spin, Table } from 'hzero-ui';
import { DataSet, Modal } from 'choerodon-ui/pro';
import { Tooltip, Icon, Text, Alert } from 'choerodon-ui';

import { Content, Header } from 'components/Page';
import Lov from 'components/Lov';
import Switch from 'components/Switch';
import TLEditor from 'components/TLEditor';

import notification from 'utils/notification';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId, isTenantRoleLevel, getCurrentTenant } from 'utils/utils';
import {
  DETAIL_CARD_CLASSNAME,
  DETAIL_CARD_TABLE_CLASSNAME,
  // EDIT_FORM_ITEM_LAYOUT,
  EDIT_FORM_ROW_LAYOUT,
  FORM_COL_3_LAYOUT,
} from 'utils/constants';
import { CODE_UPPER } from 'utils/regExp';
import { yesOrNoRender, operatorRender } from 'utils/renderer';

import { saveDefaultExpressionEngine } from '../../../services/serviceDefinitionService';
import ParamsDrawer from './ParamsDrawer';
import ExpressionParamter from './ExpressionParamter';
import ScriptParamter from './ScriptParamter';
import ExpressionEngine from '../../../components/ExpressionEngine/index.tsx';
import ApprovalGroup from './ApprovalGroup';

import styles from '../index.less';

const EDIT_FORM_ITEM_LAYOUT = {
  labelCol: {
    span: 7,
  },
  wrapperCol: {
    span: 17,
  },
};

@Form.create({ fieldNameProp: null })
@connect(({ loading, serviceDefinition }) => ({
  serviceDefinition,
  currentTenantId: getCurrentOrganizationId(),
  currentTenant: getCurrentTenant(),
  isSiteFlag: !isTenantRoleLevel(),
  detailLoading: loading.effects['serviceDefinition/fetchDetail'],
  createLoading: loading.effects['serviceDefinition/createService'],
  updateLoading: loading.effects['serviceDefinition/updateService'],
  paramsLoading: loading.effects['serviceDefinition/queryParams'],
  paramSaving: loading.effects['serviceDefinition/updateParam'],
  syncLoading: loading.effects['serviceDefinition/syncParam'],
  validateLoading: loading.effects['serviceDefinition/validateBeforeSave'],
}))
@formatterCollections({ code: ['hwfp.serviceDefinition', 'hpfm.valueList'] })
export default class Detail extends React.Component {
  state = {
    paramsModalVisible: false,
    viewName: '',
    chooseTenantNum: this.props.currentTenant.tenantNum || '',
    approvalGroupList: [],
    approverList: [],
    currentApprovalGroup: {},
    processDocument: {},
    conditionExpression: undefined,
  };

  constructor(props) {
    super(props);
    // props.onRef(this);
    this.approvalGroup = React.createRef();
    this.expressionEngineRef = React.createRef();
    this.conditionColumnFormDs = new DataSet({
      fields: [
        {
          name: 'conditionColumn',
          type: 'object',
          label: intl.get('hwfp.serviceDefinition.model.button.addConditionColumn').d('添加条件'),
          lovCode: 'HWFP.APPROVAL_GROUP_COLUMN_LOV_VIEW',
          multiple: true,
          textField: 'columnName',
          valueField: 'parameterValue',
          lovPara: {
            columnType: 'INPUT',
          },
          optionsProps: {},
        },
      ],
    });
  }

  componentDidMount() {
    const {
      dispatch,
      serviceDefinition: { serviceTypeList = [], paramterSourceList = [] },
    } = this.props;
    if (serviceTypeList.length === 0) {
      dispatch({
        type: 'serviceDefinition/init',
      });
    }
    if (paramterSourceList.length === 0) {
      dispatch({
        type: 'serviceDefinition/initParamter',
      });
    }
    this.fetchDetail();
  }

  @Bind()
  fetchDetail(flag) {
    const { dispatch, match } = this.props;
    const {
      params: { serviceId },
    } = match;
    if (serviceId !== 'create') {
      dispatch({
        type: 'serviceDefinition/fetchDetail',
        payload: { serviceId },
      }).then((res) => {
        if (res) {
          this.setState({ viewName: res.viewName });
          if (flag && isFunction(this.approvalGroup.query)) {
            this.approvalGroup.query();
          }
        }
      });
    } else {
      dispatch({
        type: 'serviceDefinition/updateState',
        payload: {
          serviceDetail: {},
          parameterList: [],
        },
      });
    }
  }

  @Bind()
  handleUpdateParam(data = {}) {
    const { parameterSource } = data;
    this.setState({ paramsModalVisible: true, paramEditData: data });
    if (parameterSource === 'VARIABLE') {
      this.handleChangeSource(parameterSource);
    }
  }

  @Bind()
  handleHideParams() {
    this.setState({ paramsModalVisible: false, paramEditData: {} });
  }

  @Bind()
  handleParamOk(fieldsValue = {}) {
    const {
      dispatch,
      serviceDefinition: { parameterList = [] },
    } = this.props;
    const { paramEditData } = this.state;
    const updateList = parameterList.map((item) => {
      if (item.interfaceParameterId === paramEditData.interfaceParameterId) {
        return { ...paramEditData, ...fieldsValue };
      } else {
        return item;
      }
    });
    dispatch({
      type: 'serviceDefinition/updateState',
      payload: {
        parameterList: updateList,
      },
    });
    this.handleHideParams();
  }

  @Bind()
  queryParams(params) {
    const { dispatch } = this.props;
    dispatch({
      type: 'serviceDefinition/queryParams',
      payload: {
        interfaceId: params,
      },
    });
  }

  // 切换服务方式
  @Bind
  handleServiceCodeChange() {
    const { dispatch } = this.props;
    dispatch({
      type: 'serviceDefinition/updateState',
      payload: {
        parameterList: [],
      },
    });
  }

  // 切换服务类别，清空服务方式和表达式
  @Bind
  handleServiceTypeChange() {
    const { dispatch, form } = this.props;
    form.setFieldsValue({ serviceMode: '' });
    form.setFieldsValue({ simpleExpression: '' });
    dispatch({
      type: 'serviceDefinition/updateState',
      payload: {
        parameterList: [],
      },
    });
  }

  @Bind()
  handleServiceChange(value) {
    this.queryParams(value);
  }

  @Bind()
  handleChangeSource() {
    const { dispatch, form } = this.props;
    const { categoryId, documentId } = form.getFieldsValue(['categoryId', 'documentId']);
    dispatch({
      type: 'serviceDefinition/fetchVariable',
      payload: {
        categoryId,
        documentId,
      },
    });
  }

  @Bind()
  handleSave() {
    const { dispatch, form, match, history, serviceDefinition = {} } = this.props;
    const {
      params: { serviceId },
    } = match;
    const { serviceDetail = {}, parameterList = [] } = serviceDefinition;
    form.validateFields((error, values) => {
      if (error) {
        console.log(JSON.stringify(error));
      }
      if (!error) {
        const isHaveValue = parameterList.find(
          (item) => item.parameterValue === undefined || item.parameterSource === undefined
        );
        if (serviceId === 'create') {
          if (isHaveValue && values.serviceMode === 'REMOTE') {
            notification.warning({
              message: intl
                .get('hwfp.serviceDefinition.view.message.setValueAndSource')
                .d('请设置参数值和参数来源'),
            });
            return;
          }
          let approvalGroupData = [];
          if (isFunction(this.approvalGroup.onSave)) {
            approvalGroupData = this.approvalGroup.onSave();
          }
          if (!isArray(approvalGroupData)) {
            notification.warning({
              message: intl
                .get('hwfp.serviceDefinition.view.message.approvalGroupData')
                .d('审批人选择不能为空'),
            });
            return;
          }
          let params = {
            ...values,
            parameterList: values.interfaceId
              ? parameterList.map((item) => {
                  const { _token, objectVersionNumber, parameterId, ...other } = item;
                  return { interfaceParameterId: parameterId, ...other };
                })
              : parameterList,
          };
          // 手动更新审批组
          let queryApprovalGroup = false;
          if (values.serviceMode === 'APPROVAL_GROUP' && approvalGroupData.length > 0) {
            params = { ...params, parameterList: approvalGroupData };
            queryApprovalGroup = true;
          }
          if (values.serviceMode === 'LOV_VIEW') {
            params.viewName = this.state.viewName;
          } else {
            delete params.viewCode;
            delete params.viewName;
          }
          dispatch({
            type: 'serviceDefinition/createService',
            payload: params,
          }).then((res) => {
            if (res) {
              history.push(`/hwfp/service-definition/detail/${res.serviceId}`);
              const { chooseTenantNum: tenantNum } = this.state;
              const { serviceCode } = res;
              if (values.serviceMode === 'EXPRESSION_ENGINE' && tenantNum && serviceCode) {
                saveDefaultExpressionEngine({
                  code: `${tenantNum}:${serviceCode}`,
                  conditionExpression: null,
                  conditionExpressionJson: '{"conditionType":"TRUE","conditionLines":[]}',
                  expressionActionDescription: null,
                  id: null,
                  objectVersionNumber: null,
                  tenantId: null,
                }).finally(() => {
                  this.fetchDetail(queryApprovalGroup);
                });
              } else {
                this.fetchDetail(queryApprovalGroup);
              }
            }
          });
        } else {
          if (isHaveValue && values.serviceMode === 'REMOTE') {
            notification.warning({
              message: intl
                .get('hwfp.serviceDefinition.view.message.setValueAndSource')
                .d('请设置参数值和参数来源'),
            });
            return;
          }
          let approvalGroupData = [];
          if (isFunction(this.approvalGroup.onSave)) {
            approvalGroupData = this.approvalGroup.onSave();
          }
          if (!isArray(approvalGroupData)) {
            notification.warning({
              message: intl
                .get('hwfp.serviceDefinition.view.message.approvalGroupData')
                .d('审批人选择不能为空'),
            });
            return;
          }
          let params = {
            ...serviceDetail,
            parameterList,
            ...values,
          };
          // 手动更新审批组
          let queryApprovalGroup = false;
          if (values.serviceMode === 'APPROVAL_GROUP' && approvalGroupData.length > 0) {
            params = { ...params, parameterList: approvalGroupData };
            queryApprovalGroup = true;
          }
          if (values.serviceMode === 'LOV_VIEW') {
            params.viewName = this.state.viewName;
          } else {
            delete params.viewCode;
            delete params.viewName;
          }
          this.props
            .dispatch({
              type: 'serviceDefinition/validateBeforeSave',
              payload: params,
            })
            .then((res) => {
              if (res && res.failed === true) {
                Modal.confirm({
                  title: intl.get('hwfp.serviceDefinition.message.confirm.title').d('提示'),
                  children: res.message,
                  onOk: () => this.handleUpdateService(params, queryApprovalGroup),
                });
              } else {
                if (this.expressionEngineRef && this.expressionEngineRef.current) {
                  const { onSaveExpressionEngine } = this.expressionEngineRef.current;
                  if (isFunction(onSaveExpressionEngine)) {
                    onSaveExpressionEngine();
                  } else {
                    notification.success();
                  }
                } else {
                  notification.success();
                }
                this.fetchDetail(queryApprovalGroup);
              }
            });
        }
      }
    });
  }

  @Bind()
  handleUpdateService = (params, queryApprovalGroup) => {
    this.props
      .dispatch({
        type: 'serviceDefinition/updateService',
        payload: params,
      })
      .then((res) => {
        if (res) {
          if (this.expressionEngineRef && this.expressionEngineRef.current) {
            const { onSaveExpressionEngine } = this.expressionEngineRef.current;
            if (isFunction(onSaveExpressionEngine)) {
              onSaveExpressionEngine();
            } else {
              notification.success();
            }
          } else {
            notification.success();
          }
          this.fetchDetail(queryApprovalGroup);
        }
      });
  };

  @Bind()
  handleChangeLov(_, record) {
    this.setState({ viewName: record.viewName });
  }

  @Bind()
  getColumns(isSiteFlag, isPredefined, isCreate) {
    if (!this.columns) {
      this.columns = [
        {
          title: intl.get('hwfp.serviceDefinition.model.param.parameterName').d('参数名称'),
          dataIndex: 'parameterName',
        },
        {
          title: intl
            .get('hwfp.serviceDefinition.model.service.interfaceParameterType')
            .d('参数类型'),
          dataIndex: 'interfaceParameterTypeMeaning',
          width: 150,
        },
        {
          title: intl.get('hwfp.serviceDefinition.model.param.defaultValue').d('默认值'),
          dataIndex: 'defaultValue',
          width: 150,
        },
        {
          title: intl.get('hwfp.serviceDefinition.model.param.parameterValue').d('参数值'),
          dataIndex: 'parameterValue',
          width: 150,
        },
        {
          title: intl.get('hwfp.serviceDefinition.model.service.parameterSource').d('参数来源'),
          dataIndex: 'parameterSourceMeaning',
          width: 150,
        },
        {
          title: intl.get('hwfp.serviceDefinition.model.param.description').d('参数描述'),
          dataIndex: 'description',
          width: 150,
        },
        {
          title: intl.get('hzero.common.button.action').d('操作'),
          dataIndex: 'edit',
          width: 80,
          render: (val, record) => {
            const operators = [
              {
                key: 'edit',
                ele: (
                  <a
                    onClick={() => {
                      this.handleUpdateParam(record);
                    }}
                  >
                    {intl.get('hzero.common.button.edit').d('编辑')}
                  </a>
                ),
                len: 2,
                title: intl.get('hzero.common.button.edit').d('编辑'),
              },
            ];
            if (isSiteFlag || !isPredefined || isCreate) {
              return operatorRender(operators, record);
            } else {
              return null;
            }
          },
        },
      ];
    }
    return this.columns;
  }

  @Bind()
  fetchSyncParam() {
    const {
      dispatch,
      serviceDefinition: { parameterList = [], serviceDetail: { serviceId, interfaceId } = {} },
    } = this.props;
    dispatch({
      type: 'serviceDefinition/syncParam',
      payload: {
        serviceId,
        interfaceId,
      },
    }).then((res) => {
      if (res) {
        notification.success();
        if (!isEmpty(res)) {
          let newParameterList = [];
          // if (!isEmpty(parameterList)) {
          // newParameterList = parameterList
          //   .filter((i) => !res.some((r) => r.parameterId === i.parameterId))
          //   .concat(
          //     res.map((item) => {
          //       const { parameterId, ...other } = item;
          //       return {
          //         ...other,
          //         interfaceParameterId: parameterId,
          //       };
          //     })
          //   );
          newParameterList = res
            .filter(
              (r) =>
                !parameterList.some(
                  (l) => l.parameterId === r.parameterId || r.parameterId === l.interfaceParameterId
                )
            )
            .map((item) => {
              const { parameterId, ...other } = item;
              return {
                ...other,
                interfaceParameterId: parameterId,
              };
            })
            .concat(parameterList);
          // }
          this.syncParam(newParameterList);
        }
      }
    });
  }

  @Bind()
  syncParam(parameterList) {
    this.props.dispatch({
      type: 'serviceDefinition/updateState',
      payload: { parameterList },
    });
  }

  @Bind()
  clearServiceMode(value, record) {
    if (this.props.isSiteFlag) {
      this.changeCategory();
      this.setState({ chooseTenantNum: record && record.tenantNum ? record.tenantNum : '' });
      this.props.form.setFieldsValue({
        serviceMode: '',
        serviceType: '',
        categoryId: undefined,
      });
    }
  }

  @Bind()
  returnSelect(serviceModeList) {
    const { form, isSiteFlag } = this.props;
    const { getFieldValue } = form;
    return serviceModeList.map((item) => {
      if (item.value === 'EXPRESSION' && getFieldValue('serviceType') === 'SERVICE_TASK') {
        return null;
      } else if (item.value === 'REMOTE' && Number(form.getFieldValue('tenantId')) !== 0) {
        return null;
      } else if (item.value === 'LOV_VIEW') {
        if (
          getFieldValue('serviceType') === 'APPROVAL_CANDIDATE_RULE' &&
          Number(form.getFieldValue('tenantId')) === 0
        ) {
          return (
            <Select.Option value={item.value} key={item.value}>
              {item.meaning}
            </Select.Option>
          );
        } else {
          return null;
        }
      } else if (item.value === 'SCRIPT' && Number(form.getFieldValue('tenantId')) === 0) {
        return null;
      } else if (
        item.value === 'EXPRESSION_ENGINE' &&
        getFieldValue('serviceType') !== 'SEQUENCE_CONDITION'
      ) {
        return null;
      } else if (item.value === 'APPROVAL_GROUP') {
        if (getFieldValue('serviceType') === 'APPROVAL_CANDIDATE_RULE' && !isSiteFlag) {
          return (
            <Select.Option value={item.value} key={item.value}>
              {item.meaning}
            </Select.Option>
          );
        } else {
          return null;
        }
      } else {
        return (
          <Select.Option value={item.value} key={item.value}>
            {item.meaning}
          </Select.Option>
        );
      }
    });
  }

  @Bind()
  changeLovDocumentId(val, record) {
    const { dispatch, form, currentTenantId, isSiteFlag } = this.props;
    const tenantId = form.getFieldValue('tenantId') || currentTenantId;
    if (val && !isSiteFlag) {
      dispatch({
        type: 'serviceDefinition/getApprovalGroupList',
        payload: { organizationId: tenantId, sourceId: val },
      }).then((res) => {
        if (isArray(res)) {
          this.setState({ approvalGroupList: res, processDocument: record });
        }
      });
    }
  }

  @Bind()
  handleApprovalGroupChange(val, record) {
    const { approvalGroupList } = this.state;
    const {
      dispatch,
      form: { getFieldDecorator, setFieldsValue },
    } = this.props;
    if (val && record.key) {
      // 对id和key进行String转换，解决Number和String对比问题
      const currentApprovalGroup = approvalGroupList.filter(
        (res) => String(res.id) === String(record.key)
      );
      this.setState({ currentApprovalGroup: currentApprovalGroup[0] });
      getFieldDecorator('approvalGroupDefId', { initialValue: '' });
      getFieldDecorator('approvalGroupDefName', { initialValue: '' });
      setFieldsValue({
        approvalGroupDefId: currentApprovalGroup[0].id,
        approvalGroupDefName: currentApprovalGroup[0].defName,
      });
      dispatch({
        type: 'serviceDefinition/getApproverList',
        payload: { defId: currentApprovalGroup[0].id },
      }).then((res) => {
        if (isArray(res)) {
          this.setState({ approverList: res });
        }
      });
    } else {
      getFieldDecorator('approvalGroupDefId', { initialValue: '' });
      getFieldDecorator('approvalGroupDefName', { initialValue: '' });
      setFieldsValue({ approvalGroupDefId: '', approvalGroupDefName: '' });
      this.setState({ currentApprovalGroup: {}, approverList: [] });
    }
  }

  @Bind
  changeCategory() {
    const {
      form: { setFieldsValue },
    } = this.props;
    setFieldsValue({ documentId: undefined, scriptCode: undefined });
    this.setState({
      processDocument: {},
    });
  }

  @Bind()
  handleExpressionEngineAfterQuery(result) {
    if (result && result.conditionExpression) {
      const { conditionExpression } = result;
      this.setState({
        conditionExpression,
      });
      this.props.form.setFieldsValue({
        expression: conditionExpression,
      });
    }
  }

  render() {
    const {
      form,
      dispatch,
      isSiteFlag,
      currentTenantId,
      currentTenant,
      paramSaving = false,
      detailLoading = false,
      updateLoading = false,
      createLoading = false,
      paramsLoading = false,
      syncLoading = false,
      validateLoading = false,
      serviceDefinition: {
        serviceTypeList = [],
        serviceModeList = [],
        serviceOperatorList = [],
        paramterSourceList = [],
        serviceDetail: {
          serviceModeMeaning,
          serviceId,
          tenantId,
          tenantName,
          tenantNum,
          interfaceId,
          documentDescription,
          interfaceCode,
          serviceCode,
          viewCode,
          viewName,
          categoryId,
          scriptCode,
          categoryDescription,
          expression,
          simpleExpression,
          approveResultExpression,
          simpleApproveResultExpression,
          approvalGroupDefCode,
          approvalGroupDefName,
          approvalGroupDefId,
          documentId,
          description,
          _token,
          serviceMode = '',
          serviceType = '',
          serviceTypeMeaning = '',
          enabledFlag = 1,
          requestConstants = '',
        } = {},
        variableList = [],
        parameterList = [],
      },
    } = this.props;
    const {
      paramsModalVisible,
      paramEditData,
      approvalGroupList,
      approverList,
      currentApprovalGroup,
      processDocument,
      conditionExpression,
    } = this.state;
    const { getFieldDecorator, getFieldValue } = form;
    const lovParam = {
      categoryId: getFieldValue('categoryId') || categoryId,
      documentId: getFieldValue('documentId') || documentId,
    };
    const paramsProps = {
      paramSaving,
      paramterSourceList,
      variableList,
      modalVisible: paramsModalVisible,
      initData: paramEditData,
      onChangeSource: this.handleChangeSource,
      onOk: this.handleParamOk,
      onCancel: this.handleHideParams,
    };
    // 是否预定义按钮控制
    const isPredefined = currentTenantId !== tenantId;
    // 是否新建
    const isCreate = serviceId === undefined || serviceId === 'create';
    // 编辑逻辑控制
    const editControl = !isSiteFlag ? isPredefined && !isCreate : false;
    return (
      <>
        <Header
          title={intl.get('hwfp.serviceDefinition.view.title.serviceDefinition').d('服务定义')}
          backPath="/hwfp/service-definition/list"
        >
          <Button
            icon="save"
            type="primary"
            disabled={detailLoading || editControl}
            loading={createLoading || updateLoading || validateLoading}
            onClick={this.handleSave}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          {!isCreate && ['REMOTE', 'LOV_VIEW'].includes(serviceMode) && (
            <Button
              icon="sync"
              disabled={detailLoading || editControl}
              loading={syncLoading}
              onClick={this.fetchSyncParam}
            >
              {intl.get('hwfp.serviceDefinition.view.button.syncParam').d('同步变量')}
            </Button>
          )}
        </Header>
        <Content>
          <Spin spinning={detailLoading}>
            {['SEQUENCE_CONDITION', 'APPROVAL_CANDIDATE_RULE', 'APPROVAL_STRATEGY'].includes(
              getFieldValue('serviceType')
            ) &&
              ['SCRIPT', 'REMOTE'].includes(getFieldValue('serviceMode')) && (
                <Alert
                  closable
                  type="info"
                  showIcon
                  className={styles.alert}
                  description={
                    <div>
                      {intl
                        .get('hwfp.serviceDefinition.view.message.alert')
                        .d(
                          '提示：服务类型为【跳转条件】、【审批规则】、【审批方式】，服务方式实现的接口与脚本内仅支持查询，不允许增加其他写入与调用逻辑（流程预测会预执行对应服务类型，导致单据/数据异常）'
                        )}
                    </div>
                  }
                />
              )}
            <Card
              bordered={false}
              className={DETAIL_CARD_CLASSNAME}
              title={
                <h3>
                  {intl.get('hwfp.serviceDefinition.view.title.serviceDefinition').d('服务定义')}
                </h3>
              }
              loading={false}
            >
              <Form className={styles['edit-form']}>
                <Row
                  {...EDIT_FORM_ROW_LAYOUT}
                  type="flex"
                  justify="start"
                  className="inclusion-row"
                >
                  {isSiteFlag && (
                    <Col {...FORM_COL_3_LAYOUT}>
                      <Form.Item
                        label={intl.get('entity.tenant.tag').d('租户')}
                        {...EDIT_FORM_ITEM_LAYOUT}
                      >
                        {getFieldDecorator('tenantId', {
                          initialValue: tenantId,
                          rules: [
                            {
                              required: isCreate,
                              message: intl.get('hzero.common.validation.notNull', {
                                name: intl.get('entity.tenant.tag').d('租户'),
                              }),
                            },
                          ],
                        })(
                          !isCreate ? (
                            <>{tenantName}</>
                          ) : (
                            <Lov
                              textValue={tenantName}
                              code="HPFM.TENANT"
                              onChange={this.clearServiceMode}
                            />
                          )
                        )}
                      </Form.Item>
                    </Col>
                  )}
                  <Col {...FORM_COL_3_LAYOUT}>
                    <Form.Item
                      {...EDIT_FORM_ITEM_LAYOUT}
                      label={intl
                        .get('hwfp.serviceDefinition.model.service.categoryId')
                        .d('流程分类')}
                    >
                      {getFieldDecorator('categoryId', {
                        initialValue: categoryId,
                        rules: [
                          {
                            required: isCreate,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl
                                .get('hwfp.serviceDefinition.model.service.categoryId')
                                .d('流程分类'),
                            }),
                          },
                        ],
                      })(
                        !isCreate ? (
                          <>{categoryDescription}</>
                        ) : (
                          <Lov
                            code="HWFP.PROCESS_CATEGORY"
                            disabled={
                              !isSiteFlag ? false : form.getFieldValue('tenantId') === undefined
                            }
                            queryParams={isSiteFlag ? {} : { tenantId: currentTenantId }}
                            onChange={() => this.changeCategory()}
                          />
                        )
                      )}
                    </Form.Item>
                  </Col>
                  <Col {...FORM_COL_3_LAYOUT}>
                    <Form.Item
                      {...EDIT_FORM_ITEM_LAYOUT}
                      label={intl
                        .get('hwfp.serviceDefinition.model.service.serviceCode')
                        .d('服务编码')}
                    >
                      {getFieldDecorator('serviceCode', {
                        initialValue: serviceCode,
                        rules: [
                          {
                            required: isCreate,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl
                                .get('hwfp.serviceDefinition.model.service.serviceCode')
                                .d('服务编码'),
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
                        !isCreate ? (
                          <>{serviceCode}</>
                        ) : (
                          <Input trim typeCase="upper" inputChinese={false} />
                        )
                      )}
                    </Form.Item>
                  </Col>
                  <Col {...FORM_COL_3_LAYOUT}>
                    <Form.Item
                      {...EDIT_FORM_ITEM_LAYOUT}
                      label={intl
                        .get('hwfp.serviceDefinition.model.service.description')
                        .d('服务描述')}
                    >
                      {getFieldDecorator('description', {
                        initialValue: description,
                        rules: [
                          {
                            required: true,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl
                                .get('hwfp.serviceDefinition.model.service.description')
                                .d('服务描述'),
                            }),
                          },
                          {
                            max: 240,
                            message: intl.get('hzero.common.validation.max', {
                              max: 240,
                            }),
                          },
                        ],
                      })(
                        editControl ? (
                          <>{description}</>
                        ) : (
                          <TLEditor
                            label={intl
                              .get('hwfp.serviceDefinition.model.service.description')
                              .d('服务描述')}
                            field="description"
                            inputSize={{ zh: 240, en: 240 }}
                            token={_token}
                            disabled={editControl}
                          />
                        )
                      )}
                    </Form.Item>
                  </Col>
                  <Col {...FORM_COL_3_LAYOUT}>
                    <Form.Item
                      {...EDIT_FORM_ITEM_LAYOUT}
                      label={intl
                        .get('hwfp.serviceDefinition.model.service.serviceType')
                        .d('服务类别')}
                    >
                      {getFieldDecorator('serviceType', {
                        initialValue: serviceType,
                        rules: [
                          {
                            required: isCreate,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl
                                .get('hwfp.serviceDefinition.model.service.serviceType')
                                .d('服务类别'),
                            }),
                          },
                        ],
                      })(
                        !isCreate ? (
                          <>{serviceTypeMeaning}</>
                        ) : (
                          <Select
                            allowClear
                            style={{ width: '100%' }}
                            onChange={this.handleServiceTypeChange}
                          >
                            {serviceTypeList.map((item) => (
                              <Select.Option value={item.value} key={item.value}>
                                {item.meaning}
                              </Select.Option>
                            ))}
                          </Select>
                        )
                      )}
                    </Form.Item>
                  </Col>
                  <Col {...FORM_COL_3_LAYOUT}>
                    <Form.Item
                      {...EDIT_FORM_ITEM_LAYOUT}
                      label={intl
                        .get('hwfp.serviceDefinition.model.service.serviceMode')
                        .d('服务方式')}
                    >
                      {getFieldDecorator('serviceMode', {
                        initialValue: serviceMode,
                        rules: [
                          {
                            required: isCreate,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl
                                .get('hwfp.serviceDefinition.model.service.serviceMode')
                                .d('服务方式'),
                            }),
                          },
                        ],
                      })(
                        !isCreate ? (
                          <>{serviceModeMeaning}</>
                        ) : (
                          <Select
                            allowClear
                            style={{ width: '100%' }}
                            onChange={this.handleServiceCodeChange}
                            disabled={
                              !isSiteFlag
                                ? !form.getFieldValue('serviceType')
                                : form.getFieldValue('tenantId') === undefined ||
                                  !form.getFieldValue('serviceType')
                            }
                          >
                            {this.returnSelect(serviceModeList)}
                          </Select>
                        )
                      )}
                    </Form.Item>
                  </Col>
                  {form.getFieldValue('serviceMode') === 'APPROVAL_GROUP' && (
                    <Col {...FORM_COL_3_LAYOUT}>
                      <Form.Item
                        {...EDIT_FORM_ITEM_LAYOUT}
                        label={intl
                          .get('hwfp.serviceDefinition.model.service.documentId')
                          .d('流程单据')}
                      >
                        {getFieldDecorator('documentId', {
                          rules: [
                            {
                              required: form.getFieldValue('serviceMode') === 'APPROVAL_GROUP',
                              message: intl.get('hzero.common.validation.notNull', {
                                name: intl
                                  .get('hwfp.serviceDefinition.model.service.documentId')
                                  .d('流程单据'),
                              }),
                            },
                          ],
                          initialValue: documentId,
                        })(
                          !isCreate ? (
                            <>{documentDescription || processDocument.description}</>
                          ) : (
                            <Lov
                              onChange={this.changeLovDocumentId}
                              allowClear={false}
                              disabled={!form.getFieldValue('categoryId')}
                              queryParams={{
                                tenantId: form.getFieldValue('tenantId') || currentTenantId,
                                categoryId: form.getFieldValue('categoryId'),
                              }}
                              code="HWFP.PROCESS_DOCUMENT"
                              textValue={documentDescription || processDocument.description}
                            />
                          )
                        )}
                      </Form.Item>
                    </Col>
                  )}
                  {form.getFieldValue('serviceMode') === 'LOV_VIEW' && (
                    <Col {...FORM_COL_3_LAYOUT}>
                      <Form.Item
                        {...EDIT_FORM_ITEM_LAYOUT}
                        label={intl.get('hpfm.valueList.lovSetting.title.lovSetting').d('值集视图')}
                      >
                        {getFieldDecorator('viewCode', {
                          initialValue: viewCode,
                          rules: [
                            {
                              required:
                                isCreate && form.getFieldValue('serviceMode') === 'LOV_VIEW',
                              message: intl.get('hzero.common.validation.notNull', {
                                name: intl
                                  .get('hpfm.valueList.lovSetting.title.lovSetting')
                                  .d('值集视图'),
                              }),
                            },
                          ],
                        })(
                          !isCreate ? (
                            <>{viewName}</>
                          ) : (
                            <Lov
                              code="SPFM.LOV_VIEW.ORG"
                              textValue={viewName}
                              queryParams={
                                isTenantRoleLevel() && {
                                  tenantId: getCurrentOrganizationId(),
                                }
                              }
                              lovOptions={{ displayField: 'viewName', valueField: 'viewCode' }}
                              onChange={this.handleChangeLov}
                            />
                          )
                        )}
                      </Form.Item>
                    </Col>
                  )}
                  {form.getFieldValue('serviceMode') === 'REMOTE' ||
                  form.getFieldValue('serviceMode') === 'LOV_VIEW' ? (
                    <Col {...FORM_COL_3_LAYOUT}>
                      <Form.Item
                        {...EDIT_FORM_ITEM_LAYOUT}
                        label={intl
                          .get('hwfp.serviceDefinition.model.interface.interfaceCode')
                          .d('接口定义编码')}
                      >
                        {getFieldDecorator('interfaceId', {
                          initialValue: interfaceId,
                          rules: [
                            {
                              required:
                                isCreate &&
                                ['REMOTE', 'LOV_VIEW'].includes(form.getFieldValue('serviceMode')),
                              message: intl.get('hzero.common.validation.notNull', {
                                name: intl
                                  .get('hwfp.serviceDefinition.model.interface.interfaceCode')
                                  .d('接口定义编码'),
                              }),
                            },
                          ],
                        })(
                          !isCreate ? (
                            <>{interfaceCode}</>
                          ) : (
                            <Lov
                              allowClear={false}
                              code="HWFP.INTERFACE"
                              queryParams={{
                                organizationId: isTenantRoleLevel()
                                  ? getCurrentOrganizationId()
                                  : 0,
                              }}
                              lovOptions={{ displayField: 'interfaceCode' }}
                              onChange={this.handleServiceChange}
                            />
                          )
                        )}
                      </Form.Item>
                    </Col>
                  ) : form.getFieldValue('serviceMode') === 'SCRIPT' ? (
                    <Col {...FORM_COL_3_LAYOUT}>
                      <Form.Item
                        {...EDIT_FORM_ITEM_LAYOUT}
                        label={intl
                          .get('hwfp.serviceDefinition.model.interface.scriptCode')
                          .d('脚本')}
                      >
                        {getFieldDecorator('scriptCode', {
                          initialValue: scriptCode,
                          rules: [
                            {
                              required: form.getFieldValue('serviceMode') === 'SCRIPT',
                              message: intl.get('hzero.common.validation.notNull', {
                                name: intl
                                  .get('hwfp.serviceDefinition.model.interface.scriptCode')
                                  .d('脚本'),
                              }),
                            },
                            {
                              max: 120,
                              message: intl.get('hzero.common.validation.max', {
                                max: 120,
                              }),
                            },
                          ],
                        })(
                          !isCreate ? (
                            <>{scriptCode}</>
                          ) : (
                            <Lov
                              allowClear={false}
                              code={
                                isSiteFlag
                                  ? 'SADA_MARMOT_SCRIPT_LIBRARY_VIEW'
                                  : 'SADA_ORG_MARMOT_SCRIPT_LIBRARY_VIEW'
                              }
                              queryParams={{
                                tenantNum: isSiteFlag
                                  ? this.state.chooseTenantNum
                                  : currentTenant?.tenantNum,
                                tenantId: 0,
                                quickType: 'workflow',
                              }}
                              textValue={scriptCode}
                            />
                          )
                        )}
                      </Form.Item>
                    </Col>
                  ) : form.getFieldValue('serviceMode') === 'EXPRESSION_ENGINE' ? (
                    ''
                  ) : form.getFieldValue('serviceMode') === 'APPROVAL_GROUP' ? (
                    <Col {...FORM_COL_3_LAYOUT}>
                      <Form.Item
                        {...EDIT_FORM_ITEM_LAYOUT}
                        label={intl
                          .get('hwfp.serviceDefinition.model.interface.approvalGroup')
                          .d('审批组')}
                      >
                        {getFieldDecorator('approvalGroupDefCode', {
                          initialValue: approvalGroupDefCode,
                          rules: [
                            {
                              required: form.getFieldValue('serviceMode') === 'APPROVAL_GROUP',
                              message: intl.get('hzero.common.validation.notNull', {
                                name: intl
                                  .get('hwfp.serviceDefinition.model.interface.approvalGroup')
                                  .d('审批组'),
                              }),
                            },
                          ],
                        })(
                          !isCreate ? (
                            <>{approvalGroupDefName}</>
                          ) : (
                            <Select
                              allowClear
                              onChange={this.handleApprovalGroupChange}
                              disabled={!form.getFieldValue('documentId')}
                            >
                              {approvalGroupList.map((item) => (
                                <Select.Option value={item.defCode} key={String(item.id)}>
                                  {item.defName}
                                </Select.Option>
                              ))}
                            </Select>
                          )
                        )}
                      </Form.Item>
                    </Col>
                  ) : (
                    <Col {...FORM_COL_3_LAYOUT}>
                      <Form.Item
                        {...EDIT_FORM_ITEM_LAYOUT}
                        label={
                          <>
                            <Text
                              className={styles['label-with-help']}
                              style={{ maxWidth: '70px' }}
                            >
                              {intl
                                .get('hwfp.serviceDefinition.model.interface.simpleExpression')
                                .d('表达式')}
                            </Text>
                            <Tooltip
                              title={intl.get(
                                'hwfp.serviceDefinition.model.interface.simpleExpression.tip'
                              )}
                            >
                              <Icon
                                type="help"
                                style={{ marginLeft: '4px', verticalAlign: 'sub' }}
                              />
                            </Tooltip>
                          </>
                        }
                      >
                        {getFieldDecorator('simpleExpression', {
                          initialValue: simpleExpression,
                          rules: [
                            {
                              required: ![
                                'REMOTE',
                                'LOV_VIEW',
                                'SCRIPT',
                                'EXPRESSION_ENGINE',
                                'APPROVAL_GROUP',
                              ].includes(form.getFieldValue('serviceMode')),
                              message: intl.get('hzero.common.validation.notNull', {
                                name: intl
                                  .get('hwfp.serviceDefinition.model.interface.simpleExpression')
                                  .d('表达式'),
                              }),
                            },
                            {
                              max: 120,
                              message: intl.get('hzero.common.validation.max', {
                                max: 120,
                              }),
                            },
                          ],
                        })(
                          editControl ? (
                            <>{expression}</>
                          ) : (
                            <Input disabled={!getFieldValue('serviceMode')} />
                          )
                        )}
                      </Form.Item>
                    </Col>
                  )}
                  {form.getFieldValue('serviceMode') !== 'REMOTE' &&
                    form.getFieldValue('serviceMode') !== 'LOV_VIEW' &&
                    form.getFieldValue('serviceMode') !== 'SCRIPT' &&
                    form.getFieldValue('serviceMode') !== 'APPROVAL_GROUP' &&
                    !isCreate && (
                      <Col {...FORM_COL_3_LAYOUT}>
                        <Form.Item
                          {...EDIT_FORM_ITEM_LAYOUT}
                          label={intl
                            .get('hwfp.serviceDefinition.model.interface.expression')
                            .d('执行表达式')}
                        >
                          {getFieldDecorator('expression', {
                            initialValue:
                              form.getFieldValue('serviceMode') === 'EXPRESSION_ENGINE'
                                ? conditionExpression
                                : expression,
                          })(
                            <>
                              {form.getFieldValue('serviceMode') === 'EXPRESSION_ENGINE'
                                ? conditionExpression
                                : expression}
                            </>
                          )}
                        </Form.Item>
                      </Col>
                    )}
                  {form.getFieldValue('serviceType') === 'APPROVAL_STRATEGY' && (
                    <Col {...FORM_COL_3_LAYOUT}>
                      <Form.Item
                        {...EDIT_FORM_ITEM_LAYOUT}
                        label={intl
                          .get('hwfp.serviceDefinition.model.interface.resultSimpleExpression')
                          .d('审批结果表达式')}
                      >
                        {getFieldDecorator('simpleApproveResultExpression', {
                          initialValue: simpleApproveResultExpression,
                          rules: [
                            {
                              max: 510,
                              message: intl.get('hzero.common.validation.max', {
                                max: 510,
                              }),
                            },
                          ],
                        })(editControl ? <>{simpleApproveResultExpression}</> : <Input />)}
                      </Form.Item>
                    </Col>
                  )}
                  {form.getFieldValue('serviceType') === 'APPROVAL_STRATEGY' && !isCreate && (
                    <Col {...FORM_COL_3_LAYOUT}>
                      <Form.Item
                        {...EDIT_FORM_ITEM_LAYOUT}
                        label={intl
                          .get('hwfp.serviceDefinition.model.interface.resultExpression')
                          .d('审批结果执行表达式')}
                      >
                        {getFieldDecorator('approveResultExpression', {
                          initialValue: approveResultExpression,
                        })(<>{approveResultExpression}</>)}
                      </Form.Item>
                    </Col>
                  )}
                  {form.getFieldValue('serviceMode') !== 'APPROVAL_GROUP' && (
                    <Col {...FORM_COL_3_LAYOUT}>
                      <Form.Item
                        {...EDIT_FORM_ITEM_LAYOUT}
                        label={intl
                          .get('hwfp.serviceDefinition.model.service.documentId')
                          .d('流程单据')}
                      >
                        {getFieldDecorator('documentId', {
                          initialValue: documentId,
                        })(
                          !isCreate ? (
                            <>{documentDescription || processDocument.description}</>
                          ) : (
                            <Lov
                              onChange={this.changeLovDocumentId}
                              allowClear={false}
                              disabled={!form.getFieldValue('categoryId')}
                              queryParams={{
                                tenantId: form.getFieldValue('tenantId') || currentTenantId,
                                categoryId: form.getFieldValue('categoryId'),
                              }}
                              code="HWFP.PROCESS_DOCUMENT"
                              textValue={documentDescription || processDocument.description}
                            />
                          )
                        )}
                      </Form.Item>
                    </Col>
                  )}
                  <Col {...FORM_COL_3_LAYOUT}>
                    <Form.Item
                      {...EDIT_FORM_ITEM_LAYOUT}
                      label={intl.get('hzero.common.status.enable').d('启用')}
                    >
                      {getFieldDecorator('enabledFlag', {
                        initialValue: enabledFlag,
                      })(
                        editControl ? (
                          <>{yesOrNoRender(enabledFlag)}</>
                        ) : (
                          <Switch disabled={editControl} />
                        )
                      )}
                    </Form.Item>
                  </Col>
                  {form.getFieldValue('serviceMode') === 'SCRIPT' && requestConstants && (
                    <Col {...FORM_COL_3_LAYOUT}>
                      <Form.Item
                        className={styles['form-code']}
                        {...EDIT_FORM_ITEM_LAYOUT}
                        label={intl
                          .get('hwfp.serviceDefinition.model.service.requestConstants')
                          .d('脚本常量参数')}
                      >
                        {getFieldDecorator('requestConstants', {
                          initialValue: requestConstants,
                        })(
                          <Tooltip
                            overlayStyle={{ width: '17vw', wordBreak: 'break-all' }}
                            theme="light"
                            placement="bottomLeft"
                            title={`requestConstants: ${requestConstants}`}
                          >
                            <span>requestConstants: {requestConstants}</span>
                          </Tooltip>
                        )}
                      </Form.Item>
                    </Col>
                  )}
                </Row>
              </Form>
            </Card>
          </Spin>
          {form.getFieldValue('serviceMode') === 'REMOTE' ||
          form.getFieldValue('serviceMode') === 'LOV_VIEW' ? (
            <>
              <Card
                bordered={false}
                className={DETAIL_CARD_TABLE_CLASSNAME}
                title={<h3>{intl.get('hzero.common.model.param').d('参数')}</h3>}
              >
                <Table
                  bordered
                  loading={paramsLoading}
                  rowKey="parameterId"
                  dataSource={parameterList}
                  columns={this.getColumns(isSiteFlag, isPredefined, isCreate)}
                  pagination={false}
                />
              </Card>
              {paramsModalVisible && <ParamsDrawer {...paramsProps} />}
            </>
          ) : form.getFieldValue('serviceMode') === 'SCRIPT' ? (
            <ScriptParamter
              isSiteFlag={isSiteFlag}
              isPredefined={isPredefined}
              dispatch={dispatch}
              onChangeSource={this.handleChangeSource}
              variableList={variableList}
              parameterList={parameterList}
              serviceOperatorList={serviceOperatorList}
              paramterSourceList={paramterSourceList}
              serviceType={form.getFieldValue('serviceType')}
              serviceMode={form.getFieldValue('serviceMode')}
            />
          ) : form.getFieldValue('serviceMode') === 'EXPRESSION_ENGINE' ? (
            serviceCode && (
              <ExpressionEngine
                code={`${tenantNum}:${serviceCode}`}
                currentTenantId={form.getFieldValue('tenantId') || tenantId}
                leftValueLovQueryPara={{ documentId, categoryId }}
                disabled={!isSiteFlag && isPredefined}
                showActionButton={false}
                childRef={this.expressionEngineRef}
                afterQuery={this.handleExpressionEngineAfterQuery}
              />
            )
          ) : form.getFieldValue('serviceMode') === 'APPROVAL_GROUP' ? (
            form.getFieldValue('approvalGroupDefCode') ? (
              <ApprovalGroup
                onRef={(ref) => {
                  this.approvalGroup = ref;
                }}
                isSiteFlag={isSiteFlag}
                isCreate={isCreate}
                dispatch={dispatch}
                approvalGroupDefId={approvalGroupDefId}
                parameterList={parameterList}
                approverList={approverList}
                currentApprovalGroup={currentApprovalGroup}
                conditionColumnFormDs={this.conditionColumnFormDs}
              />
            ) : (
              ''
            )
          ) : (
            <ExpressionParamter
              isSiteFlag={isSiteFlag}
              isPredefined={isPredefined}
              editControl={editControl}
              dispatch={dispatch}
              onChangeSource={this.handleChangeSource}
              variableList={variableList}
              parameterList={parameterList}
              serviceOperatorList={serviceOperatorList}
              paramterSourceList={paramterSourceList}
              lovParam={lovParam}
            />
          )}
        </Content>
      </>
    );
  }
}

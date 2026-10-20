/**
 * ProcessDefine - 流程设置/流程定义
 * @date: 2018-8-16
 * @author: WH <heng.wei@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Button, Menu } from 'hzero-ui';
import { Icon, Modal } from 'choerodon-ui';
import {
  Button as ButtonC7n,
  DataSet,
  Dropdown,
  Modal as C7NModal,
  TextArea,
  Form,
} from 'choerodon-ui/pro';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { isUndefined, omit, isEmpty, isNil } from 'lodash';
import { routerRedux } from 'dva/router';
import ExcelExportPro from 'srm-front-boot/lib/components/ExcelExportPro';
import withProps from 'utils/withProps';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { Header } from 'components/Page';
import { queryUnifyIdpValue } from 'services/api';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import notification from 'utils/notification';
import {
  getCurrentOrganizationId,
  filterNullValueObject,
  isTenantRoleLevel,
  getResponse,
  getCurrentLanguage,
} from 'utils/utils';
import { HZERO_HWFP } from 'utils/config';
import remote from 'hzero-front/lib/utils/remote';

import { handleExport } from '@/services/processDefineService';

import { getSettingConfig } from '@/stores/processDefineDS';

import ExcelExport from '@/components/ExcelExport';
import FilterForm from './FilterForm';
import ListTable from './ListTable';
import Drawer from './Drawer';
import ImportModal from './ImportModal';
import DeployRecord from './DeployRecord';
import CopyValue from './CopyValue';
import Setting from './Setting';
import TodoRemind from './TodoRemindNew';
import VerifyReleaseModal from './VerifyReleaseModal';
import styles from './index.less';
/**
 * 流程定义组件
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {!Object} processDefine - 数据源
 * @reactProps {!Object} loading - 数据加载是否完成
 * @reactProps {!Object} saving - 新建是否完成
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@remote({
  code: 'SWFL_PROCESS_DEFINE',
  name: 'processRemote',
})
@formatterCollections({
  code: ['hwfp.processDefine', 'hwfp.common', 'hzero.common', 'hwfm.common', 'hwfp.task'],
})
@withProps((withProp = {}) => {
  const { processRemote } = withProp || {};
  const settingConfigDs = new DataSet(
    processRemote.process('SWFL_PROCESS_DEFINE_SETTING_CONFIG_DS', getSettingConfig())
  );
  return { settingConfigDs };
}, {})
@withCustomize({
  unitCode: [
    'HWFP.PROCESS_DEFINITION.GRID',
    'HWFP.PROCESS_DEFINITION.QUERY',
    'HWFP.PROCESS_DEFINITION.SETTING',
    'HWFP.PROCESS_DEFINITION.COPY',
    'HWFP.PROCESS_DEFINITION.IMPORT',
    'HWFP.PROCESS_DEFINITION.CREATE',
  ],
})
@connect(({ processDefine, loading }) => ({
  processDefine,
  isSiteFlag: !isTenantRoleLevel(),
  tenantId: getCurrentOrganizationId(),
  loading: loading.effects['processDefine/fetchProcessList'],
  saving: loading.effects['processDefine/createProcess'],
  importLoading: loading.effects['processDefine/importProcess'],
  settingLoading: loading.effects['processDefine/updateProcessSetting'],
  releasing: loading.effects['processDefine/releaseProcess'],
  verifyReleasing: loading.effects['processDefine/verifyReleaseProcess'],
  loadingRecord: loading.effects['processDefine/fetchDeployHistory'],
  copyLoading: loading.effects['processDefine/copyValue'],
  docLoading: loading.effects['processDefine/fetchDocuments'],
}))
export default class ProcessDefine extends Component {
  form;

  constructor(props) {
    super(props);
    this.drawerRef = React.createRef();
    this.tableRef = null;
    this.state = {
      importVisible: false,
      deployRecord: {},
      deployModalVisible: false,
      settingVisible: false,
      copyVisible: false,
      messageTypeList: [],
      currentCopyRecord: {},
      currentSettingRecord: {},
      remindVisible: false,
      remindQuery: {},
      exportCurrentLoading: false,
      exportAllLoading: false,
      verifyVisible: false,
      verifyResult: {},
      verifyRecord: {},
    };
  }

  /**
   * render()调用后获取数据
   */
  componentDidMount() {
    const {
      processDefine: { pagination = {} },
      location: { state: { _back } = {} },
    } = this.props;
    // 校验是否从详情页返回
    const page = isUndefined(_back) ? {} : pagination;
    this.fetchIdpValue();
    this.handleSearch(page);
    this.fetchCategory();
    this.fetchMessageType();
  }

  @Bind()
  fetchIdpValue() {
    const { dispatch } = this.props;
    dispatch({
      type: 'processDefine/fetchIdpValue',
      payload: { processDefineSourceTypes: 'HPFM.PROCESS_DOCUMENT_SOURCE' },
    });
  }

  /**
   * 传递表单对象
   * @param {object} ref - FilterForm对象
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  @Bind()
  handleBindTableRef(ref = {}) {
    this.tableRef = ref;
  }

  @Bind()
  handleExpandForm() {
    if (this.tableRef) {
      this.tableRef.handler();
    }
  }

  // 获取流程分类
  @Bind()
  fetchCategory() {
    const { dispatch, tenantId } = this.props;
    dispatch({
      type: 'processDefine/fetchCategory',
      payload: { tenantId },
    });
  }

  @Bind()
  fetchMessageType() {
    queryUnifyIdpValue('HWFP.MESSAGE_TYPE').then((res) => {
      let messageTypeList = getResponse(res);
      if (messageTypeList) {
        messageTypeList = messageTypeList.map((item) => ({
          title: item.meaning,
          value: item.value,
          key: item.value,
        }));
        this.setState({ messageTypeList });
      }
    });
  }

  /**
   * 查询
   * @param {object} fields - 查询参数
   */
  @Bind()
  handleSearch(fields = {}) {
    const { dispatch } = this.props;
    const filterValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: 'processDefine/fetchProcessList',
      payload: {
        page: isEmpty(fields) ? {} : fields,
        ...filterValues,
      },
    });
  }

  /**
   * 数据新增
   */
  @Bind()
  handleAddContent() {
    this.setState({ drawerVisible: true });
  }

  /**
   * 流程删除
   * @param {obejct} record - 操作对象
   */
  @Bind()
  handleDeleteModel(record) {
    const {
      dispatch,
      tenantId,
      processDefine: { pagination },
    } = this.props;
    dispatch({
      type: 'processDefine/deleteProcess',
      payload: {
        tenantId,
        modelId: record.id,
        record,
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.handleSearch(pagination);
      }
    });
  }

  /**
   * 部署记录查看
   * @param {object} deployRecord - 流程对象
   */
  @Bind()
  handleDeployModel(deployRecord) {
    this.setState({
      deployRecord,
      deployModalVisible: true,
    });
  }

  /**
   * 流程发布校验
   * @param {object} record - 流程对象
   */
  @Bind()
  handleVerifyRelease(record) {
    const { dispatch, tenantId } = this.props;
    dispatch({
      type: 'processDefine/verifyReleaseProcess',
      payload: {
        tenantId,
        modelId: record.id,
      },
    }).then((response) => {
      const res = getResponse(response);
      if (res && (!res.ERROR || !res.ERROR.length) && (!res.WARN || !res.WARN.length)) {
        // 校验通过，直接部署
        this.handleReleaseModel(record);
      } else if (res && (res.ERROR || res.WARN)) {
        // 校验未通过，显示报错信息
        this.setState({
          verifyVisible: true,
          verifyResult: res,
          verifyRecord: record,
        });
      }
    });
  }

  // 取消部署
  @Bind()
  handleCancelVerify() {
    this.setState({
      verifyVisible: false,
      verifyResult: {},
      verifyRecord: {},
    });
  }

  /**
   * 流程发布
   * @param {object} record - 流程对象
   */
  @Bind()
  handleReleaseModel(record) {
    const {
      dispatch,
      tenantId,
      processDefine: { pagination },
    } = this.props;
    // 流程发布时关闭部署校验弹窗
    this.handleCancelVerify();
    const formDs = new DataSet({
      fields: [
        {
          name: 'deployRemark',
          maxLength: 500,
          label: intl.get('hwfp.processDefine.view.release.deployRemark').d('部署说明'),
        },
      ],
    });
    const formRecord = formDs.create();
    C7NModal.open({
      title: intl.get('hwfp.processDefine.view.release.title').d('部署说明'),
      children: (
        <Form record={formRecord} columns={1} labelLayout="float">
          <TextArea record={formRecord} name="deployRemark" />
        </Form>
      ),
      onOk: () => {
        dispatch({
          type: 'processDefine/releaseProcess',
          payload: {
            tenantId,
            modelId: record.id,
            deployRemark: formRecord.get('deployRemark'),
          },
        }).then((res) => {
          if (res) {
            notification.success();
            this.handleSearch(pagination);
          }
        });
      },
    });
  }

  /**
   * 滑窗保存操作
   * @param {object} values - 保存数据
   */
  @Bind()
  handleSaveContent(values) {
    const {
      dispatch,
      tenantId,
      processDefine: { pagination },
    } = this.props;
    dispatch({
      type: 'processDefine/createProcess',
      payload: {
        tenantId,
        process: { tenantId, ...values },
      },
    }).then((res) => {
      if (res) {
        this.setState({ drawerVisible: false });
        notification.success();
        this.handleSearch(pagination);
      }
    });
  }

  /**
   * 滑窗取消操作
   */
  @Bind()
  handleCancelOption() {
    this.setState({ drawerVisible: false });
  }

  // 关闭提醒
  @Bind()
  handleCancelRemind() {
    this.setState({ remindVisible: false });
  }

  @Bind()
  handleOkRemind(values) {
    const { dispatch } = this.props;
    const { remindQuery } = this.state;
    const tooltipList = [
      'approved',
      'rejected',
      'delegate',
      'rebut',
      'addSign',
      'approveAndAddSign',
      'recall',
      'revoke',
      'carbonCopy',
      'remind',
    ];
    if (
      values &&
      values.approverResignStrategy === 'DELEGATE_DEFAULT' &&
      !values.approverResignDefaultEmp
    ) {
      notification.warning({
        message: intl
          .get('hwfp.common.model.approverResignStrategy.delegateDefaultEmpRequired')
          .d('请选择默认审批人'),
      });
      return false;
    }
    const tls = values._tls || {};
    tooltipList.forEach((item) => {
      if (values[item]) {
        if (tls[item]) {
          tls[item][getCurrentLanguage()] = values[item];
        } else {
          tls[item] = { [getCurrentLanguage()]: values[item] };
        }
      }
    });
    dispatch({
      type: 'processDefine/createRemind',
      payload: {
        ...remindQuery,
        ...omit(values, ['_tls', '__dirty']),
        approvalActionTooltipMap: tls,
      },
    }).then((res) => {
      if (res) {
        this.setState({ remindVisible: false });
        notification.success();
      }
    });
  }

  // 打开提醒弹窗
  @Bind()
  handleReminder() {
    const { settingConfigDs } = this.props;
    // 查询提醒状态和时间
    settingConfigDs.query().then((res = {}) => {
      if (res) {
        settingConfigDs.current.set('_tls', res.approvalActionTooltipMap || {});
        settingConfigDs.current.set('todoJumpApprovedFlag', res.todoJumpApprovedFlag || 0);
        settingConfigDs.current.set(
          'rejectJumpOriginApproverFlag',
          isNil(res.rejectJumpOriginApproverFlag) ? 1 : res.rejectJumpOriginApproverFlag
        );
        settingConfigDs.current.set(
          'rejectJumpAutoApprovedFlag',
          res.rejectJumpAutoApprovedFlag || 0
        );
        settingConfigDs.current.set(
          'approverResignStrategy',
          res.approverResignStrategy || 'DELEGATE_SUSPENDED'
        );
        settingConfigDs.current.set(
          'jumpConsistencyCheckFlag',
          isNil(res.jumpConsistencyCheckFlag) ? 1 : res.jumpConsistencyCheckFlag
        );
        if (res.approvalActionTooltipMap) {
          Object.keys(res.approvalActionTooltipMap).forEach((paramKey) => {
            settingConfigDs.current.set(
              paramKey,
              res.approvalActionTooltipMap[paramKey][getCurrentLanguage() || 'zh_CN']
            );
          });
        }
        this.setState({ remindVisible: true, remindQuery: res });
      }
    });
  }

  /**
   * render
   * @returns React.element
   */
  @Bind()
  handleCheckUnique(values) {
    const { dispatch, tenantId } = this.props;
    return dispatch({
      type: 'processDefine/checkUnique',
      payload: {
        tenantId,
        values,
      },
    });
  }

  @Bind()
  handleImport() {
    this.setState({ importVisible: true });
  }

  @Bind()
  handleImportCancel() {
    this.setState({ importVisible: false });
  }

  @Bind()
  handleImportOk(params, func = (e) => e) {
    const {
      dispatch,
      processDefine: { pagination },
    } = this.props;
    dispatch({
      type: 'processDefine/importProcess',
      payload: params,
    }).then((res) => {
      if (res) {
        notification.success();
        this.handleImportCancel();
        this.handleSearch(pagination);
        func();
        this.showImportWarning(res);
      }
    });
  }

  @Bind()
  showImportWarning(res) {
    const warningList = [];
    const {
      ERROR_APPROVAL_CANDIDATE_RULE,
      ERROR_FORM,
      ERROR_SEQUENCE_CONDITION,
      ERROR_SERVICE_TASK,
    } = res;
    if (ERROR_APPROVAL_CANDIDATE_RULE && ERROR_APPROVAL_CANDIDATE_RULE.length) {
      warningList.push({
        name: intl.get('hwfp.processDefine.view.title.approveFRuleAndCopy').d('审批规则与自动抄送'),
        content: ERROR_APPROVAL_CANDIDATE_RULE,
      });
    }
    if (ERROR_FORM && ERROR_FORM.length) {
      warningList.push({
        name: intl.get('hwfp.common.model.approval.form').d('审批表单'),
        content: ERROR_FORM,
      });
    }
    if (ERROR_SEQUENCE_CONDITION && ERROR_SEQUENCE_CONDITION.length) {
      warningList.push({
        name: intl.get('hwfp.processDefine.view.title.sequenceCondition').d('跳转线'),
        content: ERROR_SEQUENCE_CONDITION,
      });
    }
    if (ERROR_SERVICE_TASK && ERROR_SERVICE_TASK.length) {
      warningList.push({
        name: intl.get('hwfp.processDefine.view.title.serviceTask').d('服务任务'),
        content: ERROR_SERVICE_TASK,
      });
    }
    if (warningList.length) {
      Modal.warning({
        width: 600,
        title: intl.get('hwfp.processDefine.message.confirm.title').d('提示'),
        content: (
          <div style={{ lineHeight: '24px' }}>
            <div>
              {intl
                .get('hwfp.processDefine.import.warning.tip1')
                .d('流程图导入完成，请检查流程图配置！')}
            </div>
            <div>
              {intl
                .get('hwfp.processDefine.import.warning.tip2')
                .d('导入文件部分服务定义不存在，以下节点服务末导入成功，请重点检查。')}
            </div>
            {warningList.map((listItem) => (
              <>
                <div>{listItem.name}:</div>
                {listItem.content.map((contentItem, index) => (
                  <div>
                    【{index + 1}】{contentItem}
                  </div>
                ))}
              </>
            ))}
          </div>
        ),
      });
    }
  }

  /**
   * 流程分类改变时查询关联单据
   * @param {*} value
   */
  @Bind()
  handleFetchDocuments(value) {
    const { dispatch } = this.props;
    dispatch({
      type: 'processDefine/fetchDocuments',
      payload: value,
    });
  }

  /**
   * 取消发布记录弹窗
   */
  @Bind()
  handleCancelRecord() {
    this.setState({
      deployModalVisible: false,
      deployRecord: {},
    });
  }

  @Bind()
  handleFetchRecord(modelKey) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'processDefine/fetchDeployHistory',
      payload: { modelKey },
    });
  }

  @Bind()
  handleCopyProcess(record) {
    this.setState({ copyVisible: true, currentCopyRecord: record });
  }

  @Bind()
  handleOpenSetting(record) {
    this.setState({ settingVisible: true, currentSettingRecord: record });
  }

  @Bind()
  handleCancleSetting() {
    this.setState({ settingVisible: false, currentSettingRecord: {} });
  }

  @Bind()
  handleCancelCopy() {
    this.setState({ copyVisible: false, currentCopyRecord: {} });
  }

  @Bind()
  handleCopyValue(data) {
    const { dispatch } = this.props;
    dispatch({
      type: 'processDefine/copyValue',
      payload: data,
    }).then((res) => {
      if (res) {
        this.handleCancelCopy();
        notification.success();
        this.handleSearch();
      }
    });
  }

  @Bind()
  handleMaintainProcess(processId = '') {
    this.props.dispatch(
      routerRedux.push({
        pathname: `/hwfp/process-define/detail/${processId}`,
      })
    );
  }

  @Bind()
  handleSaveSetting(params) {
    const { dispatch } = this.props;
    dispatch({
      type: 'processDefine/updateProcessSetting',
      params,
    }).then((res) => {
      if (res) {
        this.handleCancleSetting();
        notification.success();
        this.handleSearch();
      }
    });
  }

  /**
   * 获取导出参数
   */
  @Bind()
  getExportQueryParams() {
    const { tenantId } = this.props;
    const filterValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    const params = {
      tenantId,
      fileName: intl.get('hwfp.processDefine.model.export.defaultName').d('流程定义数据导出'),
      ...filterValues,
    };
    if (params.processDefineSource === 'PREDEFINED') {
      notification.warning({
        message: intl
          .get('hwfp.processDefine.model.export.predefined.message')
          .d('不支持预定义流程的导出'),
      });
    }
    return filterNullValueObject(params);
  }

  /**
   * 导出
   */
  exportList = ({ name = '', type }) => {
    if (type === 'allDetail') {
      this.setState({
        exportAllLoading: true,
      });
    } else {
      this.setState({
        exportCurrentLoading: true,
      });
    }
    const { processDefine: { list = [] } = {} } = this.props;
    const exportDs = list;
    let emptyFlag = false; // 当前ds是否为空
    let fileName = name; // 导出文件名
    // 查询form表单
    const queryFrom = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    emptyFlag = exportDs.length === 0;
    if (!fileName) {
      fileName = intl.get('hwfp.processDefine.model.export.defaultName').d('流程定义数据导出');
    }
    if (emptyFlag) {
      // 表格数据为0
      this.setState({
        exportLoading: false,
      });
      notification.error({
        message: intl.get('hwfp.common.view.notice.error.export').d('当前无数据可导出'),
      });
      if (type === 'allDetail') {
        this.setState({
          exportAllLoading: false,
        });
      } else {
        this.setState({
          exportCurrentLoading: false,
        });
      }
    } else {
      const param = {
        fileName,
        exportType: 'DATA',
        queryFrom,
      };
      if (type === 'currentDetail') {
        param.lastVersionFlag = 1;
      }
      // 待审批导出接口
      handleExport(param)
        .then((res) => {
          getResponse(res);
        })
        .finally(() => {
          if (type === 'allDetail') {
            this.setState({
              exportAllLoading: false,
            });
          } else {
            this.setState({
              exportCurrentLoading: false,
            });
          }
        });
      return true;
    }
  };

  render() {
    const {
      loading,
      saving,
      docLoading,
      copyLoading,
      releasing,
      verifyReleasing,
      loadingRecord,
      isSiteFlag,
      tenantId,
      importLoading = false,
      settingLoading = false,
      processDefine: { category = [], documents = [], list = [], pagination = {}, IdpValues },
      settingConfigDs,
      customizeFilterForm,
      customizeTable,
      customizeForm,
    } = this.props;
    const { remindQuery } = this.state;
    const {
      importVisible = false,
      drawerVisible = false,
      settingVisible = false,
      deployModalVisible,
      deployRecord,
      copyVisible,
      currentCopyRecord,
      currentSettingRecord,
      messageTypeList,
      remindVisible,
      exportCurrentLoading,
      exportAllLoading,
      verifyVisible,
      verifyResult,
      verifyRecord,
    } = this.state;
    const filterProps = {
      category,
      isSiteFlag,
      onSearch: this.handleSearch,
      onRef: this.handleBindRef,
      processDefineSourceTypes: IdpValues.processDefineSourceTypes || [],
      onExpandForm: this.handleExpandForm,
      customizeFilterForm,
    };
    const listProps = {
      isSiteFlag,
      category,
      pagination,
      releasing,
      verifyReleasing,
      customizeTable,
      dataSource: list,
      processing: {
        list: loading,
      },
      currentTenantId: tenantId,
      onEdit: this.handleEditModel,
      onDelete: this.handleDeleteModel,
      onDeploy: this.handleDeployModel,
      onVerifyRelease: this.handleVerifyRelease,
      onChange: this.handleSearch,
      onSettingProcess: this.handleOpenSetting,
      onCopyProcess: this.handleCopyProcess,
      onMaintainProcess: this.handleMaintainProcess,
      onRef: this.handleBindTableRef,
    };
    const drawerProps = {
      category,
      documents,
      saving,
      isSiteFlag,
      tenantId,
      messageTypeList,
      customizeForm,
      ref: this.drawerRef,
      anchor: 'right',
      title: intl.get('hwfp.processDefine.view.option.create').d('新建流程'),
      visible: drawerVisible,
      onOk: this.handleSaveContent,
      onCancel: this.handleCancelOption,
      onCheck: this.handleCheckUnique,
      onFetchDocuments: this.handleFetchDocuments,
    };

    const todoRemindProps = {
      anchor: 'right',
      title: intl.get('hzero.common.global.setting').d('全局设置'),
      visible: remindVisible,
      onOk: this.handleOkRemind,
      onCancel: this.handleCancelRemind,
      approvalActionSeqDataMap: remindQuery.approvalActionSeqDataMap || {
        Approved: 1,
        Rejected: 2,
        More: 3,
      },
      dataSet: settingConfigDs,
    };

    const importModalProps = {
      category,
      documents,
      isSiteFlag,
      tenantId,
      importVisible,
      importLoading,
      messageTypeList,
      onOk: this.handleImportOk,
      onCancel: this.handleImportCancel,
      onFetchDocuments: this.handleFetchDocuments,
      customizeForm,
    };

    const deployRecordProps = {
      title: intl.get('hwfp.common.view.message.title.deployRecord').d('发布记录'),
      loading: loadingRecord,
      visible: deployModalVisible,
      record: deployRecord,
      onCancel: this.handleCancelRecord,
      onFetchRecord: this.handleFetchRecord,
    };

    const copyValueProps = {
      category,
      documents,
      isSiteFlag,
      tenantId,
      currentCopyRecord,
      messageTypeList,
      visible: copyVisible,
      dataLoading: docLoading,
      loading: copyLoading,
      onOk: this.handleCopyValue,
      onCancel: this.handleCancelCopy,
      onFetchDocuments: this.handleFetchDocuments,
      customizeForm,
    };

    const settingProps = {
      messageTypeList,
      isSiteFlag,
      tenantId,
      visible: settingVisible,
      currentRecord: currentSettingRecord,
      dataLoading: settingLoading,
      onOk: this.handleSaveSetting,
      onCancel: this.handleCancleSetting,
      customizeForm,
    };

    const verifyProps = {
      verifyVisible,
      value: verifyResult,
      verifyRecord,
      onCancel: this.handleCancelVerify,
      onOk: this.handleReleaseModel,
    };

    const prefix = isTenantRoleLevel() ? `${HZERO_HWFP}/v1/${tenantId}` : `${HZERO_HWFP}/v1`;

    const menu = (
      <Menu>
        <Menu.Item key="basicInfo" className={styles['export-basic-btn']}>
          <ExcelExportPro
            formData={{ async: 'true' }}
            requestUrl={`${prefix}/process/models/export`}
            queryParams={this.getExportQueryParams}
            buttonText={intl.get('hwfp.common.export.basic').d('导出流程定义基础信息')}
            otherButtonProps={{
              icon: '',
              style: {
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                letterSpacing: 'normal',
                margin: 0,
              },
            }}
          />
        </Menu.Item>
        <Menu.Item key="currentDetail">
          <ExcelExport
            requestUrl={`${prefix}/process-services/service/export?exportType=COLUMN`}
            method="POST"
            handleExport={(name) => this.exportList({ name, type: 'currentDetail' })}
            otherButtonProps={{
              loading: exportCurrentLoading,
              icon: '',
              style: {
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                letterSpacing: 'normal',
                margin: 0,
              },
            }}
            buttonText={intl
              .get('hwfp.common.export.detail.current')
              .d('导出流程定义明细(当前版本)')}
          />
        </Menu.Item>
        <Menu.Item key="allDetail">
          <ExcelExport
            requestUrl={`${prefix}/process-services/service/export?exportType=COLUMN`}
            method="POST"
            handleExport={(name) => this.exportList({ name, type: 'allDetail' })}
            otherButtonProps={{
              loading: exportAllLoading,
              icon: '',
              style: {
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                letterSpacing: 'normal',
                margin: 0,
              },
            }}
            buttonText={intl.get('hwfp.common.export.detail.all').d('导出流程定义明细(所有版本)')}
          />
        </Menu.Item>
      </Menu>
    );

    return (
      <>
        <Header title={intl.get('hwfp.common.model.process.define').d('流程定义')}>
          <Button icon="plus" type="primary" onClick={this.handleAddContent}>
            {intl.get('hwfp.processDefine.button.create').d('新建')}
          </Button>
          <Button icon="to-top" onClick={this.handleImport}>
            {intl.get('hwfp.processDefine.button.import').d('导入')}
          </Button>
          <Button type="primary" onClick={this.handleReminder}>
            {intl.get('hwfp.processDefine.button.setting').d('设置')}
          </Button>
          {!isSiteFlag && (
            <>
              <Dropdown overlay={menu}>
                <ButtonC7n className={styles['export-btn']} tooltip="none">
                  <Icon type="unarchive" className={styles['export-btn-icon']} />
                  {intl.get('hwfp.processDefine.button.export').d('导出')}
                  <span className={styles['export-btn-tag']}>NEW</span>
                </ButtonC7n>
              </Dropdown>
            </>
          )}
        </Header>
        <div className={styles.content}>
          <div id="swfl-process-define-list-filter">
            <FilterForm {...filterProps} />
          </div>
          <div className={styles.list}>
            <ListTable {...listProps} />
          </div>
          <Drawer {...drawerProps} />
          <ImportModal {...importModalProps} />
          <DeployRecord {...deployRecordProps} />
          {copyVisible && <CopyValue {...copyValueProps} />}
          {settingVisible && <Setting {...settingProps} />}
          {remindVisible && <TodoRemind {...todoRemindProps} />}
          {verifyVisible && <VerifyReleaseModal {...verifyProps} />}
        </div>
      </>
    );
  }
}

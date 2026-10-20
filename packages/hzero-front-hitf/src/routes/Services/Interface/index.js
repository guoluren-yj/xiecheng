/*
 * index - 服务注册接口页面
 * @date: 2018-10-25
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Spin } from 'choerodon-ui';
import {
  Modal,
  Form,
  TextField,
  DataSet,
  Select,
  Lov,
  Switch,
  Icon,
  Output,
} from 'choerodon-ui/pro';
import { isEmpty, isUndefined, omit, keys } from 'lodash';
import { Bind } from 'lodash-decorators';
import { getCurrentOrganizationId, getResponse } from 'hzero-front/lib/utils/utils';
import notification from 'hzero-front/lib/utils/notification';
import { Button as ButtonPermission } from 'hzero-front/lib/components/Permission';
import intl from 'hzero-front/lib/utils/intl';
import {
  basicFormDS,
  retryFormDS,
  businessAssertionFormDS,
  historyDS,
} from '@/stores/Services/interfaceDS';
import getLang from '@/langs/serviceLang';
import MappingClassModal from '@/components/MappingClassModal';
import { saveInterfaces, release, offline, rollbackHistory } from '@/services/servicesService';
import {
  SERVICE_CONSTANT,
  SERVICE_CATEGORY_CONSTANT,
  SOAP11_REQUEST,
  SOAP12_REQUEST,
} from '@/constants/constants';
import QuestionPopover from '@/components/QuestionPopover';
import CollapsePanel from '@/components/CollapsePanel';
import { FieldMapping, DataMapping } from '@/components/Transform';
import AssertionCard from './AssertionCard';
import DataSourceCards from './DataSourceCards';
import FileCard from './FileCard';
import EncryptModal from '../components/EncryptModal';
import CustomAttrModal from '../components/CustomAttrModal';
import CustomLogModal from '../components/CustomLogModal';
import HttpConfigModal from '../components/HttpConfigModal';

export default class Editor extends PureComponent {
  dataSourceRef = {
    _validate: () => true,
    _toData: () => {},
    _query: () => {},
  };

  fileRef = {
    _validate: () => true,
    _toData: () => {},
  };

  assertionRef = {
    _validate: () => true,
    _toData: () => {},
  };

  businessAssertionRef = {
    _validate: () => true,
    _toData: () => {},
  };

  constructor(props) {
    super(props);
    this.state = {
      dataSource: props.dataSource || {},
      tenantId: props.tenantId,
      currentTenantId: getCurrentOrganizationId(),
      currentCode: '',
      isShowModal: false,
      tableList: [], // 表或视图数据源
      columnList: [], // 表字段
      detailLoading: false,
      isHistory: false,
      historyVersion: intl.get('hitf.services.view.message.history.version').d('历史版本'),
      isHaveHistory: false,
      autoFlag: false,
      originStatus: '',
      fileConfig: {},
      disabledFlag: false,
      packetEncrypts: [],
      assertData: [],
      businessAssertionData: [],
      customParamsData: {},
      customLogRuleData: '{}',
    };
    this.basicFormDS = new DataSet({
      ...basicFormDS({
        tenantId: props.tenantId,
        currentInterfaceType: props.currentInterfaceType,
        onFieldUpdate: this.handleFieldUpdate,
        soapVersion: props.type === SERVICE_CONSTANT.SOAP ? SOAP11_REQUEST.VERSION : undefined,
      }),
    });

    this.retryFormDS = new DataSet({
      ...retryFormDS(),
    });

    this.businessAssertionFormDS = new DataSet(businessAssertionFormDS());

    this.historyDS = new DataSet(historyDS());
  }

  async componentDidMount() {
    const {
      match: { path },
      interfaceListActionRow = {},
    } = this.props;
    const { interfaceId } = interfaceListActionRow;
    if (!isUndefined(interfaceId)) {
      this.handleFetchDetail(interfaceId);
    } else {
      this.props.modal.update({
        footer: (_okBtn, cancelBtn) => (
          <>
            {cancelBtn}
            <ButtonPermission
              permissionList={[
                {
                  code: `${path}.button.saveLine`,
                  type: 'button',
                  meaning: '服务注册-接口配置保存',
                },
              ]}
              type="c7n-pro"
              color="primary"
              onClick={this.handleOk}
            >
              {intl.get('hzero.common.button.save').d('保存')}
            </ButtonPermission>
          </>
        ),
      });
      // this.basicFormDS.current.set('status', SERVICE_CONSTANT.NEW);
      const { type } = this.props;
      if (type === SERVICE_CONSTANT.SOAP) {
        this.basicFormDS.create({
          status: SERVICE_CONSTANT.NEW,
          soapVersion: SOAP11_REQUEST.VERSION,
          requestHeader: SOAP11_REQUEST.REQUEST_HEADER,
        });
      } else {
        this.basicFormDS.create({ status: SERVICE_CONSTANT.NEW });
      }
    }
  }

  @Bind()
  handleFieldUpdate({ name, value }) {
    if (name === 'mockFlag') {
      this.setState({ mockFlag: value });
    }
    if (name === 'soapVersion') {
      if (value === SOAP11_REQUEST.VERSION) {
        this.basicFormDS.current.set('requestHeader', SOAP11_REQUEST.REQUEST_HEADER);
      } else if (value === SOAP12_REQUEST.VERSION) {
        this.basicFormDS.current.set('requestHeader', SOAP12_REQUEST.REQUEST_HEADER);
      }
    }
  }

  @Bind
  async handleInterfaceHistoryChange({ value }) {
    if (value === null) {
      return;
    }
    const { dataSource = {} } = this.state;
    const { interfaceId } = dataSource;
    this.basicFormDS.setQueryParameter('version', value);
    this.basicFormDS.setQueryParameter('history', true);
    this.basicFormDS.setQueryParameter('organizationId', this.state.currentTenantId);
    const formatVersion = 'V'.concat(value, '.0');
    this.setState({ historyVersion: formatVersion, isHistory: true });
    this.handleFetchDetail(interfaceId, true);
  }

  @Bind
  async handleRollbackHistory() {
    return rollbackHistory({
      ...this.basicFormDS.toData()[0],
    }).then((res) => {
      this.setState({
        isHistory: false,
        historyVersion: intl.get('hitf.services.view.message.history.version').d('历史版本'),
      });
      if (getResponse(res)) {
        this.handleFetchDetail(res.interfaceId);
        this.props.onFetchDetail();
        notification.success();
      }
    });
  }

  @Bind()
  handleNewest() {
    this.setState({
      isHistory: false,
      historyVersion: intl.get('hitf.services.view.message.history.version').d('历史版本'),
    });
    const { dataSource = {} } = this.state;
    const { interfaceId } = dataSource;
    this.handleFetchDetail(interfaceId);
  }

  @Bind()
  async handleFetchDetail(interfaceId, isHistory = false) {
    this.basicFormDS.setQueryParameter('interfaceId', interfaceId);
    this.setState({ detailLoading: true });
    const res = (await this.basicFormDS.query()) || {};
    this.historyDS.setQueryParameter('interfaceId', interfaceId);
    const historyRes = await this.historyDS.query();
    const {
      status,
      retryTimes,
      retryInterval,
      alertCode,
      tenantId,
      autoFlag,
      mockFlag,
      customParamsFlag,
      customParams = '[]',
      assertJson = '[]',
      businessStateAssert = '[]',
      fileConfig = {},
      packetEncrypts = [],
      customLogRule = '{}',
    } = res;
    const disabledFlag =
      status === SERVICE_CONSTANT.ENABLED || status === SERVICE_CONSTANT.DISABLED_INPROGRESS;

    this.retryFormDS.loadData([{ retryTimes, retryInterval }]);
    this.businessAssertionFormDS.loadData([{ alertCode }]);
    this.setState({
      disabledFlag,
      mockFlag,
      autoFlag,
      fileConfig,
      packetEncrypts,
      detailLoading: false,
      currentTenantId: tenantId,
      dataSource: res,
      originStatus: !isHistory ? status : '',
      isHaveHistory: !isEmpty(historyRes),
      assertData: JSON.parse(assertJson),
      businessAssertionData: JSON.parse(businessStateAssert),
      customParamsData: { customParamsFlag, customParams },
      customLogRuleData: customLogRule,
    });
    this.handleUpdateModalButton(res);
  }

  /**
   * Detail/List组件中的handleOk调用此方法
   */
  @Bind()
  async handleOk() {
    await this.validateAndSubmit(saveInterfaces);
  }

  /**
   * 通用校验提交方法
   * @param {Function} requestMethod 实际调用方法
   */
  async validateAndSubmit(requestMethod = saveInterfaces) {
    const { interfaceServerId, currentInterfaceType, onFetchDetail } = this.props;
    const { currentTenantId } = this.state;
    const validate = await this.batchValidate();
    if (!validate) {
      notification.error({
        message: getLang('SAVE_VALIDATE'),
      });
      return false;
    }
    const mappingClass = this.getCurrentCode();
    const basicData = this.basicFormDS.current.toData();
    const retryData = this.retryFormDS.length > 0 ? this.retryFormDS.current.toData() : {};
    const businessAlertData =
      this.businessAssertionFormDS.length > 0
        ? omit(this.businessAssertionFormDS.current.toData(), ['alertCodeLov'])
        : {};
    const assertionData = this.assertionRef._toData();
    const businessStateAssertData = this.businessAssertionRef._toData();
    let modelConfig = {};
    let fileConfig = {};
    if (currentInterfaceType === SERVICE_CATEGORY_CONSTANT.DS) {
      modelConfig = this.dataSourceRef._toData();
    }
    if (currentInterfaceType === SERVICE_CATEGORY_CONSTANT.FILE) {
      fileConfig = this.fileRef._toData();
    }
    const { interfaceId } = basicData;
    let submitData = {
      ...basicData,
      modelConfig,
      fileConfig,
      ...retryData,
      ...businessAlertData,
      assertJson: JSON.stringify(assertionData),
      businessStateAssert: JSON.stringify(businessStateAssertData),
    };
    if (interfaceId) {
      submitData = {
        ...submitData,
        mappingClass,
      };
    } else {
      submitData = {
        ...submitData,
        currentTenantId,
      };
    }
    const result = await requestMethod({ interfaceServerId, data: submitData }).then((res) => res);
    if (getResponse(result)) {
      if (currentInterfaceType === SERVICE_CATEGORY_CONSTANT.DS) {
        const { tenantId, modelConfig: modelConfigResult = {} } = result;
        const { modelId } = modelConfigResult;
        const dataSourceResult = await this.dataSourceRef._saveAttrAndParam({
          tenantId,
          modelId,
        });
        if (dataSourceResult) {
          this.dataSourceRef._query(result.interfaceId);
        }
      }
      this.handleFetchDetail(result.interfaceId);
      onFetchDetail();
      notification.success();
    }
  }

  async batchValidate() {
    const { currentInterfaceType } = this.props;
    const validFlag = await Promise.all([
      this.basicFormDS.validate(),
      this.assertionRef._validate(),
      this.businessAssertionRef._validate(),
      this.dataSourceRef._validate(),
      this.fileRef._validate(),
    ]);
    const basicValidateResult = validFlag[0] && validFlag[1] && validFlag[2];
    if (currentInterfaceType === SERVICE_CATEGORY_CONSTANT.DS) {
      return basicValidateResult && validFlag[3];
    }
    if (currentInterfaceType === SERVICE_CATEGORY_CONSTANT.FILE) {
      return basicValidateResult && validFlag[4];
    }
    return basicValidateResult;
  }

  /**
   * 获取映射类内容
   */
  @Bind()
  getCurrentCode() {
    const { dataSource = {}, currentCode } = this.state;
    const { mappingClass } = dataSource;
    return currentCode || mappingClass;
  }

  /**
   * 显示映射类弹窗
   */
  @Bind()
  handleOpenMappingClassModal() {
    const { onFetchMappingClass = () => {} } = this.props;
    const { currentCode, dataSource = {} } = this.state;
    const { mappingClass } = dataSource;
    let code = '';
    if (currentCode) {
      code = currentCode;
    } else if (mappingClass) {
      code = mappingClass;
    } else {
      onFetchMappingClass().then((res) => {
        if (res) {
          this.setState({
            currentCode: res.template,
            isShowModal: true,
          });
        }
      });
    }
    this.setState({
      currentCode: code,
      isShowModal: true,
    });
  }

  /**
   * 关闭映射类弹窗
   */
  @Bind()
  handleCloseMappingClassModal(value) {
    this.setState({
      isShowModal: false,
      currentCode: value,
    });
  }

  /**
   * 测试映射类
   * @param {string} value - 映射类代码
   */
  @Bind()
  handleTestMappingClass(value, cb = (e) => e) {
    const {
      onTestMappingClass = () => {},
      fetchMappingClassLoading,
      testMappingClassLoading,
      editable,
    } = this.props;
    const { dataSource = {} } = this.state;
    const { interfaceId } = dataSource;
    this.setState({
      currentCode: value,
    });
    if (fetchMappingClassLoading || testMappingClassLoading) return;
    const tempInterfaceId = editable ? interfaceId : null;
    onTestMappingClass(tempInterfaceId, value).then((res) => {
      if (res) {
        cb(res);
      }
    });
  }

  /**
   * 显示HTTP配置弹窗
   */
  @Bind()
  handleOpenHttpConfigModal() {
    const { isHistory, disabledFlag } = this.state;
    const httpConfigList = this.basicFormDS.current.get('httpConfigList');
    const modalProps = {
      readOnly: isHistory || disabledFlag,
      dataSource: httpConfigList,
      onCallBack: this.handleSetHttpConfigList,
    };
    Modal.open({
      title: (
        <QuestionPopover text={getLang('HTTP_CONN_CONFIG')} code="HITF.SERVICES.HTTP_CONN_CONFIG" />
      ),
      children: <HttpConfigModal {...modalProps} />,
    });
  }

  @Bind()
  handleSetHttpConfigList(data = []) {
    this.basicFormDS.current.set('httpConfigList', data);
  }

  /**
   * 发布/上线
   */
  @Bind()
  async handleRelease() {
    await this.validateAndSubmit(release);
  }

  /**
   * 下线
   */
  @Bind()
  handleOffline() {
    return offline({
      ...this.basicFormDS.toData()[0],
    }).then((res) => {
      if (getResponse(res)) {
        this.handleFetchDetail(res.interfaceId);
        this.props.onFetchDetail();
        notification.success();
      }
    });
  }

  /**
   * 更新滑窗按钮
   */
  handleUpdateModalButton(res) {
    const {
      match: { path },
    } = this.props;
    const disabledFlag =
      res.status === SERVICE_CONSTANT.ENABLED ||
      res.status === SERVICE_CONSTANT.DISABLED_INPROGRESS;
    this.props.modal.update({
      title: (
        <>
          {this.props.title}&nbsp;&nbsp;
          {this.state.isHaveHistory && (
            <Select
              dataSet={this.historyDS}
              value=""
              placeholder={this.state.historyVersion}
              onChange={(value) => this.handleInterfaceHistoryChange({ value })}
            >
              {this.historyDS.toData().map((hv) => {
                return <Select.Option value={hv.version}>{hv.formatVersion}</Select.Option>;
              })}
            </Select>
          )}
        </>
      ),
      footer: (_okBtn, cancelBtn) => (
        <>
          {cancelBtn}
          {this.state.isHistory && this.state.originStatus !== SERVICE_CONSTANT.ENABLED && (
            <ButtonPermission
              permissionList={[
                {
                  code: `${path}.button.revertLine`,
                  type: 'button',
                  meaning: '服务注册-接口配置版本回退',
                },
              ]}
              type="c7n-pro"
              color="primary"
              onClick={this.handleRollbackHistory}
            >
              {intl.get('hitf.services.view.message.override.version').d('版本回退')}
            </ButtonPermission>
          )}

          {this.state.isHistory && (
            <ButtonPermission
              permissionList={[
                {
                  code: `${path}.button.revertToLastestLine`,
                  type: 'button',
                  meaning: '服务注册-回到最新版本',
                },
              ]}
              type="c7n-pro"
              loading={this.state.beingRollback}
              onClick={this.handleNewest.bind(this)}
            >
              {intl.get('hitf.services.view.message.newest.version').d('最新版本')}
            </ButtonPermission>
          )}

          {res.status === SERVICE_CONSTANT.NEW && (
            <ButtonPermission
              permissionList={[
                {
                  code: `${path}.button.releaseLine`,
                  type: 'button',
                  meaning: '服务注册-接口配置发布',
                },
              ]}
              type="c7n-pro"
              onClick={this.handleRelease}
            >
              {intl.get('hzero.common.button.release').d('发布')}
            </ButtonPermission>
          )}
          {res.status === SERVICE_CONSTANT.ENABLED && !this.state.isHistory && (
            <ButtonPermission
              permissionList={[
                {
                  code: `${path}.button.offlineLine`,
                  type: 'button',
                  meaning: '服务注册-接口配置下线',
                },
              ]}
              type="c7n-pro"
              color="primary"
              onClick={this.handleOffline}
            >
              {intl.get('hitf.services.view.button.offline').d('下线')}
            </ButtonPermission>
          )}
          {res.status === SERVICE_CONSTANT.DISABLED && !this.state.isHistory && (
            <ButtonPermission
              permissionList={[
                {
                  code: `${path}.button.onlineLine`,
                  type: 'button',
                  meaning: '服务注册-接口配置上线',
                },
              ]}
              type="c7n-pro"
              onClick={this.handleRelease}
            >
              {intl.get('hitf.services.view.button.online').d('上线')}
            </ButtonPermission>
          )}
          {!this.state.isHistory && res.status !== SERVICE_CONSTANT.ENABLED && (
            <ButtonPermission
              permissionList={[
                {
                  code: `${path}.button.saveLine`,
                  type: 'button',
                  meaning: '服务注册-接口配置保存',
                },
              ]}
              type="c7n-pro"
              color="primary"
              disabled={disabledFlag || this.state.isHistory}
              onClick={this.handleOk}
            >
              {intl.get('hzero.common.button.save').d('保存')}
            </ButtonPermission>
          )}
        </>
      ),
    });
  }

  /**
   * 打开报文加密配置弹窗
   */
  @Bind()
  openEncryptModal() {
    const { packetEncrypts, disabledFlag } = this.state;
    const encryptModalProps = {
      packetEncrypts,
      readOnly: disabledFlag,
      onSetPacketEncrypts: this.handleSetPacketEncrypts,
    };
    Modal.open({
      title: getLang('ENCRYPT_CONFIG'),
      style: { width: 750 },
      children: <EncryptModal {...encryptModalProps} />,
    });
  }

  /**
   * 报文加密弹窗确认回调，设置packetEncrypts参数
   */
  @Bind()
  handleSetPacketEncrypts(data = []) {
    this.setState({ packetEncrypts: data });
    this.basicFormDS.current.set('packetEncrypts', data);
  }

  /**
   * 打开自定义属性弹窗
   */
  @Bind()
  openCustomAttrModal() {
    const { customParamsData, disabledFlag } = this.state;
    const customAttrModalProps = {
      customParamsData,
      readOnly: disabledFlag,
      onSetCustomParams: this.handleSetCustomParams,
    };
    Modal.open({
      title: <QuestionPopover text={getLang('CUSTOM_ATTR')} message={getLang('CUSTOM_ATTR_TIP')} />,
      style: { width: 800 },
      children: <CustomAttrModal {...customAttrModalProps} />,
    });
  }

  /**
   * 自定义属性弹窗确认回调，设置customParamsFlag、customParams参数
   */
  @Bind()
  handleSetCustomParams(param = {}) {
    keys(param).forEach((key) => {
      this.basicFormDS.current.set(key, param[key]);
    });
    this.setState({ customParamsData: param });
  }

  /**
   * 打开个性化日志弹窗
   */
  @Bind()
  openCustomLogModal() {
    const { customLogRuleData, disabledFlag } = this.state;
    const customLogModalProps = {
      customLogRuleData,
      readOnly: disabledFlag,
      onSetCustomLog: this.handleSetCustomLog,
    };
    Modal.open({
      title: getLang('CUSTOM_LOG'),
      style: { width: 450 },
      children: <CustomLogModal {...customLogModalProps} />,
    });
  }

  /**
   * 个性化日志弹窗确认回调，设置customLogRule参数
   */
  @Bind()
  handleSetCustomLog(data = '{}') {
    this.basicFormDS.current.set('customLogRule', data);
    this.setState({ customLogRuleData: data });
  }

  /**
   * 打开字段映射弹窗
   */
  @Bind()
  handleOpenFieldMappingModal(level) {
    const { serverCode, namespace, tenantId } = this.props;
    const readOnly =
      this.basicFormDS.current.get('status') === SERVICE_CONSTANT.ENABLED ||
      this.basicFormDS.current.get('status') === SERVICE_CONSTANT.DISABLED_INPROGRESS;
    const fieldMappingProps = {
      readOnly,
      tenantId,
      namespace,
      serverCode,
      transformLevel: level,
      sourceFunc: 'services',
      interfaceTenantId: this.basicFormDS.current.get('tenantId'),
      interfaceId: this.basicFormDS.current.get('interfaceId'),
      interfaceCode: this.basicFormDS.current.get('interfaceCode'),
      sourceRef: 'HZERO-INTERFACE',
    };
    Modal.open({
      title: getLang('MAINTAIN_FIELD_MAPPING'),
      drawer: true,
      closable: true,
      key: Modal.key(),
      style: { width: 1300 },
      children: <FieldMapping {...fieldMappingProps} />,
    });
  }

  /**
   * 打开数据映射弹窗
   */
  @Bind()
  handleOpenDataMappingModal(castHeaderIdName, level) {
    const { serverCode, namespace, type: dataType, tenantId } = this.props;
    const readOnly =
      this.basicFormDS.current.get('status') === SERVICE_CONSTANT.ENABLED ||
      this.basicFormDS.current.get('status') === SERVICE_CONSTANT.DISABLED_INPROGRESS;
    const dataMappingProps = {
      readOnly,
      tenantId,
      dataType,
      namespace,
      serverCode,
      castLevel: level,
      sourceFunc: 'services',
      interfaceId: this.basicFormDS.current.get('interfaceId'),
      interfaceCode: this.basicFormDS.current.get('interfaceCode'),
      castHeaderId: this.basicFormDS.current.get(castHeaderIdName),
      sourceRef: 'HZERO-INTERFACE',
    };
    Modal.open({
      title: getLang('MAINTAIN_DATA_MAPPING'),
      drawer: true,
      closable: true,
      key: Modal.key(),
      style: { width: 1200 },
      children: <DataMapping {...dataMappingProps} />,
    });
  }

  render() {
    const {
      type,
      match,
      currentInterfaceType,
      fetchMappingClassLoading,
      testMappingClassLoading,
      operatorList,
      assertionSubjects,
      interfaceListActionRow = {},
    } = this.props;
    const {
      isShowModal,
      currentCode,
      detailLoading,
      isHistory,
      autoFlag,
      mockFlag,
      fileConfig,
      disabledFlag,
      dataSource = {},
      assertData = [],
      businessAssertionData = [],
    } = this.state;
    const { path } = match;
    const commonProps = {
      operatorList,
      assertionSubjects,
      disabledFlag: disabledFlag || isHistory,
    };
    const assertionCardProps = {
      ...commonProps,
      key: 'assertion',
      data: assertData,
      onRef: (ref) => {
        this.assertionRef = ref;
      },
    };
    const businessAssertionCardProps = {
      ...commonProps,
      key: 'businessAssertion',
      data: businessAssertionData,
      filterOption: 'BUSINESS_STATE',
      onRef: (ref) => {
        this.businessAssertionRef = ref;
      },
    };

    const { interfaceId } = isEmpty(dataSource) ? interfaceListActionRow : dataSource;

    const dataSourceCardsProps = {
      path,
      interfaceId,
      disabledFlag,
      isHistory,
      onRef: (ref) => {
        this.dataSourceRef = ref;
      },
    };

    const fileCardProps = {
      interfaceId,
      disabledFlag,
      fileConfig,
      tenantId: this.props.tenantId,
      onRef: (ref) => {
        this.fileRef = ref;
      },
    };

    const isNew = isUndefined(interfaceId);
    const { INTERNAL, EXTERNAL, COMPOSITE, DS, FILE } = SERVICE_CATEGORY_CONSTANT;
    return (
      <Spin spinning={detailLoading}>
        <CollapsePanel
          key="mainCollapse"
          eles={[
            {
              key: 'BASIC_INFO',
              title: getLang('BASIC_INFO'),
              ele: (
                <Form
                  dataSet={this.basicFormDS}
                  columns={2}
                  labelWidth={145}
                  disabled={disabledFlag || isHistory || currentInterfaceType === COMPOSITE}
                >
                  <TextField name="interfaceCode" disabled={!isNew} />
                  <TextField name="interfaceName" />
                  {currentInterfaceType !== DS &&
                    currentInterfaceType !== COMPOSITE &&
                    currentInterfaceType !== FILE && (
                      <TextField
                        name="interfaceUrl"
                        disabled={disabledFlag || isHistory || autoFlag}
                      />
                    )}
                  {type === SERVICE_CONSTANT.SOAP && <Select name="soapVersion" />}
                  {type === SERVICE_CONSTANT.REST && currentInterfaceType !== DS && (
                    <Select name="requestMethod" disabled={disabledFlag || isHistory || autoFlag} />
                  )}
                  {(type === SERVICE_CONSTANT.REST || type === SERVICE_CONSTANT.SOAP) &&
                    currentInterfaceType !== DS && (
                      <Select
                        name="requestHeader"
                        disabled={disabledFlag || isHistory || autoFlag}
                      />
                    )}
                  {type === SERVICE_CONSTANT.SOAP && <Select name="soapRequestTemplate" />}
                  <Select name="publishType" />
                  {type === SERVICE_CONSTANT.SOAP && <TextField name="soapAction" />}
                  {type === SERVICE_CONSTANT.SOAP && <Switch name="bodyNamespaceFlag" />}
                  <Select name="status" disabled />
                  {!isNew && <TextField name="formatVersion" disabled />}
                  <TextField disabled name="publishUrl" newLine colSpan={2} />
                </Form>
              ),
            },
            {
              autoCreatePanel: false,
              hidden: currentInterfaceType !== DS,
              ele: <DataSourceCards {...dataSourceCardsProps} />,
            },
            {
              autoCreatePanel: false,
              hidden: currentInterfaceType !== FILE,
              ele: <FileCard {...fileCardProps} />,
            },
            {
              key: 'moreConfig',
              title: getLang('MORE_CONFIG'),
              defaultExpand: false,
              ele: (
                <>
                  <Form
                    dataSet={this.basicFormDS}
                    columns={2}
                    labelWidth={145}
                    disabled={disabledFlag || isHistory}
                  >
                    {currentInterfaceType !== COMPOSITE && <Lov name="timeZoneLov" />}
                    {currentInterfaceType !== COMPOSITE && <Select name="dateTimeFormat" />}
                    {currentInterfaceType !== COMPOSITE && <Switch name="asyncFlag" />}
                    {currentInterfaceType !== COMPOSITE && <Switch name="transmissionFileFlag" />}
                    {currentInterfaceType !== COMPOSITE && <Switch name="mockFlag" />}
                    {mockFlag && currentInterfaceType !== COMPOSITE && <Lov name="mockGroupLov" />}
                    {[INTERNAL, EXTERNAL, COMPOSITE].includes(currentInterfaceType) && (
                      <Output
                        name="customAttr"
                        renderer={() => (
                          <a onClick={this.openCustomAttrModal}>
                            {getLang('MAINTAIN_CUSTOM_ATTR')}
                          </a>
                        )}
                      />
                    )}
                    {![FILE, COMPOSITE].includes(currentInterfaceType) && (
                      <Output
                        name="encrypt"
                        renderer={() => (
                          <a onClick={this.openEncryptModal}>
                            {getLang('MAINTAIN_ENCRYPT_CONFIG')}
                          </a>
                        )}
                      />
                    )}
                    {currentInterfaceType !== COMPOSITE && (
                      <Output
                        name="customLog"
                        renderer={() => (
                          <a onClick={this.openCustomLogModal}>{getLang('MAINTAIN_CUSTOM_LOG')}</a>
                        )}
                      />
                    )}
                    {currentInterfaceType === EXTERNAL && (
                      <Output
                        name="httpConfig"
                        renderer={() => (
                          <a onClick={this.handleOpenHttpConfigModal}>
                            {getLang('VIEW_HTTP_CONFIG')}
                          </a>
                        )}
                      />
                    )}
                    {![COMPOSITE, DS].includes(currentInterfaceType) && (
                      <Output
                        name="mappingClass"
                        renderer={() => (
                          <a onClick={this.handleOpenMappingClassModal}>
                            {getLang('VIEW_MAPPING_CLASS')}
                          </a>
                        )}
                      />
                    )}
                    {currentInterfaceType !== COMPOSITE && (
                      <Output
                        newLine
                        name="requestTransformId"
                        renderer={() => (
                          <a
                            onClick={() => this.handleOpenFieldMappingModal('REQUEST')}
                            disabled={isNew}
                          >
                            {getLang('MAINTAIN_REQUEST_MAPPING')}
                          </a>
                        )}
                      />
                    )}
                    {currentInterfaceType !== COMPOSITE && (
                      <Output
                        name="responseTransformId"
                        renderer={() => (
                          <a
                            onClick={() => this.handleOpenFieldMappingModal('RESPONSE')}
                            disabled={isNew}
                          >
                            {getLang('MAINTAIN_RESPONSE_MAPPING')}
                          </a>
                        )}
                      />
                    )}
                    {currentInterfaceType !== COMPOSITE && (
                      <Output
                        name="requestCastId"
                        renderer={() => (
                          <a
                            disabled={isNew}
                            onClick={() =>
                              this.handleOpenDataMappingModal('requestCastId', 'REQUEST')
                            }
                          >
                            {getLang('MAINTAIN_REQUEST_DATA_MAPPING')}
                          </a>
                        )}
                      />
                    )}
                    {currentInterfaceType !== COMPOSITE && (
                      <Output
                        name="responseCastId"
                        renderer={() => (
                          <a
                            disabled={isNew}
                            onClick={() =>
                              this.handleOpenDataMappingModal('responseCastId', 'RESPONSE')
                            }
                          >
                            {getLang('MAINTAIN_RESPONSE_DATA_MAPPING')}
                          </a>
                        )}
                      />
                    )}
                    {currentInterfaceType !== COMPOSITE && (
                      <Output
                        name="errorResponseCast"
                        renderer={() => (
                          <a
                            disabled={isNew}
                            onClick={() => this.handleOpenFieldMappingModal('ERR_RESPONSE')}
                          >
                            {getLang('MAINTAIN_ERRPR_RESPONSE_MAPPING')}
                          </a>
                        )}
                      />
                    )}
                  </Form>
                  <CollapsePanel
                    key="extraCollapse"
                    eles={[
                      {
                        key: 'RETRY',
                        title: getLang('RETRY'),
                        defaultExpand: false,
                        forceRender: true,
                        hidden: currentInterfaceType === COMPOSITE,
                        ele: (
                          <Form
                            dataSet={this.retryFormDS}
                            columns={2}
                            labelWidth={130}
                            disabled={disabledFlag}
                          >
                            <TextField
                              name="retryTimes"
                              restrict="0-99"
                              addonAfter={getLang('TIMES')}
                              disabled={isHistory}
                              addonBefore={<Icon type="crop_free" />}
                            />
                            <TextField
                              name="retryInterval"
                              restrict="0-99999"
                              disabled={isHistory}
                              addonAfter={getLang('SECONDS')}
                              addonBefore={<Icon type="av_timer" />}
                            />
                          </Form>
                        ),
                      },
                      {
                        key: 'ASSERTION',
                        title: (
                          <QuestionPopover
                            text={getLang('ASSERTION')}
                            message={getLang('ASSERTION_TIP')}
                          />
                        ),
                        defaultExpand: false,
                        forceRender: true,
                        hidden: currentInterfaceType === COMPOSITE,
                        ele: <AssertionCard {...assertionCardProps} />,
                      },
                      {
                        key: 'BUSINESS_ASSERTION',
                        title: (
                          <QuestionPopover
                            text={getLang('BUSINESS_ASSERTION')}
                            message={getLang('BUSINESS_ASSERTION_TIP')}
                          />
                        ),
                        defaultExpand: false,
                        forceRender: true,
                        hidden: currentInterfaceType === COMPOSITE,
                        ele: <AssertionCard {...businessAssertionCardProps} />,
                      },
                      {
                        key: 'BUSINESS_ASSERTION_ALERT',
                        title: getLang('BUSINESS_ASSERTION_ALERT'),
                        defaultExpand: false,
                        forceRender: true,
                        hidden: currentInterfaceType === COMPOSITE,
                        ele: (
                          <Form
                            dataSet={this.businessAssertionFormDS}
                            columns={2}
                            labelWidth={130}
                            disabled={disabledFlag}
                          >
                            <Lov name="alertCodeLov" />
                          </Form>
                        ),
                      },
                    ]}
                  />
                </>
              ),
            },
          ]}
        />
        <MappingClassModal
          data={currentCode}
          loading={fetchMappingClassLoading}
          testLoading={testMappingClassLoading}
          visible={isShowModal}
          onCancel={this.handleCloseMappingClassModal}
          onTest={this.handleTestMappingClass}
          readOnly={disabledFlag}
        />
      </Spin>
    );
  }
}

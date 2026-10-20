/*
 * index - 服务注册编辑页
 * @date: 2018-10-25
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Spin } from 'hzero-ui';
import {
  DataSet,
  Form,
  Lov,
  TextField,
  Select,
  Switch,
  Password,
  Tooltip,
  Modal,
  Button,
  Cascader,
} from 'choerodon-ui/pro';
import { Input } from 'choerodon-ui';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { isEmpty, isNull, isUndefined, keys } from 'lodash';
import { Bind } from 'lodash-decorators';
import { Content, Header } from 'hzero-front/lib/components/Page';
import notification from 'hzero-front/lib/utils/notification';
import queryString from 'query-string';
import { Button as ButtonPermission } from 'hzero-front/lib/components/Permission';
import {
  createPagination,
  getCurrentOrganizationId,
  isTenantRoleLevel,
  getCurrentTenant,
  encryptPwd,
  getResponse,
} from 'hzero-front/lib/utils/utils';
import intl from 'hzero-front/lib/utils/intl';
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
import { basicFormDS, historyDS } from '@/stores/Services/detailDS';
import { lineDS, authenticationDetailDS } from '@/stores/Services/authenticationModalDS';
import { SERVICE_CONSTANT, SERVICE_CATEGORY_CONSTANT } from '@/constants/constants';
import QuestionPopover from '@/components/QuestionPopover';
import getLang from '@/langs/serviceLang';
import CollapsePanel from '@/components/CollapsePanel';
import {
  interfaceServerRelease,
  interfaceServerOffline,
  rollbackHistoryInterfaceServer,
  testOAuth2,
  getServerDomain,
} from '@/services/servicesService';
import InterfaceList from './List';
import EncryptModal from '../components/EncryptModal';
import CustomAttrModal from '../components/CustomAttrModal';
import HttpConfigModal from '../components/HttpConfigModal';

/**
 * 服务注册
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} services - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@connect(({ loading, services }) => ({
  fetchingList: loading.effects['services/queryList'],
  importLoading: loading.effects['services/importService'],
  deletingService: loading.effects['services/delete'],
  fetchingInterface: loading.effects['services/queryInterface'],
  editing: loading.effects['services/edit'],
  saveInterfacesLoading: loading.effects['services/saveInterfaces'],
  deleteLinesLoading: loading.effects['services/deleteLines'],
  saveBatchInterfacesLoading: loading.effects['services/saveBatchInterfaces'],
  fetchMappingClassLoading: loading.effects['services/queryMappingClass'],
  testMappingClassLoading: loading.effects['services/testMappingClass'],
  recognizeServiceParamLoading: loading.effects['services/recognizeServiceParam'],
  services,
  currentTenantId: getCurrentOrganizationId(),
  tenantRoleLevel: isTenantRoleLevel(),
}))
@formatterCollections({
  code: [
    'hzero.common',
    'hitf.services',
    'hitf.document',
    'hitf.maintenanceConfig',
    'hitf.common',
    'hitf.dataMapping',
    'hitf.fieldMapping',
    'hitf.mapping',
  ],
})
export default class Detail extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      formDataSource: {}, // 表单数据
      interfaceListSelectedRows: [],
      listDataSource: [], // 接口数据列表
      listPagination: createPagination({ number: 0, size: 10, totalElements: 0 }), // 接口分页信息
      currentInterfaceType: SERVICE_CATEGORY_CONSTANT.EXTERNAL,
      currentServiceType: 'REST',
      namespace: '',
      showHttpsInfo: false,
      showSoapUserInfo: false,
      showCertificate: false,
      queryInterfaceDetailLoading: false,
      showNonDSField: true,
      showModelerField: false,
      isHistory: false,
      isPublished: false,
      isOffline: false,
      isHaveHistory: false,
      isNew: false,
      beingRelease: false,
      beingOffline: false,
      beingRollback: false,
      packetEncrypts: [],
      historyVersion: intl.get('hitf.services.view.message.history.version').d('历史版本'),
      cascaderContentFlag: isTenantRoleLevel(),
      domainData: [],
      customParamsData: {},
    };
    this.basicFormDS = new DataSet(
      basicFormDS({
        domainDS: new DataSet(),
        onFieldUpdate: this.handleFieldUpdate,
      })
    );
    this.lineDS = new DataSet(lineDS());
    this.authenticationDetailDS = new DataSet(authenticationDetailDS());
    this.historyDS = new DataSet(historyDS());
    this.domainCascaderRef = React.createRef();
  }

  async componentDidMount() {
    const { dispatch, match = {}, currentTenantId, tenantRoleLevel } = this.props;
    dispatch({
      type: 'services/queryIdpValue',
    });
    this.fetchStatisticsPeriodCode();
    this.fetchExceedThresholdActionCode();
    this.fetchStatisticsLevelCode();
    this.fetchHttpConfig();
    this.fetchPublicKey();

    if (match.params.id) {
      this.fetchDetail();
    } else {
      this.initServiceCategoryOptions();
      const record = this.basicFormDS.current;
      record.set('serviceType', 'REST');
      record.set('protocol', 'http://');
      record.set('serviceCategory', SERVICE_CATEGORY_CONSTANT.EXTERNAL);
      record.set('enabledFlag', 1);
      if (tenantRoleLevel) {
        getServerDomain(currentTenantId).then((res) => {
          this.initOptions(res.content);
        });
      }
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.match.params.id !== this.props.match.params.id) {
      const {
        location: { search },
      } = this.props;
      const { autoOpenInterfaceDrawer, interfaceId } = queryString.parse(search.substring(1));
      this.fetchDetail();
      if (autoOpenInterfaceDrawer) {
        this.interfaceForm.openInterfaceDrawer({ interfaceId });
      }
    }
  }

  formCode = 'NONE';

  _modal;

  @Bind()
  handleFieldUpdate({ name, value, record }) {
    if (
      name === 'domainUrl' &&
      record.get('serviceCategory') === SERVICE_CATEGORY_CONSTANT.EXTERNAL
    ) {
      if (!isEmpty(value) && this.isUrl(value)) {
        let url = '';
        let protocol = 'http://';
        if (value.indexOf('http://') !== -1) {
          url = value.slice(7);
        } else {
          protocol = 'https://';
          url = value.slice(8);
        }
        record.set('domainUrl', url);
        record.set('protocol', protocol);
      }
    }
    if (name === 'appCodeLov') {
      record.set('sourceCodeLov', null);
    }
  }

  isUrl(url) {
    return /^https?:\/\/.+/.test(url);
  }

  /**
   * 拉取认证模式数据
   */
  async fetchLine() {
    if (this.formCode) {
      this.lineDS.setQueryParameter('formCode', this.formCode);
      await this.lineDS.query();
    }
  }

  @Bind()
  initOptions(res) {
    const {
      match: { params },
    } = this.props;
    const { id } = params;
    const domainDS = new DataSet({
      parentField: 'parentDomainId',
      idField: 'domainId',
      data: res,
    });
    this.basicFormDS.getField('serverDomain').set('options', domainDS);
    if (isUndefined(id)) {
      const { domainId } = res.find((item) => item.domainCode === 'DEFAULT') || {};
      this.basicFormDS.current.set('serverDomain', [domainId]);
      this.basicFormDS.current.set('serverDomainId', domainId);
    }
  }

  async initServiceCategoryOptions() {
    const optionData = await this.basicFormDS.getField('serviceCategory').fetchLookup();
    const optionDS = new DataSet({
      data: optionData.filter((item) => item.value !== SERVICE_CATEGORY_CONSTANT.EXTERNAL_FRONTAL),
    });
    this.basicFormDS.getField('serviceCategory').set('options', optionDS);
  }

  @Bind()
  findOrchDomainPath(orchDomainId, domainData) {
    const paths = [orchDomainId];
    const recursion = (id) => {
      domainData.forEach((item) => {
        if (item.domainId === id && item.parentDomainId) {
          paths.unshift(item.parentDomainId);
          recursion(item.parentDomainId);
        }
      });
    };
    recursion(orchDomainId);
    return paths;
  }

  async setFormCode({ value }) {
    if (isUndefined(value) || isNull(value)) {
      return;
    }
    await (this.formCode = value);
    await this.fetchLine();
    this._modal.update({
      children: <>{this.modalForm()}</>,
    });
  }

  /**
   * 动态生成认证模式包含的表单数据
   * @param {lineForm}
   */
  dynamicAddFormItem({ lineForm, isNew }) {
    if (lineForm.length < 1) {
      return;
    }
    const { isHistory, isPublished } = this.state;
    const isDisabled = isHistory || isPublished;
    return lineForm.map((line) => {
      if (line.itemTypeCode === 'TEXT') {
        return (
          <TextField
            name={line.itemCode}
            disabled={isDisabled}
            label={
              line.itemDescription && (
                <QuestionPopover text={line.itemName} message={line.itemDescription} />
              )
            }
          />
        );
      } else if (line.itemTypeCode === 'LOV') {
        return (
          <Select
            name={line.itemCode}
            disabled={isDisabled}
            label={
              line.itemDescription && (
                <QuestionPopover text={line.itemName} message={line.itemDescription} />
              )
            }
          />
        );
      } else if (isNew) {
        return (
          <Password
            name={line.itemCode}
            disabled={isDisabled}
            label={
              line.itemDescription && (
                <QuestionPopover text={line.itemName} message={line.itemDescription} />
              )
            }
          />
        );
      } else {
        return (
          <Password
            placeholder={intl.get('hitf.services.view.placeholder.unchange').d('未更改')}
            disabled={isDisabled}
            name={line.itemCode}
            label={
              line.itemDescription && (
                <QuestionPopover text={line.itemName} message={line.itemDescription} />
              )
            }
          />
        );
      }
    });
  }

  /**
   * 认证配置模态框表单
   */
  modalForm() {
    const { interfaceServerId } = this.state.formDataSource;
    const isNew = isUndefined(interfaceServerId);
    const { isHistory, isPublished } = this.state;
    const isDisabled = isHistory || isPublished;
    const lineForm = this.lineDS.toData();
    lineForm.sort((a, b) => a.orderSeq - b.orderSeq);
    lineForm.map((line) => {
      if (line.itemTypeCode === 'LOV') {
        return this.authenticationDetailDS.addField(line.itemCode, {
          name: line.itemCode,
          type: 'string',
          label: line.itemName,
          disabled: isDisabled,
          lookupCode: line.valueSet,
          defaultValue: !isUndefined(line.defaultValue) ? line.defaultValue : '',
        });
      }
      return this.authenticationDetailDS.addField(line.itemCode, {
        name: line.itemCode,
        type: 'string',
        label: line.itemName,
        disabled: isDisabled,
        required: !isNew && line.itemTypeCode === 'PASSWORD' ? false : line.requiredFlag === 1,
        defaultValue: !isUndefined(line.defaultValue) ? line.defaultValue : '',
      });
    });
    const selectName = 'formCode';
    if (!isNew && !isUndefined(this.basicFormDS.current.data.httpAuthorization)) {
      const { httpAuthorization } = this.basicFormDS.toData()[0];
      let auth = {};
      const { authJson } = httpAuthorization;
      if (!isUndefined(authJson)) {
        auth = JSON.parse(authJson);
      }
      auth[selectName] = this.formCode;
      this.authenticationDetailDS.create(auth);
    } else {
      this.authenticationDetailDS.create({ formCode: this.formCode });
    }
    const size = this.authenticationDetailDS.toData().length - 1;
    return (
      <Form dataSet={this.authenticationDetailDS} columns={2} labelWidth={145}>
        <Select
          name="formCode"
          disabled={isDisabled}
          label={intl.get('hitf.services.view.placeholder.formCode').d('认证模式')}
          onChange={(value) => this.setFormCode({ value })}
          dataSet={this.authenticationDetailDS}
          defaultValue={this.authenticationDetailDS.toData()[size].formCode}
        />
        {this.dynamicAddFormItem({ lineForm, isNew })}
      </Form>
    );
  }

  notify() {
    setTimeout(() => {}, 800);
    return true;
  }

  handleOk({ isNew }) {
    return this.checkAuthenticationParam({ isNew });
  }

  checkAuthenticationParam({ isNew }) {
    const currentDetailDS = this.authenticationDetailDS.toData()[
      this.authenticationDetailDS.toData().length - 1
    ];
    const lineForm = this.lineDS.toData();
    lineForm.sort((a, b) => a.orderSeq - b.orderSeq);
    const newAuthenticationObj = {};
    let count = 0;
    lineForm
      .filter((line) => !isUndefined(currentDetailDS[line.itemCode]))
      .forEach((line) => {
        if (!isNew && line.itemTypeCode === 'PASSWORD' && isEmpty(currentDetailDS[line.itemCode])) {
          count++;
        } else if (line.requiredFlag === 0 && isEmpty(currentDetailDS[line.itemCode])) {
          count++;
        } else if (!isEmpty(currentDetailDS[line.itemCode])) {
          newAuthenticationObj[line.itemCode] = currentDetailDS[line.itemCode];
        }
      });
    const newAuthenticationJson = JSON.stringify(newAuthenticationObj);
    if (
      lineForm.length - count === Object.keys(newAuthenticationObj).length &&
      !isEmpty(currentDetailDS.formCode)
    ) {
      if (!isNew && !isUndefined(this.basicFormDS.current.data.httpAuthorization)) {
        this.basicFormDS.current.data.httpAuthorization.authType = currentDetailDS.formCode;
        this.basicFormDS.current.data.httpAuthorization.authJson = newAuthenticationJson;
      } else {
        this.basicFormDS.current.data.httpAuthorization = {
          authType: currentDetailDS.formCode,
          authJson: newAuthenticationJson,
        };
      }
      return true;
    } else {
      notification.error({
        message: intl.get('hitf.services.view.message.validate').d('请先完善必输内容'),
      });
      return false;
    }
  }

  @Bind
  async handleInterfaceServerHistoryChange({ value }) {
    if (value === null) {
      return;
    }
    const { match = {}, currentTenantId } = this.props;
    this.basicFormDS.setQueryParameter('interfaceServerId', match.params.id);
    this.basicFormDS.setQueryParameter('version', value);
    this.basicFormDS.setQueryParameter('history', true);
    this.basicFormDS.setQueryParameter('organizationId', currentTenantId);
    const formatVersion = 'V'.concat(value, '.0');
    this.setState({
      historyVersion: formatVersion,
      isHistory: true,
      queryInterfaceDetailLoading: true,
    });
    await this.basicFormDS.query();
    this.setState({ queryInterfaceDetailLoading: false });
  }

  @Bind
  handleRelease() {
    const value = 'release';
    this.setState({ beingRelease: true });
    this.handleInterfaceServer({ value });
  }

  @Bind
  handleRollback() {
    this.setState({
      beingRollback: true,
      historyVersion: intl.get('hitf.services.view.message.history.version').d('历史版本'),
    });
    this.rollback(this.basicFormDS.toData()[0]);
  }

  @Bind
  handleNewest() {
    this.setState({ isHistory: false });
    this.setState({
      historyVersion: intl.get('hitf.services.view.message.history.version').d('历史版本'),
    });
    this.fetchDetail();
  }

  @Bind
  handleOffline() {
    this.setState({ beingOffline: true });
    this.offline(this.basicFormDS.toData()[0]);
  }

  /**
   * fetchStatisticsPeriodCode - 查询授权模式<HITF.GRANT_TYPE>code
   * @return {Array}
   */
  @Bind()
  fetchStatisticsPeriodCode() {
    const { dispatch = () => {} } = this.props;
    return dispatch({
      type: 'services/queryCode',
      payload: { lovCode: 'HITF.STATISTICS_PERIOD' },
    });
  }

  /**
   * fetchStatisticsPeriodCode - 查询授权模式<HITF.GRANT_TYPE>code
   * @return {Array}
   */
  @Bind()
  fetchExceedThresholdActionCode() {
    const { dispatch = () => {} } = this.props;
    return dispatch({
      type: 'services/queryCode',
      payload: { lovCode: 'HITF.EXCEED_THRESHOLD_ACTION' },
    });
  }

  /**
   * fetchStatisticsLevelCode - 查询授权模式<HITF.GRANT_TYPE>code
   * @return {Array}
   */
  @Bind()
  fetchStatisticsLevelCode() {
    const { dispatch = () => {} } = this.props;
    return dispatch({
      type: 'services/queryCode',
      payload: { lovCode: 'HITF.STATISTICS_LEVEL' },
    });
  }

  @Bind()
  fetchHttpConfig() {
    const { dispatch = () => {} } = this.props;
    return dispatch({
      type: 'services/queryCode',
      payload: { lovCode: 'HITF.HTTP_CONFIG_PROPERTY' },
    });
  }

  /**
   * 请求公钥
   */
  @Bind()
  fetchPublicKey() {
    const { dispatch = () => {} } = this.props;
    dispatch({
      type: 'services/getPublicKey',
    });
  }

  /**
   * 查询接口详情
   * @param {Object} params
   */
  @Bind()
  async fetchDetail(pageParams = {}) {
    let params = {};
    if (this.interfaceForm && this.interfaceForm.searchForm) {
      const {
        form: { getFieldsValue = (e) => e },
      } = this.interfaceForm.searchForm.props;
      params = getFieldsValue() || {};
    }
    const { match = {}, currentTenantId, tenantRoleLevel } = this.props;
    const { page = 0, size = 10 } = pageParams;
    this.basicFormDS.queryParameter = params;
    this.basicFormDS.setQueryParameter('interfaceServerId', match.params.id);
    this.basicFormDS.setQueryParameter('page', page);
    this.basicFormDS.setQueryParameter('size', size);
    this.setState({ queryInterfaceDetailLoading: true });
    const res = await this.basicFormDS
      .query()
      .catch(() => this.setState({ queryInterfaceDetailLoading: false }));
    this.setState({ queryInterfaceDetailLoading: false });
    this.historyDS.setQueryParameter('interfaceServerId', match.params.id);
    const historyRes = await this.historyDS.query();
    if (!isEmpty(historyRes)) {
      this.setState({ isHaveHistory: true });
    }
    this.setState({ beingRelease: false, beingOffline: false, beingRollback: false });
    if (res) {
      const {
        pageInterfaces,
        tenantId,
        customParamsFlag,
        customParams = '[]',
        packetEncrypts = [],
      } = res;
      this.setState({ cascaderContentFlag: true });
      if (res.status === 'PUBLISHED') {
        this.setState({ isPublished: true, isNew: false, isOffline: false });
      } else if (res.status === 'OFFLINE') {
        this.setState({ isPublished: false, isNew: false, isOffline: true });
      } else {
        this.setState({ isPublished: false, isNew: true, isOffline: false });
      }
      getServerDomain(tenantRoleLevel ? currentTenantId : tenantId).then(async (res1) => {
        if (getResponse(res1)) {
          const domainPath = this.findOrchDomainPath(res.serverDomainId, res1.content);
          this.basicFormDS.current.set('serverDomain', domainPath);
          this.initOptions(res1.content);
        }
      });
      this.setState({
        packetEncrypts,
        formDataSource: res,
        listDataSource: pageInterfaces.content || [],
        listPagination: createPagination(pageInterfaces),
        currentInterfaceType: res.serviceCategory || SERVICE_CATEGORY_CONSTANT.EXTERNAL,
        showCertificate: res.enabledCertificateFlag === 1,
        showSoapUserInfo:
          !isUndefined(res.soapWssPasswordType) && res.soapWssPasswordType !== 'NONE',
        showHttpsInfo: res.protocol === 'https://',
        showNonDSField: res.serviceCategory !== SERVICE_CATEGORY_CONSTANT.DS,
        showModelerField: res.serviceCategory === SERVICE_CATEGORY_CONSTANT.MODELER,
        currentServiceType: res.serviceType,
        customParamsData: { customParamsFlag, customParams },
      });
    }
  }

  @Bind()
  saveInterfaces(data, cb = () => {}) {
    const { dispatch, match = {} } = this.props;
    dispatch({
      type: 'services/saveInterfaces',
      interfaceServerId: match.params.id,
      data,
    }).then((res) => {
      if (res) {
        notification.success();
        cb(res);
        this.fetchDetail();
      }
    });
  }

  /**
   * 批量创建内部接口
   * @param {object} data - 选择的接口
   */
  @Bind()
  saveBatchInterfaces(data, cb = () => {}) {
    const { dispatch = () => {}, match = {} } = this.props;
    return dispatch({
      type: 'services/saveBatchInterfaces',
      interfaceServerId: match.params.id,
      data,
    }).then((res) => {
      if (res) {
        notification.success();
        cb();
        this.fetchDetail();
      } else {
        return false;
      }
    });
  }

  /**
   * 创建服务
   * @param {Object} params
   * @param {Function} [cb=e => e]
   */
  @Bind()
  create(params) {
    const { dispatch } = this.props;
    return dispatch({ type: 'services/create', params }).then((res) => {
      if (res) {
        notification.success();
        // this.fetchDetail(res.interfaceServerId);
        dispatch(
          routerRedux.push({
            pathname: `/hitf/services/detail/${res.interfaceServerId}`,
          })
        );
      }
    });
  }

  /**
   * 修改服务
   * @param {Object} params
   * @param {Function} [cb= e => e]
   */
  @Bind()
  edit(params) {
    const { dispatch } = this.props;
    dispatch({ type: 'services/edit', params }).then((res) => {
      if (res) {
        notification.success();
        this.fetchDetail();
      }
    });
  }

  /**
   * 发布上线服务
   * @param {Object} params
   * @param {Function} [cb= e => e]
   */
  @Bind()
  release(params) {
    return new Promise((resolve, reject) => {
      interfaceServerRelease({
        ...params,
      }).then((res) => {
        this.setState({ isHistory: false, beingRelease: false });
        if (getResponse(res)) {
          this.fetchDetail();
          notification.success();
          resolve(res);
        } else {
          reject(res);
        }
      });
    });
  }

  /**
   * 下线服务
   * @param {Object} params
   * @param {Function} [cb= e => e]
   */
  @Bind()
  offline(params) {
    return new Promise((resolve, reject) => {
      interfaceServerOffline({
        ...params,
      }).then((res) => {
        this.setState({ isHistory: false, beingOffline: false });
        if (getResponse(res)) {
          this.fetchDetail();
          notification.success();
          resolve(res);
        } else {
          reject(res);
        }
      });
    });
  }

  /**
   * 版本回退
   * @param {Object} params
   * @param {Function} [cb= e => e]
   */
  @Bind()
  rollback(params) {
    return new Promise((resolve, reject) => {
      rollbackHistoryInterfaceServer({
        ...params,
      }).then((res) => {
        this.setState({ isHistory: false, beingRollback: false });
        if (getResponse(res)) {
          this.fetchDetail();
          notification.success();
          resolve(res);
        } else {
          reject(res);
        }
      });
    });
  }

  @Bind()
  cancel() {
    const { onCancel = (e) => e } = this.props;
    const { resetFields = (e) => e } = this.editorForm;
    resetFields();
    this.setState({
      formDataSource: {},
      interfaceListSelectedRows: [],
      listDataSource: [],
      listPagination: createPagination({ number: 0, size: 10, totalElements: 0 }),
    });
    onCancel();
  }

  /**
   * 注册
   */
  @Bind()
  async handleCreate() {
    const { currentTenantId, tenantRoleLevel } = this.props;
    const { formDataSource, listDataSource, namespace } = this.state;
    const { tenantNum } = getCurrentTenant();
    const validate = await this.basicFormDS.validate();
    if (!validate) {
      notification.error({
        message: intl.get('hitf.services.view.message.validate').d('请先完善必输内容'),
      });
      return false;
    }
    const values = this.basicFormDS.current.toData();
    const tenantId = !tenantRoleLevel ? values.tenantId : currentTenantId;
    const {
      protocol,
      domainUrl,
      appCode,
      sourceCode,
      serverDomain,
      addCodeLov,
      sourceCodeLov,
      tenantLov,
      serverDomainName,
      ...rest
    } = values;
    const nextValues = rest;
    if (serverDomain) {
      const lastDomainId = serverDomain.pop();
      nextValues.serverDomainId = lastDomainId;
      nextValues.serverDomainCode = this.findDomainCodeById(lastDomainId);
    }
    if (
      [SERVICE_CATEGORY_CONSTANT.EXTERNAL, SERVICE_CATEGORY_CONSTANT.EXTERNAL_FRONTAL].includes(
        values.serviceCategory
      ) &&
      domainUrl &&
      protocol
    ) {
      nextValues.domainUrl = `${protocol}${domainUrl}`;
    } else if (values.serviceCategory === 'MODELER') {
      nextValues.domainUrl = `${appCode},${sourceCode}`;
    } else {
      nextValues.domainUrl = domainUrl;
    }
    const interfaces = listDataSource.map((item) => {
      if (item.isNew) {
        const { interfaceId, ...otherParams } = item;
        return { ...otherParams };
      } else {
        return item;
      }
    });
    const interfaceServerList = {
      authType: 'NONE',
      namespace: tenantRoleLevel ? tenantNum : namespace,
      ...formDataSource,
      ...nextValues,
      tenantId,
      interfaces,
    };
    return this.create(interfaceServerList);
  }

  @Bind()
  findDomainCodeById(id) {
    const optionData =
      this.basicFormDS.current.getField('serverDomain').getOptions().toData() || [];
    const domain = optionData.find((item) => item.domainId === id) || {};
    const { domainCode } = domain;
    return domainCode;
  }

  /**
   * 保存
   */
  @Bind()
  handleSave() {
    const value = 'save';
    this.handleInterfaceServer({ value });
  }

  @Bind()
  async handleInterfaceServer({ value }) {
    const {
      currentTenantId,
      tenantRoleLevel,
      services: { publicKey },
    } = this.props;
    const { formDataSource, listDataSource } = this.state;
    const interfaces = listDataSource.map((item) => {
      if (item.isNew) {
        const { interfaceId, ...otherParams } = item;
        return { ...otherParams };
      } else {
        return item;
      }
    });
    const validate = await this.basicFormDS.validate();
    if (validate) {
      const values = this.basicFormDS.current.toData();
      const { pageInterfaces, ...otherFormDataSource } = formDataSource;
      const tenantId = !tenantRoleLevel ? values.tenantId : currentTenantId;
      const {
        protocol,
        domainUrl,
        appCode,
        sourceCode,
        serverDomain,
        addCodeLov,
        sourceCodeLov,
        tenantLov,
        serverDomainName,
        ...rest
      } = values;
      const nextValues = rest;
      if (serverDomain) {
        const lastDomainId = serverDomain.pop();
        nextValues.serverDomainId = lastDomainId;
        nextValues.serverDomainCode = this.findDomainCodeById(lastDomainId);
      }
      if (
        [SERVICE_CATEGORY_CONSTANT.EXTERNAL, SERVICE_CATEGORY_CONSTANT.EXTERNAL_FRONTAL].includes(
          values.serviceCategory
        ) &&
        domainUrl &&
        protocol
      ) {
        nextValues.domainUrl = `${protocol}${domainUrl}`;
      } else if (values.serviceCategory === 'MODELER') {
        nextValues.domainUrl = `${appCode},${sourceCode}`;
      } else {
        nextValues.domainUrl = domainUrl;
      }
      if (values.soapPassword) {
        nextValues.soapPassword = encryptPwd(values.soapPassword, publicKey);
      }
      if (otherFormDataSource.clientSecret) {
        otherFormDataSource.clientSecret = encryptPwd(otherFormDataSource.clientSecret, publicKey);
      }
      if (otherFormDataSource.authPassword) {
        otherFormDataSource.authPassword = encryptPwd(otherFormDataSource.authPassword, publicKey);
      }
      const interfaceServerList = {
        authType: 'NONE',
        ...otherFormDataSource,
        ...nextValues,
        tenantId,
        interfaces,
      };
      if (value === 'save') {
        this.edit(interfaceServerList);
      } else {
        this.release(interfaceServerList);
      }
    } else {
      notification.error({
        message: intl.get('hitf.services.view.message.validate').d('请先完善必输内容'),
      });
    }
  }

  /**
   * 删除行
   * @param {Array} interfaceIds
   */
  @Bind()
  handleDeleteLines(interfaceIds) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'services/deleteLines',
      interfaceIds,
    }).then((res) => {
      if (res && !res.failed) {
        notification.success();
        this.fetchDetail();
      } else {
        notification.error({ description: res.message });
      }
    });
  }

  @Bind()
  onInterfaceListChange(params = {}) {
    const { current = 1, pageSize = 10 } = params;
    this.fetchDetail({ page: current - 1, size: pageSize });
  }

  @Bind()
  onInterfaceListRowSelectionChange(selectedRowKeys, selectedRows) {
    this.setState({
      interfaceListSelectedRows: selectedRows,
    });
  }

  @Bind()
  handleServiceTypeChange(value) {
    const { formDataSource = {} } = this.state;
    this.basicFormDS.current.init('soapNamespace', null);
    // this.basicFormDS.current.init('soapDataNode', null);
    this.setState({
      currentServiceType: value,
      formDataSource: { ...formDataSource, serviceType: value },
    });
  }

  /**
   * 新建的时候过滤掉组合接口选项
   */
  @Bind()
  handleServiceCategoryOptionFilter(record) {
    const { formDataSource } = this.state;
    const { interfaceServerId } = formDataSource;
    const isNew = isUndefined(interfaceServerId);
    const { COMPOSITE } = SERVICE_CATEGORY_CONSTANT;
    return isNew ? record.get('value') !== COMPOSITE : true;
  }

  @Bind()
  async openAuthenticationServiceModal() {
    const { interfaceServerId } = this.state.formDataSource;
    const { isHistory, isPublished } = this.state;
    const isDisabled = isHistory || isPublished;
    const isNew = isUndefined(interfaceServerId);
    if (!isNew && !isUndefined(this.basicFormDS.current.data.httpAuthorization)) {
      await (this.formCode = this.basicFormDS.current.data.httpAuthorization.authType || 'NONE');
    }
    await this.fetchLine();
    this._modal = Modal.open({
      key: Modal.key(),
      title: intl.get('hitf.services.view.button.authConfig').d('服务认证配置'),
      children: <>{this.modalForm()}</>,
      footer: (okBtn, cancelBtn) => (
        <div>
          {!isUndefined(this.formCode) && this.formCode.startsWith('OAUTH2', 0) && (
            <Button key="test" onClick={this.handleTestOAuth2Url}>
              {intl.get('hitf.services.view.button.test').d('测试')}
            </Button>
          )}
          {!isDisabled && okBtn}
          {cancelBtn}
        </div>
      ),
      onOk: () => this.handleOk({ isNew }),
      style: {
        width: 1000,
      },
    });
  }

  @Bind()
  handleChangeListTenant(record) {
    this.basicFormDS.current.set('serverDomain', '');
    const { listDataSource } = this.state;
    const newDataSource = listDataSource.map((item) => ({ ...item, tenantId: record.tenantId }));
    if (!isEmpty(record)) {
      getServerDomain(record.tenantId).then((res) => {
        this.initOptions(res.content);
        this.setState({ cascaderContentFlag: true });
      });
    } else {
      this.setState({ cascaderContentFlag: false });
    }
    this.setState({
      listDataSource: newDataSource,
      namespace: isEmpty(record) ? null : record.tenantNum,
    });
  }

  @Bind()
  handleChangeState(key, value) {
    this.setState({ [key]: value });
  }

  /**
   * 测试配置是否通过
   */
  @Bind()
  handleTestOAuth2Url() {
    const { interfaceServerId } = this.state.formDataSource;
    const isNew = isUndefined(interfaceServerId);
    if (this.checkAuthenticationParam({ isNew })) {
      const { httpAuthorization = {} } = this.basicFormDS.toData()[0];
      return testOAuth2(httpAuthorization).then((res) => {
        if (getResponse(res)) {
          notification.success({
            message: intl.get('hitf.services.view.message.test.success').d('测试成功'),
          });
        }
      });
    }
  }

  /**
   * 查询映射类
   */
  @Bind()
  fetchMappingClass() {
    const { dispatch } = this.props;
    return dispatch({
      type: 'services/queryMappingClass',
    });
  }

  /**
   * 测试映射类
   * @param {number} interfaceId - 接口id
   * @param {string} template - 映射类代码
   */
  @Bind()
  testMappingClass(interfaceId, template) {
    const { dispatch } = this.props;
    const payload = { template };
    if (!isNull(interfaceId)) {
      payload.interfaceId = interfaceId;
    }
    return dispatch({
      type: 'services/testMappingClass',
      payload,
    });
  }

  /**
   * 显示HTTP配置弹窗
   */
  @Bind()
  handleOpenHttpModal() {
    const { isHistory, isPublished } = this.state;
    const httpConfigList = this.basicFormDS.current.get('httpConfigList');
    const modalProps = {
      readOnly: isHistory || isPublished,
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
   * 接口参数识别
   * @param {number} interfaceId - 参数ID
   */
  @Bind()
  handleRecognizeParam(interfaceId) {
    const { dispatch } = this.props;
    const {
      formDataSource: { tenantId },
    } = this.state;
    dispatch({
      type: 'services/recognizeParam',
      payload: { interfaceId, organizationId: tenantId },
      interfaceId,
    }).then((res) => {
      if (res) {
        notification.success();
      }
    });
  }

  /**
   * 服务参数识别
   */
  @Bind()
  handleRecognizeServiceParam() {
    const { dispatch, match = {} } = this.props;
    dispatch({
      type: 'services/recognizeServiceParam',
      interfaceServerId: match.params.id,
    }).then((res) => {
      if (res) {
        notification.success();
      }
    });
  }

  /**
   * 切换服务类别
   * @param {string} value - 选中值
   */
  @Bind()
  handleChangeCategory(value) {
    const { currentServiceType } = this.state;
    if (value === SERVICE_CATEGORY_CONSTANT.INTERNAL) {
      this.basicFormDS.current.set('serviceType', 'REST');
    }
    this.basicFormDS.current.init('domainUrl', null);
    this.setState({
      currentInterfaceType: value,
      currentServiceType:
        value === SERVICE_CATEGORY_CONSTANT.INTERNAL ? 'REST' : currentServiceType,
      showNonDSField: value !== SERVICE_CATEGORY_CONSTANT.DS,
      showModelerField: value === SERVICE_CATEGORY_CONSTANT.MODELER,
    });
  }

  /**
   * 协议变化
   */
  @Bind()
  handleChangeProtocol(value) {
    if (value === 'http://') {
      this.basicFormDS.current.init('enabledCertificateFlag', 0);
    } else if (value === 'https://') {
      this.setState({ showHttpsInfo: true });
    }
  }

  /**
   * 加密类型变化
   */
  @Bind()
  handleSoapWssPasswordTypeChange(value) {
    this.setState({ showSoapUserInfo: value !== 'NONE' });
  }

  /**
   * 证书标记变化
   */
  @Bind()
  handleCertificateFlagChange(value) {
    this.setState({ showCertificate: value === 1 });
  }

  /**
   * 打开报文加密配置弹窗
   */
  @Bind()
  openEncryptModal() {
    const { packetEncrypts, isHistory, isPublished, currentInterfaceType } = this.state;
    const { COMPOSITE } = SERVICE_CATEGORY_CONSTANT;
    const encryptModalProps = {
      packetEncrypts,
      readOnly: isHistory || isPublished || currentInterfaceType === COMPOSITE,
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
    const { customParamsData, isHistory, isPublished } = this.state;
    const customAttrModalProps = {
      customParamsData,
      readOnly: isHistory || isPublished,
      onSetCustomParams: this.handleSetCustomParams,
    };
    Modal.open({
      title: <QuestionPopover text={getLang('CUSTOM_ATTR')} message={getLang('CUSTOM_ATTR_TIP')} />,
      style: { width: 750 },
      children: <CustomAttrModal {...customAttrModalProps} />,
    });
  }

  /**
   * 自定义属性弹窗确认回调，设置packetEncrypts参数
   */
  @Bind()
  handleSetCustomParams(param = {}) {
    keys(param).forEach((key) => {
      this.basicFormDS.current.set(key, param[key]);
    });
    this.setState({ customParamsData: param });
  }

  render() {
    const {
      match,
      currentTenantId,
      tenantRoleLevel,
      queryInterfacesListDetailLoading,
      services = {},
      queryMonitorLoading,
      updateMonitorLoading,
      createMonitorLoading,
      saveInterfacesLoading,
      editing,
      deleteLinesLoading = false,
      saveBatchInterfacesLoading,
      fetchMappingClassLoading = false,
      testMappingClassLoading = false,
      recognizeServiceParamLoading,
    } = this.props;
    const { enumMap = {}, formChangeFlag } = services;
    const {
      formDataSource = {},
      listDataSource = [],
      listPagination,
      interfaceListSelectedRows = {},
      currentInterfaceType,
      currentServiceType,
      showHttpsInfo,
      showSoapUserInfo,
      showCertificate,
      showNonDSField,
      queryInterfaceDetailLoading,
      isHistory,
      isPublished,
      cascaderContentFlag,
      showModelerField,
    } = this.state;
    const { path } = match;
    const {
      serviceTypes = [], // 服务类型值集、发布类型？
      interfaceStatus = [], // 接口状态
      operatorList,
      assertionSubjects,
    } = enumMap;
    const { interfaceServerId } = formDataSource;
    const isNew = isUndefined(interfaceServerId);
    const listProps = {
      isNew,
      operatorList,
      assertionSubjects,
      serviceTypes,
      interfaceStatus,
      match,
      saveBatchInterfacesLoading,
      currentInterfaceType,
      currentTenantId,
      interfaceServerId,
      showModelerField,
      processing: {
        fetchInterfaceDetail: queryInterfaceDetailLoading,
        queryInterfacesListDetailLoading,
        queryMonitorLoading,
        updateMonitorLoading,
        createMonitorLoading,
        saveInterfacesLoading,
        deleteLinesLoading,
      },
      onChangeState: this.handleChangeState,
      dataSource: listDataSource,
      pagination: listPagination,
      selectedRowKeys: interfaceListSelectedRows.map((n) => n.interfaceId),
      onChange: this.onInterfaceListChange,
      onRowSelectionChange: this.onInterfaceListRowSelectionChange,
      deleteLines: this.handleDeleteLines,
      type: formDataSource.serviceType,
      serverCode: formDataSource.serverCode,
      namespace: formDataSource.namespace,
      tenantId: formDataSource.tenantId,
      onRecognize: this.handleRecognizeParam,
      authenticationData: {
        accessTokenUrl: formDataSource.accessTokenUrl,
        authType: formDataSource.authType,
        clientId: formDataSource.clientId,
        clientSecret: formDataSource.clientSecret,
        grantType: formDataSource.grantType,
      },
      onRef: (node) => {
        this.interfaceForm = node;
      },
      saveBatchInterfaces: this.saveBatchInterfaces,
      fetchMappingClass: this.fetchMappingClass,
      testMappingClass: this.testMappingClass,
      fetchMappingClassLoading,
      testMappingClassLoading,
      onFetchDetail: this.fetchDetail,
      isHistory: this.state.isHistory,
    };
    const { INTERNAL, EXTERNAL, COMPOSITE, EXTERNAL_FRONTAL, FILE } = SERVICE_CATEGORY_CONSTANT;
    return (
      <>
        <Header
          title={
            <QuestionPopover text={getLang('DETAIL_TITLE')} message={getLang('DETAIL_TITLE_TIP')} />
          }
          backPath="/hitf/services/list"
          isChange={formChangeFlag}
        >
          {!isNew ? (
            <>
              {!isHistory && !isPublished && (
                <ButtonPermission
                  permissionList={[
                    {
                      code: `${path}.button.save`,
                      type: 'button',
                      meaning: '服务注册-保存',
                    },
                  ]}
                  icon="save"
                  type="c7n-pro"
                  color="primary"
                  disabled={queryInterfaceDetailLoading || isHistory}
                  loading={editing}
                  onClick={this.handleSave.bind(this)}
                >
                  {intl.get('hzero.common.button.save').d('保存')}
                </ButtonPermission>
              )}

              {this.state.isNew && !isHistory && (
                <ButtonPermission
                  permissionList={[
                    {
                      code: `${path}.button.release`,
                      type: 'button',
                      meaning: '服务注册-发布',
                    },
                  ]}
                  type="c7n-pro"
                  color="primary"
                  icon="publish"
                  loading={this.state.beingRelease}
                  disabled={queryInterfaceDetailLoading}
                  onClick={this.handleRelease.bind(this)}
                >
                  {intl.get('hzero.common.button.release').d('发布')}
                </ButtonPermission>
              )}
              {this.state.isOffline && !isHistory && (
                <ButtonPermission
                  permissionList={[
                    {
                      code: `${path}.button.online`,
                      type: 'button',
                      meaning: '服务注册-上线',
                    },
                  ]}
                  type="c7n-pro"
                  icon="arrow_upward"
                  color="primary"
                  loading={this.state.beingRelease}
                  disabled={queryInterfaceDetailLoading}
                  onClick={this.handleRelease.bind(this)}
                >
                  {intl.get('hitf.services.view.button.online').d('上线')}
                </ButtonPermission>
              )}

              {isPublished && !isHistory && (
                <ButtonPermission
                  permissionList={[
                    {
                      code: `${path}.button.offline`,
                      type: 'button',
                      meaning: '服务注册-下线',
                    },
                  ]}
                  type="c7n-pro"
                  icon="arrow_downward"
                  color="primary"
                  loading={this.state.beingOffline}
                  disabled={queryInterfaceDetailLoading}
                  onClick={this.handleOffline.bind(this)}
                >
                  {intl.get('hitf.services.view.button.offline').d('下线')}
                </ButtonPermission>
              )}

              {isHistory && (
                <ButtonPermission
                  permissionList={[
                    {
                      code: `${path}.button.revert`,
                      type: 'button',
                      meaning: '服务注册-版本回退',
                    },
                  ]}
                  type="c7n-pro"
                  icon="arrow_back"
                  color="primary"
                  loading={this.state.beingRollback}
                  disabled={queryInterfaceDetailLoading}
                  onClick={this.handleRollback.bind(this)}
                >
                  {intl.get('hitf.services.view.message.override.version').d('版本回退')}
                </ButtonPermission>
              )}

              {isHistory && (
                <ButtonPermission
                  permissionList={[
                    {
                      code: `${path}.button.revertToLastest`,
                      type: 'button',
                      meaning: '服务注册-回到最新版本',
                    },
                  ]}
                  type="c7n-pro"
                  color="primary"
                  icon="arrow_forward"
                  disabled={queryInterfaceDetailLoading}
                  onClick={this.handleNewest.bind(this)}
                >
                  {intl.get('hitf.services.view.message.newest.version').d('最新版本')}
                </ButtonPermission>
              )}

              {showNonDSField && !(isHistory || isPublished) && currentInterfaceType !== COMPOSITE && (
                <Tooltip
                  title={intl
                    .get('hitf.services.view.message.tip.recognize')
                    .d(
                      'REST拉取swagger参数，REST解析请求参数，路径参数，请求体，响应体等；SOAP解析wsdl，SOAP解析请求体和响应体。若有请求体和响应体时默认解析为raw类型，若选择其余类型如application/json则按照application/json解析'
                    )}
                  placement="top"
                >
                  <ButtonPermission
                    permissionList={[
                      {
                        code: `${path}.button.parameterIdentifier`,
                        type: 'button',
                        meaning: '服务注册-参数识别',
                      },
                    ]}
                    type="c7n-pro"
                    icon="scanner"
                    disabled={queryInterfaceDetailLoading}
                    loading={recognizeServiceParamLoading}
                    onClick={this.handleRecognizeServiceParam}
                  >
                    {intl.get('hitf.services.view.button.recognize').d('参数识别')}
                  </ButtonPermission>
                </Tooltip>
              )}
              {![COMPOSITE, FILE].includes(currentInterfaceType) && (
                <ButtonPermission
                  type="c7n-pro"
                  icon="enhanced_encryption"
                  disabled={queryInterfaceDetailLoading}
                  onClick={this.openEncryptModal}
                >
                  {getLang('ENCRYPT_CONFIG')}
                </ButtonPermission>
              )}
              {[INTERNAL, EXTERNAL, COMPOSITE].includes(currentInterfaceType) && (
                <ButtonPermission
                  type="c7n-pro"
                  icon="custom_Directory"
                  disabled={queryInterfaceDetailLoading}
                  onClick={this.openCustomAttrModal}
                >
                  {getLang('CUSTOM_ATTR')}
                </ButtonPermission>
              )}
              {currentInterfaceType === EXTERNAL && (
                <ButtonPermission
                  permissionList={[
                    {
                      code: `${path}.button.authConfig`,
                      type: 'button',
                      meaning: '服务注册-服务认证配置',
                    },
                  ]}
                  type="c7n-pro"
                  icon="settings_applications-o"
                  disabled={queryInterfaceDetailLoading}
                  onClick={this.openAuthenticationServiceModal}
                >
                  {intl.get('hitf.services.view.button.authConfig').d('服务认证配置')}
                </ButtonPermission>
              )}
              {currentInterfaceType === EXTERNAL && (
                <ButtonPermission
                  permissionList={[
                    {
                      code: `${path}.button.httpConnectConfig`,
                      type: 'button',
                      meaning: '服务注册-HTTP连接配置',
                    },
                  ]}
                  type="c7n-pro"
                  icon="attachment"
                  disabled={queryInterfaceDetailLoading}
                  onClick={this.handleOpenHttpModal}
                >
                  {intl.get('hitf.services.view.button.httpConnectConfig').d('HTTP连接配置')}
                </ButtonPermission>
              )}
            </>
          ) : (
            <ButtonPermission
              permissionList={[
                {
                  code: `${path}.button.register`,
                  type: 'button',
                  meaning: '服务注册-注册',
                },
              ]}
              icon="save-o"
              type="c7n-pro"
              color="primary"
              disabled={queryInterfaceDetailLoading}
              onClick={this.handleCreate}
            >
              {intl.get('hitf.services.view.button.create').d('注册')}
            </ButtonPermission>
          )}
          {this.state.isHaveHistory && (
            <Select
              dataSet={this.historyDS}
              // value={this.state.historyVersion}
              value=""
              placeholder={this.state.historyVersion}
              disabled={queryInterfaceDetailLoading}
              onChange={(value) => this.handleInterfaceServerHistoryChange({ value })}
            >
              {this.historyDS.toData().map((hv) => {
                return <Select.Option value={hv.version}>{hv.formatVersion}</Select.Option>;
              })}
            </Select>
          )}
        </Header>
        <Content>
          <Spin spinning={queryInterfaceDetailLoading || false}>
            <CollapsePanel
              eles={[
                {
                  key: 'baseInfo',
                  title: getLang('BASIC_INFO'),
                  ele: (
                    <Form
                      dataSet={this.basicFormDS}
                      columns={3}
                      labelWidth={125}
                      disabled={isHistory || isPublished || currentInterfaceType === COMPOSITE}
                    >
                      {!tenantRoleLevel && (
                        <Lov
                          name="tenantLov"
                          onChange={this.handleChangeListTenant}
                          disabled={!isNew}
                        />
                      )}
                      <TextField name="serverCode" disabled={!isNew} />
                      <TextField name="serverName" />
                      {!isNew && <TextField name="namespace" disabled />}
                      <Select
                        name="serviceType"
                        onChange={this.handleServiceTypeChange}
                        disabled={currentInterfaceType === INTERNAL || isHistory || isPublished}
                      />
                      <Select
                        name="serviceCategory"
                        onChange={this.handleChangeCategory}
                        optionsFilter={this.handleServiceCategoryOptionFilter}
                        disabled={!isNew}
                      />
                      {showModelerField && <Lov name="appCodeLov" />}
                      {showModelerField && <Lov name="sourceCodeLov" />}
                      {showNonDSField && currentInterfaceType === INTERNAL && (
                        <Lov name="addressLov" disabled={!isNew} />
                      )}
                      {showNonDSField &&
                        [EXTERNAL, EXTERNAL_FRONTAL].includes(currentInterfaceType) && (
                          <Input.Group
                            newLine={isTenantRoleLevel() ? !isNew : isNew}
                            compact
                            name="protocolGroup"
                            colSpan={2}
                          >
                            <Select
                              name="protocol"
                              style={{ width: '20%' }}
                              onChange={this.handleChangeProtocol}
                            />
                            <TextField name="domainUrl" style={{ width: '80%' }} />
                          </Input.Group>
                        )}
                      <Switch name="publicFlag" disabled={!isNew} />
                      {showNonDSField &&
                        [EXTERNAL, EXTERNAL_FRONTAL].includes(currentInterfaceType) &&
                        showHttpsInfo && (
                          <Switch
                            name="enabledCertificateFlag"
                            onChange={this.handleCertificateFlagChange}
                            disabled={isPublished}
                          />
                        )}
                      {showNonDSField &&
                        [EXTERNAL, EXTERNAL_FRONTAL].includes(currentInterfaceType) &&
                        showHttpsInfo &&
                        showCertificate && <Lov name="certificateLov" />}
                      <Switch name="enabledFlag" />
                      {showNonDSField && currentServiceType === SERVICE_CONSTANT.SOAP && (
                        <TextField name="soapNamespace" />
                      )}
                      {showNonDSField && currentServiceType === SERVICE_CONSTANT.SOAP && (
                        <TextField name="soapElementPrefix" />
                      )}
                      {showNonDSField && currentServiceType === SERVICE_CONSTANT.SOAP && (
                        <Select
                          name="soapWssPasswordType"
                          onChange={this.handleSoapWssPasswordTypeChange}
                        />
                      )}
                      {showNonDSField &&
                        currentServiceType === SERVICE_CONSTANT.SOAP &&
                        showSoapUserInfo && <TextField name="soapUsername" />}
                      {showNonDSField &&
                        currentServiceType === SERVICE_CONSTANT.SOAP &&
                        showSoapUserInfo && <Password name="soapPassword" />}
                      {currentServiceType === SERVICE_CONSTANT.SOAP && (
                        <TextField name="soapDataNode" />
                      )}
                      {!isNew && !this.state.isNew && <TextField name="formatVersion" disabled />}
                      {!isNew && <Select name="status" disabled />}
                      <Cascader
                        changeOnSelect
                        name="serverDomain"
                        disabled={isHistory || isPublished || !cascaderContentFlag}
                      />
                    </Form>
                  ),
                },
                {
                  title: getLang('MORE_CONFIG'),
                  key: 'moreConfig',
                  defaultExpand: false,
                  hidden: currentInterfaceType === COMPOSITE,
                  ele: (
                    <Form
                      dataSet={this.basicFormDS}
                      columns={3}
                      labelWidth={125}
                      disabled={isHistory || isPublished}
                    >
                      {[INTERNAL, EXTERNAL].includes(currentInterfaceType) &&
                        currentServiceType === SERVICE_CONSTANT.REST && (
                          <TextField name="swaggerUrl" />
                        )}
                      <TextField name="requestContentType" />
                      <TextField name="responseContentType" />
                      <Switch name="invokeVerifySignFlag" />
                    </Form>
                  ),
                },
                {
                  title: getLang('DETAIL_INTERFACES'),
                  key: 'detailInterfaces',
                  ele: <InterfaceList {...listProps} />,
                },
              ]}
            />
          </Spin>
        </Content>
      </>
    );
  }
}

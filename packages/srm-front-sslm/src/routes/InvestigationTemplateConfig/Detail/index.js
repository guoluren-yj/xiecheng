/*
 * Detail - 调查表模板配置-详情
 * @date: 2020/10/26 15:12:06
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { DataSet, Spin, Modal } from 'choerodon-ui/pro';
import { Collapse } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import { routerRedux } from 'dva/router';
import qs from 'querystring';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import { HZERO_FILE } from 'utils/config';
import formatterCollections from 'utils/intl/formatterCollections';
import { Content, Header } from 'components/Page';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';
import notification from 'utils/notification';
import { PRIVATE_BUCKET } from '_utils/config';
import { downloadFileByAxios } from 'services/api';

import {
  saveTemptDetail,
  releaseTemptDetail,
  exportTempDetail,
} from '@/services/investigationDefinitionOrgService';
import TempatePreview from '@/routes/components/Investigation';
import AssignCompany from '@/routes/components/AssignCompany';
import { saveApplicableFunction, handleUnlock } from '@/services/orgInvestigateTemplateService';

import HeaderBtns from './HeaderBtns';
import { templateHeaderDS, getReferencSiteTempDS, getReferencOrgTempDS } from './stores/indexDS';
import TemplateHeader from '../components/TemplateHeader';
import TemplateTabs from '../components/TemplateTabs';
import ReferenceTemplate from '../components/ReferenceTemplate';

import { getTitle, getBackPath } from '../utils/utils';

import styles from '../index.less';

const { Panel } = Collapse;
const tenantId = getCurrentOrganizationId();

/**
 * 调查表模板配置-详情
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} investigationTemDefineOrg - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @return React.element
 */
@formatterCollections({
  code: [
    'sslm.common',
    'sslm.investDefOrg',
    'sslm.investTempConfig',
    'spfm.investigationDefinition',
    'sslm.supplierModelDefine',
    'sslm.referTemp',
  ],
})
@WithCustomize({
  unitCode: [
    'SSLM.INVESTIGATION_TEMP_CONFIG.DETAIL.HEADER_INFO',
    'SSLM.INVESTIGATION_TEMP_CONFIG.DETAIL.REF_SITE_LIST',
    'SSLM.INVESTIGATION_TEMP_CONFIG.DETAIL.REF_ORG_LIST',
  ],
})
export default class Detail extends Component {
  constructor(props) {
    super(props);
    const {
      match: {
        params: { newInvestigateTemplateId, oldInvestigateTemplateId, type },
      },
      location,
    } = props;
    const queryParams = qs.parse(location.search.substr(1));
    const { jumpSource, showHistoryBtn, sourceNewTemplateId, sourceOldTemplateId } = queryParams;
    const isEdit = type === 'edit';
    const historyVersionFlag = jumpSource === 'historyVersion';
    this.state = {
      newInvestigateTemplateId,
      oldInvestigateTemplateId,
      queryHeaderLoading: false,
      queryLineLoading: false,
      operationLoading: false,
      exportLoading: false,
      isEdit,
      historyVersionFlag,
      headerInfo: {},
      showHistoryBtn: showHistoryBtn === '1',
      sourceNewTemplateId,
      sourceOldTemplateId,
    };
    this.templateHeaderDs = new DataSet(templateHeaderDS());
    this.templateHeaderDs.setState('isEdit', isEdit);
  }

  componentDidMount() {
    this.handleQueryHeader();
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { match: { params } = {} } = nextProps;
    const { type, newInvestigateTemplateId, oldInvestigateTemplateId } = params || {};
    const newIsEdit = type === 'edit';
    const queryParams = qs.parse(nextProps.location.search.substr(1));
    const { jumpSource, showHistoryBtn } = queryParams;
    const historyVersionFlag = jumpSource === 'historyVersion';
    const showHistoryBtnFlag = showHistoryBtn === '1';
    const {
      isEdit,
      newInvestigateTemplateId: preNewInvestigateTemplateId,
      oldInvestigateTemplateId: preOldInvestigateTemplateId,
      historyVersionFlag: preHistoryVersionFlag,
      showHistoryBtn: preShowHistoryBtn,
    } = prevState;
    const newState = {};
    // 查看页变成编辑页
    if (newIsEdit !== isEdit) {
      newState.isEdit = newIsEdit;
    }
    // 历史版本切换
    if (newInvestigateTemplateId !== preNewInvestigateTemplateId) {
      newState.newInvestigateTemplateId = newInvestigateTemplateId;
    }
    if (oldInvestigateTemplateId !== preOldInvestigateTemplateId) {
      newState.oldInvestigateTemplateId = oldInvestigateTemplateId;
    }
    if (historyVersionFlag !== preHistoryVersionFlag) {
      newState.historyVersionFlag = historyVersionFlag;
    }
    if (showHistoryBtnFlag !== preShowHistoryBtn) {
      newState.showHistoryBtn = showHistoryBtn;
    }
    if (!isEmpty(newState)) {
      return newState;
    }
    return null;
  }

  getSnapshotBeforeUpdate(preProps) {
    const { match: { params: preParams } = {} } = preProps;
    const {
      newInvestigateTemplateId: preNewInvestigateTemplateId,
      oldInvestigateTemplateId: preOldInvestigateTemplateId,
    } = preParams || {};
    const { match: { params } = {} } = this.props;
    const { newInvestigateTemplateId, oldInvestigateTemplateId } = params || {};
    const changeFlag =
      preNewInvestigateTemplateId !== newInvestigateTemplateId ||
      preOldInvestigateTemplateId !== oldInvestigateTemplateId;
    return changeFlag;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (snapshot) {
      this.handleRefresh();
    }
  }

  @Bind()
  handleQueryHeader() {
    const { oldInvestigateTemplateId } = this.state;
    this.templateHeaderDs.setQueryParameter('investigateTemplateId', oldInvestigateTemplateId);
    let headerInfo = {};
    this.setState({
      queryHeaderLoading: true,
    });
    return this.templateHeaderDs
      .query()
      .then(res => {
        headerInfo = res;
      })
      .finally(() => {
        this.setState({
          headerInfo,
          queryHeaderLoading: false,
        });
      });
  }

  @Bind()
  handleUpdateLoading(flag = false) {
    this.setState({
      queryLineLoading: flag,
    });
  }

  @Bind()
  handleRefresh() {
    return Promise.all([
      this.handleQueryHeader(),
      this.tempTabsRef && this.tempTabsRef.handleTemplateConfig(),
    ]);
  }

  /**
   * 引用模板
   */
  @Bind()
  handleAllocateReference() {
    const { customizeTable } = this.props;
    const { newInvestigateTemplateId, oldInvestigateTemplateId } = this.state;
    const siteTempDs = new DataSet(getReferencSiteTempDS());
    const orgTempDs = new DataSet(getReferencOrgTempDS());
    orgTempDs.setQueryParameter('investigateTemplateId', newInvestigateTemplateId);
    Modal.open({
      title: intl.get(`sslm.referTemp.view.message.title.referenceModal`).d('引用模板'),
      drawer: true,
      children: (
        <ReferenceTemplate
          siteTempDs={siteTempDs}
          orgTempDs={orgTempDs}
          customizeTable={customizeTable}
          onRef={ref => {
            this.referenceTempRef = ref;
          }}
          newInvestigateTemplateId={newInvestigateTemplateId}
          oldInvestigateTemplateId={oldInvestigateTemplateId}
          handleRefresh={this.handleRefresh}
        />
      ),
      style: { width: 1090 },
      onOk: () => {
        // 保存选择行 todo
        if (this.referenceTempRef) {
          return this.referenceTempRef.handleClickOk();
        }
      },
    });
  }

  /**
   * 模板预览
   */
  @Bind()
  handlePreview() {
    const { oldInvestigateTemplateId } = this.state;
    Modal.open({
      title: intl.get(`spfm.investigationDefinition.view.message.title.modal`).d('模板明细'),
      drawer: true,
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
      children: (
        <TempatePreview
          investigateTemplateId={oldInvestigateTemplateId}
          previewFlag
          showTabBar={false}
          isModalFlag
        />
      ),
      bodyStyle: {
        paddingLeft: 0,
        paddingTop: 0,
        paddingBottom: 0,
      },
      style: { width: 1090 },
      onOk: () => {},
    });
  }

  /**
   * 保存
   */
  @Bind()
  async handleSave() {
    return new Promise(async resolve => {
      if (this.tempTabsRef) {
        // 校验头
        const validateFlag = await this.templateHeaderDs.current.validate();
        if (validateFlag) {
          const headerData = this.templateHeaderDs.current.toJSONData();
          // 附件模板定义
          const attachmentTempData = (this.tempTabsRef.attachmentRef || {}).attachmentTemplateDs
            ? this.tempTabsRef.attachmentRef.attachmentTemplateDs.toJSONData()
            : [];
          this.tempTabsRef.handleSaveParams().then(data => {
            if (data) {
              const payload = {
                investigateTemplate: headerData,
                investigateConfigHeaderList: data,
                investigateConfigAttTempls: attachmentTempData,
                customizeUnitCode: 'SSLM.INVESTIGATION_TEMP_CONFIG.DETAIL.HEADER_INFO',
              };
              this.setState({
                operationLoading: true,
              });
              saveTemptDetail(payload)
                .then(async res => {
                  if (getResponse(res)) {
                    notification.success();
                    await this.handleRefresh();
                    resolve(true);
                  } else {
                    resolve(false);
                  }
                })
                .finally(() => {
                  this.setState({
                    operationLoading: false,
                  });
                });
            } else {
              resolve(false);
            }
          });
        } else {
          resolve(false);
        }
      } else {
        resolve(false);
      }
    });
  }

  /**
   * 发布
   */
  @Bind()
  async handleRelease() {
    const { dispatch } = this.props;
    const { newInvestigateTemplateId } = this.state;
    return new Promise(async resolve => {
      if (this.tempTabsRef) {
        // 校验头
        const validateFlag = await this.templateHeaderDs.current.validate();
        if (validateFlag) {
          const headerData = this.templateHeaderDs.current.toJSONData();
          // 附件模板定义
          const attachmentTempData = (this.tempTabsRef.attachmentRef || {}).attachmentTemplateDs
            ? this.tempTabsRef.attachmentRef.attachmentTemplateDs.toJSONData()
            : [];
          this.tempTabsRef.handleSaveParams().then(data => {
            if (data) {
              const payload = {
                investigateTemplate: headerData,
                investigateConfigHeaderList: data,
                investigateConfigAttTempls: attachmentTempData,
                investigateTemplateId: newInvestigateTemplateId,
                customizeUnitCode: 'SSLM.INVESTIGATION_TEMP_CONFIG.DETAIL.HEADER_INFO',
              };
              this.setState({
                operationLoading: true,
              });
              return releaseTemptDetail(payload)
                .then(res => {
                  if (getResponse(res)) {
                    notification.success();
                    resolve(true);
                    dispatch(
                      routerRedux.push({
                        pathname: `/sslm/investigation-template-config/list`,
                      })
                    );
                  } else {
                    resolve(false);
                  }
                })
                .finally(() => {
                  this.setState({
                    operationLoading: false,
                  });
                });
            } else {
              resolve(false);
            }
          });
        } else {
          resolve(false);
        }
      } else {
        resolve(false);
      }
    });
  }

  // 导出
  @Bind()
  handleExport() {
    this.setState({ exportLoading: true });
    const { newInvestigateTemplateId } = this.state;
    exportTempDetail({ investigateTemplateId: newInvestigateTemplateId })
      .then(response => {
        const res = getResponse(response);
        if (res) {
          const api = `${HZERO_FILE}/v1/${tenantId}/files/download`;
          const queryParams = [
            { name: 'url', value: res },
            { name: 'bucketName', value: `${PRIVATE_BUCKET}` },
          ];
          downloadFileByAxios({ requestUrl: api, queryParams });
        }
      })
      .finally(() => {
        this.setState({
          exportLoading: false,
        });
      });
  }

  /**
   * 处理跳转
   */
  @Bind()
  handleEdit() {
    const { newInvestigateTemplateId, oldInvestigateTemplateId } = this.state;
    // 未发布的模版直接跳转进入详情页
    if (newInvestigateTemplateId === oldInvestigateTemplateId) {
      this.handleGoToEdit(newInvestigateTemplateId);
    } else {
      // 已发布的先解锁
      this.setState({
        queryHeaderLoading: true,
      });
      handleUnlock({ investigateTemplateId: newInvestigateTemplateId })
        .then(res => {
          if (getResponse(res)) {
            const { investigateTemplateId } = res;
            this.handleGoToEdit(investigateTemplateId);
          }
        })
        .finally(() => {
          this.setState({
            queryHeaderLoading: false,
          });
        });
    }
  }

  /**
   * 跳转编辑页
   */
  @Bind()
  handleGoToEdit(investigateTemplateId) {
    const { dispatch } = this.props;
    // 跳转
    dispatch(
      routerRedux.push({
        pathname: `/sslm/investigation-template-config/detail/${investigateTemplateId}/${investigateTemplateId}/edit`,
      })
    );
    // 设置编辑状态
    this.templateHeaderDs.setState('isEdit', true);
  }

  @Bind()
  handleAllocateCompany() {
    const { headerInfo, oldInvestigateTemplateId } = this.state;
    Modal.open({
      drawer: true,
      closable: false,
      destroyOnClose: true,
      style: { width: 742 },
      title: intl.get(`sslm.investTempConfig.view.button.allocateCompany`).d('分配公司'),
      children: (
        <AssignCompany
          record={headerInfo}
          onRef={node => {
            this.allocateCompanyRef = node;
          }}
        />
      ),
      onOk: () => {
        const assignMenuScope =
          this.allocateCompanyRef &&
          this.allocateCompanyRef.current &&
          this.allocateCompanyRef.current.get('assignMenuScope');
        const payload = {
          investigateTemplateId: oldInvestigateTemplateId,
          assignMenuScope: assignMenuScope && assignMenuScope.join(),
        };
        saveApplicableFunction(payload).then(async response => {
          const res = getResponse(response);
          if (res) {
            this.handleRefresh();
          }
        });
      },
    });
  }

  // 获取头按钮
  @Bind()
  getHeaderBtns() {
    const { dispatch } = this.props;
    const {
      isEdit,
      exportLoading,
      queryHeaderLoading,
      queryLineLoading,
      operationLoading,
      headerInfo,
      showHistoryBtn,
      historyVersionFlag,
      sourceNewTemplateId,
      sourceOldTemplateId,
    } = this.state;
    const allLoading = queryHeaderLoading || queryLineLoading || operationLoading || exportLoading;
    return (
      <HeaderBtns
        dispatch={dispatch}
        headerDs={this.templateHeaderDs}
        isEdit={isEdit}
        loading={allLoading}
        headerInfo={headerInfo}
        showHistoryBtn={showHistoryBtn}
        historyVersionFlag={historyVersionFlag}
        sourceNewTemplateId={sourceNewTemplateId}
        sourceOldTemplateId={sourceOldTemplateId}
        handleRelease={this.handleRelease}
        handleSave={this.handleSave}
        handlePreview={this.handlePreview}
        handleAllocateReference={this.handleAllocateReference}
        handleAllocateCompany={this.handleAllocateCompany}
        handleEdit={this.handleEdit}
        handleExport={this.handleExport}
      />
    );
  }

  render() {
    const {
      oldInvestigateTemplateId,
      newInvestigateTemplateId,
      exportLoading,
      queryHeaderLoading,
      queryLineLoading,
      operationLoading,
      isEdit,
      historyVersionFlag,
      sourceNewTemplateId,
      sourceOldTemplateId,
    } = this.state;
    const { customizeForm } = this.props;
    const allLoading = queryHeaderLoading || queryLineLoading || operationLoading || exportLoading;
    return (
      <React.Fragment>
        <Header
          title={getTitle({ isEdit, historyVersionFlag, dataSet: this.templateHeaderDs })}
          backPath={getBackPath({ historyVersionFlag, sourceNewTemplateId, sourceOldTemplateId })}
        >
          {this.getHeaderBtns()}
        </Header>
        <Content className={styles['template-config-detail']}>
          <Spin spinning={allLoading}>
            <Collapse
              bordered={false}
              defaultActiveKey={['templateHeader']}
              expandIconPosition="text-right"
              trigger="text-icon"
            >
              <Panel
                header={intl.get('sslm.investTempConfig.view.title.investTempInfo').d('模板信息')}
                key="templateHeader"
                forceRender
              >
                <TemplateHeader
                  dataSet={this.templateHeaderDs}
                  isEdit={isEdit}
                  customizeForm={customizeForm}
                />
              </Panel>
            </Collapse>
            <Content className={styles['template-config-line']}>
              <div className={styles['template-config-line-title']}>
                {intl.get('sslm.investTempConfig.view.title.investTempDetailInfo').d('详细信息')}
              </div>
              <TemplateTabs
                oldInvestigateTemplateId={oldInvestigateTemplateId}
                newInvestigateTemplateId={newInvestigateTemplateId}
                onUpdateLoading={this.handleUpdateLoading}
                handleRefresh={this.handleRefresh}
                onRef={ref => {
                  this.tempTabsRef = ref;
                }}
                editFlag={isEdit}
                templateHeaderDs={this.templateHeaderDs}
              />
            </Content>
          </Spin>
        </Content>
      </React.Fragment>
    );
  }
}

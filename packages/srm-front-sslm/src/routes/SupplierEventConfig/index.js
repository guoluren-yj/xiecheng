/*
 * SupplierEventConfig - 供应商事件配置
 * @date: 2020/10/27 15:12:06
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import {
  DataSet,
  Button,
  Modal,
  Table,
  notification,
  Form,
  Row,
  Col,
  Select,
  Lov,
  TextField,
  CheckBox,
  Tabs,
  RichText,
  Spin,
} from 'choerodon-ui/pro';
import { Bind, Debounce } from 'lodash-decorators';
import { isEmpty } from 'lodash';
import moment from 'moment';

import intl from 'utils/intl';
import withProps from 'utils/withProps';
import formatterCollections from 'utils/intl/formatterCollections';
import { Content, Header } from 'components/Page';
import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { getResponse, filterNullValueObject } from 'utils/utils';
import { Button as PermissionButton } from 'components/Permission';
import SearchBarTable from '_components/SearchBarTable';

import { tableMaxHeight, tableHeight } from '@/routes/components/utils';
import {
  batchImportAgain,
  handleReloadQuery,
  fetchInterfaceData,
} from '@/services/supplierEventService';
import EventDimensionModal from './EventDimensionModal';
import ConditionalRuleModal from './ConditionalRuleModal';
import OperationRecords from './components/OperationRecords';
import HeaderBtn from './components/HeaderBtn';
import { EventConfigDS, InterfaceQueryDS } from './stores';

const { RichTextViewer } = RichText;

/**
 * 供应商事件配置
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
  code: ['sslm.supplierEventConfig', 'spfm.importErp', 'entity.supplier', 'sslm.common'],
})
@WithCustomize({
  unitCode: [
    'SPFM.PARTNER_LIST_INTERFACE_QUERY.LIST',
    'SSLM.SUPPLIER_EVENT_CONFIG_LIST.TABPANE',
    'SSLM.SUPPLIER_EVENT_CONFIG_LIST.BTN',
    'SSLM.SUPPLIER_EVENT_INTERFACE_QUERY.BTN',
  ],
})
@withProps(
  () => {
    const eventConfigDS = new DataSet({
      ...EventConfigDS(),
    });
    const interfaceQueryDS = new DataSet({
      ...InterfaceQueryDS(),
    });
    return {
      eventConfigDS,
      interfaceQueryDS,
    };
  },
  { cacheState: true }
)
export default class SupplierEventConfig extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeKey: 'eventConfig',
      interfaceLoading: false,
      fetchInterfaceLoading: false,
    };
  }

  // 事件数据分配弹窗
  eventDimensionModal;

  @Bind()
  getColumns() {
    const columns = [
      {
        name: 'cfCategory',
        width: 180,
      },
      {
        name: 'cfCodeLov',
        width: 250,
      },
      {
        name: 'cfCodeMeaning',
        width: 150,
      },
      {
        name: 'assign',
        width: 100,
        renderer: ({ record }) => {
          if (record.get('exportCfId') && record.get('enableFlag')) {
            return (
              <PermissionButton
                type="text"
                onClick={() => this.openEventDimension(record.toData())}
                permissionList={[
                  {
                    code: `srm.bg.business-rule.supplierexport.ps.change.button`,
                    type: 'button',
                    meaning: '供应商事件配置-分配',
                  },
                ]}
              >
                {intl.get(`sslm.supplierEventConfig.model.supplierEventConfig.assign`).d('分配')}
              </PermissionButton>
            );
          } else {
            return (
              <a style={{ color: 'rgba(0,0,0,0.25)' }}>
                {intl.get(`sslm.supplierEventConfig.model.supplierEventConfig.assign`).d('分配')}
              </a>
            );
          }
        },
      },
      {
        name: 'restriction',
        width: 120,
        renderer: ({ record }) => {
          if (record.get('exportCfId') && record.get('enableFlag')) {
            return (
              <PermissionButton
                type="text"
                onClick={() => this.openConditionalRule(record)}
                permissionList={[
                  {
                    code: `srm.bg.business-rule.supplierexport.ps.change.button`,
                    type: 'button',
                    meaning: '供应商事件配置-编辑',
                  },
                ]}
              >
                {intl.get(`sslm.supplierEventConfig.model.supplierEventConfig.maintain`).d('编辑')}
              </PermissionButton>
            );
          } else {
            return (
              <a style={{ color: 'rgba(0,0,0,0.25)' }}>
                {intl.get(`sslm.supplierEventConfig.model.supplierEventConfig.maintain`).d('编辑')}
              </a>
            );
          }
        },
      },
      {
        name: 'enableFlag',
        width: 120,
      },
      {
        name: 'syncErpFlag',
        width: 120,
      },
      {
        name: 'writeErpFlag',
        width: 150,
      },
      {
        name: 'documentLevelFlag',
        width: 140,
      },
      {
        name: 'syncFlag',
        width: 120,
      },
      {
        name: 'targetSystem',
        width: 120,
      },
      {
        name: 'operate',
        width: 180,
        renderer: ({ record }) => {
          return (
            <span className="action-link">
              <PermissionButton
                type="text"
                onClick={() => this.handleOpenModal(false, record)}
                permissionList={[
                  {
                    code: `srm.bg.business-rule.supplierexport.ps.change.button`,
                    type: 'button',
                    meaning: '供应商事件配置-编辑',
                  },
                ]}
              >
                {intl.get(`hzero.common.button.edit`).d('编辑')}
              </PermissionButton>
              <a onClick={() => this.operationRecordsModal(record)}>
                {intl.get('hzero.common.button.operation').d('操作记录')}
              </a>
            </span>
          );
        },
      },
    ];
    return columns;
  }

  @Bind()
  getInterfaceColumns() {
    const columns = [
      {
        name: 'syncStatusMeaning',
        width: 100,
      },
      {
        name: 'syncMsg',
        width: 150,
      },
      {
        name: 'sourceDocumentNo',
        width: 140,
      },
      {
        name: 'supplierCompanyNum',
        width: 150,
      },
      {
        name: 'supplierCompanyName',
        width: 200,
      },
      {
        name: 'supplierNum',
        width: 150,
      },
      {
        name: 'supplierName',
        width: 200,
      },
      {
        name: 'cfCodeMeaning',
        width: 100,
      },
      {
        name: 'cfCategoryMeaning',
        width: 150,
      },
      {
        name: 'syncDate',
        width: 140,
      },
      {
        name: 'creationDate',
        width: 140,
      },
      {
        name: 'syncFlagMeaning',
        width: 150,
      },
      {
        name: 'targetSystemMeaning',
        width: 150,
      },
      {
        name: 'syncBody',
        width: 150,
        renderer: ({ record }) => {
          return (
            <span className="action-link">
              <a onClick={() => this.handleViewMessage(record)}>
                {intl.get(`hzero.common.button.view`).d('查看')}
              </a>
            </span>
          );
        },
      },
    ];
    return columns;
  }

  /**
   * 分配事件配置Modal
   */
  @Debounce(200)
  @Bind()
  openEventDimension(currentRecord) {
    const { eventConfigDS } = this.props;
    const { exportCfId } = currentRecord;
    const addFormProps = {
      exportCfId,
      dataSet: eventConfigDS,
      onRef: ref => {
        this.eventDimensionModal = ref;
      },
    };

    Modal.open({
      title: intl.get('sslm.supplierEventConfig.view.title.eventDimension').d('事件数据分配'),
      drawer: true,
      okText: intl.get('hzero.common.button.sure').d('确定'),
      cancelText: intl.get('hzero.common.button.cancel').d('取消'),
      closable: true,
      children: <EventDimensionModal {...addFormProps} />,
      onOk: () => {
        return this.eventDimensionModal.handleSave();
      },
    });
  }

  /**
   * 条件规则配置Modal
   */
  @Debounce(200)
  @Bind()
  openConditionalRule(record) {
    const { eventConfigDS } = this.props;
    const { exportCfId, tactics, tacticsCustomize } = record.toData();
    record.set('tactics', tactics || 'TRUE');
    record.set('tacticsCustomize', tacticsCustomize || 'TRUE');
    const modalProps = {
      exportCfId,
      dataSet: eventConfigDS,
      currentRecord: record,
      onRef: ref => {
        this.conditionalRuleModal = ref;
      },
    };
    Modal.open({
      title: intl.get('sslm.supplierEventConfig.view.title.conditionalRule').d('条件规则配置'),
      drawer: true,
      okText: intl.get('hzero.common.button.sure').d('确定'),
      cancelText: intl.get('hzero.common.button.cancel').d('取消'),
      closable: true,
      style: { width: 750 },
      children: <ConditionalRuleModal {...modalProps} />,
      onOk: () => {
        return this.conditionalRuleModal.handleSave();
      },
      afterClose: () => {
        eventConfigDS.query();
      },
    });
  }

  /**
   * 新增/更新
   */
  @Bind()
  handleOpenModal(isCreate = false, currentRow = undefined) {
    const { eventConfigDS } = this.props;
    if (isCreate) {
      eventConfigDS.create({}, 0);
    }
    const currentRecord = currentRow || eventConfigDS.current;
    Modal.open({
      key: Modal.key(),
      closable: true,
      movable: false,
      destroyOnClose: true,
      drawer: true,
      style: { width: 480 },
      title: intl
        .get(`sslm.supplierEventConfig.view.title.eventConfigDefine`)
        .d('供应商事件配置维护'),
      children: (
        <Form record={currentRecord} labelLayout="float">
          <Select name="cfCategory" />
          <Lov name="cfCodeLov" />
          <TextField name="cfCodeMeaning" />
          <CheckBox name="enableFlag" />
          <CheckBox name="syncErpFlag" />
          <CheckBox name="writeErpFlag" />
          <CheckBox name="documentLevelFlag" />
          <CheckBox name="syncFlag" />
          <Select name="targetSystem" />
        </Form>
      ),
      onOk: async () => {
        if (eventConfigDS.dirty) {
          const validateFlag = await currentRecord.validate();
          let modalCloseFlag = false;
          if (validateFlag) {
            const res = await eventConfigDS.submit();
            if (res && res.success) {
              modalCloseFlag = true;
              eventConfigDS.query();
            }
            return modalCloseFlag;
          } else {
            notification.warning({
              placement: 'bottomRight',
              message: intl
                .get('sslm.supplierEventConfig.view.message.requiredMessage')
                .d('必填字段未填写！'),
            });
            return false;
          }
        } else {
          notification.warning({
            placement: 'bottomRight',
            message: intl
              .get('sslm.supplierEventConfig.view.message.noNeedSaveData')
              .d('暂无需要保存的数据！'),
          });
          return false;
        }
      },
      onCancel: () => {
        if (isCreate) {
          eventConfigDS.remove(currentRecord);
        } else {
          // 如果为已保存的数据，取消时则重置为以前数据
          currentRecord.reset();
        }
      },
    });
  }

  /**
   * 操作记录
   */
  operationRecordsModal(record = {}) {
    const recordData = record.toData();
    Modal.open({
      key: Modal.key(),
      title: intl.get('hzero.common.button.operating').d('操作记录'),
      closable: true,
      cancelButton: false,
      okButton: true,
      destroyOnClose: true,
      drawer: true,
      okText: intl.get('hzero.common.button.close').d('关闭'),
      style: { width: 742 },
      children: <OperationRecords recordData={recordData} />,
    });
  }

  /**
   * 重写renderBar，渲染查询组件
   * @param {object} barProps
   * @returns {JSX.Element}
   */
  @Bind()
  renderBar({ queryFields, queryFieldsLimit, dataSet, queryDataSet }) {
    if (queryDataSet) {
      return (
        <Row>
          <Col span={20}>
            <Form labelWidth={125} columns={queryFieldsLimit} dataSet={queryDataSet}>
              {queryFields}
            </Form>
          </Col>
          <Col span={4} style={{ marginTop: '0.1rem', textAlign: 'center' }}>
            <Button onClick={() => queryDataSet.current.reset()}>
              {intl.get('hzero.common.button.reset').d('重置')}
            </Button>
            <Button color="primary" onClick={() => dataSet.query()}>
              {intl.get('hzero.common.button.query').d('查询')}
            </Button>
          </Col>
        </Row>
      );
    }
  }

  /**
   * tab切换的回调
   */
  @Bind()
  handleTabChange(key, hiddenList = {}) {
    let activeKey = key;
    const { firstRenderHiddenKeys = [] } = hiddenList || {};
    // 处理个性化隐藏
    if (!isEmpty(firstRenderHiddenKeys)) {
      const tabKeys = ['eventConfig', 'interfaceQuery'];
      const visableTabKey = tabKeys.filter(item => !firstRenderHiddenKeys.includes(item));
      if (!isEmpty(visableTabKey)) {
        // eslint-disable-next-line prefer-destructuring
        activeKey = visableTabKey[0];
      } else {
        activeKey = '';
      }
    }
    // if(!key){
    //   const { custConfig = {} } = this.props;
    //   // 个性化tab配置，用于隐藏头按钮
    //   const tabConfig = custConfig['SSLM.SUPPLIER_EVENT_CONFIG_LIST.TABPANE'] || {};
    //   const { fields = [] } = tabConfig || {};
    //   // 过滤配置隐藏的tab
    //   const hiddenTab = (fields || []).find((item) => item.visible === 0);
    //   // 有隐藏重新设置激活的tab
    //   if(hiddenTab){
    //     // 过滤没有配置隐藏的tab，设置激活
    //     const visableTab = (fields || []).find((item) => item.visible !== 0);
    //     const {fieldCode = '' } = visableTab || {};
    //     activeKey = fieldCode;
    //     console.log(visableTab);
    //   }
    // }
    this.setState({
      activeKey,
    });
  }

  /**
   * 批量重新导入
   */
  @Bind()
  handleImportAgain() {
    const { interfaceQueryDS } = this.props;
    const selectedData = interfaceQueryDS.toJSONData();
    if (selectedData && selectedData.length) {
      this.setState({
        interfaceLoading: true,
      });
      const selectedDatakeys = selectedData.map(item => item.exportResultId);
      batchImportAgain(selectedDatakeys)
        .then(respose => {
          const res = getResponse(respose);
          if (res) {
            interfaceQueryDS.unSelectAll();
            interfaceQueryDS.clearCachedSelected();
            interfaceQueryDS.query();
            notification.success({
              placement: 'bottomRight',
              message: intl.get('hzero.common.notification.success').d('操作成功'),
            });
          }
        })
        .finally(() => {
          this.setState({
            interfaceLoading: false,
          });
        });
    } else {
      notification.warning({
        placement: 'bottomRight',
        message: intl.get('hzero.common.notification.warning').d('请先勾选一条数据'),
      });
    }
  }

  /**
   * 重新查询
   */
  @Bind()
  handleReloadQuery() {
    const { interfaceQueryDS } = this.props;
    const selectedData = interfaceQueryDS.toJSONData();
    if (selectedData && selectedData.length) {
      this.setState({
        interfaceLoading: true,
      });
      const selectedDatakeys = selectedData.map(item => item.exportResultId);
      handleReloadQuery(selectedDatakeys)
        .then(respose => {
          const res = getResponse(respose);
          if (res) {
            interfaceQueryDS.unSelectAll();
            interfaceQueryDS.clearCachedSelected();
            interfaceQueryDS.query();
            notification.success({
              placement: 'bottomRight',
              message: intl.get('hzero.common.notification.success').d('操作成功'),
            });
          }
        })
        .finally(() => {
          this.setState({
            interfaceLoading: false,
          });
        });
    } else {
      notification.warning({
        placement: 'bottomRight',
        message: intl.get('hzero.common.notification.warning').d('请先勾选一条数据'),
      });
    }
  }

  /**
   * 查看接口报文
   */
  @Debounce(200)
  @Bind()
  handleViewMessage(record) {
    const exportResultId = record.get('exportResultId');
    this.setState({
      fetchInterfaceLoading: true,
    });
    fetchInterfaceData({
      exportResultId,
    })
      .then(res => {
        if (getResponse(res)) {
          const data = JSON.stringify(res);
          Modal.open({
            title: intl.get(`spfm.importErp.model.importErp.interfaceMessage`).d('接口报文'),
            key: Modal.key(),
            closable: true,
            footer: null,
            fullScreen: true,
            children: (
              <RichTextViewer
                style={{
                  width: '100%',
                  overflow: 'scroll',
                  padding: '0.12rem 0.15rem',
                  wordBreak: 'break-word',
                }}
                deltaOps={
                  data
                    ? [
                        {
                          insert: data,
                        },
                      ]
                    : []
                }
              />
            ),
          });
        }
      })
      .finally(() => {
        this.setState({
          fetchInterfaceLoading: false,
        });
      });
  }

  /**
   * 获取form数据
   */
  @Bind()
  handleParams() {
    const { interfaceQueryDS } = this.props;
    const selectedData = interfaceQueryDS.toJSONData();
    const exportResultIds = selectedData ? selectedData.map(item => item.exportResultId) : [];
    const queryDs = interfaceQueryDS.queryDataSet.current;
    const queryData = queryDs ? queryDs.toJSONData() : {};
    const params = {
      ...queryData,
      exportResultIds,
    };
    return filterNullValueObject(params);
  }

  @Bind()
  getExportParams() {
    const { eventConfigDS } = this.props;
    const queryDs = eventConfigDS.queryDataSet.current;
    const queryData = queryDs ? queryDs.toJSONData() : {};
    const params = {
      ...queryData,
    };
    return filterNullValueObject(params);
  }

  render() {
    const {
      eventConfigDS,
      customizeTable = () => {},
      interfaceQueryDS,
      customizeTabPane = () => {},
      customizeBtnGroup = () => {},
    } = this.props;
    const { activeKey = 'eventConfig', interfaceLoading, fetchInterfaceLoading } = this.state;

    return (
      <React.Fragment>
        <Header
          title={intl
            .get(`sslm.supplierEventConfig.view.title.supplierEventConfig`)
            .d('供应商事件配置')}
        >
          <HeaderBtn
            activeKey={activeKey}
            customizeBtnGroup={customizeBtnGroup}
            eventConfigDS={eventConfigDS}
            handleOpenModal={this.handleOpenModal}
            getEventConfigExportParams={this.getExportParams}
            interfaceLoading={interfaceLoading}
            handleImportAgain={this.handleImportAgain}
            handleReloadQuery={this.handleReloadQuery}
            getInterfaceQueryExportParams={this.handleParams}
          />
        </Header>
        <Content>
          {customizeTabPane(
            {
              code: 'SSLM.SUPPLIER_EVENT_CONFIG_LIST.TABPANE',
              custDefaultActive: (key, hiddenList) => {
                // 获取个性化配置的默认激活key，没配置的值为undefined
                this.handleTabChange(key, hiddenList);
              },
            },
            <Tabs activeKey={activeKey} animated={false} onChange={this.handleTabChange}>
              <Tabs.TabPane
                tab={intl
                  .get(`sslm.supplierEventConfig.view.title.supplierEventConfig`)
                  .d('供应商事件配置')}
                key="eventConfig"
              >
                <Table
                  dataSet={eventConfigDS}
                  columns={this.getColumns()}
                  queryFieldsLimit={3}
                  queryBar={this.renderBar}
                />
              </Tabs.TabPane>
              <Tabs.TabPane
                tab={intl.get('spfm.importErp.view.tab.interfaceQuery').d('接口查询')}
                key="interfaceQuery"
              >
                <Spin spinning={fetchInterfaceLoading}>
                  <div style={{ height: tableHeight.hasTab }}>
                    {customizeTable(
                      {
                        code: 'SPFM.PARTNER_LIST_INTERFACE_QUERY.LIST',
                      },
                      <SearchBarTable
                        cacheState
                        dataSet={interfaceQueryDS}
                        columns={this.getInterfaceColumns()}
                        searchCode="SSLM.SUPPLIER_EVENT_INTERFACE_QUERY.SEARCH_BAR"
                        style={{ maxHeight: tableMaxHeight.hasTab }}
                        searchBarConfig={{
                          fieldProps: {
                            syncDateFrom: {
                              max: 'syncDateTo',
                              defaultValue: moment().subtract(3, 'months'),
                            },
                            syncDateTo: {
                              min: 'syncDateFrom',
                              // defaultValue: moment(),
                            },
                          },
                        }}
                      />
                    )}
                  </div>
                </Spin>
              </Tabs.TabPane>
            </Tabs>
          )}
        </Content>
      </React.Fragment>
    );
  }
}

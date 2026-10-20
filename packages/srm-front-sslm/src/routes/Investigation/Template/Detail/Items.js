/**
 * Tabs - 预览的 tabs
 * @date Mon Aug 13 2018
 * @author WY yang.wang06@hand-china.com
 * @copyright Copyright(c) 2018 Hand
 */

import React from 'react';
import { connect } from 'dva';
import { Tabs, Form, Spin, Icon, Tooltip } from 'hzero-ui';
import { map, cloneDeep, findIndex } from 'lodash';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { getCurrentOrganizationId } from 'utils/utils';

// import { getTooltipShow } from '@/routes/components/utils';
import Attachment from './Attachment';
import Product from '../Detail/spfm/Product';
import ContactAddress from '../Detail/spfm/ContactAddress';
import Reserved from '../Detail/spfm/Reserved';
import EditNameModal from './EditNameModal';
import styles from './index.less';

/**
 * 平台级模板明细定义Tab
 * @extends {Component} - PureComponent
 * @reactProps {Object} investigationDefinitionOrg - 数据源
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@connect(({ investigationDefinitionOrg, loading }) => ({
  loading,
  saving:
    loading.effects['investigationDefinitionOrg/saveDefinition'] ||
    loading.effects['investigationDefinitionOrg/updateHeader'] ||
    loading.effects['investigationDefinitionOrg/queryTemplateConfig'],
  investigationDefinitionOrg,
  organizationId: getCurrentOrganizationId(),
}))
@Form.create({ fieldNameProp: null })
export default class InvestigationTab extends React.PureComponent {
  state = {
    activeKey: 'sslmInvestgBasic',
    editNameVisible: false,
    currentConfig: {},
    editConfigNameList: [
      'sslmInvestgFinBranch', // 分支机构
      'sslmInvestgCustomer', // 主要客户情况
      'sslmInvestgSubSupplier', // 分供方情况
      'sslmInvestgEquipment', // 设备信息
      'sslmInvestgRd', // 研发能力
      'sslmInvestgProduce', // 生产能力
      'sslmInvestgQa', // 质保能力
      'sslmInvestgCustservice', // 售后服务
      'sslmInvestgReserve1', // 预留表格页签1
      'sslmInvestgReserve2', // 预留表格页签2
      'sslmInvestgReserve5', // 预留表格页签3
      'sslmInvestgReserve6', // 预留表格页签4
      'sslmInvestgReserve7', // 预留表格页签5
      'sslmInvestgReserve8', // 预留表格页签6
      'sslmInvestgReserve9', // 预留表格页签7
      'sslmInvestgReserve3', // 预留表单页签1
      'sslmInvestgReserve4', // 预留表单页签2
      'sslmInvestgReserve10', // 预留表单页签3
      'sslmInvestgReserve11', // 预留表单页签4
      'sslmInvestgReserve12', // 预留表单页签5
      'sslmInvestgReserve13', // 预留表单页签6
      'sslmInvestgReserve14', // 预留表单页签7
    ],
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    const { config } = nextProps;
    const nextState = {};

    if (config !== prevState.config) {
      const configHeader = {};
      map(config, h => {
        configHeader[h.configName] = h;
      });
      nextState.configHeader = configHeader;
      nextState.config = config;
    }
    return nextState;
  }

  /**
   * 存储 Tab的key
   */
  handleKeyChange = activeKey => {
    this.setState({ activeKey });
  };

  /**
   *移除对象中的某个属性
   *
   * @param {*} obj 传入的对象
   * @param {*} paramsArr 对象里的key
   * @returns
   * @memberof ProducerConfig
   */
  @Bind()
  handleRemoveProps(obj, paramsArr) {
    const newItem = { ...obj };
    paramsArr.forEach(item => {
      if (newItem[item]) {
        delete newItem[item];
      }
    });
    return newItem;
  }

  /**
   * 改变是否调查当前页签
   */
  @Bind()
  onHandleSwitchChange(flagList) {
    const { dispatch, organizationId, updateInvestigateTemplateId, config } = this.props;
    dispatch({
      type: 'investigationDefinitionOrg/updateHeader',
      payload: { flagList, organizationId, updateInvestigateTemplateId },
    }).then(res => {
      if (res && res[0]) {
        notification.success();
        const {
          investgCfHeaderId,
          objectVersionNumber,
          atLeastOneFlag,
          gridFlag,
          investigateFlag,
          contactRequiredCount,
          customerRequiredCount,
          requiredCount,
        } = res[0];
        const newConfig = config.map(o =>
          o.investgCfHeaderId === investgCfHeaderId
            ? {
                ...o,
                objectVersionNumber,
                atLeastOneFlag,
                gridFlag,
                investigateFlag,
                contactRequiredCount,
                customerRequiredCount,
                requiredCount,
              }
            : o
        );
        dispatch({
          type: 'investigationDefinitionOrg/updateState',
          payload: { config: newConfig },
        });
      }
    });
  }

  /**
   * 批量保存行数据
   * @param formData 表单数据
   * @param configName tab的name
   * @memberof InvestigationTab
   */
  @Bind()
  onHandleSave(newSaveDataList = []) {
    const { dispatch, organizationId, updateInvestigateTemplateId, config } = this.props;
    const payloadData = newSaveDataList;
    dispatch({
      type: 'investigationDefinitionOrg/saveDefinition',
      payload: { payloadData, organizationId, updateInvestigateTemplateId },
    }).then(res => {
      if (res) {
        const {
          investigateConfigLines = [],
          investgCfHeaderId,
          remark,
          objectVersionNumber,
          investigateFlag,
          atLeastOneFlag,
          contactRequiredCount,
          customerRequiredCount,
          requiredCount,
          attWirteMethod,
        } = res;
        // 修改的table在config中的位置
        const newConfig = cloneDeep(config);
        const fIndex = findIndex(newConfig, { investgCfHeaderId });
        const configTable = newConfig[fIndex];
        const { lines = [], ...other } = configTable;
        // 存储修改值在lines的 Index
        let indexObj = {};
        for (let i = 0; i < investigateConfigLines.length; i++) {
          indexObj = {
            ...indexObj,
            [findIndex(lines, { investgCfLineId: investigateConfigLines[i].investgCfLineId })]: i,
          };
        }
        // 修改后的 lines
        const updateData = lines.map((item, index) => {
          if (Object.keys(indexObj).includes(`${index}`)) {
            const { componentTypeMeaning, _status, $form } = item;
            return {
              ...item,
              ...investigateConfigLines[indexObj[index]],
              componentTypeMeaning,
              _status,
              $form,
            };
          } else {
            return item;
          }
        });
        newConfig[fIndex] = {
          ...other,
          remark,
          attWirteMethod,
          objectVersionNumber,
          investigateFlag,
          atLeastOneFlag,
          contactRequiredCount,
          customerRequiredCount,
          requiredCount,
          lines: updateData,
        };
        dispatch({
          type: 'investigationDefinitionOrg/updateState',
          payload: { config: newConfig },
        });
        notification.success();
      }
    });
  }

  // 附件模板定义方法
  @Bind()
  updateState(attr, data) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'investigationDefinitionOrg/updateState',
      payload: {
        [attr]: data,
      },
    });
  }

  // 查询调查表模板
  @Bind()
  queryTemplateConfig() {
    const { dispatch, investigateTemplateId, organizationId } = this.props;
    dispatch({
      type: 'investigationDefinitionOrg/queryTemplateConfig',
      payload: { investigateTemplateId, organizationId },
    }).then(res => {
      if (res) {
        const configHeader = {};
        map(res, h => {
          configHeader[h.configName] = h;
        });
        this.setState({
          configHeader: {
            ...configHeader,
          },
        });
      }
    });
  }

  @Bind()
  saveDispatch(payload) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'investigationDefinitionOrg/saveAttachmentLine',
      payload,
    });
  }

  @Bind()
  deleteDispatch(payload) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'investigationDefinitionOrg/deleteAttachmentLine',
      payload,
    });
  }

  @Bind()
  queryDispatch(payload) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'investigationDefinitionOrg/queryAttachmentList',
      payload,
    });
  }

  // 修改页签名称的回调
  @Bind()
  handleEditNameChange() {
    const { currentConfig: { investgCfHeaderId, lines, ...reset } = {} } = this.state;
    const {
      form: { validateFields },
      dispatch,
      organizationId,
      updateInvestigateTemplateId,
      config,
    } = this.props;
    validateFields((err, values) => {
      if (!err) {
        const payloadData = {
          ...reset,
          ...values,
          investgCfHeaderId,
          investigateConfigLines: [],
        };
        dispatch({
          type: 'investigationDefinitionOrg/saveDefinition',
          payload: { payloadData, organizationId, updateInvestigateTemplateId },
        }).then(res => {
          if (res) {
            const { configDescription, objectVersionNumber } = res;
            const newConfig = cloneDeep(config);
            const fIndex = findIndex(newConfig, { investgCfHeaderId });
            const configTable = newConfig[fIndex];
            newConfig[fIndex] = {
              ...configTable,
              objectVersionNumber,
              configDescription,
            };
            dispatch({
              type: 'investigationDefinitionOrg/updateState',
              payload: { config: newConfig },
            });
            notification.success();
            this.handleEditNameModal();
          }
        });
      }
    });
  }

  // 处理重命名弹框显隐
  @Bind()
  handleEditNameModal(config = {}) {
    const { editNameVisible } = this.state;
    this.setState({
      currentConfig: config,
      editNameVisible: !editNameVisible,
    });
  }

  // 渲染TabPane
  @Bind()
  renderReserveTabPane(config) {
    const { saving } = this.props;
    const { editConfigNameList } = this.state;
    const { configDescription, configName } = config;
    const isEdit = editConfigNameList.includes(configName);
    // 跨3列页签 基本信息 业务信息 设备信息 研发能力 生产能力 质保能力
    const col = [
      'sslmInvestgBasic',
      'sslmInvestgBusiness',
      'sslmInvestgEquipment',
      'sslmInvestgRd',
      'sslmInvestgProduce',
      'sslmInvestgQa',
    ].includes(configName)
      ? 3
      : 2;
    return (
      <Tabs.TabPane
        tab={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div
              title={configDescription}
              style={{
                width: '100px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'noWrap',
              }}
            >
              {configDescription}
              {/* {getTooltipShow(configDescription, 14, 100)} */}
            </div>
            {isEdit && (
              <Tooltip
                onClick={() => this.handleEditNameModal(config)}
                title={intl.get('spfm.investigationDefinition.model.definition.rename').d('重命名')}
              >
                <Icon type="edit" style={{ padding: '0 8px', marginRight: 0 }} />
              </Tooltip>
            )}
          </div>
        }
        key={configName}
      >
        <Reserved
          col={col}
          saving={saving}
          dataSource={config}
          onHandleSwitchChange={this.onHandleSwitchChange}
          onHandleSave={this.onHandleSave}
          queryTemplateConfig={this.queryTemplateConfig}
        />
      </Tabs.TabPane>
    );
  }

  render() {
    const { configHeader, activeKey, editNameVisible, currentConfig } = this.state;
    const {
      form,
      investigationDefinitionOrg: { attachmentList = {}, attachmentPagination = {} },
      organizationId,
      saving,
      investigateTemplateId,
      updateInvestigateTemplateId,
    } = this.props;
    const tabs = [];
    const templateProp = {
      attachmentList,
      attachmentPagination,
      organizationId,
      investigateTemplateId,
      updateInvestigateTemplateId,
      onUpdateState: this.updateState,
      onSaveDispatch: this.saveDispatch,
      onDeleteDispatch: this.deleteDispatch,
      onQueryDispatch: this.queryDispatch,
      loading: this.props.loading.effects['investigationDefinitionOrg/queryAttachmentList'],
      saving: this.props.loading.effects['investigationDefinitionOrg/updateStateAttachmentLine'],
    };
    // 基础信息
    if (configHeader.sslmInvestgBasic) {
      const tabPane = this.renderReserveTabPane(configHeader.sslmInvestgBasic);
      tabs.push(tabPane);
    }
    // 业务信息
    if (configHeader.sslmInvestgBusiness) {
      const tabPane = this.renderReserveTabPane(configHeader.sslmInvestgBusiness);
      tabs.push(tabPane);
    }
    if (configHeader.sslmInvestgProservice || configHeader.sslmInvestgSupplierCate) {
      tabs.push(
        <Tabs.TabPane
          tab={intl.get(`spfm.investigationDefinition.view.message.tab.proservice`).d('产品及服务')}
          key="sslmInvestgProservice"
        >
          <Product
            saving={saving}
            dataTabOne={configHeader.sslmInvestgProservice || []}
            dataTabTwo={configHeader.sslmInvestgSupplierCate || []}
            onHandleSwitchChange={this.onHandleSwitchChange}
            onHandleSave={this.onHandleSave}
            queryTemplateConfig={this.queryTemplateConfig}
          />
        </Tabs.TabPane>
      );
    }
    // 近三年财务状况
    if (configHeader.sslmInvestgFin) {
      const tabPane = this.renderReserveTabPane(configHeader.sslmInvestgFin);
      tabs.push(tabPane);
    }
    // 分支机构
    if (configHeader.sslmInvestgFinBranch) {
      const tabPane = this.renderReserveTabPane(configHeader.sslmInvestgFinBranch);
      tabs.push(tabPane);
    }
    // 资质信息
    if (configHeader.sslmInvestgAuth) {
      const tabPane = this.renderReserveTabPane(configHeader.sslmInvestgAuth);
      tabs.push(tabPane);
    }
    if (configHeader.sslmInvestgContact || configHeader.sslmInvestgAddress) {
      tabs.push(
        <Tabs.TabPane
          tab={intl
            .get(`spfm.investigationDefinition.view.message.tab.contactAddr`)
            .d('联系人及地址')}
          key="sslmInvestgContact"
        >
          <ContactAddress
            saving={saving}
            dataTabOne={configHeader.sslmInvestgContact}
            dataTabTwo={configHeader.sslmInvestgAddress}
            onHandleSwitchChange={this.onHandleSwitchChange}
            onHandleSave={this.onHandleSave}
            queryTemplateConfig={this.queryTemplateConfig}
          />
        </Tabs.TabPane>
      );
    }
    // 开户行信息
    if (configHeader.sslmInvestgBankAccount) {
      const tabPane = this.renderReserveTabPane(configHeader.sslmInvestgBankAccount);
      tabs.push(tabPane);
    }
    // 主要客户情况
    if (configHeader.sslmInvestgCustomer) {
      const tabPane = this.renderReserveTabPane(configHeader.sslmInvestgCustomer);
      tabs.push(tabPane);
    }
    // 分供方情况
    if (configHeader.sslmInvestgSubSupplier) {
      const tabPane = this.renderReserveTabPane(configHeader.sslmInvestgSubSupplier);
      tabs.push(tabPane);
    }
    // 设备信息
    if (configHeader.sslmInvestgEquipment) {
      const tabPane = this.renderReserveTabPane(configHeader.sslmInvestgEquipment);
      tabs.push(tabPane);
    }
    // 研发能力
    if (configHeader.sslmInvestgRd) {
      const tabPane = this.renderReserveTabPane(configHeader.sslmInvestgRd);
      tabs.push(tabPane);
    }
    // 生产能力
    if (configHeader.sslmInvestgProduce) {
      const tabPane = this.renderReserveTabPane(configHeader.sslmInvestgProduce);
      tabs.push(tabPane);
    }
    // 质保能力
    if (configHeader.sslmInvestgQa) {
      const tabPane = this.renderReserveTabPane(configHeader.sslmInvestgQa);
      tabs.push(tabPane);
    }
    // 售后服务
    if (configHeader.sslmInvestgCustservice) {
      const tabPane = this.renderReserveTabPane(configHeader.sslmInvestgCustservice);
      tabs.push(tabPane);
    }
    if (configHeader.sslmInvestgAttachment) {
      tabs.push(
        <Tabs.TabPane
          tab={intl.get(`spfm.investigationDefinition.view.message.tab.attachment`).d('附件信息')}
          key="sslmInvestgAttachment"
        >
          <Attachment
            saving={saving}
            dataSource={configHeader.sslmInvestgAttachment}
            onHandleSwitchChange={this.onHandleSwitchChange}
            onHandleSave={this.onHandleSave}
            templateProp={templateProp}
            queryTemplateConfig={this.queryTemplateConfig}
          />
        </Tabs.TabPane>
      );
    }
    // 预留表格页签1
    if (configHeader.sslmInvestgReserve1) {
      const tabPane = this.renderReserveTabPane(configHeader.sslmInvestgReserve1);
      tabs.push(tabPane);
    }
    // 预留表格页签2
    if (configHeader.sslmInvestgReserve2) {
      const tabPane = this.renderReserveTabPane(configHeader.sslmInvestgReserve2);
      tabs.push(tabPane);
    }
    // 预留表格页签3
    if (configHeader.sslmInvestgReserve5) {
      const tabPane = this.renderReserveTabPane(configHeader.sslmInvestgReserve5);
      tabs.push(tabPane);
    }
    // 预留表格页签4
    if (configHeader.sslmInvestgReserve6) {
      const tabPane = this.renderReserveTabPane(configHeader.sslmInvestgReserve6);
      tabs.push(tabPane);
    }
    // 预留表格页签5
    if (configHeader.sslmInvestgReserve7) {
      const tabPane = this.renderReserveTabPane(configHeader.sslmInvestgReserve7);
      tabs.push(tabPane);
    }
    // 预留表格页签6
    if (configHeader.sslmInvestgReserve8) {
      const tabPane = this.renderReserveTabPane(configHeader.sslmInvestgReserve8);
      tabs.push(tabPane);
    }
    // 预留表格页签7
    if (configHeader.sslmInvestgReserve9) {
      const tabPane = this.renderReserveTabPane(configHeader.sslmInvestgReserve9);
      tabs.push(tabPane);
    }
    // 预留表单页签1
    if (configHeader.sslmInvestgReserve3) {
      const tabPane = this.renderReserveTabPane(configHeader.sslmInvestgReserve3);
      tabs.push(tabPane);
    }
    // 预留表单页签2
    if (configHeader.sslmInvestgReserve4) {
      const tabPane = this.renderReserveTabPane(configHeader.sslmInvestgReserve4);
      tabs.push(tabPane);
    }
    // 预留表单页签3
    if (configHeader.sslmInvestgReserve10) {
      const tabPane = this.renderReserveTabPane(configHeader.sslmInvestgReserve10);
      tabs.push(tabPane);
    }
    // 预留表单页签4
    if (configHeader.sslmInvestgReserve11) {
      const tabPane = this.renderReserveTabPane(configHeader.sslmInvestgReserve11);
      tabs.push(tabPane);
    }
    // 预留表单页签5
    if (configHeader.sslmInvestgReserve12) {
      const tabPane = this.renderReserveTabPane(configHeader.sslmInvestgReserve12);
      tabs.push(tabPane);
    }
    // 预留表单页签6
    if (configHeader.sslmInvestgReserve13) {
      const tabPane = this.renderReserveTabPane(configHeader.sslmInvestgReserve13);
      tabs.push(tabPane);
    }
    // 预留表单页签7
    if (configHeader.sslmInvestgReserve14) {
      const tabPane = this.renderReserveTabPane(configHeader.sslmInvestgReserve14);
      tabs.push(tabPane);
    }
    return (
      <Spin spinning={saving || false}>
        <Tabs
          animated={false}
          defaultActiveKey={activeKey}
          tabPosition="left"
          onChange={this.handleKeyChange}
          tabBarStyle={{ width: 150 }}
          className={styles['definition-tabs']}
        >
          {tabs}
        </Tabs>
        {editNameVisible && (
          <EditNameModal
            form={form}
            config={currentConfig}
            visible={editNameVisible}
            onOk={this.handleEditNameChange}
            onCancel={this.handleEditNameModal}
          />
        )}
      </Spin>
    );
  }
}

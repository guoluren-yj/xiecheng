/**
 * TemplateTabs - 模板配置行tab页
 * @date: 2020-12-29
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React, { Component } from 'react';
import { DataSet, Tabs, Tooltip, Icon, Modal, Form, IntlField } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { forEach, head, camelCase } from 'lodash';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import notification from 'utils/notification';
import intl from 'utils/intl';

import {
  investigationTemplateHeaderQueryAll,
  saveTemptDetail,
} from '@/services/investigationDefinitionOrgService';
import FormField from '@/routes/components/FormField';
// import { getTooltipShow } from '@/routes/components/utils';

import FieldTable from './FieldTable';
import { getTempTabTableDS, getTempTabHeaderDS } from '../Detail/stores/indexDS';
import Attachment from './Attachment';

import styles from '../index.less';

const { TabPane } = Tabs;
const organizationId = getCurrentOrganizationId();

export default class TemplateTabs extends Component {
  constructor(props) {
    super(props);
    if (props.onRef) {
      props.onRef(this);
    }
    this.state = {
      configList: [], // 模板配置数据
      activeKey: '', // 当前激活的页签
      loadTab: {}, // 已经加载过数据的页签
      allTableDs: {}, // 所有页签表格ds
      allHeaderDs: {}, // 所有页签表格头ds
      configNameDescription: {}, // 页签描述
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
  }

  componentDidMount() {
    // 通过模板查配置
    this.handleTemplateConfig();
  }

  /**
   * 查询模板配置
   */
  @Bind()
  handleTemplateConfig() {
    const { oldInvestigateTemplateId, onUpdateLoading } = this.props;
    if (oldInvestigateTemplateId) {
      if (onUpdateLoading) {
        onUpdateLoading(true);
      }
      return investigationTemplateHeaderQueryAll({
        investigateTemplateId: oldInvestigateTemplateId,
        organizationId,
      })
        .then(res => {
          if (getResponse(res)) {
            // 初始化ds
            this.setState(
              {
                allTableDs: {},
                allHeaderDs: {},
                configNameDescription: {},
                configList: [],
              },
              () => {
                this.dealConfigData(res);
              }
            );
            if (onUpdateLoading) {
              onUpdateLoading(false);
            }
          }
        })
        .catch(() => {
          if (onUpdateLoading) {
            onUpdateLoading(false);
          }
        });
    }
  }

  // 处理调查表配置
  @Bind()
  dealConfigData(config) {
    const { allHeaderDs, configNameDescription, activeKey } = this.state;
    const configHeaders = {};
    const configLines = {};
    const newConfigList = [];
    let newAllHeaderDs = {};
    let newConfigNameDescription = {};
    // 处理头 处理 tab
    forEach(config.investigateConfigHeaders, header => {
      configHeaders[header.investgCfHeaderId] = header;
      configHeaders[header.investgCfHeaderId].lines = [];
      newConfigList.push(header);
      // 处理头ds，用于重命名tab页名称 性能可能有问题
      const headerDsInfo = this.handleHeaderDataSet(header);
      const { currentHeaderDs, curentConfigNameDescription } = headerDsInfo;
      newAllHeaderDs = {
        ...newAllHeaderDs,
        ...currentHeaderDs,
      };
      newConfigNameDescription = {
        ...newConfigNameDescription,
        ...curentConfigNameDescription,
      };
      // }
    });

    // 处理行 处理字段
    forEach(config.investigateConfigLines, line => {
      configLines[line.investgCfLineId] = line;
      const lines =
        configHeaders[line.investgCfHeaderId] && configHeaders[line.investgCfHeaderId].lines;
      const { fieldCode, componentType } = line;
      const formatFieldCode = camelCase(fieldCode);
      switch (formatFieldCode) {
        case 'attachmentType':
          if (componentType === 'ValueList') {
            configLines[line.investgCfLineId].componentType = 'Cascader';
          }
          break;
        default:
          break;
      }
      if (lines) {
        lines.push(line);
        configLines[line.investgCfLineId].props = [];
      }
    });

    // 处理属性
    forEach(config.investigateConfigComponents, componentProp => {
      const props =
        configLines[componentProp.investgCfLineId] &&
        configLines[componentProp.investgCfLineId].props;
      if (props) {
        props.push(componentProp);
      }
      if (componentProp.attributeName === 'toValueListFlag' && componentProp.attributeValue) {
        const fieldCode =
          configLines[componentProp.investgCfLineId] &&
          configLines[componentProp.investgCfLineId].fieldCode;
        if (fieldCode) {
          configLines[componentProp.investgCfLineId].componentType = 'ValueList';
        }
        if (fieldCode === 'attachment_type') {
          configLines[componentProp.investgCfLineId].lovCode = 'SPFM.COMPANY.SUB_ATTACHMENT';
        }
        if (fieldCode === 'authentication_type') {
          configLines[componentProp.investgCfLineId].lovCode =
            'SSLM.QUALIFICATION_AUTHENTICATION_TYPE';
        }
      }
    });
    // 默认激活第一个tab
    let activeConfig = head(newConfigList) || {};
    let activeConfigName = activeConfig.configName;
    if (activeKey) {
      activeConfig = newConfigList.find(item => item.configName === activeKey);
      activeConfigName = activeConfig.configName;
    }
    this.dealDataSet(activeConfig);
    this.setState({
      configList: newConfigList,
      activeKey: activeConfigName,
      loadTab: { [activeConfigName]: true },
      allHeaderDs: {
        ...allHeaderDs,
        ...newAllHeaderDs,
      },
      configNameDescription: {
        ...configNameDescription,
        ...newConfigNameDescription,
      },
    });
  }

  // 处理头ds，用于点击重命名tab页名称，获取不到ds
  @Bind()
  handleHeaderDataSet(headerData = {}) {
    const { editFlag = true } = this.props;
    const currentHeaderDs = {};
    const curentConfigNameDescription = {};
    const { configName, configDescription, lines, ...others } = headerData;
    currentHeaderDs[configName] = new DataSet(getTempTabHeaderDS({ configName, isEdit: editFlag }));
    currentHeaderDs[configName].loadData([{ ...others, configDescription, configName }]);
    curentConfigNameDescription[configName] = configDescription;
    return {
      currentHeaderDs,
      curentConfigNameDescription,
    };
  }

  // 根据配置生成DataSet
  @Bind()
  dealDataSet(config) {
    const { allTableDs } = this.state;
    const { configName, lines = [] } = config;
    const currentTableDs = {};
    if (configName) {
      currentTableDs[configName] = new DataSet(getTempTabTableDS());
      currentTableDs[configName].loadData(lines);
      this.setState({
        allTableDs: {
          ...allTableDs,
          ...currentTableDs,
        },
      });
    }
  }

  @Bind()
  getTabPaneContent(config) {
    const {
      editFlag = true,
      handleRefresh,
      oldInvestigateTemplateId,
      newInvestigateTemplateId,
    } = this.props;
    const { configName } = config;
    const { allTableDs, allHeaderDs } = this.state;
    switch (configName) {
      case 'sslmInvestgAttachment': // 附件信息
        return (
          <Attachment
            tableDs={allTableDs[configName]}
            headerDs={allHeaderDs[configName]}
            isEdit={editFlag}
            configName={configName}
            handleRefresh={handleRefresh}
            queryTemplateConfig={this.handleTemplateConfig}
            oldInvestigateTemplateId={oldInvestigateTemplateId}
            newInvestigateTemplateId={newInvestigateTemplateId}
            onRef={node => {
              this.attachmentRef = node;
            }}
          />
        );
      default:
        return (
          <FieldTable
            tableDs={allTableDs[configName]}
            headerDs={allHeaderDs[configName]}
            isEdit={editFlag}
            configName={configName}
            handleRefresh={handleRefresh}
            queryTemplateConfig={this.handleTemplateConfig}
          />
        );
    }
  }

  // 处理重命名弹框显隐
  @Bind()
  handleEditNameModal(headerDs = {}) {
    const currentRecord = headerDs ? headerDs.current : {};
    Modal.open({
      title: intl
        .get('spfm.investigationDefinition.model.definition.tagNameRename')
        .d('页签名称重命名'),
      children: (
        <Form record={currentRecord} labelLayout="float">
          <IntlField name="configDescription" />
        </Form>
      ),
      drawer: true,
      style: { width: 380 },
      onOk: () => {
        return this.handleSaveTabName(headerDs);
      },
    });
  }

  // 保存页签名称
  @Bind()
  async handleSaveTabName(tabHeaderDs) {
    // tabHeaderDs-页签头ds, templateHeaderDs - 模板头ds
    const { templateHeaderDs, handleRefresh } = this.props;
    const templateHeaderValidateFlag = await templateHeaderDs.current.validate();
    const tabHeaderValidateFlag = await tabHeaderDs.current.validate();
    if (templateHeaderValidateFlag && tabHeaderValidateFlag) {
      const templateHeaderData = templateHeaderDs.current.toJSONData();
      const tabHeaderData = tabHeaderDs.current.toJSONData();
      const data = {
        ...tabHeaderData,
        investigateConfigLines: [],
      };
      const payload = {
        investigateConfigHeaderList: [data],
        investigateTemplate: templateHeaderData,
      };
      return saveTemptDetail(payload).then(res => {
        if (getResponse(res)) {
          notification.success();
          handleRefresh();
        }
      });
    } else {
      return false;
    }
  }

  // 渲染启用、未启用
  @Bind()
  renderEnable(investigateFlag) {
    const style = investigateFlag
      ? {
          color: '#179454',
          background: 'rgba(71,184,131,0.15)',
        }
      : {
          color: '#4E5769',
          background: '#E5E7EC',
        };
    return (
      <span
        style={{
          fontSize: 12,
          borderRadius: 2,
          padding: '0 2px',
          fontWeight: 500,
          marginLeft: 8,
          ...style,
        }}
      >
        {investigateFlag
          ? intl.get('hzero.common.status.enable').d('启用')
          : intl.get('sslm.common.status.notEnable').d('未启用')}
      </span>
    );
  }

  @Bind()
  renderTabsContent() {
    const { configList, editConfigNameList = [], allHeaderDs } = this.state;
    const { editFlag = true } = this.props;
    return configList.map(config => {
      const { configName, configDescription, investigateFlag } = config;
      const isAttachmentFlag = configName === 'sslmInvestgAttachment';
      const isEdit = editConfigNameList.includes(configName) && editFlag;
      const headerDs = allHeaderDs[configName];
      return (
        <TabPane
          key={configName}
          tab={
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                maxWidth: '175px',
                minWidth: '140px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', maxWidth: '155px' }}>
                <div
                  style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'noWrap',
                  }}
                >
                  {configDescription}
                  {/* {getTooltipShow(configDescription, 14, 80)} */}
                </div>
                {this.renderEnable(investigateFlag)}
              </div>
              {isEdit && (
                <Tooltip
                  title={intl
                    .get('spfm.investigationDefinition.model.definition.rename')
                    .d('重命名')}
                >
                  <Icon
                    type="mode_edit"
                    style={{ padding: 0, marginRight: 0, fontSize: 16 }}
                    onClick={() => {
                      this.handleEditNameModal(headerDs);
                    }}
                  />
                </Tooltip>
              )}
            </div>
          }
        >
          {!isAttachmentFlag ? (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {/* <div className={styles['template-tabs-config-name']}>{configDescription}</div> */}
              {editFlag && (
                <Form
                  columns={1}
                  dataSet={headerDs}
                  useColon={false}
                  labelLayout="float"
                  className={styles['template-tabs-enable-switch']}
                  style={{ marginBottom: 16 }}
                >
                  <FormField isEdit name="investigateFlag" componentType="CHECKBOX" />
                </Form>
              )}
            </div>
          ) : null}
          {this.getTabPaneContent(config)}
        </TabPane>
      );
    });
  }

  // tab发生改变时的回调
  @Bind()
  handleTabChange(key) {
    const { loadTab, configList } = this.state;
    if (!loadTab[key]) {
      const currentConfig = head(configList.filter(n => n.configName === key));
      this.dealDataSet(currentConfig);
    }
    this.setState({
      loadTab: { ...loadTab, [key]: true },
      activeKey: key,
    });
  }

  // dataSet校验
  @Bind()
  validateDataSet(headerDs, lineDs, configName) {
    const { configNameDescription } = this.state;
    const { newInvestigateTemplateId } = this.props;
    return new Promise(async (resolve, reject) => {
      const headerValidateFlag = await headerDs.current.validate(true);
      const headerErrorList = head(headerDs.current.getValidationErrors())?.errors;
      // 行判空
      let lineErrorList = [];
      let lineValidateFlag = true;
      if (lineDs) {
        lineValidateFlag = await lineDs.validate();
        lineErrorList = head(lineDs.getValidationErrors())?.errors;
      }
      const errorMsg = [];
      if (!headerValidateFlag || !lineValidateFlag) {
        (headerErrorList || []).forEach(curent => {
          const { validationMessage } = curent || {};
          if (validationMessage) {
            errorMsg.push(<div>{validationMessage}</div>);
          }
        });
        (lineErrorList || []).forEach(curent => {
          const { validationMessage } = head(curent?.errors) || {};
          if (validationMessage) {
            errorMsg.push(<div>{validationMessage}</div>);
          }
        });
        reject({ errorMsg, configDescription: configNameDescription[configName] }); // eslint-disable-line
      } else {
        // 校验通过
        const headerData = headerDs.current.toData();
        const lineData = lineDs ? lineDs.toJSONData() : [];
        const data = {
          ...headerData,
          investigateTemplateId: newInvestigateTemplateId,
          investigateConfigLines: lineData,
        };
        resolve({ [configName]: data });
      }
    });
  }

  // 获取需保存的参数
  async handleSaveParams() {
    const { allTableDs, allHeaderDs } = this.state;
    const validateResult = [];
    for (const configName in allHeaderDs) {
      if (Object.hasOwnProperty.call(allHeaderDs, configName)) {
        const headerDs = allHeaderDs[configName];
        const lineDs = allTableDs[configName];
        const errorMsg = this.validateDataSet(headerDs, lineDs, configName);
        validateResult.push(errorMsg);
      }
    }
    try {
      const dataList = await Promise.all(validateResult);
      const saveData = [];
      forEach(dataList, data => {
        // dataList => [{a : {}}, {b: {}}]
        for (const key in data) {
          if (Object.hasOwnProperty.call(data, key)) {
            const value = data[key];
            saveData.push(value);
          }
        }
      });
      return saveData;
    } catch (error) {
      const { errorMsg, configDescription } = error;
      notification.warning({
        message: configDescription,
        description: errorMsg,
      });
    }
  }

  render() {
    const { activeKey } = this.state;
    return (
      <Tabs
        animated={false}
        tabPosition="left"
        activeKey={activeKey}
        onChange={this.handleTabChange}
        inkBarStyle={{ display: 'none' }}
        className={styles['template-tabs-config-detail']}
      >
        {this.renderTabsContent()}
      </Tabs>
    );
  }
}

/**
 * TemplateHeader - 模板头信息
 * @date: 2020-12-29
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React, { Component } from 'react';
import {
  DataSet,
  notification,
  Table,
  CheckBox,
  Tooltip,
  // TextField,
  Modal,
  Form,
} from 'choerodon-ui/pro';
import { Badge } from 'choerodon-ui';
import { isEmpty } from 'lodash';
import intl from 'utils/intl';
import { Bind, Debounce } from 'lodash-decorators';
// import { isEmpty, isArray, intersection } from 'lodash';
import { getResponse } from 'utils/utils';
import { yesOrNoRender, enableRender } from 'utils/renderer';

import FormField from '@/routes/components/FormField';
import { renderRequired, renderAllow, renderStatus } from '@/routes/components/utils';

import ConditionalConfig from '@/routes/components/Investigation/components/ConditionalConfig';
import {
  getConditionLineDs,
  getCustomizeConditionCombinationDs,
} from '@/routes/components/Investigation/components/ConditionalConfig/stores';
import {
  saveConditionRule,
  saveInvestigateConfigComponents,
} from '@/services/orgInvestigateTemplateService';
import { getComponentAttrsLineDS, getComponentAttrsHeaderDS } from '../Detail/stores/commonAttrsDS';
import ComponentAttrsModal from './ComponentAttrsModal';

import styles from '../index.less';

export default class FieldTable extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {}

  /**
   * 条件配置
   */
  @Debounce(200)
  @Bind()
  openConditionModal(record, type = '') {
    const recordData = record.toData();
    const { investgCfHeaderId } = recordData;
    // 字段配置ds
    const conditionLineDs = new DataSet(getConditionLineDs());
    // 自定义组合规则
    const customizeConditionDs = new DataSet(getCustomizeConditionCombinationDs());
    // 设置查询条件
    conditionLineDs.setQueryParameter('investgCfHeaderId', investgCfHeaderId);
    Modal.open({
      key: Modal.key(),
      title: intl.get(`sslm.investDefOrg.model.investDefOrg.ruleConfiguration`).d('条件配置'),
      okText: intl.get('hzero.common.button.save').d('保存'),
      drawer: true,
      movable: false,
      style: { width: 742 },
      bodyStyle: { paddingTop: 0 },
      children: (
        <ConditionalConfig
          record={recordData}
          conditionLineDs={conditionLineDs}
          customizeConditionDs={customizeConditionDs}
          type={type}
        />
      ),
      onOk: async () => {
        const flag = (await conditionLineDs.validate()) && (await customizeConditionDs.validate());
        if (flag) {
          return this.handleSaveRuleData({
            conditionLineDs,
            customizeConditionDs,
            record: recordData,
            type,
          });
        } else {
          return false;
        }
      },
    });
  }

  /**
   * 处理保存数据
   */
  @Bind()
  handleSaveRuleData({ conditionLineDs, customizeConditionDs, record, type } = {}) {
    const { objectVersionNumber, investgCfLineId } = record;
    const { customizeConditionCombination } = customizeConditionDs?.current?.toData();
    const data = conditionLineDs?.toData() || [];
    const lineData = data.map((n, i) => {
      const { fieldNameLov, ...others } = n;
      return {
        ...others,
        lineNum: i + 1,
      };
    });
    let customizeRule = {};
    switch (type) {
      case 'required':
        customizeRule = {
          requireFx: customizeConditionCombination,
          objectVersionNumber,
        };
        break;
      case 'editable':
        customizeRule = {
          editableFx: customizeConditionCombination,
          objectVersionNumber,
        };
        break;
      case 'pattern':
        customizeRule = {
          conditionCombination: customizeConditionCombination,
        };
        break;
      default:
        break;
    }
    const params = {
      investgCfLineFxList: lineData || [],
      investgCfLineId,
      valueType: type,
      ...customizeRule,
    };
    // 保存
    return this.handleSaveRuleConfig(params);
  }

  /**
   * 保存条件规则
   */
  @Bind()
  handleSaveRuleConfig(params = {}) {
    const { queryTemplateConfig } = this.props;
    return saveConditionRule(params).then(res => {
      const result = getResponse(res);
      if (result) {
        notification.success({
          placement: 'bottomRight',
          message: intl.get('hzero.common.notification.success').d('操作成功'),
        });
        // 重新查询 todo
        if (queryTemplateConfig) {
          queryTemplateConfig();
        }
      } else {
        return false;
      }
    });
  }

  /**
   * 组件属性
   */
  @Debounce(200)
  @Bind()
  openComponentAttrs(record = {}, editFlag) {
    const { isEdit = false, handleRefresh } = this.props;
    const {
      fieldDescription,
      componentTypeMeaning,
      investgCfLineId,
      componentType,
      express,
      defaultValueType: oldDefaultValueType,
      objectVersionNumber,
      // valueField = '',
      // displayField = '',
    } = record.get([
      'fieldDescription',
      'componentTypeMeaning',
      'investgCfLineId',
      'componentType',
      'express',
      'defaultValueType',
      'objectVersionNumber',
      'valueField',
      'displayField',
    ]);
    const componentAttrsHeaderDs = new DataSet(getComponentAttrsHeaderDS());
    componentAttrsHeaderDs.loadData([
      {
        fieldDescription,
        componentTypeMeaning,
        defaultValueType: oldDefaultValueType,
      },
    ]);
    const componentAttrsLineDs = new DataSet(getComponentAttrsLineDS());
    // 设置值集类型的值集试图配置
    componentAttrsLineDs.setState({
      // valueField,
      // textField: displayField,
      parentRecord: record.toData(),
    });
    componentAttrsLineDs.setQueryParameter('investgCfLineId', investgCfLineId);
    componentAttrsLineDs.query();
    Modal.open({
      title: intl.get(`spfm.investigationDefinition.view.message.title.drawer`).d('组件属性'),
      drawer: true,
      children: (
        <ComponentAttrsModal
          dataSet={componentAttrsLineDs}
          isEdit={isEdit}
          headerDs={componentAttrsHeaderDs}
          componentType={componentType}
          express={express}
          objectVersionNumber={objectVersionNumber}
          handleRefresh={handleRefresh}
          // 默认值可编辑标识
          defaultValueEditFlag={editFlag}
          openConditionModal={this.openConditionModal}
        />
      ),
      style: { width: 742 },
      okButton: isEdit,
      cancelProps: isEdit ? {} : { color: 'primary' },
      cancelText: isEdit
        ? intl.get('hzero.common.button.cancel').d('取消')
        : intl.get('hzero.common.button.close').d('关闭'),
      onOk: () =>
        new Promise(async resolve => {
          const validateFlag = await componentAttrsLineDs.validate();
          if (validateFlag) {
            const submitData = componentAttrsLineDs.toData();
            // 组件选择数值，不保存，组件属性维护默认值类型，接口报错，故组件属性为空时关闭弹框，不调接口
            if (isEmpty(submitData)) {
              resolve(true);
              return;
            }
            // 传入头信息,保存组件默认值类型
            const defaultValueType = componentAttrsHeaderDs?.current?.get('defaultValueType');
            saveInvestigateConfigComponents({
              query: { defaultValueType, objectVersionNumber },
              data: submitData,
              isOrg: true,
            }).then(res => {
              if (getResponse(res)) {
                resolve();
                notification.success({
                  placement: 'bottomRight',
                  message: intl.get('hzero.common.notification.success').d('操作成功'),
                });
                // 刷新
                if (handleRefresh) {
                  handleRefresh();
                }
              } else {
                resolve(false);
              }
            });
          } else {
            resolve(false);
          }
        }),
    });
  }

  @Bind()
  getColumns() {
    const { isEdit = false, headerDs = {} } = this.props;
    const headerData = headerDs.current ? headerDs.current.toData() : {};
    const { gridFlag } = headerData;
    const tableTabFlag = gridFlag === 1;
    const columns = [
      !isEdit && {
        title: intl.get('hzero.common.common.status').d('状态'),
        name: 'visualFlag',
        renderer: ({ value, record }) => {
          if (value) {
            record.set({
              fieldStatus: 'FIELD_ENABLE',
              fieldStatusMeaning: intl.get('hzero.common.status.enable').d('启用'),
            });
          } else {
            record.set({
              fieldStatus: 'FIELD_DISABLE',
              fieldStatusMeaning: intl.get('hzero.common.status.disable').d('禁用'),
            });
          }
          return renderStatus({ value, name: 'fieldStatus', record });
        },
      },
      {
        name: 'fieldCode',
      },
      {
        name: 'fieldDescription',
        editor: isEdit,
      },
      isEdit && {
        name: 'visualFlag',
        editor: record => {
          // 移动电话，邮箱不可页面配置
          const { readOnlyFlag, fieldCode } = record.get(['readOnlyFlag', 'fieldCode']);
          const configEditFlag =
            readOnlyFlag !== 1 && fieldCode !== 'mobilephone' && fieldCode !== 'mail';
          return isEdit && configEditFlag;
        },
        renderer: isEdit
          ? null
          : ({ value }) => {
              return enableRender(value);
            },
      },
      {
        name: 'requiredFlag',
        renderer: ({ value, record }) => {
          const { readOnlyFlag, fieldCode, requireFx } = record.get([
            'readOnlyFlag',
            'fieldCode',
            'requireFx',
          ]);
          const editFlag =
            isEdit &&
            readOnlyFlag !== 1 &&
            ![
              'english_name',
              'taxpayer_type',
              'establishment_date',
              'registered_capital',
              'currency_code',
              'address_detail',
              'purchaser_attachment_uuid',
              'asset_liability_ratio',
              'current_ratio',
              'return_on_total_assets',
              'bank_code',
              'bank_name',
              // 'ownership_structure_atm_uuid',
              // 'stock_symbol',
              'expiration_date',
              'date_from',
              'date_to',
              'freeze_control_flag',
            ].includes(fieldCode);
          const hiddenFx = ['ownership_structure_atm_uuid', 'stock_symbol'].includes(fieldCode);
          if (editFlag) {
            return (
              <span>
                <CheckBox name="requiredFlag" value={1} unCheckedValue={0} record={record} />
                {!hiddenFx && (
                  <Tooltip
                    title={intl
                      .get(`sslm.investDefOrg.model.investDefOrg.ruleConfiguration`)
                      .d('条件配置')}
                    placement="top"
                  >
                    <a
                      onClick={() => this.openConditionModal(record, 'required')}
                      style={{ marginLeft: 10 }}
                    >
                      {intl.get('sslm.common.model.condition.fx').d('fx')}
                    </a>
                    {!!requireFx && <Badge dot className={styles['link-dot']} />}
                  </Tooltip>
                )}
              </span>
            );
          } else if (isEdit) {
            return (
              <CheckBox name="requiredFlag" value={1} unCheckedValue={0} record={record} disabled />
            );
          } else {
            return renderRequired(value);
          }
        },
      },
      {
        name: 'editableFlag',
        renderer: ({ value, record }) => {
          const { readOnlyFlag, fieldCode, editableFx } = record.get([
            'readOnlyFlag',
            'fieldCode',
            'editableFx',
          ]);
          const editFlag =
            isEdit &&
            readOnlyFlag !== 1 &&
            ![
              'english_name',
              'taxpayer_type',
              'establishment_date',
              'registered_capital',
              'currency_code',
              'address_detail',
              'purchaser_attachment_uuid',
              'asset_liability_ratio',
              'current_ratio',
              'return_on_total_assets',
              'bank_code',
              'bank_name',
              'freeze_control_flag',
              'mobilephone',
              'mail',
            ].includes(fieldCode);
          if (editFlag) {
            return (
              <span>
                <CheckBox name="editableFlag" value={1} unCheckedValue={0} record={record} />
                <Tooltip
                  title={intl
                    .get(`sslm.investDefOrg.model.investDefOrg.ruleConfiguration`)
                    .d('条件配置')}
                  placement="top"
                >
                  <a
                    onClick={() => this.openConditionModal(record, 'editable')}
                    style={{ marginLeft: 10 }}
                  >
                    {intl.get('sslm.common.model.condition.fx').d('fx')}
                  </a>
                  {!!editableFx && <Badge dot className={styles['link-dot']} />}
                </Tooltip>
              </span>
            );
          } else if (isEdit) {
            return (
              <CheckBox name="editableFlag" value={1} unCheckedValue={0} record={record} disabled />
            );
          } else {
            return renderAllow(value);
          }
        },
      },
      {
        name: 'orderSeq',
        editor: isEdit,
        align: 'right',
      },
      {
        name: 'componentTypeLov',
        editor: isEdit,
      },
      {
        name: 'lovCodeLov',
        width: 180,
        editor: isEdit,
      },
      {
        name: 'attrs',
        align: 'left',
        renderer: ({ record }) => {
          // 只读行和以下字段不能配置默认值
          const { readOnlyFlag, fieldCode } = record.get([
            'readOnlyFlag',
            'fieldCode',
            'editableFx',
          ]);
          const editFlag =
            isEdit &&
            readOnlyFlag !== 1 &&
            ![
              'english_name',
              'taxpayer_type',
              'establishment_date',
              'registered_capital',
              'currency_code',
              'address_detail',
              'purchaser_attachment_uuid',
              'asset_liability_ratio',
              'current_ratio',
              'return_on_total_assets',
              'bank_code',
              'bank_name',
              'freeze_control_flag',
            ].includes(fieldCode);
          return (
            <a onClick={() => this.openComponentAttrs(record, editFlag)}>
              {isEdit
                ? intl.get('hzero.common.view.button.edit').d('编辑')
                : intl.get('hzero.common.button.view').d('查看')}
            </a>
          );
        },
      },
      {
        name: 'customFlag',
        editor: false,
        renderer: isEdit
          ? null
          : ({ value }) => {
              return yesOrNoRender(value);
            },
      },
      {
        name: 'colspan',
        editor: isEdit,
        align: 'right',
      },
      tableTabFlag && {
        name: 'fixedCol',
        editor: isEdit,
      },
      tableTabFlag && {
        name: 'colWidth',
        editor: isEdit,
        width: 80,
      },
    ].filter(Boolean);
    return columns;
  }

  render() {
    const { isEdit = false, tableDs = {}, headerDs = {}, configName = '' } = this.props;
    const headerData = headerDs.current ? headerDs.current.toData() : {};
    const { gridFlag } = headerData;
    const fileTabFlag = configName === 'sslmInvestgAttachment' && gridFlag === 1;
    const tableTabFlag =
      gridFlag === 1 &&
      configName !== 'sslmInvestgContact' &&
      configName !== 'sslmInvestgCustomer' &&
      configName !== 'sslmInvestgAttachment' &&
      configName !== 'sslmInvestgReserve3' &&
      configName !== 'sslmInvestgReserve4' &&
      configName !== 'sslmInvestgReserve10' &&
      configName !== 'sslmInvestgReserve11' &&
      configName !== 'sslmInvestgReserve12' &&
      configName !== 'sslmInvestgReserve13' &&
      configName !== 'sslmInvestgReserve14';
    const contactTabFlag = configName === 'sslmInvestgContact';
    const customerTabFlag = configName === 'sslmInvestgCustomer';
    const attachmentTabFlag = configName === 'sslmInvestgAttachment';
    const dataStatusFlag = ![
      'sslmInvestgProservice',
      'sslmInvestgSupplierCate',
      'sslmInvestgContact',
      'sslmInvestgAddress',
      'sslmInvestgBankAccount',
    ].includes(configName);
    return (
      <React.Fragment>
        <div className={styles['tab-content']}>
          <Form
            dataSet={headerDs}
            columns={3}
            labelLayout={isEdit ? 'float' : 'vertical'}
            className={isEdit ? '' : 'c7n-pro-vertical-form-display'}
            useWidthPercent
          >
            {/* 附件页签显示 */}
            <FormField
              isEdit={isEdit}
              name="atLeastOneFlag"
              componentType="Switch"
              hidden={!fileTabFlag}
              renderer={({ value }) => {
                return yesOrNoRender(value);
              }}
            />
            {/* 页签是表格并且不是联系人、主要客户情况、附件、预留表单1，2显示 */}
            <FormField
              isEdit={isEdit}
              name="requiredCount"
              componentType="NumberField"
              hidden={!tableTabFlag}
            />
            {/* 联系人页签展示 */}
            <FormField
              isEdit={isEdit}
              name="contactRequiredCount"
              componentType="NumberField"
              hidden={!contactTabFlag}
            />
            {/* 主要客户情况展示 */}
            <FormField
              isEdit={isEdit}
              name="customerRequiredCount"
              componentType="NumberField"
              hidden={!customerTabFlag}
            />
            <FormField isEdit={isEdit} name="remark" componentType="IntlField" />
            <FormField isEdit={isEdit} name="orderSeq" componentType="NumberField" />
            <FormField
              isEdit={isEdit}
              name="attWirteMethod"
              componentType="SELECT"
              hidden={!attachmentTabFlag}
              help={intl
                .get('spfm.investigationDefinition.model.definition.attWirteMethodMsg')
                .d(
                  '调查表模板中预定义了附件类型A时，若配置“仅更新主数据中对应附件类型”，调查表审批通过后，供应商主数据已有附件中仅附件类型A会被更新，其他附件类型不受影响；若配置“全量覆盖更新主数据”，调查表审批通过后，供应商主数据已有附件会被全量清空，再新增一行附件类型A'
                )}
              showHelp={isEdit ? 'tooltip' : 'label'}
            />
            <FormField
              isEdit={isEdit}
              name="restrictDataStatus"
              componentType="Select"
              hidden={dataStatusFlag}
            />
          </Form>
          <Table
            dataSet={tableDs}
            columns={this.getColumns()}
            virtualCell={false}
            selectionMode="click"
            style={{ maxHeight: `calc(100vh - 310px)` }}
            customizedCode={`sslm-investigation-config-detail-table-${configName}`}
          />
        </div>
      </React.Fragment>
    );
  }
}

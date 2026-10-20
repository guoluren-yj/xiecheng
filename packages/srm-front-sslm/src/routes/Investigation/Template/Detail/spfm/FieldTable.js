/**
 * Table 公共的Table
 * @date Mon Aug 13 2018
 * @author WY  yang.wang06@hand-china.com
 * @copyright Copyright(c) 2018 Hand
 */

import React from 'react';
import { Form, Select, Button, InputNumber, Row, Col, Tooltip, Icon } from 'hzero-ui';
import { Modal, DataSet } from 'choerodon-ui/pro';
import { Badge } from 'choerodon-ui';
import { map, range, sum, isNumber, isEmpty, isNil } from 'lodash';
import { Bind } from 'lodash-decorators';
import Checkbox from 'components/Checkbox';
import Switch from 'components/Switch';
import EditTable from 'components/EditTable';
import TLEditor from 'components/TLEditor';
import { getEditTableData, isTenantRoleLevel, getResponse } from 'utils/utils';
import notification from 'utils/notification';
import Lov from 'components/Lov';
import intl from 'utils/intl';
import { enableRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';

import ConditionalConfig from '@/routes/components/Investigation/components/ConditionalConfig';
import {
  getConditionLineDs,
  getCustomizeConditionCombinationDs,
} from '@/routes/components/Investigation/components/ConditionalConfig/stores';

import { saveConditionRule } from '@/services/orgInvestigateTemplateService';
import AttrsDrawer from './AttrsDrawer';

import styles from '../index.less';

const { Item: FormItem } = Form;
const { Option } = Select;

@formatterCollections({
  code: [
    'spfm.investigationDefinition',
    'sslm.common',
    'spfm.rulesDefinition',
    'sslm.investDefOrg',
  ],
})
@Form.create({ fieldNameProp: null })
export default class FieldTable extends React.PureComponent {
  state = {
    attrsDrawerVisible: false,
  };

  constructor(props) {
    super(props);
    const { col = 3 } = this.props;
    const optionValues = range(col);
    const offsetOptions = map(optionValues, index => {
      return (
        <Option key={`${index}`} value={`${index}`}>
          {index}
        </Option>
      );
    });
    const spanOptions = map(optionValues, index => {
      const kv = index + 1;
      return (
        <Option key={`${kv}`} value={`${kv}`}>
          {kv}
        </Option>
      );
    });
    this.columns = [
      {
        title: intl.get(`spfm.investigationDefinition.model.definition.fieldCode`).d('字段编码'),
        dataIndex: 'fieldCode',
        width: 150,
        fixed: 'left',
      },
      {
        title: intl.get(`spfm.investigationDefinition.model.definition.fieldDesc`).d('字段描述'),
        width: 160,
        dataIndex: 'fieldDescription',
        fixed: 'left',
        render: (item, record) => {
          const { getFieldDecorator } = record.$form;
          return record.readOnlyFlag !== 1 ? (
            <FormItem>
              {getFieldDecorator('fieldDescription', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`spfm.investigationDefinition.model.definition.fieldDesc`)
                        .d('字段描述'),
                    }),
                  },
                ],
                initialValue: item,
              })(
                <TLEditor
                  onChange={() => this.handleUpdateState(record)}
                  label={intl
                    .get(`spfm.investigationDefinition.model.definition.fieldDesc`)
                    .d('字段描述')}
                  field="fieldDescription"
                  token={record._token}
                />
              )}
            </FormItem>
          ) : (
            item
          );
        },
      },
      {
        title: intl.get(`spfm.investigationDefinition.model.definition.visualFlag`).d('启用'),
        dataIndex: 'visualFlag',
        width: 80,
        render: (item, record) => {
          const { getFieldDecorator } = record.$form;
          // 移动电话不可页面配置
          const configEditFlag =
            record.readOnlyFlag !== 1 &&
            record.fieldCode !== 'mobilephone' &&
            record.fieldCode !== 'mail';
          return configEditFlag ? (
            <FormItem>
              {getFieldDecorator('visualFlag', {
                rules: [{ required: true }],
                initialValue: item,
              })(<Checkbox onChange={() => this.handleUpdateState(record, undefined, true)} />)}
            </FormItem>
          ) : (
            enableRender(item)
          );
        },
      },
      {
        title: intl.get(`spfm.investigationDefinition.model.definition.requiredFlag`).d('要求必输'),
        dataIndex: 'requiredFlag',
        width: 100,
        render: (item, record) => {
          const { getFieldDecorator } = record.$form;
          const { requireFx = '' } = record;
          const hiddenFx = ['ownership_structure_atm_uuid', 'stock_symbol'].includes(
            record.fieldCode
          );
          return record.readOnlyFlag !== 1 &&
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
            ].includes(record.fieldCode) ? (
              <FormItem>
                {getFieldDecorator('requiredFlag', {
                rules: [{ required: true }],
                initialValue: item,
              })(<Checkbox onChange={() => this.handleUpdateState(record)} />)}
                {!hiddenFx && (
                <Tooltip
                  title={intl
                    .get(`sslm.investDefOrg.model.investDefOrg.ruleConfiguration`)
                    .d('条件配置')}
                  placement="top"
                >
                  <a
                    onClick={() => this.handleConditionsConfiguration(record, 'required')}
                    style={{ marginLeft: 10 }}
                  >
                    {intl.get(`sslm.common.model.condition.fx`).d('fx')}
                  </a>
                  {!!requireFx && <Badge dot className={styles['link-dot']} />}
                </Tooltip>
              )}
              </FormItem>
          ) : (
            enableRender(item)
          );
        },
      },
      {
        title: intl.get(`spfm.investigationDefinition.model.definition.editFlag`).d('允许编辑'),
        dataIndex: 'editableFlag',
        width: 100,
        render: (item, record) => {
          const { getFieldDecorator } = record.$form;
          const { editableFx = '' } = record;
          return record.readOnlyFlag !== 1 &&
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
            ].includes(record.fieldCode) ? (
              <FormItem>
                {getFieldDecorator('editableFlag', {
                initialValue: item,
              })(<Checkbox onChange={() => this.handleUpdateState(record)} />)}
                <Tooltip
                  title={intl
                  .get(`sslm.investDefOrg.model.investDefOrg.ruleConfiguration`)
                  .d('条件配置')}
                  placement="top"
                >
                  <a
                    onClick={() => this.handleConditionsConfiguration(record, 'editable')}
                    style={{ marginLeft: 10 }}
                  >
                    {intl.get(`sslm.common.model.condition.fx`).d('fx')}
                  </a>
                  {!!editableFx && <Badge dot className={styles['link-dot']} />}
                </Tooltip>
              </FormItem>
          ) : (
            enableRender(item)
          );
        },
      },
      {
        title: intl.get(`spfm.investigationDefinition.model.definition.orderSeq`).d('排序'),
        dataIndex: 'orderSeq',
        // width: 100,
        render: (item, record) => {
          const { getFieldDecorator } = record.$form;
          return record.readOnlyFlag !== 1 ? (
            <FormItem>
              {getFieldDecorator('orderSeq', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`spfm.investigationDefinition.model.definition.orderSeq`)
                        .d('排序'),
                    }),
                  },
                ],
                initialValue: item,
              })(
                <InputNumber
                  style={{ width: '100%' }}
                  min={1}
                  step={10}
                  precision={0}
                  onChange={() => this.handleUpdateState(record)}
                />
              )}
            </FormItem>
          ) : (
            item
          );
        },
      },
      {
        title: intl.get(`spfm.investigationDefinition.model.definition.component`).d('组件'),
        dataIndex: 'componentType',
        width: 140,
        render: (item, record) => {
          const { getFieldDecorator } = record.$form;
          return record.customFlag === 1 ? (
            <FormItem>
              {getFieldDecorator('componentType', {
                initialValue: item,
              })(
                <Lov
                  code="SPFM.INVESTIGATE_COMPONENTS"
                  queryParams={{ enabledFlag: 1 }}
                  textValue={record.componentTypeMeaning}
                  onChange={(value, lovList) => {
                    this.handleUpdateState(record, lovList);
                  }}
                />
              )}
            </FormItem>
          ) : (
            record.componentTypeMeaning
          );
        },
      },
      {
        title: intl.get(`spfm.investigationDefinition.model.definition.lovCode`).d('值集'),
        dataIndex: 'lovCode',
        width: 160,
        render: (item, record) => {
          const { getFieldDecorator, getFieldValue } = record.$form;
          if (record.customFlag === 1) {
            getFieldDecorator('lovFlag');
            getFieldDecorator('componentType');
            getFieldDecorator('dataType');
            const componentType = getFieldValue('componentType');
            // 平台级需要使用平台级的接口 租户级需要使用租户级的接口
            // HPFM.LOV.LOV_DETAIL_CODE HPFM.LOV.LOV_DETAIL_CODE.ORG  值集编码
            // HPFM.LOV.LOV_DETAIL      HPFM.LOV.LOV_DETAIL.ORG       Lov编码

            const lovCode = isTenantRoleLevel()
              ? componentType === 'Lov'
                ? 'SPFM.LOV.LOV_DETAIL.ORG'
                : 'HPFM.LOV.LOV_DETAIL_CODE.ORG'
              : componentType === 'Lov'
              ? 'SPFM.LOV.LOV_DETAIL'
              : 'HPFM.LOV.LOV_DETAIL_CODE';
            return (
              <FormItem>
                {getFieldDecorator('lovCode', {
                  initialValue: item,
                })(
                  <Lov
                    disabled={!(getFieldValue('lovFlag') === 1) && record.lovFlag !== 1}
                    code={lovCode}
                    textValue={item}
                    queryParams={{ lovQueryFlag: 1 }}
                    onChange={() => this.handleUpdateState(record)}
                  />
                )}
              </FormItem>
            );
          } else {
            return item;
          }
        },
      },
      {
        title: intl.get(`spfm.investigationDefinition.model.definition.attrs`).d('组件属性'),
        key: 'attrs',
        width: 85,
        render: record => (
          <a onClick={() => this.showAttrsDrawer(record)}>
            {intl.get(`spfm.investigationDefinition.model.definition.attrs`).d('组件属性')}
          </a>
        ),
      },
      {
        title: intl.get(`spfm.investigationDefinition.model.definition.customFlag`).d('预留字段'),
        dataIndex: 'customFlag',
        width: 85,
        render: item => {
          return item === 1
            ? intl.get('hzero.common.status.yes')
            : intl.get('hzero.common.status.no');
        },
      },
      {
        title: intl.get(`spfm.investigationDefinition.model.definition.colspan`).d('跨列'),
        dataIndex: 'colspan',
        width: 85,
        render: (item, record) => {
          const { getFieldDecorator } = record.$form;
          return record.readOnlyFlag !== 1 ? (
            <FormItem>
              {getFieldDecorator('colspan', {
                rules: [{ required: true }],
                initialValue: item || '1',
              })(
                <Select style={{ width: '100%' }} onChange={() => this.handleUpdateState(record)}>
                  {spanOptions}
                </Select>
              )}
            </FormItem>
          ) : (
            item
          );
        },
      },
      {
        title: intl.get(`spfm.investigationDefinition.model.definition.leftOffset`).d('左空位'),
        dataIndex: 'leftOffset',
        width: 100,
        render: (item, record) => {
          const { getFieldDecorator } = record.$form;
          return record.readOnlyFlag !== 1 ? (
            <FormItem>
              {getFieldDecorator('leftOffset', {
                rules: [{ required: true }],
                initialValue: item || '0',
              })(
                <Select style={{ width: '100%' }} onChange={() => this.handleUpdateState(record)}>
                  {offsetOptions}
                </Select>
              )}
            </FormItem>
          ) : (
            item || 0
          );
        },
      },
      {
        title: intl.get(`spfm.investigationDefinition.model.definition.rightOffset`).d('右空位'),
        dataIndex: 'rightOffset',
        width: 100,
        render: (item, record) => {
          const { getFieldDecorator } = record.$form;
          return record.readOnlyFlag !== 1 ? (
            <FormItem>
              {getFieldDecorator('rightOffset', {
                rules: [{ required: true }],
                initialValue: item || '0',
              })(
                <Select style={{ width: '100%' }} onChange={() => this.handleUpdateState(record)}>
                  {offsetOptions}
                </Select>
              )}
            </FormItem>
          ) : (
            item || 0
          );
        },
      },
    ].filter(Boolean);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (prevState.prevDataSource !== nextProps.dataSource) {
      nextProps.form.resetFields();
      return {
        dataSource: nextProps.dataSource,
        prevDataSource: nextProps.dataSource,
      };
    }
    return null;
  }

  /**
   * 条件配置弹窗
   * @param {*} record
   */
  @Bind()
  handleConditionsConfiguration(record, type = '') {
    const { investgCfHeaderId } = record;
    // 字段配置ds
    const conditionLineDs = new DataSet(getConditionLineDs());
    // 自定义组合规则
    const customizeConditionDs = new DataSet(getCustomizeConditionCombinationDs());
    // 设置查询条件
    conditionLineDs.setQueryParameter('investgCfHeaderId', investgCfHeaderId);
    this.ConditionsConfigurationModal = Modal.open({
      key: Modal.key(),
      title: intl.get(`sslm.investDefOrg.model.investDefOrg.ruleConfiguration`).d('条件配置'),
      okText: intl.get('hzero.common.button.save').d('保存'),
      drawer: true,
      movable: false,
      style: { width: 742 },
      bodyStyle: { paddingTop: 0 },
      children: (
        <ConditionalConfig
          record={record}
          conditionLineDs={conditionLineDs}
          customizeConditionDs={customizeConditionDs}
          type={type}
        />
      ),
      onOk: async () => {
        const flag = (await conditionLineDs.validate()) && (await customizeConditionDs.validate());
        if (flag) {
          return this.handleSaveRule({
            conditionLineDs,
            customizeConditionDs,
            record,
            type,
          });
        } else {
          return false;
        }
      },
    });
  }

  /**
   * 保存fx
   */
  @Bind()
  handleSaveRule({ conditionLineDs, customizeConditionDs, record, type } = {}) {
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

  @Bind()
  onHandleAdd(e) {
    e.preventDefault();
    const {
      onHandleAdd,
      form,
      rest,
      rest: { objectVersionNumber, investgCfHeaderId, tenantId } = {},
      investigateFlag: invFlag,
    } = this.props;
    const { dataSource } = this.state;
    const contactRequiredCount = form.getFieldValue('contactRequiredCount') || 0;
    const customerRequiredCount = form.getFieldValue('customerRequiredCount') || 0;
    const requiredCount = form.getFieldValue('requiredCount') || 0;

    form.validateFields((err, fieldsValue) => {
      if (!fieldsValue.contactRequiredCount) {
        form.setFieldsValue({ contactRequiredCount: 0 });
      }
      if (!fieldsValue.customerRequiredCount) {
        form.setFieldsValue({ customerRequiredCount: 0 });
      }
      if (!fieldsValue.requiredCount) {
        form.setFieldsValue({ requiredCount: 0 });
      }
      if (!err) {
        const params = getEditTableData(dataSource, [])
          // .filter((r) => r.isEdit)
          .map(r => {
            const { ...otherValues } = r;
            return otherValues;
          });
        const tls = form.getFieldValue('_tls');
        const remark = form.getFieldValue('remark');
        const attWirteMethod = form.getFieldValue('attWirteMethod');
        if (params && isEmpty(params)) {
          notification.warning({
            message: intl.get(`hzero.common.view.message.notpassRequire`).d('请填写必填字段后保存'),
          });
        } else {
          const investigateConfigLines = params
            .filter(r => r.isEdit)
            .map(r => {
              const { isEdit, _status, ...otherValues } = r;
              return otherValues;
            });
          const payload = {
            ...rest,
            remark,
            _tls: tls,
            investigateConfigLines,
            objectVersionNumber,
            investgCfHeaderId,
            tenantId,
            investigateFlag: invFlag,
            atLeastOneFlag: 1,
            contactRequiredCount,
            customerRequiredCount,
            requiredCount,
            attWirteMethod,
          };
          onHandleAdd(payload);
        }
      }
    });
  }

  // 显示组件
  @Bind()
  showAttrsDrawer(record) {
    this.setState({
      attrsDrawerVisible: true,
      drawerData: record,
    });
  }

  @Bind()
  hideAttrsDrawer() {
    this.setState({
      attrsDrawerVisible: false,
    });
  }

  /**
   * Swith改变时执行的onChange
   */
  @Bind()
  handleSwitchChange(param) {
    const {
      form,
      onHandleChange,
      atLeastOneFlag: leastFlag,
      investigateFlag: invFlag,
    } = this.props;
    const contactRequiredCount = form.getFieldValue('contactRequiredCount') || 0;
    const customerRequiredCount = form.getFieldValue('customerRequiredCount') || 0;
    const requiredCount = form.getFieldValue('requiredCount') || 0;
    form.validateFields((err, fieldsValue) => {
      if (!fieldsValue.contactRequiredCount) {
        form.setFieldsValue({ contactRequiredCount: 0 });
      }
      if (!fieldsValue.customerRequiredCount) {
        form.setFieldsValue({ customerRequiredCount: 0 });
      }
      if (!fieldsValue.requiredCount) {
        form.setFieldsValue({ requiredCount: 0 });
      }
      if (!err) {
        if (param === 'investigate') {
          const investigateFlag = form.getFieldValue('investigateFlag') === 1 ? 0 : 1;
          onHandleChange({
            investigateFlag,
            atLeastOneFlag: leastFlag,
            contactRequiredCount,
            customerRequiredCount,
            requiredCount,
          });
        } else if (param === 'atLeastOne') {
          const atLeastOneFlag = form.getFieldValue('atLeastOneFlag') === 1 ? 0 : 1;
          onHandleChange({
            investigateFlag: invFlag,
            atLeastOneFlag,
            contactRequiredCount,
            customerRequiredCount,
            requiredCount,
          });
        }
      }
    });
  }

  /**
   * InputNumber改变时执行的onChange
   */
  @Bind()
  handleInputChange() {
    const { form, onHandleChange, investigateFlag: invFlag } = this.props;
    const contactRequiredCount = form.getFieldValue('contactRequiredCount') || 0;
    const customerRequiredCount = form.getFieldValue('customerRequiredCount') || 0;
    const requiredCount = form.getFieldValue('requiredCount') || 0;

    form.validateFields((err, fieldsValue) => {
      if (!fieldsValue.contactRequiredCount) {
        form.setFieldsValue({ contactRequiredCount: 0 });
      }
      if (!fieldsValue.customerRequiredCount) {
        form.setFieldsValue({ customerRequiredCount: 0 });
      }
      if (!fieldsValue.requiredCount) {
        form.setFieldsValue({ requiredCount: 0 });
      }
      if (!err) {
        onHandleChange({
          investigateFlag: invFlag,
          atLeastOneFlag: 1,
          contactRequiredCount,
          customerRequiredCount,
          requiredCount,
        });
      }
    });
  }

  /**
   * 表单改变时执行
   */
  @Bind()
  handleUpdateState(record, lovList, isVisualFlag = false) {
    const { dataSource } = this.props;
    const { $form: form, fieldCode } = record;
    // eslint-disable-next-line
    record.isEdit = true;

    // 判断是否是 启用字段
    if (isVisualFlag) {
      if (fieldCode === 'date_from') {
        const index = dataSource.findIndex(i => i.fieldCode === 'date_to');
        const currentFieldCheckedValue = form.getFieldValue('visualFlag') === 1 ? 0 : 1;
        dataSource[index].$form.setFieldsValue({ visualFlag: currentFieldCheckedValue });
      }
      if (fieldCode === 'date_to') {
        const index = dataSource.findIndex(i => i.fieldCode === 'date_from');
        const currentFieldCheckedValue = form.getFieldValue('visualFlag') === 1 ? 0 : 1;
        dataSource[index].$form.setFieldsValue({ visualFlag: currentFieldCheckedValue });
      }
    }

    if (lovList) {
      const setFormData = {
        lovFlag: lovList.lovFlag,
        componentType: lovList.componentType,
        dataType: lovList.dataType,
      };
      form.setFieldsValue(setFormData);
      if (lovList.lovFlag === 0) {
        form.setFieldsValue({ lovCode: '' });
      }
    }
  }

  render() {
    const {
      dataSource,
      investigateFlag,
      atLeastOneFlag,
      gridFlag,
      form,
      saving,
      code = {},
      configName = '',
      contactRequiredCount = 1,
      customerRequiredCount = 1,
      requiredCount = 1,
      rest: { remark = '', _token = '', attWirteMethod } = {},
    } = this.props;

    // const scrollY = window.innerHeight > 170 ? window.innerHeight - 170 : window.innerHeight;
    const scrollX = sum(this.columns.map(item => (isNumber(item.width) ? item.width : 150)));

    const tableProps = {
      scroll: { x: scrollX }, // y: 500  todo 待解决 加上 y 会有 header 和 body 对不齐的问题
      dataSource,
      bordered: true,
      pagination: false,
      columns: this.columns,
      className: styles.table,
      rowKey: 'investgCfLineId',
    };
    return (
      <React.Fragment>
        <div className="table-list-search">
          <Row gutter={24}>
            <Col span={18}>
              <Row>
                <Col span={8}>
                  {form.getFieldDecorator('investigateFlag', {
                    initialValue: investigateFlag,
                  })(
                    <Switch
                      style={{ marginRight: 8 }}
                      onChange={() => this.handleSwitchChange('investigate')}
                    />
                  )}
                  <span style={{ marginRight: 8 }}>
                    {intl
                      .get(`spfm.investigationDefinition.view.message.notActive`)
                      .d('调查当前页签信息')}
                  </span>
                </Col>
                {gridFlag === 1 && configName === 'sslmInvestgAttachment' && (
                  <Col span={8}>
                    {form.getFieldDecorator('atLeastOneFlag', {
                      initialValue: atLeastOneFlag,
                    })(
                      <Switch
                        style={{ marginRight: 8 }}
                        onChange={() => this.handleSwitchChange('atLeastOne')}
                      />
                    )}
                    <span style={{ marginRight: 8 }}>
                      {intl
                        .get(`spfm.investigationDefinition.view.message.leastOne`)
                        .d('填写至少一行')}
                    </span>
                  </Col>
                )}
                {gridFlag === 1 &&
                  configName !== 'sslmInvestgContact' &&
                  configName !== 'sslmInvestgCustomer' &&
                  configName !== 'sslmInvestgAttachment' &&
                  configName !== 'sslmInvestgReserve3' &&
                  configName !== 'sslmInvestgReserve4' &&
                  configName !== 'sslmInvestgReserve10' &&
                  configName !== 'sslmInvestgReserve11' &&
                  configName !== 'sslmInvestgReserve12' &&
                  configName !== 'sslmInvestgReserve13' &&
                  configName !== 'sslmInvestgReserve14' && (
                    <Col span={8}>
                      <span style={{ marginRight: 8 }}>
                        {intl
                          .get(`spfm.investigationDefinition.view.message.atLeastFilled`)
                          .d('填写至少')}
                      </span>
                      <Form.Item style={{ display: 'inline-block', marginTop: -10 }}>
                        {form.getFieldDecorator('requiredCount', {
                          initialValue: requiredCount,
                          rules: [
                            {
                              pattern: /^\d+$/,
                              message: intl
                                .get('spfm.investigationDefinition.model.definition.integer')
                                .d('请输入正整数'),
                            },
                          ],
                        })(<InputNumber min={0} />)}
                      </Form.Item>
                      <span style={{ marginLeft: 8 }}>
                        {intl.get(`spfm.investigationDefinition.view.message.line`).d('行')}
                      </span>
                    </Col>
                  )}
                {(configName === 'sslmInvestgContact' || configName === 'sslmInvestgCustomer') && (
                  <Col span={8}>
                    <span style={{ marginRight: 8 }}>
                      {intl
                        .get(`spfm.investigationDefinition.view.message.atLeastFilled`)
                        .d('填写至少')}
                    </span>
                    <Form.Item style={{ display: 'inline-block', marginTop: -10 }}>
                      {form.getFieldDecorator(
                        configName === 'sslmInvestgContact'
                          ? 'contactRequiredCount'
                          : 'customerRequiredCount',
                        {
                          initialValue:
                            configName === 'sslmInvestgContact'
                              ? contactRequiredCount
                              : customerRequiredCount,
                          rules: [
                            {
                              pattern: /^\d+$/,
                              message: intl
                                .get('spfm.investigationDefinition.model.definition.integer')
                                .d('请输入正整数'),
                            },
                          ],
                        }
                      )(<InputNumber min={0} />)}
                    </Form.Item>
                    <span style={{ marginLeft: 8 }}>
                      {intl.get(`spfm.investigationDefinition.view.message.line`).d('行')}
                    </span>
                  </Col>
                )}
                <Col span={8}>
                  <span style={{ marginRight: 8 }}>
                    {intl
                      .get(`spfm.investigationDefinition.view.message.writeExplain`)
                      .d('填写说明')}
                    ：
                  </span>
                  <Form.Item style={{ display: 'inline-block', marginTop: -10, width: '70%' }}>
                    {form.getFieldDecorator('remark', {
                      initialValue: remark,
                    })(
                      <TLEditor
                        label={intl
                          .get(`spfm.investigationDefinition.view.message.writeExplain`)
                          .d('填写说明')}
                        field="remark"
                        token={_token}
                      />
                    )}
                  </Form.Item>
                </Col>
              </Row>
              <Row style={{ marginTop: 8 }}>
                {configName === 'sslmInvestgAttachment' && (
                  <Col span={8}>
                    <FormItem
                      label={
                        <span>
                          <Tooltip
                            title={intl
                              .get(
                                'spfm.investigationDefinition.model.definition.attWirteMethodMsg'
                              )
                              .d(
                                '调查表模板中预定义了附件类型A时，若配置“仅更新主数据中对应附件类型”，调查表审批通过后，供应商主数据已有附件中仅附件类型A会被更新，其他附件类型不受影响；若配置“全量覆盖更新主数据”，调查表审批通过后，供应商主数据已有附件会被全量清空，再新增一行附件类型A'
                              )}
                          >
                            <Icon type="question-circle" style={{ fontSize: 12, marginRight: 4 }} />
                          </Tooltip>
                          {intl
                            .get('spfm.investigationDefinition.model.definition.attWirteMethod')
                            .d('调查表附件回写更新主数据方式')}
                        </span>
                      }
                      labelCol={{ span: 12 }}
                      wrapperCol={{ span: 12 }}
                    >
                      {form.getFieldDecorator('attWirteMethod', {
                        initialValue: isNil(attWirteMethod) ? '0' : String(attWirteMethod),
                        rules: [
                          {
                            required: configName === 'sslmInvestgAttachment',
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl
                                .get('spfm.investigationDefinition.model.definition.attWirteMethod')
                                .d('调查表附件回写更新主数据方式'),
                            }),
                          },
                        ],
                      })(
                        <Select style={{ width: '100%' }}>
                          {(code.updateMethod || []).map(item => (
                            <Option key={item.value} value={item.value}>
                              {item.meaning}
                            </Option>
                          ))}
                        </Select>
                      )}
                    </FormItem>
                  </Col>
                )}
              </Row>
            </Col>
            <Col span={6} style={{ textAlign: 'right' }}>
              <Button type="primary" loading={saving} onClick={this.onHandleAdd}>
                {intl.get('hzero.common.button.save').d('保存')}
              </Button>
            </Col>
          </Row>
        </div>
        <EditTable {...tableProps} />
        {this.state.attrsDrawerVisible && (
          <AttrsDrawer
            visible={this.state.attrsDrawerVisible}
            record={this.state.drawerData}
            onClose={this.hideAttrsDrawer}
            handleConditionsConfiguration={this.handleConditionsConfiguration}
          />
        )}
      </React.Fragment>
    );
  }
}

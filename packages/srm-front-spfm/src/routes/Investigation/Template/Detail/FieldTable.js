/**
 * Table 公共的Table
 * @date Mon Aug 13 2018
 * @author WY  yang.wang06@hand-china.com
 * @copyright Copyright(c) 2018 Hand
 */

import React from 'react';
import { Form, Select, Button, InputNumber } from 'hzero-ui';
import { map, range } from 'lodash';
import { Bind } from 'lodash-decorators';
import Checkbox from 'components/Checkbox';
import Switch from 'components/Switch';
import EditTable from 'components/EditTable';
import TLEditor from 'components/TLEditor';
import { getEditTableData, isTenantRoleLevel } from 'utils/utils';
import Lov from 'components/Lov';
import intl from 'utils/intl';
import AttrsDrawer from './AttrsDrawer';
import styles from '../index.less';

const { Item: FormItem } = Form;
const { Option } = Select;

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
        width: 120,
      },
      {
        title: intl.get(`spfm.investigationDefinition.model.definition.fieldDesc`).d('字段描述'),
        width: 150,
        dataIndex: 'fieldDescription',
        render: (item, record) => {
          const { getFieldDecorator } = record.$form;
          return (
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
                />
              )}
            </FormItem>
          );
        },
      },
      {
        title: intl.get(`spfm.investigationDefinition.model.definition.orderSeq`).d('排序'),
        dataIndex: 'orderSeq',
        width: 100,
        render: (item, record) => {
          const { getFieldDecorator } = record.$form;
          return (
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
                  style={{ width: 50 }}
                  min={1}
                  step={10}
                  precision={0}
                  onChange={() => this.handleUpdateState(record)}
                />
              )}
            </FormItem>
          );
        },
      },
      {
        title: intl.get(`spfm.investigationDefinition.model.definition.componentType`).d('组件'),
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
        width: 140,
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
                ? 'HPFM.LOV.LOV_DETAIL.ORG'
                : 'HPFM.LOV.LOV_DETAIL_CODE.ORG'
              : componentType === 'Lov'
              ? 'HPFM.LOV.LOV_DETAIL'
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
        title: intl.get(`spfm.investigationDefinition.model.definition.visualFlag`).d('启用'),
        dataIndex: 'visualFlag',
        width: 60,
        render: (item, record) => {
          const { getFieldDecorator } = record.$form;
          return (
            <FormItem>
              {getFieldDecorator('visualFlag', {
                rules: [{ required: true }],
                initialValue: item,
              })(<Checkbox onChange={() => this.handleUpdateState(record)} />)}
            </FormItem>
          );
        },
      },
      {
        title: intl.get(`spfm.investigationDefinition.model.definition.requiredFlag`).d('要求必输'),
        dataIndex: 'requiredFlag',
        width: 85,
        render: (item, record) => {
          const { getFieldDecorator } = record.$form;
          return (
            <FormItem>
              {getFieldDecorator('requiredFlag', {
                rules: [{ required: true }],
                initialValue: item,
              })(<Checkbox onChange={() => this.handleUpdateState(record)} />)}
            </FormItem>
          );
        },
      },
      {
        title: intl.get(`spfm.investigationDefinition.model.definition.colspan`).d('跨列'),
        dataIndex: 'colspan',
        width: 85,
        render: (item, record) => {
          const { getFieldDecorator } = record.$form;
          return (
            <FormItem>
              {getFieldDecorator('colspan', {
                rules: [{ required: true }],
                initialValue: item || '1',
              })(<Select onChange={() => this.handleUpdateState(record)}>{spanOptions}</Select>)}
            </FormItem>
          );
        },
      },
      {
        title: intl.get(`spfm.investigationDefinition.model.definition.leftOffset`).d('左空位'),
        dataIndex: 'leftOffset',
        width: 100,
        render: (item, record) => {
          const { getFieldDecorator } = record.$form;
          return (
            <FormItem>
              {getFieldDecorator('leftOffset', {
                rules: [{ required: true }],
                initialValue: item || '0',
              })(<Select onChange={() => this.handleUpdateState(record)}>{offsetOptions}</Select>)}
            </FormItem>
          );
        },
      },
      {
        title: intl.get(`spfm.investigationDefinition.model.definition.rightOffset`).d('右空位'),
        dataIndex: 'rightOffset',
        width: 100,
        render: (item, record) => {
          const { getFieldDecorator } = record.$form;
          return (
            <FormItem>
              {getFieldDecorator('rightOffset', {
                rules: [{ required: true }],
                initialValue: item || '0',
              })(<Select onChange={() => this.handleUpdateState(record)}>{offsetOptions}</Select>)}
            </FormItem>
          );
        },
      },
    ];
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

  @Bind()
  onHandleAdd(e) {
    e.preventDefault();
    const { onHandleAdd } = this.props;
    const { dataSource } = this.state;
    const params = getEditTableData(dataSource, [])
      .filter(r => r.isEdit)
      .map(r => {
        const { isEdit, _status, ...otherValues } = r;
        return otherValues;
      });
    onHandleAdd(params);
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
    if (param === 'investigate') {
      const investigateFlag = form.getFieldValue('investigateFlag') === 1 ? 0 : 1;
      onHandleChange({ investigateFlag, atLeastOneFlag: leastFlag });
    } else if (param === 'atLeastOne') {
      const atLeastOneFlag = form.getFieldValue('atLeastOneFlag') === 1 ? 0 : 1;
      onHandleChange({ investigateFlag: invFlag, atLeastOneFlag });
    }
  }

  /**
   * 表单改变时执行
   */
  @Bind()
  handleUpdateState(record, lovList) {
    const { $form: form } = record;
    // eslint-disable-next-line
    record.isEdit = true;
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
    const { dataSource, investigateFlag, atLeastOneFlag, gridFlag, form, saving } = this.props;

    const scrollY = window.innerHeight > 170 ? window.innerHeight - 170 : window.innerHeight;

    const tableProps = {
      scroll: { x: 1250, y: scrollY }, // y: 500  todo 待解决 加上 y 会有 header 和 body 对不齐的问题
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
          {form.getFieldDecorator('investigateFlag', {
            initialValue: investigateFlag,
          })(
            <Switch
              style={{ marginRight: 8 }}
              onChange={() => this.handleSwitchChange('investigate')}
            />
          )}
          <span style={{ marginRight: 8 }}>
            {intl.get(`spfm.investigationDefinition.view.message.notActive`).d('调查当前页签信息')}
          </span>
          {gridFlag === 1 && (
            <React.Fragment>
              {form.getFieldDecorator('atLeastOneFlag', {
                initialValue: atLeastOneFlag,
              })(
                <Switch
                  style={{ marginRight: 8 }}
                  onChange={() => this.handleSwitchChange('atLeastOne')}
                />
              )}
              <span style={{ marginRight: 8 }}>
                {intl.get(`spfm.investigationDefinition.view.message.leastOne`).d('填写至少一行')}
              </span>
            </React.Fragment>
          )}
          <Button type="primary" loading={saving} onClick={this.onHandleAdd}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
        </div>
        <EditTable {...tableProps} />
        {this.state.attrsDrawerVisible && (
          <AttrsDrawer
            visible={this.state.attrsDrawerVisible}
            record={this.state.drawerData}
            onClose={this.hideAttrsDrawer}
          />
        )}
      </React.Fragment>
    );
  }
}

import React, { Fragment, createRef } from 'react';

import {
  Form,
  Lov,
  TextField,
  Select,
  NumberField,
  Table,
  CheckBox,
  Switch,
  DatePicker,
  TextArea,
  IntlField,
} from 'choerodon-ui/pro';
import { Modal, Tabs, Alert } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import { isFunction } from 'lodash';
import moment from 'moment';

import intl from 'utils/intl';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { getDateFormat, getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';

import style from '../index.less';

const { Sidebar } = Modal;
const { TabPane } = Tabs;
const { Column } = Table;

export default class Drawer extends React.Component {
  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
    this.state = {
      componentType: 'INPUT',
      activityTabKey: 'map',
    };
    this.textAreaRef = createRef();
  }

  componentDidMount() {
    this.props.onRef(this);
    // this.props.basicDrawerFormDs.addEventListener('load', this.handleLoad);
    this.props.basicDrawerFormDs.addEventListener('update', this.handleChange);
  }

  // @Bind()
  // handleLoad() {
  //   this.forceUpdate();
  // }

  /**
   * 渲染时间日期渲染格式
   */
  @Bind()
  renderDateFormat(dateFormat) {
    let format;
    switch (dateFormat) {
      case 'yyyy-MM-dd':
        format = 'YYYY-MM-DD';
        break;
      case 'yyyy/MM/dd':
        format = 'YYYY/MM/DD';
        break;
      case 'yyyy-MM-dd hh:mm:ss':
        format = 'YYYY-MM-DD hh:mm:ss';
        break;
      case 'yyyy/MM/dd hh:mm:ss':
        format = 'YYYY/MM/DD hh:mm:ss';
        break;
      default:
        break;
    }
    return format;
  }

  /**
   * 监听事件
   */
  @Bind()
  handleChange({ name, value, dataSet }) {
    const { componentType = 'INPUT' } = this.state;
    const { basicDrawerLovMapDs } = this.props;
    // 值集编码与默认值的联动
    if (name === 'valueSetLov') {
      if (componentType === 'SELECT') {
        // 组件类型下拉框
        dataSet.getField('defaultValue').reset();
        dataSet.current.set('defaultValue', null);
        if (value) {
          dataSet.getField('defaultValue').set('lookupCode', value.lovCode);
        } else {
          dataSet.getField('defaultValue').set('lookupCode', '');
        }
      } else if (componentType === 'LOV') {
        // 组件类型LOV
        dataSet.getField('defaultValueMeaning').reset();
        dataSet.getField('defaultValueCode').reset();
        dataSet.getField('defaultValue').reset();
        // dataSet.getField('defaultValueMeaning').reset();
        dataSet.current.set('defaultValueLov', null);
        dataSet.current.set('defaultValueCode', null);
        dataSet.current.set('defaultValueMeaning', null);
        dataSet.current.set('defaultValue', null);
        basicDrawerLovMapDs
          .getField('paramValueLOV')
          .set('lovCode', value && 'HPFM.CUST.RELATE.FIELD.LIST');
        basicDrawerLovMapDs
          .getField('paramValueLOV')
          .set('lovPara', { viewCode: value?.lovCode, tenantId: getCurrentOrganizationId() });

        // basicDrawerLovMapDs.setQueryParameter('lovCode', value.lovCode);
        // if (value) { // LOV缓存, 需要动态设置
        //   dataSet.getField('defaultValueLov').set('lovCode', value.viewCode);
        //   // dataSet.getField('defaultValueLov').setLovPara('lovCode', value.viewCode);
        // } else {
        //   dataSet.getField('defaultValueLov').set('lovCode', '');
        //   // dataSet.getField('defaultValueLov').setLovPara('lovCode', '');
        // }
      }
    }
    // 日期格式与默认值的联动
    if (name === 'dateFormat') {
      if (value) {
        if (value === 'yyyy/MM/dd hh:mm:ss' || value === 'yyyy-MM-dd hh:mm:ss') {
          dataSet.getField('defaultValue').set('type', 'dateTime');
        } else {
          dataSet.getField('defaultValue').set('type', 'date');
        }
        dataSet.getField('defaultValue').set('format', this.renderDateFormat(value));
        dataSet
          .getField('defaultValue')
          .set(
            'transformRequest',
            (val) => val && moment(val).format(this.renderDateFormat(value))
          );
      } else {
        // 默认设置date,以及format格式，transformRequest格式
        dataSet.getField('defaultValue').set('type', 'date');
        dataSet.getField('defaultValue').set('format', getDateFormat());
        dataSet
          .getField('defaultValue')
          .set('transformRequest', (val) => val && moment(val).format(DEFAULT_DATE_FORMAT));
      }
    }
    if (name === 'defaultValueLov') {
      if (value) {
        dataSet.current.set('defaultValue', value[dataSet.current.get('valueField')]);
      } else {
        dataSet.current.set('defaultValue', '');
      }
    }
    if (name === 'multipleFlag') {
      dataSet.current.set('defaultValue', null);
    }
  }

  /**
   * 关闭弹框
   */
  @Bind()
  handleCancelDrawer() {
    this.setState({
      componentType: 'INPUT',
      activityTabKey: 'map',
    });
    this.props.onCancel();
  }

  /**
   * 改变tab标签
   */
  @Bind()
  changeTabs(activityKey) {
    this.setState({
      activityTabKey: activityKey,
    });
  }

  @Bind()
  changeComponentType(value) {
    const { basicDrawerFormDs } = this.props;
    const { componentType, activityTabKey } = this.state;
    this.setState({
      componentType: value,
    });
    if (value === 'LOV') {
      this.setState({
        activityTabKey: 'lovParamter',
      });
    } else if (value === 'SELECT') {
      this.setState({
        activityTabKey: 'lovParamter',
      });
    } else if (
      activityTabKey === 'special' ||
      activityTabKey === 'lovMappings' ||
      activityTabKey === 'lovParamter'
    ) {
      this.setState({
        activityTabKey: 'map',
      });
    }

    // 组件类型发生改变，清空上一次组件设置的值
    if (componentType !== value) {
      switch (componentType) {
        case 'INPUT':
          basicDrawerFormDs.getField('defaultValue').reset(); // 重置属性
          basicDrawerFormDs.current.set('defaultValue', null); // 重置框值
          // basicDrawerFormDs.current.set('textMaxLength', null);
          // basicDrawerFormDs.current.set('textMinLength', null);
          break;
        case 'INPUT_NUMBER':
          basicDrawerFormDs.getField('defaultValue').reset();
          // basicDrawerFormDs.current.set('numberMax', null);
          // basicDrawerFormDs.current.set('numberMin', null);
          // basicDrawerFormDs.current.set('numberPrecision', null);
          basicDrawerFormDs.current.set('defaultValue', null); // 重置框值
          break;
        case 'SELECT':
          basicDrawerFormDs.current.set('multipleFlag', 0);
          break;
        case 'LOV':
          basicDrawerFormDs.getField('valueSetLov').reset();
          basicDrawerFormDs.getField('defaultValueLov').reset();
          basicDrawerFormDs.getField('defaultValue').reset();
          basicDrawerFormDs.current.set('multipleFlag', 0);
          basicDrawerFormDs.current.set('valueSetLov', null); // 重置框值
          basicDrawerFormDs.current.set('defaultValueLov', null);
          basicDrawerFormDs.current.set('defaultValue', null);
          basicDrawerFormDs.getField('defaultValueMeaning').reset();
          basicDrawerFormDs.current.set('defaultValueMeaning', null);
          break;
        case 'DATE_PICKER':
          basicDrawerFormDs.current.set('dateFormat', null);
          basicDrawerFormDs.current.set('defaultValue', null); // 重置框值
          basicDrawerFormDs.getField('defaultValue').reset(); // reset整个属性
          break;
        case 'SWITCH':
          basicDrawerFormDs.getField('defaultValue').reset();
          basicDrawerFormDs.current.set('defaultValue', null); // 重置框值
          break;
        case 'UPLOAD':
          basicDrawerFormDs.current.set('bucketName', null);
          basicDrawerFormDs.current.set('directoryName', null); // 重置框值
          break;
        case 'LONG_INPUT':
          basicDrawerFormDs.getField('defaultValue').reset();
          basicDrawerFormDs.current.set('defaultValue', null); // 重置框值
          break;
        case 'LINK':
          basicDrawerFormDs.current.set('linkTitle', null);
          basicDrawerFormDs.current.set('linkUrl', null); // 重置框值
          basicDrawerFormDs.current.set('linkType', null);
          basicDrawerFormDs.current.set('isNewWindow', null);
          break;
        default:
          break;
      }
    }
  }

  @Bind()
  handelMapEdit(record) {
    record.setState('editing', true);
  }

  @Bind()
  handelCancel(record) {
    record.reset();
    record.setState('editing', false);
  }

  /**
   * 渲染默认值类型
   */
  @Bind()
  renderDefaultValue() {
    const { basicDrawerFormDs } = this.props;
    const { componentType = '' } = this.state;
    let type = [];
    let fieldType = 'string';
    // 日期类型设置了transformRequest 导致编辑其他字段传值错误
    basicDrawerFormDs.getField('defaultValue').reset();
    switch (componentType) {
      case 'INPUT':
        type = [
          <TextField name="defaultValue" />,
          // <NumberField name="textMaxLength" />,
          // <NumberField name="textMinLength" />,
        ];
        break;
      case 'INPUT_NUMBER':
        type = [
          // <NumberField name="numberMax" />,
          // <NumberField name="numberMin" />,
          // <NumberField name="numberPrecision" />,
          <NumberField name="defaultValue" nonStrictStep step={1} />,
        ];
        fieldType = 'number';
        break;
      case 'SELECT':
        type = [
          // <Switch name="multipleFlag" />,
          <Lov name="valueSetLov" />,
          <Select name="defaultValue" />,
          <CheckBox name="multipleFlag" />,
        ];
        basicDrawerFormDs.getField('valueSetLov').set('lovCode', 'HPFM.LOV.LOV_DETAIL_CODE.ORG');
        basicDrawerFormDs.getField('valueSetLov').set('lovQueryAxiosConfig', {
          url: isTenantRoleLevel()
            ? `/hpfm/v1/${getCurrentOrganizationId()}/lov-headers`
            : `/hpfm/v1/lov-headers`,
          method: 'GET',
        });
        basicDrawerFormDs.getField('valueSetLov').set('lovPara', {
          enabledFlag: 1,
        });
        basicDrawerFormDs
          .getField('defaultValue')
          .set(
            'lookupCode',
            basicDrawerFormDs.current && basicDrawerFormDs.current.toData().valueSet
          );
        // basicDrawerFormDs.getField('valueSetLov').set('required', true);
        break;
      case 'LOV':
        type = [
          // <Switch name="multipleFlag" />,
          <Lov
            name="valueSetLov"
            // showHelp="tooltip"
            // help={
            //   lovTips || (basicDrawerFormDs.current && basicDrawerFormDs.current.toData().lovTips)
            // }
          />,
          <Lov name="defaultValueLov" />,
          <CheckBox name="multipleFlag" />,
        ];
        basicDrawerFormDs.getField('valueSetLov').set('lovCode', 'HPFM.LOV.VIEW.ORG');
        basicDrawerFormDs.getField('valueSetLov').set('lovQueryAxiosConfig', {
          url: isTenantRoleLevel()
            ? `/hpfm/v1/${getCurrentOrganizationId()}/lov-view-headers`
            : `/hpfm/v1/lov-view-headers`,
          method: 'GET',
        });
        basicDrawerFormDs
          .getField('defaultValueLov')
          .set(
            'lovCode',
            basicDrawerFormDs.current && basicDrawerFormDs.current.toData().sourceCode
          );
        basicDrawerFormDs.getField('defaultValueLov').set('type', 'object');
        break;
      case 'DATE_PICKER':
        type = [<Select name="dateFormat" />, <DatePicker name="defaultValue" />];
        // 默认设置date,以及format格式，transformRequest格式
        fieldType = 'date';
        basicDrawerFormDs.getField('defaultValue').set('format', getDateFormat());
        basicDrawerFormDs
          .getField('defaultValue')
          .set('transformRequest', (value) => value && moment(value).format(DEFAULT_DATE_FORMAT));
        break;
      case 'SWITCH':
        type = [<Switch name="defaultValue" />];
        fieldType = 'boolean';
        basicDrawerFormDs.getField('defaultValue').set('trueValue', 1);
        basicDrawerFormDs.getField('defaultValue').set('falseValue', 0);
        basicDrawerFormDs.getField('defaultValue').set('defaultValue', 0);
        break;
      case 'UPLOAD':
        type = [<TextField name="bucketName" />, <TextField name="directoryName" />];
        break;
      case 'LINK':
        type = [
          <IntlField name="linkTitle" />,
          <TextField name="linkUrl" />,
          <Select name="linkType" />,
          // <CheckBox name="isNewWindow" />,
        ];
        break;
      default:
        type = [<TextField name="defaultValue" />];
        break;
    }
    basicDrawerFormDs.getField('defaultValue').set('type', fieldType);
    return type;
  }

  @Bind()
  renderBasicChild() {
    const {
      editor = false,
      basicDrawerLovMapDs,
      basicDrawerFormDs,
      basicDrawerLovParamDs,
      mapDs,
      specialDs,
      splitFlag,
      editAble,
    } = this.props;
    const { activityTabKey } = this.state;
    const buttons = editAble ? ['add', ['delete', { color: 'red' }]] : [];
    // 值集参数关系columns
    const lovParamListColumns = [
      {
        name: 'paramName',
        width: 200,
        tooltip: 'overflow',
        editor: (record) => record.getState('editing') || record.status === 'add',
      },
      {
        name: 'paramType',
        width: 150,
        tooltip: 'overflow',
        editor: (record) => {
          if (record.getState('editing') || record.status === 'add') {
            return <Select name="paramType" clearButton={false} />;
          } else {
            return false;
          }
        },
      },
      {
        name: 'paramValue',
        width: 250,
        tooltip: 'overflow',
        header: intl.get('ssrc.priceLibDimension.model.dimension.paramValue').d('参数值'),
        renderer: ({ record }) => {
          if (record.getState('editing') || record.status === 'add') {
            if (record.get('paramType') === 'DIMENSION') {
              return (
                <Lov
                  record={record}
                  name="paramValueLOV"
                  clearButton={false}
                  style={{ width: '100%' }}
                />
              );
            } else if (record.get('paramType') === 'FIXED_VALUE') {
              return <TextField record={record} name="paramValue" style={{ width: '100%' }} />;
            }
          } else if (record.get('paramType') === 'DIMENSION') {
            return record.get('paramValueMeaning');
          } else if (record.get('paramType') === 'FIXED_VALUE') {
            return record.get('paramValue');
          }
        },
      },
      {
        name: 'applyQueryFlag',
        width: 150,
        editor: (record) => record.getState('editing') || record.status === 'add',
      },
      editAble && {
        name: 'action',
        header: intl.get('hzero.common.action').d('操作'),
        width: 100,
        renderer: ({ record }) => {
          return record.getState('editing') ? (
            <a onClick={() => this.handelCancel(record)}>
              {intl.get('hzero.common.view.button.cancel').d('取消')}
            </a>
          ) : record.status === 'add' ? (
            <a onClick={() => basicDrawerLovParamDs.remove(record)}>
              {intl.get('hzero.common.delete').d('清除')}
            </a>
          ) : (
            <a disabled={!editAble} onClick={() => this.handelMapEdit(record)}>
              {intl.get('hzero.common.button.edit').d('编辑')}
            </a>
          );
        },
      },
    ];

    // 值集参数映射columns
    const lovMappingListColumns = [
      {
        name: 'sourceFromField',
        width: 200,
        tooltip: 'overflow',
        editor: (record) => record.getState('editing') || record.status === 'add',
      },
      {
        name: 'sourceFromFieldName',
        width: 250,
        tooltip: 'overflow',
        header: intl.get('ssrc.priceLibDimension.model.dimension.paramValue').d('参数值'),
        renderer: ({ record }) => {
          if (record.getState('editing') || record.status === 'add') {
            return (
              <Lov
                record={record}
                name="paramValueLOV"
                clearButton={false}
                style={{ width: '100%' }}
              />
            );
          } else {
            return record.get('sourceFromFieldName');
          }
        },
      },
      {
        name: 'targetFieldCode',
        width: 250,
        tooltip: 'overflow',
        // header: intl.get('ssrc.priceLibDimension.model.dimension.paramValue1').d('映射目标字段'),
        renderer: ({ record }) => {
          if (record.getState('editing') || record.status === 'add') {
            return (
              <Lov
                record={record}
                name="targetValueLOV"
                clearButton={false}
                style={{ width: '100%' }}
              />
            );
          } else {
            return record.get('targetFieldName');
          }
        },
      },
      editAble && {
        name: 'action',
        header: intl.get('hzero.common.action').d('操作'),
        width: 100,
        renderer: ({ record }) => {
          return record.getState('editing') ? (
            <a onClick={() => this.handelCancel(record)}>
              {intl.get('hzero.common.view.button.cancel').d('取消')}
            </a>
          ) : record.status === 'add' ? (
            <a onClick={() => basicDrawerLovMapDs.remove(record)}>
              {intl.get('hzero.common.delete').d('清除')}
            </a>
          ) : (
            <a disabled={!editAble} onClick={() => this.handelMapEdit(record)}>
              {intl.get('hzero.common.button.edit').d('编辑')}
            </a>
          );
        },
      },
    ];
    return (
      <React.Fragment>
        <Form disabled={!editAble} labelLayout="float" dataSet={basicDrawerFormDs} columns={2}>
          <TextField name="fieldCode" disabled={!editor} />
          <IntlField
            name="fieldName"
            modalProps={{ title: intl.get(`sodr.common.view.descript`).d('描述') }}
          />
          <CheckBox name="enabledFlag" />
          <CheckBox name="displayFlag" />
          <CheckBox name="requiredFlag" />
          <CheckBox name="editorFlag" />
          {splitFlag && [<CheckBox name="splitDisplayFlag" />, <CheckBox name="splitEditorFlag" />]}
          <CheckBox name="searchFlag" />
          <CheckBox name="importFlag" />
          <NumberField name="fieldWidth" newLine />
          <NumberField name="fieldLocation" />
          <Select name="componentType" onChange={this.changeComponentType} clearButton={false} />
          {this.renderDefaultValue()}
          {editAble && [
            <Select newLine name="displayCamp" />,
            <Select name="editCamp" />,
            <Lov name="editAuthorityId" />,
          ]}
        </Form>
        <Tabs
          activeKey={activityTabKey}
          onChange={this.changeTabs}
          style={{ marginTop: '16px' }}
          animated={false}
        >
          <TabPane tab={intl.get('sodr.feedback.view.tab.map').d('映射关系')} key="map">
            <Table disabled={!editAble} dataSet={mapDs}>
              <Column name="sourceFrom" width={200} />
              <Column name="sourceField" />
              <Column name="sourceName" />
            </Table>
          </TabPane>
          <TabPane tab={intl.get('sodr.feedback.view.tab.special').d('特殊逻辑')} key="special">
            <Table disabled={!editAble} dataSet={specialDs} buttons={buttons}>
              <Column
                name="priorityNumber"
                editor={(record) => record.getState('editing') || record.status === 'add'}
              />
              <Column
                name="triggerConditions"
                editor={(record) => record.getState('editing') || record.status === 'add'}
              />
              <Column
                name="funcitonName"
                editor={(record) =>
                  (record.getState('editing') || record.status === 'add') &&
                  ['SYNCHRONOUS', 'TIMING'].includes(record.get('triggerConditions'))
                }
              />
              {!isTenantRoleLevel() && (
                <Column
                  name="funcitonDesc"
                  // editor={record => record.getState('editing') || record.status === 'add'}
                  renderer={({ record }) => {
                    const sqlModalVisible = record.getState('sqlModalVisible');
                    const modalProps = {
                      width: 700,
                      visible: sqlModalVisible,
                      closable: false,
                      onCancel: () => {
                        record.setState({ sqlModalVisible: false });
                      },
                      onOk: () => {
                        record.set({ funcitonDesc: this.textAreaRef.current?.value });
                        record.setState({ sqlModalVisible: false });
                      },
                    };
                    return (
                      <Fragment>
                        <a
                          disabled={!(record.get('triggerConditions') === 'REAL_TIME_QUERY')}
                          onClick={() => record.setState({ sqlModalVisible: true })}
                        >
                          {intl.get('sodr.feedback.model.feedback.funcitonDesc').d('自定义sql')}
                        </a>
                        {sqlModalVisible && (
                          <Modal {...modalProps}>
                            <TextArea
                              disabled={!(record.getState('editing') || record.status === 'add')}
                              ref={this.textAreaRef}
                              defaultValue={record.get('funcitonDesc')}
                              placeholder={intl
                                .get(`sodr.feedback.model.feedback.f_placeholder`)
                                .d('sql信息编辑')}
                              style={{ width: '100%' }}
                              rows={20}
                              autoFocus
                              resize="vertical"
                            />
                          </Modal>
                        )}
                      </Fragment>
                    );
                  }}
                />
              )}
              <Column
                name="action"
                header={intl.get('hzero.common.action').d('操作')}
                width={100}
                renderer={({ record }) =>
                  record.getState('editing') ? (
                    <a onClick={() => this.handelCancel(record)}>
                      {intl.get('hzero.common.view.button.cancel').d('取消')}
                    </a>
                  ) : record.status === 'add' ? (
                    <a onClick={() => specialDs.remove(record)}>
                      {intl.get('hzero.common.delete').d('清除')}
                    </a>
                  ) : (
                    <a disabled={!editAble} onClick={() => this.handelMapEdit(record)}>
                      {intl.get('hzero.common.button.edit').d('编辑')}
                    </a>
                  )
                }
              />
            </Table>
          </TabPane>
          {basicDrawerFormDs.current &&
            (basicDrawerFormDs.current.get('componentType') === 'LOV' ||
              basicDrawerFormDs.current.get('componentType') === 'SELECT') && (
              <TabPane
                tab={intl.get('ssrc.priceLibDimension.view.tab.lovParamter').d('值集参数')}
                key="lovParamter"
              >
                <Table
                  className={style['draw-table']}
                  dataSet={basicDrawerLovParamDs}
                  columns={lovParamListColumns}
                  buttons={buttons}
                />
              </TabPane>
            )}
          {basicDrawerFormDs.current && basicDrawerFormDs.current.get('componentType') === 'LOV' && (
            <TabPane
              tab={intl.get('sodr.feedback.view.tab.map.lovMappings').d('关联字段设置')}
              key="lovMappings"
            >
              <Alert
                className={style['order-top-title']}
                message={intl
                  .get(`sodr.feedback.view.setRelatedField.tip`)
                  .d('请在左侧选择值集视图已有字段，将值赋值至【映射目标字段】')}
                type="info"
                showIcon
              />
              <Table
                dataSet={basicDrawerLovMapDs}
                columns={lovMappingListColumns}
                buttons={buttons}
              />
            </TabPane>
          )}
        </Tabs>
      </React.Fragment>
    );
  }

  render() {
    const { visible = true, onOk, saveLoading } = this.props;
    return (
      <Sidebar
        closable
        destroyOnClose
        width={850}
        title={intl.get('sodr.feedback.view.title.filed.title').d('字段配置')}
        visible={visible}
        onOk={onOk}
        onCancel={this.handleCancelDrawer}
        confirmLoading={saveLoading}
        maskStyle={{ zIndex: 997 }}
        wrapClassName={style['c7n-modal-price-warp']}
      >
        {this.renderBasicChild()}
      </Sidebar>
    );
  }
}

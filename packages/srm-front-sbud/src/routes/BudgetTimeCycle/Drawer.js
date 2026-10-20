import React from 'react';

import {
  Form,
  Lov,
  TextField,
  Select,
  MonthPicker,
  DatePicker,
  YearPicker,
  Switch,
  NumberField,
  Button,
  SelectBox,
} from 'choerodon-ui/pro';
import { Modal } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import { isFunction } from 'lodash';
import { getFieldsConfig } from '@/utils/utils';

import intl from 'utils/intl';

import style from './index.less';

const { Sidebar } = Modal;
const { Option } = SelectBox;

export default class Drawer extends React.Component {
  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
    this.state = {
      type: 'INPUT',
    };
  }

  componentDidMount() {
    this.props.onRef(this);
  }

  /**
   * 新增
   * @memberof PriceLibDimension
   */
  @Bind()
  handleAdd(ds) {
    const record = ds.create({}, 0);
    record.setState('_status', 'create');
  }

  /**
   * 编辑
   * record 行信息
   * @memberof PriceLibDimension
   */
  @Bind()
  handelEdit(record) {
    record.setState('_status', 'update');
  }

  /**
   * 取消
   * record 行信息
   * @memberof PriceLibDimension
   */
  @Bind()
  handleCancel(record) {
    record.reset();
    record.setState('_status', '');
  }

  // 按钮
  @Bind()
  renderButtons(ds) {
    return [
      <Button icon="playlist_add" onClick={() => this.handleAdd(ds)} key="add">
        {intl.get('hzero.common.button.add').d('新增')}
      </Button>,
      ['delete', { color: 'red' }],
    ];
  }

  /**
   * 关闭弹框
   */
  @Bind()
  handleCancelDrawer() {
    this.setState({
      type: 'INPUT',
    });
    this.props.onCancel();
  }

  @Bind()
  changeType(value) {
    // const { basicDrawerFormDs } = this.props;
    this.setState({
      type: value,
    });
    // basicDrawerFormDs.getField('lovCodeObj').reset();
    // basicDrawerFormDs.getField('multipleFlag').reset();

    // basicDrawerFormDs.current.set('lovCodeObj', null);
    // basicDrawerFormDs.current.set('multipleFlag', null);
  }

  @Bind()
  renderFeilds(item, ds) {
    const { componentType } = item;
    const { gridField } = getFieldsConfig(item);
    const { name, ...gridOthers } = gridField;
    ds.addField(name, gridOthers);
    switch (componentType) {
      case 'LOV':
        return <Lov name={name} />;
      case 'SELECT':
        return <Select name={name} />;
      default:
        break;
    }
  }

  @Bind()
  renderDynamicComponents() {
    const { basicDrawerFormDs, dynamicColumns } = this.props;
    const dynamicComponents = [];

    dynamicColumns.forEach((item) => {
      dynamicComponents.push(this.renderFeilds(item, basicDrawerFormDs));
    });
    return dynamicComponents;
  }

  @Bind()
  renderRule(type) {
    let comps = [];
    switch (type) {
      case '1':
        comps = [
          <div name="rule">
            <SelectBox vertical name="ruleCode">
              <Option value="0">{intl.get('sbud.budgetTimeCycle.view.year').d('自然年')}</Option>
              <Option value="1">
                {intl.get('sbud.budgetTimeCycle.view.everyYear').d('每年')}
                <NumberField style={{ width: '50px' }} name="month" step={1} />
                {intl.get('sbud.budgetTimeCycle.view.mm').d('月')}
                <NumberField style={{ width: '50px' }} name="day" step={1} />
                {intl.get('sbud.budgetTimeCycle.view.day').d('日')}
                <NumberField style={{ width: '50px' }} name="hour" step={1} />
                {intl.get('sbud.budgetTimeCycle.view.hour').d('时')}
              </Option>
              <Option value="2">
                {intl.get('sbud.budgetTimeCycle.view.everyYear').d('每年')}
                <NumberField style={{ width: '50px' }} name="month" step={1} />
                {intl.get('sbud.budgetTimeCycle.view.mmd').d('月第')}
                <NumberField style={{ width: '50px' }} name="week" step={1} />
                {intl.get('sbud.budgetTimeCycle.view.times').d('个')}
                {intl.get('sbud.budgetTimeCycle.view.week').d('周')}
                <NumberField style={{ width: '50px' }} name="weekDay" step={1} />
                <NumberField style={{ width: '50px' }} name="hour" step={1} />
                {intl.get('sbud.budgetTimeCycle.view.hour').d('时')}
              </Option>
              <Option value="3">{intl.get('sbud.budgetTimeCycle.view.custom').d('自定义')}</Option>
            </SelectBox>
          </div>,
        ];
        break;
      case '2':
        comps = [
          <div name="rule">
            <SelectBox vertical name="ruleCode">
              <Option value="0">{intl.get('sbud.budgetTimeCycle.view.month').d('自然月')}</Option>
              <Option value="1">
                {intl.get('sbud.budgetTimeCycle.view.everyMon').d('每月')}
                <NumberField style={{ width: '50px' }} name="day" step={1} />
                {intl.get('sbud.budgetTimeCycle.view.day').d('日')}
                <NumberField style={{ width: '50px' }} name="hour" step={1} />
                {intl.get('sbud.budgetTimeCycle.view.hour').d('时')}
              </Option>
              <Option value="2">
                {intl.get('sbud.budgetTimeCycle.view.everyMonD').d('每月第')}
                <NumberField style={{ width: '50px' }} name="week" step={1} />
                {intl.get('sbud.budgetTimeCycle.view.times').d('个')}
                {intl.get('sbud.budgetTimeCycle.view.week').d('周')}
                <NumberField style={{ width: '50px' }} name="weekDay" step={1} />
                <NumberField style={{ width: '50px' }} name="hour" step={1} />
                {intl.get('sbud.budgetTimeCycle.view.hour').d('时')}
              </Option>
              <Option value="3">{intl.get('sbud.budgetTimeCycle.view.custom').d('自定义')}</Option>
            </SelectBox>
          </div>,
        ];
        break;
      case '3':
        comps = [
          <div name="rule">
            <SelectBox vertical name="ruleCode">
              <Option value="0">
                {intl.get('sbud.budgetTimeCycle.view.season').d('自然季度')}
              </Option>
              <Option value="1">
                {intl.get('sbud.budgetTimeCycle.view.everySeason').d('每季度第')}
                <NumberField style={{ width: '50px' }} name="month" step={1} />
                {intl.get('sbud.budgetTimeCycle.view.mm').d('月')}
                <NumberField style={{ width: '50px' }} name="day" step={1} />
                {intl.get('sbud.budgetTimeCycle.view.day').d('日')}
                <NumberField style={{ width: '50px' }} name="hour" step={1} />
                {intl.get('sbud.budgetTimeCycle.view.hour').d('时')}
              </Option>
              <Option value="2">
                {intl.get('sbud.budgetTimeCycle.view.everySeason').d('每季度第')}
                <NumberField style={{ width: '50px' }} name="month" step={1} />
                {intl.get('sbud.budgetTimeCycle.view.mmd').d('月第')}
                <NumberField style={{ width: '50px' }} name="week" step={1} />
                {intl.get('sbud.budgetTimeCycle.view.times').d('个')}
                <NumberField style={{ width: '50px' }} name="hour" step={1} />
                {intl.get('sbud.budgetTimeCycle.view.week').d('周')}
                <NumberField style={{ width: '50px' }} name="weekDay" step={1} />
                {intl.get('sbud.budgetTimeCycle.view.hour').d('时')}
              </Option>
              <Option value="3">{intl.get('sbud.budgetTimeCycle.view.custom').d('自定义')}</Option>
            </SelectBox>
          </div>,
        ];
        break;

      default:
        comps = [
          <div name="rule">
            {/* <SelectBox vertical name="ruleCode">
              <Option value="0">Jack</Option>
              <Option value="1">
                <TextField name="budgetItemCode" disabled={!editor} />
              </Option>
              <Option value="2">Wu</Option>
              <Option value="3">{intl.get('sbud.budgetTimeCycle.view.custom').d('自定义')}</Option>
            </SelectBox> */}
          </div>,
        ];
        break;
    }

    return comps;
  }

  @Bind()
  renderTimePicker(type) {
    let comps = [];
    switch (type) {
      case '1':
        comps = [<YearPicker name="startDate" />, <YearPicker name="endDate" />];
        break;
      case '2':
        comps = [<MonthPicker name="startDate" />, <MonthPicker name="endDate" />];
        break;
      case '3':
        comps = [<DatePicker name="startDate" />, <DatePicker name="endDate" />];
        break;

      default:
        comps = [];
        break;
    }

    return comps;
  }

  /**
   * 渲染基础维度弹框内容
   */
  @Bind()
  renderBasicChild() {
    const { editor = false, basicDrawerFormDs } = this.props;
    const { type } = this.state;
    return (
      <React.Fragment>
        <Form dataSet={basicDrawerFormDs} columns={1} className={style['c7n-form-label-required']}>
          <TextField name="periodSetNum" disabled={!editor} />
          <TextField name="periodSetName" disabled={!editor} />
          <Select name="typeCode" onChange={this.changeType} clearButton={false} />
          {this.renderRule(type)}
          {this.renderDynamicComponents()}
          {this.renderTimePicker(type)}

          <Switch name="enabledFlag" />
        </Form>
      </React.Fragment>
    );
  }

  render() {
    const { visible = true, onOk, saveLoading } = this.props;
    return (
      <Sidebar
        closable
        destroyOnClose
        width={550}
        title={intl.get('sbud.budgetTimeCycle.view.title.dimensionConfiguration').d('维度配置')}
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

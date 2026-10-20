import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Form, Modal, Tooltip, Row, Col, Radio } from 'hzero-ui';
import { TimePicker, Icon, CheckBox, Picture } from 'choerodon-ui/pro';
import { Popover } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import { isNil } from 'lodash';
import intl from 'utils/intl';
import { filterNullValueObject } from 'utils/utils';
import RowLayoutImg from '@/assets/rowLayout.png';
import ColumnLayoutImg from '@/assets/columnLayout.png';
import InOpenImg from '@/assets/inOpen.png';
import PassInImg from '@/assets/passIn.png';
import './style/index.less';

const RadioGroup = Radio.Group;
@Form.create({ fieldNameProp: null })
export default class TodoRemind extends PureComponent {
  state = {
    actions: this.sortObj(this.props.approvalActionSeqDataMap),
    currentTarget: {},
  };

  /**
   * 组件属性定义
   */
  static propTypes = {
    anchor: PropTypes.oneOf(['left', 'right', 'top', 'bottom']),
    title: PropTypes.string,
    visible: PropTypes.bool,
    onOk: PropTypes.func,
    onCancel: PropTypes.func,
  };

  /**
   * 组件属性默认值设置
   */
  static defaultProps = {
    anchor: 'right',
    title: '',
    visible: false,
    onOk: (e) => e,
    onCancel: (e) => e,
  };

  /**
   * 确定操作
   */
  @Bind()
  saveBtn() {
    const { form, onOk } = this.props;
    if (onOk) {
      let validateStatus = true;
      form.validateFields((err) => {
        if (err) {
          validateStatus = false;
        }
      });
      if (validateStatus) {
        // 表单校验通过
        const values = form.getFieldsValue();
        const newValues = JSON.parse(JSON.stringify(values));
        Object.keys(values).forEach((key) => {
          if (key === 'remindTime') {
            if (isNil(values[key])) {
              newValues[key] = 8;
            } else {
              newValues[key] = typeof values[key] === 'number' ? values[key] : values[key].get('h');
            }
          }
        });
        const { actions } = this.state;
        const approvalActionSeqDataMap = {};
        actions.map(({ key, id }) => {
          approvalActionSeqDataMap[key] = id;
          return id;
        });
        newValues.approvalActionSeqDataMap = approvalActionSeqDataMap;
        const params = filterNullValueObject(newValues);
        onOk(params);
      }
    }
  }

  // 时间过滤
  filterTime(currentDate) {
    const hour = currentDate.get('h');
    const minute = currentDate.get('m');
    const second = currentDate.get('s');
    if (hour === 0 && minute === 0 && second === 0) {
      return false;
    } else {
      return true;
    }
  }

  @Bind()
  checkTimeValue(rule, value, callback) {
    const { form } = this.props;
    const remindFlag = form.getFieldValue('remindFlag');
    if (isNil(value) && remindFlag === 1) {
      callback(
        intl.get('hzero.common.validation.notNull', {
          name: intl.get('hwfp.common.model.remind.everyDay').d('提醒时间(每天)'),
        })
      );
    } else if (value.get('h') === 0) {
      callback(intl.get('hwfp.common.remind.zeroInfo').d('不支持00:00:00'));
    } else if (value.get('m') !== 0 || value.get('s') !== 0) {
      callback(intl.get('hwfp.common.remind.wholeInfo').d('仅支持整点'));
    } else {
      callback();
    }
  }

  @Bind
  dragStart(key) {
    this.setState({ currentTarget: key });
  }

  @Bind
  drop({ key, text }) {
    const { actions, currentTarget } = this.state;
    const newActions = actions.map((action) => {
      if (action.key === key) {
        return { ...action, ...currentTarget };
      }
      if (action.key === currentTarget.key) {
        return { ...action, key, text };
      }
      return action;
    });
    this.setState({ actions: newActions });
  }

  @Bind
  dragOver(e) {
    e.stopPropagation();
    e.preventDefault();
  }

  @Bind
  sortObj(params = { Approved: '3', More: '1', Rejected: '2' }) {
    const result = [];
    const values = Object.values(params).sort();
    for (let i = 0; i <= values.length; i++) {
      if (params.Approved === values[i]) {
        result.push({
          id: i + 1,
          key: 'Approved',
          text: intl.get('hwfm.common.title.approve').d('审批通过'),
        });
      }
      if (params.More === values[i]) {
        result.push({
          id: i + 1,
          key: 'More',
          text: intl.get('hzero.common.button.option').d('更多'),
        });
      }
      if (params.Rejected === values[i]) {
        result.push({
          id: i + 1,
          key: 'Rejected',
          text: intl.get('hwfp.task.view.rejected').d('审批拒绝'),
        });
      }
    }
    return result;
  }

  getPopoverContent = (code) => {
    let srcImg = '';
    if (code === 'row') {
      srcImg = RowLayoutImg;
    } else if (code === 'column') {
      srcImg = ColumnLayoutImg;
    } else if (code === 'inOpen') {
      srcImg = InOpenImg;
    } else if (code === 'passIn') {
      srcImg = PassInImg;
    }
    return (
      <div style={{ height: '100px', width: '200px' }}>
        <Picture border src={srcImg} width={200} height={100} objectFit="cover" />
      </div>
    );
  };

  render() {
    const {
      anchor,
      title,
      visible,
      form,
      onCancel,
      remindTime,
      remindFlag,
      approvalFormMergeFlag,
      autoApprovalFilterFlag,
      noAssigneeApprovalFilterFlag,
      msgFormMenuDisplayFlag = 0,
      multiApprovalFilterFlag,
    } = this.props;
    const { getFieldDecorator } = form;
    const { actions } = this.state;
    const radioStyle = {
      display: 'block',
      height: '30px',
      lineHeight: '30px',
    };
    return (
      <Modal
        title={<span style={{ fontWeight: '600' }}>{title}</span>}
        width={520}
        wrapClassName={`ant-modal-sidebar-${anchor}`}
        transitionName={`move-${anchor}`}
        visible={visible}
        // confirmLoading={saving}
        onOk={this.saveBtn}
        okText={intl.get('hzero.common.button.ok').d('确定')}
        onCancel={onCancel}
        cancelText={intl.get('hzero.common.button.cancel').d('取消')}
        destroyOnClose
        zIndex={999}
      >
        <Form id="form-setting" labelLayout="float">
          <Row>
            <Col span={24} className="sub-title">
              <span className="green-dot" />
              <span>{intl.get('hwfp.common.model.onTimeRemind.config').d('消息提醒配置')}</span>
            </Col>
          </Row>
          <Form.Item>
            {getFieldDecorator('remindFlag', {
              initialValue: remindFlag ?? 0,
            })(<></>)}
            <CheckBox
              checked={form.getFieldValue('remindFlag')}
              onChange={(value) => {
                form.setFieldsValue({ remindFlag: value ? 1 : 0 });
              }}
            >
              {intl.get('hwfp.common.model.todoRemind.newTitle').d('待办定时提醒（SRM消息通知）')}
            </CheckBox>
          </Form.Item>
          <Form.Item label={intl.get('hwfp.common.model.remind.everyDay').d('提醒时间(每天)')}>
            {getFieldDecorator('remindTime', {
              initialValue: remindTime,
              rules: [
                {
                  required: form.getFieldValue('remindFlag'),
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hwfp.common.model.remind.everyDay').d('提醒时间(每天)'),
                  }),
                },
                {
                  validator: this.checkTimeValue,
                },
              ],
            })(
              <TimePicker
                step={{ minute: 60, second: 60 }}
                disabled={!form.getFieldValue('remindFlag')}
                filter={this.filterTime}
              />
            )}
          </Form.Item>
          <Row>
            <Col span={24} className="sub-title" />
          </Row>
          <Form.Item
            label={intl
              .get('hwfp.common.model.msgFormMenuDisplayFlag.newTitle')
              .d('消息推送外部系统，跳转SRM展示表单')}
          >
            {getFieldDecorator('msgFormMenuDisplayFlag', {
              initialValue: msgFormMenuDisplayFlag === 1 ? 1 : 0,
            })(
              <RadioGroup
                style={{
                  display: 'block',
                  height: '30px',
                  lineHeight: '30px',
                }}
                value={form.getFieldValue('msgFormMenuDisplayFlag')}
              >
                <Radio style={radioStyle} value={1}>
                  {intl
                    .get('hwfp.common.model.msgFormMenuDisplayFlag.inOpen')
                    .d('进入系统，打开审批明细页面')}
                  <Popover
                    placement="topRight"
                    content={this.getPopoverContent('inOpen')}
                    trigger="hover"
                  >
                    <Icon
                      type="help"
                      style={{
                        fontSize: '14px',
                        lineHeight: '14px',
                        marginLeft: '8px',
                        color: '#868D9C',
                      }}
                    />
                  </Popover>
                </Radio>
                <Radio style={radioStyle} value={0}>
                  {intl
                    .get('hwfp.common.model.msgFormMenuDisplayFlag.passIn')
                    .d('仅审批明细页面，审批通过进入系统')}
                  <Popover
                    placement="topRight"
                    content={this.getPopoverContent('passIn')}
                    trigger="hover"
                  >
                    <Icon
                      type="help"
                      style={{
                        fontSize: '14px',
                        lineHeight: '14px',
                        marginLeft: '8px',
                        color: '#868D9C',
                      }}
                    />
                  </Popover>
                </Radio>
              </RadioGroup>
            )}
          </Form.Item>
          <div style={{ marginBottom: 18 }} />
          <Row>
            <Col span={24} className="sub-title mt-32">
              <span className="green-dot" />
              <span>
                {intl.get('hwfp.common.model.layoutSetting.newTitle').d('审批工作台样式配置')}
              </span>
            </Col>
          </Row>
          <Form.Item
            label={
              <Tooltip
                title={intl
                  .get('hwfp.common.model.approvalFormMergeMessage')
                  .d('配置后审批工作台界面的审批表单和审批记录会合并上下拼接展示')}
              >
                {intl
                  .get('hwfp.common.model.approvalFormMergeFlag.newTitle')
                  .d('审批表单与审批记录布局选择')}
              </Tooltip>
            }
          >
            {getFieldDecorator('approvalFormMergeFlag', {
              initialValue: approvalFormMergeFlag === 1 ? 1 : 0,
            })(
              <RadioGroup
                style={{
                  display: 'block',
                  height: '30px',
                  lineHeight: '30px',
                }}
                value={form.getFieldValue('approvalFormMergeFlag')}
              >
                <Radio style={radioStyle} value={0}>
                  {intl
                    .get('hwfp.common.model.approvalFormMergeFlag.row')
                    .d('左右布局，Tab切换查看')}
                  <Popover
                    placement="topRight"
                    content={this.getPopoverContent('row')}
                    trigger="hover"
                  >
                    <Icon
                      type="help"
                      style={{
                        fontSize: '14px',
                        lineHeight: '14px',
                        marginLeft: '8px',
                        color: '#868D9C',
                      }}
                    />
                  </Popover>
                </Radio>
                <Radio style={radioStyle} value={1}>
                  {intl
                    .get('hwfp.common.model.approvalFormMergeFlag.column')
                    .d('上下布局，鼠标滚动查看')}
                  <Popover
                    placement="topRight"
                    content={this.getPopoverContent('column')}
                    trigger="hover"
                  >
                    <Icon
                      type="help"
                      style={{
                        fontSize: '14px',
                        lineHeight: '14px',
                        marginLeft: '8px',
                        color: '#868D9C',
                      }}
                    />
                  </Popover>
                </Radio>
              </RadioGroup>
            )}
          </Form.Item>
          <div style={{ marginBottom: 48 }} />
          <Form.Item
            label={intl
              .get('hwfp.common.modal.dragContentSort.newTitle')
              .d('审批按钮排序，拖动内容区域排序')}
          >
            <div className="buttons">
              {actions.map(({ id, text, key }) => (
                <div
                  className="custom-buttom"
                  draggable
                  onDragStart={() => this.dragStart({ text, key })}
                  onDrop={() => this.drop({ text, key })}
                  onDragOver={this.dragOver}
                >
                  <span>
                    <Icon
                      type="more_vert"
                      style={{ width: '4px', lineHeight: '23px', color: '#868D9C' }}
                    />
                    <Icon type="more_vert" style={{ lineHeight: '23px', color: '#868D9C' }} />
                    {text}
                  </span>
                  <span>{id}</span>
                </div>
              ))}
            </div>
          </Form.Item>
          <Row>
            <Col span={24} className="sub-title mt-32">
              <span className="green-dot" />
              <span>{intl.get('hwfp.common.modal.reportSetting').d('审批记录设置')}</span>
            </Col>
          </Row>
          <Form.Item>
            {getFieldDecorator('autoApprovalFilterFlag', {
              initialValue: autoApprovalFilterFlag,
            })(<></>)}
            <CheckBox
              checked={form.getFieldValue('autoApprovalFilterFlag')}
              onChange={(value) => {
                form.setFieldsValue({ autoApprovalFilterFlag: value ? 1 : 0 });
              }}
            >
              {intl.get('hwfp.common.filter.auto').d('过滤自行审批或已审批自动同意')}
            </CheckBox>
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('noAssigneeApprovalFilterFlag', {
              initialValue: noAssigneeApprovalFilterFlag ?? 1,
            })(<></>)}
            <CheckBox
              checked={form.getFieldValue('noAssigneeApprovalFilterFlag')}
              onChange={(value) => {
                form.setFieldsValue({ noAssigneeApprovalFilterFlag: value ? 1 : 0 });
              }}
            >
              {intl.get('hwfp.common.filtering.auto').d('过滤无审批人自动同意')}
            </CheckBox>
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('multiApprovalFilterFlag', {
              initialValue: multiApprovalFilterFlag ?? 0,
            })(<></>)}
            <CheckBox
              checked={form.getFieldValue('multiApprovalFilterFlag')}
              onChange={(value) => {
                form.setFieldsValue({ multiApprovalFilterFlag: value ? 1 : 0 });
              }}
            >
              {intl
                .get('hwfp.common.filtering.multiApprovalFilterFlag')
                .d('过滤会签中未实际参与的审批人')}
            </CheckBox>
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}

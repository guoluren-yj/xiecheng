import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Modal, Form, Input, Select, DatePicker, Button } from 'hzero-ui';
import { isUndefined, startsWith } from 'lodash';
import { Bind } from 'lodash-decorators';
import moment from 'moment';
import intl from 'utils/intl';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import notification from 'utils/notification';

/**
 * 日历定义-数据修改滑窗(抽屉)
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {string} anchor - 抽屉滑动位置
 * @reactProps {string} title - 抽屉标题
 * @reactProps {boolean} visible - 抽屉是否可见
 * @reactProps {Function} onOk - 抽屉确定操作
 * @reactProps {Object} form - 表单对象
 * @reactProps {Object} itemData - 操作对象
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class Drawer extends PureComponent {
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
   * Drawer Save
   */
  @Bind()
  saveOption() {
    const { form, onOk, targetItem } = this.props;
    if (onOk) {
      form.validateFields((err, values) => {
        if (!err) {
          // 校验通过，进行保存操作
          const { dateRange, ...others } = values;
          const endDate = dateRange[1] ? moment(dateRange[1]).format(DATETIME_MAX) : undefined;
          const startDate = dateRange[0] ? moment(dateRange[0]).format(DATETIME_MIN) : undefined;
          const sourceDate = targetItem.calendar;
          if (sourceDate.isBefore(endDate, 'second') && sourceDate.isAfter(startDate, 'second')) {
            onOk({
              ...targetItem,
              ...others,
              startDate,
              endDate: moment(dateRange[1]).format(DATETIME_MIN),
            });
          } else {
            notification.warning({
              message: intl
                .get('smdm.calendar.view.message.not.include')
                .d('日期范围未包含当前日期'),
            });
          }
        }
      });
    }
  }

  /**
   * Drawer Reset
   */
  @Bind()
  resetOption() {
    this.props.onReset(this.props.targetItem.holidayId);
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      anchor,
      visible,
      title,
      form,
      targetItem,
      onCancel,
      holidayType,
      dateFormat,
      loading,
    } = this.props;
    const { getFieldDecorator } = form;
    const formLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 12 },
    };
    return (
      <Modal
        title={title}
        width={520}
        wrapClassName={`ant-modal-sidebar-${anchor}`}
        transitionName={`move-${anchor}`}
        visible={visible}
        onCancel={onCancel}
        confirmLoading={loading}
        footer={
          <React.Fragment>
            <Button key="save" type="primary" onClick={this.saveOption} loading={loading}>
              {intl.get('hzero.common.button.sure').d('确定')}
            </Button>
            <Button key="cancel" onClick={onCancel}>
              {intl.get('hzero.common.button.cancel').d('取消')}
            </Button>
            <Button
              key="reset"
              onClick={this.resetOption}
              disabled={isUndefined(targetItem.holidayId)}
            >
              {intl.get('hzero.common.status.reset').d('重置')}
            </Button>
          </React.Fragment>
        }
        destroyOnClose
      >
        <Form>
          <Form.Item
            label={intl.get('smdm.calendar.model.calendar.calendarName').d('描述')}
            {...formLayout}
          >
            {getFieldDecorator('calendarName', {
              initialValue: targetItem.calendarName,
            })(<Input disabled />)}
          </Form.Item>
          <Form.Item
            label={intl.get('smdm.calendar.model.calendar.country').d('国家/地区')}
            {...formLayout}
          >
            {getFieldDecorator('countryName', {
              initialValue: targetItem.countryName,
            })(<Input disabled />)}
          </Form.Item>
          <Form.Item
            label={intl.get('smdm.calendar.model.calendar.remark').d('日历说明')}
            {...formLayout}
          >
            {getFieldDecorator('holidayName', {
              initialValue: targetItem.holidayName,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('smdm.calendar.model.calendar.remark').d('日历说明'),
                  }),
                },
                {
                  max: 10,
                  message: intl.get('hzero.common.validation.max', {
                    max: 10,
                  }),
                },
              ],
            })(<Input />)}
          </Form.Item>
          <Form.Item
            label={intl.get('smdm.calendar.model.calendar.holidayType').d('日历类型')}
            {...formLayout}
          >
            {getFieldDecorator('holidayType', {
              initialValue: targetItem.holidayType,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('smdm.calendar.model.calendar.holidayType').d('日历类型'),
                  }),
                },
              ],
            })(
              <Select>
                {holidayType
                  .filter((item) => startsWith(item.value, 'COMPANY'))
                  .map((item) => (
                    <Select.Option key={item.value} value={item.value}>
                      {item.meaning}
                    </Select.Option>
                  ))}
              </Select>
            )}
          </Form.Item>
          <Form.Item
            label={intl.get('smdm.calendar.model.calendar.dateRange').d('选择日期')}
            {...formLayout}
          >
            {getFieldDecorator('dateRange', {
              initialValue: [
                !isUndefined(targetItem.startDate)
                  ? moment(targetItem.startDate, dateFormat)
                  : targetItem.calendar,
                !isUndefined(targetItem.endDate)
                  ? moment(targetItem.endDate, dateFormat)
                  : targetItem.calendar,
              ],
              rules: [
                {
                  required: true,
                  message: intl.get('smdm.calendar.view.validation.date.notNull').d('日期不能为空'),
                },
              ],
            })(<DatePicker.RangePicker placeholder="" format={dateFormat} />)}
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}

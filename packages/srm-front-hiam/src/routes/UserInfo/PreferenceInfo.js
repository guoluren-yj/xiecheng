/* eslint-disable no-nested-ternary */
/**
 * PreferenceInfo.js
 * @date 2018/11/27
 * @author WY yang.wang06@hand-china.com
 * @copyright Copyright (c) 2018, Hand
 */

import React from 'react';
import { Bind } from 'lodash-decorators';
import { Form, Select } from 'hzero-ui';
import { Button } from 'choerodon-ui/pro';
import { connect } from 'dva';

import Lov from 'components/Lov';
import intl from 'utils/intl';

import styles from './index.less';
import DateTimeFormat from './DateTimeFormat';
import EditableListItem from './components/EditableListItem';

const btnStyle = { marginLeft: 8 };

@connect(
  ({
    user: { currentUser: { dayLightFlag, themeConfigVO: { enableThemeConfig } = {} } = {} } = {},
  }) => ({
    dayLightFlag,
    enableThemeConfig,
  })
)
@Form.create({ fieldNameProp: null })
export default class PreferenceInfo extends React.Component {
  state = {
    timeZoneProps: { editing: false },
    languageProps: { editing: false },
    menuProps: { editing: false },
    roleMergeProps: { editing: false },
    reminderFlagProps: { editing: false },
    printModalFlagProps: { editing: false },
  };

  componentDidMount() {
    const { initLanguageMap, initPreference } = this.props;
    initLanguageMap();
    initPreference();
  }

  render() {
    const {
      userInfo,
      dateMap,
      timeMap,
      onDateFormatUpdate,
      onTimeFormatUpdate,
      updateDateFormatLoading,
      updateTimeFormatLoading,
      enableThemeConfig,
    } = this.props;
    return (
      <div className={styles.preference}>
        {this.renderTimeZone()}
        {this.renderLanguage()}
        {!enableThemeConfig && this.renderMenuType()}
        {/* {this.renderRoleMerge()} */}
        {this.renderReminderFlag()}
        {
          <DateTimeFormat
            userInfo={userInfo}
            dateMap={dateMap}
            timeMap={timeMap}
            onDateFormatUpdate={onDateFormatUpdate}
            onTimeFormatUpdate={onTimeFormatUpdate}
            updateDateFormatLoading={updateDateFormatLoading}
            updateTimeFormatLoading={updateTimeFormatLoading}
          />
        }
        {this.renderPrintModalFlag()}
      </div>
    );
  }

  // time-zone
  renderTimeZone() {
    const { userInfo = {}, form, updateTimeZoneLoading, dayLightFlag } = this.props;
    const {
      timeZoneProps: { editing = false },
    } = this.state;
    let content;
    if (editing) {
      content = (
        <>
          {form.getFieldDecorator('timeZone', {
            initialValue: userInfo.timeZone,
          })(
            <Lov
              code={dayLightFlag === 1 ? 'HIAM.TIME_ZONE_UTC' : 'HIAM.TIME_ZONE'}
              textValue={userInfo.timeZoneMeaning}
              textField="timeZoneMeaning"
              lovOptions={dayLightFlag === 1 ? {} : { displayField: 'value' }}
              style={{ width: 240, marginTop: '2px' }}
              allowClear={false}
            />
          )}
          <Button
            color="primary"
            style={btnStyle}
            loading={updateTimeZoneLoading}
            onClick={this.handleTimeZoneUpdate}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button style={btnStyle} onClick={this.handleTimeZoneEditCancel}>
            {intl.get('hzero.common.button.cancel').d('取消')}
          </Button>
        </>
      );
    } else {
      content = (
        <Button key="update" onClick={this.handleTimeZoneEdit}>
          {intl.get('hzero.common.button.update').d('修改')}
        </Button>
      );
    }
    return (
      <EditableListItem
        key="time-zone"
        title={
          <div>
            {intl.get('hiam.userInfo.model.user.timeZone').d('时区切换')}
            {userInfo.timeZoneMeaning && (
              <span className={styles['default-tag']}>{userInfo.timeZoneMeaning}</span>
            )}
          </div>
        }
        description={intl
          .get('hiam.userInfo.view.message.timeZone')
          .d('时区首选项，用于用户切换时区')}
        content={content}
      />
    );
  }

  @Bind()
  handleTimeZoneEdit() {
    this.setState({ timeZoneProps: { editing: true } });
  }

  @Bind()
  handleTimeZoneEditCancel() {
    this.setState({ timeZoneProps: { editing: false } });
  }

  @Bind()
  handleTimeZoneUpdate() {
    const { form } = this.props;
    form.validateFields(['timeZone', 'timeZoneMeaning'], (err, data) => {
      const { onTimeZoneUpdate, userInfo = {} } = this.props;
      let unUpdateMeaning = data.timeZoneMeaning;
      // 如果没有改变 Lov, Lov 里面的 timeZoneMeaning(textField) 会为空
      if (userInfo.timeZone === data.timeZone) {
        if (!data.timeZoneMeaning) {
          unUpdateMeaning = userInfo.timeZoneMeaning;
        }
      }
      onTimeZoneUpdate({
        ...data,
        timeZoneMeaning: unUpdateMeaning,
      }).then((res) => {
        if (res) {
          window.location.reload();
          this.handleTimeZoneEditCancel();
        }
      });
    });
  }

  @Bind()
  findConfigField(field, data) {
    if (data.length > 0) {
      const dataFilter = data.find((item) => item.value === field);
      return dataFilter !== undefined ? dataFilter.meaning : null;
    }
  }

  // language
  renderLanguage() {
    const { userInfo = {}, languageMap = {}, form, updateLanguageLoading } = this.props;
    const {
      languageProps: { editing = false },
    } = this.state;
    let content;
    if (editing) {
      content = (
        <>
          {form.getFieldDecorator('language', {
            initialValue: userInfo.language,
          })(
            <Select style={{ width: 240, position: 'relative', top: '-1px' }} allowClear={false}>
              {Object.values(languageMap).map((item) => (
                <Select.Option key={item.code} value={item.code}>
                  {item.name}
                </Select.Option>
              ))}
            </Select>
          )}
          <Button
            key="save"
            style={btnStyle}
            loading={updateLanguageLoading}
            onClick={this.handleLanguageUpdate}
            color="primary"
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button key="cancel" style={btnStyle} onClick={this.handleLanguageEditCancel}>
            {intl.get('hzero.common.button.cancel').d('取消')}
          </Button>
        </>
      );
    } else {
      content = (
        <Button key="update" onClick={this.handleLanguageEdit}>
          {intl.get('hzero.common.button.update').d('修改')}
        </Button>
      );
    }
    return (
      <EditableListItem
        key="language"
        title={
          <div>
            {intl.get('hiam.userInfo.model.user.language').d('语言切换')}
            {userInfo.languageName && (
              <span className={styles['default-tag']}>{userInfo.languageName}</span>
            )}
          </div>
        }
        description={intl
          .get('hiam.userInfo.view.message.language')
          .d('语言首选项，用于用户切换语言')}
        content={content}
      />
    );
  }

  /**
   * 菜单布局设置
   */
  @Bind()
  renderMenuType() {
    const { userInfo = {}, menuMap = {}, form, updateMenuLoading } = this.props;
    const {
      menuProps: { editing = false },
    } = this.state;
    const menuType = this.findConfigField(userInfo.menuLayout, menuMap);
    let content;
    if (editing) {
      content = (
        <>
          {form.getFieldDecorator('menuLayout', {
            initialValue: userInfo.menuLayout,
          })(
            <Select style={{ width: 240, position: 'relative', top: '-1px' }} allowClear>
              {Object.values(menuMap).map((item) => (
                <Select.Option key={item.value} value={item.value}>
                  {item.meaning}
                </Select.Option>
              ))}
            </Select>
          )}
          <Button
            key="save"
            style={btnStyle}
            loading={updateMenuLoading}
            onClick={this.handleMenuUpdate}
            color="primary"
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button key="cancel" style={btnStyle} onClick={this.handleMenuEditCancel}>
            {intl.get('hzero.common.button.cancel').d('取消')}
          </Button>
        </>
      );
    } else {
      content = (
        <Button key="update" onClick={this.handleMenuEdit}>
          {intl.get('hzero.common.button.update').d('修改')}
        </Button>
      );
    }
    return (
      <EditableListItem
        key="menuLayout"
        title={
          <div>
            {intl.get('hiam.userInfo.model.user.menu').d('菜单布局')}
            {menuType && <span className={styles['default-tag']}>{menuType}</span>}
          </div>
        }
        description={intl
          .get('hiam.userInfo.view.message.menu')
          .d('菜单首选项，选择不同的菜单布局')}
        content={content}
      />
    );
  }

  /**
   * 角色合并设置
   */
  @Bind()
  renderRoleMerge() {
    const { userInfo = {}, roleMergeMap = {}, form, updateRoleMergeLoading } = this.props;
    const {
      roleMergeProps: { editing = false },
    } = this.state;
    const roleMerge = this.findConfigField(
      userInfo.roleMergeFlag === 1 ? '1' : userInfo.roleMergeFlag === 0 ? '0' : undefined,
      roleMergeMap
    );
    let content;
    if (editing) {
      content = (
        <>
          {form.getFieldDecorator('roleMergeFlag', {
            initialValue:
              userInfo.roleMergeFlag === 1 ? '1' : userInfo.roleMergeFlag === 0 ? '0' : undefined,
          })(
            <Select style={{ width: 240, position: 'relative', top: '-1px' }} allowClear>
              {Object.values(roleMergeMap).map((item) => (
                <Select.Option key={item.value} value={item.value}>
                  {item.meaning}
                </Select.Option>
              ))}
            </Select>
          )}
          <Button
            key="save"
            style={btnStyle}
            loading={updateRoleMergeLoading}
            onClick={this.handleRoleMergeUpdate}
            color="primary"
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button key="cancel" style={btnStyle} onClick={this.handleRoleMergeEditCancel}>
            {intl.get('hzero.common.button.cancel').d('取消')}
          </Button>
        </>
      );
    } else {
      content = (
        <Button key="update" onClick={this.handleRoleMergeEdit}>
          {intl.get('hzero.common.button.update').d('修改')}
        </Button>
      );
    }
    return (
      <EditableListItem
        key="roleMerge"
        title={
          <div>
            {intl.get('hiam.userInfo.model.user.roleMerge').d('角色合并')}
            {roleMerge && <span className={styles['default-tag']}>{roleMerge}</span>}
          </div>
        }
        description={intl
          .get('hiam.userInfo.view.message.roleMerge')
          .d('角色合并首选项，选择是否角色合并')}
        content={content}
      />
    );
  }

  /**
   * 首页弹窗提醒设置
   */
  @Bind()
  renderReminderFlag() {
    const { form, userInfo, reminderFlagMap = {}, updateReminderFlagLoading } = this.props;
    const {
      reminderFlagProps: { editing = false },
    } = this.state;
    const tag = this.findConfigField(
      userInfo.popoutReminderFlag === 1 ? '1' : userInfo.popoutReminderFlag === 0 ? '0' : null,
      reminderFlagMap
    );
    let content;
    if (editing) {
      content = (
        <>
          {form.getFieldDecorator('reminderFlag', {
            initialValue:
              userInfo.popoutReminderFlag === 1
                ? '1'
                : userInfo.popoutReminderFlag === 0
                ? '0'
                : undefined,
          })(
            <Select style={{ width: 240, position: 'relative', top: '1px' }}>
              {Object.values(reminderFlagMap).map((item) => (
                <Select.Option key={item.value} value={item.value}>
                  {item.meaning}
                </Select.Option>
              ))}
            </Select>
          )}
          <Button
            key="save"
            style={btnStyle}
            loading={updateReminderFlagLoading}
            onClick={this.handleReminderFlagUpdate}
            color="primary"
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button key="cancel" style={btnStyle} onClick={this.handleReminderFlagEditCancel}>
            {intl.get('hzero.common.button.cancel').d('取消')}
          </Button>
        </>
      );
    } else {
      content = (
        <Button key="update" onClick={this.handleReminderFlagEdit}>
          {intl.get('hzero.common.button.update').d('修改')}
        </Button>
      );
    }
    return (
      <EditableListItem
        key="reminder"
        title={
          <div>
            {intl.get('hiam.userInfo.model.user.reminderFlag').d('首页消息弹窗')}
            {tag && <span className={styles['default-tag']}>{tag}</span>}
          </div>
        }
        description={intl
          .get('hiam.userInfo.view.message.reminderFlag')
          .d('首页消息弹窗首选项，选择是否开启首页消息弹窗提醒')}
        content={content}
      />
    );
  }

  /**
   * 打印弹窗提醒设置
   */
  @Bind()
  renderPrintModalFlag() {
    const { form, userInfo, printModalFlagMap = {}, updatePrintModalFlagLoading } = this.props;
    const {
      printModalFlagProps: { editing = false },
    } = this.state;
    const tag = this.findConfigField(
      userInfo.printOutputConfigFlag === 1 ? '1' : '0',
      printModalFlagMap
    );
    let content;
    if (editing) {
      content = (
        <div style={{ display: 'flex', flexDirection: 'row-reverse', marginLeft: '8px' }}>
          <Button key="cancel" style={btnStyle} onClick={this.handlePrintModalFlagEditCancel}>
            {intl.get('hzero.common.button.cancel').d('取消')}
          </Button>
          <Button
            key="save"
            style={btnStyle}
            loading={updatePrintModalFlagLoading}
            onClick={this.handlePrintModalFlagUpdate}
            color="primary"
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          {form.getFieldDecorator('printOutputConfigFlag', {
            initialValue: userInfo.printOutputConfigFlag === 1 ? '1' : '0',
          })(
            <Select style={{ width: 240, position: 'relative', top: '1px' }}>
              {Object.values(printModalFlagMap).map((item) => (
                <Select.Option key={item.value} value={item.value}>
                  {item.meaning}
                </Select.Option>
              ))}
            </Select>
          )}
        </div>
      );
    } else {
      content = (
        <Button key="update" onClick={this.handlePrintModalFlagEdit}>
          {intl.get('hzero.common.button.update').d('修改')}
        </Button>
      );
    }
    return (
      <EditableListItem
        key="printModal"
        title={
          <div>
            {intl.get('srm.common.printOutConfig.title').d('打印输出配置')}
            {tag && <span className={styles['default-tag']}>{tag}</span>}
          </div>
        }
        description={
          <span>
            {intl
              .get('hiam.userInfo.view.message.printOutputConfigFlag')
              .d(
                '打印单据时，选择是否开启打印输出配置弹窗提醒，开启后可在打印单据时，选择打印内容的语言、以及转换时区等'
              )}
          </span>
        }
        content={content}
      />
    );
  }

  @Bind()
  handleLanguageEdit() {
    this.setState({
      languageProps: { editing: true },
    });
  }

  @Bind()
  handleLanguageEditCancel() {
    this.setState({
      languageProps: { editing: false },
    });
  }

  @Bind()
  handleLanguageUpdate() {
    const { form } = this.props;
    form.validateFields(['language'], (err, data) => {
      if (!err) {
        const { onLanguageUpdate } = this.props;
        onLanguageUpdate(data.language).then((res) => {
          if (res) {
            this.handleLanguageEditCancel();
          }
        });
      }
    });
  }

  // 菜单
  @Bind()
  handleMenuEdit() {
    this.setState({
      menuProps: { editing: true },
    });
  }

  @Bind()
  handleMenuEditCancel() {
    this.setState({
      menuProps: { editing: false },
    });
  }

  @Bind()
  handleMenuUpdate() {
    const { form } = this.props;
    form.validateFields(['menuLayout'], (err, data) => {
      if (!err) {
        const { onMenuUpdate, onRefreshMenu } = this.props;
        onMenuUpdate(data.menuLayout).then((res) => {
          if (res) {
            onRefreshMenu(data.menuLayout);
            this.handleMenuEditCancel();
          }
        });
      }
    });
  }

  // 角色合并
  @Bind()
  handleRoleMergeEdit() {
    this.setState({
      roleMergeProps: { editing: true },
    });
  }

  @Bind()
  handleRoleMergeEditCancel() {
    this.setState({
      roleMergeProps: { editing: false },
    });
  }

  @Bind()
  handleRoleMergeUpdate() {
    const { form } = this.props;
    form.validateFields(['roleMergeFlag'], (err, data) => {
      if (!err) {
        const { onRoleMergeUpdate } = this.props;
        onRoleMergeUpdate(data.roleMergeFlag).then((res) => {
          if (res) {
            this.handleRoleMergeEditCancel();
          }
        });
      }
    });
  }

  /**
   * 修改首页消息弹窗设置
   */
  @Bind()
  handleReminderFlagEdit() {
    this.setState({
      reminderFlagProps: { editing: true },
    });
  }

  /**
   * 修改首页消息弹窗设置
   */
  @Bind()
  handlePrintModalFlagEdit() {
    this.setState({
      printModalFlagProps: { editing: true },
    });
  }

  /**
   * 取消首页消息弹窗设置修改
   */
  @Bind()
  handleReminderFlagEditCancel() {
    this.setState({
      reminderFlagProps: { editing: false },
    });
  }

  /**
   * 取消首页消息弹窗设置修改
   */
  @Bind()
  handlePrintModalFlagEditCancel() {
    this.setState({
      printModalFlagProps: { editing: false },
    });
  }

  /**
   * 更新首页消息弹窗设置
   */
  @Bind()
  handleReminderFlagUpdate() {
    const { form } = this.props;
    form.validateFields(['reminderFlag'], (err, data) => {
      if (!err) {
        const { onReminderFlagUpdate } = this.props;
        onReminderFlagUpdate(data.reminderFlag).then((res) => {
          if (res) {
            this.handleReminderFlagEditCancel();
          }
        });
      }
    });
  }

  /**
   * 更新打印配置弹窗设置
   */
  @Bind()
  handlePrintModalFlagUpdate() {
    const { form } = this.props;
    form.validateFields(['printOutputConfigFlag'], (err, data) => {
      if (!err) {
        const { onPrintModalFlagUpdate } = this.props;
        onPrintModalFlagUpdate(data.printOutputConfigFlag).then((res) => {
          if (!res || !res.failed) {
            this.handlePrintModalFlagEditCancel();
          }
        });
      }
    });
  }
}

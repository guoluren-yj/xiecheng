import React from 'react';
import { connect } from 'dva';
import { compose } from 'lodash';
import { Form, Select, TextField, TextArea, Lov, Output } from 'choerodon-ui/pro';
import { isTenantRoleLevel } from 'utils/utils';
import intl from 'utils/intl';

import styles from './index.less';

const { Option } = Select;

// 是否为租户
const isTenant = isTenantRoleLevel();

const MessageDrawer = (props) => {
  const {
    readonly = false,
    formDs,
    message: {
      messageType = [], // 类别
      fieldType = [], // 消息类型
      issueLevelList = [], // 问题等级
      issueModuleList = [], // 问题模块
      issueRoleList = [], // 默认跟进角色
      languageList = [],
      messageDetail = {},
    },
  } = props;

  // ds下拉值更新时，注意对应的meaning
  const handleUpdateDs = (value, type) => {
    if (type === 'type') {
      messageType.forEach((item) => {
        if (item.value === value) {
          formDs.current.set('typeMeaning', item.meaning);
        }
      });
    }
  };

  // 校验提示渲染
  const handleValidationRenderer = (validationResult) => {
    const { ruleName } = validationResult;
    if (ruleName === 'patternMismatch') {
      return (
        <span>
          {intl
            .get('hzero.common.validation.code')
            .d('大小写及数字，必须以字母、数字开头，可包含“-”、“_”、“.”、“/”')}
        </span>
      );
    }
  };

  // 租户下的平台级数据不可编辑
  const disabledValue = isTenant && messageDetail.tenantId === 0;

  const render = () => {
    if (readonly) {
      return (
        <>
          <div className={styles['card-title']}>
            {intl.get('hzero.common.view.baseInfo').d('基本信息')}
          </div>
          <Form
            dataSet={formDs}
            labelLayout="vertical"
            columns={2}
            style={{ marginBottom: '24px' }}
            className="c7n-pro-vertical-form-display"
          >
            {!isTenant && <Lov name="tenantLov" disabled={messageDetail.messageId} />}
            {/* 消息编码 */}
            <Output name="code" />
            {/* 消息类型 */}
            <Output name="messageTypeCode" />
            {/* 类别 */}
            <Output name="type" />
            {/* 语言和描述 */}
            {languageList.map((item) => (
              <>
                <Output
                  newLine
                  label={intl.get('hpfm.message.model.message.lang').d('语言')}
                  value={item.description}
                />
                <Output name={`description_${item.value}`} />
              </>
            ))}
          </Form>
          <div className={styles['card-title']}>
            {intl.get('hpfm.message.view.troubleshooting').d('问题排查')}
          </div>
          <Form
            dataSet={formDs}
            labelLayout="vertical"
            columns={2}
            className="c7n-pro-vertical-form-display"
          >
            {/* 问题等级 */}
            <Output name="issueLevel" newLine />
            {/* 问题模块 */}
            <Output name="issueModule" />
            {/* 默认跟进角色 */}
            <Output name="issueRoleFollows" />
            <Output name="issueSolution" colSpan={2} newLine />
          </Form>
        </>
      );
    } else {
      return (
        <>
          <div className={styles['card-title']}>
            {intl.get('hzero.common.view.baseInfo').d('基本信息')}
          </div>
          <Form dataSet={formDs} labelLayout="float" columns={2} style={{ marginBottom: '24px' }}>
            {!isTenant && <Lov name="tenantLov" disabled={messageDetail.messageId} />}
            {/* 消息编码 */}
            <TextField
              name="code"
              disabled={messageDetail.messageId}
              validationRenderer={handleValidationRenderer}
              restrict={/[^a-zA-Z0-9-_./]/g}
            />
            {/* 消息类型 */}
            <Select
              name="messageTypeCode"
              onChange={(value) => handleUpdateDs(value, 'type')}
              disabled={disabledValue}
            >
              {fieldType.map((item) => (
                <Option value={item.value}>{item.meaning}</Option>
              ))}
            </Select>
            {/* 类别 */}
            <Select
              name="type"
              onChange={(value) => handleUpdateDs(value, 'type')}
              disabled={disabledValue}
            >
              {messageType.map((item) => (
                <Option value={item.value}>{item.meaning}</Option>
              ))}
            </Select>
            {/* 语言和描述 */}
            {languageList.map((item) => (
              <>
                <TextField
                  disabled
                  newLine
                  label={intl.get('hpfm.message.model.message.lang').d('语言')}
                  value={item.description}
                />
                <TextArea name={`description_${item.value}`} disabled={disabledValue} />
              </>
            ))}
          </Form>
          <div className={styles['card-title']}>
            {intl.get('hpfm.message.view.troubleshooting').d('问题排查')}
          </div>
          <Form dataSet={formDs} labelLayout="float" columns={2}>
            {/* 问题等级 */}
            <Select
              name="issueLevel"
              onChange={(value) => handleUpdateDs(value, 'issueLevel')}
              newLine
              disabled={disabledValue}
            >
              {issueLevelList.map((item) => (
                <Option value={item.value}>{item.meaning}</Option>
              ))}
            </Select>
            {/* 问题模块 */}
            <Select
              name="issueModule"
              onChange={(value) => handleUpdateDs(value, 'issueModule')}
              disabled={disabledValue}
            >
              {issueModuleList.map((item) => (
                <Option value={item.value}>{item.meaning}</Option>
              ))}
            </Select>
            {/* 默认跟进角色 */}
            <Select
              name="issueRoleFollows"
              onChange={(value) => handleUpdateDs(value, 'issueRoleFollow')}
              disabled={disabledValue}
            >
              {issueRoleList.map((item) => (
                <Option value={item.value}>{item.meaning}</Option>
              ))}
            </Select>
            <TextArea name="issueSolution" colSpan={2} newLine disabled={disabledValue} />
          </Form>
        </>
      );
    }
  };

  return render();
};
export default compose(
  connect(({ message }) => ({
    message,
  }))
)(MessageDrawer);

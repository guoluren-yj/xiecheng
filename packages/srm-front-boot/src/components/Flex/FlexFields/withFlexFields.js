import React, { useState } from 'react';
import intl from 'utils/intl';
import { Collapse, Icon } from 'hzero-ui';
import { isArray, isEmpty, isString } from 'lodash';
import { Button } from 'components/Permission';
import notification from 'utils/notification';
import FlexFieldsPanel from './FlexFieldsConfig/Panel';
import {
  queryCode,
  queryFlexFieldsConfig,
  withFlexFieldsFormRender,
  withFlexFieldsTableColumnsRender,
} from './utils';

const { Panel } = Collapse;

const customPanelStyle = {
  background: '#f7f7f7',
  borderRadius: 4,
  marginBottom: 24,
  border: 0,
  overflow: 'hidden',
};

function Header({ title }) {
  return (
    <div>
      <h4 style={{ margin: 0, display: 'inline-block' }}>
        <Icon type="appstore-o" /> {intl.get(`hpfm.flexFields.view.title.flexFields`).d('弹性域')}:{' '}
        {title}
      </h4>
      <div style={{ float: 'right', marginRight: 12 }}>
        <Icon type="right" />
      </div>
    </div>
  );
}

/**
 * 设置表单到map中的key, 多个弹性域以 ~ 作为分隔符
 * @param {string | string[]} ruleCode
 * @return {string}
 */
function buildRuleTriggerFormKey(ruleCode) {
  return `${isArray(ruleCode) ? ruleCode.join('~') : ruleCode}$triggerForm`;
}

/**
 * 获取所有弹性域的 config
 * @param {Map} dataSourceMap - 一定会有值, 调用者保证
 * @param {string | string[]} ruleCode
 * @return Array - 合并之后的config
 */
function getFlexFieldsConfig(dataSourceMap, ruleCode) {
  return isArray(ruleCode)
    ? ruleCode.reduce((all, cur) => {
        return [...all, ...((dataSourceMap.get(cur) || {}).config || [])];
      }, [])
    : (dataSourceMap.get(ruleCode) || {}).config || [];
}

export default function withFlexFields(options = []) {
  const flexFieldsDataSourceMap = new Map();
  const codeMap = new Map();
  const componentObjectMap = new Map();
  return ({ setToolboxDrawerVisible }) => {
    const [flexFieldsPanelVisible, setFlexFieldsPanelVisible] = useState(false);
    const [permissionLevelKey, setPermissionLevelKey] = useState(null);
    const [currentFlexRuleCode, setCurrentFlexRuleCode] = useState(null);
    const openFlexFieldsPanel = (scope, code) => {
      setFlexFieldsPanelVisible(true);
      setToolboxDrawerVisible(false);
      setPermissionLevelKey(scope);
      setCurrentFlexRuleCode(code);
    };
    const code = {};
    codeMap.forEach((value, key) => {
      code[key] = value;
    });
    const closeFlexFieldsConfig = () => {
      setFlexFieldsPanelVisible(false);
      setPermissionLevelKey(null);
      setCurrentFlexRuleCode(null);
    };
    const { formObject = {} } =
      componentObjectMap.get(buildRuleTriggerFormKey(currentFlexRuleCode)) || {};
    const { config = {} } =
      flexFieldsDataSourceMap.get(buildRuleTriggerFormKey(currentFlexRuleCode)) || {};
    const flexFieldsPanelProps = {
      visible: flexFieldsPanelVisible,
      permissionLevelKey,
      cancel: closeFlexFieldsConfig,
      flexRuleCode: currentFlexRuleCode,
      componentObject: formObject,
      flexFieldsConfig: config,
      code,
    };
    const toolsConfig = {
      key: 'flexFields',
      title: intl.get(`hpfm.flexFields.view.title.flexFields`).d('弹性域'),
      panel: <FlexFieldsPanel {...flexFieldsPanelProps} />,
      controller: (
        <Collapse bordered={false}>
          {options.map(n => (
            <Panel
              key={n.flexRuleCode}
              showArrow={false}
              forceRender
              header={
                <Header
                  type="form"
                  title={
                    n.title
                      ? isString(n.title)
                        ? n.title
                        : intl.get((n.title || {}).code).d((n.title || {}).default)
                      : n.flexRuleCode
                  }
                />
              }
              style={customPanelStyle}
            >
              {isArray((n.permissionCode || {}).tenant) && (
                <span style={{ height: 20, margin: '0 6px' }}>
                  <Button
                    onClick={() => openFlexFieldsPanel('tenant', n.flexRuleCode)}
                    type="text"
                    permissionList={
                      (n.permissionCode || {}).tenant
                      //   [
                      //   {
                      //     code: `${path}.button.revoke`,
                      //     type: 'button',
                      //     meaning: '公告管理-撤销',
                      //   },
                      // ]
                    }
                  >
                    <Icon type="edit" />{' '}
                    {intl.get(`hpfm.flexFields.view.title.flexFieldsTenant`).d('租户')}
                  </Button>
                </span>
              )}
              {isArray((n.permissionCode || {}).role) && (
                <span style={{ height: 20, margin: '0 6px' }}>
                  <Button
                    type="text"
                    permissionList={n.permissionCode.role}
                    onClick={() => openFlexFieldsPanel('role', n.flexRuleCode)}
                  >
                    <Icon type="edit" />{' '}
                    {intl.get(`hpfm.flexFields.view.title.flexFieldsRole`).d('角色')}
                  </Button>
                </span>
              )}
              {/* {isArray((n.permissionCode || {}).user) && (
                <span style={{ height: 20, margin: '0 6px' }}>
                  <Button
                    type="text"
                    permissionList={(n.permissionCode || {}).user}
                    onClick={() => openFlexFieldsPanel('user', n.flexRuleCode)}
                  >
                    <Icon type="edit" />{' '}
                    {intl.get(`hpfm.flexFields.view.title.flexFieldsRole`).d('用户')}
                  </Button>
                </span>
              )} */}
            </Panel>
          ))}
        </Collapse>
      ),
    };
    toolsConfig.assignWrapComponentProps = componentProps => {
      const wrapComponentProps = componentProps;
      wrapComponentProps.withFlexFieldsForm = ({
        ruleCode,
        formComponentObject = null,
        ...rest
      }) => {
        const componentKey = buildRuleTriggerFormKey(ruleCode);
        componentObjectMap.set(componentKey, {
          formObject: formComponentObject,
          ...rest,
        });
        const { targetForm = {}, triggerForm = {}, dataSource = [] } =
          componentObjectMap.get(componentKey) || {};
        componentObjectMap.set(componentKey, triggerForm);
        // TODO: withFlexFieldsFormRender 方法中只使用了 config, 且config 是一个数组
        return withFlexFieldsFormRender(formComponentObject)({
          flexFieldsConfig: {
            config: getFlexFieldsConfig(flexFieldsDataSourceMap, ruleCode),
          },
          targetForm,
          triggerForm,
          formObject: formComponentObject,
          dataSource,
          ...rest,
        });
      };
      wrapComponentProps.withFlexFieldsTable = ({
        ruleCode,
        trigger = componentObjectMap.get(buildRuleTriggerFormKey(ruleCode)),
        columns,
        setColumns = () => {},
        editable = false,
      }) => {
        return withFlexFieldsTableColumnsRender({
          config: getFlexFieldsConfig(flexFieldsDataSourceMap, ruleCode),
          columns,
          trigger,
          setColumns,
          editable,
        });
      };
      return wrapComponentProps;
    };

    toolsConfig.asyncEvent = () => {
      Promise.all(
        options.map(o =>
          queryFlexFieldsConfig(o.flexRuleCode).then(res => {
            if (!isEmpty(res)) {
              const { permissionCode } = o;
              flexFieldsDataSourceMap.set(o.flexRuleCode, {
                permissionCode,
                config: res,
                ruleCode: o.flexRuleCode,
              });
            }
            return true;
          })
        )
      );
      queryCode({ lovCode: 'HPFM.FLEX.SYMBOL' }).then(res => {
        if (res && res.failed) {
          notification.error({ description: res.message });
        } else {
          codeMap.set('HPFM.FLEX.SYMBOL', res);
        }
      });
      queryCode({ lovCode: 'HPFM.FLEX.OPERATOR' }).then(res => {
        if (res && res.failed) {
          notification.error({ description: res.message });
        } else {
          codeMap.set('HPFM.FLEX.OPERATOR', res);
        }
      });
      queryCode({ lovCode: 'HPFM.FLEX.FIELD_TYPE' }).then(res => {
        if (res) {
          if (res && !res.failed) {
            codeMap.set('HPFM.FLEX.FIELD_TYPE', res);
          }
        }
      });
    };
    return toolsConfig;
  };
}

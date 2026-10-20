import React, { useCallback, useState, memo } from 'react';
import {
  Form,
  TextField,
  TextArea,
  IconPicker,
  Select,
  IntlField,
  Lov,
  Switch,
  Output,
  Icon,
} from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';
import intl from 'utils/intl';
import { isTenantRoleLevel } from 'utils/utils';
import classnames from 'classnames';

// import { enableRender } from 'utils/renderer';
import styles from '../index.less';

/**
 * @param {boolean} isNew - 是否新建
 * @param {string} type - 类型 (dir | menu)
 * @param {obejct} record - 操作对象
 */

const EditMenuGroup = ({ isNew, type, readOnly, record, isRoot = false, codePrefix = '', permission }) => {
  const [typeFlag, setTypeFlag] = useState(type === 'menu');

  const onTypeChange = useCallback(
    (value) => {
      setTypeFlag(value === 'menu');
    },
    [type, isRoot]
  );

  const onParentChange = useCallback((data) => {
    if (data) {
      const {
        objectVersionNumber: targetFunctionVersion,
        code: parentCode,
        name: parentName,
      } = data;
      record.set({ targetFunctionVersion, parentCode, parentName });
    }
  }, []);

  return readOnly ? (
    <Form
      record={record}
      columns={1}
      labelLayout="float"
      // className="c7n-pro-vertical-form-display"
      className={classnames(styles.hiam_menu_display_form, "c7n-pro-vertical-form-display")}
      useColon={false}
    >
      <Output name="type" />
      <Output name="code" showHelp='false' />
      <Output name="name" />
      {typeFlag ? <Output name="menuCodeObject" renderer={({ value }) => value?.name} /> : null}
      {typeFlag ? <Output name="menuCode" /> : null}
      {isNew && !typeFlag ? null : (
        <Output
          name="parentObject"
          onChange={onParentChange}
          renderer={({ value }) => value?.name}
          tableProps={{ style: { maxHeight: 500 } }}
        />
      )}

      <Output name="icon" popupCls={styles['menu-group-icon-picker']} editor={false} renderer={({ value }) => value ? <Icon type={value} /> : null} />
      <Output name="menuQuickIndex" />
      <Output name="description" />
      <Output
        name="enabledFlag"
        renderer={({ value }) => (
          <Tag color={value ? 'green' : 'red'} style={{ border: 'none' }}>
            {value
              ? intl.get('hzero.common.status.alreadyEnabled').d('已启用')
              : intl.get('hzero.common.status.alreadyDisabled').d('已禁用')}
          </Tag>
        )}
      />
    </Form>
  ) : (
    // 类型-编码-名称-其他
    <Form record={record} labelLayout="float">
      <Select name="type" disabled={!(isRoot && isNew) || !permission} onChange={onTypeChange} />
      {
        <TextField
          name="code"
          showHelp={!isNew || typeFlag || !permission ? 'none' : 'newLine'}
          disabled={!isNew || typeFlag || !permission}
          addonBefore={isNew ? codePrefix : null}
        />
      }
      <IntlField name="name" disabled={!permission} />
      {typeFlag ? <Lov name="menuCodeObject" disabled={!isNew || !permission} /> : null}
      {typeFlag ? <TextField name="menuCode" disabled={!permission} /> : null}
      {isNew && !typeFlag ? null : (
        <Lov
          name="parentObject"
          onChange={onParentChange}
          tableProps={{ style: { maxHeight: 500 } }}
          disabled={!permission}
        />
      )}
      <IconPicker name="icon" popupCls={styles['menu-group-icon-picker']} disabled={!permission} />
      <TextField name="menuQuickIndex" disabled={!permission} />
      <TextArea name="description" disabled={!permission} />
      {!isTenantRoleLevel() && <Switch name="enabledFlag" disabled={!permission} />}
    </Form>
  );
};

export default memo(EditMenuGroup);

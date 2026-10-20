/**
 * 功能定义-修改/添加功能
 * @date: 2022-05-22
 * @author: ke.wang01 <ke.wang01@gonig-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2022, Hand
 */

import React, { useState, useMemo, useCallback } from 'react';
import { Divider } from 'hzero-ui';
import {
  Form,
  IconPicker,
  Lov,
  Select,
  SelectBox,
  Switch,
  TextArea,
  TextField,
  Table,
  Icon,
  IntlField,
} from 'choerodon-ui/pro';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { enableRender } from 'utils/renderer';
import styles from './index.less';

const { Option } = Select;

const CopyMenuTable = (props) => {
  const { dataSet } = props;

  // 启用/禁用
  const enableRenderer = useCallback(({ value }) => {
    return enableRender(value);
  }, []);

  const columns = useMemo(
    () => [
      {
        name: 'name',
        lock: 'left',
        width: 200,
      },
      {
        title: intl.get(`hiam.tenantMenu.model.tenantMenu.parentName`).d('上级目录'),
        width: 120,
        name: 'parentName',
      },
      {
        title: intl.get(`hiam.tenantMenu.model.tenantMenu.quickIndex`).d('快速索引'),
        width: 120,
        name: 'quickIndex',
      },
      {
        title: intl.get(`hiam.tenantMenu.model.tenantMenu.icon`).d('图标'),
        width: 80,
        name: 'icon',
        render: (value) => (
          <Icon
            type={value}
            size={14}
            style={{
              width: 14,
              height: 14,
              lineHeight: '14px',
            }}
          />
        ),
      },
      {
        title: intl.get(`hiam.tenantMenu.model.tenantMenu.code`).d('编码'),
        name: 'code',
      },
      {
        title: intl.get(`hiam.tenantMenu.model.tenantMenu.sort`).d('序号'),
        name: 'sort',
        width: 80,
      },
      {
        title: intl.get(`hiam.tenantMenu.model.tenantMenu.description`).d('描述'),
        name: 'description',
        width: 200,
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        name: 'enabledFlag',
        width: 80,
        renderer: enableRenderer,
        lock: 'right',
      },
    ],
    []
  );

  return (
    <>
      <Divider orientation="left">
        {intl.get(`hiam.menuConfig.view.message.title.copyMenu`).d('选择复制内容')}
      </Divider>
      <Table mode="tree" dataSet={dataSet} columns={columns} />
    </>
  );
};

export default formatterCollections({
  code: ['hiam.menuConfig', 'hptl.portalAssign', 'hiam.tenantMenu'],
})((props) => {
  const { type, record, isTenantRoleLevel, copyMenuDs } = props;
  const [disabled] = useState(type === 'edit');
  const [isCopy] = useState(type === 'copyAndCreate');
  const [customFlag, setCustomFlag] = useState(record.get('customFlag'));

  const onCustomChange = useCallback((value) => {
    setCustomFlag(value);
    const customField = record.dataSet.getField('tenantNumObject');
    if (value === 0) {
      const { tenantId, tenantNum } = customField.get('defaultValue');
      record.set('tenantNumObject', {
        tenantId,
        tenantNum,
      });
      customField.set('required', false);
    } else {
      customField.set('required', true);
    }
  }, []);

  return (
    <Form record={record} labelLayout="float" className={styles['function-form']}>
      <IntlField name="name" />
      <Lov name="menuGroupObject" />
      <TextField name="code" disabled={disabled} />
      <TextField name="route" />
      <IconPicker name="icon" />
      <TextField name="quickIndex" />
      <TextArea name="description" />
      <div>
        <p className="function-form-label">
          {intl.get('hiam.menuConfig.model.menuConfig.virtualFlag').d('是否虚拟菜单')}
        </p>
        <Switch name="virtualFlag" defaultChecked />
      </div>
      <Select name="type" disabled={disabled} />
      {isTenantRoleLevel ? (
        <div>
          <p className="function-form-label">
            {intl.get('hiam.menuConfig.model.menuConfig.standardOrIndividual').d('标准/二开')}
          </p>
          <SelectBox name="customFlag" onChange={onCustomChange} disabled={disabled}>
            <Option value={0}>
              {intl.get('hiam.menuConfig.model.menuConfig.standard').d('标准')}
            </Option>
            <Option value={1}>
              {intl.get('hiam.menuConfig.model.menuConfig.individual').d('二开')}
            </Option>
          </SelectBox>
        </div>
      ) : null}
      {isTenantRoleLevel && customFlag ? <Lov name="tenantNumObject" disabled={disabled} /> : null}
      {isTenantRoleLevel ? <Select name="labelCode" disabled={disabled} /> : null}
      {isCopy ? <CopyMenuTable dataSet={copyMenuDs} /> : null}
      {<TextField name="manager" />}
    </Form>
  );
});

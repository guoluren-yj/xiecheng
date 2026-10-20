import React, { useEffect, useMemo } from 'react';
import { isTenantRoleLevel } from 'utils/utils';
import { observer } from 'mobx-react-lite';
import { DataSet, Select } from 'choerodon-ui/pro';
import { FieldIgnore, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import Lov from '@/components/LowcodeLov';
import ImgIcon from '@/utils/ImgIcon';

import styles from './index.less';

const { Option } = Select;
interface IHeadTenantSelect {
  onChange?: (val: string) => void;
}
export default observer(({ onChange = () => {} }: IHeadTenantSelect) => {
  const ds = useMemo(
    () =>
      new DataSet({
        autoCreate: true,
        fields: [
          {
            name: 'level',
            type: FieldType.string,
            defaultValue: 'platform',
          },
          {
            name: 'tenant',
            type: FieldType.object,
            lovCode: 'HPFM.TENANT',
            ignore: FieldIgnore.always,
          },
          {
            name: 'tenantId',
            type: FieldType.string,
            bind: 'tenant.tenantId',
          },
        ],
        events: {
          update: (props) => {
            onChange(props);
            let data = {};
            data = props.record.toJSONData();
            if (props.name === 'level' && props.value === 'platform') {
              // 切换到平台层清空之前选择的租户id信息
              Object.assign(data, { tenantId: null });
              // eslint-disable-next-line no-unused-expressions
              ds.current?.set('tenant', null);
            }
            window.dvaApp._store.dispatch({
              type: 'hmde/setTenantId',
              payload: {
                [window.location.pathname]: data,
              },
            });
          },
        },
      }),
    []
  );

  useEffect(() => {
    window.dvaApp._store.dispatch({
      type: 'hmde/setTenantId',
      payload: {
        [window.location.pathname]: {},
      },
    });
  }, []);

  return !isTenantRoleLevel() ? (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <Select
        dataSet={ds}
        className={styles['select-content']}
        name="level"
        colSpan={1}
        clearButton={false}
        suffix={<ImgIcon name="open-black.svg" size={12} />}
      >
        <Option value="platform">平台层</Option>
        <Option value="tenant">租户层</Option>
      </Select>
      <Lov
        dataSet={ds}
        name="tenant"
        hidden={ds.current?.get('level') === 'platform'}
        colSpan={2}
        placeholder="请选择租户"
        noCache
      />
    </div>
  ) : (
    <></>
  );
});

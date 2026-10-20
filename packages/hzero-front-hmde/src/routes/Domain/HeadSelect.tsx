import React, { useMemo, useEffect } from 'react';
import { isTenantRoleLevel } from 'utils/utils';
import intl from 'srm-front-boot/lib/utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { observer } from 'mobx-react-lite';
import { DataSet, Select, Lov } from 'choerodon-ui/pro';
import { FieldIgnore, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
// import Lov from '@/components/LowcodeLov';
import ImgIcon from '@/utils/ImgIcon';

import styles from './index.less';

const { Option } = Select;
interface IHeadTenantSelect {
  onChange?: (val: string) => void;
  initObj: {
    level: string | null;
    tenantId: string | null;
    tenantName: string | null;
  };
}
const Index = ({ onChange = () => {}, initObj }: IHeadTenantSelect) => {
  const ds = useMemo(
    () =>
      new DataSet({
        // autoCreate: true,
        fields: [
          {
            name: 'level',
            type: FieldType.string,
            defaultValue: isTenantRoleLevel() ? 'tenant' : 'platform',
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
          {
            name: 'tenantName',
            type: FieldType.string,
            bind: 'tenant.tenantName',
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
          },
        },
      }),
    []
  );

  useEffect(() => {
    ds.create(initObj);
  }, []);

  const hidden = ds.current?.get('level') === 'platform' || isTenantRoleLevel();

  return !isTenantRoleLevel() ? (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <Select
        dataSet={ds}
        className={styles['select-content']}
        name="level"
        // colSpan={1}
        colSpan={1}
        clearButton={false}
        suffix={<ImgIcon name="open-black.svg" size={12} />}
      >
        <Option value="platform">
          {intl.get('hmde.common.tenant.level.platform').d('平台层')}
        </Option>
        <Option value="tenant">{intl.get('hmde.common.tenant.level.tenant').d('租户层')}</Option>
      </Select>
      <Lov
        style={{ marginLeft: 10 }}
        dataSet={ds}
        name="tenant"
        hidden={hidden}
        colSpan={2}
        placeholder="请选择租户"
        noCache
      />
    </div>
  ) : null;
};

export default formatterCollections({ code: ['hmde.common'] })(observer(Index));

import React from 'react';
import intl from 'srm-front-boot/lib/utils/intl';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import { observer } from 'mobx-react-lite';
import { DataSet, Table, TextField, Button } from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';

import styles from './index.less';

const { Column } = Table;

interface IProps {
  valueListDs: DataSet;
  operateHeaderFlag: boolean;
  disabled: boolean;
}
const Index = ({ valueListDs, operateHeaderFlag, disabled }: IProps) => {
  return (
    <Table
      dataSet={valueListDs}
      dragColumnAlign={'left' as any}
      rowDraggable={!disabled}
      pagination={false}
      highLightRow={false}
      filter={record => !record.isRemoved}
    >
      <Column name="meaning" editor={!disabled} />
      <Column
        name="value"
        editor={record => {
          if (disabled) return false;
          return record.isNew || operateHeaderFlag ? (
            <TextField name="value" />
          ) : (
              record.get('value')
            );
        }}
      />
      <Column
        header={
          operateHeaderFlag && (
            <a
              disabled={disabled}
              onClick={async () => {
                if (await valueListDs.validate()) {
                  valueListDs.create({});
                }
              }}
            >
              <Icon type="add" style={{ verticalAlign: 'sub', marginRight: 4 }} />
              {intl.get('hmde.bo.field.valueList.code.create').d('新建编码字段')}
            </a>
          )
        }
        align={'right' as any}
        lock={'right' as any}
        renderer={({ record, dataSet }) => (
          <Button
            disabled={disabled}
            style={{ border: 'none' }}
            onClick={() => {
              if (dataSet && record) dataSet.delete(record, false);
            }}
          >
            <Icon
              className={styles['delete-icon']}
              type="delete_black-o"
            />
          </Button>
        )}
      />
    </Table>
  );
};
export default formatterCollections({ code: ['hmde.bo', 'hmde.common', 'hzero.common'] })(
  observer(Index)
);

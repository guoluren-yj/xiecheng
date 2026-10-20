import React, { useMemo, useCallback } from 'react';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import { DataSet, Button, TextField } from 'choerodon-ui/pro';
import { Link } from 'react-router-dom';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column.d';
import { SelectionMode } from 'choerodon-ui/pro/lib/table/enum';
import intl from 'hzero-front/lib/utils/intl';
import { omit } from 'lodash';
import { Icon } from 'choerodon-ui';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';


import tagRender from '../../../utils/TagRender';
import { listTableDS } from './EncryptionDs';

import styles from './index.less';

const Encryption = () => {
  const tableDs = useMemo(() => new DataSet(listTableDS()), []);

  // 检索
  const handleSearch = useCallback((params) => {
    let filterValues: { encryCode?: string } = params;
    const { encryCode = '' } = filterValues;
    filterValues = omit(filterValues, ['__dirty']);
    tableDs.setQueryParameter('queryParams', {
      ...filterValues,
      encryName: encryCode,
    });
    tableDs.query();
  }, [tableDs]);

  const columns = useMemo(
    (): ColumnProps[] => [
      {
        name: 'statusMeaning',
        width: 110,
        renderer: ({ value, record }) => {
          const status = !record || record.get('status') === 1 ? '' : record.get('status');
          return <span>{tagRender(status, value, 'encrypt')}</span>;
        },
      },
      {
        name: 'encryCode',
        renderer: ({ value, record }) => {
          const encryHeaderId = record ? record.get('encryHeaderId') : '';
          return (
            <Link to={`/hitf/interface-configuration-workbench/encryption/detail/${encryHeaderId}`}>
              <span
                className={styles['link-span']}
              >
                {value}
              </span>
            </Link>
          );
        },
      },
      {
        name: 'encryName',
      },
      {
        name: 'applicationName',
      },
      { name: 'remark' },
    ],
    []
  );

  return (
    <div className={styles.content}>
      <SearchBarTable
        searchCode='HITF.INTERFACE_CONFIGURATION_WORKBENCH.ENCRY.FILTER'
        selectionMode={SelectionMode.none}
        buttons={[
          <Link to='/hitf/interface-configuration-workbench/encryption/create'>
            <Button
              icon='playlist_add'
              funcType={FuncType.flat}
              color={ButtonColor.primary}
            >
              {intl.get('hzero.common.btn.add').d('新增')}
            </Button>
          </Link>,
        ]}
        columns={columns}
        dataSet={tableDs}
        cacheState
        searchBarConfig={{
          left: {
            render: (_, dataSet) => {
              return (
                <TextField
                  clearButton
                  dataSet={dataSet}
                  name="encryCode"
                  placeholder={
                    intl
                      .get('hitf.common.encryption.list.query')
                      .d('请输入加密编码、加密名称查询')
                  }
                  prefix={<Icon type="search" />}
                  style={{ width: '280px', margin: '0 20px 4px 0', zIndex: 0 }}
                />
              );
            },
          },
          onQuery: ({ params }) => handleSearch(params),
          fieldProps: {
            tenantId: {
              lovPara: {
                tenantId: undefined,
              },
            },
          },
          closeFilterSelector: true,
        }}
      />
    </div>
  );
};

export default React.memo(formatterCollections({
  code: ['hzero.common', 'hitf.common', 'hitf.application'],
})(Encryption));

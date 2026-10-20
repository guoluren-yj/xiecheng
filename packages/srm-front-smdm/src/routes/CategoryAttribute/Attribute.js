/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-08-19 15:12:03
 * @LastEditors: yanglin
 * @LastEditTime: 2022-09-09 11:20:51
 */
import React, { useMemo } from 'react'; // useEffect
import intl from 'utils/intl';
import { Button } from 'choerodon-ui/pro';
import SearchBarTable from '@/components/SearchBarTable';
import { colorRender } from './hook';

const commonPrompt = 'smdm.common.model.common';

const Index = ({ dataSet, handleEdit }) => {
  const columns = useMemo(() => {
    return [
      {
        name: 'enabledFlag',
        width: 250,
        renderer: ({ value, text }) => colorRender(value, text),
      },
      {
        name: 'attributeCode',
        width: 250,
      },
      {
        name: 'attributeName',
        width: 550,
      },
      {
        name: 'operate',
        width: 150,
        renderer: ({ record }) => (
          <Button type="c7n-pro" funcType="link" color="primary" onClick={() => handleEdit(record)}>
            {intl.get('hzero.common.button.edit').d('编辑')}
          </Button>
        ),
      },
    ];
  }, []);

  return (
    <div style={{ height: 'calc(100vh - 252px)' }}>
      <SearchBarTable
        style={{ maxHeight: 'calc(100% - 22px)' }}
        dataSet={dataSet}
        columns={columns}
        searchBarConfig={{
          fuzzyQueryCode: 'attributeCode',
          fuzzyQueryName: intl.get(`${commonPrompt}.attributeCode`).d('属性编码'),
          cacheFlag: true,
          expandable: false,
        }}
      />
    </div>
  );
};

export default Index;

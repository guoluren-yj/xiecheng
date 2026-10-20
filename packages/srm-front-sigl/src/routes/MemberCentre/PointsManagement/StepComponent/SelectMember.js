/**
 * 会员管理 - 积分列表弹窗
 * @Author: qingxiang.luo@going-link.com
 * @version: 0.0.1
 * @Date: 2021-03-23
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { observer } from 'mobx-react-lite';
import FilterBarTable from '_components/FilterBarTable';
import styles from './index.less';

const SelectMember = observer((props) => {
  const { dataSet } = props;

  const columns = () => {
    return [
      {
        name: 'memberCode',
      },
      {
        name: 'memberName',
      },
      {
        name: 'memberLabelRelationList',
        width: 230,
        renderer: ({ record }) => {
          const labelList = record.get('memberLabelRelationList') || [];
          return labelList.map((item) => item.labelName).join('、');
        },
      },
    ];
  };

  return (
    <div className={styles['select-member-table']}>
      <FilterBarTable
        customizedCode="SIGL.PONIT_MANAGE.SELECTMEMBER_LIST"
        dataSet={dataSet}
        columns={columns()}
        filterBarConfig={{
          defaultCollpase: true,
          collpase: true,
          defaultSortedField: 'creationDate',
          defaultSortedOrder: 'desc',
        }}
        style={{ maxHeight: `calc(100vh - 206px)` }}
      />
    </div>
  );
});

export default SelectMember;

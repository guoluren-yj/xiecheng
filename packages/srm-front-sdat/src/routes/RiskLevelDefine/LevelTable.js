import React from 'react';
import { Table } from 'choerodon-ui/pro';
import intl from 'utils/intl';

import styles from './index.less';

export default function LevelTable(props) {
  const { tableDS } = props;

  const textMap = {
    1: intl.get('sdat.riskLevelDefine.view.tag.lowRisk').d('低风险'),
    2: intl.get('sdat.riskLevelDefine.view.tag.middleRisk').d('中风险'),
    3: intl.get('sdat.riskLevelDefine.view.tag.highRisk').d('高风险'),
  };

  const styleMap = {
    1: styles['risk-low-level-tag'],
    2: styles['risk-middle-level-tag'],
    3: styles['risk-high-level-tag'],
  };

  const columns = () => {
    return [
      {
        name: 'riskLevel',
        renderer: ({ value }) => {
          const text = textMap[value];
          return <span className={styleMap[value]}>{text}</span>;
        },
        width: 120,
      },
      {
        name: 'scoreRange',
        editor: true,
        width: 200,
      },
      { name: 'levelDescription', editor: true },
    ];
  };

  return (
    <>
      <Table dataSet={tableDS} columns={columns()} queryBar="none" />
    </>
  );
}

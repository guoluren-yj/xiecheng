/**
 * RelevantTable - 关联匹配table
 * @date: 2021-09-16
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

import React, { Fragment } from 'react';
import { Alert } from 'choerodon-ui';
import { Table, Form, TextField, Icon } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import styles from '../index.less';

const RelevantTable = ({ dataSet, columns }) => {
  // 搜索条
  const renderBar = props => {
    const { queryDataSet } = props;
    if (queryDataSet) {
      return (
        <Form columns={3} dataSet={queryDataSet} className={styles.relevantForm}>
          <TextField
            name="multiCompanyQueryParam"
            clearButton
            placeholder={intl
              .get('sslm.workbench.model.queryBar.platformSupplier')
              .d('请输入平台供应商编码、名称查询')}
            onInput={event => {
              queryDataSet.current.set('multiCompanyQueryParam', event.target.value);
            }}
            onEnterDown={() => dataSet.query()}
            onBlur={() => dataSet.query()}
            onClear={() => dataSet.query()}
            prefix={<Icon type="search" onClick={() => dataSet.query()} />}
            style={{ width: 400 }}
          />
        </Form>
      );
    }
  };

  return (
    <Fragment>
      <Alert
        closable
        showIcon
        type="info"
        iconType="help"
        className={styles['relevant-alert']}
        message={intl
          .get('sslm.workbench.model.alert.matchRelevantMsg')
          .d(
            '如需将历史单据中平台/本地供应商为空的数据统一更新为当前平台供应商和本地供应商。在关联后可以使用“更新单据供应商数据”按钮对行数据进行标记，标记后，业务单据将在每天晚上执行刷新。'
          )}
      />
      <Table
        dataSet={dataSet}
        columns={columns}
        queryBar={renderBar}
        showCachedTips={false}
        customizable
        customizedCode="SSLM.SUPPLIER_WORKBENCH_LOCAL.RELEVANT"
        autoHeight={{ type: 'maxHeight', diff: 30 }}
      />
    </Fragment>
  );
};

export default RelevantTable;

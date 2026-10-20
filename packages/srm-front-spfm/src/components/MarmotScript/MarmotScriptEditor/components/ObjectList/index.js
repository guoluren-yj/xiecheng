/**
 * ObjectList
 * MarmotScriptEditor编辑器中的对象列表
 * @date: 2022-06-23
 * @author: zhangjinxin <jinxin.zhang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { useRef } from 'react';
import { Table, DataSet, TextField, Select, Output, Button } from 'choerodon-ui/pro';
import { Icon, message } from 'choerodon-ui';
import { observer } from 'mobx-react';
import { isArray, isEmpty, isString } from 'lodash';
import copy from 'copy-to-clipboard';
import withProps from 'utils/withProps';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getObjectListDs, getQueryFormDs } from './store/index';
import styles from './index.less';

function ObjectList(props = {}) {
  const {
    valueDs: { objectListDs, queryFormDs },
    testParam = {},
  } = props;
  const tableListRef = useRef([]); // 前端table搜索使用

  const optionPageDs = new DataSet({
    autoQuery: true,
    selection: 'single',
    paging: false,
    transport: {
      read: {
        url: `/marmot/v1/object-definition`,
        method: 'GET',
        params: { tenantNum: testParam.debugTenantNum || 'SRM' },
      },
    },
  });

  const selectionDs = new DataSet({
    autoQuery: true,
    fields: [
      {
        name: 'objectObj',
        type: 'object',
        textField: 'objectName',
        valueField: 'id',
        options: optionPageDs,
      },
      {
        name: 'objectName',
        bind: 'objectObj.objectName',
      },
      {
        name: 'objectCode',
        bind: 'objectObj.objectCode',
      },
      {
        name: 'id',
        bind: 'objectObj.id',
      },
    ],
  });

  const changeSelect = (record) => {
    if (!isEmpty(record) && isArray(record.paramList)) {
      objectListDs.loadData(record.paramList);
      // select的onchange事件会被useState阻断，所以使用ref暂存数据
      tableListRef.current = record.paramList;
    } else {
      objectListDs.loadData([]);
      tableListRef.current = [];
    }
    queryFormDs.reset();
  };

  const queryContent = () => {
    const queryText =
      queryFormDs && queryFormDs.current ? queryFormDs.current.get('description') : '';
    const tableRecords = tableListRef.current || [];
    if (queryText && isString(queryText)) {
      let resultList = [];
      if (tableRecords && isArray(tableRecords)) {
        resultList = tableRecords.filter(
          (item) =>
            item.paramDescription.indexOf(queryText) !== -1 ||
            item.paramName.indexOf(queryText) !== -1
        );
      }
      objectListDs.loadData(resultList);
    } else {
      objectListDs.loadData(tableRecords);
    }
  };

  // 将勾选项组合成object
  const copySelectObj = () => {
    let result = '{\n';
    objectListDs.selected.forEach((item) => {
      const { paramName } = item.toData();
      result = result.concat(`\t\t${paramName}: "",\n`);
    });
    result = result.concat(`\t}`);
    copyAndMes(result);
  };

  const copyText = (value) => {
    if (value && isString(value)) {
      copyAndMes(value);
    } else {
      const text = selectionDs && selectionDs.current ? selectionDs.current.get('objectCode') : '';
      if (text) {
        copyAndMes(text);
      }
    }
  };

  const copyAndMes = (value) => {
    copy(value);
    message.destroy();
    message.config({ duration: 2 });
    message.success(
      intl.get('spfm.adaptorTaskDetail.objectList.button.copy.success').d('复制成功'),
      undefined,
      undefined,
      'bottomRight'
    );
  };

  // 当table有值时才可以搜索
  const TableQueryBtn = observer(() => {
    const hasQueryText =
      queryFormDs && queryFormDs.current ? queryFormDs.current.get('description') : '';
    return (
      <TextField
        disabled={
          (objectListDs && objectListDs.records ? objectListDs.records.length === 0 : true) &&
          !hasQueryText
        }
        className={styles['objectList-table-input']}
        dataSet={queryFormDs}
        name="description"
        placeholder={intl
          .get('spfm.adaptorTaskDetail.objectList.search.title')
          .d('请输入编码或描述')}
        clearButton
        valueChangeAction="input"
        onEnterDown={() => queryContent()}
        onClear={() => queryContent()}
      />
    );
  });

  const TableSelectBtn = observer(() => {
    return (
      <Button
        className={styles['objectList-table-button']}
        disabled={objectListDs && objectListDs.selected ? objectListDs.selected.length === 0 : true}
        onClick={() => copySelectObj()}
      >
        {intl.get('spfm.adaptorTaskDetail.objectList.select.copy.button').d('复制勾选项')}
      </Button>
    );
  });

  const columns = [
    {
      name: 'paramName',
      width: 220,
      resizable: true,
      renderer: ({ value }) => (
        <div className={styles['objectList-table-columns']}>
          <Icon
            type="content_copy"
            className="objectList-table-columns-copy"
            onClick={() => copyText(value)}
          />
          {value}
        </div>
      ),
    },
    {
      name: 'paramDescription',
    },
  ];

  const searchMatcher = ({ record, text, textField }) => {
    return (
      record.get(textField).indexOf(text) !== -1 || record.get('objectCode').indexOf(text) !== -1
    );
  };

  return (
    <div className={styles['objectList-div']}>
      <div className="objectList-div-queryBar">
        <Select
          dataSet={selectionDs}
          name="objectObj"
          searchable
          searchFieldInPopup
          searchMatcher={searchMatcher}
          searchFieldProps={{ clearButton: true }}
          className="objectList-div-queryBar-select"
          onChange={changeSelect}
        />
        <Icon
          type="content_copy"
          className="objectList-div-queryBar-copy"
          onClick={() => copyText()}
        />
        <Output
          dataSet={selectionDs}
          name="objectCode"
          className="objectList-div-queryBar-output"
        />
      </div>
      <div className="objectList-table-queryBar">
        <TableQueryBtn />
        <TableSelectBtn />
      </div>
      <Table
        style={{ maxHeight: 'calc(100vh - 290px)' }}
        border="true"
        dataSet={objectListDs}
        columns={columns}
        pagination={false}
      />
    </div>
  );
}

export default formatterCollections({
  code: ['hzero.common', 'spfm.adaptorTaskDetail'],
})(
  withProps(
    () => {
      const objectListDs = new DataSet(getObjectListDs());
      const queryFormDs = new DataSet(getQueryFormDs());
      const valueDs = { objectListDs, queryFormDs };
      return { valueDs };
    },
    { cacheState: false, keepOriginDataSet: true }
  )(ObjectList)
);

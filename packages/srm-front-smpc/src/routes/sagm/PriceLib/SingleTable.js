import React, { useEffect, useMemo, useRef } from 'react';
import { Table, DataSet, Icon, TextField, Form, Button, Row, Col } from 'choerodon-ui/pro';
import classNames from 'classnames';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';

const dataStore = new Map();

function debounce(fn, delay = 200) {
  let timer;
  return function _fn(...rest) {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => fn(...rest), delay);
  };
}

function dataSelectDealWith({ dataSet, defaultValue, valueField, withDisableSelect }) {
  dataSet.forEach((f) => {
    if (withDisableSelect(f)) {
      Object.assign(f, { selectable: false });
    }
    if (defaultValue && f.get(valueField) === defaultValue) {
      dataSet.select(f);
    }
  });
}

export default function SingleTable(props) {
  const {
    record,
    name,
    modal,
    code,
    tableProps: {
      title,
      idField,
      filterFields = [],
      parentField,
      childField = 'children',
      requestFunc = (e) => e,
      withDisableSelect = (r) => r.get(childField),
    } = {},
  } = props;
  const tableRef = useRef();

  const searchDs = useMemo(
    () => new DataSet({ autoCreate: true, fields: [{ name: 'searchVal' }] }),
    []
  );

  const dataSet = useMemo(
    () =>
      new DataSet({
        paging: false,
        primaryKey: idField,
        selection: 'single',
        parentField,
        idField,
        // paging: 'server',
        expandField: 'expand',
        fields: [
          {
            name: 'myColumn',
            label: title,
          },
        ],
        events: {
          load: ({ dataSet: ds }) =>
            dataSelectDealWith({
              dataSet: ds,
              valueField: idField,
              defaultValue: record.get(name)?.[idField],
              withDisableSelect,
            }),
          append: ({ dataSet: ds }) =>
            dataSelectDealWith({
              dataSet: ds,
              valueField: idField,
              defaultValue: record.get(name)?.[idField],
              withDisableSelect,
            }),
        },
      }),
    []
  );

  modal.handleOk(() => {
    const selectRecord = dataSet.selected?.[0];
    if (selectRecord) {
      record.set(name, selectRecord.toData());
    }
  });

  useEffect(() => {
    if (!dataStore.has(code)) {
      fetchData();
    } else {
      initData();
    }
  }, []);

  function initData() {
    dataSet.loadData(dataStore.get(code));
  }

  async function fetchData() {
    dataSet.status = 'loading';
    const res = getResponse(await requestFunc());
    dataSet.status = 'ready';
    if (res) {
      dataStore.set(code, res);
      initData();
    }
  }

  function renderExpandIcon({ prefixCls, expanded, expandable, record: r, onExpand }) {
    const iconPrefixCls = `${prefixCls}-expand-icon`;
    const classString = classNames(iconPrefixCls, {
      [`${iconPrefixCls}-expanded`]: expanded,
    });

    return r.get(childField) ? (
      <Icon
        type="baseline-arrow_right"
        className={classString}
        onClick={onExpand}
        tabIndex={expandable ? 0 : -1}
      />
    ) : (
      <span style={{ display: 'inline-block', width: 20 }} />
    );
  }

  function handleLoadData({ record: r, dataSet: ds }) {
    const hasChild = r.get(childField);
    const isAddChild = !r.children;
    if (isAddChild && hasChild && hasChild.length) {
      ds.appendData(hasChild);
    }
  }

  // 数据筛选
  function dataFilter(data, val) {
    const filterData = [];
    const filterIds = {};
    // 添加数据的方法, 根据ids数据集判断重复不加
    const appendData = (item) => {
      if (!filterIds[item[idField]]) {
        filterData.push(item);
        Object.assign(filterIds, { [item[idField]]: item[idField] });
      }
    };

    // 递归筛选
    const deepFilterAppend = (childs) => {
      // 筛选出他的父节点以及所有子节点
      childs.forEach((f) => {
        const currentFilter = filterFields.some((s) => f[s]?.includes(val));
        const childFilter = deepFindAppend(f, val);
        if (currentFilter || childFilter) {
          appendData(f);
          if (f[childField]) {
            if (currentFilter) {
              deepAppend(f[childField], appendData);
            } else {
              deepFilterAppend(f[childField]);
            }
          }
        }
      });
    };

    deepFilterAppend(data);

    return filterData;
  }

  // 向下递归增加
  function deepAppend(deepData, appendData) {
    deepData.forEach((f) => {
      appendData(f);
      if (f[childField]) {
        deepAppend(f[childField], appendData);
      }
    });
  }

  // 向下递归判断是否存在
  function deepFindAppend(item, val) {
    let isFind = false;
    if (item[childField]) {
      item[childField].forEach((f) => {
        if (filterFields.some((s) => f[s]?.includes(val)) || deepFindAppend(f, val)) {
          isFind = true;
          return true;
        }
      });
    }
    return isFind;
  }

  function handleSearch() {
    const val = searchDs.current.get('searchVal');
    if (!val) {
      initData();
    } else {
      const data = dataStore.get(code) || [];
      const filterData = dataFilter(data, val);
      dataSet.loadData(filterData);
      if (tableRef.current) {
        tableRef.current.tableStore.expandAll();
      }
    }
  }

  function getRecordFilter(r) {
    const val = searchDs.current.get('searchVal');
    return val && filterFields.some((s) => r.get(s)?.includes(val));
  }

  return (
    <div>
      <Row style={{ display: 'flex', alignItems: 'center' }}>
        <Col span={18}>
          <Form dataSet={searchDs}>
            <TextField
              name="searchVal"
              clearButton
              onClear={initData}
              //   valueChangeAction="input"
              onBlur={handleSearch}
              onEnterDown={debounce(handleSearch)}
              placeholder={intl.get('sagm.common.model.inputNameOrCode').d('输入名称或编码')}
            />
          </Form>
        </Col>
        <Col span={6}>
          <Button color="primary" onClick={debounce(handleSearch)}>
            {intl.get('hzero.common.button.search').d('查询')}
          </Button>
        </Col>
      </Row>

      <Table
        mode="tree"
        selectionMode="click"
        alwaysShowRowBox
        dataSet={dataSet}
        columns={[
          {
            name: 'myColumn',
            renderer: ({ record: r }) => (
              <span style={{ color: getRecordFilter(r) ? 'red' : undefined }}>
                {filterFields.reduce((t, n) => (t ? `${t}-${r.get(n)}` : r.get(n)), '')}
              </span>
            ),
          },
        ]}
        treeLoadData={handleLoadData}
        expandIcon={renderExpandIcon}
        ref={(ref) => {
          tableRef.current = ref;
        }}
      />
    </div>
  );
}

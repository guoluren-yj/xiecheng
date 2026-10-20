// 商城目录统一弹窗
import React, { useRef, useMemo } from 'react';
import classNames from 'classnames';
import { Table, DataSet, Spin, Icon } from 'choerodon-ui/pro';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import request from 'utils/request';
import { SRM_SMPC } from '_utils/config';

const organizationId = getCurrentOrganizationId();

// 匹配路径参数
function getMatchUrl(orginUrl = '', matchPara = {}) {
  let url = orginUrl;
  Object.keys(matchPara).forEach((f) => {
    const reg = new RegExp(`{${f}}`, 'g');
    url = url.replace(reg, matchPara[f]);
  });
  return url;
}

// 查询子目录
function fetchSubData(subUrl, params) {
  return request(`${SRM_SMPC}/${subUrl}`, {
    method: 'GET',
    query: params,
  });
}

function dataSelectDealWith({ dataSet, defaultValue, valueField }) {
  dataSet.forEach((f) => {
    if (f.get('level') < 3) {
      Object.assign(f, { selectable: false });
    }
    if (defaultValue && f.get(valueField) === defaultValue) {
      dataSet.select(f);
    }
  });
}

export default function PageTreeTable(props) {
  const {
    record: formRecord,
    name,
    onChange = (e) => e,
    treeConfig = {},
    columns = [],
    modal,
    style = { maxHeight: 450 },
  } = props;
  const tableRef = useRef();
  const {
    idField = 'id',
    parentField = 'parentId',
    childrenField = 'children',
    url = '',
    subUrl = '',
  } = treeConfig;
  const defaultValue = formRecord.get(name)?.[idField];
  const dataSet = useMemo(
    () =>
      new DataSet({
        selection: 'single',
        primaryKey: idField,
        pageSize: 20,
        idField,
        parentField,
        paging: 'server',
        autoQuery: true,
        queryFields: columns.filter((f) => f.isQuery),
        fields: columns,
        events: {
          load: ({ dataSet: ds }) => {
            dataSelectDealWith({
              dataSet: ds,
              valueField: idField,
              defaultValue,
            });
            const deepAppend = (r) => {
              if (r[childrenField] && r[childrenField].length) {
                ds.appendData(r[childrenField]);
                r[childrenField].forEach((f) => deepAppend(f));
              }
            };
            // 查询条件存在时全部展开
            const isQueryParam = ds.queryDataSet.current?.dirty;
            if (isQueryParam) {
              ds.forEach((record) => {
                const child = record.get(childrenField);
                if (child && child.length > 0) {
                  ds.appendData(child);
                  child.forEach((f) => deepAppend(f));
                }
              });
              if (tableRef.current) {
                tableRef.current.tableStore.expandAll();
              }
            }
          },
          append: ({ dataSet: ds }) =>
            dataSelectDealWith({
              dataSet: ds,
              valueField: idField,
              defaultValue,
            }),
        },
        transport: {
          read: {
            url: `${SRM_SMPC}/${getMatchUrl(url, { organizationId })}`,
            method: 'GET',
          },
        },
      }),
    []
  );

  function handleConfirm(selectRecord) {
    if (selectRecord) {
      const newData = selectRecord.toData();
      if (newData[idField] !== defaultValue) {
        formRecord.set(name, newData);
        onChange(newData);
      }
    }
  }

  modal.handleOk(() => {
    const selectRecord = dataSet.selected?.[0];
    handleConfirm(selectRecord);
  });

  function renderExpandIcon({ prefixCls, expanded, expandable, record, onExpand }) {
    const iconPrefixCls = `${prefixCls}-expand-icon`;
    const classString = classNames(iconPrefixCls, {
      [`${iconPrefixCls}-expanded`]: expanded,
    });

    if (record.getState('loading') === true) {
      // 自定义状态渲染
      return <Spin delay={200} size="small" />;
    }

    return record.get('level') < 3 ? (
      <Icon
        type="baseline-arrow_right"
        className={classString}
        onClick={onExpand}
        tabIndex={expandable ? 0 : -1}
      />
    ) : (
      <span className={classString} style={{ marginLeft: '8px' }} />
    );
  }

  async function handleLoadData({ record }) {
    const { [idField]: id, level, [childrenField]: children } = record.toData();
    const matchUrl = getMatchUrl(subUrl, { [idField]: id, organizationId });
    if (!record.children && level < 3) {
      if (children) {
        dataSet.appendData(children);
      } else {
        record.setState('loading', true);
        const result = getResponse(await fetchSubData(matchUrl));
        record.setState('loading', false);
        if (result) {
          dataSet.appendData(result);
        }
      }
    }
  }

  return (
    <Table
      mode="tree"
      customizedCode="three.catalogOrCategory.lov"
      style={style}
      selectionMode="click"
      alwaysShowRowBox
      queryFieldsLimit={2}
      dataSet={dataSet}
      columns={columns}
      expandIcon={renderExpandIcon}
      treeLoadData={handleLoadData}
      onRow={({ record }) => ({
        onDoubleClick: () => {
          if (record.selectable) {
            handleConfirm(record);
            modal.close();
          }
        },
      })}
      ref={(ref) => {
        tableRef.current = ref;
      }}
    />
  );
}

/* eslint-disable react/jsx-indent */
/* eslint-disable no-param-reassign */
import React, { useState } from 'react';
import intl from 'utils/intl';
import { Button, Form, Lov } from 'choerodon-ui/pro';

const QueryBarMore = ({
  queryFields,
  buttons,
  queryFieldsLimit = 3,
  dataSet,
  queryDataSet,
  defaultShowMore,
  onBeforeQuery,
  renderRight,
}) => {
  const [hidden, setHidden] = useState(!defaultShowMore);
  const handleToggle = () => {
    setHidden(!hidden);
  };
  const query = async () => {
    if (await dataSet.validate(false, false)) {
      if (onBeforeQuery) {
        onBeforeQuery({ dataSet });
      }
      await dataSet.query();
    }
  };

  let index = -1;
  queryFields.forEach((item, i) => {
    if (item.key === 'categoryObj') {
      index = i;
    }
  });

  const renderFields = [...queryFields];

  if (index > -1) {
    // 存在树形 lov
    renderFields.splice(index, 1);
  }

  return (
    <div>
      {queryDataSet ? (
        <div style={{ display: 'flex', marginBottom: '10px', alignItems: 'flex-start' }}>
          <Form
            style={{ flex: 'auto' }}
            columns={queryFieldsLimit}
            dataSet={queryDataSet}
            // labelWidth={125}
            labelLayout="float"
            onKeyDown={(e) => {
              if (e.keyCode === 13) return query();
            }}
          >
            {hidden ? renderFields.slice(0, queryFieldsLimit) : renderFields}
            {index > -1 &&
            (queryFields.length <= queryFieldsLimit ||
              (queryFields.length > queryFieldsLimit && !hidden)) ? (
              <Lov
                name="categoryObj"
                searchFieldInPopup
                tableProps={{
                  mode: 'tree',
                  treeAsync: true,
                  alwaysShowRowBox: true,
                  selectionMode: 'rowbox',
                  onRow: ({ record: tableRecord }) => {
                    const nodeProps = { disabled: false };
                    if (tableRecord.get('hasChild') === 0) {
                      nodeProps.isLeaf = true;
                    }
                    return nodeProps;
                  },
                }}
              />
            ) : null}
          </Form>
          <div
            style={{
              marginLeft: '16px',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {queryFields.length > queryFieldsLimit && (
              <Button onClick={handleToggle}>
                {hidden
                  ? intl.get('hzero.common.button.viewMore').d('更多查询')
                  : intl.get('hzero.common.button.collected').d('收起查询')}
              </Button>
            )}
            <Button
              onClick={() => {
                if (queryDataSet.current) {
                  queryDataSet.current.reset();
                }
                queryDataSet.data = [];
                dataSet.fireEvent('queryBarReset', {
                  dataSet,
                  queryFields,
                });
              }}
            >
              {intl.get('hzero.common.button.reset').d('重置')}
            </Button>
            <Button dataSet={null} color="primary" onClick={query}>
              {intl.get('hzero.common.button.search').d('查询')}
            </Button>
            {renderRight && (
              <div style={{ display: 'inline-block', marginLeft: '50px' }}>{renderRight()}</div>
            )}
          </div>
        </div>
      ) : null}
      {buttons && buttons.length ? <div style={{ marginBottom: 4 }}>{buttons}</div> : null}
    </div>
  );
};

export default QueryBarMore;

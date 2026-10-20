/* eslint-disable no-param-reassign */
import React, { useState } from 'react';
import intl from 'utils/intl';
import { Button, Form } from 'choerodon-ui/pro';

const QueryBarMore = ({
  queryFields,
  buttons,
  queryFieldsLimit = 3,
  dataSet,
  queryDataSet,
  defaultShowMore,
  onBeforeQuery,
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

  return (
    <div>
      {queryDataSet ? (
        <div style={{ display: 'flex', marginBottom: '10px', alignItems: 'flex-start' }}>
          <Form
            style={{ flex: 'auto' }}
            columns={queryFieldsLimit}
            dataSet={queryDataSet}
            labelWidth={60}
            onKeyDown={(e) => {
              if (e.keyCode === 13) return query();
            }}
            labelLayout="float"
          >
            {hidden ? queryFields.slice(0, queryFieldsLimit) : queryFields}
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
          </div>
        </div>
      ) : null}
      {buttons && buttons.length ? <div style={{ marginBottom: 4 }}>{buttons}</div> : null}
    </div>
  );
};

export default QueryBarMore;

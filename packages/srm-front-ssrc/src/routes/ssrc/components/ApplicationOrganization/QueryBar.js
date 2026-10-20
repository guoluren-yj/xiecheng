import React from 'react';
import { Button, Form, Table } from 'choerodon-ui/pro';
import { Row, Col } from 'choerodon-ui';

import intl from 'utils/intl';

const { FilterBar } = Table;

const QueryBar = (props) => {
  const {
    queryFields = [],
    queryDataSet,
    queryFieldsLimit = 2,
    buttons = null,
    defaultShowMore = true,
    filterBarVisible = false,
    handleQuery = () => {},
  } = props;
  const [showMore, setShowMore] = React.useState(defaultShowMore);
  const toggleShowMore = React.useCallback(() => setShowMore(!showMore), [showMore]);
  const handleReset = React.useCallback(() => queryDataSet.reset(), [queryDataSet]);

  if (queryDataSet) {
    return (
      <>
        <Row gutter={12} style={{ marginTop: '-10px', marginBottom: '6px' }}>
          <Col span={18}>
            <Form columns={queryFieldsLimit} dataSet={queryDataSet}>
              {showMore ? queryFields : queryFields.slice(0, queryFieldsLimit)}
            </Form>
          </Col>
          <Col span={6} style={{ marginTop: '10px', textAlign: 'right' }}>
            <Button onClick={handleReset}>{intl.get('hzero.common.button.reset').d('重置')}</Button>
            <Button dataSet={null} onClick={handleQuery} color="primary">
              {intl.get('hzero.common.button.search').d('查询')}
            </Button>
            {queryFields?.length > queryFieldsLimit ? (
              <Button onClick={toggleShowMore}>
                {!showMore
                  ? intl.get('hzero.common.button.viewMore').d('更多查询')
                  : intl.get('hzero.common.button.collected').d('收起查询')}
              </Button>
            ) : null}
            {buttons}
          </Col>
        </Row>
        {filterBarVisible ? <FilterBar {...props} buttons={[]} /> : null}
      </>
    );
  }
  return null;
};

export default QueryBar;

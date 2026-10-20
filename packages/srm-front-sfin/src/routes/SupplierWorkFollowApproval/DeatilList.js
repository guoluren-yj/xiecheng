import React, { Component } from 'react';
import { Table, Collapse, Icon, Form } from 'hzero-ui';
import { sum, isNumber } from 'lodash';
import intl from 'utils/intl';
import classnames from 'classnames';
import { Bind } from 'lodash-decorators';

import { DETAIL_DEFAULT_CLASSNAME } from 'utils/constants';
import styles from './index.less';

const { Panel } = Collapse;
export default class List extends Component {
  constructor(props) {
    super(props);
    this.state = {
      collapseKeys: ['list'],
    };
  }

  @Bind()
  onCollapseChange(collapseKeys) {
    this.setState({
      collapseKeys,
    });
  }

  render() {
    const { pagination = {}, dataSource = [], loading, handleSearch } = this.props;
    const { collapseKeys } = this.state;
    const columns = [
      {
        title: intl.get(`sfin.common.model.common.lineNumber`).d('序号'),
        dataIndex: 'lineNumber',
        width: 150,
      },
      {
        title: intl.get(`sfin.common.model.common.claimHeaderNum`).d('索赔单号'),
        dataIndex: 'claimHeaderNum',
        width: 100,
      },
      {
        title: intl.get(`sfin.common.model.common.displayPoNum`).d('订单号'),
        dataIndex: 'displayPoNum',
        width: 180,
      },
      {
        title: intl.get(`sfin.common.model.common.pcNum`).d('协议编号'),
        dataIndex: 'pcNum',
        width: 100,
      },
    ];
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0))) + 240;
    return (
      <Form className={classnames(DETAIL_DEFAULT_CLASSNAME, styles['detail-form'])}>
        <Collapse
          className="form-collapse"
          defaultActiveKey={['list']}
          onChange={this.onCollapseChange}
        >
          <Panel
            forceRender
            showArrow={false}
            header={
              <React.Fragment>
                <h3>{intl.get(`sfin.common.model.common.sourceFromNum`).d('关联单据')}</h3>
                <a className="expand-button">
                  {collapseKeys.includes('list')
                    ? intl.get('hzero.common.button.up').d('收起')
                    : intl.get('hzero.common.button.expand').d('展开')}
                  {<Icon type={collapseKeys.includes('list') ? 'up' : 'down'} />}
                </a>
              </React.Fragment>
            }
            key="list"
          >
            <Table
              bordered
              loading={loading}
              columns={columns}
              dataSource={dataSource}
              pagination={pagination}
              scroll={{ x: scrollX }}
              rowKey="upstreamId"
              onChange={(page) => handleSearch(page)}
            />
          </Panel>
        </Collapse>
      </Form>
    );
  }
}

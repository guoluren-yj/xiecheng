import React, { Component } from 'react';
import { Spin } from 'hzero-ui';
import { isNumber } from 'lodash';
import { Bind } from 'lodash-decorators';
import notification from 'utils/notification';
import { getCurrentTableConfig, LOCAL_TABLE_CONFIG_KEY, stringToJSON } from '../utils';

export default class WrapIndividuationTable extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      tableConfig: {},
    };
  }

  componentDidMount() {
    const { baseConfig, individualizedTabelCode } = this.props;
    const { tableConfId, lastUpdateTime } =
      baseConfig.find(o => o.tableKey === individualizedTabelCode) || {};
    if (isNumber(tableConfId)) {
      this.fetchConfig(tableConfId, lastUpdateTime);
    }
  }

  componentDidUpdate(prevProps) {
    const { baseConfig, individualizedTabelCode } = this.props;
    const { tableConfId, lastUpdateTime } =
      baseConfig.find(o => o.tableKey === individualizedTabelCode) || {};
    const prevTableConfId = (
      prevProps.baseConfig.find(o => o.tableKey === individualizedTabelCode) || {}
    ).tableConfId;

    if (
      isNumber(tableConfId) &&
      tableConfId !== prevTableConfId &&
      lastUpdateTime !== prevProps.lastUpdateTime
    ) {
      this.fetchConfig(tableConfId, lastUpdateTime);
    }
  }

  @Bind()
  fetchConfig(tableConfId, lastUpdateTime) {
    const { individualizedTabelCode } = this.props;
    const lastModifiedConfig =
      stringToJSON(window.localStorage.getItem(LOCAL_TABLE_CONFIG_KEY)) || {};
    const localTableConfig = lastModifiedConfig[individualizedTabelCode] || {};
    if (lastUpdateTime !== localTableConfig.lastUpdateTime) {
      this.setState(() => ({ loading: true }));
      getCurrentTableConfig(tableConfId)
        .then(res => {
          if (res && res.failed) {
            throw res;
          } else {
            lastModifiedConfig[individualizedTabelCode] = res;
            window.localStorage.setItem(LOCAL_TABLE_CONFIG_KEY, JSON.stringify(lastModifiedConfig));

            this.setState(() => ({ loading: false, tableConfig: res }));
          }
        })
        .catch(e => {
          notification.error({ description: e.message });
          this.setState(() => ({ loading: false }));
        });
    } else {
      this.setState(() => ({ tableConfig: localTableConfig }));
    }
  }

  render() {
    const { assignTableConfig, TableComponent, tableProps } = this.props;
    const { tableConfig, loading } = this.state;

    const warpTableProps = assignTableConfig(tableProps, tableConfig);

    return (
      <Spin spinning={loading}>
        <TableComponent {...warpTableProps} />
      </Spin>
    );
  }
}

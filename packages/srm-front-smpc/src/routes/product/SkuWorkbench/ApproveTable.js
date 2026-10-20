import React, { Component } from 'react';
import { Alert } from 'choerodon-ui';
import { Table, Icon, Spin } from 'choerodon-ui/pro';
import classNames from 'classnames';
import { Bind } from 'lodash-decorators';
import { withRouter } from 'react-router-dom';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { fetchLastProduct } from '../SkuApprove/api';

import styles from '../SkuApprove/index.less';

@withRouter
export default class ApproveTabs extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expand: true,
    };
  }

  @Bind()
  expandIcon({ prefixCls, expanded, expandable, record, onExpand }) {
    const approvalFrom = record.get('approvalFrom');
    const iconPrefixCls = `${prefixCls}-expand-icon`;
    const classString = classNames(iconPrefixCls, {
      [`${iconPrefixCls}-expanded`]: expanded,
    });
    if (
      !record.get('__versionId') &&
      approvalFrom !== 'SAGM' &&
      record.get('approveType') !== 'INVALID'
    ) {
      if (record.getState('loading') === true) {
        // 自定义状态渲染
        return <Spin delay={200} size="small" />;
      }

      return (
        <Icon
          type="baseline-arrow_right"
          className={classString}
          onClick={onExpand}
          tabIndex={expandable ? 0 : -1}
          style={{ marginTop: 5 }}
        />
      );
    }

    if (record.get('__versionId')) {
      return <span className={classString} />;
    }
    return <span className={classString} style={{ display: 'inline-block', width: 20 }} />;
  }

  // 点击展开子节点
  @Bind()
  async handleExpand(expanded, record) {
    const params = record.toData();
    const { dataSet } = this.props;
    const approvalFrom = record.get('approvalFrom');
    if (expanded && !record.children && approvalFrom !== 'SAGM' && !record.get('__versionId')) {
      record.setState('loading', true);
      const result = getResponse(await fetchLastProduct(params));
      if (result) {
        const __versionId = record.get('skuTemporaryId');
        // 获取子结点数据，绑定父节点
        const recordsChildren = {
          ...result,
          __versionId,
          skuTemporaryId: `${record.get('skuTemporaryId')}-old`,
        };
        // this.setState({ expand: true });
        record.init('keyList', result.keyList);
        record.setState('loading', false);
        // 生成完成的dataSet数据注意会触发load event
        dataSet.appendData([recordsChildren]);
      }
    }
  }

  handleLoadData = ({ record }) => {
    this.handleExpand(true, record);
  };

  render() {
    const {
      onRef = (e) => e,
      searchBarProps,
      customizedCode,
      customizeTable,
      ...tableProps
    } = this.props;
    const { expand } = this.state;
    const TableDom = searchBarProps ? SearchBarTable : Table;
    const wrapperStyle = searchBarProps
      ? expand
        ? { height: 'calc(100vh - 280px)' }
        : { height: 'calc(100vh - 252px)' }
      : {};
    return (
      <React.Fragment>
        <Alert
          style={{ border: 'none', color: '#f88d10', marginBottom: 16 }}
          message={intl
            .get('smpc.product.view.getChangesFromHistoryVersion')
            .d('黄色高亮表示对比历史版本有更改的部分')}
          type="warning"
          closable
          showIcon
          iconType="info"
          onClose={() => this.setState({ expand: false })}
        />
        <div style={wrapperStyle}>
          {customizeTable(
            { code: customizedCode },
            <TableDom
              {...tableProps}
              ref={(ref) => {
                if (!searchBarProps) {
                  onRef(ref);
                }
              }}
              tableRef={(ref) => {
                if (searchBarProps) {
                  onRef(ref);
                }
              }}
              mode="tree"
              indentSize={18}
              treeLoadData={this.handleLoadData}
              expandIcon={this.expandIcon}
              className={styles['sku-approve-table']}
              onRow={({ record }) => ({
                className: record.get('__versionId') ? styles['approve-history'] : '',
              })}
              {...searchBarProps}
            />
          )}
        </div>
      </React.Fragment>
    );
  }
}

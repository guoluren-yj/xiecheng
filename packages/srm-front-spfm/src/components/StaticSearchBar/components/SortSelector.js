import React, { Component } from 'react';
import { Dropdown, Tooltip } from 'choerodon-ui/pro';
import { Icon, Menu } from 'choerodon-ui';
import { Action } from 'choerodon-ui/pro/lib/trigger/enum';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import { stylePrefix, SortFieldName } from '../utils/enum';

const SortDownIcon =
  'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iMTZweCIgaGVpZ2h0PSIxNnB4IiB2aWV3Qm94PSIwIDAgMTYgMTYiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8dGl0bGU+aWNvbi1hc2NlbmRpbmc8L3RpdGxlPgogICAgPGcgaWQ9Iue7hOS7tiIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+CiAgICAgICAgPGcgaWQ9IlNlYXJjaC9Db21wb25lbnRzL1NvcnQiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC05Ny4wMDAwMDAsIC04LjAwMDAwMCkiPgogICAgICAgICAgICA8ZyBpZD0iaWNvbi1hc2NlbmRpbmciIHRyYW5zZm9ybT0idHJhbnNsYXRlKDk3LjAwMDAwMCwgOC4wMDAwMDApIj4KICAgICAgICAgICAgICAgIDxyZWN0IGlkPSLnn6nlvaIiIHg9IjAiIHk9IjAiIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiI+PC9yZWN0PgogICAgICAgICAgICAgICAgPGcgaWQ9Iue8lue7hC0yMiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMS4yNTAwMDAsIDQuMDAwMDAwKSIgZmlsbC1ydWxlPSJub256ZXJvIj4KICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPSJNNyw2LjY2NjY2NjY3IEw3LDggTDAsOCBMMCw2LjY2NjY2NjY3IEw3LDYuNjY2NjY2NjcgWiBNNS42LDQgTDUuNiw1LjMzMzMzMzMzIEwwLDUuMzMzMzMzMzMgTDAsNCBMNS42LDQgWiBNNC4yLDEuMzMzMzMzMzMgTDQuMiwyLjY2NjY2NjY3IEwwLDIuNjY2NjY2NjcgTDAsMS4zMzMzMzMzMyBMNC4yLDEuMzMzMzMzMzMgWiIgaWQ9IuW9oueKtue7k+WQiCIgZmlsbC1vcGFjaXR5PSIwLjg1IiBmaWxsPSIjMDAwMDAwIj48L3BhdGg+CiAgICAgICAgICAgICAgICAgICAgPHBvbHlnb24gaWQ9IuW9oueKtue7k+WQiC1wYXRoIiBmaWxsPSIjMzZDMkNGIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxMC4wMDAwMDAsIDQuMDAwMDAwKSBzY2FsZSgxLCAtMSkgdHJhbnNsYXRlKC0xMC4wMDAwMDAsIC00LjAwMDAwMCkgIiBwb2ludHM9IjEwIDAgMTMuNSA0IDEwLjcgNCAxMC43IDggOS4zIDggOS4zIDQgNi41IDQiPjwvcG9seWdvbj4KICAgICAgICAgICAgICAgIDwvZz4KICAgICAgICAgICAgPC9nPgogICAgICAgIDwvZz4KICAgIDwvZz4KPC9zdmc+';
const SortUpIcon =
  'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iMTZweCIgaGVpZ2h0PSIxNnB4IiB2aWV3Qm94PSIwIDAgMTYgMTYiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8dGl0bGU+aWNvbi1hc2NlbmRpbmc8L3RpdGxlPgogICAgPGcgaWQ9Iue7hOS7tiIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+CiAgICAgICAgPGcgaWQ9IlNlYXJjaC9Db21wb25lbnRzL1NvcnQiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC05Ny4wMDAwMDAsIC04LjAwMDAwMCkiPgogICAgICAgICAgICA8ZyBpZD0iaWNvbi1hc2NlbmRpbmciIHRyYW5zZm9ybT0idHJhbnNsYXRlKDk3LjAwMDAwMCwgOC4wMDAwMDApIj4KICAgICAgICAgICAgICAgIDxyZWN0IGlkPSLnn6nlvaIiIHg9IjAiIHk9IjAiIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiI+PC9yZWN0PgogICAgICAgICAgICAgICAgPGcgaWQ9Iue8lue7hC0yMiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMS4yNTAwMDAsIDQuMDAwMDAwKSIgZmlsbC1ydWxlPSJub256ZXJvIj4KICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPSJNNyw2LjY2NjY2NjY3IEw3LDggTDAsOCBMMCw2LjY2NjY2NjY3IEw3LDYuNjY2NjY2NjcgWiBNNS42LDQgTDUuNiw1LjMzMzMzMzMzIEwwLDUuMzMzMzMzMzMgTDAsNCBMNS42LDQgWiBNNC4yLDEuMzMzMzMzMzMgTDQuMiwyLjY2NjY2NjY3IEwwLDIuNjY2NjY2NjcgTDAsMS4zMzMzMzMzMyBMNC4yLDEuMzMzMzMzMzMgWiIgaWQ9IuW9oueKtue7k+WQiCIgZmlsbC1vcGFjaXR5PSIwLjg1IiBmaWxsPSIjMDAwMDAwIj48L3BhdGg+CiAgICAgICAgICAgICAgICAgICAgPHBvbHlnb24gaWQ9IuW9oueKtue7k+WQiC1wYXRoIiBmaWxsPSIjMzZDMkNGIiBwb2ludHM9IjEwIDAgMTMuNSA0IDEwLjcgNCAxMC43IDggOS4zIDggOS4zIDQgNi41IDQiPjwvcG9seWdvbj4KICAgICAgICAgICAgICAgIDwvZz4KICAgICAgICAgICAgPC9nPgogICAgICAgIDwvZz4KICAgIDwvZz4KPC9zdmc+';

// interface ISortSelector {
//   dataSet?: DataSet;
//   filter: filterProperties; // 当前筛选器
//   fields: fieldProperties[]; // 可排序的字段列表
//   onRef: any;
// }

export default class SortSelector extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      sortFlag: 'asc',
      sortFieldCode: null,
    };
  }

  componentDidMount() {
    const { fields = [], filter } = this.props;
    this.handleSortConfig(filter, fields);
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.filter.filterCode &&
      nextProps.filter.filterCode !== this.props.filter.filterCode
    ) {
      const { fields = [], filter } = nextProps;
      this.handleSortConfig(filter, fields);
    }
  }

  @Bind()
  handleReset() {
    const { fields = [], filter } = this.props;
    this.handleSortConfig(filter, fields);
  }

  @Bind()
  handleSortConfig(filter, fields) {
    const { defaultSortedField, defaultSortedOrder } = filter;
    let sortFlag = defaultSortedOrder;
    let sortFieldCode = defaultSortedField;
    if (fields.length > 0) {
      if (!sortFieldCode || !fields.some((item) => item.name === sortFieldCode)) {
        sortFieldCode = fields[0].name;
      }
      sortFlag = sortFlag || 'asc';
    }
    this.setState({
      sortFlag,
      sortFieldCode,
    });
  }

  @Bind()
  handleToogleSortFlag() {
    const { sortFlag } = this.state;
    const newSortFlag = sortFlag === 'asc' ? 'desc' : 'asc';
    this.setState({ sortFlag: newSortFlag });
    this.handleQuery('sortFlag', newSortFlag);
  }

  @Bind()
  handleQuery(key, value) {
    const { dataSet } = this.props;
    if (dataSet && dataSet.current) {
      const sortFieldValue = dataSet.current.get(SortFieldName) || '';
      let sortFieldCode = sortFieldValue.split(':')[0];
      let sortFlag = sortFieldValue.split(':')[1];
      if (key === 'sortFieldCode') {
        sortFieldCode = value;
      } else {
        sortFlag = value;
      }
      dataSet.current.set(SortFieldName, `${sortFieldCode}:${sortFlag}`);
    }
  }

  @Bind()
  handleSelectSortField({ key }) {
    this.setState({ sortFieldCode: key });
    this.handleQuery('sortFieldCode', key);
  }

  @Bind()
  renderOverlayMenu() {
    const { fields = [] } = this.props;
    const { sortFieldCode } = this.state;
    return (
      <Menu
        onClick={this.handleSelectSortField}
        className={`${stylePrefix}-sort-menu`}
        defaultSelectedKeys={[sortFieldCode]}
      >
        {fields.map((item) => (
          <Menu.Item key={item.name} className={`${stylePrefix}-sort-menu-item`}>
            {intl.get('sdps.common.view.label.orderBy').d('按')}
            {item.label}
          </Menu.Item>
        ))}
      </Menu>
    );
  }

  render() {
    const { sortFlag, sortFieldCode } = this.state;
    const { fields = [] } = this.props;
    const overlayMenu = this.renderOverlayMenu();
    const sortField =
      fields.length < 1 || !sortFieldCode
        ? {}
        : fields.find((item) => item.name === sortFieldCode) || {};
    return (
      <span className={`${stylePrefix}-sort`}>
        <Dropdown overlay={overlayMenu} trigger={[Action.click]}>
          <span className={`${stylePrefix}-sort-control`}>
            {sortField.label
              ? `${intl.get('sdps.common.view.label.orderBy').d('按')}${sortField.label}`
              : ''}
            <Icon type="expand_more" />
          </span>
        </Dropdown>
        <Tooltip
          title={
            sortFlag === 'asc'
              ? intl.get('srm.filterBar.view.tooltip.asc').d('升序')
              : intl.get('srm.filterBar.view.tooltip.desc').d('降序')
          }
        >
          <img
            alt="orderBy"
            src={sortFlag === 'asc' ? SortUpIcon : SortDownIcon}
            onClick={this.handleToogleSortFlag}
            style={{ cursor: 'pointer' }}
          />
        </Tooltip>
      </span>
    );
  }
}

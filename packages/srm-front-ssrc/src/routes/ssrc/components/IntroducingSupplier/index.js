/**
 * 引入供应商
 * @date: 2021-8-18
 * @author: LZJ <zhijian.li@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

import React, { Component } from 'react';
import { Table, DataSet, Icon } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import classNames from 'classnames';

import formatterCollections from 'utils/intl/formatterCollections';

import { fetchRFDS, fetchSupplierDS } from './IntroducingSupplierDS';
import style from './index.less';

@formatterCollections({
  code: ['ssrc.common'],
})
export default class IntroducingSuppliers extends Component {
  constructor(props) {
    super(props);
    if (props.onRef) {
      props.onRef(this);
    }
    this.state = {
      supplierDS: {},
    };
    this.tableDS = new DataSet(
      fetchRFDS(props.sourceProjectId, props.targetSourceCategory, props.companyId)
    );
  }

  componentDidMount() {
    if (this.props.companyId) {
      this.tableDS.query();
    }
  }

  @Bind()
  onExpand(expanded, record) {
    const { supplierDS } = this.state;
    if (!supplierDS[record.get('sourceProjectId')]) {
      supplierDS[record.get('sourceProjectId')] = new DataSet(fetchSupplierDS(record));
      this.setState(
        {
          supplierDS: {
            ...this.state.supplierDS,
            [record.get('sourceProjectId')]: supplierDS[record.get('sourceProjectId')],
          },
        },
        () => {
          supplierDS[record.get('sourceProjectId')].loadData(record.get('supplierDTOList') || []);
        }
      );
    }
  }

  @Bind()
  renderExpandedRow({ record }) {
    const columns = [
      {
        name: 'supplierCompanyNum',
        width: 150,
      },
      {
        name: 'supplierCompanyName',
        width: 350,
      },
      {
        name: 'suggestedRemark',
        width: 200,
      },
      // {
      //   name: 'rfxHeaderLov',
      //   editor: true,
      //   width: 120,
      // },
    ];
    return (
      <Table dataSet={this.state.supplierDS[record.get('sourceProjectId')]} columns={columns} />
    );
  }

  // icon渲染
  @Bind()
  expandIcon({ prefixCls, expanded, expandable, record, onExpand }) {
    if (!record.get('supplierDTOList')?.length) {
      // 子结点渲染
      return <span style={{ paddingLeft: '0.18rem' }} />;
    }

    const iconPrefixCls = `${prefixCls}-expand-icon`;
    const classString = classNames(iconPrefixCls, {
      [`${iconPrefixCls}-expanded`]: expanded,
    });
    return (
      <Icon
        type="baseline-arrow_right"
        className={classString}
        onClick={onExpand}
        tabIndex={expandable ? 0 : -1}
      />
    );
  }

  render() {
    const columns = [
      {
        name: 'rfNum',
        width: 150,
      },
      {
        name: 'rfTitle',
        width: 200,
      },
      {
        name: 'sourceCategory',
        width: 150,
      },
      {
        name: 'rfRemark',
        width: 200,
      },
    ];
    return (
      <Table
        dataSet={this.tableDS}
        columns={columns}
        queryFieldsLimit={2}
        expandedRowRenderer={this.renderExpandedRow}
        expandIcon={this.expandIcon}
        onExpand={this.onExpand}
        className={style.table}
      />
    );
  }
}

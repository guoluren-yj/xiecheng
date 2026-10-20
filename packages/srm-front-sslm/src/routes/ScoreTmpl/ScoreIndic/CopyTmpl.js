/**
 * CopyTmpl - 复制已有模板
 * @date: 2018-08-09
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Table } from 'hzero-ui';
import lodash from 'lodash';
import { Bind } from 'lodash-decorators';
import { Content } from 'components/Page';
import intl from 'utils/intl';

export default class CopyTmpl extends PureComponent {
  state = {
    selectedRows: [],
  };

  componentDidMount() {
    const { getCopyTmplRef } = this.props;
    if (lodash.isFunction(getCopyTmplRef)) {
      getCopyTmplRef(this);
    }
  }

  /**
   * 查询发布的模板
   * @param {*} _ 占位符
   * @param {Object} record 行记录
   */
  @Bind()
  queryPublishedTmpl(_, record) {
    const { queryPublishedTmpl } = this.props;
    if (lodash.isFunction(queryPublishedTmpl)) {
      queryPublishedTmpl(record.templateId);
    }
  }

  /**
   * 勾选行数据
   * @param {*} _ 占位符
   * @param {Arrary} rows 选中的数据
   */
  @Bind()
  selectCopyTmplRows(_, rows) {
    this.setState({
      selectedRows: rows,
    });
  }

  /**
   * 保存复制模板
   */
  @Bind()
  saveCopyTmpl() {
    const { selectedRows } = this.state;
    const { saveCopyData } = this.props;
    if (lodash.isFunction(saveCopyData)) {
      saveCopyData(selectedRows.map(n => n.indicateId));
    }
  }

  /**
   * 获取所以子元素
   * @param {Object} record 行记录
   */
  @Bind()
  getAllChilds(record) {
    let arr = [];
    const findChilds = r => {
      if (r.children) {
        arr = lodash.unionWith(arr, r.children);
        r.children.forEach(child => {
          findChilds(child);
        });
      }
    };
    findChilds(record);
    return arr;
  }

  /**
   * 选择子元素
   * @param {Object} record 行记录
   * @param {Boolean} selected 是否选择
   * @param {Array} selectedRows 选择的行数据
   */
  @Bind()
  selectChilds(record, selected, selectedRows) {
    const getAllChilds = this.getAllChilds(record);
    this.setState({
      selectedRows: selected
        ? lodash.unionWith(selectedRows, getAllChilds)
        : lodash.differenceBy(selectedRows, getAllChilds, 'categoryId'),
    });
  }

  render() {
    const { tmplData, loading } = this.props;
    const { selectedRows } = this.state;
    const columns = [
      {
        title: intl.get('sslm.scoreIndic.model.scoreIndic.indicateCode').d('指标编码'),
        dataIndex: 'indicateCode',
        width: 300,
      },
      {
        title: intl.get('sslm.scoreIndic.model.scoreIndic.description').d('指标名称'),
        dataIndex: 'description',
        width: 200,
      },
      {
        title: intl.get('sslm.scoreIndic.view.menu.score').d('分值'),
        width: 200,
        children: [
          {
            title: intl.get('sslm.scoreIndic.model.scoreIndic.scoreFrom').d('分值从'),
            dataIndex: 'scoreFrom',
            width: 100,
            align: 'right',
          },
          {
            title: intl.get('sslm.scoreIndic.model.scoreIndic.scoreTo').d('分值至'),
            dataIndex: 'scoreTo',
            width: 100,
            align: 'right',
          },
        ],
      },
      {
        title: intl.get('sslm.scoreIndic.model.scoreIndic.defaultScore').d('缺省分值'),
        dataIndex: 'defaultScore',
        align: 'center',
        width: 100,
      },
    ];
    const rowSelection = {
      selectedRowKeys: selectedRows.map(n => n.indicateId),
      onChange: this.selectCopyTmplRows,
      onSelect: this.selectChilds,
    };
    return (
      <React.Fragment>
        <Content>
          <Table
            loading={loading}
            rowKey="indicateId"
            dataSource={tmplData}
            columns={columns}
            defaultExpandAllRows
            bordered
            pagination={false}
            rowSelection={rowSelection}
          />
        </Content>
      </React.Fragment>
    );
  }
}

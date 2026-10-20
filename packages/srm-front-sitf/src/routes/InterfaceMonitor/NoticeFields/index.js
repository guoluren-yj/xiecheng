/**
 * NoticeFields - 监控提醒字段配置
 * @date: 2018-11-21
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { withRouter } from 'react-router-dom';
import { Button } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isUndefined, isEmpty } from 'lodash';
import uuidv4 from 'uuid/v4';
import { Content } from 'components/Page';
import intl from 'utils/intl';
import CacheComponent from 'components/CacheComponent';
import { filterNullValueObject } from 'utils/utils';
import ListTable from './ListTable';
import QueryForm from './QueryForm';

/**
 * NoticeFields
 * @extends {Component} - React.Component
 * @return React.element
 */

@withRouter
@CacheComponent({ cacheKey: '/sitf/interface-monitor/notice-fields' })
export default class NoticeFields extends PureComponent {
  form;
  constructor(props) {
    super(props);
    this.state = {
      changedRows: [],
      uuidKey: uuidv4(),
    };
  }

  /**
   * 组件挂载后执行方法
   */
  componentDidMount() {
    const { onRef } = this.props;
    if (onRef) {
      onRef(this);
    }
  }

  /**
   * 查询数据
   * @param {Object} pageData 页面信息数据
   */
  @Bind()
  onFetchNoticeFields(pageData = {}) {
    const { onFetchNoticeFields } = this.props;
    const filterValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    this.setState({
      changedRows: [],
      uuidKey: uuidv4(),
    });
    if (onFetchNoticeFields) {
      onFetchNoticeFields({
        page: isEmpty(pageData) ? {} : pageData,
        ...filterValues,
      });
    }
  }

  /**
   * 增加监控数据
   * @param {boolean} flag 显/隐标记
   * @param {Object} record 行数据
   */
  @Bind()
  onAddNoticeFields() {
    const { onAddNoticeFields } = this.props;
    if (onAddNoticeFields) {
      onAddNoticeFields();
    }
  }

  /**
   * 清除行数据
   * @param {Object} record 行数据
   */
  @Bind()
  onClearNoticeFields(record = {}) {
    const { onClearNoticeFields } = this.props;
    if (onClearNoticeFields) {
      onClearNoticeFields(record);
    }
  }

  /**
   * 保存数据
   */
  @Bind()
  onSaveNoticeFields() {
    const { onSaveNoticeFields } = this.props;
    const { changedRows } = this.state;
    const saveData = changedRows.map(row => {
      const formValues = row.$form && row.$form.getFieldsValue();
      return {
        ...row,
        ...formValues,
      };
    });
    if (onSaveNoticeFields) {
      onSaveNoticeFields(saveData);
    }
  }

  @Bind()
  onStoreChangedRows(record) {
    const { changedRows } = this.state;
    this.setState({
      changedRows: changedRows.find(row => row.fieldId === record.fieldId)
        ? changedRows.filter(r => r.fieldId !== record.fieldId)
        : [...changedRows, record],
    });
  }

  /**
   * 刷新
   */
  @Bind()
  refreshValue() {
    this.onFetchNoticeFields();
  }

  /**
   * 点击查询按钮事件
   */
  @Bind()
  onQueryNoticeFields(queryData = {}) {
    this.onFetchNoticeFields(queryData);
  }

  /**
   * 分页改变事件
   * @param {Object} pagination 分页信息
   */
  @Bind()
  handleStandardTableChange(pagination = {}) {
    this.onFetchNoticeFields(pagination);
  }

  /**
   *
   * @param {object} ref - FilterForm子组件对象
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  /**
   * 渲染方法
   * @returns
   */
  render() {
    const { list = [], pagination = {}, saveNoticeFields, fetchNoticeFields } = this.props;
    const { uuidKey } = this.state;
    // 编辑表格属性
    const editTableOption = {
      key: uuidKey,
      pagination,
      dataSource: list,
      loading: fetchNoticeFields,
      onStoreChangedRows: this.onStoreChangedRows,
      onClearNoticeFields: this.onClearNoticeFields,
      onSearch: this.handleStandardTableChange,
    };

    return (
      <React.Fragment>
        <Content style={{ marginTop: '-16px' }}>
          <div className="table-list-operator" style={{ position: 'relative', height: '32px' }}>
            <div style={{ position: 'absolute', right: '0px' }}>
              <Button icon="plus" onClick={() => this.onAddNoticeFields()}>
                {intl
                  .get('sitf.interfaceMonitor.view.button.add.noticeFields')
                  .d('新建监控提醒字段')}
              </Button>
              <Button
                icon="save"
                loading={saveNoticeFields}
                onClick={() => this.onSaveNoticeFields()}
              >
                {intl.get('hzero.common.button.save').d('保存')}
              </Button>
            </div>
          </div>
          <QueryForm onQueryNoticeFields={this.onFetchNoticeFields} onRef={this.handleBindRef} />
          <ListTable {...editTableOption} />
        </Content>
      </React.Fragment>
    );
  }
}

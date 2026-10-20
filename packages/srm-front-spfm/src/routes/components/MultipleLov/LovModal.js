import React from 'react';
import { Button, Col, Form, Input, Row, Spin, Table, List, Icon } from 'hzero-ui';
import { isArray, isEmpty, isFunction, uniqBy } from 'lodash';
import qs from 'querystring';
import { Bind } from 'lodash-decorators';

import { createPagination, getCurrentOrganizationId, getResponse } from 'utils/utils';
import intl from 'utils/intl';

import './index.less';
import { queryLovData } from './utils.js';

const FormItem = Form.Item;
const ListItem = List.Item;

const formItemLayout = {
  labelCol: {
    sm: { span: 8 },
  },
  wrapperCol: {
    sm: { span: 14 },
  },
};

const defaultRowKey = 'lovId';

@Form.create({ fieldNameProp: null })
class LovModal extends React.Component {
  constructor(props) {
    super(props);
    const { oldValue = [] } = this.props;
    this.state = {
      addRows: oldValue,
      list: [],
      treeKeys: [],
      pagination: {},
      loading: false,
    };
  }

  setSateData(state) {
    if (this.mounted) {
      this.setState(state);
    }
  }

  componentDidMount() {
    this.mounted = true;
    this.props.onSelect(this.state.addRows);
  }

  @Bind()
  loadOnFirstVisible() {
    const { delayLoadFlag } = this.props.lov;
    if (this.mounted && !delayLoadFlag) {
      this.queryData();
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  @Bind()
  onSelectChange(selectedRowKeys, selectedRows) {
    const { addRows } = this.state;
    const {
      lov: { valueField: rowkey = defaultRowKey },
    } = this.props;
    const newAddRows = addRows.filter((ele) => selectedRowKeys.includes(ele[rowkey]));
    this.setState(
      {
        addRows: uniqBy(newAddRows.concat(selectedRows), rowkey),
      },
      () => {
        this.props.onSelect(this.state.addRows);
      }
    );
  }

  @Bind()
  handleRowClick(current) {
    const { addRows } = this.state;
    const {
      lov: { valueField: rowkey = defaultRowKey },
    } = this.props;
    if (addRows.some((ele) => ele[rowkey] === current[rowkey])) {
      const updateRows = addRows.filter((ele) => ele[rowkey] !== current[rowkey]);
      this.setState({ addRows: updateRows }, () => {
        this.props.onSelect(this.state.addRows);
      });
    } else {
      this.setState({ addRows: [...addRows, current] }, () => {
        this.props.onSelect(this.state.addRows);
      });
    }
  }

  hideLoading() {
    this.setState({
      loading: false,
    });
  }

  @Bind()
  queryData(pagination = {}) {
    const filter = this.props.form.getFieldsValue();
    const { queryUrl, pageSize, lovCode, lovTypeCode } = this.props.lov;
    const { queryParams = {}, queryFilterField } = this.props;
    let nowQueryParams = queryParams || {};
    if (isFunction(nowQueryParams)) {
      nowQueryParams = nowQueryParams();
    }
    const queryIndex = queryUrl.indexOf('?');
    let sourceQueryParams = {};
    if (queryIndex !== -1) {
      sourceQueryParams = qs.parse(queryUrl.substr(queryIndex + 1));
    }
    const extraParams={};
    if(queryFilterField){
      extraParams[queryFilterField]=null;
    }
    const sourceParams = {
      ...filter,
      page: pagination.current - 1 || 0,
      size: pagination.pageSize || pageSize,
      ...sourceQueryParams,
      ...nowQueryParams,
      ...extraParams,
    };
    const params =
      lovTypeCode !== 'URL'
        ? Object.assign(sourceParams, {
            lovCode,
          })
        : sourceParams;

    /**
     * 替换查询 Url 中的变量
     * @param {String} url
     * @param {Object} data
     */
    function getUrl(url, data) {
      let ret = url;
      const organizationRe = /\{organizationId\}|\{tenantId\}/g;
      Object.keys(data).map((key) => {
        const re = new RegExp(`{${key}}`, 'g');
        ret = ret.replace(re, data[key]);
        return ret;
      });
      if (organizationRe.test(ret)) {
        ret = ret.replace(organizationRe, getCurrentOrganizationId());
      }
      const index = ret.indexOf('?'); // 查找是否有查询条件
      if (queryIndex !== -1) {
        ret = ret.substr(0, index);
      }
      return ret;
    }

    const url = getUrl(queryUrl, queryParams);

    this.setState(
      {
        loading: true,
      },
      () => {
        queryLovData(url, params)
          .then((res) => {
            if (getResponse(res)) {
              this.dataFilter(res);
            }
          })
          .finally(() => {
            this.hideLoading();
          });
      }
    );
  }

  @Bind()
  formReset() {
    this.props.form.resetFields();
  }

  /**
   * 树 child 属性更改
   * @param {Array} list 原树结构数据
   * @param {String} childName 要替换的 childName
   */
  @Bind()
  setChildren = (data, childName) => {
    return childName
      ? data.map((n) => {
          const item = n;
          if (!isEmpty(n[childName])) {
            this.defineProperty(item, 'children', [{ ...n[childName] }]);
          }
          if (!isEmpty(item.children)) {
            item.children = this.setChildren(item.children);
          }
          return item;
        })
      : data;
  };

  /**
   * 处理返回列表数据
   * @param {Object|Array} data - 返回的列表数据
   */
  @Bind()
  dataFilter(data) {
    const {
      lov: { valueField: rowkey = defaultRowKey, childrenFieldName },
    } = this.props;
    const isTree = isArray(data);
    const hasParams = !isEmpty(
      Object.values(this.props.form.getFieldsValue()).filter((e) => e !== undefined && e !== '')
    );
    const list = isTree ? this.setChildren(data, childrenFieldName) : data.content;
    const pagination = !isTree && createPagination(data);

    const treeKeys = []; // 树状 key 列表
    if (isTree && hasParams) {
      /**
       * 遍历生成树列表
       * @param {*} treeList - 树列表数据
       */
      const flatKeys = (treeList) => {
        if (isArray(treeList.children) && !isEmpty(treeList.children)) {
          treeKeys.push(treeList[rowkey]);
          treeList.children.forEach((item) => flatKeys(item));
        } else {
          treeKeys.push(treeList[rowkey]);
        }
      };

      list.forEach((item) => flatKeys(item)); // 遍历生成 key 列表
    }

    this.setSateData({
      list,
      treeKeys,
      pagination,
    });
  }

  @Bind()
  defineProperty(obj, property, value) {
    Object.defineProperty(obj, property, {
      value,
      writable: true,
      enumerable: false,
      configurable: true,
    });
  }

  /**
   * 访问对象由字符串指定的多层属性
   * @param {Object} obj 访问的对象
   * @param {String} str 属性字符串，如 'a.b.c.d'
   */
  @Bind()
  parseField(obj, str) {
    if (obj) {
      // 修复端侧obj为null问题(场景未复现)
      if (/[.]/g.test(str)) {
        const arr = str.split('.');
        const newObj = obj[arr[0]];
        const newStr = arr.slice(1).join('.');
        return this.parseField(newObj, newStr);
      } else {
        return obj[str];
      }
    }
  }

  @Bind()
  renderItem(item) {
    const {
      lov: { displayField },
    } = this.props;
    return (
      <ListItem
        style={{
          display: 'inline-block',
          border: 'none',
          padding: 0,
          marginLeft: '10px',
        }}
      >
        <span
          style={{
            overflow: 'hidden',
          }}
        >
          {item[displayField]}
          <Icon
            type="close-circle"
            theme="filled"
            style={{ marginLeft: '3px' }}
            onClick={() => this.handleRowClick(item)}
          />
        </span>
      </ListItem>
    );
  }

  render() {
    const {
      form,
      lov: { valueField: rowkey = defaultRowKey, tableFields = [], queryFields = [] },
      form: { getFieldDecorator },
      lovLoadLoading,
      width,
      renderExtraQueryCondition,
      hiddenSelected,
    } = this.props;
    if (lovLoadLoading) {
      return <Spin spinning />;
    }
    const { list = [], addRows, loading, pagination, treeKeys } = this.state;
    const isTree = isArray(list);
    const rowSelection = {
      type: 'checkbox',
      selectedRowKeys: addRows.map((n) => this.parseField(n, rowkey)),
      onChange: this.onSelectChange,
    };
    const tableProps = {
      loading,
      rowSelection,
      pagination,
      bordered: true,
      dataSource: list,
      columns: tableFields,
      onRow: (record, index) => {
        return {
          onClick: () => this.handleRowClick(record, index),
        };
      },
      onChange: this.queryData,
    };
    const treeProps = isTree
      ? {
          uncontrolled: true,
          expandedRowKeys: treeKeys,
        }
      : {};

    // 查询条件表单
    const span = queryFields.length <= 1 || width <= 400 ? 24 : 12;
    const queryInput = queryFields.map((queryItem) => {
      return (
        <Col span={span} key={queryItem.field}>
          <FormItem {...formItemLayout} label={queryItem.label}>
            {getFieldDecorator(queryItem.field)(<Input onPressEnter={this.queryData} />)}
          </FormItem>
        </Col>
      );
    });

    return (
      <React.Fragment>
        {queryFields.length > 0 ? (
          <div style={{ display: 'flex', marginBottom: '10px', alignItems: 'flex-start' }}>
            <Row style={{ flex: 'auto' }}>
              {queryInput}
              {renderExtraQueryCondition&&renderExtraQueryCondition({form})}
            </Row>
            <div className="lov-modal-btn-container">
              <Button onClick={this.formReset} style={{ marginRight: 8 }}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button type="primary" onClick={this.queryData}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </div>
          </div>
        ) : null}
        <p style={{ minHeight: '20px', margin: 0, padding: 0, display: hiddenSelected ? 'none' : 'flex' }}>
          <span style={{ height: '20px', padding: 0, width: '50px', flexShrink: 0 }}>
            {intl.get('hzero.common.components.standardTable.select').d('已选择')}
          </span>
          {addRows.length > 0 && (
            <List
              dataSource={addRows}
              renderItem={(item) => this.renderItem(item)}
              style={{ padding: 0 }}
            />
          )}
        </p>
        <Table
          resizable={false}
          rowKey={(record) => this.parseField(record, rowkey)}
          {...tableProps}
          {...treeProps}
        />
      </React.Fragment>
    );
  }
}

export default LovModal;

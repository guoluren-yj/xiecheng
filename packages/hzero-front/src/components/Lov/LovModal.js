import React from 'react';
import { Button, Col, Form, Input, Row, Spin, InputNumber, DatePicker, Select } from 'hzero-ui';
import { Table, DataSet } from 'choerodon-ui/pro';
import moment from 'moment';
import { isArray, isEmpty, isFunction, isUndefined, isObject } from 'lodash';
import qs from 'querystring';
import { Bind } from 'lodash-decorators';

import {
  createPagination,
  getCurrentOrganizationId,
  getDateFormat,
  getDateTimeFormat,
  transformTreeToArr,
  descryptLovFieldValue,
} from 'utils/utils';
import intl from 'utils/intl';
import Lov from 'components/Lov';
import { DEFAULT_DATETIME_FORMAT, DEFAULT_DATE_FORMAT } from 'utils/constants';
import { yesOrNoRender } from 'utils/renderer';

import './index.less';

const FormItem = Form.Item;
const treeDataIdKey = '_id';
const treeDataParentKey = '_parentId';

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
    this.tableDs = new DataSet();
    this.state = {
      isTree: props.isTree || false,
    };
  }

  setSateData(state) {
    if (this.mounted) {
      this.setState(state);
    }
  }

  componentDidMount() {
    this.mounted = true;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.isTree !== this.props.isTree) {
      this.setState({ isTree: nextProps.isTree });
    }
  }

  @Bind()
  loadOnFirstVisible() {
    const { delayLoadFlag } = this.props.lov;
    if (this.mounted && !delayLoadFlag) {
      // this.queryData();
      this.initTable();
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  @Bind()
  initTable() {
    const {
      lov: { pageSize = 10, tableFields, onlySelectLastFlag },
      tableDsProps: customeTableDsprops,
    } = this.props;
    const { isTree } = this.state;
    const dsFields =
      !tableFields && tableFields.length
        ? []
        : tableFields.map((field) => ({
            name: field.dataIndex,
            label: field.title,
          }));
    const tableDsProps = {
      autoQuery: true,
      pageSize,
      autoCount: false,
      selection: 'single',
      fields: dsFields,
      record: {
        dynamicProps: {
          selectable: (record) => {
            return !onlySelectLastFlag || (record && !record.children);
          },
        }
      },
      ...(customeTableDsprops || {}),
      transport: {
        read: (config) => {
          return this.handleQueryConfig(config);
        },
      },
      events: {
        select: this.handleSelect,
      },
    };
    if (isTree) {
      tableDsProps.idField = treeDataIdKey;
      tableDsProps.parentField = treeDataParentKey;
    }
    this.tableDs = new DataSet(tableDsProps);
  }

  @Bind()
  handleQueryConfig({ params: extraParams = {} }) {
    const filter = this.props.form.getFieldsValue();
    const { queryUrl, lovCode, viewCode, lovTypeCode, requestMethod = 'get', queryFields = [] } =
      this.props.lov || {};
    const { queryParams = {} } = this.props;
    let nowQueryParams = queryParams || {};
    if (isFunction(nowQueryParams)) {
      nowQueryParams = nowQueryParams();
    }
    const queryIndex = queryUrl.indexOf('?');
    let sourceQueryParams = {};
    if (queryIndex !== -1) {
      sourceQueryParams = qs.parse(queryUrl.substr(queryIndex + 1));
    }
    const formatFilter = { ...filter };
    queryFields.forEach((item) => {
      if (item.dataType === 'DATE' || item.dataType === 'DATETIME') {
        if (filter[item.field]) {
          formatFilter[item.field] = moment(filter[item.field]).format(
            item.dataType === 'DATETIME' ? DEFAULT_DATETIME_FORMAT : DEFAULT_DATE_FORMAT
          );
        }
      }
    });
    const sourceParams = {
      ...formatFilter,
      ...sourceQueryParams,
      ...extraParams,
      ...nowQueryParams,
    };

    // add
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
        const re = new RegExp(`({)${key}(})`, 'g');
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
    const config = {
      url: getUrl(queryUrl, queryParams),
      transformResponse: this.handleTransformResponse,
    };
    if (['URL', 'SQL'].includes(lovTypeCode)) {
      config.headers = {
        'lov-view-code-tenant': getCurrentOrganizationId(),
        'lov-view-code': viewCode,
      };
    }
    const method = lovTypeCode === 'URL' ? requestMethod : 'GET';
    if (method) {
      config.method = method.toUpperCase();
      if (method.toUpperCase() !== 'GET') {
        config.data = params;
      } else {
        config.params = params;
      }
    } else {
      config.params = params;
    }
    return config;
  }

  @Bind()
  handleTransformResponse(resp) {
    let data = [];
    try {
      const result = JSON.parse(resp);
      if (isObject(result) && isArray(result.content) && result.content.length > 0) {
        result.content = this.transformResponseData(result.content);
        data = result;
      } else if (isArray(result) && result.length > 0) {
        data = this.transformResponseData(result);
      } else {
        data = result;
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    } finally {
      // eslint-disable-next-line no-unsafe-finally
      return data;
    }
  }

  @Bind()
  transformResponseData(response) {
    let data = response;
    const { lov: { valueField } = {} } = this.props;
    const { isTree } = this.state;
    if (isTree) {
      this.tableDs.props.paging = 'server';
      data = transformTreeToArr(data, valueField, 'children', treeDataIdKey, treeDataParentKey);
    } else if (isArray(data) && data.length > 0 && data.some((item) => isArray(item.children))) {
      // 如果返回数据中有 children 并且 children 是数组, 则也是树
      if (this.tableDs) {
        this.tableDs.props.paging = 'server';
        this.tableDs.props.idField = treeDataIdKey;
        this.tableDs.props.parentField = treeDataParentKey;
      }
      data = transformTreeToArr(data, valueField, 'children', treeDataIdKey, treeDataParentKey);
      this.setState({ isTree: true });
    }
    return data;
  }

  @Bind()
  queryData() {
    if (this.tableDs) {
      this.tableDs.query();
    }
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
  setChildren = (data, childName) =>
    childName
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
    if (/[.]/g.test(str)) {
      const arr = str.split('.');
      const newObj = obj[arr[0]];
      const newStr = arr.slice(1).join('.');
      return this.parseField(newObj, newStr);
    }
    return obj[str];
  }

  @Bind()
  handleSelect({ dataSet, record }, callback) {
    // 判断当前行是否可选
    if (dataSet && record && record.selectable) {
      dataSet.select(record);
      const data = record.toData();
      const {
        lov: { encryptFields },
      } = this.props;
      if (encryptFields && encryptFields.length > 0) {
        const encryptField_suffix = '_encrypt'; // 加密字段固定后缀
        encryptFields.forEach((encryptField) => {
          if (encryptField.field && data && data[`${encryptField.field}${encryptField_suffix}`]) {
            data[encryptField.field] = descryptLovFieldValue(
              data[`${encryptField.field}${encryptField_suffix}`]
            );
          }
        });
      }
      this.props.onSelect(data);
      if (callback) {
        callback();
      }
    }
  }

  @Bind()
  handleRow(row) {
    return {
      onClick: () => this.handleSelect(row),
      onDoubleClick: () => {
        this.handleSelect(row, () => {
          this.props.onClose();
        });
      },
    };
  }

  render() {
    const {
      lov: { tableFields = [], queryFields = [], height },
      ldpData = {},
      form: { getFieldDecorator },
      lovLoadLoading,
      width,
      queryInputProps = {},
      isDbc2Sbc = false,
      tableProps: customeTableProps,
    } = this.props;
    const { isTree } = this.state;
    if (lovLoadLoading) {
      return <Spin spinning />;
    }
    const columns =
      !tableFields || !tableFields.length
        ? []
        : tableFields.map((item) => {
            const { dataIndex, dataType, width: colWidth } = item;
            const column = {
              width: colWidth,
              name: dataIndex,
            };
            if (dataType === 'SWITCH') {
              column.renderer = ({ value }) => yesOrNoRender(value);
            }
            return column;
          });

    const tableProps = {
      columns,
      dataSet: this.tableDs,
      onRow: this.handleRow,
      mode: isTree ? 'tree' : 'list',
      style: {
        height: isUndefined(height) ? 'auto' : height > 498 ? height - 98 : 400,
      },
      ...(customeTableProps || {}),
    };

    // 查询条件表单
    const span = queryFields.length <= 1 || width <= 400 ? 24 : 12;
    const queryInput = queryFields.map((queryItem = {}) => {
      const valueListData = ldpData[queryItem.sourceCode] || [];
      switch (queryItem.dataType) {
        case 'INT':
          return (
            <Col span={span} key={queryItem.field}>
              <FormItem {...formItemLayout} label={queryItem.label}>
                {getFieldDecorator(queryItem.field)(
                  <InputNumber style={{ width: '100%' }} onPressEnter={this.queryData} />
                )}
              </FormItem>
            </Col>
          );
        case 'DATE':
          return (
            <Col span={span} key={queryItem.field}>
              <FormItem {...formItemLayout} label={queryItem.label}>
                {getFieldDecorator(queryItem.field)(
                  <DatePicker style={{ width: '100%' }} placeholder="" format={getDateFormat()} />
                )}
              </FormItem>
            </Col>
          );
        case 'DATETIME':
          return (
            <Col span={span} key={queryItem.field}>
              <FormItem {...formItemLayout} label={queryItem.label}>
                {getFieldDecorator(queryItem.field)(
                  <DatePicker
                    style={{ width: '100%' }}
                    placeholder=""
                    showTime={{ format: DEFAULT_DATETIME_FORMAT }}
                    format={getDateTimeFormat()}
                  />
                )}
              </FormItem>
            </Col>
          );
        case 'SELECT':
          return (
            <Col span={span} key={queryItem.field}>
              <FormItem {...formItemLayout} label={queryItem.label}>
                {getFieldDecorator(queryItem.field)(
                  <Select allowClear style={{ width: '100%' }}>
                    {valueListData.map((item) => (
                      <Select.Option value={item.value} key={item.value}>
                        {item.meaning}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              </FormItem>
            </Col>
          );
        case 'LOV_CODE':
          return (
            <Col span={span} key={queryItem.field}>
              <FormItem {...formItemLayout} label={queryItem.label}>
                {getFieldDecorator(queryItem.field)(<Lov code={`${queryItem.sourceCode}`} />)}
              </FormItem>
            </Col>
          );

        default:
          return (
            <Col span={span} key={queryItem.field}>
              <FormItem {...formItemLayout} label={queryItem.label}>
                {getFieldDecorator(queryItem.field)(
                  <Input dbc2sbc={isDbc2Sbc} {...queryInputProps} />
                )}
              </FormItem>
            </Col>
          );
      }
    });

    return (
      <Form>
        {queryFields.length > 0 ? (
          <div style={{ display: 'flex', marginBottom: '10px', alignItems: 'flex-start' }}>
            <Row style={{ flex: 'auto' }}>{queryInput}</Row>
            <div className="lov-modal-btn-container">
              <Button onClick={this.formReset} style={{ marginRight: 8 }}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button type="primary" htmlType="submit" onClick={this.queryData}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </div>
          </div>
        ) : null}
        <Table {...tableProps} />
      </Form>
    );
  }
}

export default LovModal;

import React, { PureComponent } from 'react';
import { Modal, Table, Form, Input } from 'hzero-ui';
import { sum, isNumber } from 'lodash';
import moment from 'moment';
import intl from 'utils/intl';
import { totalRender, dateTimeRender } from 'utils/renderer';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { formatAumont } from '../../components/utils';

// 折叠面板组件初始化
const FormItem = Form.Item;
// 设置sodr国际化前缀 - common - model
const modelPrompt = 'sodr.orderApproval.model.common';
// 设置sodr国际化前缀 - common - message
const viewMessagePrompt = 'sodr.orderApproval.view.message';
// 设置entityItem国际化前缀
const entityItem = 'entity.item';

/**
 * Search
 * @param {object} props - 属性
 * @param {object} props.form - form属性
 * @param {object} props.dataSource - 数据源
 * @return {object} React.element
 */
const Search = ({ form = {}, dataSource = {} }) => {
  const { getFieldDecorator = (e) => e } = form;
  const { itemCode, itemName } = dataSource;
  return (
    <Form layout="inline">
      <FormItem label={intl.get(`${entityItem}.code`).d('物料编码')}>
        {getFieldDecorator('itemCode', { initialValue: itemCode })(<Input disabled />)}
      </FormItem>
      <FormItem label={intl.get(`${entityItem}.name`).d('物料名称')}>
        {getFieldDecorator('itemName', { initialValue: itemName })(<Input disabled />)}
      </FormItem>
    </Form>
  );
};

// Search组件form高阶化处理,传入form
const WrapperSearch = Form.create({ fieldNameProp: null })(Search);

/**
 * BOMModal - 业务组件 - 订单审批
 * @extends {Component} - React.Component
 * @reactProps {boolean} [visible=false] - 是否显示
 * @reactProps {string} actionkey - 组件查询数据唯一性主键
 * @reactProps {!Object} [processing={}] - dispatch处理过程
 * @reactProps {!string} itemCode - 物料编码
 * @reactProps {!string} itemName - 物料名称
 * @return React.element
 */
export default class BOMModal extends PureComponent {
  constructor(props) {
    super(props);
    this.handleSearch = this.handleSearch.bind(this);
  }

  /**
   * getSnapshotBeforeUpdate 生命周期函数
   * 判断是否加载数据
   * @param {object} prevProps - 上一个状态下的props
   */
  getSnapshotBeforeUpdate(prevProps) {
    const { visible, actionkey } = this.props;
    return visible && prevProps.actionkey !== actionkey;
  }

  /**
   * componentDidUpdate 生命周期函数
   * 判断是否加载数据
   * @param {object} prevProps - 上一个状态下的props
   * @param {object} snapshot - getSnapshotBeforeUpdate的返回值
   */
  componentDidUpdate(prevProps, prevState, snapshot) {
    if (snapshot) {
      this.handleSearch({ page: 0, size: 10 });
    }
  }

  state = {
    dataSource: [],
    pagination: {
      showSizeChanger: true,
      pageSizeOptions: ['10', '20', '50', '100'],
      pageSize: 10,
      total: 0,
      showTotal: totalRender,
    },
  };

  /**
   * cancel 取消(关闭)
   * 判断是否加载数据
   */
  cancel() {
    const { onCancel = (e) => e } = this.props;
    this.setState({
      dataSource: [],
    });
    onCancel();
  }

  /**
   * handleSearch 查询数据
   * @param {object} params - 查询条件
   */
  handleSearch(params = {}) {
    const { fetchBOM = (e) => e } = this.props;
    fetchBOM(params, (res) => {
      this.setState({
        ...res,
      });
    });
  }

  /**
   * onTableChange 表格onChange事件
   * @param {object} page - 分页数据
   */
  onTableChange(pagination = {}) {
    const { current = 1, pageSize = 10 } = pagination;
    const { getFieldsValue = (e) => e } = this.wrapperSearch;
    this.handleSearch({ page: current - 1, size: pageSize, ...getFieldsValue() });
  }

  action(params = {}) {
    const { pagination } = this.state;
    const { current = 1, pageSize = 10 } = pagination;
    this.handleSearch({ page: current - 1, size: pageSize, ...params });
  }

  defaultRowkey = 'poItemBomId';

  render() {
    const { visible, processing, itemCode, itemName } = this.props;
    const { dataSource, pagination } = this.state;
    const columns = [
      {
        title: intl.get(`${modelPrompt}.orderSeq`).d('序号'),
        align: 'center',
        dataIndex: 'orderSeq',
        width: 60,
      },
      {
        title: intl.get(`${entityItem}.code`).d('物料编码'),
        width: 100,
        align: 'center',
        dataIndex: 'itemCode',
      },
      {
        title: intl.get(`${entityItem}.name`).d('物料名称'),
        align: 'center',
        width: 120,
        dataIndex: 'itemName',
      },
      // {
      //   title: intl.get(`sodr.common.model.common.description`).d('物料描述'),
      //   align: 'center',
      //   width: 180,
      //   dataIndex: 'itemDescription',
      // },
      {
        title: intl.get(`${entityItem}.type`).d('物料类型'),
        align: 'center',
        width: 120,
        dataIndex: 'categoryName',
      },
      {
        title: intl.get(`sodr.common.model.common.needQuantity`).d('需求数量'),
        align: 'right',
        width: 100,
        dataIndex: 'quantity',
        render: (val) => formatAumont(val),
      },
      {
        title: intl.get(`${modelPrompt}.uomName`).d('单位'),
        align: 'center',
        width: 120,
        dataIndex: 'uomName',
        render: (_, { uomCodeAndName }) => uomCodeAndName,
      },
      {
        title: intl.get(`${modelPrompt}.invOrganizationName`).d('收货组织'),
        align: 'center',
        width: 120,
        dataIndex: 'invOrganizationName',
      },
      {
        title: intl.get(`${modelPrompt}.needByDate`).d('需求日期'),
        align: 'center',
        width: 120,
        dataIndex: 'needByDate',
        render: (text) => {
          const dom = text ? moment(text).format(DEFAULT_DATE_FORMAT) : text;
          const formatDom = dateTimeRender(dom) || null;
          return <>{formatDom}</>;
        },
      },
    ];
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    const tableProps = {
      columns,
      rowKey: this.defaultRowkey,
      pagination,
      dataSource,
      loading: processing,
      bordered: true,
      childrenColumnName: 'subMenus',
      onChange: this.onTableChange.bind(this),
      scroll: { x: scrollX },
    };

    const wrapperSearchProps = {
      dataSource: { itemCode, itemName },
      ref: (ref) => {
        this.wrapperSearch = ref;
      },
    };

    return (
      <Modal
        title={intl.get(`${viewMessagePrompt}.titleBom`).d('外协BOM')}
        visible={visible}
        onCancel={this.cancel.bind(this)}
        destroyOnClose
        width={680}
        footer={null}
      >
        <WrapperSearch {...wrapperSearchProps} />
        <br />
        <Table {...tableProps} />
      </Modal>
    );
  }
}

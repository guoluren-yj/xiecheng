/**
 * BOMModal - BOM
 * @date: 2018-10-26
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Modal, Table, Form, Input } from 'hzero-ui';
import { sum, isNumber } from 'lodash';
import moment from 'moment';
import intl from 'utils/intl';
import { totalRender, dateRender } from 'utils/renderer';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
// import withCustomize from 'srm-front-cuz';
// import ExcelExport from 'components/ExcelExport';
// import { SRM_SPUC } from '_utils/config';
// import { getCurrentOrganizationId } from 'utils/utils';

// 折叠面板组件初始化
const FormItem = Form.Item;
// 设置sodr国际化前缀 - common - model
const modelPrompt = 'sodr.sendOrder.model.common';
// 设置sodr国际化前缀 - common - message
const titlePrompt = 'sodr.sendOrder.view.title';
// const organizationId = getCurrentOrganizationId();

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
  // const otherButtonProps = {
  //   icon: 'export',
  //   type: 'primary',
  // };
  return (
    <Form layout="inline">
      <FormItem label={intl.get(`entity.item.code`).d('物料编码')}>
        {getFieldDecorator('itemCode', { initialValue: itemCode })(<Input disabled />)}
      </FormItem>
      <FormItem label={intl.get(`entity.item.name`).d('物料名称')}>
        {getFieldDecorator('itemName', { initialValue: itemName })(<Input disabled />)}
      </FormItem>
    </Form>
  );
};

// Search组件form高阶化处理,传入form
const WrapperSearch = Form.create({ fieldNameProp: null })(Search);

/**
 * BOMModal - 业务组件
 * @extends {Component} - React.Component
 * @reactProps {boolean} [visible=false] - 是否显示
 * @reactProps {string} actionkey - 组件查询数据唯一性主键
 * @reactProps {!Object} [processing={}] - dispatch处理过程
 * @reactProps {!string} itemCode - 物料编码
 * @reactProps {!string} itemName - 物料名称
 * @return React.element
 */
// @withCustomize({
//   unitCode: ['SODR.SEND_ORDER_DETAIL.BOM_MODAL'],
// })
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
  // getSnapshotBeforeUpdate(prevProps) {
  //   const { visible, actionkey } = this.props;
  //   return visible && prevProps.actionkey !== actionkey;
  // }

  componentDidMount() {
    this.handleSearch();
  }

  /**
   * componentDidUpdate 生命周期函数
   * 判断是否加载数据
   * @param {object} prevProps - 上一个状态下的props
   * @param {object} snapshot - getSnapshotBeforeUpdate的返回值
   */
  // componentDidUpdate(prevProps, prevState, snapshot) {
  //   if (snapshot) {
  //     this.handleSearch();
  //   }
  // }

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
        dataSource: res?.content,
      });
    });
  }

  /**
   * onTableChange 表格onChange事件
   * @param {object} page - 分页数据
   */
  onTableChange(page = {}) {
    const { getFieldsValue = (e) => e } = this.wrapperSearch;
    this.handleSearch({ page, ...getFieldsValue() });
  }

  action(params = {}) {
    const { pagination } = this.state;
    this.handleSearch({ page: pagination, ...params });
  }

  defaultRowkey = 'poItemBomId';

  render() {
    const { visible, loading, itemCode, itemName, poHeaderId, poLineId } = this.props;
    const { dataSource, pagination } = this.state;
    const columns = [
      {
        title: intl.get(`${modelPrompt}.orderSeq`).d('序号'),
        dataIndex: 'orderSeq',
        width: 60,
      },
      {
        title: intl.get(`entity.item.code`).d('物料编码'),
        align: 'center',
        dataIndex: 'itemCode',
        width: 100,
      },
      {
        title: intl.get(`entity.item.name`).d('物料名称'),
        dataIndex: 'itemName',
        width: 120,
      },
      {
        title: intl.get(`entity.item.type`).d('物料类型'),
        width: 120,
        dataIndex: 'categoryName',
      },
      {
        title: intl.get(`sodr.common.model.common.needQuantity`).d('需求数量'),
        width: 100,
        dataIndex: 'quantity',
      },
      {
        title: intl.get(`${modelPrompt}.uomName`).d('单位'),
        width: 120,
        dataIndex: 'uomName',
        render: (_val, record) =>
          record.uomName && record.uomCode ? (
            <span>{`${record.uomCode}/${record.uomName}`}</span>
          ) : null,
      },
      {
        title: intl.get(`sodr.common.model.common.organizationName`).d('收货组织'),
        width: 120,
        dataIndex: 'invOrganizationName',
      },
      {
        title: intl.get(`${modelPrompt}.needByDate`).d('需求日期'),
        width: 120,
        dataIndex: 'needByDate',
        render: (text) => {
          const dom = text ? moment(text).format(DEFAULT_DATE_FORMAT) : null;
          const formatDom = dateRender(dom) || null;
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
      loading,
      bordered: true,
      childrenColumnName: 'subMenus',
      onChange: this.onTableChange.bind(this),
      resizable: true,
      scroll: { x: scrollX },
    };

    const wrapperSearchProps = {
      dataSource: { itemCode, itemName, poHeaderId, poLineId },
      ref: (ref) => {
        this.wrapperSearch = ref;
      },
    };

    return (
      <Modal
        title={intl.get(`${titlePrompt}.titleBom`).d('外协BOM')}
        visible={visible}
        onCancel={this.cancel.bind(this)}
        destroyOnClose
        width={700}
        footer={null}
      >
        <WrapperSearch {...wrapperSearchProps} />
        <br />
        <Table {...tableProps} />
      </Modal>
    );
  }
}

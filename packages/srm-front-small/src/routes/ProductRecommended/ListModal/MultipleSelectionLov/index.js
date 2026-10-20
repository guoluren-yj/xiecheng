/**
 * MultipleSelectionLov - 供应商多选lov
 * @date: 2020-2-24
 * @author: zjx <jingxi.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import React, { useRef, useEffect, useMemo } from 'react';
import { Table } from 'hzero-ui';
import { Modal, Button } from 'choerodon-ui/pro';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { isUndefined, isFunction, isEmpty } from 'lodash';

import { filterNullValueObject, tableScrollWidth, createPagination } from 'utils/utils';
import intl from 'utils/intl';
import useRuleConfig from '@/hooks/useRuleConfig';

import FilterForm from './FilterForm';

@connect(({ productRecommended, loading }) => ({
  productRecommended,
  fetchDataLoading: loading.effects['productRecommended/fetchProduct'],
}))
export class MultipleSelectionLovModal extends React.Component {
  form;

  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
    const { rowKey = 'skuId' } = props;
    this.state = {
      lineSelectedRows: [], // 列表页选择行rows
      lineSelectedKeys: [], // 列表页选择行keys
      rowKey,
    };
  }

  componentDidMount() {
    const {
      productRecommended: {
        lovBatch: { sourceType = [] },
      },
    } = this.props;
    this.props.dispatch({
      type: 'productRecommended/fetchTypeTree',
    });
    if(isEmpty(sourceType)) {
      this.props.dispatch({
        type: 'productRecommended/initQueryIdp',
      });
    }
    this.handleSearch();
    this.props.modal.update({
      footer: [
        <Button
          onClick={() => {
            this.props.setVisible(false);
          }}
        >
          {intl.get(`small.common.button.cancel`).d('取消')}
        </Button>,
        <Button color="primary" onClick={() => {this.handleOk();this.props.setVisible(false);}}>
          {intl.get('small.common.button.sure').d('确定')}
        </Button>,
      ],
    });
  }

  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  @Bind()
  handleCloseSuppModal() {
    this.setState(
      {
        suppLovVisible: false,
      },
      () => {
        this.form.resetFields();
      }
    );
  }

  /**
   * 供应商modal
   */
  @Bind()
  handleSupplierModal() {
    this.setState(
      {
        suppLovVisible: true,
      },
      () => {
        this.handleSearch();
      }
    );
  }

  /**
   * table跨页勾选
   */
  @Bind()
  lineSelectedChange(keys = [], rows = []) {
    const { lineSelectedRows = [], lineSelectedKeys = [], rowKey } = this.state;
    // 新增勾选
    const addRows = rows.filter((n) => !lineSelectedKeys.includes(n[rowKey]));
    const newRows = [...lineSelectedRows, ...addRows];
    // 取消勾选
    const newSelectedRows = newRows.filter((n) => keys.includes(n[rowKey]));

    this.setState({
      lineSelectedRows: newSelectedRows,
      lineSelectedKeys: keys,
    });
  }

  /**
   * 列表查询
   * @param {*} page - 分页
   */
  @Bind()
  handleSearch(page = { page: 0, size: 10 }) {
    const {
      dispatch,
      productRecommended: {
        purchase: { unitId },
        currentRole,
      },
      groupAttribute,
    } = this.props;
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: 'productRecommended/fetchProduct',
      payload: {
        ...fieldValues,
        shelfFlag: 1,
        companyId: -1,
        unitId,
        belongType: currentRole === 'purchase' ? 1 : 0,
        page,
        channel: groupAttribute || undefined,
      },
    }).then((res) => {
      if (res) {
        this.setState({
          productDataSource: res.content,
          productPagination: createPagination(res),
        });
      }
    });
  }

  /**
   * 确定操作
   */
  @Bind()
  handleOk() {
    const { lineSelectedRows = [], lineSelectedKeys = [] } = this.state;
    const { handleAddProducts } = this.props;
    handleAddProducts({
      products: lineSelectedRows,
      skuIds: lineSelectedKeys,
      callBack: () => {
        this.setState(
          {
            lineSelectedRows: [],
            lineSelectedKeys: [],
          },
          () => {
            this.form.resetFields();
          }
        );
        this.props.setVisible(false);
      },
    });
  }

  render() {
    const {
      lineSelectedKeys = [],
      productPagination = {},
      productDataSource = [],
      rowKey,
    } = this.state;

    const {
      fetchDataLoading,
      productRecommended: {
        cataTreeList = [],
        lovBatch: { sourceType = [] },
      },
      siggle,
    } = this.props;
    const filterProps = {
      treeList: cataTreeList,
      sourceType,
      onRef: this.handleBindRef,
      onHandleSearch: this.handleSearch,
      isNewSupplierLov: this.props.isNewSupplierLov,
    };
    const columns = [
      {
        title: intl.get(`small.common.model.common.ecProductNum`).d('商品编码'),
        dataIndex: 'skuCode',
        width: 140,
      },
      {
        title: intl.get(`small.common.model.common.ecProductName`).d('商品名称'),
        dataIndex: 'skuName',
      },
      {
        title: intl.get(`small.common.model.supplier.code`).d('供应商编码'),
        dataIndex: 'supplierCompanyNum',
        width: 140,
      },
      {
        title: intl.get(`small.common.model.supplier.name`).d('供应商名称'),
        dataIndex: 'supplierCompanyName',
        width: 140,
      },
      {
        title: intl.get(`small.common.model.agreementNumber`).d('协议编号'),
        dataIndex: 'agreementNumber',
        width: 150,
      },
      {
        title: intl.get(`small.common.model.common.sourceType`).d('商品类型'),
        dataIndex: 'sourceFrom',
        width: 130,
        render: (val) =>
          val === 'CATA'
            ? intl.get('small.common.model.common.directory').d('目录化')
            : intl.get('small.common.model.common.E-commerce').d('电商'),
      },
    ];
    const scrollX = tableScrollWidth(columns);
    return (
      <>
        <div className="table-list-search">
          <FilterForm {...filterProps} />
        </div>
        <Table
          bordered
          rowKey={rowKey}
          loading={fetchDataLoading}
          columns={columns}
          rowSelection={{
            type: siggle ? 'radio' : 'checkbox',
            selectedRowKeys: lineSelectedKeys,
            onChange: this.lineSelectedChange,
          }}
          scroll={{ x: scrollX }}
          dataSource={productDataSource}
          pagination={productPagination}
          onChange={(page) => this.handleSearch(page)}
        />
      </>
    );
  }
}

export default function MultipleSelectionLov(props) {
  const {
    visible,
    setVisible,
  } = props;
  const modal = useRef();
  const [supplierLovConfig] = useRuleConfig({
    code: 'supplierLov',
    defaultValue: [],
  });

  const isNewSupplierLov = useMemo(() => isEmpty(supplierLovConfig));
  useEffect(() => {
    if (visible) {
      modal.current = Modal.open({
        destroyOnClose: true,
        mask: true,
        keyboardClosable: false,
        // drawer: true,
        title: intl.get('small.common.model.groupCustomBar.commodity').d('商品'),
        style: { width: 1100 },
        children: <MultipleSelectionLovModal {...props} isNewSupplierLov={isNewSupplierLov} modal={modal.current} />,
      });
    } else if (modal.current) {
      modal.current.close();
    }
  }, [visible]);

  useEffect(() => {
    return () => {
      if (modal.current) {
        modal.current.close();
        setVisible(false);
      }
    };
  }, []);
  return <></>;
};

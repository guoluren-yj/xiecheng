import React, { Component } from 'react';
import { DataSet, Table, Row, Col, Button } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { getResponse, filterNullValueObject } from 'utils/utils';
import FilterBar from '_components/FilterBarTable/FilterBar';

import { openSkuDetail, openSkuEdit } from '@/utils/openCommonTab';
import { createProduct } from '@/services/mallProtocolManagementService';

import { openProductModal } from '../Detail/agmLineFuncs';
// import C7nFilterForm from './C7nFilterForm';

import style from './index.less';

const tableDs = (url, initParams, isCheckBox = 'true') => ({
  selection: isCheckBox ? 'multiple' : false,
  autoQuery: false,
  pageSize: 20,
  primaryKey: 'skuId',
  fields: [
    {
      name: 'skuCode',
      label: intl.get('small.common.model.productNum').d('商品编码'),
    },
    {
      name: 'skuName',
      label: intl.get('small.common.model.productName').d('商品名称'),
    },
    {
      name: 'categoryName',
      label: intl.get('small.common.model.platformCategory').d('平台分类'),
    },
  ],
  transport: {
    read({ data }) {
      const { filterParams = {}, ...other } = data;
      return {
        url,
        method: 'GET',
        data: { ...filterParams, ...other, ...initParams },
      };
    },
  },
});

const ModalTable = (props) => {
  const { width, ...otherProps } = props;
  const [update, setUpdate] = React.useState();
  const tableRef = React.useRef();
  React.useEffect(() => {
    setUpdate('update');
  }, []);
  React.useEffect(() => {
    if (width) {
      tableRef.current.tableStore.width = width;
    }
  }, [update]);
  return (
    <Table
      {...otherProps}
      style={{ width, maxHeight: 'calc(100vh - 280px)' }}
      ref={tableRef}
      pagination={{ showQuickJumper: false }}
    />
  );
};

/**
 * 仅《商城协议工作台》用到此穿梭框
 */
export default class Transfer extends Component {
  constructor(props) {
    super(props);
    const {
      leftInfo: { url: leftUrl, params: leftParams = {} } = {},
      rightInfo: { url: rightUrl, params: rightParams = {} } = {},
      readOnly = false,
      addColumns = [],
    } = props;
    this.leftTableDs = new DataSet(tableDs(leftUrl, leftParams));
    this.rightTableDs = new DataSet(tableDs(rightUrl, rightParams, !readOnly));

    addColumns.forEach((field) => {
      this.leftTableDs.addField(field.name, field);
      this.rightTableDs.addField(field.name, field);
    });
  }

  state = {
    joinLoading: false,
    delLoading: false,
  };

  async componentDidMount() {
    const { queryRequired = true, onSkuChange = (e) => e, readOnly } = this.props;
    if (!queryRequired) {
      this.handleSearch();
    }
    if (readOnly) {
      await this.rightTableDs.query();
      return;
    }
    await this.leftTableDs.query();
    await this.rightTableDs.query();
    onSkuChange({}, this.rightTableDs.totalCount);
  }

  handleSearch = async (params) => {
    const { readOnly } = this.props;
    // const valid = await ds.current.validate();
    if (!readOnly) {
      // if (valid) {
      this.leftTableDs.setQueryParameter('filterParams', filterNullValueObject(params));
      this.leftTableDs.query();
      this.rightTableDs.setQueryParameter('filterParams', filterNullValueObject(params));
      this.rightTableDs.query();
      // }
    }
  };

  handleJoin = async () => {
    const {
      agreementLineId,
      onJoin = () => new Promise(),
      onSkuChange = (e) => e,
      // callBack = (e) => e,
    } = this.props;
    const list = this.leftTableDs.selected.map((i) => i.toData());

    this.setState({ joinLoading: true });
    const res = await onJoin({
      agreementLineId,
      agreementDetailsDTOS: list,
    });
    this.setState({ joinLoading: false });
    const result = getResponse(res);
    if (result) {
      onSkuChange(result, 1, true);
      notification.success();
      this.leftTableDs.query();
      this.rightTableDs.query();
      // callBack();
    }
  };

  handleDelete = async () => {
    const {
      onDelete = () => new Promise(),
      onSkuChange = (e) => e,
      // callBack = (e) => e,
    } = this.props;
    const list = this.rightTableDs.selected.map((record) => record.toData());

    this.setState({ delLoading: true });
    const res = await onDelete({
      agreementDetails: list,
    });
    this.setState({ delLoading: false });
    const result = getResponse(res);
    if (result) {
      const hasSku = this.rightTableDs.totalCount - list.length;
      onSkuChange(result, hasSku, true);
      notification.success();
      this.leftTableDs.query();
      this.rightTableDs.query();
      // callBack();
    }
  };

  handleGoodsPreview = (record) => {
    const { backPath } = this.props;
    openSkuDetail({
      record,
      backPath,
    });
  };

  handleGoodsEdit = (record) => {
    const { spuId } = record.toData();
    const { backPath } = this.props;
    openSkuEdit({
      spuId,
      backPath,
    });
  };

  getColumns = () => {
    const { readOnly } = this.props;
    const columns = [
      {
        name: 'skuCode',
        width: 130,
        renderer: ({ value, record }) => (
          <a onClick={() => this.handleGoodsPreview(record)}>{value}</a>
        ),
      },
      {
        name: 'skuName',
      },
      {
        name: 'categoryName',
        // width: 150,
      },
      {
        title: intl.get('small.common.view.operate').d('操作'),
        width: 80,
        lock: 'right',
        renderer: ({ record }) => {
          const { skuApprove = true } = this.props;
          return skuApprove && !readOnly ? (
            <Button funcType="link" onClick={() => this.handleGoodsEdit(record)}>
              {intl.get('hzero.common.model.edit').d('编辑')}
            </Button>
          ) : (
            '-'
          );
        },
      },
    ];
    return columns.filter((f) => f.show !== false);
  };

  // 基于物料创建商品
  handleProductOK = async (params) => {
    const { callBack } = this.props;
    const { categoryId, content } = params;
    const res = getResponse(
      await createProduct({
        cid: categoryId,
        agreementSkuDTO: {
          agreementLineList: this.props.agreementLineList,
          details: content,
        },
      })
    );
    if (res) {
      notification.success();
      this.leftTableDs.query(this.leftTableDs.currentPage);
      this.rightTableDs.query(this.rightTableDs.currentPage);
      callBack();
    }
  };

  render() {
    const {
      readOnly,
      queryDs,
      showQuickCreate,
      catalogId,
      agreementLineList,
      skuApprove = true,
    } = this.props;
    const { joinLoading, delLoading } = this.state;
    const JoinButton = observer(({ dataSet }) => (
      <Button
        disabled={dataSet.selected.length === 0}
        loading={joinLoading}
        onClick={this.handleJoin}
        icon="navigate_next"
      >
        {/* {intl.get('sagm.common.button.join').d('加入')} */}
      </Button>
    ));

    const DelButton = observer(({ dataSet }) => (
      <Button
        disabled={dataSet.selected.length === 0}
        onClick={this.handleDelete}
        loading={delLoading}
        icon="navigate_before"
      >
        {/* {intl.get('hzero.common.button.delete').d('删除')} */}
      </Button>
    ));

    const columns = this.getColumns();

    return (
      <div className={style['transfer-wrapper']}>
        {skuApprove && showQuickCreate && (
          <Row className={style['content-header']}>
            <Col span={3} offset={1} className={style['header-left']}>
              <span>{intl.get('small.common.model.itemLabel').d('物料： ')}</span>
              <span className={style['header-left-value']}>
                {agreementLineList[0] && agreementLineList[0].itemName}
              </span>
            </Col>
            <Col span={4}>
              <Button
                onClick={() =>
                  openProductModal({
                    handleProductOK: this.handleProductOK,
                    catalogId,
                  })
                }
              >
                {intl.get('small.common.model.createBasedOnItem').d('基于物料创建商品')}
              </Button>
            </Col>
          </Row>
        )}
        {/* {!readOnly && (
          <C7nFilterForm
            fields={queryFields}
            ds={queryDs}
            queryFieldsLimit={queryFieldsLimit}
            onSearch={this.handleSearch}
            queryRequired={queryRequired}
            onRef={(ds) => {
              this.formSearchDs = ds;
            }}
          />
        )} */}
        {!readOnly && (
          <FilterBar
            dataSet={[queryDs]}
            autoQuery={false}
            onQuery={({ params }) => {
              this.handleSearch(params);
            }}
          />
        )}
        {readOnly || !skuApprove ? (
          <Table dataSet={this.rightTableDs} columns={columns} customizedCode="SKU_TABLE_READ" />
        ) : (
          <div className="sku-tables">
            <div className="left-table">
              <p>{intl.get('small.common.model.supplierProducts').d('供应商商品库')}</p>
              <ModalTable
                width={490}
                dataSet={this.leftTableDs}
                columns={columns}
                customizedCode="SKU_TABLE"
              />
            </div>
            <div className="transfer-btns">
              <JoinButton dataSet={this.leftTableDs} />
              <DelButton dataSet={this.rightTableDs} />
            </div>
            <div className="right-table">
              <p>{intl.get('small.common.model.exitProducts').d('已添加商品')}</p>
              <ModalTable
                width={490}
                dataSet={this.rightTableDs}
                columns={columns}
                customizedCode="HAS_SKU_TABLE"
              />
            </div>
          </div>
        )}
      </div>
    );
  }
}

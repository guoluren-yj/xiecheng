/**
 * BOMModal - 我发出的订单明细页面 - BOM
 * @date: 2018-10-26
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Modal, Form, Input, Button, Row, Col, InputNumber, DatePicker } from 'hzero-ui';
import { sum, isNumber } from 'lodash';
import { Bind } from 'lodash-decorators';
import moment from 'moment';
import { connect } from 'dva';
import { parseAumont } from '@/routes/components/utils';
import uuid from 'uuid/v4';
import notification from 'utils/notification';
import intl from 'utils/intl';
import Lov from 'components/Lov';
import EditTable from 'components/EditTable';
import {
  addItemToPagination,
  createPagination,
  getCurrentOrganizationId,
  getEditTableData,
  delItemsToPagination,
} from 'utils/utils';
import {
  DATETIME_MIN,
  DEFAULT_DATE_FORMAT,
  MODAL_FORM_ITEM_LAYOUT,
  TABLE_OPERATOR_CLASSNAME,
} from 'utils/constants';
import { MAX_QUAN_NUMBER } from '@/routes/components/utils/constant';
// import { formatUom } from '@/routes/components/utils';

const FormItem = Form.Item;

/**
 * Search
 * @param {object} props - 属性
 * @param {object} props.dataSource - 数据源
 * @return {object} React.element
 */
const Search = ({ dataSource = {} }) => {
  const { itemCode, itemName } = dataSource;
  return (
    <Form>
      <Row>
        <Col span={12}>
          <FormItem {...MODAL_FORM_ITEM_LAYOUT} label={intl.get(`entity.item.code`).d('物料编码')}>
            {itemCode}
          </FormItem>
        </Col>
        <Col span={12}>
          <FormItem {...MODAL_FORM_ITEM_LAYOUT} label={intl.get(`entity.item.name`).d('物料名称')}>
            {itemName}
          </FormItem>
        </Col>
      </Row>
    </Form>
  );
};

@connect(({ loading, quotePurchaseRequisition }) => ({
  quotePurchaseRequisition,
  queryPoItemBOMLoading: loading.effects['quotePurchaseRequisition/newQueryPoItemBOM'],
  savePoItemBOMLoading: loading.effects['quotePurchaseRequisition/savePoItemBOM'],
  deleteLoading: loading.effects['quotePurchaseRequisition/deletePoItemBOM'],
  clearLoading: loading.effects['quotePurchaseRequisition/clearPoItemBOM'],
}))
export default class BOMModal extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: [], // 列表数据
      pagination: {}, // 分页数据
      selectedListRows: [], // BOM勾选行
      tenantId: getCurrentOrganizationId(),
    };
  }

  componentDidMount() {
    const {
      dispatch,
      actionListRowData = {},
      listCommonDataSource = [],
      handleChangeList = (e) => e,
    } = this.props;
    if (actionListRowData.saveBomItemId !== actionListRowData.itemId) {
      dispatch({
        type: 'quotePurchaseRequisition/clearPoItemBOM',
        payload: { poLineId: actionListRowData.poLineId },
      }).then((res) => {
        if (res) {
          const newDataSource = listCommonDataSource.map((item) => {
            if (item.poLineId === actionListRowData.poLineId) {
              return {
                ...item,
                saveBomItemId: actionListRowData.itemId,
              };
            }
            return item;
          });
          handleChangeList(newDataSource);
          this.fetchBOM();
        }
      });
    } else {
      this.fetchBOM();
    }
  }

  /**
   * fetchMessage - 查询BOM数据
   * @param {object} params - 查询条件
   */
  @Bind()
  fetchBOM(params) {
    const { dispatch, actionListRowData = {}, poHeaderId } = this.props;
    const { poLineId, poLineLocationId, itemId, quantity } = actionListRowData;
    const payload = {
      itemId,
      poHeaderId,
      poLineId,
      poLineLocationId,
      splQuantity: quantity,
      ...params,
    };
    dispatch({
      type: 'quotePurchaseRequisition/newQueryPoItemBOM',
      payload,
    }).then((res) => {
      if (res) {
        this.setState({
          dataSource: res.content.map((item) => ({ ...item, _status: 'update' })),
          pagination: createPagination(res),
        });
      }
    });
  }

  // BOM物料变更
  @Bind()
  handleItemCode(value, dataList, record) {
    const { dataSource = [] } = this.state;
    const {
      itemCode,
      itemName,
      categoryId,
      categoryName,
      uomId,
      uomName,
      uomCodeAndName,
    } = dataList;
    const newDataSource = dataSource.map((item) => {
      if (item.poItemBomId === record.poItemBomId) {
        record.$form.setFieldsValue({
          itemName,
          uomId,
          uomName,
          uomCodeAndName,
          categoryId,
          categoryName,
        });
        return {
          ...item,
          itemCode,
        };
      }
      return item;
    });
    this.setState({ dataSource: newDataSource });
  }

  @Bind()
  handleSaveBom() {
    const { dispatch, actionListRowData = {}, poHeaderId } = this.props;
    const { dataSource = [], tenantId } = this.state;
    const list = getEditTableData(dataSource, ['poItemBomId', '_status']).map((item) => ({
      ...item,
      needByDate: item.needByDate ? moment(item.needByDate).format(DATETIME_MIN) : undefined,
      tenantId,
      poHeaderId,
      splQuantity: actionListRowData.quantity,
      parentItemId: actionListRowData.itemId,
      poLineId: actionListRowData.poLineId,
      poLineLocationId: actionListRowData.poLineLocationId,
    }));
    if (list.length !== dataSource.length) return;
    dispatch({
      type: 'quotePurchaseRequisition/savePoItemBOM',
      payload: list,
    }).then((res) => {
      if (res) {
        this.fetchBOM();
        notification.success();
      }
    });
  }

  @Bind()
  handleCreateBom() {
    const { dataSource = [], pagination = {} } = this.state;
    const { actionListRowData } = this.props;
    const { needByDate, invOrganizationId, invOrganizationName } = actionListRowData;
    const newDataSource = [
      ...dataSource,
      {
        _status: 'create',
        poItemBomId: uuid(),
        needByDate,
        invOrganizationId,
        invOrganizationName,
      },
    ];
    this.setState({
      dataSource: newDataSource,
      pagination: addItemToPagination(dataSource.length, pagination),
    });
  }

  @Bind()
  handleRowSelectedChange(_, selectedRows) {
    this.setState({ selectedListRows: selectedRows });
  }

  @Bind()
  handleDeleteBom() {
    const { dispatch, actionListRowData = {} } = this.props;
    const { selectedListRows = [], dataSource = [], pagination = {}, tenantId } = this.state;
    const oldLines = selectedListRows
      .filter((item) => item._status === 'update')
      .map((item) => ({
        ...item,
        tenantId,
        poLineId: actionListRowData.poLineId,
        poLineLocationId: actionListRowData.poLineLocationId,
      }));
    const selectedRowKeys = selectedListRows.map((item) => item.poItemBomId);
    const newDataSource = dataSource.filter((item) => !selectedRowKeys.includes(item.poItemBomId));
    if (oldLines.length > 0) {
      dispatch({
        type: 'quotePurchaseRequisition/deletePoItemBOM',
        payload: oldLines,
      }).then((res) => {
        if (res) {
          this.fetchBOM();
          notification.success();
        }
      });
    } else {
      this.setState({
        dataSource: newDataSource,
        pagination: delItemsToPagination(selectedListRows.length, dataSource, pagination),
      });
    }
  }

  @Bind()
  handleQuantityChange(record) {
    const {
      actionListRowData: { quantity },
    } = this.props;
    const { setFieldsValue, getFieldValue } = record.$form;
    const bomQuantityUpdateFlag = Number(getFieldValue('quantity') !== record.quantity);
    setFieldsValue({
      historicalLineQuantity: quantity,
      bomQuantityUpdateFlag,
      unitQuantityUpdateFlag: getFieldValue('unitQuantityUpdateFlag') || bomQuantityUpdateFlag,
    });
  }

  render() {
    const {
      visible,
      onCancel,
      actionListRowData,
      queryPoItemBOMLoading,
      savePoItemBOMLoading,
      deleteLoading,
      clearLoading,
    } = this.props;
    const { dataSource = [], pagination = {}, selectedListRows = [] } = this.state;
    const columns = [
      {
        title: intl.get(`hzero.common.view.serialNumber`).d('序号'),
        dataIndex: 'orderSeq',
        width: 60,
      },
      {
        title: intl.get(`entity.item.code`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 180,
        render: (val, record) => {
          return (
            <FormItem>
              {record.$form.getFieldDecorator('itemId', {
                initialValue: record.itemId,
              })(
                <Lov
                  code="SPUC.ITEM_PRICE_CODE"
                  textValue={val}
                  lovOptions={{ valueField: 'itemId', displayField: 'itemCode' }}
                  onChange={(value, dataList) => this.handleItemCode(value, dataList, record)}
                />
              )}
            </FormItem>
          );
        },
      },
      {
        title: intl.get(`entity.item.name`).d('物料名称'),
        dataIndex: 'itemName',
        width: 150,
        render: (val, record) => {
          return (
            <FormItem>
              {record.$form.getFieldDecorator('itemName', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`entity.item.name`).d('物料名称'),
                    }),
                  },
                ],
                initialValue: record.itemName,
              })(<Input />)}
            </FormItem>
          );
        },
      },
      {
        title: intl.get(`sodr.common.model.common.itemTypeDesc`).d('物料类别'),
        width: 160,
        dataIndex: 'categoryName',
        render: (val, record) => {
          return (
            <FormItem>
              {record.$form.getFieldDecorator('categoryId', {
                initialValue: record.categoryId,
              })(
                <Lov
                  code="SMDM.CATEGORY.LEVEL_CONTROL"
                  textValue={val}
                  textField="categoryName"
                  queryParams={{
                    hzeroUIFlag: 1,
                    businessObjectCode: 'SRM_C_SRM_SODR_PO_HEADER',
                  }}
                  tableDsProps={{
                    record: {
                      dynamicProps: {
                        selectable: (_record) => _record.get('isCheck') !== false,
                      },
                    },
                  }}
                  lovOptions={{ valueField: 'categoryId', displayField: 'categoryName' }}
                />
              )}
            </FormItem>
          );
        },
      },
      {
        title: intl.get(`sodr.common.model.common.needQuantity`).d('需求数量'),
        width: 130,
        dataIndex: 'quantity',
        render: (val, record) => {
          return (
            <FormItem>
              {record.$form.getFieldDecorator('quantity', {
                initialValue: val,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`sodr.common.model.common.needQuantity`).d('需求数量'),
                    }),
                  },
                ],
              })(
                <InputNumber
                  allowThousandth="true"
                  max={MAX_QUAN_NUMBER}
                  parser={(value) => parseAumont(value, record.$form.getFieldValue('uomPrecision'))}
                  onChange={() => this.handleQuantityChange(record)}
                />
              )}
              {record.$form.getFieldDecorator('historicalLineQuantity', {
                initialValue: record.historicalLineQuantity,
              })}
              {record.$form.getFieldDecorator('bomQuantityUpdateFlag', {
                initialValue: record.bomQuantityUpdateFlag,
              })}
              {record.$form.getFieldDecorator('unitQuantityUpdateFlag', {
                initialValue: record.unitQuantityUpdateFlag,
              })}
            </FormItem>
          );
        },
      },
      {
        title: intl.get(`sodr.common.model.common.unitName`).d('单位'),
        width: 140,
        dataIndex: 'uomName',
        render: (val, record) => {
          return (
            <FormItem>
              {record.$form.getFieldDecorator('uomId', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`sodr.common.model.common.unitName`).d('单位'),
                    }),
                  },
                ],
                initialValue: record.uomId,
              })(
                <Lov
                  code="SMDM.UOM"
                  textValue={val}
                  textField="uomCodeAndName"
                  lovOptions={{ valueField: 'uomId', displayField: 'uomCodeAndName' }}
                  onChange={(_, { uomPrecision }) => {
                    record.$form.setFieldsValue({ uomPrecision });
                  }}
                />
              )}
              {record.$form.getFieldDecorator('uomCodeAndName', {
                initialValue: record.uomCodeAndName,
              })}
              {record.$form.getFieldDecorator('uomPrecision', {
                initialValue: record.uomPrecision,
              })}
            </FormItem>
          );
        },
      },
      {
        title: intl.get(`sodr.common.model.common.organizationName`).d('收货组织'),
        width: 140,
        dataIndex: 'invOrganizationName',
        render: (val, record) => {
          return (
            <FormItem>
              {record.$form.getFieldDecorator('invOrganizationId', {
                initialValue: record.invOrganizationId,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`sodr.common.model.common.organizationName`).d('收货组织'),
                    }),
                  },
                ],
              })(<Lov code="SPUC.SMDM.INV_ORG" textValue={val} />)}
            </FormItem>
          );
        },
      },
      {
        title: intl.get(`sodr.common.model.common.needByDate`).d('需求日期'),
        width: 150,
        dataIndex: 'needByDate',
        render: (val, record) => {
          return (
            <FormItem>
              {record.$form.getFieldDecorator('needByDate', {
                initialValue: val ? moment(val) : val,
              })(<DatePicker format={DEFAULT_DATE_FORMAT} />)}
            </FormItem>
          );
        },
      },
    ];
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    const tableProps = {
      columns,
      rowKey: 'poItemBomId',
      pagination,
      dataSource,
      loading: queryPoItemBOMLoading || clearLoading,
      bordered: true,
      onChange: this.fetchBOM,
      resizable: true,
      scroll: { x: scrollX },
      rowSelection: {
        selectedRowKeys: selectedListRows.map((n) => n.poItemBomId),
        onChange: this.handleRowSelectedChange,
      },
    };

    const searchProps = {
      dataSource: actionListRowData,
    };
    return (
      <Modal
        title={intl.get(`sodr.common.view.message.title.bom`).d('外协BOM')}
        visible={visible}
        onCancel={() => onCancel()}
        destroyOnClose
        width={1200}
        footer={null}
      >
        <Search {...searchProps} />
        <div className={TABLE_OPERATOR_CLASSNAME}>
          <Button type="primary" onClick={this.handleCreateBom}>
            {intl.get(`hzero.common.button.create`).d('新建')}
          </Button>
          <Button onClick={this.handleSaveBom} loading={savePoItemBOMLoading}>
            {intl.get(`hzero.common.button.save`).d('保存')}
          </Button>
          <Button loading={deleteLoading} onClick={this.handleDeleteBom}>
            {intl.get(`hzero.common.button.delete`).d('删除')}
          </Button>
        </div>
        <EditTable {...tableProps} />
      </Modal>
    );
  }
}

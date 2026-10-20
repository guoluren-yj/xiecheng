import React, { Component } from 'react';
import { sum, isNumber, isArray, omit, isEmpty, uniqBy, isNil } from 'lodash';
import { Button, Modal, Table, Form, InputNumber, Input } from 'hzero-ui';
// import Lov from 'components/Lov';
import { Bind } from 'lodash-decorators';
import ValueList from 'components/ValueList';
// import { getCurrentOrganizationId } from 'utils/utils';
import uuid from 'uuid/v4';
import { dateRender } from 'utils/renderer';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import notification from 'utils/notification';
import EditTable from 'components/EditTable';
import Upload from 'components/Upload';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import styles from './../index.less';
import FilterForm from './FilterForm';
import { showBigNumber } from '@/routes/components/utils';

function getRefFieldsValue(ref) {
  if (ref.current) {
    return ref.current.props.form.getFieldsValue();
  }
  return {};
}

// const FormItem = Form.Item;
const { confirm } = Modal;

export default class List extends Component {
  constructor(props) {
    super(props);
    this.oneSearchFormRef = React.createRef();
    // props.onRef(this);
    // this.state = { tenantId: getCurrentOrganizationId(), options: {} };
    this.state = {
      organizationId: getCurrentOrganizationId(),
      options: {},
      visible: false,
      selectedAddRows: [],
      selectedAddAllRows: [],
      // acceptListLineId: null,
    };
  }

  @Bind()
  updateState(text, values, record) {
    const { onProject, dispatch } = this.props;
    if (record.$form) record.$form.resetFields('itemName');
    if (values.itemId) {
      dispatch({
        type: 'acceptanceSheetCreate/itemCategories',
        payload: { enabledFlag: 1, itemId: values.itemId },
      }).then((res) => {
        if (isArray(res) && res.length === 1) {
          const newDataSource = {
            itemId: values.itemId ? values.itemId : record.itemId,
            itemCode: text ? values.itemCode : record.itemCode,
            itemCategoryName: res[0].categoryName ? res[0].categoryName : record.itemCategoryName,
            itemCategoryId: res[0].categoryId ? res[0].categoryId : record.itemCategoryId,
            itemName: values.itemName ? values.itemName : record.itemName,
            acceptListLineId: record.acceptListLineId,
            _status: record._status,
          };
          onProject(newDataSource);
        } else {
          const newDataSource = {
            itemId: values.itemId ? values.itemId : record.itemId,
            itemCode: text ? values.itemCode : record.itemCode,
            itemName: values.itemName ? values.itemName : record.itemName,
            itemCategoryName: record.itemCategoryName,
            itemCategoryId: record.itemCategoryId,
            acceptListLineId: record.acceptListLineId,
            _status: record._status,
          };
          onProject(newDataSource);
        }
      });
    }
  }

  @Bind()
  project() {
    const { onProject } = this.props;
    const newDataSource = {
      edited: true,
      acceptListLineId: uuid(),
      _status: 'create',
    };
    onProject(newDataSource);
  }

  @Bind()
  handleDeleteLine() {
    const {
      selectedRow,
      dataSource,
      acceptListHeaderId,
      dispatch,
      onFilterDataSource,
      // onSearch,
      fetchHeader,
    } = this.props;
    const newDataSource = [];
    const acceptListLineList = [];

    if (dataSource.length > 0) {
      confirm({
        title: intl.get('sinv.acceptanceSheetCreate.message.delete').d('确认删除？'),
        okText: intl.get('hzero.common.button.sure').d('确定'),
        cancelText: intl.get('hzero.common.button.cancel').d('取消'),
        onOk: () => {
          const selectRowKeys = selectedRow.map((item) => item.acceptListLineId);
          dataSource.forEach((ele) => {
            if (!selectRowKeys.includes(ele.acceptListLineId)) {
              newDataSource.push({ ...ele });
            } else if (ele._status !== 'create') {
              acceptListLineList.push(omit(ele, ['$form']));
            }
          });
          if (!isEmpty(acceptListLineList)) {
            dispatch({
              type: 'acceptanceSheetCreate/deleteLine',
              payload: { acceptListHeaderId, acceptListLineList },
            }).then((res) => {
              if (res) {
                notification.success();
                fetchHeader();
              }
            });
          } else {
            onFilterDataSource(selectedRow);
          }
        },
      });
    }
  }

  @Bind()
  changeValue(val, ele = {}) {
    this.setState({ options: ele.props });
  }

  @Bind()
  changeOption() {
    const { options = {} } = this.state;
    const { onUpdateDataSource, dataSource, selectedRow, onHandleChangeList } = this.props;
    const selectRowKeys = selectedRow.map((item) => item.acceptListLineId);
    onHandleChangeList(true);
    const newDataSource = dataSource.map((ele) => {
      if (selectRowKeys.includes(ele.acceptListLineId)) {
        if (ele.$form) ele.$form.resetFields('acceptOpinionCode', 'acceptOpinionCodeMeaning');
        return {
          ...ele,
          acceptOpinionCode: options.value,
          acceptOpinionCodeMeaning: options.children,
        };
      } else {
        return ele;
      }
    });
    onUpdateDataSource(newDataSource);
  }

  @Bind()
  handleCreate() {
    const { onFetchCreate } = this.props;
    this.setState({
      visible: true,
      selectedAddRows: [],
      selectedAddAllRows: [],
    });
    onFetchCreate();
  }

  @Bind()
  handleCancel() {
    const { onRefresh } = this.props;
    this.setState({
      visible: false,
    });
    onRefresh();
  }

  @Bind()
  handleOk() {
    const { onUpdateList, headerInfo } = this.props;
    const { sourceCode, acceptBaseCode } = headerInfo;
    const { selectedAddRows, selectedAddAllRows } = this.state;
    // 新建协议行时 根据是否为阶段计算费用
    const createRows =
      sourceCode === 'CONTRACT' && acceptBaseCode === 'STAGE'
        ? selectedAddAllRows
        : selectedAddRows;
    const newRows = createRows.map((item) => {
      const {
        purchaseCostQuantity,
        taxIncludeAmount,
        purchaseTaxIncludedPrice,
        canAcceptQuantity,
      } = item;
      if (headerInfo.sourceCode === 'ORDER') {
        return {
          ...item,
        };
      } else if (headerInfo.acceptBaseCode === 'STAGE') {
        const acceptAmount =
          purchaseTaxIncludedPrice * canAcceptQuantity * (purchaseCostQuantity / taxIncludeAmount);
        return { ...item, sourceId: item.pcHeaderId, sourceLineId: item.pcSubjectId, acceptAmount };
      } else {
        return {
          ...item,
          sourceId: item.pcHeaderId,
          sourceLineId: item.pcSubjectId,
        };
      }
    });
    onUpdateList(newRows);
    this.setState({
      visible: false,
    });
  }

  @Bind()
  handleSelectedAddRows(selectedRowKeys, selectedAddRows) {
    const { selectedAddAllRows } = this.state;
    const newAddRows = selectedAddAllRows.filter((i) => selectedRowKeys.includes(i.createId));
    this.setState({
      selectedAddRows,
      selectedAddAllRows: uniqBy(newAddRows.concat(selectedAddRows), 'createId'),
    });
  }

  /**
   * 表单查询
   */
  @Bind()
  handleOneSearchFormSearch() {
    const { onFormSearch } = this.props;
    const fieldsValue = getRefFieldsValue(this.oneSearchFormRef);
    const {
      createDateFrom,
      createDateTo,
      effectiveDateFrom,
      effectiveDateTo,
      releaseDateStart,
      releaseDateEnd,
      confirmDateStart,
      confirmDateEnd,
    } = fieldsValue;
    const newFieldsValue = {
      ...fieldsValue,
      createDateFrom: createDateFrom ? createDateFrom.format(DATETIME_MIN) : null,
      createDateTo: createDateTo ? createDateTo.format(DATETIME_MIN) : undefined,
      effectiveDateFrom: effectiveDateFrom ? effectiveDateFrom.format(DATETIME_MIN) : undefined,
      effectiveDateTo: effectiveDateTo ? effectiveDateTo.format(DATETIME_MIN) : undefined,
      releaseDateStart: releaseDateStart ? releaseDateStart.format(DATETIME_MIN) : undefined,
      releaseDateEnd: releaseDateEnd ? releaseDateEnd.format(DATETIME_MAX) : undefined,
      confirmDateStart: confirmDateStart ? confirmDateStart.format(DATETIME_MIN) : undefined,
      confirmDateEnd: confirmDateEnd ? confirmDateEnd.format(DATETIME_MAX) : undefined,
    };
    onFormSearch(newFieldsValue);
  }

  @Bind()
  handleAddPageChange(pagination = {}) {
    const { onAddPageChange, headerInfo = {} } = this.props;
    const { sourceCode, acceptBaseCode } = headerInfo;
    if (sourceCode !== 'CONTRACT' && acceptBaseCode !== 'STAGE') {
      this.setState({ selectedAddRows: [] });
    }
    const fieldsValue = getRefFieldsValue(this.oneSearchFormRef);
    const { createDateFrom, createDateTo, effectiveDateFrom, effectiveDateTo } = fieldsValue;
    const newFieldsValue = {
      ...fieldsValue,
      createDateFrom: createDateFrom ? createDateFrom.format(DATETIME_MIN) : null,
      createDateTo: createDateTo ? createDateTo.format(DATETIME_MIN) : undefined,
      effectiveDateFrom: effectiveDateFrom ? effectiveDateFrom.format(DATETIME_MIN) : undefined,
      effectiveDateTo: effectiveDateTo ? effectiveDateTo.format(DATETIME_MIN) : undefined,
    };
    onAddPageChange(pagination, newFieldsValue);
  }

  @Bind()
  handleChangeList(val, record) {
    const { onHandleChangeList } = this.props;
    onHandleChangeList(true, val, record);
  }

  /**
   * 计算费用
   * @param val
   * @param record
   */
  @Bind()
  handleChangeAcceptQuantity(val, record) {
    const { onHandleChangeAcceptQuantity } = this.props;
    onHandleChangeAcceptQuantity(true, val, record);
  }

  /**
   * 获取当前主键id值
   * @param record
   */
  // @Bind()
  // onRow(record) {
  //   this.setState({
  //     acceptListLineId: record.acceptListLineId,
  //   });
  // }

  /**
   * 保存Uuid
   */
  @Bind()
  afterOpenUploadModal(attachmentUuid, record) {
    const {
      // dataSource = [],
      // onChangeDataSource,
      onHandleUpload,
    } = this.props;
    if (!record.attachmentUuid && isNumber(record.acceptListLineId)) {
      onHandleUpload(attachmentUuid, record);
    }

    // const index = dataSource.findIndex(item => item.acceptListLineId === acceptListLineId);
    // const newDataSourceList = [
    //   ...dataSource.slice(0, index),
    //   {
    //     ...dataSource[index],
    //     attachmentUuid: attachmentUUID,
    //   },
    //   ...dataSource.slice(index + 1),
    // ];

    // onChangeDataSource(newDataSourceList);
  }

  /**
   * showUomText - unitCodeIsShow为1 显示code/name,为0 显示name,不存在则按旧逻辑显示
   * @param {object} record - 单条数据
   */
  @Bind()
  showUomText(record) {
    const { uomName, uomCode, unitCodeIsShow } = record;
    let text = uomName && uomCode ? <span>{`${uomCode}/${uomName}`}</span> : uomName;
    if (!isNil(unitCodeIsShow)) {
      text = unitCodeIsShow === '1' && uomCode && uomName ? `${uomCode}/${uomName}` : uomName;
    }
    return text;
  }

  /**
   *根据不同状态获取验收单行字段动态变化
   */
  @Bind()
  getColumns() {
    const { headerInfo = {} } = this.props;
    const { organizationId } = this.state;
    const { acceptBaseCode, sourceCode } = headerInfo;
    const columns = {
      base: [
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.lineNum`).d('序号'),
          dataIndex: 'lineNum',
          width: 100,
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.pcNum`).d('协议编号'),
          dataIndex: 'pcNum',
          width: 150,
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.pcName`).d('协议名称'),
          dataIndex: 'pcName',
          width: 150,
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.itemCode`).d('物料编码'),
          dataIndex: 'itemCode',
          width: 150,
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.itemName`).d('物料名称'),
          dataIndex: 'itemName',
          width: 150,
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.itemCategoryName`).d('物料类别'),
          width: 120,
          dataIndex: 'itemCategoryName',
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.uomName`).d('单位'),
          width: 150,
          dataIndex: 'uomName',
          render: (_val, record) => this.showUomText(record),
        },
      ],
      order: [
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.lineNum`).d('序号'),
          dataIndex: 'lineNum',
          width: 100,
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.orderNumber`).d('订单号'),
          dataIndex: 'poHeaderNum',
          width: 150,
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.orderList`).d('订单行号'),
          dataIndex: 'poLineNum',
          width: 150,
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.itemCode`).d('物料编码'),
          dataIndex: 'itemCode',
          width: 150,
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.itemName`).d('物料名称'),
          dataIndex: 'itemName',
          width: 150,
        },
        // {
        //   title: intl.get(`sinv.acceptanceSheetCreate.model.itemCategoryName`).d('物料类别'),
        //   width: 120,
        //   dataIndex: 'itemCategoryName',
        // },
        // {
        //   title: intl.get(`sinv.acceptanceSheetCreate.model.uomName`).d('单位'),
        //   width: 150,
        //   dataIndex: 'uomName',
        // },
      ],
      orderAcceptance: [
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.acceptQuantity`).d('本次验收数量'),
          width: 150,
          dataIndex: 'acceptQuantity',
          render: (val, record) => {
            if (record._status === 'update' || record._status === 'create') {
              return (
                <Form.Item>
                  {record.$form.getFieldDecorator(`acceptQuantity`, {
                    initialValue: record.acceptQuantity || record.canAcceptQuantity,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`sinv.acceptanceSheetCreate.model.acceptQuantity`)
                            .d('本次验收数量'),
                        }),
                      },
                    ],
                  })(
                    <InputNumber
                      min={0}
                      max={record.canAcceptQuantity}
                      onChange={(value) => this.handleChangeAcceptQuantity(value, record)}
                      allowThousandth
                      precision={record.uomPrecision}
                    />
                  )}
                </Form.Item>
              );
            }
          },
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.acceptOpinion`).d('验收意见'),
          width: 150,
          dataIndex: 'acceptOpinionCode',
          render: (val, record) =>
            ['create', 'update'].includes(record._status) ? (
              <Form.Item>
                {record.$form.getFieldDecorator(`acceptOpinionCode`, {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`sinv.acceptanceSheetCreate.model.acceptOpinion`)
                          .d('验收意见'),
                      }),
                    },
                  ],
                  initialValue: record.acceptOpinionCode,
                })(
                  <ValueList
                    lovCode="SPUC.ACCEPT_OPINION"
                    textValue={record.acceptOpinionCodeMeaning}
                    style={{ width: 120 }}
                    onChange={this.handleChangeList}
                    allowClear
                  />
                )}
              </Form.Item>
            ) : (
              val
            ),
        },
        // {
        //   title: intl.get(`sinv.acceptanceSheetCreate.model.cost`).d('费用'),
        //   width: 150,
        //   dataIndex: 'acceptAmount',
        // },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.canAcceptQuantity`).d('可验收数量'),
          width: 150,
          dataIndex: 'canAcceptQuantity',
          render: (value) => showBigNumber(value),
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.acceptedQuantity`).d('已验收数量'),
          width: 150,
          dataIndex: 'acceptedQuantity',
          render: (value) => showBigNumber(value),
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.itemCategoryName`).d('物料类别'),
          width: 120,
          dataIndex: 'itemCategoryName',
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.uomName`).d('单位'),
          width: 150,
          dataIndex: 'uomName',
          render: (_val, record) => this.showUomText(record),
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.quantity`).d('数量'),
          width: 150,
          dataIndex: 'quantity',
          render: (value) => showBigNumber(value),
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.poUnitPricea`).d('单价'),
          width: 150,
          dataIndex: 'poUnitPrice',
          render: (value) => showBigNumber(value),
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.amount`).d('金额'),
          width: 150,
          dataIndex: 'amount',
          render: (value, record) => showBigNumber(value, record.financialPrecision),
        },
      ],
      normalAcceptance: [
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.quantity`).d('数量'),
          width: 150,
          dataIndex: 'quantity',
          render: (value) => showBigNumber(value),
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.acceptQuantity`).d('本次验收数量'),
          width: 150,
          dataIndex: 'acceptQuantity',
          render: (val, record) => {
            if (record._status === 'update' || record._status === 'create') {
              return (
                <Form.Item>
                  {record.$form.getFieldDecorator(`acceptQuantity`, {
                    initialValue: record.acceptQuantity || record.canAcceptQuantity,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`sinv.acceptanceSheetCreate.model.acceptQuantity`)
                            .d('本次验收数量'),
                        }),
                      },
                    ],
                  })(
                    <InputNumber
                      min={0}
                      max={record.canAcceptQuantity}
                      onChange={(value) => this.handleChangeList(value, record)}
                      allowThousandth
                      precision={record.uomPrecision}
                    />
                  )}
                </Form.Item>
              );
            }
          },
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.acceptOpinion`).d('验收意见'),
          width: 150,
          dataIndex: 'acceptOpinionCode',
          render: (val, record) =>
            ['create', 'update'].includes(record._status) ? (
              <Form.Item>
                {record.$form.getFieldDecorator(`acceptOpinionCode`, {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`sinv.acceptanceSheetCreate.model.acceptOpinion`)
                          .d('验收意见'),
                      }),
                    },
                  ],
                  initialValue: record.acceptOpinionCode,
                })(
                  <ValueList
                    lovCode="SPUC.ACCEPT_OPINION"
                    textValue={record.acceptOpinionCodeMeaning}
                    style={{ width: 120 }}
                    onChange={this.handleChangeList}
                    allowClear
                  />
                )}
              </Form.Item>
            ) : (
              val
            ),
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.canAcceptQuantity`).d('可验收数量'),
          width: 150,
          dataIndex: 'canAcceptQuantity',
          render: (value) => showBigNumber(value),
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.acceptedQuantity`).d('已验收数量'),
          width: 150,
          dataIndex: 'acceptedQuantity',
          render: (value) => showBigNumber(value),
        },
      ],
      stageAcceptance: [
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.stage`).d('阶段'),
          width: 150,
          dataIndex: 'stageName',
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.quantity`).d('数量'),
          width: 150,
          dataIndex: 'quantity',
          render: (value) => showBigNumber(value),
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.acceptQuantity`).d('本次验收数量'),
          width: 150,
          dataIndex: 'acceptQuantity',
          render: (val, record) => {
            if (record._status === 'update' || record._status === 'create') {
              return (
                <Form.Item>
                  {record.$form.getFieldDecorator(`acceptQuantity`, {
                    initialValue: record.acceptQuantity || record.canAcceptQuantity,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`sinv.acceptanceSheetCreate.model.acceptQuantity`)
                            .d('本次验收数量'),
                        }),
                      },
                    ],
                  })(
                    <InputNumber
                      min={0}
                      max={record.canAcceptQuantity}
                      onChange={(value) => this.handleChangeAcceptQuantity(value, record)}
                      allowThousandth
                      precision={record.uomPrecision}
                    />
                  )}
                </Form.Item>
              );
            }
          },
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.acceptOpinion`).d('验收意见'),
          width: 150,
          dataIndex: 'acceptOpinionCode',
          render: (val, record) =>
            ['create', 'update'].includes(record._status) ? (
              <Form.Item>
                {record.$form.getFieldDecorator(`acceptOpinionCode`, {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`sinv.acceptanceSheetCreate.model.acceptOpinion`)
                          .d('验收意见'),
                      }),
                    },
                  ],
                  initialValue: record.acceptOpinionCode,
                })(
                  <ValueList
                    lovCode="SPUC.ACCEPT_OPINION"
                    textValue={record.acceptOpinionCodeMeaning}
                    style={{ width: 120 }}
                    onChange={this.handleChangeList}
                    allowClear
                  />
                )}
              </Form.Item>
            ) : (
              val
            ),
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.cost`).d('费用'),
          width: 150,
          dataIndex: 'acceptAmount',
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.canAcceptQuantity`).d('可验收数量'),
          width: 150,
          dataIndex: 'canAcceptQuantity',
          render: (value) => showBigNumber(value),
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.acceptedQuantity`).d('已验收数量'),
          width: 150,
          dataIndex: 'acceptedQuantity',
          render: (value) => showBigNumber(value),
        },
      ],
      others: [
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.pcTypeName`).d('协议类型'),
          width: 150,
          dataIndex: 'pcTypeName',
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.specifications`).d('规格'),
          width: 150,
          dataIndex: 'specifications',
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.model`).d('型号'),
          width: 150,
          dataIndex: 'model',
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.deliverDate`).d('交付日期'),
          width: 150,
          dataIndex: 'deliverDate',
          render: dateRender,
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.remark`).d('备注'),
          width: 150,
          dataIndex: 'remark',
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.pcSourceCode`).d('来源单据编号'),
          width: 150,
          dataIndex: 'pcSourceCode',
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.pcSourceLineNum`).d('来源单据行号'),
          width: 120,
          dataIndex: 'pcSourceLineNum',
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.specification`).d('验收说明'),
          width: 150,
          dataIndex: 'lineAcceptDescription',
          render: (val, record) => {
            if (record._status === 'update' || record._status === 'create') {
              return (
                <Form.Item>
                  {record.$form.getFieldDecorator(`lineAcceptDescription`, {
                    initialValue: record.lineAcceptDescription,
                  })(<Input />)}
                </Form.Item>
              );
            }
          },
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.action`).d('操作'),
          width: 150,
          dataIndex: 'attachmentUuid',
          render: (val, record) => {
            if (record._status === 'update' || record._status === 'create') {
              return (
                <Form.Item>
                  {record.$form.getFieldDecorator(`attachmentUuid`, {
                    initialValue: record.attachmentUuid,
                  })(
                    <Upload
                      bucketName="private-bucket"
                      bucketDirectory="ssrc-rfx-rfxitem"
                      attachmentUUID={val}
                      tenantId={organizationId}
                      afterOpenUploadModal={(id) => this.afterOpenUploadModal(id, record)}
                    />
                  )}
                </Form.Item>
              );
            }
          },
        },
      ],
      orderOthers: [
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.orderName`).d('订单类型'),
          width: 150,
          dataIndex: 'orderTypeName',
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.specifications`).d('规格'),
          width: 150,
          dataIndex: 'specifications',
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.model`).d('型号'),
          width: 150,
          dataIndex: 'model',
        },
        // {
        //   title: intl.get(`sinv.acceptanceSheetCreate.model.deliverDate`).d('交付日期'),
        //   width: 150,
        //   dataIndex: 'deliverDate',
        //   render: dateRender,
        // },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.remark`).d('备注'),
          width: 150,
          dataIndex: 'remark',
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.pcSourceCode`).d('来源单据编号'),
          width: 150,
          dataIndex: 'pcSourceCode',
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.pcSourceLineNum`).d('来源单据行号'),
          width: 120,
          dataIndex: 'pcSourceLineNum',
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.lineAcceptDescription`).d('验收说明'),
          width: 150,
          dataIndex: 'lineAcceptDescription',
          render: (val, record) => {
            if (record._status === 'update' || record._status === 'create') {
              return (
                <Form.Item>
                  {record.$form.getFieldDecorator(`lineAcceptDescription`, {
                    initialValue: record.lineAcceptDescription,
                  })(<Input />)}
                </Form.Item>
              );
            }
          },
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.action`).d('操作'),
          width: 150,
          dataIndex: 'attachmentUuid',
          render: (val, record) => {
            if (record._status === 'update' || record._status === 'create') {
              return (
                <Form.Item>
                  {record.$form.getFieldDecorator(`attachmentUuid`, {
                    initialValue: record.attachmentUuid,
                  })(
                    <Upload
                      bucketName="private-bucket"
                      bucketDirectory="ssrc-rfx-rfxitem"
                      attachmentUUID={val}
                      tenantId={organizationId}
                      afterOpenUploadModal={(id) => this.afterOpenUploadModal(id, record)}
                    />
                  )}
                </Form.Item>
              );
            }
          },
        },
      ],
    };
    if (sourceCode === 'ORDER') {
      return columns.order.concat(columns.orderAcceptance, columns.orderOthers);
    } else if (acceptBaseCode === 'STAGE') {
      // 协议阶段
      return columns.base.concat(columns.stageAcceptance, columns.others);
    } else {
      return columns.base.concat(columns.normalAcceptance, columns.others);
    }
  }

  /**
   *根据不同状态获取协议行字段动态变化
   */
  @Bind()
  getAddColumns() {
    const { headerInfo = {} } = this.props;
    const { acceptBaseCode, sourceCode } = headerInfo;
    const columns = {
      base: [
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.pcNum`).d('协议编号'),
          dataIndex: 'pcNum',
          width: 150,
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.pcName`).d('协议名称'),
          dataIndex: 'pcName',
          width: 150,
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.itemCode`).d('物料编码'),
          dataIndex: 'itemCode',
          width: 150,
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.itemName`).d('物料名称'),
          dataIndex: 'itemName',
          width: 150,
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.itemCategoryName`).d('物料类别'),
          dataIndex: 'itemCategoryName',
          width: 150,
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.uomName`).d('单位'),
          width: 150,
          dataIndex: 'uomName',
          render: (_val, record) => this.showUomText(record),
        },
      ],
      order: [
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.orderNumber`).d('订单号'),
          dataIndex: 'poHeaderNum',
          width: 150,
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.orderList`).d('订单行号'),
          dataIndex: 'poLineNum',
          width: 150,
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.itemCode`).d('物料编码'),
          dataIndex: 'itemCode',
          width: 150,
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.itemName`).d('物料名称'),
          dataIndex: 'itemName',
          width: 150,
        },
        // {
        //   title: intl.get(`sinv.acceptanceSheetCreate.model.itemCategoryName`).d('物料类别'),
        //   dataIndex: 'itemCategoryName',
        //   width: 150,
        // },
        // {
        //   title: intl.get(`sinv.acceptanceSheetCreate.model.uomName`).d('单位'),
        //   width: 150,
        //   dataIndex: 'uomName',
        // },
      ],
      stageAcceptance: [
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.stage`).d('阶段'),
          width: 150,
          dataIndex: 'stageName',
        },
      ],
      others: [
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.quantity`).d('数量'),
          width: 150,
          dataIndex: 'quantity',
          render: (value) => showBigNumber(value),
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.canAcceptanceQuantity`).d('可验收数量'),
          width: 150,
          dataIndex: 'canAcceptQuantity',
          render: (value) => showBigNumber(value),
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.pcTypeName`).d('协议类型'),
          width: 150,
          dataIndex: 'pcTypeName',
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.specifications`).d('规格'),
          width: 150,
          dataIndex: 'specifications',
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.model`).d('型号'),
          width: 150,
          dataIndex: 'model',
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.deliverDate`).d('交付日期'),
          width: 150,
          dataIndex: 'deliverDate',
          render: dateRender,
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.pcSourceCode`).d('来源单据编号'),
          width: 150,
          dataIndex: 'pcSourceCode',
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.pcSourceLineNum`).d('来源单据行号'),
          width: 120,
          dataIndex: 'pcSourceLineNum',
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.remark`).d('备注'),
          width: 150,
          dataIndex: 'remark',
        },
      ],
      orderAcceptance: [
        // {
        //   title: intl.get(`sinv.acceptanceSheetCreate.model.acceptQuantity`).d('本次验收数量'),
        //   width: 150,
        //   dataIndex: 'acceptQuantity',
        //   render: (val, record) => {
        //     if (record._status === 'update' || record._status === 'create') {
        //       return (
        //         <Form.Item>
        //           {record.$form.getFieldDecorator(`acceptQuantity`, {
        //             initialValue: record.acceptQuantity || record.canAcceptQuantity,
        //             rules: [
        //               {
        //                 required: true,
        //                 message: intl.get('hzero.common.validation.notNull', {
        //                   name: intl
        //                     .get(`sinv.acceptanceSheetCreate.model.acceptQuantity`)
        //                     .d('本次验收数量'),
        //                 }),
        //               },
        //             ],
        //           })(
        //             <InputNumber
        //               min={0}
        //               max={record.canAcceptQuantity}
        //               onChange={value => this.handleChangeAcceptQuantity(value, record)}
        //             />
        //           )}
        //         </Form.Item>
        //       );
        //     }
        //   },
        // },
        // {
        //   title: intl.get(`sinv.acceptanceSheetCreate.model.acceptOpinion`).d('验收意见'),
        //   width: 150,
        //   dataIndex: 'acceptOpinionCode',
        //   render: (val, record) =>
        //     ['create', 'update'].includes(record._status) ? (
        //       <Form.Item>
        //         {record.$form.getFieldDecorator(`acceptOpinionCode`, {
        //           rules: [
        //             {
        //               required: true,
        //               message: intl.get('hzero.common.validation.notNull', {
        //                 name: intl
        //                   .get(`sinv.acceptanceSheetCreate.model.acceptOpinion`)
        //                   .d('验收意见'),
        //               }),
        //             },
        //           ],
        //           initialValue: record.acceptOpinionCode,
        //         })(
        //           <ValueList
        //             lovCode="SPUC.ACCEPT_OPINION"
        //             textValue={record.acceptOpinionCodeMeaning}
        //             style={{ width: 120 }}
        //             onChange={this.handleChangeList}
        //             allowClear
        //           />
        //         )}
        //       </Form.Item>
        //     ) : (
        //       val
        //     ),
        // },
        // {
        //   title: intl.get(`sinv.acceptanceSheetCreate.model.acceptedQuantity`).d('已验收数量'),
        //   width: 150,
        //   dataIndex: 'acceptedQuantity',
        // },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.itemCategoryName`).d('物料类别'),
          width: 120,
          dataIndex: 'itemCategoryName',
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.uomName`).d('单位'),
          width: 150,
          dataIndex: 'uomName',
          render: (_val, record) => this.showUomText(record),
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.quantity`).d('数量'),
          width: 150,
          dataIndex: 'quantity',
          render: (value) => showBigNumber(value),
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.canAcceptanceQuantity`).d('可验收数量'),
          width: 150,
          dataIndex: 'canAcceptQuantity',
          render: (value) => showBigNumber(value),
        },
        // {
        //   title: intl.get(`sinv.acceptanceSheetCreate.model.poUnitPricea`).d('单价'),
        //   width: 150,
        //   dataIndex: 'poUnitPrice',
        // },
        // {
        //   title: intl.get(`sinv.acceptanceSheetCreate.model.amount`).d('金额'),
        //   width: 150,
        //   dataIndex: 'amount',
        // },
      ],
      orderOthers: [
        // {
        //   title: intl.get(`sinv.acceptanceSheetCreate.model.quantity`).d('数量'),
        //   width: 150,
        //   dataIndex: 'quantity',
        // },
        // {
        //   title: intl.get(`sinv.acceptanceSheetCreate.model.canAcceptanceQuantity`).d('可验收数量'),
        //   width: 150,
        //   dataIndex: 'acceptQuantity',
        // },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.orderName`).d('订单类型'),
          width: 150,
          dataIndex: 'orderTypeName',
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.specifications`).d('规格'),
          width: 150,
          dataIndex: 'specifications',
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.model`).d('型号'),
          width: 150,
          dataIndex: 'model',
        },
        // {
        //   title: intl.get(`sinv.acceptanceSheetCreate.model.deliverDate`).d('交付日期'),
        //   width: 150,
        //   dataIndex: 'deliverDate',
        //   render: dateRender,
        // },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.pcSourceCode`).d('来源单据编号'),
          width: 150,
          dataIndex: 'pcSourceCode',
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.pcSourceLineNum`).d('来源单据行号'),
          width: 120,
          dataIndex: 'pcSourceLineNum',
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.remark`).d('备注'),
          width: 150,
          dataIndex: 'remark',
        },
      ],
    };
    if (sourceCode === 'ORDER') {
      return columns.order.concat(columns.orderAcceptance, columns.orderOthers);
    } else if (acceptBaseCode === 'STAGE') {
      // 协议阶段
      return columns.base.concat(columns.stageAcceptance, columns.others);
    } else {
      return columns.base.concat(columns.others);
    }
  }

  render() {
    const {
      headerInfo,
      onSearch,
      selectedRowKeys = [],
      onSelectRow,
      dataSource = [],
      pagination = {},
      pcLineList = [],
      pcLinePagination = {},
      fetchBasePcLineListLoading, // 添加的loading
      customizeTable,
      customizeCode,
      // hcuzListFlag,
    } = this.props;
    const { sourceCode, acceptBaseCode } = headerInfo;
    const { options = {}, visible, selectedAddRows } = this.state;
    const rowSelection = {
      selectedAddRowKeys: selectedAddRows.map((r) =>
        acceptBaseCode === 'STAGE' ? r.createId : r.pcSubjectId
      ),
      onChange: this.handleSelectedAddRows,
    };
    // 基于协议行columns  根据条件动态字段变化
    const columns = this.getColumns();
    // const code =
    //   sourceCode === 'ORDER'
    //     ? 'SINV.ACCEPTANCE_CREATE_DETAIL.ORDER'
    //     : 'SINV.ACCEPTANCE_CREATE_DETAIL.AGREEMENT';
    const addColumns = this.getAddColumns();
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    const stageScrollx = sum(addColumns.map((n) => (isNumber(n.width) ? n.width : 0)));
    return (
      <React.Fragment>
        <div className={styles['table-control-group']}>
          <ValueList
            lovCode="SPUC.ACCEPT_OPINION"
            style={{ width: 120 }}
            onChange={this.changeValue}
            value={options.children ? options.children : ''}
            allowClear
          />
          <Button
            onClick={this.changeOption}
            disabled={selectedRowKeys.length === 0 && isArray(selectedRowKeys)}
          >
            {intl
              .get(`sinv.acceptanceSheetCreate.model.acceptManyOpinionCode`)
              .d('批量选择验收意见')}
          </Button>
          <Button
            disabled={selectedRowKeys.length === 0 && isArray(selectedRowKeys)}
            onClick={this.handleDeleteLine}
          >
            {intl.get(`hzero.common.button.delete`).d('删除')}
          </Button>
          <Button style={{ marginLeft: 8 }} type="primary" onClick={this.handleCreate}>
            {intl.get(`hzero.common.button.add`).d('新增')}
          </Button>
        </div>
        {customizeTable(
          {
            code: customizeCode,
            isCreate: true,
            // dataSourceLoading: hcuzListFlag,
          },
          <EditTable
            bordered
            columns={columns}
            rowSelection={{
              selectedRowKeys,
              onChange: onSelectRow,
            }}
            rowKey="acceptListLineId"
            dataSource={dataSource}
            pagination={pagination}
            onChange={onSearch}
            scroll={{ x: scrollX }}
            // onRow={record => {
            //   return {
            //     onClick: () => this.onRow(record),
            //   };
            // }}
          />
        )}
        <Modal
          title={
            sourceCode === 'ORDER'
              ? intl
                  .get('sinv.acceptanceSheetCreate.view.message.title.createOrder')
                  .d('新建订单行')
              : intl
                  .get('sinv.acceptanceSheetCreate.view.message.title.createPcLine')
                  .d('新建协议行')
          }
          destroyOnClose
          visible={visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          width={1200}
        >
          <FilterForm
            headerInfo={headerInfo}
            wrappedComponentRef={this.oneSearchFormRef}
            onSearch={this.handleOneSearchFormSearch}
          />
          <Table
            bordered
            rowKey={
              sourceCode === 'ORDER'
                ? 'poLineId'
                : acceptBaseCode === 'STAGE'
                ? 'createId'
                : 'pcSubjectId'
            }
            columns={addColumns}
            dataSource={pcLineList}
            pagination={pcLinePagination}
            rowSelection={rowSelection}
            loading={fetchBasePcLineListLoading}
            onChange={this.handleAddPageChange}
            scroll={{ x: stageScrollx }}
          />
        </Modal>
      </React.Fragment>
    );
  }
}

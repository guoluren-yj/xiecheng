import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Button, Form, Input, Row, Col, Modal } from 'hzero-ui';
import { isEmpty, omit } from 'lodash';
import { Bind } from 'lodash-decorators';
import uuid from 'uuid/v4';

import Lov from 'components/Lov';
import EditTable from 'components/EditTable';
import notification from 'utils/notification';
import intl from 'utils/intl';
import {
  getEditTableData,
  addItemToPagination,
  delItemToPagination,
  getCurrentOrganizationId,
  filterNullValueObject,
} from 'utils/utils';
import Checkbox from 'components/Checkbox';

@Form.create({ fieldNameProp: null })
@connect(({ loading, smdmPurchaseCategory }) => ({
  smdmPurchaseCategory,
  searchLoading: loading.effects['smdmPurchaseCategory/fetchAssignPurchase'],
  saveLoading: loading.effects['smdmPurchaseCategory/saveAssignPurchase'],
  deleteLoading: loading.effects['smdmPurchaseCategory/deleteAssignPurchase'],
}))
export default class MaterielModal extends PureComponent {
  state = {
    selectedRows: [],
    purchaseAgentId: null,
    tenantId: getCurrentOrganizationId(),
  };

  componentDidMount() {
    const {
      smdmPurchaseCategory: { assgnPurchasePagination = {} },
    } = this.props;
    this.searchAssignPurchase(assgnPurchasePagination);
  }

  /**
   * 采购分配查询
   */
  @Bind()
  searchAssignPurchase(page = {}) {
    const {
      dispatch,
      form,
      purchaseAssignRecord: { categoryId },
      smdmPurchaseCategory: { assgnPurchaseList },
    } = this.props;
    const { tenantId } = this.state;
    const filterValues = filterNullValueObject(form.getFieldsValue());
    this.setState({ selectedRows: [] });
    dispatch({
      type: 'smdmPurchaseCategory/fetchAssignPurchase',
      payload: {
        tenantId,
        categoryId,
        page,
        ...filterValues,
        customizeUnitCode:
          'SMDM.PURCHASE_CATEGORY_LIST.ASSIGNBUYER_LIST,SMDM.PURCHASE_CATEGORY_LIST.ASSIGNBUYER_SEARCH',
      },
    }).then(() => {
      assgnPurchaseList.forEach((item) => {
        item.$form.resetFields();
      });
    });
  }

  /**
   * 新建一行
   */
  @Bind()
  handleCreateRow() {
    const {
      dispatch,
      smdmPurchaseCategory: { assgnPurchaseList = [], assgnPurchasePagination = {} },
    } = this.props;
    const newAssgnPurchaseList = {
      categoryPurchaserId: uuid(),
      purchaseAgentCode: null,
      purchaseAgentName: null,
      mainPurchaseFlag: 0,
      _status: 'create',
    };
    dispatch({
      type: 'smdmPurchaseCategory/updateState',
      payload: {
        assgnPurchaseList: [newAssgnPurchaseList, ...assgnPurchaseList],
        assgnPurchasePagination: addItemToPagination(
          assgnPurchaseList.length,
          assgnPurchasePagination
        ),
      },
    });
  }

  @Bind()
  isDelete(record = {}) {
    return record.mainPurchaseFlag;
  }

  @Bind()
  isSave = (fn, record = {}) => {
    const { selectedRows } = this.state;
    const mainPurchaseFlags = selectedRows.map((o) => o.mainPurchaseFlag);
    if (this.isDelete(record) === 1 || mainPurchaseFlags.includes(1)) {
      Modal.confirm({
        title: intl
          .get(`hzero.common.validation.ifdeleteMainPurchaser`)
          .d('删除内容包含主采购，不建议删除，是否继续？(在自动分配时将会随机分配采购员)'),
        onOk: fn,
      });
    } else {
      fn();
    }
  };

  /**
   * 清除功能
   */
  @Bind()
  clearLine(record) {
    const {
      dispatch,
      smdmPurchaseCategory: { assgnPurchaseList = [], assgnPurchasePagination = {} },
    } = this.props;
    const { tenantId } = this.state;
    const newDataSource = [];
    const deleteList = [];
    assgnPurchaseList.forEach((item) => {
      if (item.categoryPurchaserId !== record.categoryPurchaserId) {
        newDataSource.push(item);
      } else if (item._status !== 'create') {
        deleteList.push(omit(item, ['$form']));
      }
    });
    this.isSave(() => {
      if (!isEmpty(deleteList)) {
        dispatch({
          type: 'smdmPurchaseCategory/deleteAssignPurchase',
          payload: { tenantId, deleteList },
        }).then((res) => {
          if (res) {
            notification.success();
            this.searchAssignPurchase();
          }
        });
      } else {
        dispatch({
          type: 'smdmPurchaseCategory/updateState',
          payload: {
            assgnPurchaseList: newDataSource,
            assgnPurchasePagination: delItemToPagination(
              assgnPurchaseList.length,
              assgnPurchasePagination
            ),
          },
        });
        this.setState({ selectedRows: [] });
      }
    }, record);
  }

  /**
   * 删除功能
   */
  @Bind()
  deleteLine() {
    const {
      dispatch,
      smdmPurchaseCategory: { assgnPurchaseList = [], assgnPurchasePagination = {} },
    } = this.props;
    const { selectedRows, tenantId } = this.state;
    const selectedRowKeys = selectedRows.map((o) => o.categoryPurchaserId);
    const newDataSource = [];
    const deleteList = [];
    assgnPurchaseList.forEach((item) => {
      if (!selectedRowKeys.includes(item.categoryPurchaserId)) {
        newDataSource.push(item);
      } else if (item._status !== 'create') {
        deleteList.push(omit(item, ['$form']));
      }
    });
    this.isSave(() => {
      if (!isEmpty(deleteList)) {
        dispatch({
          type: 'smdmPurchaseCategory/deleteAssignPurchase',
          payload: { tenantId, deleteList },
        }).then((res) => {
          if (res) {
            notification.success();
            this.searchAssignPurchase();
          }
        });
      } else {
        dispatch({
          type: 'smdmPurchaseCategory/updateState',
          payload: {
            assgnPurchaseList: newDataSource,
            assgnPurchasePagination: delItemToPagination(
              assgnPurchaseList.length,
              assgnPurchasePagination
            ),
          },
        });
        this.setState({ selectedRows: [] });
      }
    });
  }

  /**
   * 保存勾选数据
   * @param {Array} selectedRowKeys 行key
   * @param {Array} selectedRows 行数据
   */
  @Bind()
  onSelectChange(selectedRowKeys, selectedRows) {
    this.setState({ selectedRows });
  }

  /**
   * 保存新建数据
   */
  @Bind()
  onSave() {
    const {
      dispatch,
      smdmPurchaseCategory: { assgnPurchaseList = [] },
      purchaseAssignRecord = {},
    } = this.props;
    const { categoryId } = purchaseAssignRecord;
    const { tenantId, purchaseAgentId } = this.state;
    const editTableData = getEditTableData(assgnPurchaseList, ['categoryPurchaserId', '_status'], {
      force: true,
    }).map((item) => {
      return {
        purchaseAgentId,
        tenantId,
        categoryId,
        ...item,
      };
    });
    if (
      assgnPurchaseList.length === 0 ||
      (Array.isArray(editTableData) && editTableData.length !== 0)
    ) {
      dispatch({
        type: 'smdmPurchaseCategory/saveAssignPurchase',
        payload: editTableData,
      }).then((res) => {
        if (res) {
          notification.success();
          dispatch({
            type: 'smdmPurchaseCategory/updateState',
            payload: {
              assgnPurchasePagination: {},
            },
          });
          this.searchAssignPurchase();
        }
      });
    }
  }

  @Bind()
  handleUnitChange(value, lovRecord) {
    this.setState({
      purchaseAgentId: lovRecord.purchaseAgentId || null,
    });
  }

  /**
   * 多查询条件展示
   */
  @Bind()
  toggleForm() {
    const { display } = this.state;
    this.setState({
      display: !display,
    });
  }

  /**
   * handleResetSearch - 品类定义查询条件
   */
  @Bind()
  handleFormReset() {
    const { form } = this.props;
    form.resetFields();
  }

  renderForm() {
    const {
      form,
      customizeFilterForm,
      form: { getFieldDecorator },
      purchaseAssignRecord = {},
    } = this.props;
    const formItemLayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
    };
    const { display } = this.state;
    const { categoryId } = purchaseAssignRecord;
    getFieldDecorator('categoryId', { initialValue: categoryId });
    return customizeFilterForm(
      {
        code: 'SMDM.PURCHASE_CATEGORY_LIST.ASSIGNBUYER_SEARCH',
        form,
        expand: display,
      },
      <Form layout="inline" className="more-fields-form">
        <Row>
          <Col span={16}>
            <Row>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`smdm.materiel.model.materiel.purchaseAgentCode`).d('采购员编码')}
                >
                  {getFieldDecorator('purchaseAgentCode')(<Input inputChinese={false} />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`smdm.materiel.model.materiel.purchaseAgentName`).d('采购员名称')}
                >
                  {getFieldDecorator('purchaseAgentName')(<Input />)}
                </Form.Item>
              </Col>
            </Row>
            <Row style={{ display: display ? 'block' : 'none' }} />
          </Col>
          <Col span={8} className="search-btn-more">
            <Form.Item>
              <Button
                style={{ display: !display ? 'inline-block' : 'none' }}
                onClick={this.toggleForm}
              >
                {intl.get('hzero.common.button.viewMore').d('更多查询')}
              </Button>
              <Button
                style={{ display: !display ? 'none' : 'inline-block' }}
                onClick={this.toggleForm}
              >
                {intl.get('hzero.common.button.collected').d('收起查询')}
              </Button>
              <Button onClick={this.handleFormReset} style={{ marginTop: 6 }}>
                {intl.get(`hzero.common.button.reset`).d('重置')}
              </Button>
              <Button
                style={{ marginLeft: 8, marginTop: 6 }}
                type="primary"
                htmlType="submit"
                onClick={() => this.searchAssignPurchase()}
              >
                {intl.get(`hzero.common.button.search`).d('查询')}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }

  render() {
    const {
      searchLoading,
      deleteLoading,
      saveLoading,
      onCancel,
      dispatch,
      customizeTable,
      purchaseAssignVisible,
      smdmPurchaseCategory: { assgnPurchaseList = [], assgnPurchasePagination = {} },
    } = this.props;
    const { selectedRows, tenantId } = this.state;
    const selectedRowKeys = selectedRows.map((i) => i.categoryPurchaserId);
    const columns = [
      {
        title: intl.get(`smdm.materiel.model.materiel.purchaseAgentCode`).d('采购员编码'),
        dataIndex: 'purchaseAgentCode',
        width: 150,
        render: (text, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator, setFieldsValue, validateFields } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('purchaseAgentId', {
                  initialValue: record.purchaseAgentId,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`smdm.materiel.model.materiel.purchaseAgentCode`)
                          .d('采购员编码'),
                      }),
                    },
                  ],
                })(
                  <Lov
                    textValue={record.purchaseAgentCode}
                    code="SMDM.PURCHASE_AGENT"
                    queryParams={{ tenantId }}
                    lovOptions={{ displayField: 'purchaseAgentCode' }}
                    onChange={(val, lovRecord) => {
                      this.handleUnitChange(val, lovRecord);
                      validateFields(['purchaseAgentCode'], { force: true });
                      // console.log(lovRecord)
                      setFieldsValue({
                        purchaseAgentName: lovRecord.purchaseAgentName,
                        purchaseAgentCode: lovRecord.purchaseAgentCode,
                      });
                    }}
                  />
                )}
                {getFieldDecorator('purchaseAgentCode', {
                  initialValue: record.purchaseAgentCode,
                })}
              </Form.Item>
            );
          } else {
            return record.purchaseAgentCode;
          }
        },
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.purchaseAgentName`).d('采购员名称'),
        dataIndex: 'purchaseAgentName',
        width: 150,
        render: (text, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('purchaseAgentName', {
                  initialValue: record.purchaseAgentName,
                })(<Input disabled />)}
              </Form.Item>
            );
          } else {
            return record.purchaseAgentName;
          }
        },
      },
      {
        title: intl.get('spfm.portalAssign.model.portalAssign.logisticsContactInfo').d('联系方式'),
        dataIndex: 'contactInfo',
        // width: 100,
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.mainPurchaser`).d('主采购'),
        dataIndex: 'mainPurchaseFlag',
        width: 80,
        render: (text, record) => {
          const { getFieldDecorator } = record.$form;
          return (
            <Form.Item>
              {getFieldDecorator('mainPurchaseFlag', {
                initialValue: record.mainPurchaseFlag || 0,
              })(
                <Checkbox
                  checkedValue={1}
                  uncheckedValue={0}
                  onChange={(val) => {
                    if (val.target.checked === 1) {
                      assgnPurchaseList.forEach((item) => {
                        if (item.categoryPurchaserId !== record.categoryPurchaserId) {
                          item.$form.setFieldsValue({ mainPurchaseFlag: 0 });
                        }
                      });
                    }
                  }}
                />
              )}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get(`hzero.common.button.action`).d('操作'),
        align: 'left',
        width: 80,
        render: (text, record) => {
          return (
            <a onClick={() => this.clearLine(record)}>
              {intl.get(`hzero.common.button.clean`).d('清除')}
            </a>
          );
        },
      },
    ];
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    };
    const tableProps = {
      columns,
      rowKey: 'categoryPurchaserId',
      loading: searchLoading,
      dataSource: assgnPurchaseList,
      rowSelection,
      pagination: assgnPurchasePagination,
      onChange: (page) => {
        this.pageSize = assgnPurchasePagination.pageSize;
        dispatch({
          type: 'smdmPurchaseCategory/updateState',
          payload: {
            pagination: {
              ...assgnPurchasePagination,
              pageSize: this.pageSize,
            },
          },
        });
        this.searchAssignPurchase(page);
      },
    };
    return (
      <Modal
        title={intl.get(`smdm.purchaseCategory.view.message.assignPurchase`).d('分配采购')}
        width={800}
        destroyOnClose
        visible={purchaseAssignVisible}
        onCancel={onCancel}
        onOk={this.onSave}
        wrapClassName="ant-modal-sidebar-right"
        transitionName="move-right"
        confirmLoading={saveLoading}
      >
        {/* <React.Fragment> */}
        {/* <Header
            title={intl.get(`smdm.purchaseCategory.view.message.assignPurchase`).d('分配采购')}
          /> */}
        {/* <Content> */}
        <div className="table-list-search">{this.renderForm()}</div>
        <div style={{ backgroundColor: 'white', textAlign: 'right', paddingBottom: '16px' }}>
          <Button
            disabled={isEmpty(selectedRows)}
            onClick={() => this.deleteLine()}
            loading={deleteLoading}
          >
            {intl.get(`hzero.common.button.delete`).d('删除')}
          </Button>
          <Button style={{ marginLeft: 8 }} type="primary" onClick={this.handleCreateRow}>
            {intl.get(`hzero.common.button.add`).d('新增')}
          </Button>
        </div>
        {customizeTable(
          {
            code: 'SMDM.PURCHASE_CATEGORY_LIST.ASSIGNBUYER_LIST',
          },
          <EditTable bordered {...tableProps} />
        )}
        {/* </Content> */}
        {/* </React.Fragment> */}
      </Modal>
    );
  }
}

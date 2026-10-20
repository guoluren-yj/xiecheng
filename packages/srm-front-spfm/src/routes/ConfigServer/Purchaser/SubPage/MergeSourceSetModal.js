/*
 * MergeSourceSetModal - 申请转寻源并单规则弹框
 * @date: 2020-04-14
 * @author: LS <shuo.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Form, Button, Modal } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isArray, isEmpty, isInteger } from 'lodash';
import { connect } from 'dva';
import uuid from 'uuid/v4';

import Lov from 'components/Lov';
import Checkbox from 'components/Checkbox';
import EditTable from 'components/EditTable';
import {
  getCurrentOrganizationId,
  getEditTableData,
  addItemToPagination,
  delItemsToPagination,
} from 'utils/utils';
import notification from 'utils/notification';
import intl from 'utils/intl';

import styles from './index.less';

const FormItem = Form.Item;
@connect(({ loading, configServer }) => ({
  configServer,
  loading: loading.effects['configServer/fetchMergeSourceSet'],
  saving: loading.effects['configServer/saveMergeSourceSet'],
}))
export default class MergeSourceSetModal extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectedRows: [],
      tenantId: getCurrentOrganizationId(),
    };
  }

  componentDidMount() {
    this.handleSearch();
  }

  /**
   * 查询
   */
  @Bind()
  handleSearch(page = {}) {
    const { dispatch } = this.props;
    dispatch({
      type: 'configServer/fetchMergeSourceSet',
      payload: {
        page,
      },
    });
  }

  /**
   * 改变选中主键
   * @param {[String]} selectedRowKeys
   * @param {[String]} selectedRows
   */
  @Bind()
  handleSelectedRows(selectedRowKeys, selectedRows) {
    this.setState({ selectedRows });
  }

  /**
   * 删除并单规则
   */
  @Bind()
  handleDelete() {
    const that = this;
    const { selectedRows } = this.state;
    const selectedRowKeys = selectedRows.map(item => item.mergeRuleId);
    const {
      dispatch,
      configServer: { mergeSourceList = [], mergeSourcePagination = {} },
    } = this.props;
    if (selectedRowKeys.length > 0) {
      Modal.confirm({
        title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
        content: intl.get(`spfm.configServer.view.deliver.modal.delete.sure`).d('确定删除吗?'),
        onOk() {
          const newDataSource = [];
          mergeSourceList.forEach(item => {
            if (selectedRowKeys.indexOf(item.mergeRuleId) < 0) {
              newDataSource.push(item);
            }
          });
          const curSize = mergeSourceList.length - newDataSource.length;
          that.handleSelectedRows([], []);
          notification.success();
          const newPagination = delItemsToPagination(
            curSize,
            mergeSourceList.length,
            mergeSourcePagination
          );
          dispatch({
            type: 'configServer/updateState',
            payload: {
              mergeSourceList: newDataSource,
              mergeSourcePagination: newPagination,
            },
          });
        },
      });
    }
  }

  /**
   * 新建审批规则
   * @param {Number} shieldSupId
   */
  @Bind()
  handleCreate() {
    const {
      dispatch,
      configServer: { mergeSourceList = [], mergeSourcePagination = {} },
    } = this.props;
    dispatch({
      type: 'configServer/updateState',
      payload: {
        mergeSourceList: [
          {
            mergeRuleId: uuid(),
            _status: 'create',
            mergeCompanyFlag: 1,
            mergeCurrencyFlag: 0,
            enabledFlag: 1,
          },
          ...mergeSourceList,
        ],
        mergeSourcePagination: addItemToPagination(mergeSourceList.length, mergeSourcePagination),
      },
    });
  }

  /**
   * 保存
   */
  @Bind()
  handleSave() {
    const { tenantId } = this.state;
    const {
      dispatch,
      configServer: { mergeSourceList = [] },
    } = this.props;
    const editTable = getEditTableData(mergeSourceList, ['mergeRuleId']).map(item => ({
      tenantId,
      ...item,
    }));
    if (isArray(editTable) && !isEmpty(editTable)) {
      dispatch({
        type: 'configServer/saveMergeSourceSet',
        payload: editTable,
      }).then(res => {
        if (res) {
          notification.success();
          this.handleSearch();
        }
      });
    }
  }

  /**
   * 关闭弹窗
   */
  @Bind()
  hideModal() {
    const { handleModal } = this.props;
    if (handleModal) {
      handleModal('mergeSourceSetVisible', false);
    }
  }

  render() {
    const {
      loading,
      saving,
      mergeSourceSetVisible = false,
      configServer: { mergeSourceList = [], mergeSourcePagination = {} },
    } = this.props;
    const { tenantId, selectedRows } = this.state;
    const rowSelection = {
      selectedRowKeys: selectedRows.map(n => n.mergeRuleId),
      onChange: this.handleSelectedRows,
      getCheckboxProps: record => ({
        disabled: isInteger(record.mergeRuleId),
        defaultFlag: isInteger(record.mergeRuleId),
      }),
    };
    const columns = [
      {
        title: intl.get(`spfm.configServer.model.mergeSourceSet.companyName`).d('所属公司'),
        dataIndex: 'companyId',
        width: 200,
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`companyId`, {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl
                      .get(`spfm.configServer.model.mergeSourceSet.companyName`)
                      .d('规则公司'),
                  }),
                },
              ],
              initialValue: record.companyId,
            })(
              <Lov
                code="SPFM.USER_AUTH.COMPANY"
                queryParams={{
                  tenantId,
                }}
                textField="companyName"
                textValue={record.companyName}
                disabled={record.companyId === -1}
              />
            )}
          </FormItem>
        ),
      },
      // {
      //   title: intl.get(`spfm.configServer.model.mergeSourceSet.mergeCompanyFlag`).d('公司'),
      //   dataIndex: 'mergeCompanyFlag',
      //   align: 'left',
      //   render: (val, record) => (
      //     <FormItem>
      //       {record.$form.getFieldDecorator(`mergeCompanyFlag`, {
      //         initialValue: val === 1 ? 1 : 0,
      //       })(<Checkbox disabled />)}
      //     </FormItem>
      //   ),
      // },
      {
        title: intl.get(`spfm.configServer.model.mergeSourceSet.mergeBuFlag`).d('业务实体'),
        dataIndex: 'mergeBuFlag',
        align: 'left',
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`mergeBuFlag`, {
              initialValue: val === 1 ? 1 : 0,
            })(<Checkbox />)}
          </FormItem>
        ),
      },
      {
        title: intl
          .get(`spfm.configServer.model.mergeSourceSet.mergePurchaseOrgFlag`)
          .d('采购组织'),
        dataIndex: 'mergePurchaseOrgFlag',
        align: 'left',
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`mergePurchaseOrgFlag`, {
              initialValue: val === 1 ? 1 : 0,
            })(<Checkbox />)}
          </FormItem>
        ),
      },
      {
        title: intl.get(`spfm.configServer.model.mergeSourceSet.mergeAgentFlag`).d('采购员'),
        dataIndex: 'mergeAgentFlag',
        align: 'left',
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`mergeAgentFlag`, {
              initialValue: val === 1 ? 1 : 0,
            })(<Checkbox />)}
          </FormItem>
        ),
      },
      {
        title: intl.get(`spfm.configServer.model.mergeSourceSet.mergePrNumFlag`).d('采购申请编号'),
        dataIndex: 'mergePrNumFlag',
        align: 'left',
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`mergePrNumFlag`, {
              initialValue: val === 1 ? 1 : 0,
            })(<Checkbox />)}
          </FormItem>
        ),
      },
      {
        title: intl.get(`spfm.configServer.model.mergeSourceSet.mergeItemFlag`).d('物料编码'),
        dataIndex: 'mergeItemFlag',
        align: 'left',
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`mergeItemFlag`, {
              initialValue: val === 1 ? 1 : 0,
            })(<Checkbox />)}
          </FormItem>
        ),
      },
      {
        title: intl.get(`spfm.configServer.model.mergeSourceSet.mergeItemCtgFlag`).d('物料分类'),
        dataIndex: 'mergeItemCtgFlag',
        align: 'left',
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`mergeItemCtgFlag`, {
              initialValue: val === 1 ? 1 : 0,
            })(<Checkbox />)}
          </FormItem>
        ),
      },
      {
        title: intl.get(`spfm.configServer.model.mergeSourceSet.mergeCurrencyFlag`).d('币种'),
        dataIndex: 'mergeCurrencyFlag',
        align: 'left',
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`mergeCurrencyFlag`, {
              initialValue: val === 1 ? 1 : 0,
            })(<Checkbox />)}
          </FormItem>
        ),
      },
      {
        title: intl.get(`spfm.configServer.model.mergeSourceSet.mergeUnitFlag`).d('需求部门'),
        dataIndex: 'mergeUnitFlag',
        align: 'left',
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`mergeUnitFlag`, {
              initialValue: val === 1 ? 1 : 0,
            })(<Checkbox />)}
          </FormItem>
        ),
      },
      {
        title: intl
          .get(`spfm.configServer.model.mergeSourceSet.defaultCompanyName`)
          .d('寻源默认公司'),
        dataIndex: 'defaultCompanyId',
        width: 200,
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`defaultCompanyId`, {
              initialValue: record.defaultCompanyId,
            })(
              <Lov
                code="SPFM.USER_AUTH.COMPANY"
                queryParams={{
                  tenantId,
                }}
                textField="defaultCompanyName"
                textValue={record.defaultCompanyName}
                disabled={record.companyId !== -1}
              />
            )}
          </FormItem>
        ),
      },
      {
        title: intl.get(`spfm.configServer.model.mergeSourceSet.enabledFlag`).d('启用'),
        dataIndex: 'enabledFlag',
        align: 'left',
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`enabledFlag`, {
              initialValue: val === 1 ? 1 : 0,
            })(<Checkbox disabled={record.companyId === -1} />)}
          </FormItem>
        ),
      },
    ];
    const editTableProps = {
      loading,
      columns,
      dataSource: mergeSourceList,
      pagination: mergeSourcePagination,
      onChange: this.handleSearch,
      bordered: true,
      rowKey: 'mergeRuleId',
      rowSelection,
    };
    return (
      <Modal
        title={
          <div>
            {intl
              .get(`spfm.configServer.view.message.modal.mergeSourceSet`)
              .d('申请转寻源并单规则')}
          </div>
        }
        visible={mergeSourceSetVisible}
        onCancel={this.hideModal}
        width={1100}
        footer={null}
        wrapClassName={styles['purchase-requisition-approval-config']}
      >
        <div className="header" style={{ textAlign: 'right' }}>
          <Button
            type="default"
            onClick={this.handleDelete}
            style={{ marginRight: '8px' }}
            disabled={isArray(selectedRows) && isEmpty(selectedRows)}
          >
            {intl.get('hzero.common.button.delete').d('删除')}
          </Button>
          <Button onClick={this.handleSave} loading={saving} style={{ marginRight: '8px' }}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button type="primary" onClick={this.handleCreate}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </div>
        <EditTable {...editTableProps} />
      </Modal>
    );
  }
}

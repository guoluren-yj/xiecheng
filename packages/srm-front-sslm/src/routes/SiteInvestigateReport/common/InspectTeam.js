/**
 * InspectTeam - 考评小组
 * @date: 2020-05-08
 * @author: lvxiaomei <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import { connect } from 'dva';
import { isEmpty, isFunction, isNumber, sum } from 'lodash';
import { Bind } from 'lodash-decorators';
import React, { Component } from 'react';
import { Form, Input, Spin, Modal } from 'hzero-ui';
import DynamicButtons from '_components/DynamicButtons';

import uuidv4 from 'uuid/v4';
import intl from 'utils/intl';
import Lov from 'components/Lov';
import Checkbox from 'components/Checkbox';
import notification from 'utils/notification';
import { yesOrNoRender } from 'utils/renderer';
import { EMAIL, NOT_CHINA_PHONE, PHONE } from 'utils/regExp';
import Table from 'srm-front-boot/lib/components/EditTable';
import formatterCollections from 'utils/intl/formatterCollections';
import {
  getEditTableData,
  createPagination,
  getCurrentOrganizationId,
  addItemsToPagination,
  delItemsToPagination,
} from 'utils/utils';
import GlobalPhone from '@/routes/components/GlobalPhone';
import { formatInternationalTel } from '@/routes/components/utils';

const FormItem = Form.Item;

const tenantId = getCurrentOrganizationId();
@formatterCollections({
  code: ['sslm.siteInvestigateReport'],
})
@connect(({ siteInvestigateReport, loading }) => ({
  siteInvestigateReport,
  queryLoading: loading.effects['siteInvestigateReport/queryTeam'],
  saveLoading: loading.effects['siteInvestigateReport/saveTeam'],
  deleteLoading: loading.effects['siteInvestigateReport/deleteTeam'],
}))
export default class InspectTeam extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedRowKeys: [],
      selectedRows: [], // 选中项的key
      dataSource: [],
      pagination: {},
    };
  }

  getSnapshotBeforeUpdate(prevProps) {
    const { evalHeaderId: prevEvalHeaderId } = prevProps;
    const { evalHeaderId } = this.props;
    return evalHeaderId !== prevEvalHeaderId;
  }

  componentDidUpdate(...rest) {
    const snapshot = rest[2];
    if (snapshot) {
      this.queryTeam();
    }
  }

  componentDidMount() {
    const { onRef = e => e } = this.props;
    onRef(this);
    this.queryTeam();
  }

  /**
   * 查询物料／品类
   */
  @Bind()
  queryTeam(page = {}) {
    const {
      dispatch,
      evalHeaderId,
      customizeCode: customizeUnitCode,
      isAlreadyFeedback,
    } = this.props;
    dispatch({
      type: 'siteInvestigateReport/queryTeam',
      payload: {
        isAlreadyFeedback,
        evalHeaderId,
        customizeUnitCode,
        page,
      },
    }).then(res => {
      if (res) {
        this.setState({
          dataSource: res.content.map(n => ({ ...n, _status: 'update' })),
          pagination: createPagination(res),
        });
      }
    });
  }

  /**
   * 新建
   */
  @Bind()
  handleAdd() {
    const { evalHeaderId } = this.props;
    const { dataSource, pagination } = this.state;
    const newTeamList = [{ evalHeaderId, evalGroupId: uuidv4(), _status: 'create' }, ...dataSource];
    this.setState({
      dataSource: newTeamList,
      pagination: addItemsToPagination(1, dataSource.length, pagination),
    });
  }

  /**
   * 保存
   */
  @Bind()
  handleSave() {
    const { dispatch, onRefresh } = this.props;
    const { dataSource } = this.state;

    const tableValues = getEditTableData(dataSource, ['evalGroupId', '_status']);
    if (!isEmpty(tableValues)) {
      dispatch({
        type: 'siteInvestigateReport/saveTeam',
        payload: tableValues,
      }).then(res => {
        if (res) {
          notification.success();
          // this.queryTeam();
          onRefresh();
        }
      });
    }
  }

  /**
   * 删除
   */
  @Bind()
  handleDelete() {
    const { selectedRows, dataSource, pagination } = this.state;
    const { dispatch, onRefresh } = this.props;
    Modal.confirm({
      title: intl.get('sslm.siteInvestigateReport.view.message.deleteConfirm').d('确认删除？'),
      onOk: () => {
        if (!isEmpty(selectedRows)) {
          const createRows = selectedRows
            .filter(n => n._status === 'create')
            .map(n => n.evalGroupId);
          const updateRows = selectedRows
            .filter(n => n._status === 'update')
            .map(n => n.evalGroupId);

          if (!isEmpty(createRows)) {
            const newTeamList = dataSource.filter(
              n => createRows.indexOf(n.evalGroupId) > -1 === false
            );
            this.setState({
              dataSource: newTeamList,
              pagination: delItemsToPagination(createRows.length, dataSource.length, pagination),
            });
          }
          if (!isEmpty(updateRows)) {
            dispatch({
              type: 'siteInvestigateReport/deleteTeam',
              payload: updateRows,
            }).then(res => {
              if (res) {
                notification.success();
                // this.queryTeam();
                onRefresh();
              }
            });
          }
          this.setState({ selectedRows: [], selectedRowKeys: [] });
        }
      },
    });
  }

  /**
   * 选中项发生改变的回调
   */
  @Bind()
  handleRowSelectChange(selectedRowKeys, selectedRows) {
    this.setState({ selectedRowKeys, selectedRows });
  }

  render() {
    const { selectedRowKeys, selectedRows, dataSource, pagination } = this.state;
    const {
      remote,
      evalStatus = '',
      queryLoading,
      saveLoading,
      deleteLoading,
      isView = false,
      isPub = false,
      customizeTable,
      custLoading,
      customizeCode = '',
      customizeBtnGroup,
    } = this.props;
    const isEdit =
      (evalStatus === 'NEW' ||
        evalStatus === 'FEEDBACK' ||
        evalStatus === 'FEEDBACK_APPROVALED' ||
        evalStatus === 'NEW_APPROVALED') &&
      !isView &&
      !isPub;

    const columns = [
      {
        title: intl.get('sslm.siteInvestigateReport.modal.mange.childAccount').d('子账户'),
        dataIndex: 'userId',
        width: 150,
        render: (val, record) =>
          isEdit && ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('userId', {
                initialValue: val,
              })(
                <Lov
                  code="SSLM.TENANT.SUB.ACCOUNT"
                  queryParams={{ tenantId }}
                  textValue={record.loginName}
                  lovOptions={{ displayField: 'loginName' }}
                  onChange={(_, lovRecord) => {
                    record.$form.setFieldsValue({
                      member: lovRecord.name,
                      department: lovRecord.unitName,
                      post: lovRecord.positionName,
                      phone: lovRecord.mobile,
                      email: lovRecord.email,
                      internationalTelCode: lovRecord.internationalTelCode,
                    });
                  }}
                />
              )}
            </FormItem>
          ) : (
            record.loginName
          ),
      },
      {
        title: intl.get('sslm.siteInvestigateReport.modal.mange.members').d('组员'),
        dataIndex: 'member',
        width: 150,
        render: (val, record) =>
          isEdit && ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('member', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('sslm.siteInvestigateReport.modal.mange.members').d('组员'),
                    }),
                  },
                ],
                initialValue: val,
              })(<Input />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get('sslm.siteInvestigateReport.modal.mange.department').d('部门'),
        dataIndex: 'department',
        width: 150,
        render: (val, record) =>
          isEdit && ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('department', {
                initialValue: val,
              })(<Input />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get('sslm.siteInvestigateReport.modal.mange.station').d('岗位'),
        dataIndex: 'post',
        width: 150,
        render: (val, record) =>
          isEdit && ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('post', {
                initialValue: val,
              })(<Input />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get('sslm.siteInvestigateReport.modal.mange.contactWay').d('联系方式'),
        dataIndex: 'phone',
        width: 300,
        render: (val, record) =>
          isEdit && ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('phone', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('sslm.siteInvestigateReport.modal.mange.contactWay')
                        .d('联系方式'),
                    }),
                  },
                  {
                    pattern:
                      record.$form.getFieldValue('internationalTelCode') === '+86'
                        ? PHONE
                        : NOT_CHINA_PHONE,
                    message: intl.get('hzero.common.validation.phone').d('手机格式不正确'),
                  },
                ],
                initialValue: val,
              })(
                <GlobalPhone
                  inputChinese={false}
                  form={record.$form}
                  initialValue={record.internationalTelCode}
                  phoneField="phone"
                  telCodeField="internationalTelCode"
                />
              )}
            </FormItem>
          ) : (
            formatInternationalTel(record.internationalTelMeaning, val)
          ),
      },
      {
        title: intl.get('hzero.common.email').d('邮箱'),
        dataIndex: 'email',
        width: 150,
        render: (val, record) =>
          isEdit && ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('email', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('hzero.common.email').d('邮箱'),
                    }),
                  },
                  {
                    pattern: EMAIL,
                    message: intl.get('hzero.common.validation.email').d('邮箱格式不正确'),
                  },
                ],
                initialValue: val,
              })(<Input />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get('sslm.siteInvestigateReport.modal.mange.isLeader').d('是否组长'),
        dataIndex: 'leaderFlag',
        width: 120,
        render: (val, record) =>
          isEdit && ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('leaderFlag', {
                initialValue: val,
              })(<Checkbox />)}
            </FormItem>
          ) : (
            yesOrNoRender(val)
          ),
      },
    ];
    const remoteCol = remote
      ? remote.process('SSLM_SUPPLIER_SITE_REPORT_DETAIL_TEAM_COLUMNS', columns, { isEdit })
      : columns;

    const rowSelection = {
      selectedRowKeys,
      selectedRows,
      onChange: this.handleRowSelectChange,
    };

    const buttons = [
      {
        name: 'create',
        btnProps: {
          type: 'primary',
          onClick: () => this.handleAdd(),
        },
        child: intl.get(`hzero.common.button.create`).d('新建'),
      },
      {
        name: 'save',
        btnProps: {
          type: 'flat',
          loading: saveLoading,
          onClick: () => this.handleSave(),
          style: { marginRight: '8px' },
        },
        child: intl.get('hzero.common.button.save').d('保存'),
      },
      {
        name: 'delete',
        btnProps: {
          type: 'flat',
          loading: deleteLoading,
          disabled: isEmpty(selectedRows),
          onClick: () => this.handleDelete(),
          style: { marginRight: '8px' },
        },
        child: intl.get('hzero.common.button.delete').d('删除'),
      },
    ];

    const scrollX = sum(remoteCol.map(n => (isNumber(n.width) ? n.width : 150)));
    return (
      <Spin spinning={queryLoading}>
        {isEdit && (
          <div style={{ display: 'flex', flexDirection: 'row-reverse', marginBottom: '16px' }}>
            {customizeBtnGroup(
              {
                code: 'SSLM_SITEINVESTIGATEREPORT.INSPECT_TEAM_BTNGROUP',
                pro: true,
              },
              <DynamicButtons buttons={buttons} custLoading={custLoading} />
            )}
          </div>
        )}
        {isFunction(customizeTable) ? (
          customizeTable(
            {
              code: customizeCode,
            },
            <Table
              bordered
              custLoading={custLoading}
              rowKey="evalGroupId"
              columns={remoteCol}
              dataSource={dataSource}
              pagination={pagination}
              scroll={{ x: scrollX, y: 350 }}
              rowSelection={isEdit ? rowSelection : null}
              onChange={this.queryTeam}
            />
          )
        ) : (
          <Table
            bordered
            custLoading={custLoading}
            rowKey="evalGroupId"
            columns={remoteCol}
            dataSource={dataSource}
            pagination={pagination}
            rowSelection={isEdit ? rowSelection : null}
            onChange={this.queryTeam}
          />
        )}
      </Spin>
    );
  }
}

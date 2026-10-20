import querystring from 'querystring';
import React, { useState, useEffect, useCallback, Fragment, useRef } from 'react';
import { Button, Spin, Modal, Input, Form, Tabs, Row, Col } from 'hzero-ui';
import { Header, Content } from 'components/Page';
import { connect } from 'dva';
import { compose, isEmpty, isFunction } from 'lodash';

import remote from 'utils/remote';
import notification from 'utils/notification';
import { dateTimeRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';
import EditTable from 'srm-front-boot/lib/components/EditTable';
import ExcelExportPro from 'components/ExcelExportPro';
import { getCurrentOrganizationId } from 'utils/utils';

import { SRM_SSLM } from '_utils/config';
import intl from 'utils/intl';
import withProps from 'utils/withProps';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import { TenantFilterForm, PlatformFilterForm } from './CacheFilterForm';

const organizationId = getCurrentOrganizationId();

const { TextArea } = Input;
const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 20 },
};
const { TabPane } = Tabs;

const InfoChangeApproval = ({
  location,
  changeConfirmListRemote,
  history: { push = () => {} },
  dispatch = () => {},
  enterpriseInform: {
    applicationConfirmList = [],
    applicationConfirmPagination = {},
    paltformListDataSource = [],
    paltformListPagination = {},
    approveStatus = [],
  },
  customizeTable = () => {},
  customizeBtnGroup = () => {},
  customizeTabPane = () => {},
  form: listFrom,
  form: { getFieldDecorator },
  mixtureObj = {},
  allLoading = false,
  customizeForm,
  customizeFilterForm,
  custLoading,
}) => {
  const [selectedRows, setSelectedRows] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [adoptFlag, setAdoptFlag] = useState(true);
  const [platformSelectedRows, setPlatformSelectedRows] = useState([]);
  const [activeKey, setActiveKey] = useState(mixtureObj.activeKey);

  const customizeUnitCode = [
    'SSLM.ENTERPRISE_INFORM_CONFIRM.LIST',
    'SSLM.ENTERPRISE_INFORM_CONFIRM.TENANT_FILTER',
    'SSLM.ENTERPRISE_INFORM_CONFIRM.LIST_REJECT_MODAL',
  ];

  const platformConfirmCode = 'SSLM.ENTERPRISE_INFORM_CONFIRM.PLATFORM_CONFIRM.LIST';

  const tenantFilterRef = useRef(null);
  const platFormFilterRef = useRef(null);

  useEffect(() => {
    dispatch({
      type: 'enterpriseInform/approveStatus',
    });
  }, []);

  const handleSelectChange = (type, rowKeys, rows) => {
    switch (type) {
      case 'tenant':
        setSelectedRows(rows);
        break;
      case 'platform':
        setPlatformSelectedRows(rows);
        break;
      default:
        break;
    }
  };

  const approvalAdopt = useCallback(() => {
    const approvalOpinion = listFrom.getFieldValue('approvalOpinion');
    const selectedData = selectedRows.map(n => ({ ...n, approvalOpinion }));
    dispatch({
      type: 'enterpriseInform/confirm',
      payload: {
        data: selectedData,
        customizeUnitCode,
      },
    }).then(res => {
      if (res) {
        notification.success();
        setModalVisible(false);
        onSearch(applicationConfirmPagination, () => {
          setSelectedRows([]);
        });
      }
    });
  }, [selectedRows, applicationConfirmList, applicationConfirmPagination]);

  const approveReject = useCallback(() => {
    listFrom.validateFields({ force: true }, (err, fieldsValue) => {
      if (!err) {
        dispatch({
          type: 'enterpriseInform/approveReject',
          payload: {
            data: selectedRows.map(i => {
              const { changeConfirmId } = i;
              return {
                changeConfirmId,
                ...fieldsValue,
              };
            }),
            customizeUnitCode,
          },
        }).then(res => {
          if (res) {
            notification.success();
            setModalVisible(false);
            onSearch(applicationConfirmPagination, () => {
              setSelectedRows([]);
            });
          }
        });
      }
    });
  }, [selectedRows, applicationConfirmList, applicationConfirmPagination]);

  const handleDisplayModal = async flag => {
    if (flag) {
      const eventProps = {
        dispatch,
        listFrom,
        selectedRows,
        onSearch,
        setSelectedRows,
        customizeUnitCode,
        currentPage: applicationConfirmPagination,
      };
      const res = await changeConfirmListRemote.event.fireEvent('cuxHandleApproved', eventProps);
      if (!res) {
        return;
      }
    }
    setAdoptFlag(flag);
    setModalVisible(true);
  };

  const hideModal = () => {
    setModalVisible(false);
  };

  // 租户级确认回调
  const handlePlatformConfirm = async () => {
    const eventProps = {
      listFrom,
      dispatch,
      selectedRows: platformSelectedRows,
      currentPage: paltformListPagination,
      onQuery: queryPlatformList,
      setSelectedRows: setPlatformSelectedRows,
    };
    const eventRes = await changeConfirmListRemote.event.fireEvent('cuxHandleConfirm', eventProps);
    if (!eventRes) {
      return;
    }
    dispatch({
      type: 'enterpriseInform/tenantConfirmBefore',
      payload: { data: platformSelectedRows, customizeUnitCode: platformConfirmCode },
    }).then(result => {
      if (result) {
        const { errorFlag, docmentNumList = [] } = result;
        const title = !errorFlag
          ? intl.get('sslm.enterpriseInform.view.confirm.tenantConfirmMsg').d('是否确认？')
          : intl
              .get('sslm.enterpriseInform.view.confirm.tenantConfirmBeforeMsg', {
                docmentNumStr: (docmentNumList || []).join('、'),
              })
              .d(
                `存在历史版本的单据【${(docmentNumList || []).join(
                  '、'
                )}】仍在审批中，继续操作将会终止原单据的审批流程，请确认是否继续？`
              );
        Modal.confirm({
          title,
          onOk: () => {
            dispatch({
              type: 'enterpriseInform/tenantConfirm',
              payload: { data: platformSelectedRows, customizeUnitCode: platformConfirmCode },
            }).then(res => {
              if (res) {
                notification.success();
                queryPlatformList(paltformListPagination, () => {
                  setPlatformSelectedRows([]);
                });
              }
            });
          },
        });
      }
    });
  };
  // 查询租户级变更审批
  const onSearch = useCallback(
    (page = {}, cb) => {
      const filterRef = tenantFilterRef.current;
      const formValues = isEmpty(filterRef) ? {} : filterRef.getFieldsValue();
      const routerParams = querystring.parse(location.search.substr(1));
      const { categoryDescription, ...rest } = formValues;
      dispatch({
        type: 'enterpriseInform/queryConfirmApplication',
        payload: {
          page,
          ...routerParams,
          ...rest,
          customizeUnitCode,
        },
      });
      if (isFunction(cb)) {
        cb();
      }
    },
    [tenantFilterRef.current]
  );

  // 查询平台级变更确认
  const queryPlatformList = useCallback(
    (page, cb) => {
      const filterRef = platFormFilterRef.current;
      const formValues = isEmpty(filterRef) ? {} : filterRef.getFieldsValue();
      dispatch({
        type: 'enterpriseInform/queryPaltformList',
        payload: {
          page,
          ...formValues,
          customizeUnitCode:
            'SSLM.ENTERPRISE_INFORM_CONFIRM.TENANT_FILTER,SSLM.ENTERPRISE_INFORM_CONFIRM.PLATFORM_CONFIRM.LIST',
        },
      });
      if (isFunction(cb)) {
        cb();
      }
    },
    [platFormFilterRef.current]
  );

  const handleTabChange = useCallback(
    key => {
      setActiveKey(key);
      // eslint-disable-next-line no-param-reassign
      mixtureObj.activeKey = key;
    },
    [activeKey]
  );

  // 租户级审批查询条件
  const tenantFilterProps = {
    onSearch,
    activeKey,
    loading: allLoading,
    approveStatus,
    onRef: (form = {}) => {
      tenantFilterRef.current = form;
    },
    customizeFilterForm,
    custLoading,
  };

  // 平台级确认查询条件
  const platformFilterProps = {
    activeKey,
    approveStatus,
    onSearch: queryPlatformList,
    loading: allLoading,
    onRef: (form = {}) => {
      platFormFilterRef.current = form;
    },
    customizeFilterForm,
    custLoading,
  };

  const columns = [
    {
      title: intl.get('sslm.enterpriseInform.model.application.status').d('状态'),
      dataIndex: 'reqStatusMeaning',
    },
    {
      title: intl.get('sslm.enterpriseInform.model.application.changeReqNumber').d('申请单号'),
      dataIndex: 'changeReqNumber',
      render: (val, { changeReqId, companyId, changeConfirmId, partnerTenantId, changeLevel }) => (
        <a
          onClick={() =>
            push({
              pathname: `/sslm/enterprise-inform-confirm/detail/${changeReqId}/${changeConfirmId}/${companyId}/${partnerTenantId}`,
              search: querystring.stringify({ changeLevel }),
            })
          }
        >
          {val}
        </a>
      ),
    },
    {
      title: intl.get('sslm.enterpriseInform.model.application.latitudeChange').d('变更维度'),
      dataIndex: 'changeLevelMeaning',
      width: 140,
    },
    {
      title: intl.get('sslm.enterpriseInform.model.application.companyNum').d('企业编码'),
      dataIndex: 'companyNum',
    },
    {
      title: intl.get('sslm.enterpriseInform.model.application.companyName').d('企业名称'),
      dataIndex: 'companyName',
    },
    {
      title: intl.get('sslm.enterpriseInform.model.application.submitTime').d('提交时间'),
      dataIndex: 'submitDate',
      render: dateTimeRender,
    },
    {
      title: intl.get('sslm.enterpriseInform.model.application.lastProcessTime').d('最后处理时间'),
      dataIndex: 'lastProcessTime',
      render: dateTimeRender,
    },
  ];

  // 获取导出参数
  const getQueryParams = () => {
    const tenantRef = tenantFilterRef.current;
    const platformRef = platFormFilterRef.current;
    const allFilterForm = activeKey === 'tenantApproval' ? tenantRef : platformRef;
    const formValues = isEmpty(allFilterForm) ? {} : allFilterForm.getFieldsValue();
    const allSecectRow = activeKey === 'tenantApproval' ? selectedRows : platformSelectedRows;
    const ids = allSecectRow.map(i => i.changeConfirmId).join(',');
    const params = {
      ...formValues,
      changeConfirmIds: ids,
      customizeUnitCode:
        activeKey === 'tenantApproval'
          ? customizeUnitCode.join(',')
          : 'SSLM.ENTERPRISE_INFORM_CONFIRM.TENANT_FILTER',
    };
    return params;
  };

  const handleBtnDisabled = type => {
    if (activeKey === 'tenantApproval') {
      const noSelectRows = selectedRows.filter(
        i => !['WAIT_CONFIRMED', 'REJECTED@WFL'].includes(i.reqStatus)
      );
      const disableFlag = !selectedRows.length || !isEmpty(noSelectRows);
      const remoteDisableFlag =
        type === 'approved'
          ? changeConfirmListRemote.process(
              'SSLM_INFO_CHANGE_CONFIRM_LIST_APPROVED_BTN_DISABLED',
              disableFlag,
              { disableFlag, selectedRows }
            )
          : disableFlag;
      return remoteDisableFlag;
    } else {
      const noSelectRows = platformSelectedRows.filter(
        i =>
          !['CONFIRM_REJECTED', 'WAIT_TENANT_CONFIRMED', 'REJECTED@WFL'].includes(i.reqStatus) ||
          !i.platformConfirmNewestFlag
      );
      return !platformSelectedRows.length || !isEmpty(noSelectRows);
    }
  };

  const modalForm = (
    <Form custLoading={custLoading}>
      <Row gutter={48} className="read-row">
        <Col span={adoptFlag ? 24 : 8}>
          <FormItem
            {...formItemLayout}
            label={intl
              .get('sslm.enterpriseInform.model.application.approvalOpinion')
              .d('审批意见')}
          >
            {getFieldDecorator('approvalOpinion', {})(<TextArea rows={adoptFlag ? 2 : 16} />)}
          </FormItem>
        </Col>
      </Row>
    </Form>
  );

  return (
    <Fragment>
      <Header
        title={intl.get('sslm.enterpriseInform.view.title.changeConfirm').d('企业信息变更审批')}
      >
        {activeKey === 'tenantApproval' ? (
          customizeBtnGroup(
            {
              code: 'SSLM.ENTERPRISE_INFORM_CONFIRM.LIST.BTN_GROUP',
            },
            [
              <ExcelExportPro
                data-name="newExport"
                requestUrl={`${SRM_SSLM}/v1/${organizationId}/firm-change-confirms/export`}
                templateCode="SRM_C_SRM_SSLM_FIRM_CHANGE_CONFIRM_EXPORT_OLD"
                buttonText={intl.get('hzero.common.button.export').d('导出')}
                queryParams={() => getQueryParams()}
              />,
              <Button
                icon="close"
                data-name="reject"
                disabled={handleBtnDisabled()}
                onClick={() => handleDisplayModal(false)}
                loading={allLoading}
              >
                {intl.get('hzero.common.view.message.title.reject').d('审批拒绝')}
              </Button>,
              <Button
                disabled={handleBtnDisabled('approved')}
                icon="check"
                type="primary"
                data-name="approved"
                onClick={() => handleDisplayModal(true)}
                loading={allLoading}
              >
                {intl.get('hzero.common.view.message.title.approved').d('审批通过')}
              </Button>,
            ]
          )
        ) : (
          <>
            <Button
              icon="check"
              type="primary"
              data-name="confirm"
              loading={allLoading}
              onClick={handlePlatformConfirm}
              disabled={handleBtnDisabled()}
            >
              {intl.get('hzero.common.button.confirm').d('确认')}
            </Button>
            <ExcelExportPro
              data-name="newExport"
              requestUrl={`${SRM_SSLM}/v1/${organizationId}/firm-change-confirms/platform-tenant-confirm-list/export`}
              templateCode="SRM_C_SRM_SSLM_FIRM_CHANGE_CONFIRM_PLATFORM_EXPORT_OLD"
              buttonText={intl.get('hzero.common.button.export').d('导出')}
              queryParams={() => getQueryParams()}
            />
          </>
        )}
      </Header>
      <Content>
        <Spin spinning={allLoading || false}>
          {customizeTabPane(
            {
              code: 'SSLM.ENTERPRISE_INFORM_CONFIRM.LIST_TAB',
            },
            <Tabs animated={false} activeKey={activeKey} onChange={handleTabChange}>
              <TabPane
                key="tenantApproval"
                tab={intl
                  .get('sslm.enterpriseInform.view.title.tenantApproval')
                  .d('租户级变更审批')}
              >
                <div className="table-list-search">
                  <TenantFilterForm {...tenantFilterProps} />
                </div>
                {customizeTable(
                  {
                    code: 'SSLM.ENTERPRISE_INFORM_CONFIRM.LIST',
                  },
                  <EditTable
                    bordered
                    rowKey="changeConfirmId"
                    columns={columns}
                    rowSelection={{
                      selectedRows,
                      selectedRowKeys: selectedRows.map(n => n.changeConfirmId),
                      onChange: (rowKeys, rows) => handleSelectChange('tenant', rowKeys, rows),
                    }}
                    dataSource={applicationConfirmList}
                    onChange={onSearch}
                    pagination={applicationConfirmPagination}
                  />
                )}
              </TabPane>
              <TabPane
                key="platformConfirm"
                tab={intl
                  .get('sslm.enterpriseInform.view.title.platformConfirm')
                  .d('平台级变更确认')}
              >
                <div className="table-list-search">
                  <PlatformFilterForm {...platformFilterProps} />
                </div>
                {customizeTable(
                  {
                    code: platformConfirmCode,
                  },
                  <EditTable
                    bordered
                    rowKey="changeConfirmId"
                    columns={columns}
                    rowSelection={{
                      selectedRows: platformSelectedRows,
                      selectedRowKeys: platformSelectedRows.map(n => n.changeConfirmId),
                      onChange: (rowKeys, rows) => handleSelectChange('platform', rowKeys, rows),
                    }}
                    dataSource={paltformListDataSource}
                    onChange={queryPlatformList}
                    pagination={paltformListPagination}
                  />
                )}
              </TabPane>
            </Tabs>
          )}
        </Spin>
      </Content>
      <Modal
        width={450}
        destroyOnClose
        title={
          adoptFlag
            ? intl.get('sslm.enterpriseInform.view.confirmMsg.confirm').d('确认通过？')
            : intl.get('sslm.enterpriseInform.view.confirmMsg.reject').d('确认拒绝？')
        }
        visible={modalVisible}
        onCancel={hideModal}
        onOk={adoptFlag ? approvalAdopt : approveReject}
        confirmLoading={allLoading}
        maskClosable={false}
      >
        {adoptFlag
          ? modalForm
          : customizeForm(
              {
                code: 'SSLM.ENTERPRISE_INFORM_CONFIRM.LIST_REJECT_MODAL',
                form: listFrom,
              },
              modalForm
            )}
      </Modal>
    </Fragment>
  );
};

export default compose(
  connect(({ enterpriseInform, loading }) => ({
    enterpriseInform,
    allLoading:
      loading.effects['enterpriseInform/queryConfirmApplication'] ||
      loading.effects['enterpriseInform/queryPaltformList'] ||
      loading.effects['enterpriseInform/confirm'] ||
      loading.effects['enterpriseInform/approveReject'] ||
      loading.effects['enterpriseInform/tenantConfirm'],
  })),
  formatterCollections({ code: ['sslm.common', 'sslm.enterpriseInform', 'sslm.supplierInform'] }),
  Form.create({ fieldNameProp: null }),
  withCustomize({
    unitCode: [
      'SSLM.ENTERPRISE_INFORM_CONFIRM.LIST',
      'SSLM.ENTERPRISE_INFORM_CONFIRM.LIST.BTN_GROUP',
      'SSLM.ENTERPRISE_INFORM_CONFIRM.LIST_TAB',
      'SSLM.ENTERPRISE_INFORM_CONFIRM.TENANT_FILTER',
      'SSLM.ENTERPRISE_INFORM_CONFIRM.LIST_REJECT_MODAL',
      'SSLM.ENTERPRISE_INFORM_CONFIRM.PLATFORM_CONFIRM.LIST',
    ],
  }),
  withProps(
    () => {
      const mixtureObj = {
        activeKey: 'tenantApproval',
      };
      return { mixtureObj };
    },
    { cacheState: true }
  ),
  remote(
    {
      code: 'SSLM_INFO_CHANGE_CONFIRM_LIST',
      name: 'changeConfirmListRemote',
    },
    {
      events: {
        cuxHandleApproved() {}, // 二开租户审批通过逻辑
        cuxHandleConfirm() {}, // 二开平台确认逻辑
      },
    }
  )
)(InfoChangeApproval);

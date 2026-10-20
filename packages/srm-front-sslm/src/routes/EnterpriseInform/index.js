/**
 * ChangeApplication - 企业信息变更申请
 * @date: 2019-10-29
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import { connect } from 'dva';
import querystring from 'querystring';
import { Bind } from 'lodash-decorators';
import { isEmpty, isUndefined } from 'lodash';
import React, { Component, Fragment } from 'react';
import { Button, Spin, Modal } from 'hzero-ui';
import { DataSet, Modal as ChoerodonModal } from 'choerodon-ui/pro';

// import uuidv4 from 'uuid/v4';
import intl from 'utils/intl';
import { dateRender } from 'utils/renderer';
import notification from 'utils/notification';
import EditTable from 'components/EditTable';
import { Header, Content } from 'components/Page';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import formatterCollections from 'utils/intl/formatterCollections';
import { filterNullValueObject, getCurrentOrganizationId, getResponse } from 'utils/utils';

import '@/routes/index.less';
import { saveApplication } from '@/services/enterpriseInformService';
import FilterForm from './FilterForm';
import OperationRecords from './OperationRecords';
import CreateForm from './CreateForm';
import { indexDS } from './stores/indexDS';

const customizeUnitCode = [
  'SSLM.ENTERPRISE_INFORM_CHANGE_DETAIL.HEADER',
  'SSLM.ENTERPRISE_INFORM_CHANGE_DETAIL.BANK_INFO',
  'SSLM.ENTERPRISE_INFORM_CHANGE_DETAIL.OTHER_INFO',
];

@connect(({ enterpriseInform, loading }) => ({
  enterpriseInform,
  queryApplicationLoading: loading.effects['enterpriseInform/queryApplication'],
  saveApplicationLoading: loading.effects['enterpriseInform/saveApplication'],
  deleteApplicationLoading: loading.effects['enterpriseInform/deleteApplication'],
  queryRecordLoading: loading.effects['enterpriseInform/queryApplicationRecord'],
  tenantId: getCurrentOrganizationId(),
}))
@formatterCollections({ code: ['sslm.enterpriseInform'] })
export default class ChangeApplication extends Component {
  constructor(props) {
    super(props);
    const isPub = props.location.pathname.match('/pub/');
    this.state = {
      isPub,
      selectedRowKeys: [], // 选中的rowKeys
      visible: false, // 操作记录模态框的显示/隐藏
      changeReqId: null, // 当前申请单id
      // enterpriseVisible: false, // 新增模态框的显示/隐藏
    };
  }

  form;

  createModalDS = new DataSet({
    ...indexDS(),
  });

  componentDidMount() {
    const {
      enterpriseInform: { applicationPagination },
    } = this.props;
    this.queryCode();
    this.handleApplication(applicationPagination);
  }

  /**
   * 绑定form
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  /**
   * 值集查询
   */
  @Bind()
  queryCode() {
    const { dispatch, tenantId } = this.props;
    const lovCodes = {
      applicationStatus: 'SSLM.ENTERPRISE_CHANGE_REQ_STATUS',
      latitudeList: 'SSLM.SUPPLIER_CHANGE_LEVEL',
      changeContentList: 'SSLM.ENTERPRISE_CHANGE_CONTENT',
      tenantId,
    };

    dispatch({
      type: 'enterpriseInform/init',
      payload: lovCodes,
    });
  }

  /**
   * 选中项发生变化时的回调
   */
  @Bind()
  handleSelectChange(selectedRowKeys) {
    this.setState({ selectedRowKeys });
  }

  /**
   * 操作记录模态框的显示/隐藏
   */
  @Bind
  handleVisible(record) {
    const { visible } = this.state;

    this.setState({
      visible: !visible,
      changeReqId: record.changeReqId,
    });
  }

  /**
   * 新建
   */
  @Bind()
  handleAddApplication() {
    ChoerodonModal.open({
      key: ChoerodonModal.key(),
      closable: false,
      movable: false,
      destroyOnClose: true,
      drawer: true,
      style: { width: 380 },
      title: intl.get('sslm.enterpriseInform.model.application.chooseEnterprise').d('选择企业'),
      children: <CreateForm dataSet={this.createModalDS} />,
      onOk: async () => {
        let modalCloseFlag = false;
        const validateFlag = await this.createModalDS.current.validate();
        if (validateFlag) {
          const data = this.createModalDS.current.toJSONData();
          const { changeLevel } = data;
          let formData = {
            ...data,
            customizeUnitCode: 'SSLM.ENTERPRISE_INFORM_CHANGE.CREATE_FORM',
          };
          if (changeLevel !== 'COMPANY') {
            formData = {
              ...data,
              customizeUnitCode: 'SSLM.ENTERPRISE_INFORM_CHANGE.CREATE_FORM',
              partnerCompanyId: undefined,
            };
          }
          const result = await saveApplication(formData);
          if (getResponse(result)) {
            modalCloseFlag = true;
            notification.success();
            this.handleDetails(result);
          }
        }
        return modalCloseFlag;
      },
    });
  }

  /**
   * 查询操作记录
   */
  @Bind()
  handleRecords(page) {
    const { dispatch } = this.props;
    const { changeReqId } = this.state;
    dispatch({
      type: 'enterpriseInform/queryApplicationRecord',
      payload: {
        page,
        changeReqId,
      },
    });
  }

  /**
   * 查询申请单
   */
  @Bind()
  handleApplication(page) {
    const { dispatch } = this.props;
    const formValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    const filterValues = {
      ...formValues,
      startDate: formValues.startDate && formValues.startDate.format(DATETIME_MIN),
      endDate: formValues.endDate && formValues.endDate.format(DATETIME_MAX),
    };
    dispatch({
      type: 'enterpriseInform/queryApplication',
      payload: {
        page,
        ...filterValues,
        customizeUnitCode: 'SSLM.ENTERPRISE_INFORM_CHANGE.SEARCH_FORM',
      },
    });
  }

  /**
   * 删除行
   */
  @Bind()
  handleDeleteApplication() {
    const {
      dispatch,
      enterpriseInform: { applicationPagination },
    } = this.props;
    const { selectedRowKeys } = this.state;

    if (!isEmpty(selectedRowKeys)) {
      Modal.confirm({
        title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据?'),
        onOk: () => {
          dispatch({
            type: 'enterpriseInform/deleteApplication',
            payload: {
              changeReqIdList: selectedRowKeys,
              customizeUnitCode,
            },
          }).then(res => {
            if (res) {
              notification.success();
              this.setState({ selectedRowKeys: [] });
              this.handleApplication(applicationPagination);
            }
          });
        },
      });
    }
  }

  /**
   * 跳转至明细界面
   */
  @Bind()
  handleDetails(record) {
    const { history } = this.props;
    const { isPub } = this.state;
    const { changeReqId, companyId, partnerTenantId, domesticForeignRelation } = record;
    history.push({
      pathname: `${isPub ? '/pub' : ''}/sslm/enterprise-inform-change/detail/${changeReqId}`,
      search: querystring.stringify({
        companyId,
        partnerTenantId,
        domesticForeignRelation,
        tenantId: partnerTenantId,
      }),
    });
  }

  render() {
    const {
      queryApplicationLoading,
      // saveApplicationLoading,
      deleteApplicationLoading,
      queryRecordLoading,
      enterpriseInform: {
        applicationList,
        applicationPagination,
        recordsList,
        recordsPagination,
        code,
      },
      tenantId,
    } = this.props;
    const { visible, selectedRowKeys } = this.state;

    const columns = [
      {
        title: intl.get('sslm.enterpriseInform.model.application.applicationState').d('申请状态'),
        dataIndex: 'reqStatusMeaning',
        width: 110,
      },
      {
        title: intl.get('sslm.enterpriseInform.model.application.applicationNum').d('申请单号'),
        dataIndex: 'changeReqNumber',
        width: 140,
        render: (val, record) => <a onClick={() => this.handleDetails(record)}>{val}</a>,
      },
      {
        title: intl.get('sslm.enterpriseInform.model.application.latitudeChange').d('变更维度'),
        dataIndex: 'changeLevelMeaning',
        width: 140,
      },
      {
        title: intl.get('sslm.enterpriseInform.model.application.enterpriseNum').d('企业编码'),
        dataIndex: 'companyNum',
        width: 150,
      },
      {
        title: intl.get('sslm.enterpriseInform.model.application.enterpriseName').d('企业名称'),
        dataIndex: 'companyName',
      },
      {
        title: intl.get('sslm.enterpriseInform.model.application.company').d('对应变更采购方'),
        dataIndex: 'partnerCompanyName',
        width: 150,
      },
      {
        title: intl.get('sslm.enterpriseInform.model.application.creator').d('创建人'),
        dataIndex: 'createUserName',
        width: 120,
      },
      {
        title: intl.get('sslm.enterpriseInform.model.application.creationDate').d('创建日期'),
        dataIndex: 'creationDate',
        width: 120,
        render: dateRender,
      },
      {
        title: intl.get('sslm.enterpriseInform.model.application.operationRecords').d('操作记录'),
        width: 150,
        render: (_, record) => (
          <a onClick={() => this.handleVisible(record)}>
            {intl.get('sslm.enterpriseInform.model.application.operationRecords').d('操作记录')}
          </a>
        ),
      },
    ];

    const rowSelection = {
      selectedRowKeys,
      onChange: this.handleSelectChange,
    };
    const filterFormProps = {
      code,
      tenantId,
      onRef: this.handleBindRef,
      onSearch: this.handleApplication,
    };
    const operationRecordsProps = {
      loading: queryRecordLoading,
      onChange: this.handleRecords,
      dataSource: recordsList,
      pagination: recordsPagination,
    };

    const allLoading = queryApplicationLoading || deleteApplicationLoading || queryRecordLoading;

    return (
      <Fragment>
        <Header
          title={intl.get('sslm.enterpriseInform.view.title.changeApplication').d('企业信息变更')}
        >
          <Button
            icon="plus"
            type="primary"
            onClick={this.handleAddApplication}
            loading={allLoading}
          >
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
          <Button
            icon="delete"
            disabled={isEmpty(selectedRowKeys)}
            loading={allLoading}
            onClick={this.handleDeleteApplication}
          >
            {intl.get('hzero.common.button.delete').d('删除')}
          </Button>
        </Header>
        <Content>
          <Spin spinning={queryApplicationLoading}>
            <div className="table-list-search">
              <FilterForm {...filterFormProps} />
            </div>
            <EditTable
              bordered
              rowKey="changeReqId"
              columns={columns}
              rowSelection={rowSelection}
              dataSource={applicationList}
              onChange={this.handleApplication}
              pagination={applicationPagination}
            />
          </Spin>
        </Content>
        <Modal
          width={620}
          footer={null}
          destroyOnClose
          visible={visible}
          onCancel={this.handleVisible}
          title={intl.get('sslm.enterpriseInform.model.application.operationRecords').d('操作记录')}
        >
          <OperationRecords {...operationRecordsProps} />
        </Modal>
      </Fragment>
    );
  }
}

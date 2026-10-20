import React, { useState, useEffect, useCallback, Fragment } from 'react';
import { Button, Spin, Modal } from 'hzero-ui';
import { Header, Content } from 'components/Page';
import { connect } from 'dva';
import { compose, isEmpty } from 'lodash';
import EditTable from 'components/EditTable';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { filterNullValueObject } from 'utils/utils';
import { dateTimeRender } from 'utils/renderer';

import FilterForm from './FilterForm';

const InfoChangeApproval = ({
  history: { push = () => {} },
  dispatch = () => {},
  enterpriseInform: { platformApplicationList = [], platformApplicationPagination = {} },
  queryApplicationLoading = false,
  approveLoading = false,
}) => {
  const [selectedRowKeys, onChange] = useState([]);

  const [filterForm, setFilterForm] = useState({});

  useEffect(() => {
    onSearch();
  }, []);

  const approvalAdopt = useCallback(() => {
    Modal.confirm({
      title: intl.get('sslm.enterpriseInform.view.confirmMsg.approval').d('确认通过？'),
      onOk: () => {
        dispatch({
          type: 'enterpriseInform/approve',
          payload: selectedRowKeys.map(i => ({
            changeReqId: i,
            companyId: (platformApplicationList.find(o => o.changeReqId === i) || {}).companyId,
          })),
        }).then(res => {
          onSearch();
          if (res) {
            notification.success();
          }
        });
      },
    });
  }, [selectedRowKeys, platformApplicationList]);

  const onSearch = useCallback(
    (page = {}) => {
      const formValues = isEmpty(filterForm)
        ? {}
        : filterNullValueObject(filterForm.getFieldsValue());
      dispatch({
        type: 'enterpriseInform/queryPlatformApplication',
        payload: {
          page,
          ...formValues,
        },
      });
      onChange([]);
    },
    [filterForm]
  );

  const onRef = useCallback((form = {}) => {
    setFilterForm(form);
  }, []);

  const filterFormProps = {
    onSearch,
    queryApplicationLoading,
    onRef,
  };

  const columns = [
    {
      title: intl.get('sslm.enterpriseInform.model.application.changeReqNumber').d('申请单号'),
      dataIndex: 'changeReqNumber',
      render: (val, { changeReqId, companyId, partnerTenantId }) => (
        <a
          onClick={() =>
            push(
              `/sslm/enterprise-inform-approval/detail/${changeReqId}/${companyId}/${partnerTenantId}`
            )
          }
        >
          {val}
        </a>
      ),
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
      title: intl
        .get('sslm.enterpriseInform.model.application.enterpriseTenantCode')
        .d('企业所属租户编码'),
      dataIndex: 'tenantNum',
    },
  ];

  return (
    <Fragment>
      <Header
        title={intl
          .get('sslm.enterpriseInform.view.title.changeApplicationApproval')
          .d('企业信息变更审批')}
      >
        <Button
          disabled={!selectedRowKeys.length}
          icon="check"
          type="primary"
          onClick={approvalAdopt}
          loading={approveLoading}
        >
          {intl.get('hzero.common.button.approvalAdopt').d('审批通过')}
        </Button>
      </Header>
      <Content>
        <Spin spinning={queryApplicationLoading || approveLoading}>
          <div className="table-list-search">
            <FilterForm {...filterFormProps} />
          </div>
          <EditTable
            bordered
            rowKey="changeReqId"
            columns={columns}
            rowSelection={{
              selectedRowKeys,
              onChange,
            }}
            dataSource={platformApplicationList}
            onChange={onSearch}
            pagination={platformApplicationPagination}
          />
        </Spin>
      </Content>
    </Fragment>
  );
};

export default compose(
  connect(({ enterpriseInform, loading }) => ({
    enterpriseInform,
    queryApplicationLoading: loading.effects['enterpriseInform/queryPlatformApplication'],
    approveLoading: loading.effects['enterpriseInform/approve'],
  })),
  formatterCollections({ code: ['sslm.enterpriseInform'] })
)(InfoChangeApproval);

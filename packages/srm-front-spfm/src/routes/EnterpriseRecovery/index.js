/**
 * index.js
 * 适配器列表
 * @date: 2020-12-30
 * @author: guozhiqiang <zhiqiang.guo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import { isEmpty } from 'lodash';
import React, { Fragment, useState } from 'react';
import { observer } from 'mobx-react-lite';
import {
  Form,
  Table,
  DataSet,
  Modal,
  Button,
  Tooltip,
  TextArea,
} from 'choerodon-ui/pro';
import { Popover } from 'choerodon-ui';
import { Header, Content } from 'components/Page';
import withProps from 'utils/withProps';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import FilterBarTable from 'srm-front-boot/lib/components/FilterBarTable';
import { batchApprove, batchReject } from '@/services/enterpriseRecoveryService.js';
import {
  getListDs,
  getModalDs,
  getRejectFormDS,
  getCompanyTableDs,
  getOprationTableDs,
} from './store/adaptorTaskDs';

import styles from './index.less';

const companyModal = Modal.key();

function AdaptorTask(props = {}) {
  const [loading, setLoading] = useState(false);
  const [spin, setSpin] = useState({});
  const { adaptorTaskDs, ModalDs, companyTableDs, oprationTableDs } = props.valueDs;

  const routerDetail = (id, companyId) => {
    const { queryParameter = {} } = companyTableDs;
    const { retrieveId } = queryParameter;
    props.history.push(
      `/spfm/enterprise-recovery/detail?headerId=${id}&retrieveId=${retrieveId}&companyId=${companyId}`
    );
  };

  const columnsModal = [
    {
      name: 'adminMess',
      width: 110,
      renderer: ({ value }) =>
        value ? (
          <Tooltip title={value} theme="light" overlayClassName={styles.tooltip}>
            {value}
          </Tooltip>
        ) : null,
    },
    {
      name: 'confirmRemark',
      width: 120,
      renderer: ({ value }) =>
        value ? (
          <Tooltip title={value} theme="light" overlayClassName={styles.tooltip}>
            {value}
          </Tooltip>
        ) : null,
    },
  ];

  const handleViewDetail = (record) => {
    const { data = {} } = record;
    const { retrieveId } = data;
    ModalDs.setQueryParameter('retrieveId', retrieveId);
    ModalDs.query();
  };

  const columnsCompany = [
    {
      name: 'companyNum',
      width: 250,
      renderer: ({ record = {} } = {}) => {
        const { data = {} } = record;
        const { companyNum, companyId, basicCompanyId } = data;
        return (
          <a
            onClick={(e) => {
              e.preventDefault();
              Modal.destroyAll();
              setTimeout(() => routerDetail(companyId, basicCompanyId));
            }}
          >
            {companyNum || companyId}
          </a>
        );
      },
    },
    {
      name: 'companyName',
      width: 200,
    },
    {
      name: 'unifiedSocialCode',
      width: 250,
    },
    {
      name: 'dunsCode',
      width: 250,
    },
    {
      name: 'businessRegistrationNumber',
      width: 250,
    },
    {
      name: 'organizingInstitutionCode',
      width: 200,
    },
    {
      name: 'loginName',
      width: 250,
    },
  ];

  const handleModalOpen = () => {
    // routerDetail(retrieveId);
    Modal.open({
      key: companyModal,
      title: intl
        .get('spfm.enterpriseRecovery.model.enterpriseRecovery.existCompany')
        .d('匹配系统已有企业'),
      children: <Table dataSet={companyTableDs} columns={columnsCompany} />,
      style: { width: 1024 },
      footer: false,
      closable: true,
      maskClosable: true,
    });
  };

  const columnsOpration = [
    {
      name: 'operateUserName',
      width: 120,
    },
    {
      name: 'actionTypeMeaning',
      width: 120,
    },
    {
      name: 'actionContent',
      width: 250,
    },
    {
      name: 'creationDate',
      width: 160,
    },
  ];

  const handleOpration = (retrieveId) => {
    // routerDetail(retrieveId);
    Modal.open({
      key: Modal.key(),
      title: intl.get(`hzero.common.button.operating`).d('操作记录'),
      children: <Table dataSet={oprationTableDs} columns={columnsOpration} />,
      style: { width: 750 },
      footer: null,
      closable: true,
      maskClosable: true,
    });
    oprationTableDs.setQueryParameter('retrieveId', retrieveId);
    oprationTableDs.query();
  };

  // 查询已关联的企业
  const handleQueryExistCompany = (retrieveId) => {
    setSpin({
      spinning: true,
    });
    companyTableDs.setQueryParameter('retrieveId', retrieveId);
    companyTableDs
      .query()
      .then((res) => {
        if (res) {
          // 匹配到一条直接进入详情页
          if (res.content && res.content.length === 1) {
            const { companyId, basicCompanyId } = res.content[0];
            routerDetail(companyId, basicCompanyId);
          } else {
            handleModalOpen();
          }
        }
      })
      .finally(() => setSpin({}));
  };

  const columns = [
    {
      name: 'processStatusMeaning',
      width: 100,
    },
    {
      name: 'retrieveNum',
      width: 120,
      renderer: ({ record = {} } = {}) => {
        const { data = {} } = record;
        const { retrieveNum, retrieveId } = data;
        return <a onClick={() => handleQueryExistCompany(retrieveId)}>{retrieveNum}</a>;
      },
    },
    {
      name: 'documentSourceMeaning',
      width: 120,
    },
    {
      name: 'webUrlTenantName',
      width: 200,
    },
    {
      name: 'companyName',
      width: 200,
    },
    {
      name: 'unifiedSocialCode',
      width: 180,
    },
    {
      name: 'organizingInstitutionCode',
      width: 120,
    },
    {
      name: 'dunsCode',
      width: 120,
    },
    {
      name: 'businessRegistrationNumber',
      width: 160,
    },
    {
      name: 'applicantName',
      width: 200,
    },
    {
      name: 'phone',
      width: 120,
    },
    {
      name: 'email',
      width: 200,
    },
    {
      name: 'creationDate',
      width: 140,
    },
    {
      name: 'adminSuggest',
      width: 100,
      renderer: ({ record }) => (
        <div>
          <Popover
            overlayClassName={styles.popover}
            content={<Table dataSet={ModalDs} columns={columnsModal} />}
            placement="bottomRight"
            trigger="click"
            title={intl
              .get('spfm.enterpriseRecovery.model.enterpriseRecovery.adminSuggest')
              .d('管理员意见')}
          >
            <a onClick={() => handleViewDetail(record)}>
              {intl.get('hzero.common.button.viewDetail').d('查看详情')}
            </a>
          </Popover>
        </div>
      ),
    },
    {
      name: 'opration',
      width: 100,
      renderer: ({ record = {} } = {}) => {
        const { data = {} } = record;
        const { retrieveId } = data;
        return (
          <a onClick={() => handleOpration(retrieveId)}>
            {intl.get(`hzero.common.button.operating`).d('操作记录')}
          </a>
        );
      },
    },
  ];

  // 审批通过
  const handleApproved = () => {
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: intl.get('spfm.enterpriseRecovery.view.message.approvedMsg').d('确认审批通过吗？'),
      onOk: () => {
        return new Promise(async (resolve) => {
          const selectedRows = adaptorTaskDs.toJSONData();
          setLoading(true);
          batchApprove({
            companyRetrieves: selectedRows,
          })
            .then((response) => {
              const res = getResponse(response);
              if (res) {
                resolve();
                notification.success();
                adaptorTaskDs.query(adaptorTaskDs.currentPage, null, false);
              }
            })
            .finally(() => {
              resolve(false);
              setLoading(false);
            });
        });
      },
    });
  };

  // 审批拒绝
  const handleReject = () => {
    const rejectFormDs = new DataSet(getRejectFormDS());
    Modal.confirm({
      title: intl.get('spfm.enterpriseRecovery.view.message.rejectMsg').d('拒绝原因'),
      children: (
        <Form dataSet={rejectFormDs} labelLayout="float" columns={1}>
          <TextArea name="processRemark" />
        </Form>
      ),
      onOk: () => {
        return new Promise(async (resolve) => {
          const validateFlag = await rejectFormDs.validate();
          if (validateFlag) {
            setLoading(true);
            const data = rejectFormDs.current.toJSONData();
            const selectedRows = adaptorTaskDs.toJSONData();
            batchReject({
              ...data,
              companyRetrieves: selectedRows,
            })
              .then((response) => {
                const res = getResponse(response);
                if (res) {
                  resolve();
                  notification.success();
                  adaptorTaskDs.query(adaptorTaskDs.currentPage, null, false);
                }
              })
              .finally(() => {
                resolve(false);
                setLoading(false);
              });
          } else {
            resolve(false);
          }
        });
      },
    });
  };

  const HeaderBtns = observer(({ dataSet }) => {
    const disabled = isEmpty(dataSet.selected);
    return (
      <Fragment>
        <Button
          color="primary"
          icon="check_circle"
          loading={loading}
          disabled={disabled}
          onClick={handleApproved}
        >
          {intl.get('hzero.common.view.message.title.approved').d('审批通过')}
        </Button>
        <Button
          icon="cancel"
          funcType="flat"
          loading={loading}
          disabled={disabled}
          onClick={handleReject}
        >
          {intl.get('hzero.common.view.message.title.reject').d('审批拒绝')}
        </Button>
      </Fragment>
    );
  });

  return (
    <React.Fragment>
      <Header title={intl.get('spfm.enterpriseRecovery.view.header.title').d('企业找回')}>
        <HeaderBtns dataSet={adaptorTaskDs} />
      </Header>
      <Content>
        <FilterBarTable
          cacheState
          spin={spin}
          columns={columns}
          dataSet={adaptorTaskDs}
          style={{maxHeight: 'calc(100vh - 200px)'}}
        />
      </Content>
    </React.Fragment>
  );
}

export default formatterCollections({
  code: [
    'spfm.enterpriseRecovery',
    'hzero.common',
    'spfm.configServer',
    'entity.tenant',
    'entity.supplier',
  ],
})(
  withProps(
    () => {
      const adaptorTaskDs = new DataSet(getListDs());
      const ModalDs = new DataSet(getModalDs());
      const companyTableDs = new DataSet(getCompanyTableDs());
      const oprationTableDs = new DataSet(getOprationTableDs());
      const valueDs = {
        adaptorTaskDs,
        ModalDs,
        companyTableDs,
        oprationTableDs,
      };
      return { valueDs };
    },
    { cacheState: true, keepOriginDataSet: true }
  )(AdaptorTask)
);

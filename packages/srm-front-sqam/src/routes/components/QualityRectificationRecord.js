import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Modal, Tabs, Table, Tooltip } from 'hzero-ui';
import { isArray, isEmpty } from 'lodash';

import intl from 'utils/intl';
import moment from 'moment';
import UploadModal from 'components/Upload';
import { dateTimeRender } from 'utils/renderer';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { queryMapIdpValue } from 'services/api';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import ExcelExportPro from 'components/ExcelExportPro';

import { fetchOperatorData, fetchApprovalData, queryLovData } from '@/services/create8DService';
import { approveNameRender } from '@/utils/utils';

import Search from './QualityRectificationRecordSearch';

const { TabPane } = Tabs;
const tenantId = getCurrentOrganizationId();
const prefix = `sqam.common.model.qualityRectification`;

const QualityRectificationRecord = (props) => {
  const searchFrom = useRef();
  const {
    visible = false,
    isApprovalShow = true,
    hideModal, 
    problemHeaderId,
    businessKey,
    isExport,
    remoteProps,
  } = props;

  const [operatorData, setOperatorData] = useState([]);
  const [approvalData, setApprovalData] = useState([]);
  // const [operatorPage, setOperatorPage] = useState([]);
  // const [approvalPage, setApprovalPage] = useState([]);
  const [operatorLoading, setOperatorLoading] = useState(true);
  const [approvalLoading, setApprovalLoading] = useState(true);
  const [definitions, setDefinitions] = useState([]);
  const [actionList, setActionList] = useState([]);
  const [activeKey, setActiveKey] = useState('approval');

  const operatorColumns = useMemo(
    () => [
      {
        title: intl.get(`entity.roles.operator`).d('操作人'),
        dataIndex: 'createdName',
        width: 100,
      },
      {
        title: intl.get(`${prefix}.operationTime`).d('操作时间'),
        dataIndex: 'operatedDate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`${prefix}.action`).d('动作'),
        dataIndex: 'operationActionCodeMeaning',
        width: 100,
      },
      {
        title: intl.get(`${prefix}.operatedRemark`).d('操作备注'),
        dataIndex: 'operatedRemark',
        width: 150,
        render: (val) => (
          <Tooltip placement="topLeft" title={val}>
            {val}
          </Tooltip>
        ),
      },
    ],
    []
  );

  const approvalColumns = useMemo(() => [
    {
      title: intl.get(`${prefix}.approvalSequence`).d('审批流'),
      dataIndex: 'processDefinitionId',
      width: 150,
      render: (val) => {
        const findItem = definitions.find((item) => item.value === val.split(':')[0]);
        return findItem ? findItem.meaning : val.split(':')[0];
      },
    },
    {
      title: intl.get(`${prefix}.approvalStep`).d('审批环节'),
      dataIndex: 'name',
      width: 150,
      render: (val, record) => {
        return ['startEvent', 'endEvent'].includes(record.actType)
          ? approveNameRender(record.actType)
          : val;
      },
    },
    {
      title: intl.get(`${prefix}.approvalName`).d('审批人'),
      dataIndex: 'assigneeName',
      width: 150,
    },
    {
      title: intl.get(`${prefix}.approvalAction`).d('审批操作'),
      dataIndex: 'action',
      width: 150,
      render: approveNameRender,
    },
    {
      title: intl.get(`${prefix}.approvalTime`).d('时间'),
      dataIndex: 'endTime',
      width: 150,
      render: dateTimeRender,
      sorter: true,
    },
    {
      title: intl.get(`${prefix}.approvalRemark`).d('审批说明'),
      dataIndex: 'comment',
      width: 150,
      render: (val) => <Tooltip title={val}>{val}</Tooltip>,
    },
    {
      title: intl.get(`${prefix}.attachment`).d('附件'),
      dataIndex: 'attachmentUuid',
      width: 150,
      fixed: 'right',
      render: (val, record) => {
        if (record.attachmentUuid) {
          return (
            <UploadModal
              attachmentUUID={val}
              bucketName={window.$$env.PRIVATE_BUCKET || 'private-bucket'}
              viewOnly
            />
          );
        }
      },
    },
  ]);

  useEffect(() => {
    handleInit();
  }, []);

  const getSearchParams = useCallback(() => {
    const { getFieldsValue } = searchFrom.current?.props?.form || {};
    const params = getFieldsValue ? getFieldsValue() : {};
    const { createdDateStart, createdDateEnd, ...other } = params;
    return {
      createdDateStart: createdDateStart ? moment(createdDateStart).format(DATETIME_MIN) : '',
      createdDateEnd: createdDateEnd ? moment(createdDateEnd).format(DATETIME_MAX) : '',
      ...other,
    };
  }, []);

  const handleSearch = useCallback(async () => {
    setOperatorLoading(true);
    const resOperatorData = getResponse(
      await fetchOperatorData({
        problemHeaderId,
        ...getSearchParams(),
      })
    );
    setOperatorLoading(false);
    if (resOperatorData) setOperatorData(resOperatorData);
  }, [problemHeaderId, getSearchParams]);
  const handleInit = async () => {
    // 查询操作记录
    const resOperatorData = getResponse(
      await fetchOperatorData({
        problemHeaderId,
      })
    );
    setOperatorLoading(false);
    if (resOperatorData) setOperatorData(resOperatorData);
    // 查询审批记录
    if (isApprovalShow) {
      setActiveKey('approval');
      const resApporvalData = getResponse(
        await fetchApprovalData({
          tenantId,
          businessKey,
          needMerge: true,
        })
      );
      setApprovalLoading(false);
      if (isArray(resApporvalData) && !isEmpty(resApporvalData)) {
        setApprovalData(
          resApporvalData
            .map((item) => item.historicTaskExtList)
            .flat()
            .reverse()
        );
      }
    }
    // 查询审批流值集
    const resLov = getResponse(
      await queryMapIdpValue({
        definitions: 'SQAM.PROBLEM_WORKFLOW_DEFINITION',
      })
    );
    if (resLov) {
      setDefinitions(resLov.definitions);
    }
    // 查询操作记录 操作动作值集
    if (isExport) {
      const resOperate = getResponse(
        await queryLovData({
          lovCode: 'SQAM.PROBLEM.RECPRD.ACTION',
          problemHeaderId,
        })
      );
      if (resOperate) {
        setActionList(resOperate);
      }
    }
  };

  const handleChange = (_, i, { order }) => {
    approvalData.sort(({ endTime: a }, { endTime: b }) =>
      order === 'ascend'
        ? moment(a).valueOf() - moment(b).valueOf()
        : moment(b).valueOf() - moment(a).valueOf()
    );
  };

  const handleBindRef = useCallback((ref) => {
    searchFrom.current = ref;
  }, []);

  const searchProps = useMemo(() => {
    return {
      onRef: handleBindRef,
      handleSearch,
      actionList,
      isExport,
    };
  }, [handleSearch, handleBindRef, actionList, isExport]);

  const operationColumns = useMemo(
    () =>
      remoteProps
        ? remoteProps.process('SQAM_INITIATED_8D_DETAIL_OPERATOR_COLUMNS', operatorColumns, {
            operatorColumns,
            operatorLoading,
          })
        : operatorColumns,
    [remoteProps, operatorColumns, operatorLoading]
  );

  const approvalsColumns = useMemo(
    () =>
      remoteProps
        ? remoteProps.process('SQAM_INITIATED_8D_DETAIL_APPROVAL_COLUMNS', approvalColumns, {
            approvalColumns,
            approvalLoading,
          })
        : approvalColumns,
    [approvalColumns, remoteProps, approvalLoading]
  );

  const remoteStyle = remoteProps
  ?remoteProps.process("SSLM_COMPONENTS_QUALITY_RECTIFICATION_RECORD_STYLE",{},{_this:this})
  :{};

  return (
    <Modal
      visible={visible}
      width={900}
      footer={
        isExport && (activeKey === 'operator' || !isApprovalShow) ? (
          <ExcelExportPro
            buttonText={intl.get('hzero.common.button.export').d('导出')}
            templateCode="SQAM_ED_OPERATION_HISTORY_EXPORT" // 导出模板编码
            exportAsync
            otherButtonProps={{
              type: 'c7n-pro',
              color: 'primary',
            }}
            beforeClick={()=>{
              hideModal();
              return true;
            }}
            requestUrl={`/sqam/v1/operation-historys/${problemHeaderId}/${tenantId}/record/export`}
            queryParams={{
              ...getSearchParams(),
            }}
            allBody
            method="POST"
          />
        ) : null
      }
      onCancel={hideModal}
      bodyStyle={{ maxHeight: '600px', overflow: 'auto' }}
      {...remoteStyle}
      title={isApprovalShow ? null : intl.get(`hzero.common.button.operating`).d('操作记录')}
    >
      {isApprovalShow ? (
        <Tabs animated={false} activeKey={activeKey} onChange={(key) => setActiveKey(key)}>
          <TabPane
            tab={intl.get(`hzero.common.view.message.operateHistory`).d('操作记录')}
            key="operator"
          >
            {isExport && <Search {...searchProps} />}
            <Table
              bordered
              loading={operatorLoading}
              dataSource={operatorData}
              // columns={operatorColumns}
              columns={operationColumns}
            />
            {remoteProps
              ? remoteProps.render('SQAM_INITIATED_8D_DETAIL_OPERATOR_FOOTER', null, {
                  operatorData,
                  operatorLoading,
                })
              : null}
          </TabPane>
          <TabPane
            tab={intl.get(`sqam.common.model.qualityRectification.approvalRecord`).d('审批记录')}
            key="approval"
          >
            <Table
              bordered
              onChange={handleChange}
              loading={approvalLoading}
              dataSource={approvalData}
              // columns={approvalColumns}
              columns={approvalsColumns}
            />
          </TabPane>
        </Tabs>
      ) : (
        <>
          {isExport && <Search {...searchProps} />}
          <Table
            bordered
            loading={operatorLoading}
            dataSource={operatorData}
            columns={operationColumns}
          />
          {remoteProps
            ? remoteProps?.render('SQAM_INITIATED_8D_DETAIL_OPERATOR_FOOTER', null, {
                operatorData,
                operatorLoading,
              })
            : null}
        </>
      )}
    </Modal>
  );
};

export default QualityRectificationRecord;

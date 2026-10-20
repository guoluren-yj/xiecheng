/*
 * @Date: 2023-11-01 15:05:56
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { Link } from 'dva/router';
import { now, isEmpty } from 'lodash';
import { observer } from 'mobx-react-lite';
import React, { useCallback, useState, useMemo, Fragment } from 'react';
import { Table, DataSet, Button, Tooltip, Modal } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import SearchBar from '_components/SearchBarTable/SearchBar';

import { renderStatus } from '@/routes/components/utils';

import { getScoreDetailDs, getQualityRectifyDs } from '../stores/getScoreResultDS';

const Index = observer(
  ({ remote, sourceKey, basicDs, onComplaint, resultListDs, custLoading, customizeTable }) => {
    const {
      fullUseFlag,
      evalHeaderId,
      evalRespRule,
      evalGranularity,
      appealDeadlineTime,
      checkCollectFlag,
      checkLevelFlag,
      allowAppealFlag,
      allowPublishedFlag,
      supplierAppealFlag,
    } = basicDs?.current?.toData() || {};

    const [scoreDetailDs, setScoreDetailDs] = useState({});
    // 是否是申诉弹框
    const isComplaint = useMemo(() => sourceKey === 'COMPLAINT', [sourceKey]);

    // 点击展开图标时触发
    const handleExpand = useCallback(
      (expanded, record) => {
        const evalLineId = record.get('evalLineId');
        if (!scoreDetailDs[evalLineId]) {
          const currentDs = new DataSet(getScoreDetailDs({ evalRespRule, evalLineId }));
          currentDs.setQueryParameter(
            'customizeUnitCode',
            'SSLM.APPRAISAL_SUPPLIER_DETAIL.SCORE_DETAIL'
          );
          currentDs.query();
          setScoreDetailDs(prevState => ({
            ...prevState,
            [evalLineId]: currentDs,
          }));
        }
      },
      [scoreDetailDs, evalRespRule]
    );

    // 查询条件参数
    const getFieldProps = useCallback(
      () => ({
        categoryId: {
          lovPara: { evalHeaderId },
        },
      }),
      []
    );

    const expandedRowRenderer = useCallback(
      ({ record }) => {
        const scoreDetailColumns = [
          {
            name: 'completeFlag',
            width: 150,
            renderer: renderStatus,
            headerStyle: { paddingLeft: 48 },
          },
          {
            name: 'indicatorCode',
            width: 200,
          },
          {
            name: 'indicatorName',
            width: 200,
          },
          {
            name: 'evalWeight',
            width: 100,
          },
          {
            name: 'evalWeightScore',
            width: 100,
          },
          {
            name: 'scoreType',
            width: 100,
          },
          {
            name: 'indicatorType',
            width: 100,
          },
          {
            name: 'vetoFlag',
            width: 100,
            renderer: ({ value, record: curRecord }) => {
              const { indicatorType } = curRecord?.get(['indicatorType']) || {};
              return indicatorType === 'VETO' ? yesOrNoRender(value || 0) : '-';
            },
          },
          {
            name: 'standardFlag',
            width: 100,
            renderer: ({ value, record: curRecord }) => {
              const { indicatorType } = curRecord?.get(['indicatorType']) || {};
              return indicatorType === 'TICK' ? yesOrNoRender(value || 0) : '-';
            },
          },
          {
            name: 'indOptFlag',
            width: 100,
            renderer: ({ value, record: curRecord }) => {
              const { indicatorType } = curRecord?.get(['indicatorType']) || {};
              return indicatorType === 'OPT' ? yesOrNoRender(value || 0) : '-';
            },
          },
          {
            name: 'finalScore',
            width: 100,
          },
          {
            name: 'indicatorLevelCode',
            width: 100,
          },
          {
            name: 'evalStandard',
          },
          {
            name: 'respRemarks',
          },
          {
            name: 'checkDetailScore',
            width: 100,
          },
        ];
        const evalLineId = record.get('evalLineId');
        return (
          scoreDetailDs[evalLineId] &&
          customizeTable(
            {
              code: 'SSLM.APPRAISAL_SUPPLIER_DETAIL.SCORE_DETAIL',
            },
            <Table mode="tree" columns={scoreDetailColumns} dataSet={scoreDetailDs[evalLineId]} />
          )
        );
      },
      [scoreDetailDs]
    );

    // 获取表格buttons
    const getButtons = useCallback(() => {
      const appealDeadlineTimeStamp =
        appealDeadlineTime && new Date(appealDeadlineTime.split('-')).getTime();
      const isExceed = appealDeadlineTimeStamp ? now() - appealDeadlineTimeStamp : null;
      // 申诉按钮显示逻辑
      const otherProps = {
        basicDs,
      };
      const showAllowAppeal = remote
        ? remote.process(
            'SSLM_APPRAISAL_SUPPLIER_DETAIL_RESULT_APPEAL_BTN',
            allowAppealFlag,
            otherProps
          )
        : allowAppealFlag;
      return [
        showAllowAppeal && (
          <Tooltip
            title={
              isExceed > 0 || fullUseFlag
                ? intl
                    .get(`sslm.receivedEvaluationResult.view.message.appealExceeded`)
                    .d('已超过申诉时间/申诉次数')
                : null
            }
          >
            <Button
              icon="record_test"
              funcType="flat"
              onClick={onComplaint}
              disabled={isExceed > 0 || fullUseFlag || isEmpty(resultListDs.selected)}
            >
              {intl.get('sslm.supplierDocManage.view.button.complaint').d('申诉')}
            </Button>
          </Tooltip>
        ),
      ].filter(Boolean);
    }, [fullUseFlag, allowAppealFlag, appealDeadlineTime, resultListDs]);

    // 查看质量整改单
    const handleExecutionDocument = record => {
      const { supplierId } = record?.get(['supplierId']) || {};
      const qualityRectifyDs = new DataSet(getQualityRectifyDs({ evalHeaderId, supplierId }));
      const columns = [
        {
          name: 'problemStatusMeaning',
          width: 150,
          renderer: renderStatus,
        },
        {
          name: 'problemNum',
          renderer: ({ value, record: curRecord }) => {
            const problemHeaderId = curRecord.get('problemHeaderId');
            return <Link to={`/sqam/received8D/detail/${problemHeaderId}`}>{value}</Link>;
          },
        },
        {
          name: 'problemTitle',
        },
      ];
      Modal.open({
        drawer: true,
        key: Modal.key(),
        cancelButton: false,
        style: { width: 742 },
        okText: intl.get('hzero.common.button.close').d('关闭'),
        title: intl.get('sslm.common.view.title.viewExecutionDocuments').d('查看执行单据'),
        children: (
          <Table
            columns={columns}
            dataSet={qualityRectifyDs}
            customizedCode="SSLM.APPRAISAL_SUPPLIER.QUALITY_RECTIFY"
            style={{ maxHeight: 'calc(100vh - 300px)' }}
          />
        ),
      });
    };

    const columns = [
      {
        name: 'lineStatusMeaning',
        width: 120,
        hidden: !supplierAppealFlag,
        renderer: renderStatus,
      },
      {
        name: 'supplierNum',
        width: 150,
      },
      {
        name: 'supplierName',
        width: 200,
      },
      {
        name: 'categoryName',
        width: 200,
        hidden: evalGranularity !== 'SU+CA',
      },
      {
        name: 'itemName',
        width: 200,
        hidden: evalGranularity !== 'SU+IT',
      },
      {
        name: 'lineScore',
        width: 100,
        renderer: ({ value, record }) => {
          const checkCollectScore = record.get('checkCollectScore');
          return checkCollectScore || value;
        },
      },
      {
        name: 'checkCollectScore',
        width: 100,
        hidden: !checkCollectFlag,
        renderer: ({ value, record }) =>
          ['published', 'appealing', 'appealApprovaRejected', 'appealApprovaling'].includes(
            record.get('lineStatus')
          )
            ? '-'
            : value,
      },
      {
        name: 'levelCode',
        width: 100,
      },
      {
        name: 'checkLevelDesc',
        width: 100,
        hidden: !checkLevelFlag,
      },
      {
        name: 'rankNum',
        width: 100,
        renderer: ({ record }) => {
          const { rankNum, supplierTotalNum } = record?.get(['rankNum', 'supplierTotalNum']) || {};
          return rankNum ? `${rankNum}/${supplierTotalNum}` : '-';
        },
      },
      {
        name: 'lineRemark',
        width: 200,
      },
      {
        name: 'appealCheckCollectScore',
        width: 100,
        hidden: !supplierAppealFlag,
        renderer: ({ value, record }) =>
          ['appealApproved', 'supplierConfirmed'].includes(record.get('lineStatus')) ? value : '-',
      },
      {
        name: 'appealLevelCode',
        width: 100,
        hidden: !supplierAppealFlag,
        renderer: ({ value, record }) =>
          ['appealApproved', 'supplierConfirmed'].includes(record.get('lineStatus')) ? value : '-',
      },
      {
        name: 'appealRankNum',
        width: 100,
        hidden: !supplierAppealFlag,
        renderer: ({ value, record }) =>
          ['appealApproved', 'supplierConfirmed'].includes(record.get('lineStatus')) ? value : '-',
      },
      {
        name: 'appealReply',
        width: 200,
        hidden: !supplierAppealFlag,
      },
      {
        name: 'appealRemark',
        width: 200,
        editor: isComplaint,
        lock: isComplaint ? 'right' : false,
        hidden: !allowAppealFlag && !allowPublishedFlag,
      },
      {
        name: 'attachmentUuid',
        width: 120,
        editor: isComplaint,
        lock: isComplaint ? 'right' : false,
        hidden: !allowAppealFlag,
      },
      {
        name: 'executeAction',
        width: 180,
        hidden: isComplaint,
      },
      {
        name: 'executeTotalCount',
        width: 100,
        hidden: isComplaint,
        renderer: ({ record, value }) => (
          <Button funcType="link" onClick={() => handleExecutionDocument(record)}>
            {intl
              .get('sslm.common.model.check.num', {
                num: `(${value || 0})`,
              })
              .d(`查看(${value || 0})`)}
          </Button>
        ),
      },
    ].filter(col => !col.hidden);

    const tableButtons = getButtons();

    return (
      <Fragment>
        {!isComplaint && (
          <SearchBar
            autoQuery={false}
            defaultExpand={false}
            dataSet={[resultListDs]}
            fieldProps={getFieldProps()}
            tableButtons={tableButtons}
            expandable={!isEmpty(tableButtons)}
            closeFilterSelector={!isEmpty(tableButtons)}
            searchCode="SSLM.APPRAISAL_SUPPLIER_DETAIL.SCORE_SEARCH_BAR"
          />
        )}
        {customizeTable(
          {
            code: 'SSLM.APPRAISAL_SUPPLIER_DETAIL.SCORE_TABLE',
          },
          <Table
            queryBar="none"
            columns={columns}
            dataSet={resultListDs}
            onExpand={handleExpand}
            custLoading={custLoading}
            style={{ maxHeight: 'calc(100vh - 160px)' }}
            expandedRowRenderer={expandedRowRenderer}
            selectionMode={isComplaint || !allowAppealFlag ? 'none' : 'rowbox'}
          />
        )}
      </Fragment>
    );
  }
);

export default Index;

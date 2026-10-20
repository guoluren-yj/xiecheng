/**
 * @Description: 销售方-评估计划-详情页 - 评估计划行
 * @Author: zlh
 * @Date: 2023-09-06
 * @Copyright (c) 2022 by ZhenYun, All Rights Reserved.
 */
import React, { Fragment, useMemo, useEffect, useCallback, useState } from 'react';
import { isNil } from 'lodash';
import SearchBarTable from '_components/SearchBarTable';
import { Steps } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';
import { getResponse } from 'utils/utils';
import intl from 'utils/intl';
import { renderStatus } from '@/routes/components/utils';
import { handleGetSteps } from '@/services/purchaserEvaluationWorkbenchServices';

const getStatus = status => {
  // EVALUATING：评估中、TO_BE_EVALUATED：待评估、EVALUATED：评估完成、EVAL_CANCEL：评估取消
  switch (status) {
    case 'EVALUATING':
      return 'process';
    case 'TO_BE_EVALUATED':
      return 'wait';
    case 'EVALUATED':
      return 'finish';
    case 'EVAL_CANCEL':
      return 'error';
    default:
      return 'process';
  }
};

export const ExecuteStatusStep = ({ record, progressList = [] }) => {
  const {
    evalType,
    finalScore,
    needFeedbackFlag,
    resultsFlagMeaning,
    progressStatus,
    executeStatus,
    executeStatusMeaning,
  } = record.get([
    'evalType',
    'finalScore',
    'needFeedbackFlag',
    'resultsFlagMeaning',
    'progressStatus',
    'executeStatus',
    'executeStatusMeaning',
  ]);

  const finalList = progressList
    .map(progress => {
      if (progress.progressStatus === 'SUPPLIER_EVAL') {
        if (needFeedbackFlag) {
          return progress;
        } else {
          return false;
        }
      } else if (progress.progressStatus === 'INTERNAL_EVAL') {
        if (evalType === 'ONLINE') {
          return progress;
        } else {
          return false;
        }
      } else {
        return progress;
      }
    })
    .filter(Boolean);
  const current = finalList.findIndex(n => n.progressStatus === progressStatus);
  return (
    <Steps type="popup" headerText={executeStatusMeaning} status={getStatus(executeStatus)}>
      {finalList.map((progress, index) => {
        return (
          <Steps.Step
            title={progress.progressStatusMeaning}
            status={index < current ? 'finish' : index === current ? 'process' : 'wait'}
            description={
              progress.progressStatus === 'EVAL_RESULT' &&
              !isNil(finalScore) &&
              !isNil(resultsFlagMeaning) ? (
                <span>
                  {`${finalScore}${intl
                    .get('sslm.purchaserEvaluation.model.message.score')
                    .d('分')}-${resultsFlagMeaning}`}
                </span>
              ) : (
                ''
              )
            }
          />
        );
      })}
    </Steps>
  );
};

const PlanLines = observer(
  ({ basicInfoDs, dataSet, custLoading, handleSearch, customizeTable }) => {
    const [progressList, setProgressList] = useState([]); // 评估进度-进度条

    const isGroup = +basicInfoDs?.current?.get('groupFlag');

    const columns = useMemo(
      () => [
        {
          name: 'lineNumber',
          width: 120,
        },
        {
          name: 'evalStatus',
          width: 120,
          renderer: renderStatus,
        },
        {
          name: 'executeStatus',
          width: 120,
          renderer: ({ record }) => {
            return <ExecuteStatusStep record={record} progressList={progressList} />;
          },
        },
        {
          name: 'finalScore',
          width: 120,
          align: 'right',
        },
        {
          name: 'resultsFlagMeaning',
          width: 120,
        },
        {
          name: 'grade',
          width: 120,
        },
        {
          name: 'approveDate',
          width: 120,
        },
        { name: 'ouLov', width: 150, hidden: isGroup },
        { name: 'invOrganizationLov', width: 150, hidden: isGroup },
        { name: 'inventoryLov', width: 150, hidden: isGroup },
        { name: 'supplierCompanyLov', width: 150 },
        { name: 'supplierCompanyNum', width: 150 },
        { name: 'supplierNum', width: 150 },
        { name: 'supplierCategoryName', width: 150 },
        {
          name: 'categoryLov',
          width: 150,
        },
        { name: 'categoryName', width: 150 },
        { name: 'itemLov', width: 150 },
        { name: 'itemName', width: 150 },
        { name: 'evalPrincipalLov', width: 150 },
        { name: 'planMonth', width: 150 },
        { name: 'planDateFrom', width: 150 },
        { name: 'planDateTo', width: 150 },
        { name: 'supplierContacts', width: 150 },
        {
          name: 'telephone',
          width: 140,
        },
        { name: 'email', width: 150 },
        { name: 'supplierAddress', width: 150 },
        { name: 'evalRemark', width: 150 },
      ],
      [isGroup, progressList]
    );

    const getStepList = useCallback(() => {
      handleGetSteps().then(response => {
        const res = getResponse(response);
        if (res) {
          setProgressList(res);
        }
      });
    }, []);

    useEffect(() => {
      getStepList();
    }, []);

    return (
      <Fragment>
        {customizeTable(
          {
            code: 'SSLM.SUPPLIER_ASSESS_DETAIL.EVALUATION_PLAN.PLAN_TABLE',
            readOnly: true,
          },
          <SearchBarTable
            searchCode="SSLM.SUPPLIER_ASSESS_DETAIL.EVALUATION_PLAN.PLAN_FILTER_NEW"
            custLoading={custLoading}
            columns={columns}
            dataSet={dataSet}
            border={false}
            selectionMode="click"
            searchBarConfig={{
              autoQuery: false,
              closeFilterSelector: true,
              expandable: false,
              onQuery: handleSearch,
              fieldProps: {
                supplierIdCombine: {
                  valueField: 'supplierCompanyId',
                  transformRequest: value => {
                    const params = value?.map(({ supplierCompanyId, supplierId, ...others }) => {
                      return {
                        ...others,
                        supplierCompanyId: supplierCompanyId || supplierId,
                        supplierId,
                      };
                    });
                    return params;
                  },
                },
              },
            }}
            style={{
              maxHeight: 554,
            }}
          />
        )}
      </Fragment>
    );
  }
);

export default PlanLines;

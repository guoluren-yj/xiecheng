import React, { memo, useCallback, useEffect, useState, Fragment } from 'react';
import { useModal } from 'choerodon-ui/pro';
import { Card, Spin } from 'choerodon-ui';
import { isArray, isEmpty } from 'lodash';
import { FieldType } from 'choerodon-ui/dataset/data-set/enum';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import type { FieldProps } from 'choerodon-ui/dataset/data-set/Field';

import intl from 'utils/intl';
import { getResponse, getUserOrganizationId, getCurrentOrganizationId } from 'utils/utils';
import { DETAIL_CARD_CLASSNAME } from 'utils/constants';

import ExecDetail from './ExecutionDetail';
import CalcFormula from './CalcFormula';
import { getResultApi } from '../../../utils/api';
import { useModalOpen } from '../../../../../utils/hooks';
import ProgressDetail from './ProgressDetail';
import SourceDocument from './SourceDocument';

interface CalcProgressProps {
  topRecord: any,
}

interface ProgressDynamicProps {
  mode: 'tree' | 'list',
  fields: FieldProps[],
  columns: ColumnProps[],
  queryFields: any[],
}

const tenantId = getCurrentOrganizationId();
const organizationId = getUserOrganizationId();

const getCompFieldProps = ({ componentType, lovCode, lovParamList }): FieldProps => {
  const compFieldProps: FieldProps = {};
  switch (componentType) {
    case 'LOV':
      if (isArray(lovParamList) && !isEmpty(lovParamList)) {
        const lovPara = Object.fromEntries(
          lovParamList.map(lovParemItem => {
            const { paramType, paramCode, paramName } = lovParemItem || {};
            if (paramType === 'CONTEXT') {
              const contextParamCodeMap = { tenantId, organizationId };
              return [paramName, contextParamCodeMap[paramName]];
            } else {
              return [paramName, paramCode];
            }
          })
        );
        compFieldProps.lovPara = lovPara;
      }
      Object.assign(compFieldProps, { type: FieldType.object, lovCode });
      break;
    case 'SELECT':
      Object.assign(compFieldProps, { lookUpCode: lovCode });
      break;
    default:
  }
  return compFieldProps;
};

const CalcProgress = memo((props: CalcProgressProps) => {
  const c7nModal = useModal();
  const modalOpen = useModalOpen(c7nModal);

  const { topRecord } = props;
  const [loading, setLoading] = useState(false);
  const [dynamicProps, setDynamicProps] = useState<ProgressDynamicProps>({ mode: 'tree', fields: [], columns: [], queryFields: [] });

  const { ruleId, executeRecordId } = topRecord?.get(['ruleId', 'executeRecordId']) || {};

  const handleOpenExecDetailModal = useCallback((execDetailList) => {
    modalOpen({
      title: intl.get('spfp.common.view.title.executionDetail').d('执行明细'),
      size: 'medium',
      editFlag: false,
      children: <ExecDetail dataSource={execDetailList} />,
    });
  }, [modalOpen]);

  const handleOpeSourceDetailModal = useCallback((sourceList) => {
    modalOpen({
      title: intl.get('spfp.common.view.title.sourceDocumentCode').d('来源单据'),
      size: 'medium',
      editFlag: false,
      children: <SourceDocument dataSource={sourceList} />,
    });
  }, [modalOpen]);

  const handleInit = useCallback(async () => {
    // 动态渲染查询视图表格
    setLoading(true);
    const res = getResponse(await (getResultApi({ ruleId, executeRecordId })));
    setLoading(false);
    if (!res) return;
    const { mode, labels = [] } = res || {};
    if (isArray(labels) && !isEmpty(labels)) {
      const fields: FieldProps[] = [];
      const columns: ColumnProps[] = [];
      const queryFields: any[] = [];
      labels.forEach((fieldObj) => {
        const {
          lovCode,
          filterFlag,
          displayFlag,
          dimensionKey,
          componentType,
          dimensionCode,
          dimensionName: label,
          baseDimensionLovParamList: lovParamList = [],
        } = fieldObj || {};
        const columnProps: ColumnProps = { name: dimensionCode, width: 150 };
        const fieldProps: FieldProps = { name: dimensionCode, label };
        const queryFieldProps: any = { name: dimensionKey, label };
        if (dimensionCode === 'calculateProcess') {
          columnProps.renderer = ({ value }) => <a onClick={() => handleOpenExecDetailModal(value)}>{label}</a>;
        } else if (dimensionCode === 'sourceDocumentNum') {
          columnProps.renderer = ({ value }) => value && <a onClick={() => handleOpeSourceDetailModal(value)}>{intl.get('hzero.common.view.title.detail').d('详情')}</a>;
        };
        if (Number(displayFlag) === 1) {
          fields.push(fieldProps);
          columns.push(columnProps);
        }
        if (Number(filterFlag) === 1) {
          queryFields.push({
            ...queryFieldProps,
            ...getCompFieldProps({ componentType, lovCode, lovParamList }),
            display: queryFields.length < 4,
          });
        }
      });
      setDynamicProps({ mode, fields, columns, queryFields });
    }
  }, [ruleId, executeRecordId, handleOpenExecDetailModal, handleOpeSourceDetailModal]);

  useEffect(() => {
    if (ruleId) handleInit();
  }, [ruleId, handleInit]);

  return (
    <Fragment>
      <Spin spinning={loading}>
        <Card
          key="formula"
          bordered={false}
          className={DETAIL_CARD_CLASSNAME}
          title={intl.get(`spfp.common.view.title.standardCalculationFormula`).d('标准计算公式')}
        >
          <CalcFormula topRecord={topRecord} />
        </Card>
        {!isEmpty(dynamicProps.columns) && (
        <Card
          key="detail"
          bordered={false}
          className={DETAIL_CARD_CLASSNAME}
          title={intl.get(`spfp.common.view.title.calculationDetail`).d('计算明细')}
        >
          <ProgressDetail
            ruleId={ruleId}
            executeRecordId={executeRecordId}
            {...dynamicProps}
          />
        </Card>
      )}
      </Spin>
    </Fragment>
  );
});

export default CalcProgress;

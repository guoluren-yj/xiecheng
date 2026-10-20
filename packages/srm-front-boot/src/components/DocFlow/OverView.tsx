/**
 * DocInfo
 * 单据流单据信息 - 单据信息
 * @date: 2021-11-15
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Icon } from 'choerodon-ui';
import { Form, DataSet, Output, Spin, Table, Attachment } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import classnames from 'classnames';
import { getResponse } from 'utils/utils';
import intl from 'utils/intl';
import { queryNodeDoc } from './docFlowService';

interface OverViewProps {
  nodeDataId: string;
  currentOrganizationId: number;
  nodeDefinitionCode: string;
  currentUserId: number;
  ecpoId: number | undefined;
}

interface OptionData {
  fieldCode: string;
  fieldValue: string;
  fieldMeaning: string;
  attachmentFlag: boolean;
  bucketCode: string;
}

const EC_FLAG = 0; // 商城前台页面进入为 1， 0为其他平台进入

function OverView(props: OverViewProps) {
  const { nodeDataId, currentOrganizationId, nodeDefinitionCode, currentUserId, ecpoId } = props;
  const [overViewHeader, setDocOverviewHeader] = useState({} as any);
  const [overviewLine, setDocOverviewLine] = useState({} as any);
  const [expand, handleExpand] = useState(false);
  const [overViewLoading, handleOverViewLoading] = useState(true);
  // 表格个性化编码 组件名 + 节点类型 + 用户ID
  const customizedCode = (`DOCFLOW.${nodeDefinitionCode}.${currentUserId}`).toUpperCase();

  useEffect(() => {
    queryNodeDoc({
      nodeDataId,
      ecpoId,
      currentOrganizationId,
      ecFlag: EC_FLAG,
    })
      .then((res) => {
        if (getResponse(res)) {
          setDocOverviewHeader(getDsOption(res.header));
          setDocOverviewLine(getDsOption(res.line));
        }
      })
      .finally(() => handleOverViewLoading(false));
  }, []);

  const formDs = useMemo(() => new DataSet(overViewHeader), [overViewHeader]);
  const tableDs = useMemo(() => new DataSet(overviewLine), [overviewLine]);

  const getDsOption = (data) => {
    const list = data || [];
    const dsData = {};
    list.forEach((d: OptionData) => {
      dsData[d.fieldCode] = d.fieldValue;
    });
    return {
      selection: false,
      paging: false,
      fields: list.map((f: OptionData) => {
        return {
          name: f.fieldCode,
          type: f.attachmentFlag ? 'attachment' : 'string',
          label: f.fieldMeaning,
          bucketName: f.bucketCode,
        };
      }),
      data: [dsData],
    };
  };

  const renderOverViewHeader = useCallback(
    (formConfig = {}) => {
      let hideMaxNum;
      if (!expand) {
        hideMaxNum = 9;
      }
      return formConfig?.fields?.slice(0, hideMaxNum)?.map((field) => {
        return <Output name={field.name} colSpan={1} />;
      });
    },
    [expand]
  );

  const getColumns = (lines) => {
    return lines?.fields?.map((field, index) => {
      return {
        name: field.name,
        width: field.width || 140,
        hidden: index >= 5,
      };
    });
  };

  return (
    <div className="doc-flow-info-modal-overView">
      <Spin spinning={overViewLoading}>
        <div
          className={classnames(
            `modal-group-head-title`, `modal-group-head-title-overview${expand ? '-expand' : ''}`, `overview-${overViewHeader?.fields?.length > 9 ? 'expand' : 'noExpand'}`
          )}
          onClick={() => handleExpand(!expand)}
        >
          <span>{intl.get('component.docFlow.view.docInfo.tab.docOverview').d('单据概览')}</span>
          {
            overViewHeader?.fields?.length > 9 && <Icon type="expand_more" />
          }
        </div>
        <Form
          key="form"
          dataSet={formDs}
          labelLayout={LabelLayout.vertical}
          columns={3}
          className="c7n-pro-vertical-form-display"
        >
          {renderOverViewHeader(overViewHeader)}
        </Form>
        {
          !isEmpty(overviewLine?.fields) && (
            <Table
              className="overView-table"
              dataSet={tableDs}
              columns={getColumns(overviewLine)}
              customizable
              customizedCode={customizedCode}
            />
          )
        }
      </Spin>
    </div>
  );
}
export default OverView;

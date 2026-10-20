/* eslint-disable no-param-reassign */
import React from 'react';
import intl from 'utils/intl';
import { Table } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';
// import FilterBar from '@/components/FilterBarTable/FilterBar';
import { yesOrNoRender } from 'utils/renderer';
import FilterBar from './FilterBarTable/FilterBar';
import styles from './index.less';

const { Column } = Table;

export default function Detail({ listDS }) {
  const finalResultMap = {
    EXECUTING: styles['status-alert'], // 执行中
    FAIL: styles['status-rejected'], // 审核失败
    APPROVED: styles['status-passed'], // 审核通过
    REJECTED: styles['status-rejected'], // 审核拒绝
    APPROVED_SUGGEST: styles['status-alert2'], // 审核通过(有建议)
  };

  const finalResultMsg = {
    EXECUTING: intl.get('smbl.aiChekReport.view.title.executing').d('执行中'),
    FAIL: intl.get('smbl.aiChekReport.view.title.fail').d('审核失败'),
    APPROVED: intl.get('smbl.aiChekReport.view.title.approved').d('审核通过'),
    REJECTED: intl.get('smbl.aiChekReport.view.title.rejected').d('审核拒绝'),
    APPROVED_SUGGEST: intl
      .get('smbl.aiChekReport.view.message.approvedSuggest')
      .d('审核通过(有建议)'),
  };

  /**
   * 渲染状态标签
   * @param {Object} props - 单元格属性
   * @param {string} props.value - 单元格值
   * @returns {React.ReactElement}
   */
  const renderStatus = ({ value }) => {
    const className = finalResultMap[value] || '';
    const text = finalResultMsg[value] || value;
    return <Tag className={className}>{text}</Tag>;
  };

  const handleFilterQueryAll = ({ dataSet, params }) => {
    const list = dataSet?.toData() ?? [];
    const obj = { ...list[0] };

    // eslint-disable-next-line camelcase
    const rangeTimeStr = params?.range_time_str || obj?.range_time_str || '';
    const startTime = rangeTimeStr ? rangeTimeStr.split(',')[0] ?? '' : '';
    const endTime = rangeTimeStr ? rangeTimeStr.split(',')[1] ?? '' : '';

    const docCodeList = obj?.documentCode || params?.documentCode || [];
    const categoryCodeList = obj?.categoryCode || params?.categoryCode || [];
    const feedbackType = obj?.feedbackType || params?.feedbackType || '';

    const param = {
      documentCode: docCodeList?.length ? docCodeList?.join(',') : '',
      categoryCode: categoryCodeList?.length ? categoryCodeList?.join(',') : '',
      feedbackType,
      startTime: startTime === 'null' ? '' : startTime,
      endTime: endTime === 'null' ? '' : endTime,
      range_time_str: rangeTimeStr,
      viewTimeRange: null,
    };

    listDS.queryParameter = {
      ...param,
    };
    listDS.query();
  };

  /**
   * 渲染详情文本，对比 text 和 ruleDetailOrigin，高亮显示替换的字段
   * @param {string} text 翻译后的文本
   * @param {string} ruleDetailOrigin 原始规则文本
   */
  const renderDetailText = (text, ruleDetailOrigin) => {
    if (!text || !ruleDetailOrigin) {
      return <span>{text}</span>;
    }

    // 匹配原始文本中的英文字段变量（如 SRM_SSTA_SETTLE_LINE_paymentAmount）
    const variableRegex = /[a-zA-Z_][a-zA-Z0-9_]*/g;
    const staticParts = ruleDetailOrigin.split(variableRegex);

    // 如果没有提取出变量，直接返回原文本
    if (staticParts.length === 1) {
      return <span>{text}</span>;
    }

    // 转义正则表达式特殊字符
    const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // 使用静态部分构建正则表达式，提取 text 中的中文翻译字段
    const pattern = `^${staticParts.map(escapeRegExp).join('(.*?)')}$`;
    const match = text.match(new RegExp(pattern));

    // 如果无法匹配，降级返回原文本
    if (!match) {
      return <span>{text}</span>;
    }

    // match 数组从索引 1 开始是提取出的中文变量
    const variables = match.slice(1);

    return (
      <span>
        {staticParts.map((part, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <React.Fragment key={index}>
            {part}
            {index < variables.length && (
              <span style={{ color: '#0161D5', fontWeight: 600 }}>{variables[index]}</span>
            )}
          </React.Fragment>
        ))}
      </span>
    );
  };

  return (
    <div className={styles['table-detail-container']}>
      <div
        style={{
          padding: '16px 16px 8px 16px',
          backgroundColor: '#fff',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <FilterBar
          dataSet={[listDS]}
          cacheState
          cacheKey="SMBL.AI_CHECK_RESULT_REPORT_DETAIL_FILTER"
          onQuery={handleFilterQueryAll}
          fields={[
            {
              label: intl.get('smbl.aiChekReport.model.statisticalPeriod').d('统计周期'),
              name: 'viewTimeRange',
              type: 'string',
              display: true,
              lock: true,
              showDatePicker: true,
              defaultValue: 'WEEK',
              maxDate: new Date() - 86400000,
            },
            {
              label: intl.get('smbl.aiChekReport.model.documentCode').d('流程单据编码'),
              name: 'documentCodeObj',
              display: true,
              lock: true,
              type: 'object',
              lovCode: 'SMBL.AI_CHECK_DOCUMENT_LIST',
              noCache: true,
              valueField: 'documentId',
              editorProps: {
                tableProps: {
                  columns: [
                    { name: 'documentCode', width: 250 },
                    { name: 'documentName', width: 250 },
                  ],
                },
              },
            },
            {
              label: intl.get('smbl.aiChekReport.model.categoryCode').d('流程分类编码'),
              name: 'categoryCodeObj',
              type: 'object',
              display: true,
              lock: true,
              lovCode: 'SMBL.AI_CHECK_CATEGORY_LIST',
              noCache: true,
              valueField: 'categoryId',
              editorProps: {
                tableProps: {
                  columns: [
                    { name: 'categoryCode', width: 250 },
                    { name: 'categoryName', width: 250 },
                  ],
                },
              },
            },
            {
              label: intl.get('smbl.aiChekReport.model.feedbackType').d('是否点踩'),
              name: 'feedbackType',
              type: 'string',
              display: true,
              lock: true,
              lookupCode: 'SMBL_AI_CHECK_FEEDBACK',
            },
          ]}
        />
      </div>

      <div className={styles['detail-table-container']}>
        <Table
          dataSet={listDS}
          queryBar="none"
          autoHeight={{ type: 'maxHeight', diff: 40 }}
          customizable
          customizedCode="SMBL.AI_CHECK_RESULT_REPORT_LIST"
        >
          <Column name="documentName" width={150} />
          <Column name="categoryName" width={150} />
          <Column name="batchId" width={200} tooltip="overflow" />
          <Column name="bindObjName" width={180} />
          <Column name="ruleCode" width={120} />
          <Column name="ruleName" width={200} />
          <Column
            name="ruleDetail"
            width={400}
            tooltip="overflow"
            renderer={({ text, record }) => {
              const ruleDetailOrigin = record.get('ruleDetailOrigin');
              return renderDetailText(text, ruleDetailOrigin);
            }}
          />
          <Column name="finalResult" width={120} renderer={renderStatus} />
          <Column
            name="executeResult"
            width={400}
            tooltip="overflow"
            renderer={({ text }) => {
              return <span>{text}</span>;
            }}
          />
          <Column name="userName" width={100} />
          <Column
            name="feedbackType"
            width={100}
          />
          <Column name="lastUpdateDate" width={180} />
        </Table>
      </div>
    </div>
  );
}

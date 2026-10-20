/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-02-16 21:25:38
 * @LastEditors: yanglin
 * @LastEditTime: 2022-03-10 16:37:41
 */
import React, { useContext, useState } from 'react';
import SearchBarTable from '_components/SearchBarTable';
import intl from 'utils/intl';
import classNames from 'classnames';
import DocFlow from '_components/DocFlow';
import ExcelExportPro from 'components/ExcelExportPro';
import { observer } from 'mobx-react-lite';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SIEC } from '_utils/config';
import { Icon, Menu, Dropdown, Modal, DataSet, Table } from 'choerodon-ui/pro';
import { queryMoreTree } from '@/services/projectSpaceService.js';
import MutlTextFieldSearch from '@/routes/components/MutlTextFieldSearch';
import { Store } from '../commonDetail/sotreProvider';
import { ExcuteLineDs } from '../commonDetail/store';
import { colorTagRender } from '../commonDetail/util.js';

const LinkExcuteList = function LinkExcuteList() {
  const { excuteLineDs, customizeTable, projectId, originLineDs, headerLineDs } = useContext(Store);
  const [tableType, setTableCode] = useState('lineTiling');
  const tableGroups = {
    lineTiling: {
      cols: [
        { name: 'status', renderer: colorTagRender },
        {
          name: 'executionDocNum',
          renderer: ({ value, record }) =>
            value ? `${value}-${record?.get('executionDocLineNum')}` : null,
        },
        {
          name: 'executionDocType',
          renderer: ({ record }) => record.get('executionDocTypeMeaning'),
        },
        { name: 'itemId', renderer: ({ record }) => record.get('itemCode') },
        { name: 'itemName' },
        { name: 'quantity' },
        { name: 'currencyCode' },
        { name: 'amount' },
        {
          name: 'docFlow',
          renderer: ({ record }) => (
            <DocFlow
              tableName={getTablePkCode({ executionDocType: record?.get('executionDocType') })}
              tablePk={record.get('docFlowQueryId')}
              buttonType="button"
            />
          ),
        },
        { name: 'applicationAmount' },
        { name: 'bidAmount' },
        { name: 'receiptAmount' },
        { name: 'attachmentUuid' },
        { name: 'taskLevel' },
        { name: 'taskNum', width: 180 },
      ],
      value: intl.get('sprm.project.model.tableTile').d('按行平铺所有单据'),
      searchCode: 'SIEC.PROJECT_READ.FLAT_FILTER',
      tableCode: 'SIEC.PROJECT_READ.LINK_TABLE',
      templateCode: 'SRM_C_SIEC_PROJECT_DOC_EXE_LINE',
      ds: excuteLineDs,
    },
    origin: {
      value: intl.get('sprm.project.model.tableAggregate').d('按初始单据聚合'),
      templateCode: 'SRM_C_SIEC_PROJECT_DOC_EXE_ORIGIN',
      cols: [
        { name: 'status', renderer: colorTagRender },
        {
          name: 'executionDocNum',
          renderer: ({ value, record }) =>
            value ? `${value}-${record?.get('executionDocLineNum')}` : null,
        },
        { name: 'executionDocType' },
        {
          name: 'executionDocType',
          renderer: ({ record }) => record.get('executionDocTypeMeaning'),
        },
        { name: 'itemId', renderer: ({ record }) => record.get('itemCode') },
        { name: 'itemName' },
        { name: 'quantity' },
        { name: 'currencyCode' },
        { name: 'amount' },
        {
          name: 'docFlow',
          renderer: ({ record }) => (
            <DocFlow
              tableName={getTablePkCode({ executionDocType: record?.get('executionDocType') })}
              tablePk={record.get('docFlowQueryId')}
              buttonType="button"
            />
          ),
        },
        { name: 'applicationAmount' },
        { name: 'bidAmount' },
        { name: 'receiptAmount' },
        { name: 'attachmentUuid' },
        { name: 'taskLevel' },
        { name: 'taskNum', width: 180 },
      ],
      searchCode: 'SIEC.PROJECT_READ.ORIGIN_FILTER',
      tableCode: 'SIEC.PROJECT_READ.ORIGIN_LIST',
      ds: originLineDs,
    },
    headerTiling: {
      value: intl.get('sprm.project.model.tableOrigin').d('按单平铺所有单据'),
      templateCode: 'SRM_C_SIEC_PROJECT_DOC_EXE_HEADER',
      cols: [
        { name: 'status', renderer: colorTagRender },
        {
          name: 'executionDoc',
          renderer: ({ record }) => record.get('executionDocNum'),
          width: 150,
        },
        {
          name: 'executionDocType',
          renderer: ({ record }) => record.get('executionDocTypeMeaning'),
        },
        { name: 'companyId', width: 220 },
        { name: 'ouId', width: 220 },
        { name: 'createdByName' },
        { name: 'totalAmount' },
        {
          name: 'viewDetail',
          renderer: ({ record }) => (
            <a onClick={() => handleDetail(record)}>
              {intl.get('sprm.project.model.viewDetail').d('查看明细')}
            </a>
          ),
        },
      ],
      searchCode: 'SIEC.PROJECT_READ.HEADER_FILTER',
      tableCode: 'SIEC.PROJECT_READ.HEADER_LIST',
      ds: headerLineDs,
    },
  };

  const getTablePkCode = ({ executionDocType }) => {
    let tablePkCode = '';
    switch (true) {
      case executionDocType === 'PR':
        tablePkCode = 'sprm_pr_line';
        break;
      case ['RFI', 'RFP'].includes(executionDocType):
        tablePkCode = 'ssrc_rf_line_item';
        break;
      case ['RFQ', 'RFA', 'NEW_BID'].includes(executionDocType):
        tablePkCode = 'ssrc_rfx_line_item';
        break;
      case executionDocType === 'PROJECT':
        tablePkCode = 'ssrc_project_line_item';
        break;
      case executionDocType === 'PO':
        tablePkCode = 'sodr_po_line_location';
        break;
      case executionDocType === 'CON':
        tablePkCode = 'spcm_pc_subject';
        break;
      case executionDocType === 'ASN':
        tablePkCode = 'slod_asn_line';
        break;
      case executionDocType === 'PLAN':
        tablePkCode = 'slod_plan_line';
        break;
      case ['UNIQUE_LABEL', 'LABEL'].includes(executionDocType):
        tablePkCode = 'slod_label_line';
        break;
      case ['TRX', 'TRX_R'].includes(executionDocType):
        tablePkCode = 'sinv_rcv_trx_line';
        break;
      case executionDocType === 'BILL':
        tablePkCode = 'ssta_bill_line';
        break;
      case ['PAYMENT', 'INVOICE', 'PREPAYMENT_APPLY'].includes(executionDocType):
        tablePkCode = 'ssta_settle_line';
        break;
      default:
        tablePkCode = 'ssrc_rfx_line_item';
    }
    return tablePkCode;
  };

  const handleDetail = (current) => {
    const executionDocHeaderId = current.get('executionDocHeaderId');
    const detailTableDs = new DataSet(
      ExcuteLineDs({
        projectId,
        executionDocHeaderId,
        customizeCode: 'SIEC.PROJECT_READ.LINKDETAIL_FLAT',
        source: 'readOnly',
        tableFlat: 'lineTiling',
      })
    );
    const cols = [
      { name: 'status', renderer: colorTagRender },
      {
        name: 'executionDocNum',
        renderer: ({ value, record }) =>
          value ? `${value}-${record?.get('executionDocLineNum')}` : null,
      },
      { name: 'itemId', renderer: ({ record }) => record.get('itemCode') },
      { name: 'itemName' },
      { name: 'quantity' },
      { name: 'currencyCode' },
      { name: 'amount' },
      {
        name: 'docFlow',
        renderer: ({ record }) => (
          <DocFlow
            tableName={getTablePkCode({ executionDocType: record?.get('executionDocType') })}
            tablePk={record.get('docFlowQueryId')}
            buttonType="button"
          />
        ),
      },
      { name: 'attachmentUuid' },
      { name: 'taskLevel' },
      { name: 'taskNum', width: 180 },
    ];

    Modal.open({
      key: Modal.key(),
      drawer: true,
      style: { width: '1090px' },
      bodyStyle: { paddingTop: '20px' },
      title: intl.get('sprm.project.model.viewDetail').d('查看明细'),
      children: customizeTable(
        {
          code: 'SIEC.PROJECT_READ.LINKDETAIL_FLAT',
        },
        <Table
          style={{ maxHeight: 'calc(100vh - 174px)' }}
          dataSet={detailTableDs}
          columns={cols}
        />
      ),
      closable: true,
      movable: false,
      destroyOnClose: true,
      onOk: () => {},
      okText: intl.get('hzero.common.status.closed').d('关闭'),
      footer: (okBtn) => okBtn,
    });
  };

  const handleSelectSortField = (value) => {
    setTableCode(value?.key);
    tableGroups[value?.key].ds.query();
  };

  const handleQuery = ({ params = {} }) => {
    const clearParams = {}; // 清理
    const dataSet = tableGroups[tableType].ds;
    // eslint-disable-next-line no-unused-expressions
    const dataObj = dataSet.queryDataSet?.current?.toData() || {};
    if (dataObj) {
      for (const key in dataObj) {
        if (!['executionNumAndName'].includes(key)) {
          // 排除掉自定义的查询条件
          if (!Object.prototype.hasOwnProperty.call(params, key)) {
            clearParams[key] = undefined;
          }
        }
      }
    }
    // eslint-disable-next-line no-unused-expressions
    dataSet.queryDataSet?.current
      ? dataSet.queryDataSet.current.set({
          ...params,
          ...clearParams,
        })
      : dataSet.queryDataSet.loadData([
          {
            ...params,
            ...clearParams,
          },
        ]);
    dataSet.query();
  };

  const resetQueryDs = () => {
    // eslint-disable-next-line no-unused-expressions
    tableGroups[tableType].ds.queryDataSet?.current.reset();
  };

  const menu = (
    <Menu onClick={handleSelectSortField} selectedKeys={[tableType]}>
      {[
        {
          value: 'lineTiling',
          meaning: intl.get('sprm.project.model.tableTile').d('按行平铺所有单据'),
        },
        {
          value: 'origin',
          meaning: intl.get('sprm.project.model.tableAggregate').d('按初始单据聚合'),
        },
        {
          value: 'headerTiling',
          meaning: intl.get('sprm.project.model.tableOrigin').d('按单平铺所有单据'),
        },
      ].map((item) => (
        <Menu.Item key={item.value}>{item.meaning}</Menu.Item>
      ))}
    </Menu>
  );

  const handleLoadData = ({ record, dataSet }) => {
    const { children } = record;
    // console.log(record);
    const childrenFlag = record.get('hasDownstream');
    return new Promise((resolve) => {
      if (!children && childrenFlag) {
        queryMoreTree({ projectId, originDocExecutionId: record?.get('executionId') })
          .then((res) => {
            if (res?.content && res?.totalElements > 0) {
              dataSet.appendData(
                res.content.map((e) => ({ ...e, parentExectionId: record?.get('executionId') })),
                record
              );
            }
            resolve();
          })
          .catch((err) => {
            console.log(err);
            resolve();
          });
      } else {
        resolve();
      }
    });
  };

  const expandIcon = ({ prefixCls, expanded, expandable, record, onExpand }) => {
    const childrenFlag = record.get('hasDownstream') !== 1;
    const iconPrefixCls = `${prefixCls}-expand-icon`;
    const clsName = classNames(iconPrefixCls, {
      [`${iconPrefixCls}-expanded`]: expanded,
    });
    return (
      <Icon
        type="baseline-arrow_right"
        className={clsName}
        onClick={onExpand}
        style={{ opacity: childrenFlag ? 0 : 1 }}
        tabIndex={expandable ? 0 : -1}
      />
    );
  };

  const getQueryFrom = () => {
    const lineDs = tableGroups[tableType].ds;
    const primaryKey = tableType !== 'headerTiling' ? 'executionId' : 'executionDocHeaderId';
    const { selected = [] } = lineDs || {};
    if (selected.length > 0) {
      const data = selected.map((ele) => ele.get(primaryKey));
      return { data };
    } else {
      const queryData =
        lineDs.queryDataSet && lineDs.queryDataSet.toJSONData
          ? lineDs.queryDataSet.toJSONData()
          : {};
      const currentQueryDate = queryData[0];
      return {
        ...(currentQueryDate || {}),
        projectId,
        customizeUnitCode: tableGroups[tableType].searchCode,
        exportSearchbarUnitCode: tableGroups[tableType].searchCode,
      };
    }
  };

  const HeaderButtons = observer((props) => {
    const { selected } = props.dataSet;
    return (
      <ExcelExportPro
        data-name="exportNew"
        {...{
          templateCode: tableGroups[tableType].templateCode,
          wait: 300,
          buttonText:
            selected.length > 0
              ? intl.get('sprm.common.button.exportSelect').d('勾选导出-新')
              : intl.get('hzero.common.export.new').d('导出-新'),
          requestUrl: `${SRM_SIEC}/v1/${getCurrentOrganizationId()}/project-doc-execution/export`,
          method: 'POST',
          allBody: true,
          queryParams: () => getQueryFrom(true),
          otherButtonProps: {
            type: 'c7n-pro',
            funcType: 'flat',
            permissionList: [
              {
                code: `srm.bg.management.project.button.excuteLineExport`,
                type: 'button',
              },
            ],
          },
        }}
      />
    );
  });

  return (
    <div className="content-padding">
      <h3 className="content-title">
        {intl.get('sprm.project.model.common.linkExcuteList').d('项目关联执行单据')}
      </h3>
      <div className="sprm-likexcutelist-search-buttons">
        {['lineTiling', 'origin', 'headerTiling'].map((e) => {
          return customizeTable(
            {
              code: tableGroups[e].tableCode,
              hidden: e !== tableType,
            },
            <SearchBarTable
              hidden={e !== tableType}
              style={{ maxHeight: `calc(100vh - 300px)` }}
              searchCode={tableGroups[e].searchCode}
              dataSet={tableGroups[e].ds}
              buttons={[<HeaderButtons dataSet={tableGroups[e].ds} />]}
              columns={tableGroups[e].cols}
              expandIcon={expandIcon}
              mode={e === 'origin' ? 'tree' : 'list'}
              defaultRowExpanded
              treeLoadData={e === 'origin' ? handleLoadData : null}
              searchBarConfig={{
                autoQuery: false,
                closeFilterSelector: true,
                checkDataSetStatus: false,
                right: {
                  render: () => (
                    <span className="c7n-pro-table-search-bar-sort">
                      <Dropdown trigger={['click']} overlay={() => menu}>
                        <span className="c7n-pro-table-search-bar-sort-control">
                          {tableGroups[e].value} <Icon type="keyboard_arrow_down" />
                        </span>
                      </Dropdown>
                    </span>
                  ),
                },
                left: {
                  render:
                    e === 'headerTiling'
                      ? undefined
                      : () => (
                          <MutlTextFieldSearch
                            name="executionNumAndName"
                            dataSet={tableGroups[e].ds}
                            placeholder={intl
                              .get('sprm.project.search.executionNumAndName')
                              .d('请输入执行单据编号查询')}
                          />
                        ),
                },

                onQuery: handleQuery,
                onClear: resetQueryDs,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default LinkExcuteList;

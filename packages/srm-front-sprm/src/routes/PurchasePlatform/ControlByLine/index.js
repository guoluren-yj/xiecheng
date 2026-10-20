import React, { useCallback, useState } from 'react';
import intl from 'utils/intl';
import { routerRedux } from 'dva/router';
import { Modal } from 'choerodon-ui/pro';
import querystring from 'querystring';
import { Tag } from 'choerodon-ui';
import { isFunction } from 'lodash';
import { yesOrNoRender } from 'utils/renderer';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import classnames from 'classnames';
import OperationNewRecord from '@/routes/components/OperationHistory';
import MutlTextFieldSearch from '@/routes/components/MutlTextFieldSearch';
import { fetchUomControl } from '@/services/purchaseRequisitionAssignmentService';
import { UrgentFlag } from '../../components/UrgentFlag';
import '../index.less';
import { colorRender } from './../util';

const commonPrompt = 'sprm.common.model.common';

const Index = ({
  customizeTable,
  lineDs,
  isOldUser,
  isNewTeant,
  dispatch,
  location,
  handleLinkOtherUrl,
  cuxDisplayNumStyle,
  remote,
}) => {
  const [init, setInit] = React.useState(false);
  const organizationId = getCurrentOrganizationId();
  const [uomControl, setUomControl] = useState(0); // 双单位控制.开启后原单位,数量不可编辑
  const openOperatorRecord = ({ record }) => {
    return Modal.open({
      key: Modal.key(),
      drawer: true,
      style: { width: '742px' },
      bodyStyle: { paddingTop: '20px' },
      title: intl.get(`hzero.common.button.operating`).d('操作记录'),
      children: <OperationNewRecord prHeaderId={record.get('prHeaderId')} />,
      closable: true,
      movable: false,
      onOk: () => { },
      okText: intl.get('hzero.common.status.closed').d('关闭'),
      footer: (okBtn) => okBtn,
      destroyOnClose: true,
    });
  };

  React.useEffect(() => {
    queryUomControl();
  }, []);

  // 获取是否开启双单位控制
  const queryUomControl = async () => {
    await fetchUomControl().then((res) => {
      const result = getResponse(res);
      if (result) {
        setUomControl(result?.SPRM);
        lineDs.setState({
          uomControl: result?.SPRM || 0,
        });
      }
    });
  };

  // 跳转详情
  const handleJumpDetail = useCallback((record, type) => {
    const { prSourcePlatform, prHeaderId, prSourcePlatformMeaning } = record.toData();
    const search = type === 'edit' ? { type } : {};
    const pathCux = isFunction(handleLinkOtherUrl)
      ? handleLinkOtherUrl({ prHeaderId: record.get('prHeaderId'), type: 'query', location }) || {}
      : {};
    if (pathCux && pathCux?.pathname) {
      dispatch(
        routerRedux.push({
          pathname: pathCux?.pathname,
          search: pathCux?.search,
        })
      );
    } else {
      dispatch(
        routerRedux.push({
          pathname:
            prSourcePlatform === 'ERP'
              ? `/sprm/purchase-platform/erp-detail/${prHeaderId}`
              : `/sprm/purchase-platform/noerp-detail/${prHeaderId}`,
          state: { prSourcePlatformCode: prSourcePlatform, prSourcePlatformMeaning },
          search: querystring.stringify(search),
        })
      );
    }
  }, []);

  const lineColumns = [
    {
      name: 'prLineStatusCode',
      width: 150,
      renderer: ({ value, record }) => colorRender(value, record.get('prLineStatusCodeMeaning')),
    },
    {
      name: 'displayPrNum',
      width: 180,
      renderer: ({ value, record }) => (
        <a
          onClick={() => handleJumpDetail(record)}
          style={record.get('urgentFlag') === 1 ? cuxDisplayNumStyle || {} : {}}
        >
          {`${value}-${record.get('displayLineNum')}`}
          {record.get('urgentFlag') === 1 && <UrgentFlag />}
        </a>
      ),
    },
    { name: 'title' },
    { name: 'displayLineNum' },
    { name: 'uomCodeAndName' },
    {
      name: 'itemCode',
      width: 150,
      renderer: ({ value, record }) => (value ? `${value}-${record.get('itemName')}` : '-'),
    },
    { name: 'itemName' },
    { name: 'wbs' },
    { name: 'categoryName' },
    { name: 'quantity' },
    {
      name: 'autoAssignedFlag',
      width: 80,
      renderer: ({ value }) => {
        if (value || value === 0) {
          return (
            <Tag className={value === 1 ? 'c7n-tag-green' : 'c7n-tag-red'} style={{ border: 0 }}>
              {value === 1
                ? intl.get(`sprm.common.model.successStatus`).d('成功')
                : intl.get(`sprm.common.model.errorStatus`).d('失败')}
            </Tag>
          );
        } else {
          return null;
        }
      },
    },
    {
      name: 'orderExcessRuleCode',
      width: 100,
    },
    {
      name: 'sourceExcessRuleCode',
      width: 100,
    },
    {
      name: 'contractExcessRuleCode',
      width: 100,
    },
    {
      name: 'sourceDisposableExcessFlag',
      width: 100,
    },
    {
      name: 'sourceOccupiedQuantity',
      width: 100,
      title: intl.get(`${commonPrompt}.sourceOccupiedQuantity`).d('寻源链路占用数量'),
    },
    {
      name: 'orderOccupiedQuantity',
      width: 100,
      title: intl.get(`${commonPrompt}.orderOccupiedQuantity`).d('履约链路占用数量'),
    },
    {
      name: 'restSourceQuantity',
      width: 100,
      title: intl.get(`${commonPrompt}.restSourceQuantity`).d('寻源链路可用数量'),
    },
    {
      name: 'restPoQuantity',
      width: 100,
      title: intl.get(`${commonPrompt}.orderRestPoQuantity`).d('履约链路可用数量'),
    },
    {
      name: 'secondLevelStrategyCode',
      title: intl.get(`${commonPrompt}.secondLevelStrategyCode`).d('寻源链路执行规则'),
    },
    {
      name: 'orderExecuteStatus',
      lookupCode: 'SPRM.PR_ORDER_EXECUTE_STATUS',
      title: intl.get(`${commonPrompt}.orderExecuteStatus`).d('履约链路执行状态'),
      renderer: ({ value, record }) => colorRender(value, record.get('orderExecuteStatusMeaning')),
    },
    {
      name: 'sourceExecuteStatus',
      lookupCode: 'SPRM.PR_SOURCE_EXECUTE_STATUS',
      title: intl.get(`${commonPrompt}.sourceExecuteStatus`).d('寻源链路执行状态'),
      renderer: ({ value, record }) => colorRender(value, record.get('sourceExecuteStatusMeaning')),
    },
    {
      name: 'closeQuantity',
      width: 100,
    },
    {
      name: 'sourceCloseQuantity',
      width: 100,
    },
    {
      name: 'currentCloseQuantity',
      width: 100,
    },
    {
      name: 'currentSourceCloseQuantity',
      width: 100,
    },
    {
      name: 'downsStreamQuantity',
      width: 100,
    },
    {
      name: 'sourceDownsStreamQuantity',
      width: 100,
    },
    { name: 'taxCode', width: 80 },
    { name: 'taxRate', width: 80 },
    {
      name: 'taxIncludedUnitPrice',
      width: 120,
      renderer: ({ text, record }) => {
        return record.get('linePriceHiddenFlag') === 1
          ? record.get('taxIncludedUnitPriceMeaning')
          : text;
      },
    },
    { name: 'unitPriceBatch' },
    {
      name: 'taxIncludedLineAmount',
      width: 120,
      renderer: ({ text, record }) => {
        return record.get('linePriceHiddenFlag') === 1
          ? record.get('taxIncludedUnitPriceMeaning')
          : text;
      },
    },
    {
      name: 'taxIncludedBudgetUnitPrice',
      width: 120,
      renderer: ({ text, record }) => {
        return record.get('linePriceHiddenFlag') === 1
          ? record.get('taxIncludedUnitPriceMeaning')
          : text;
      },
    },

    {
      name: 'secondaryTaxInUnitPrice',
      width: 120,
      renderer: ({ text, record }) => {
        return record.get('linePriceHiddenFlag') === 1
          ? record.get('secondaryTaxInUnitPrice')
          : text;
      },
    },
    { name: 'secondaryUomId', renderer: ({ record }) => record.get('secondaryUomCodeAndName') },
    { name: 'secondaryQuantity' },
    { name: 'budgetAccountName', width: 120 },
    { name: 'budgetIoFlag', width: 100, renderer: ({ value }) => yesOrNoRender(Number(value)) },
    { name: 'neededDate', width: 120 },
    { name: 'supplierName', width: 120 },
    { name: 'companyName', width: 150 },
    { name: 'ouName', width: 150 },
    { name: 'purchaseOrgName', width: 150 },
    { name: 'purchaseAgentName', width: 120 },
    { name: 'invOrganizationName', width: 150 },
    {
      name: 'prRequestedName',
      width: 120,
      renderer: ({ value, record }) =>
        record.get('prRequestedNum') ? `${record.get('prRequestedNum')}-${value}` : value,
    },
    { name: 'remark', width: 120 },
    { name: 'creationDate', width: 140 },
    { name: 'unitName', width: 150 },
    { name: 'prSourcePlatformMeaning', width: 120 },
    { name: 'projectCategoryMeaning', width: 120 },
    { name: 'costName', width: 120 },
    { name: 'accountSubjectName', width: 120 },
    { name: 'projectNum', width: 120 },
    { name: 'projectName', width: 120 },
    {
      name: 'projectTaskId',
      width: 100,
    },
    { name: 'transferredProjectFlag', renderer: ({ value }) => yesOrNoRender(Number(value)) },
    {
      name: 'operatorRecord',
      width: 120,
      renderer: ({ record }) => (
        <a onClick={() => openOperatorRecord({ record })}>
          {intl.get(`hzero.common.button.operating`).d('操作记录')}
        </a>
      ),
    },
  ];

  const getColums = () => {
    if (isNewTeant) {
      lineColumns.splice(0, 0, {
        name: 'operable',
        renderer: ({ record }) => {
          // const { prLineCancelledFlag, prLineClosedFlag } = record.toData();
          return (
            <span>
              {record.get('prLineCancelledFlag') === 1 ? (
                <Tag className={classnames('c7n-tag-yellow')} style={{ border: 0 }}>
                  {intl.get(`${commonPrompt}.cancellable`).d('可取消')}
                </Tag>
              ) : null}
              {record.get('prLineClosedFlag') === 1 ? (
                <Tag className={classnames('c7n-tag-yellow')} style={{ border: 0 }}>
                  {intl.get(`${commonPrompt}.closable`).d('可关闭')}
                </Tag>
              ) : null}
            </span>
          );
        },
      });
    }
    const baseUomInfo =
      uomControl === 1 ? [] : ['secondaryUomId', 'secondaryTaxInUnitPrice', 'secondaryQuantity'];

    if (isOldUser) {
      return lineColumns.filter(
        (item) =>
          ![
            'sourceOccupiedQuantity',
            'restSourceQuantity',
            'orderOccupiedQuantity',
            'restPoQuantity',
            'secondLevelStrategyCode',
            'sourceExecuteStatus',
            'orderExecuteStatus',
            ...baseUomInfo,
          ].includes(item.name)
      );
    }

    return remote.process('SPRM_PURCHASE_PLAFORM_PROCESS_COLUMNS', lineColumns, { currentType: 'controlByLine' });
  };

  const cuxFieldProps = remote.process(
    'SPRM_PURCHASE_PLAFORM_PROCESS_FIELDPROPS',
    {
      companyId: { lovPara: { tenantId: organizationId } },
      tempKey: { lovPara: { tenantId: organizationId } },
      ouId: { lovPara: { tenantId: organizationId }, lovCode: 'SPFM.USER_AUTH.OU' },
      projectTaskId: { lovPara: { tileFlag: 1 } },
    },
    { currentType: 'controlByLine' }
  );


  const handleQuery = ({ params = {} }) => {
    const clearParams = {}; // 清理
    const { _back } = location?.state || {};
    // eslint-disable-next-line no-unused-expressions
    const dataObj = lineDs.queryDataSet?.current?.toData() || {};
    if (dataObj) {
      for (const key in dataObj) {
        if (
          ![
            'multiSelectHeaderNums',
            'multiSelectHeaderAndLineNums',
            'supplierCompanyId',
            'supplierId',
          ].includes(key)
        ) {
          // 排除掉自定义的查询条件
          if (!Object.prototype.hasOwnProperty.call(params, key)) {
            clearParams[key] = undefined;
          }
        }
      }
    }
    // eslint-disable-next-line no-unused-expressions
    lineDs.queryDataSet.current
      ? lineDs.queryDataSet.current.set({
        ...params,
        ...clearParams,
      })
      : lineDs.queryDataSet.loadData([
        {
          ...params,
          ...clearParams,
        },
      ]);

    if (_back === -1 && !init) {
      lineDs.query(lineDs.currentPage);
    } else {
      lineDs.query();
    }
    setInit(true);
  };

  const onChangeField = ({ name, value, record }) => {
    if (name === 'tempKey') {
      if (record.getField(name)?.get('lovCode') === 'SSLM.SUPPLIER_CHOOSE') {
        // eslint-disable-next-line no-unused-expressions
        lineDs.queryDataSet?.current?.set({
          supplierCompanyId: value?.supplierCompanyIds,
          supplierId: value?.extSupplierIds,
        });
      } else {
        // eslint-disable-next-line no-unused-expressions
        lineDs.queryDataSet?.current?.set({
          supplierCompanyId: value?.supplierCompanyId,
          supplierId: value?.supplierId,
        });
      }
    } else if (!value) {
      // eslint-disable-next-line no-unused-expressions
      lineDs.queryDataSet?.current?.set({ [name]: undefined });
    }
  };

  const resetQueryDs = () => {
    // eslint-disable-next-line no-unused-expressions
    lineDs.queryDataSet?.current.reset();
  };

  return (
    <div style={{ height: 'calc(100vh - 254px)' }}>
      {customizeTable(
        {
          code: 'SPRM.PURCHASE_PLAFORM_CONTROLBYLINE.LIST',
        },
        <SearchBarTable
          style={{ maxHeight: 'calc(100% - 22px)' }}
          searchCode="SPRM.PURCHASE_PLAFORM_CONTROLBYLINE.FILTER"
          dataSet={lineDs}
          columns={getColums()}
          data={[]}
          cacheState
          virtual
          virtualCell
          virtualSpin
          pagination={{
            pageSizeOptions: ['10', '20', '50', '100', '200'],
          }}
          searchBarConfig={{
            editorProps: {
              prStatusCode: {
                optionsFilter: (options) =>
                  ['APPROVED', 'ASSIGNED', 'SUSPEND'].includes(options.get('value')),
              },
            },
            left: {
              render: () => (
                <MutlTextFieldSearch
                  name="multiSelectHeaderAndLineNums"
                  dataSet={lineDs}
                  placeholder={intl
                    .get('sprm.common.modal.enterPrNumOrLineNum')
                    .d('请输入采购申请单号-行号')}
                />
              ),
            },
            fieldProps: cuxFieldProps,
            onQuery: handleQuery,
            onClear: resetQueryDs,
            onReset: resetQueryDs,
            onFieldChange: onChangeField,
          }}
        />
      )}
    </div>
  );
};

export default Index;

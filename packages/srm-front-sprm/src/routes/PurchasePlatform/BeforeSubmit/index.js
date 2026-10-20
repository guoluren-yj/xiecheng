import { routerRedux } from 'dva/router';
import React, { useCallback } from 'react';
import intl from 'utils/intl';
import querystring from 'querystring';
import { Tooltip } from 'choerodon-ui';
import { Icon } from 'choerodon-ui/pro';
import { yesOrNoRender } from 'utils/renderer';
import { isFunction } from 'lodash';

import { getCurrentOrganizationId } from 'utils/utils';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import MutlTextFieldSearch from '@/routes/components/MutlTextFieldSearch';
import { colorRender, aiApproveStatusRender } from './../util';
import '../index.less';

const Index = ({ dispatch, customizeTable, lineDs, location, handleLinkOtherUrl, remote }) => {
  const [init, setInit] = React.useState(false);
  const organizationId = getCurrentOrganizationId();
  // 跳转详情
  const handleJumpDetail = useCallback(({ prHeaderId }) => {
    const pathCux = isFunction(handleLinkOtherUrl)
      ? handleLinkOtherUrl({ prHeaderId, type: 'create', location }) || {}
      : {};
    if (pathCux && pathCux?.pathname) {
      dispatch(
        routerRedux.push({
          pathname: pathCux?.pathname,
          search: pathCux?.search,
        })
      );
    } else {
      const search = {
        prHeaderId,
        newFlag: true,
      };
      dispatch(
        routerRedux.push({
          pathname: '/sprm/purchase-platform/creation-detail',
          search: querystring.stringify(search),
        })
      );
    }
  }, []);

  const lineColumns = remote.process(
    'SPRM_PURCHASE_PLAFORM_PROCESS_COLUMNS',
    [
      {
        name: 'rpSourceFlag',
        width: 120,
        renderer: ({ value }) => yesOrNoRender(Number(value)),
      },
      {
        name: 'prStatusCode',
        width: 120,
        renderer: ({ value, record }) => colorRender(value, record.get('prStatusMeaning')),
      },
      {
        name: 'aiApproveStatus',
        width: 130,
        title: intl.get('sprm.common.button.aiCheck').d('智能审核'),
        renderer: aiApproveStatusRender,
      },
      {
        name: 'displayPrNum',
        width: 180,
        renderer: ({ value, record }) => (
          // <a onClick={() => handleJumpDetail({ prHeaderId: record.get('prHeaderId') })}>{value}</a>
          <div className="row-agent-column">
            <a
              onClick={() => handleJumpDetail({ prHeaderId: record.get('prHeaderId') })}
              style={{ paddingRight: '8px' }}
            >
              {value}
            </a>

            {record.get('urgentFlag') === 1 ? (
              <Tooltip title={intl.get(`sprm.common.model.common.urgent`).d('申请加急')}>
                <Icon
                  type="priority"
                  style={{ color: 'red', fontSize: '14px', paddingBottom: '5px' }}
                />
              </Tooltip>
            ) : null}
          </div>
        ),
      },
      {
        name: 'prTypeName',
        width: 150,
        tooltip: 'overflow',
      },
      {
        name: 'title',
        width: 150,
        tooltip: 'overflow',
      },
      {
        name: 'companyName',
        width: 150,
        tooltip: 'overflow',
      },
      {
        name: 'ouName',
        width: 120,
        tooltip: 'overflow',
      },
      {
        name: 'purchaseOrgName',
        width: 200,
        tooltip: 'overflow',
      },
      {
        name: 'purchaseAgentName',
        width: 120,
        tooltip: 'overflow',
      },
      {
        name: 'prRequestedName',
        width: 120,
        renderer: ({ value, record }) =>
          record.get('prRequestedNum') ? `${record.get('prRequestedNum')}-${value}` : value,
      },
      {
        name: 'requestDate',
        width: 140,
      },

      {
        name: 'createByName',
        width: 160,
        tooltip: 'overflow',
      },
      {
        name: 'creationDate',
        width: 140,
        tooltip: 'overflow',
      },
      {
        name: 'unitName',
        width: 150,
        tooltip: 'overflow',
      },
      { name: 'lotNum', width: 100, tooltip: 'overflow' },
      {
        name: 'prSourcePlatformMeaning',
        width: 140,
      },
      {
        name: 'originalCurrency',
        width: 100,
      },
      {
        name: 'amount',
        width: 100,
        renderer: ({ text, record }) =>
          record.get('headerPriceHiddenFlag') === 1 ? record.get('amountMeaning') : text,
      },
      {
        name: 'localCurrency',
        width: 100,
      },
      {
        name: 'localCurrencyNoTaxSum',
        width: 100,
      },
      {
        name: 'remark',
        width: 200,
        tooltip: 'overflow',
      },
    ],

    { currentType: 'beforeSubmit' }
  );

  const cuxFieldProps = remote.process(
    'SPRM_PURCHASE_PLAFORM_PROCESS_FIELDPROPS',
    {
      companyId: { lovPara: { tenantId: organizationId } },
      ouId: { lovPara: { tenantId: organizationId }, lovCode: 'SPFM.USER_AUTH.OU' },
    },
    { currentType: 'beforeSubmit' }
  );

  const handleQuery = ({ params = {} }) => {
    const clearParams = {}; // 清理
    const { _back } = location?.state || {};
    // eslint-disable-next-line no-unused-expressions
    const dataObj = lineDs.queryDataSet?.current?.toData() || {};
    if (dataObj) {
      for (const key in dataObj) {
        if (!['multiSelectHeaderNums', 'multiSelectHeaderAndLineNums'].includes(key)) {
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

  const resetQueryDs = () => {
    // eslint-disable-next-line no-unused-expressions
    lineDs.queryDataSet?.current.reset();
  };

  return (
    <div style={{ height: 'calc(100vh - 254px)' }}>
      {customizeTable(
        {
          code: 'SPRM.PURCHASE_PLAFORM_BEFORESUBMIT.LIST',
        },
        <SearchBarTable
          style={{ maxHeight: 'calc(100% - 22px)' }}
          searchCode="SPRM.PURCHASE_PLAFORM_BEFORESUBMIT.SEARCHBAR"
          dataSet={lineDs}
          columns={lineColumns}
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
                  ['PENDING', 'REJECTED', 'SEND_BACK'].includes(options.get('value')),
              },
            },
            fieldProps: cuxFieldProps,
            left: {
              render: () => (
                <MutlTextFieldSearch
                  name="multiSelectHeaderNums"
                  dataSet={lineDs}
                  placeholder={intl.get('sprm.common.modal.enterPrNum').d('请输入采购申请单号')}
                />
              ),
            },
            onClear: resetQueryDs,
            onReset: resetQueryDs,
            onQuery: handleQuery,
          }}
        />
      )}
    </div>
  );
};

export default Index;

import React, { Fragment, useMemo, useEffect } from 'react';
import { useDataSet, Tooltip } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { Header, Content } from 'components/Page';
import { observer } from 'mobx-react-lite';
import { isEmpty } from 'lodash';
import querystring from 'querystring';
import { yesOrNoRender } from 'utils/renderer';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import { Button } from 'components/Permission';
import formatterCollections from 'utils/intl/formatterCollections';
import SearchBarTable from '@/routes/components/SearchBarTable';
import TableDs from './stores/indexDs';
import { rePushAbnormal, handledAbnormal } from '@/services/budgetAccountService';

// 设置sbdm国际化前缀 - common - model
const commonPrompt = 'sbdm.common.model.common';
// const organizationId = getCurrentOrganizationId();

const Index = function Index(props) {
  const { documentNum: intitDocumentNum, hiddenOprationFlag: hiddenActionFlag } = querystring.parse(props?.location?.search.substr(1)) || {};
  const modalProps = props?.href?.split('?') ? props?.href?.split('?')[1] : '';
  const { documentNum: modelDocumentNum, hiddenOprationFlag } = querystring.parse(modalProps || '') || {}

  const tableDs = useDataSet(() => TableDs(), []);
  useEffect(() => {
    console.log(modalProps);
    tableDs.setQueryParameter('documentNum', intitDocumentNum || modelDocumentNum)
  }, [intitDocumentNum, modelDocumentNum])


  const handleRePushAbnormal = () => {
    const { selected } = tableDs;
    return new Promise((resolve) => {
      rePushAbnormal(selected.map(ele => ele.get('budgetAccountId')))
        .then((res) => {
          if (getResponse(res)) {
            const errorMsgs = res.reduce((a, b) => {
              if (b.errorFlag === 1) {
                const { errorMsg } = b;
                return a + errorMsg;
              } else {
                return a;
              }
            }, '')
            if (errorMsgs) {
              notification.error({
                message: errorMsgs,
              });
            } else {
              notification.success();
            }
            tableDs.unSelectAll();
            tableDs.clearCachedSelected();
            tableDs.query();
          }
        })
        .finally(() => {
          resolve();
        });
    });
  }

  const handleAbnormal = () => {
    const { selected } = tableDs;
    return new Promise((resolve) => {
      handledAbnormal(selected.map(ele => ele.get('budgetAccountId')))
        .then((res) => {
          if (getResponse(res)) {
            tableDs.unSelectAll();
            tableDs.clearCachedSelected();
            tableDs.query();
            notification.success();
          }
        })
        .finally(() => {
          resolve();
        });
    });
  }


  const columns = useMemo(() => {
    return [
      {
        name: 'documentType',
        width: 150,
      },
      {
        name: 'documentNum',
        width: 180,
      },
      {
        name: 'creationDate',
        width: 180,
      },
      {
        name: 'operationType',
        width: 150,
      },
      // {
      //   name: 'lineAmount',
      //   width: 120,
      // },
      {
        name: 'amount',
        width: 150,
      },
      {
        name: 'incomingIdentity',
        width: 120,
      },
      {
        name: 'sourceDocumentNum',
        width: 180,
      },
      {
        name: 'operator',
        width: 150,
      },
      {
        name: 'lotNum',
        width: 180,
      },
      {
        name: 'errorFlag',
        width: 120,
        renderer: ({ value }) => yesOrNoRender(Number(value) ? 1 : 0),
      },
      {
        name: 'budgetType',
        width: 150,
      },
      {
        name: 'rollbackFlag',
        width: 120,
      },
      {
        name: 'rollbackDate',
        width: 150,
      },
    ];
  }, []);

  const HeaderButtons = observer(() => {

    const { selected } = tableDs;

    const disabled = isEmpty(selected) || !selected.every((record) => record.get('budgetType') === 'EXTERNAL' && String(record.get('errorFlag')) === '1')

    return (
      hiddenOprationFlag !== '1' && hiddenActionFlag !== '1'&& <>
        <Tooltip title={intl.get(`${commonPrompt}.rePushAbnormalTip`).d('预算异常调用记录，手动补偿外部系统预算入口，补偿成功后，预算调用状态即恢复正常。仅被调用方为外部系统且异常状态的预算日志支持此操作。点击前，请确认，外部系统已提供异常补偿接口且已正常对接。')}>
          <Button
            type="c7n-pro"
            color="primary"
            funcType="raised"
            onClick={handleRePushAbnormal}
            waitType="debounce"
            disabled={disabled}
            tooltip="none"
            permissionList={[
              {
                code: 'srm.budget.manager.budget-account.button.repush',
                type: 'button',
              },
            ]}
          >
            {intl.get(`${commonPrompt}.rePushAbnormal`).d('重新推送异常')}
          </Button>
        </Tooltip>

        <Tooltip title={intl.get(`${commonPrompt}.handledAbnormalTip`).d('预算异常调用记录已被处理时点击，此按钮不会触发补偿，仅恢复预算调用状态。仅被调用方为外部系统且异常状态的预算日志支持此操作。点击前，请确认，外部系统的预算调用记录已恢复正常。')}>
          <Button
            funcType="flat"
            type="c7n-pro"
            onClick={handleAbnormal}
            waitType="debounce"
            disabled={disabled}
            tooltip="none"
            permissionList={[
              {
                code: 'srm.budget.manager.budget-account.button.handled',
                type: 'button',
              },
            ]}
          >
            {intl.get(`${commonPrompt}.handledAbnormal`).d('异常已处理')}
          </Button>
        </Tooltip>
      </>
    );
  });

  return (
    <Fragment>
      <Header title={intl.get(`${commonPrompt}.BudgetAccount`).d('预算台账')}>
        {/* <ExcelExport
          requestUrl={`/sbdm/v1/${organizationId}/budget-account/export`}
          queryParams={() => getExportParams()}
          buttonText={intl.get('hzero.common.button.export').d('导出')}
          otherButtonProps={{
            icon: 'unarchive',
            type: 'c7n-pro',
            funcType: 'flat',
          }}
        /> */}
        <HeaderButtons />
      </Header>
      <Content>
        <div style={{ height: 'calc(100vh - 190px)' }}>
          <SearchBarTable
            style={{ maxHeight: 'calc(100% - 22px)' }}
            dataSet={tableDs}
            columns={columns}
            searchBarConfig={{
              fuzzyQueryCode: 'documentNum',
              fuzzyQueryName: intl.get(`${commonPrompt}.documentNum`).d('单据编码'),
            }}
          />
        </div>
      </Content>
    </Fragment>
  );
};

export default formatterCollections({
  code: ['sbdm.common'],
})(Index);

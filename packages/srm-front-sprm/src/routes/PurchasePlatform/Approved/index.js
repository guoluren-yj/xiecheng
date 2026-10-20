import { routerRedux } from 'dva/router';
import { Tooltip, Icon } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';
import React, { useCallback } from 'react';
import intl from 'utils/intl';
import classnames from 'classnames';
import querystring from 'querystring';

import { isFunction } from 'lodash';
// import notification from 'utils/notification';
import { yesOrNoRender } from 'utils/renderer';
import { Button } from 'components/Permission';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
// import OperationNewRecord from '@/routes/components/OperationRecordC7N/OperationNewRecord';
import '../index.less';
// import { confirmCopyLine } from '@/services/purchasePlatformService';
// import { fetchDoExecute } from '@/services/purchaseExecutionService.js';
import MutlTextFieldSearch from '@/routes/components/MutlTextFieldSearch';
import abnormal from '@/assets/abnormal.svg';
import { Evaluate } from '../../components/Evaluate/index';
import { colorRender } from './../util';

const commonPrompt = 'sprm.common.model.common';

// const { Item } = Menu;
const Index = ({
  dispatch,
  customizeTable,
  lineDs,
  isNewTeant,
  location,
  handleLinkOtherUrl,
  cuxDisplayNumStyle,
  remote,
}) => {
  // const [erpUpdateFlag, setErpChangeFlag] = useState('0');
  const [init, setInit] = React.useState(false);
  // 跳转详情
  const handleJumpDetail = useCallback((record, type) => {
    const pathCux = isFunction(handleLinkOtherUrl)
      ? handleLinkOtherUrl({ prHeaderId: record.get('prHeaderId'), type: 'cancel', location }) || {}
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
        type: type || 'normal',
      };
      dispatch(
        routerRedux.push({
          pathname:
            record.get('prSourcePlatform') === 'ERP'
              ? `/sprm/purchase-platform/cancelerp-detail/${record.get('prHeaderId')}`
              : `/sprm/purchase-platform/cancel-noerp-detail/${record.get('prHeaderId')}`,
          state: {
            prSourcePlatformCode: record.get('prSourcePlatform'),
            prSourcePlatformMeaning: record.get('prSourcePlatformMeaning'),
          },
          search: querystring.stringify(search),
        })
      );
    }
  }, []);

  // const handleCopy = useCallback(() => {
  //   const dateSelectd = lineDs.current.toData();
  //   confirmCopyLine(dateSelectd).then((res) => {
  //     if (res) {
  //       if (res.failed) {
  //         notification.error({ message: res.message });
  //       } else {
  //         handleJumpDetailNew({ prHeaderId: res.prHeaderId, isCopy: 1 });
  //       }
  //     }
  //   });
  // }, []);

  // 跳转详情
  // const handleJumpDetailNew = useCallback(({ prHeaderId }) => {
  //   const search = {
  //     prHeaderId,
  //     newFlag: true,
  //   };
  //   dispatch(
  //     routerRedux.push({
  //       pathname: '/sprm/purchase-platform/creation-detail',
  //       search: querystring.stringify(search),
  //     })
  //   );
  // }, []);

  const handleChange = (record) => {
    const pathCux = isFunction(handleLinkOtherUrl)
      ? handleLinkOtherUrl({ prHeaderId: record.get('prHeaderId'), type: 'update', location }) || {}
      : {};
    if (record.get('prSourcePlatform') === 'SRM') {
      dispatch(
        routerRedux.push({
          pathname:
            pathCux?.pathname ||
            `/sprm/purchase-platform/cancel-noerp-detail/${record.get('prHeaderId')}`,
          search: 'flag=update',
        })
      );
    } else {
      dispatch(
        routerRedux.push({
          pathname: `/sprm/purchase-platform/cancel-erp-detail/${record.get('prHeaderId')}`,
          search: 'flag=update',
        })
      );
    }
  };

  // 建议操作
  const renderAction = ({ record }) => {
    // const { srmChangeFlag, erpChangeFlag } = changeFlags;
    // 操作按钮
    // const prSourcePlatform = record.get('prSourcePlatform');
    const closeStatusCode = record.get('closeStatusCode');
    const cancelStatusCode = record.get('cancelStatusCode');
    const actions = {
      // copy: (
      //   <Button
      //     type="text"
      //     onClick={handleCopy}
      //     permissionList={[
      //       {
      //         code: `hzero.srm.requirement.prm.pr-platform.ps.copy`,
      //         type: 'button',
      //         meaning: '复制按钮权限',
      //       },
      //     ]}
      //   >
      //     {intl.get('hzero.common.button.copy').d('复制')}
      //   </Button>
      // ),
      cancelHeader: (
        <Button
          type="text"
          onClick={() => handleJumpDetail(record, 'cancel')}
          permissionList={[
            {
              code: `hzero.srm.requirement.prm.pr-platform.ps.control-cancel`,
              type: 'button',
              meaning: '取消按钮权限',
            },
          ]}
        >
          {intl.get(`sprm.purchasePlatform.view.button.cancel`).d('取消')}
        </Button>
      ),
      closeHeader: (
        <Button
          type="text"
          onClick={() => handleJumpDetail(record, 'close')}
          permissionList={[
            {
              code: `hzero.srm.requirement.prm.pr-platform.ps.control-close`,
              type: 'button',
              meaning: '关闭按钮权限',
            },
          ]}
        >
          {intl.get(`sprm.purchasePlatform.view.button.close`).d('关闭')}
        </Button>
      ),
      actionChange: (
        <Button
          type="text"
          onClick={() => handleChange(record, 'change')}
          permissionList={[
            {
              code: `hzero.srm.requirement.prm.pr-platform.ps.change`,
              type: 'button',
              meaning: '变更按钮权限',
            },
          ]}
        >
          {intl.get(`sprm.purchasePlatform.view.button.actionChange`).d('变更')}
        </Button>
      ),
    };

    const approvedOpt = {
      status: ['approved'],
      overlay: [],
    };
    if (record.get('prHeaderChangedFlag') === 1 && record.get('closeStatusCode') !== 'CLOSEDING') {
      approvedOpt.overlay.push('actionChange');
    }
    // if (prSourcePlatform === 'SRM') {
    //   approvedOpt.overlay.push('copy');
    // }
    if (record.get('prHeaderClosedFlag') === 1) {
      approvedOpt.overlay.push('closeHeader');
    }
    if (
      record.get('prHeaderCancelledFlag') === 1 ||
      (!isNewTeant && closeStatusCode === 'UNCLOSED' && cancelStatusCode === 'UNCANCELLED')
    ) {
      approvedOpt.overlay.push('cancelHeader');
    }

    const moreAction = approvedOpt.overlay?.map((ele) => (
      <span style={{ marginRight: '10px' }}>{actions[ele]}</span>
    ));
    return moreAction;
  };

  // 头取消功能
  // const handleHeaderCancel = record => {
  //   const prHeaderId = record.get('prHeaderId');
  //   return Modal.open({
  //     key: Modal.key(),
  //     children: (
  //       <Remark
  //         prHeaderId={prHeaderId}
  //         ref={remarkRef}
  //         required
  //         remarkLabel={intl
  //           .get(`sprm.purchaseRequisitionCancel.view.message.cancelReason`)
  //           .d('取消原因')}
  //       />
  //     ),
  //     closable: true,
  //     onOk: async () => {
  //       const headerInfo = record.toData();
  //       const remarkCurrent = remarkRef.current.saveCurrentData();
  //       const [{ cancelRemark }] = remarkCurrent.toJSONData();
  //       const validateFlag = await remarkCurrent.validate();
  //       if (validateFlag) {
  //         cancel([{ ...headerInfo, cancelledRemark: cancelRemark }]).then(res => {
  //           if (res && !res.failed) {
  //             notification.success();
  //           } else {
  //             notification.error({ message: res.message });
  //           }
  //         });
  //       } else {
  //         return false;
  //       }
  //     },
  //     movable: false,
  //     destroyOnClose: true,
  //     onCancel: () => {},
  //     style: { width: '500px' },
  //   });
  // };

  // 头关闭功能
  // const handleHeaderClose = record => {
  //   const prHeaderId = record.get('prHeaderId');
  //   return Modal.open({
  //     key: Modal.key(),
  //     children: (
  //       <Remark
  //         prHeaderId={prHeaderId}
  //         ref={remarkRef}
  //         required
  //         remarkLabel={intl
  //           .get(`sprm.purchaseRequisitionCancel.view.message.closeReason`)
  //           .d('关闭原因')}
  //       />
  //     ),
  //     closable: true,
  //     onOk: async () => {
  //       const headerInfo = record.toData();
  //       const remarkCurrent = remarkRef.current.saveCurrentData();
  //       const [{ cancelRemark }] = remarkCurrent.toJSONData();
  //       const validateFlag = await remarkCurrent.validate();
  //       if (validateFlag) {
  //         fetchPurchaseClose({ ...headerInfo, closedRemark: cancelRemark }).then(res => {
  //           if (res && !res.failed) {
  //             notification.success();
  //           } else {
  //             notification.error({ message: res.message });
  //           }
  //         });
  //       } else {
  //         return false;
  //       }
  //     },
  //     movable: false,
  //     destroyOnClose: true,
  //     onCancel: () => {},
  //     style: { width: '500px' },
  //   });
  // };

  const lineColumns = [
    {
      name: 'rpSourceFlag',
      width: 120,
      renderer: ({ value }) => yesOrNoRender(Number(value)),
    },
    {
      name: 'prStatusCode',
      width: 150,
      renderer: ({ value, record }) => colorRender(value, record.get('prStatusMeaning')),
    },
    {
      name: 'displayPrNum',
      width: 150,
      renderer: ({ value, record }) => (
        <div className="row-agent-column">
          <a
            onClick={() => handleJumpDetail(record)}
            style={{
              paddingRight: '8px',
              ...(record.get('urgentFlag') === 1 ? cuxDisplayNumStyle || {} : {}),
            }}
          >
            {value}
          </a>
          {record.get('incorrectFlag') === 1 ? (
            <Tooltip title={record.get('incorrectMsg')}>
              <img src={abnormal} alt="img" />
            </Tooltip>
          ) : null}
          {record.get('syncStatus') === 'SYNC_FAILURE' ? (
            <Tooltip title={record.get('syncResponseMsg')}>
              <Icon type="close" style={{ color: 'red', fontSize: '14px', paddingBottom: '5px' }} />
            </Tooltip>
          ) : null}
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
      name: 'operatorRecord',
      width: 150,
      renderer: ({ record }) => renderAction({ record }),
    },
    {
      name: 'changedFlag',
      renderer: ({ value }) => yesOrNoRender(value),
    },
    {
      name: 'title',
      width: 150,
      tooltip: 'overflow',
    },
    {
      name: 'prRequestedName',
      renderer: ({ value, record }) =>
        record.get('prRequestedNum') ? `${record.get('prRequestedNum')}-${value}` : value,
      width: 120,
    },
    {
      name: 'requestDate',
      width: 120,
    },
    {
      name: 'prTypeName',
      width: 150,
    },
    {
      name: 'createByName',
      width: 120,
    },
    {
      name: 'creationDate',
      width: 140,
    },
    {
      name: 'unitName',
      width: 150,
    },
    {
      name: 'companyName',
      width: 150,
      tooltip: 'overflow',
    },
    {
      name: 'ouName',
      width: 150,
      tooltip: 'overflow',
    },
    {
      name: 'purchaseOrgName',
      width: 150,
      tooltip: 'overflow',
    },
    {
      name: 'purchaseAgentName',
      width: 120,
      tooltip: 'overflow',
    },
    {
      name: 'originalCurrency',
      width: 100,
    },
    {
      name: 'amount',
      width: 150,
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
      name: 'prSourcePlatformMeaning',
      width: 150,
    },

    {
      name: 'remark',
      width: 120,
    },
    {
      name: 'prNum',
      width: 150,
    },
    {
      name: 'lotNum',
      width: 120,
    },
    {
      name: 'urgentFlag',
      width: 120,
      renderer: ({ value }) => yesOrNoRender(Number(value)),
    },
    {
      name: 'urgentDate',
      width: 120,
    },
    {
      name: 'closeStatusMeaning',
      width: 120,
      renderer: ({ value, record }) => colorRender(record.get('closeStatusCode'), value),
    },
    {
      name: 'cancelStatusMeaning',
      width: 120,
      renderer: ({ value, record }) => colorRender(record.get('cancelStatusCode'), value),
    },
    {
      name: 'evaluateFlag',
      width: 120,
      renderer: ({ record, dataSet }) => {
        return record.get('prStatusCode') === 'APPROVED' &&
          record.get('cancelStatusCode') === 'UNCANCELLED' ? (
          <Evaluate currentRecord={record} dataSet={dataSet} />
        ) : null;
      },
    },
  ];

  const getColums = () => {
    if (isNewTeant) {
      lineColumns.splice(0, 0, {
        name: 'operable',
        renderer: ({ record }) => {
          const prHeaderCancelledFlag = record.get('prHeaderCancelledFlag');
          const prHeaderClosedFlag = record.get('prHeaderClosedFlag');
          const actionFlag = prHeaderCancelledFlag === 1 || prHeaderClosedFlag === 1;
          return actionFlag ? (
            <span>
              {prHeaderCancelledFlag === 1 ? (
                <Tag className={classnames('c7n-tag-yellow')} style={{ border: 0 }}>
                  {intl.get(`${commonPrompt}.cancellable`).d('可取消')}
                </Tag>
              ) : null}
              {prHeaderClosedFlag === 1 && record.get('prSourcePlatform') !== 'SHOP' ? (
                <Tag className={classnames('c7n-tag-yellow')} style={{ border: 0 }}>
                  {intl.get(`${commonPrompt}.closable`).d('可关闭')}
                </Tag>
              ) : null}
            </span>
          ) : null;
        },
      });
    }
    return remote.process('SPRM_PURCHASE_PLAFORM_PROCESS_COLUMNS', lineColumns, { currentType: 'approved' });
  };

  const cuxFieldProps = remote.process(
    'SPRM_PURCHASE_PLAFORM_PROCESS_FIELDPROPS',
    {},
    { currentType: 'approved' }
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
            'purchasePlatformPrLineStatusCodeList',
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

  const resetQueryDs = () => {
    // eslint-disable-next-line no-unused-expressions
    lineDs.queryDataSet?.current.reset();
  };

  return (
    <div style={{ height: 'calc(100vh - 260px)' }}>
      {/* {renderSearchBar} */}
      {customizeTable(
        {
          code: 'SPRM.PURCHASE_PLAFORM_APPROVED.LIST',
        },
        <SearchBarTable
          style={{ maxHeight: 'calc(100% - 22px)' }}
          searchCode="SPRM.PURCHASE_PLAFORM_APPROVED.SEARCHBAR"
          dataSet={lineDs}
          cacheState
          columns={getColums()}
          data={[]}
          queryFieldsLimit={3}
          virtual
          virtualCell
          virtualSpin
          pagination={{
            pageSizeOptions: ['10', '20', '50', '100', '200'],
          }}
          searchBarConfig={{
            editorProps: {
              prStatusCode: {
                optionsFilter: (options) => ['APPROVED', 'REJECTED'].includes(options.get('value')),
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

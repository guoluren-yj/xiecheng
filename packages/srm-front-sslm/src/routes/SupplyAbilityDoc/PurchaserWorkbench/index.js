/**
 * index.js - 供货能力申请单（采）
 * @date: 2024-05-30
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import React, { Fragment, useCallback, useMemo, useEffect } from 'react';
import { isEmpty, compose } from 'lodash';
import { routerRedux } from 'dva/router';

import { Tabs, DataSet, Modal, Button } from 'choerodon-ui/pro';
import withProps from 'utils/withProps';
import { Header, Content } from 'components/Page';
import SearchBarTable from '_components/SearchBarTable';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import { getResponse, filterNullValueObject } from 'utils/utils';

import {
  tableMaxHeight,
  tableHeight,
  useSetState,
  renderStatus,
  renderC7NAttachmentText,
} from '@/routes/components/utils';
import { dsDeleteData } from '@/routes/components/utils/utils';
import {
  batchApprove,
  batchReject,
  deleteReq,
  fetchTabCount,
} from '@/services/supplyAbilityDocService';
import { operationRecordsModal } from '@/routes/components/OperationRecords';

import { getCommonParams, hanldeCountryChange, getCommonEditorProps } from '../utils/index';
import { getToBeSubmitDs, getApprovalDs, getWholeOrderAllDs } from './stores/getWholeOrderListDS';
import { getLineDetailAllDs } from './stores/getLineDetailListDS';
import { getTabs } from './utils';
import HeaderBtns from './components/ListHeaderBtns';
import AttachmentModal from '../components/CategoryMaterial/AttachmentModal';
import styles from '../index.less';

const { TabPane, TabGroup } = Tabs;

const Index = ({
  customizeTable,
  customizeBtnGroup,
  custLoading,
  paneDsList = {},
  mixObj = {},
  dispatch,
}) => {
  const [state, setState] = useSetState({
    activeKey: mixObj.currentKey || 'toBeSubmitted',
    tabCount: {},
  });
  const tabs = useMemo(() => getTabs(), []);

  const { activeKey, tabCount = {} } = state;

  useEffect(() => {
    const { toBeSubmitted, approving, wholeOrderAll } = paneDsList;
    toBeSubmitted.addEventListener('load', handleDsLoadAfter);
    approving.addEventListener('load', handleDsLoadAfter);
    wholeOrderAll.addEventListener('load', handleDsLoadAfter);
    return () => {
      toBeSubmitted.removeEventListener('load', handleDsLoadAfter);
      approving.removeEventListener('load', handleDsLoadAfter);
      wholeOrderAll.removeEventListener('load', handleDsLoadAfter);
    };
  }, []);

  const handleDsLoadAfter = () => {
    hanldeQueryCount();
  };

  // 查询数量
  const hanldeQueryCount = useCallback(() => {
    fetchTabCount().then(res => {
      if (getResponse(res)) {
        setState({
          tabCount: res,
        });
      }
    });
  }, []);

  const handleTabChange = useCallback(
    key => {
      setState({ activeKey: key });
      // eslint-disable-next-line no-param-reassign
      mixObj.currentKey = key;
      const ds = paneDsList[key];
      if (ds.getState('queryStatus') === 'ready') {
        ds.query(ds.currentPage, {}, false);
      }
    },
    [paneDsList]
  );

  // 行附件
  const handleAttamentModal = useCallback(record => {
    Modal.open({
      key: Modal.key(),
      drawer: true,
      title: intl.get('hzero.common.upload.modal.title').d('附件'),
      style: { width: 1090 },
      closable: true,
      destroyOnClose: true,
      footer: null,
      children: <AttachmentModal isEdit={false} lineRecord={record.toData()} />,
    });
  }, []);

  // 列表删除
  const handDeleteRecord = (record = {}, dataSet) => {
    if (isEmpty(record)) {
      return;
    }
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: intl.get('hzero.common.message.confirm.deleteChooseRecord').d('是否删除选中记录？'),
      onOk: () => {
        const abilityReqId = record.get('abilityReqId');
        deleteReq([abilityReqId]).then(res => {
          if (getResponse(res)) {
            dataSet.query();
          }
        });
      },
    });
  };

  const getColumns = () => {
    const wholeOrderHidden = ['toBeSubmitted', 'approving', 'wholeOrderAll'].includes(activeKey);
    // 操作列
    const showOptionFlag = ['wholeOrderAll'].includes(activeKey);
    const allColumns = [
      {
        name: 'abilityReqStatus',
        width: 120,
        renderer: renderStatus,
      },
      {
        name: 'option',
        width: 160,
        hidden: !showOptionFlag,
        renderer: ({ record, dataSet }) => {
          const { abilityReqStatus, abilityReqId } = record.get([
            'abilityReqStatus',
            'abilityReqId',
          ]);
          const showBtn = ['NEW', 'REJECTED'].includes(abilityReqStatus);
          return (
            <div className={styles['option-btn-wrap']}>
              <Button
                funcType="link"
                hidden={!showBtn}
                onClick={() => {
                  handleJumpDetail(record, 'edit');
                }}
              >
                {intl.get('hzero.common.button.edit').d('编辑')}
              </Button>
              <Button
                funcType="link"
                hidden={!showBtn}
                onClick={() => {
                  handDeleteRecord(record, dataSet);
                }}
              >
                {intl.get('hzero.common.button.delete').d('删除')}
              </Button>
              <Button
                funcType="link"
                onClick={() => {
                  operationRecordsModal({
                    documentType: 'SUPPLY_ABILITY_CHANGE_REQ',
                    documentId: abilityReqId,
                  });
                }}
              >
                {intl.get('hzero.common.button.operating').d('操作记录')}
              </Button>
            </div>
          );
        },
      },
      {
        name: 'abilityReqNum',
        width: 140,
        renderer: ({ value, record }) => {
          const type = activeKey === 'toBeSubmitted' ? 'edit' : 'view';
          return <a onClick={() => handleJumpDetail(record, type)}>{value}</a>;
        },
      },
      {
        name: 'initiateCampMeaning',
        width: 120,
      },
      {
        name: 'supplierCompanyName',
        width: 300,
      },
      {
        name: 'companyName',
        width: 300,
      },
      {
        name: 'createdUserName',
        width: 120,
        hidden: !wholeOrderHidden,
      },
      {
        name: 'creationDate',
        width: 120,
        hidden: !wholeOrderHidden,
      },
      {
        name: 'itemCode',
        hidden: wholeOrderHidden,
      },
      {
        name: 'itemName',
        width: 120,
        hidden: wholeOrderHidden,
      },
      {
        name: 'itemCategoryCode',
        hidden: wholeOrderHidden,
      },
      {
        name: 'itemCategoryName',
        width: 120,
        hidden: wholeOrderHidden,
      },
      {
        name: 'supplyFlag',
        hidden: wholeOrderHidden,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'dateFrom',
        width: 120,
        hidden: wholeOrderHidden,
      },
      {
        name: 'dateTo',
        width: 120,
        hidden: wholeOrderHidden,
      },
      {
        name: 'countryIdMeaning',
        hidden: wholeOrderHidden,
      },
      {
        name: 'regionIdMeaning',
        hidden: wholeOrderHidden,
      },
      {
        name: 'cityIdMeaning',
        hidden: wholeOrderHidden,
      },
      {
        name: 'manufacturer',
        hidden: wholeOrderHidden,
      },
      {
        name: 'adapterProducts',
        hidden: wholeOrderHidden,
      },
      {
        name: 'attachment',
        hidden: wholeOrderHidden,
        renderer: ({ record }) => {
          const { fileCount, abilityChangeLineId } = record.get([
            'fileCount',
            'abilityChangeLineId',
          ]);
          return (
            <a disabled={!abilityChangeLineId} onClick={() => handleAttamentModal(record)}>
              {renderC7NAttachmentText({
                editable: false,
                fileCount,
              })}
            </a>
          );
        },
      },
      {
        name: 'remark',
        hidden: wholeOrderHidden,
      },
    ];

    const columns = allColumns.filter(i => !i.hidden);
    return columns;
  };

  // 跳转详情
  const handleJumpDetail = (record, type) => {
    const abilityReqId = record.get('abilityReqId');
    dispatch(
      routerRedux.push({
        pathname: `/sslm/supply-ability-doc-purchaser/detail/${abilityReqId}/${type}`,
      })
    );
  };

  // 新建
  const handleCreate = () => {
    dispatch(
      routerRedux.push({
        pathname: '/sslm/supply-ability-doc-purchaser/create',
      })
    );
  };

  // 删除
  const handleDelete = dataSet => {
    dsDeleteData({ dataSet });
  };

  const handleExportParams = dataSet => {
    let exportParams = {};
    if (dataSet) {
      const queryData = dataSet.queryDataSet.current.toData();
      const queryParams = filterNullValueObject(queryData);
      const { __dirty, ...others } = queryParams;
      const idsParam = ['wholeOrderAll'].includes(activeKey)
        ? {
            abilityReqIds: dataSet.toJSONData().map(i => i.abilityReqId),
          }
        : {
            abilityChangeLineIds: dataSet.toJSONData().map(i => i.abilityChangeLineId),
          };
      exportParams = {
        ...others,
        ...idsParam,
      };
    }
    return exportParams;
  };

  // 审批通过
  const handleApproved = dataSet => {
    if (dataSet) {
      const selecteData = dataSet.toJSONData();
      if (!isEmpty(selecteData)) {
        Modal.confirm({
          title: intl.get('hzero.common.message.confirm.title').d('提示'),
          children: intl.get('sslm.common.view.message.confirmApprove').d('确认审批通过？'),
          onOk: () => {
            return batchApprove(selecteData).then(res => {
              if (getResponse(res)) {
                dataSet.query(1, {}, false);
              }
            });
          },
        });
      }
    }
  };

  // 审批拒绝
  const handleRefused = dataSet => {
    if (dataSet) {
      const selecteData = dataSet.toJSONData() || [];
      if (!isEmpty(selecteData)) {
        Modal.confirm({
          title: intl.get('hzero.common.message.confirm.title').d('提示'),
          children: intl.get('sslm.common.view.message.confirmReject').d('确认审批拒绝？'),
          onOk: () => {
            return batchReject(selecteData).then(res => {
              if (getResponse(res)) {
                dataSet.query(1, {}, false);
              }
            });
          },
        });
      }
    }
  };

  // 筛选器组件属性
  const getEditorProps = () => {
    const editorProps = {
      ...getCommonEditorProps(),
      abilityReqStatus: {
        optionsFilter: record => {
          if (activeKey === 'toBeSubmitted') {
            return ['NEW', 'REJECTED'].includes(record.get('value'));
          }
          if (activeKey === 'approving') {
            return ['WAIT_APPROVAL', 'APPROVING_WFL', 'REJECTED_WFL'].includes(record.get('value'));
          }
          return true;
        },
      },
    };
    return editorProps;
  };

  // 筛选器字段
  const getFieldProps = () => {
    let fieldProps = {};
    if (activeKey === 'lineDetailAll') {
      fieldProps = {
        ...getCommonParams(),
      };
    }
    return fieldProps;
  };

  // 处理字段变更
  const handleFieldChange = ({ record, name }) => {
    if (activeKey === 'lineDetailAll') {
      hanldeCountryChange({ record, name });
    }
  };

  return (
    <Fragment>
      <Header
        title={intl
          .get('sslm.supplyAbilityDoc.view.title.supplyAbilityDocPurchaser')
          .d('供货能力申请单（采）')}
      >
        <HeaderBtns
          activeKey={activeKey}
          handleCreate={handleCreate}
          handleDelete={handleDelete}
          dataSet={paneDsList[activeKey]}
          customizeBtnGroup={customizeBtnGroup}
          handleExportParams={handleExportParams}
          handleApproved={handleApproved}
          handleRefused={handleRefused}
        />
      </Header>
      <Content>
        <Tabs
          keyboard={false}
          activeKey={activeKey}
          onChange={handleTabChange}
          customizable
          customizedCode="sslm-pur-supply-ability-doc"
        >
          {tabs.map(({ groupTab, tabPane, key: groupKey }) => {
            return (
              <TabGroup tab={groupTab} key={groupKey}>
                {tabPane.map(({ tab, key: paneKey, searchBarCode, tableCode }) => {
                  return (
                    <TabPane
                      tab={tab}
                      key={paneKey}
                      count={!isEmpty(tabCount) && tabCount[paneKey]}
                    >
                      <div style={{ height: tableHeight.hasGroupTab }}>
                        {customizeTable(
                          {
                            code: tableCode,
                          },
                          <SearchBarTable
                            key={paneKey}
                            cacheState
                            dataSet={paneDsList[paneKey]}
                            columns={getColumns()}
                            custLoading={custLoading}
                            searchCode={searchBarCode}
                            searchBarConfig={{
                              editorProps: getEditorProps(),
                              fieldProps: getFieldProps(),
                              onFieldChange: handleFieldChange,
                            }}
                            style={{
                              maxHeight: tableMaxHeight.hasGroupTab,
                            }}
                          />
                        )}
                      </div>
                    </TabPane>
                  );
                })}
              </TabGroup>
            );
          })}
        </Tabs>
      </Content>
    </Fragment>
  );
};

export default compose(
  formatterCollections({
    code: ['sslm.common', 'sslm.supplyAbilityDoc', 'sslm.supplyAbility'],
  }),
  withCustomize({
    unitCode: [
      'SUPPLY_ABILITY_DOC.PURCHASER_WHOLE_ORDER.TO_SUBMIT_LIST', // 整单-待提交
      'SUPPLY_ABILITY_DOC.PURCHASER_WHOLE_ORDER.APPROVAL_LIST', // 整单-审批中
      'SUPPLY_ABILITY_DOC.PURCHASER_WHOLE_ORDER.ALL_LIST', // 整单-全部
      'SUPPLY_ABILITY_DOC.PURCHASER_DETAIL_LIST.ALL_LIST', // 明细-全部
    ],
  }),
  withProps(
    () => {
      const toBeSubmitDs = new DataSet(getToBeSubmitDs());
      const approvalDs = new DataSet(getApprovalDs());
      const wholeOrderAllDs = new DataSet(getWholeOrderAllDs());
      const lineDetailAllDs = new DataSet(getLineDetailAllDs());
      const mixObj = {
        currentKey: 'toBeSubmitted',
      };
      const paneDsList = {
        toBeSubmitted: toBeSubmitDs,
        approving: approvalDs,
        wholeOrderAll: wholeOrderAllDs,
        lineDetailAll: lineDetailAllDs,
      };
      return { paneDsList, mixObj };
    },
    { cacheState: true }
  )
)(Index);

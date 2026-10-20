/* eslint-disable no-shadow */
import React, { Fragment, useEffect, useState, memo, useCallback, useLayoutEffect } from 'react';

import { Tabs } from 'choerodon-ui';
import { DataSet, useDataSet, Modal } from 'choerodon-ui/pro';
import { Header, Content } from 'components/Page';
import { Button } from 'components/Permission';
import ExcelExport from '@/routes/components//ExcelExport';
import cuxRemote from 'hzero-front/lib/utils/remote';

import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import queryString from 'querystring';
import { openTab, closeTab, getTabFromKey } from 'utils/menuTab';
import { observer } from 'mobx-react-lite';
import { compose, isEmpty, isArray, isFunction } from 'lodash';

import intl from 'utils/intl';
import withProps from 'utils/withProps';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse, filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';

import {
  fetchTemplateFields,
  batchSubmit,
  wholeVoid,
  batchLineVoid,
  fetchWholeCount,
  fetchLineCount,
  batchWholeDelete,
  fetchLatestTemplate,
} from '@/services/budgetService';
import { wholeListDs, lineListDs, budgetTemplateLovDs } from './stores/listDs';
import WholeTable from './components/wholeTable';
import LineTable from './components/lineTable';

import { getBugetFieldsConfig } from './hook';
import styles from './index.less';

const { TabPane, TabGroup } = Tabs;
// 设置sbdm国际化前缀 - common - model
const commonPrompt = 'sbdm.common.model.common';
const organizationId = getCurrentOrganizationId();

const Index = ({ dispatch, budget, lovDs, remote }) => {
  const [currentTab, setCurrentTab] = useState(budget.tabType || 'wholeEditing');
  const { getCuxBudgetBtn, getExtraHeaderBtn, setCuxColumns, setCuxColumnsOthers, setCuxEffect } = remote.props.process;

  const [templateFields, setTemplateFields] = useState(budget.templateFields || null);
  const wholeCount = lovDs.getState('wholeCount') || {};
  const lineCount = lovDs.getState('lineCount') || {};
  const [init, setInit] = useState(false);

  const getCount = useCallback(
    curBudgetTemplateCode => {
      fetchWholeCount(curBudgetTemplateCode).then(res => {
        if (getResponse(res)) {
          lovDs.setState({
            wholeCount: res,
          });
        }
      });

      fetchLineCount(curBudgetTemplateCode).then(res => {
        if (getResponse(res)) {
          lovDs.setState({
            lineCount: res,
          });
        }
      });
    },
    [lovDs]
  );

  const editingWholeTableDs = useDataSet(() => wholeListDs({ type: 'editing', getCount }), [
    templateFields,
    getCount,
  ]);
  const effectiveWholeTableDs = useDataSet(() => wholeListDs({ type: 'effective', getCount }), [
    templateFields,
    getCount,
  ]);
  const archivedWholeTableDs = useDataSet(() => wholeListDs({ type: 'archived', getCount }), [
    templateFields,
    getCount,
  ]);
  const editingLineTableDs = useDataSet(() => lineListDs({ type: 'editing', getCount }), [
    templateFields,
    getCount,
  ]);
  const effectiveLineTableDs = useDataSet(() => lineListDs({ type: 'effective', getCount }), [
    templateFields,
    getCount,
  ]);
  const archivedLineTableDs = useDataSet(() => lineListDs({ type: 'archived', getCount }), [
    templateFields,
    getCount,
  ]);
  // 新建
  const handleCreate = (budgetTemplateId, budgetTemplateCode, budgetTemplateDesc) => {
    // document.cookie.addField("budgetTemplateCode", budgetTemplateCode);
    // document.cookie.addField("budgetTemplateDesc", budgetTemplateDesc);
    dispatch(
      routerRedux.push({
        pathname: `/sbud/budget/detail`,
        search: queryString.stringify({
          budgetTemplateCode,
          budgetTemplateDesc,
          budgetTemplateId,
        }),
      })
    );
  };

  // 提交
  const handleBatchSubmit = dataSet => {
    const data = dataSet.selected.map(record => record.toData());
    return new Promise(resolve => {
      batchSubmit(data)
        .then(res => {
          if (getResponse(res)) {
            dataSet.unSelectAll();
            dataSet.clearCachedSelected();
            dataSet.query();
            notification.success();
          }
        })
        .finally(() => {
          resolve();
        });
    });
  };

  // 作废
  const handleVoid = dataSet => {
    const request = currentTab.includes('whole') ? wholeVoid : batchLineVoid;
    const data = dataSet.selected.map(record => record.toData());
    return new Promise(resolve => {
      request(data)
        .then(res => {
          if (getResponse(res)) {
            dataSet.unSelectAll();
            dataSet.clearCachedSelected();
            dataSet.query();
            notification.success();
          }
        })
        .finally(() => {
          resolve();
        });
    });
  };

  const handleDelete = dataSet => {
    Modal.confirm({
      title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
      children: (
        <div>
          {intl.get('hzero.c7nProUI.DataSet.delete_selected_row_confirm').d('确认删除选中行？')}
        </div>
      ),
    }).then(button => {
      if (button === 'ok') {
        const { selected } = dataSet;
        const data = selected.map(record => record.toData());
        return new Promise(resolve => {
          batchWholeDelete(data)
            .then(res => {
              if (getResponse(res)) {
                dataSet.unSelectAll();
                dataSet.clearCachedSelected();
                dataSet.query(undefined, undefined, true);
                notification.success();
              }
            })
            .finally(() => {
              resolve();
            });
        });
      }
    });
  };

  // 导入
  const handleImport = () => {
    const tab = getTabFromKey('/sbud/budget/import-component/SBDM.BUDGET_IMPORT');

    if (tab?.closable) {
      closeTab('/sbud/budget/import-component/SBDM.BUDGET_IMPORT');
      setTimeout(() => {
        openTab({
          key: '/sbud/budget/import-component/SBDM.BUDGET_IMPORT',
          title: 'hzero.common.title.batchImport',
          search: queryString.stringify({
            backPath: `/sbud/budget/list`,
            prefixPatch: '/sbdm',
            action: 'hzero.common.title.batchImport',
            args: JSON.stringify({
              budgetTemplateCode: lovDs.current?.get('budgetTemplateCode'),
            }),
          }),
        });
      }, 100);
    } else {
      openTab({
        key: '/sbud/budget/import-component/SBDM.BUDGET_IMPORT',
        title: 'hzero.common.title.batchImport',
        search: queryString.stringify({
          backPath: `/sbud/budget/list`,
          prefixPatch: '/sbdm',
          action: 'hzero.common.title.batchImport',
          args: JSON.stringify({
            budgetTemplateCode: lovDs.current?.get('budgetTemplateCode'),
          }),
        }),
      });
    }
  };

  const getCurrentTableDs = () => {
    let currentDs;
    switch (currentTab) {
      case 'wholeEditing':
        currentDs = lovDs.getState('editingWholeTableDs') || editingWholeTableDs;
        break;
      case 'wholeEffective':
        currentDs = lovDs.getState('effectiveWholeTableDs') || effectiveWholeTableDs;
        break;
      case 'wholeArchived':
        currentDs = lovDs.getState('archivedWholeTableDs') || archivedWholeTableDs;
        break;
      case 'lineEditing':
        currentDs = lovDs.getState('editingLineTableDs') || editingLineTableDs;
        break;
      case 'lineEffective':
        currentDs = lovDs.getState('effectiveLineTableDs') || effectiveLineTableDs;
        break;
      default:
        currentDs = lovDs.getState('archivedLineTableDs') || archivedLineTableDs;
        break;
    }
    return currentDs;
  };

  // 导出
  const getExportParams = dataSet => {
    const { selected } = dataSet;

    const sourceTab = currentTab.replace(/line|whole/g, '').toLowerCase();
    // eslint-disable-next-line no-unused-expressions
    const queryParams = dataSet.queryDataSet?.current?.toData() || {};

    const { creationDate = {}, validityDate = {}, ...other } = queryParams;
    let budgetLineIds;
    let budgetHeaderIds;

    if (!isEmpty(selected)) {
      if (currentTab.includes('line')) {
        budgetLineIds = selected.map(e => e.get('budgetLineId')).join(',');
      } else {
        budgetHeaderIds = selected.map(e => e.get('budgetHeaderId')).join(',');
      }
    }

    const params = {
      sourceTab,
      ...other,
      ...creationDate,
      ...validityDate,
      ...(dataSet?.queryParameter || {}),
      budgetLineIds,
      budgetHeaderIds,
      exportTemplateType: 'SBDM.BUDGET_DYNAMIC_EXPORT',
    };
    return filterNullValueObject(params);
  };

  // 跳转进详情
  const handleJumpDetail = useCallback(
    (record, type) => {
      const search = record.get(['budgetHeaderId', 'budgetTemplateCode', 'sourceLine']);
      // 编辑中进入编辑页面
      if (currentTab.includes('Editing') || type === 'edit') {
        dispatch(
          routerRedux.push({
            pathname: `/sbud/budget/detail`,
            search: queryString.stringify(search),
          })
        );
      } else {
        let otherParams = {};
        if (currentTab.includes('Effective')) {
          otherParams = {
            status: 'edit',
          };
        }
        dispatch(
          routerRedux.push({
            pathname: `/sbud/budget/read`,
            search: queryString.stringify({ ...search, ...otherParams }),
          })
        );
      }
    },
    [currentTab]
  );

  // 获取模板字段
  const getTemplateFields = curBudgetTemplateCode => {
    fetchTemplateFields(curBudgetTemplateCode).then(res => {
      setInit(true);
      if (getResponse(res)) {
        setTemplateFields(res);
        dispatch({
          type: 'budget/updateState',
          payload: { templateFields: res },
        });
      }
    });
  };

  // 添加动态字段
  const addDynamicFields = dataSet => {
    const { queryDataSet } = dataSet;

    templateFields.forEach(item => {
      const { queryFlag } = item;

      const { gridField, queryField } = getBugetFieldsConfig(item);

      const { name } = gridField;

      if (!dataSet.getField(name)) {
        dataSet.addField(name, gridField);
      }

      if (queryFlag) {
        // 处理查询条件
        if (queryDataSet) {
          if (!queryDataSet.getField(name)) {
            queryDataSet.addField(name, queryField);
            // queryDataSet.props.fields.push(queryField);
          }
        }
      }
    });
  };

  const allDsSetBudgetTemplateCode = value => {
    (lovDs.getState('editingWholeTableDs') || editingWholeTableDs).setQueryParameter(
      'budgetTemplateCode',
      value || null
    );
    (lovDs.getState('effectiveWholeTableDs') || effectiveWholeTableDs).setQueryParameter(
      'budgetTemplateCode',
      value || null
    );
    (lovDs.getState('archivedWholeTableDs') || archivedWholeTableDs).setQueryParameter(
      'budgetTemplateCode',
      value || null
    );
    (lovDs.getState('editingLineTableDs') || editingLineTableDs).setQueryParameter(
      'budgetTemplateCode',
      value || null
    );
    (lovDs.getState('effectiveLineTableDs') || effectiveLineTableDs).setQueryParameter(
      'budgetTemplateCode',
      value || null
    );
    (lovDs.getState('archivedLineTableDs') || archivedLineTableDs).setQueryParameter(
      'budgetTemplateCode',
      value || null
    );
  };

  useEffect(() => {
    const handleUpdate = ({ name, value }) => {
      if (name === 'budgetTemplateLov') {
        if (value) {
          getTemplateFields(value?.budgetTemplateCode);
        } else {
          setTemplateFields(null);
          dispatch({
            type: 'budget/updateState',
            payload: { templateFields: null },
          });
        }
      }
    };
    lovDs.addEventListener('update', handleUpdate);

    setInit(true);

    if (!lovDs?.current?.get('budgetTemplateId')) {
      fetchLatestTemplate().then(res => {
        if (getResponse(res)) {
          const { budgetTemplateId, budgetTemplateCode, budgetTemplateDesc } = res;
          if (budgetTemplateId) {
            // eslint-disable-next-line no-unused-expressions
            lovDs?.current?.set({
              budgetTemplateLov: {
                budgetTemplateId,
                budgetTemplateCode,
                budgetTemplateDesc,
              },
              budgetTemplateId,
              budgetTemplateCode,
              budgetTemplateDesc,
            });
          }
        }
      });
    }

    return () => {
      lovDs.removeEventListener('update', handleUpdate);
      setInit(false);
    };
  }, []);

  // 当模板改变 行ds也将改变
  useLayoutEffect(() => {
    if (templateFields && init) {
      // 对Ds 进行处理
      addDynamicFields(editingLineTableDs);
      addDynamicFields(effectiveLineTableDs);
      addDynamicFields(archivedLineTableDs);
      // 如果tab页签是行

      lovDs.setState({
        editingWholeTableDs,
        effectiveWholeTableDs,
        archivedWholeTableDs,
        editingLineTableDs,
        effectiveLineTableDs,
        archivedLineTableDs,
      });
      allDsSetBudgetTemplateCode(lovDs.current.get('budgetTemplateCode'));
      getCurrentTableDs().query();
    } else {
      allDsSetBudgetTemplateCode(lovDs.current.get('budgetTemplateCode'));
    }
  }, [lovDs, templateFields]);

  useLayoutEffect(() => {
    if (init && lovDs?.current?.get('budgetTemplateId')) {
      setTimeout(() => {
        getCurrentTableDs().query(getCurrentTableDs()?.currentPage);
      }, [50]);
    }
  }, [lovDs, currentTab, init]);

  const HeaderBtn = observer(({ dataSet }) => {
    const { selected } = dataSet;

    const submitDisabled =
      selected?.length &&
      (selected.every(record => ['NEW', 'REJECT'].includes(record.get('budgetHeaderStatus'))) ||
        selected.every(record =>
          ['EDIT', 'EDIT_REJECT'].includes(record.get('budgetHeaderStatus'))
        ));

    // 已审批/调整中/调整审批拒绝

    const voidDisabled =
      selected?.length &&
      (currentTab.includes('whole')
        ? selected.every(record =>
          ['APPROVED', 'EDIT', 'EDIT_REJECT'].includes(record.get('budgetHeaderStatus'))
        )
        : selected.every(
          record =>
            ['APPROVED', 'EDIT', 'EDIT_REJECT'].includes(record.get('budgetLineStatus')) &&
            !record.get('occupiedAmount')
        ));

    const deleteDisabled =
      selected?.length &&
      selected.every(record => ['NEW', 'REJECT'].includes(record.get('budgetHeaderStatus')));

    const budgetBtnShowFlag = ['wholeEffective', 'lineEffective', 'wholeArchived', 'lineArchived'].includes(currentTab);
    const _budegetBtn = (
      budgetBtnShowFlag && (
        <Button
          icon="cancel"
          funcType="flat"
          type="c7n-pro"
          disabled={!voidDisabled}
          onClick={() => handleVoid(dataSet)}
          permissionList={[
            {
              code: 'srm.budget.manager.budget.button.abolished',
              type: 'button',
            },
          ]}
        >
          {intl.get(`${commonPrompt}.budgetVoid`).d('作废')}
        </Button>
      )
    );

    const budegetBtn = getCuxBudgetBtn
      ? getCuxBudgetBtn(_budegetBtn, {
          budgetBtnShowFlag,
          dataSet,
          handleVoid,
          currentTab,
          selected,
          lovDs,
        })
      : _budegetBtn;
    return (
      <>
        <Button
          icon="add"
          type="c7n-pro"
          color="primary"
          funcType="raised"
          onClick={() => {
            handleCreate(
              lovDs.current?.get('budgetTemplateId'),
              lovDs.current?.get('budgetTemplateCode'),
              lovDs.current?.get('budgetTemplateDesc')
            );
          }}
          disabled={!lovDs.current?.get('budgetTemplateCode')}
          permissionList={[
            {
              code: 'srm.budget.manager.budget.button.new',
              type: 'button',
              meaning: '新建按钮权限',
            },
          ]}
        >
          {intl.get('hzero.common.button.create').d('新建')}
        </Button>
        {['wholeEditing', 'wholeEffective'].includes(currentTab) && (
          <Button
            icon="done"
            funcType="flat"
            type="c7n-pro"
            disabled={!submitDisabled}
            onClick={() => handleBatchSubmit(dataSet)}
            permissionList={[
              {
                code: 'srm.budget.manager.budget.button.submit',
                type: 'button',
              },
            ]}
          >
            {intl.get('hzero.common.button.submit').d('提交')}
          </Button>
        )}
        {['wholeEditing'].includes(currentTab) && (
          <Button
            icon="delete_sweep"
            funcType="flat"
            type="c7n-pro"
            disabled={!deleteDisabled}
            onClick={() => handleDelete(dataSet)}
            permissionList={[
              {
                code: 'srm.budget.manager.budget.button.delete',
                type: 'button',
              },
            ]}
          >
            {intl.get('hzero.common.button.batchDelete').d('批量删除')}
          </Button>
        )}
        {budegetBtn}
        <Button
          onClick={handleImport}
          type="c7n-pro"
          funcType="flat"
          className="supplier-import"
          icon="archive"
          disabled={!lovDs.current?.get('budgetTemplateCode')}
          permissionList={[
            {
              code: 'srm.budget.manager.budget.button.import',
              type: 'button',
            },
          ]}
        >
          {intl.get('hzero.common.button.import').d('导入')}
        </Button>
        <ExcelExport
          requestUrl={
            currentTab.includes('whole')
              ? `/sbdm/v1/${organizationId}/budget-header/export${currentTab.includes('Editing') ? '-editing' : ''
              }`
              : `/sbdm/v1/${organizationId}/budget-line/export${currentTab.includes('Editing') ? '-editing' : ''
              }`
          }
          queryParams={() => getExportParams(dataSet)}
          buttonText={
            isArray(dataSet.selected) && isEmpty(dataSet.selected)
              ? intl.get('hzero.common.button.export').d('导出')
              : intl.get(`hzero.common.checkedExport`).d('勾选导出')
          }
          otherButtonProps={{
            icon: 'unarchive',
            type: 'c7n-pro',
            funcType: 'flat',
            disabled: !lovDs.current?.get('budgetTemplateCode'),
            permissionList: [
              {
                code: 'srm.budget.manager.budget.button.export',
                type: 'button',
              },
            ],
          }}
        />
        {getExtraHeaderBtn ? getExtraHeaderBtn({ dataSet, handleVoid, currentTab, selected, lovDs }) : <></>}
      </>
    );
  });

  useEffect(() => {
    if (isFunction(setCuxEffect)) {
      setCuxEffect({ lovDs });
    }
  }, [setCuxEffect]);

  return (
    <Fragment>
      <Header title={intl.get(`${commonPrompt}.BudgetTitle`).d('预算编制')}>
        <HeaderBtn dataSet={getCurrentTableDs()} />
      </Header>
      <Content>
        <Tabs
          className={styles.tabs}
          defaultActiveKey={currentTab}
          activeKey={currentTab}
          onChange={value => {
            setCurrentTab(value);
            dispatch({
              type: 'budget/updateState',
              payload: { tabType: value },
            });
          }}
        >
          <TabGroup tab={intl.get(`${commonPrompt}.budget`).d('预算')} key="wholeTab">
            <TabPane
              tab={<>{intl.get(`${commonPrompt}.editing`).d('编辑中')}</>}
              count={wholeCount.editing}
              key="wholeEditing"
            >
              <WholeTable
                tableDs={lovDs.getState('editingWholeTableDs') || editingWholeTableDs}
                lovDs={lovDs}
                handleJumpDetail={handleJumpDetail}
                type="editing"
                remote={remote}
              />
            </TabPane>
            <TabPane
              tab={<>{intl.get(`${commonPrompt}.effective`).d('已生效')}</>}
              count={wholeCount.effective}
              key="wholeEffective"
            >
              <WholeTable
                tableDs={lovDs.getState('effectiveWholeTableDs') || effectiveWholeTableDs}
                lovDs={lovDs}
                handleJumpDetail={handleJumpDetail}
                type="effective"
                remote={remote}
              />
            </TabPane>
            <TabPane
              tab={<>{intl.get(`${commonPrompt}.archived`).d('已归档/待生效')}</>}
              count={wholeCount.archived}
              key="wholeArchived"
            >
              <WholeTable
                tableDs={lovDs.getState('archivedWholeTableDs') || archivedWholeTableDs}
                lovDs={lovDs}
                handleJumpDetail={handleJumpDetail}
                type="archived"
                remote={remote}
              />
            </TabPane>
          </TabGroup>
          <TabGroup tab={intl.get(`${commonPrompt}.budgetLine`).d('预算行')} key="detailTab">
            <TabPane
              tab={<>{intl.get(`${commonPrompt}.editing`).d('编辑中')}</>}
              count={lineCount.editing}
              key="lineEditing"
            >
              <LineTable
                tableDs={lovDs.getState('editingLineTableDs') || editingLineTableDs}
                lovDs={lovDs}
                handleJumpDetail={handleJumpDetail}
                templateFields={templateFields}
                dispatch={dispatch}
                setCuxColumns={setCuxColumns}
                setCuxColumnsOthers={setCuxColumnsOthers}
                type="editing"
                remote={remote}
              />
            </TabPane>
            <TabPane
              tab={<>{intl.get(`${commonPrompt}.effective`).d('已生效')}</>}
              count={lineCount.effective}
              key="lineEffective"
            >
              <LineTable
                tableDs={lovDs.getState('effectiveLineTableDs') || effectiveLineTableDs}
                lovDs={lovDs}
                handleJumpDetail={handleJumpDetail}
                templateFields={templateFields}
                setCuxColumns={setCuxColumns}
                setCuxColumnsOthers={setCuxColumnsOthers}
                dispatch={dispatch}
                type="effective"
                remote={remote}
              />
            </TabPane>
            <TabPane
              tab={<>{intl.get(`${commonPrompt}.archived`).d('已归档/待生效')}</>}
              count={lineCount.archived}
              key="lineArchived"
            >
              <LineTable
                tableDs={lovDs.getState('archivedLineTableDs') || archivedLineTableDs}
                lovDs={lovDs}
                handleJumpDetail={handleJumpDetail}
                templateFields={templateFields}
                setCuxColumns={setCuxColumns}
                setCuxColumnsOthers={setCuxColumnsOthers}
                dispatch={dispatch}
                type="archived"
                remote={remote}
              />
            </TabPane>
          </TabGroup>
        </Tabs>
      </Content>
    </Fragment>
  );
};

export default compose(
  connect(({ budget }) => ({
    budget,
  })),
  formatterCollections({
    code: ['sbdm.common', 'hzero.c7nProUI'],
  }),
  withProps(
    () => {
      const lovDs = new DataSet(budgetTemplateLovDs());

      return {
        lovDs,
      };
    },
    { cacheState: true }
  )
)(
  memo(
    cuxRemote(
      {
        code: 'SBUD_BUGETING_HEADER_BTN',
        name: 'remote',
      },
      {
        process: {
          getCuxBudgetBtn: undefined,
          getExtraHeaderBtn: undefined,
          setCuxColumns: undefined,
          setCuxColumnsOthers: undefined,
          setListCuxColumns: undefined
        },
      }
    )(observer(Index))
  )
);

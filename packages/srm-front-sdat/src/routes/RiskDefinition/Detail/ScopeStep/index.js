/* eslint-disable react/jsx-indent */
/**
 * 使用范围步骤
 */
import React, { useEffect, useState, useMemo } from 'react';
import intl from 'utils/intl';
import { isEmpty } from 'lodash';
import { getCurrentOrganizationId } from 'utils/utils';
import { Radio } from 'choerodon-ui';
import notification from 'utils/notification';
import { queryIdpValue } from 'services/api';
import { Table, Button, Modal, IntlField, Form, DataSet, Lov } from 'choerodon-ui/pro';

import { getResponse } from '@/utils/utils';
import { fetchScopeDetail, fetchScopeMap } from '@/services/riskDefinitionService';

import CompanyChooseModal from '../CompanyChooseModal';
// import SupplierChooseModal from '../SupplierChooseModal';
import styles from './index.less';

const RadioGroup = Radio.Group;

const companyChooseKey = Modal.key();
// const supplierChooseKey = Modal.key();
const tenantId = getCurrentOrganizationId();

export default function ScopeStep(props) {
  const {
    scopeListDS,
    supplierListDS,
    companyLovDS,
    // supplierLovDS,
    intlDs,
    defineId,
    groupCode,
    onChangeScope = () => {},
    onChangeDefineName = () => {},
    onChangeStepOne = () => {},
    onChangeFlag = () => {},
  } = props;

  const supplierSelectDs = useMemo(
    () =>
      new DataSet({
        autoCreate: true,
        fields: [
          {
            name: 'categoryObj',
            type: 'object',
            lovCode: 'SSLM.SUPPLIER_CATEGORY_PAGE',
            multiple: true,
            noCache: true,
            lovPara: {
              tenantId,
              enabledFlag: 1,
              parentCategoryId: 0,
            },
            textField: 'categoryDescription',
            optionsProps: {
              paging: 'server',
              idField: 'categoryId',
              parentIdField: 'parentCategoryId',
              record: {
                dynamicProps: {
                  selectable: record => record.get('checkFlag'),
                },
              },
              events: {
                select: ({ dataSet, record }) => {
                  // 仅多选时处理联动
                  const parentCategoryId = record.get('parentCategoryId');
                  if (parentCategoryId) {
                    const parentRecord = dataSet.find(
                      rec => rec.get('categoryId') === parentCategoryId
                    );
                    if (parentRecord) {
                      dataSet.select(parentRecord);
                    }
                  }
                },
              },
            },
            transformResponse: (value, data) => {
              const { categoryList } = data;
              if (!isEmpty(categoryList)) {
                return categoryList;
              } else {
                return value;
              }
            },
          },
          {
            name: 'categoryIdList',
            bind: 'categoryObj.categoryId',
          },
        ],
      }),
    []
  );

  const [levelStr, setLevel] = useState('0');
  const [enableFlag, setEnabledFlag] = useState('');
  const [scopeList, setScopeList] = useState([]);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    supplierListDS.addEventListener('select', selectEvent);
    supplierListDS.addEventListener('unSelect', selectEvent);
    supplierListDS.addEventListener('selectAll', selectEvent);
    supplierListDS.addEventListener('unSelectAll', selectEvent);
    scopeListDS.addEventListener('select', selectEvent);
    scopeListDS.addEventListener('unSelect', selectEvent);
    scopeListDS.addEventListener('selectAll', selectEvent);
    scopeListDS.addEventListener('unSelectAll', selectEvent);
    intlDs.addEventListener('update', handleUpdateIntl);

    queryIdpValue('SDAT.RISK_DEFINITION_SCOPE').then(res => {
      if (getResponse(res)) {
        fetchScopeMap().then(result => {
          const scopeActives = [];
          if (getResponse(result) && result.length) {
            result.forEach(item => {
              res.forEach(item2 => {
                if (String(item) === String(item2.value)) {
                  scopeActives.push({ ...item2 });
                }
              });
            });
          }
          setScopeList(scopeActives.sort((a, b) => a.orderSeq - b.orderSeq));
        });
      }
    });

    if (defineId && defineId !== 'add') {
      fetchScopeDetail({ tenantId: getCurrentOrganizationId(), defineId, groupCode }).then(res => {
        if (getResponse(res)) {
          setLevel(res?.scope ?? '0');
          onChangeStepOne({ ...res });
          onChangeScope(res?.scope ?? '0');
          onChangeFlag(res?.enableFlag ?? '');
          setEnabledFlag(String(res?.enableFlag ?? ''));
          const lineList = res.lineList && res.lineList.length ? res.lineList : [];
          const scopeVal = res?.scope ?? '0';
          intlDs.data = [{ ...res }];
          onChangeDefineName({ ...res });
          if (lineList.length) {
            if ([1, '1'].includes(scopeVal)) {
              scopeListDS.data = [...lineList];
            } else if ([2, '2'].includes(scopeVal)) {
              supplierListDS.data = [...lineList];
            }
          }
        }
      });
    }

    return () => {
      scopeListDS.data = [];
      supplierListDS.data = [];
      scopeListDS.reset();
      supplierListDS.reset();
      supplierListDS.removeEventListener('select', selectEvent);
      supplierListDS.removeEventListener('unSelect', selectEvent);
      supplierListDS.removeEventListener('selectAll', selectEvent);
      supplierListDS.removeEventListener('unSelectAll', selectEvent);
      scopeListDS.removeEventListener('select', selectEvent);
      scopeListDS.removeEventListener('unSelect', selectEvent);
      scopeListDS.removeEventListener('selectAll', selectEvent);
      scopeListDS.removeEventListener('unSelectAll', selectEvent);
      intlDs.removeEventListener('update', handleUpdateIntl);
    };
  }, []);

  useEffect(() => {
    if (refresh) {
      setRefresh(false);
    }
  }, [refresh]);

  /**
   * 更新事件
   */
  const handleUpdateIntl = ({ dataSet }) => {
    const list = dataSet?.toData() ?? [];
    const param = list.length ? list[0] : {};
    onChangeDefineName(param);
  };

  const selectEvent = () => {
    setRefresh(true);
  };

  const handleChangeRadio = e => {
    const value = e?.target?.value ?? '0';
    setLevel(value);
    onChangeScope(value);
  };

  /**
   * 打开选择公司的侧边弹窗
   */
  const openChooseModal = () => {
    let modal = null;
    const ids = scopeListDS.map(rcd => rcd.get('companyId'));

    const handleCloseModal = () => {
      if (modal) {
        companyLovDS.data = [];
        companyLovDS.reset();
        modal.close();
      }
    };

    const handleCreateItem = () => {
      if (companyLovDS.selected.length) {
        companyLovDS.selected.forEach(record => {
          scopeListDS.create(
            {
              companyName: record?.get('companyName') ?? '',
              companyCode: record?.get('companyCode') ?? '',
              companyId: record?.get('companyId') ?? '',
            },
            0
          );
        });
        modal.close();
      } else {
        notification.warning({
          message: intl.get('hzero.common.message.confirm.title').d('提示'),
          description: intl
            .get('sdat.riskDefinition.view.message.mustSelectOneOrMore')
            .d('请至少选择一个公司'),
        });
      }
    };

    modal = Modal.open({
      title: intl.get('sdat.riskDefinition.view.title.chooseCompany').d('选择公司'),
      children: <CompanyChooseModal companyLovDS={companyLovDS} selectedIds={ids} />,
      key: companyChooseKey,
      closable: false,
      drawer: true,
      mask: true,
      resizable: true,
      style: { width: '860px' },
      header: null,
      footer: (
        <div>
          <Button color="primary" onClick={handleCreateItem}>
            {intl.get(`hzero.common.button.ok`).d('确定')}
          </Button>
          <Button onClick={handleCloseModal}>
            {intl.get(`hzero.common.button.cancel`).d('取消')}
          </Button>
        </div>
      ),
    });
  };

  /**
   * 删除数据
   */
  const handleDeleteItem = () => {
    if (scopeListDS.selected.length) {
      Modal.confirm({
        title: intl.get('hzero.common.message.confirm.title').d('提示'),
        children: (
          <div>
            {intl.get('sdat.riskDefinition.view.message.isConfirmDelete').d('是否确认删除选中行')}
          </div>
        ),
      }).then(async button => {
        if (button === 'ok') {
          scopeListDS.delete(scopeListDS.selected, false);
        }
      });
    }
  };

  const columns = () => {
    return [
      {
        name: 'companyCode',
        width: 300,
      },
      {
        name: 'companyName',
      },
    ];
  };

  const supplierColumns = () => {
    return [
      {
        name: 'companyCode',
        width: 300,
      },
      {
        name: 'categoryDescription',
      },
    ];
  };

  const buttons = () => {
    return enableFlag === '1'
      ? []
      : [
          <Button
            key="create"
            funcType="flat"
            icon="playlist_add"
            disabled={enableFlag === '1'}
            onClick={openChooseModal}
          >
            {intl.get('hzero.common.button.add').d('新增')}
          </Button>,
          <Button
            key="delete"
            funcType="flat"
            icon="delete_sweep"
            disabled={!scopeListDS.selected.length}
            onClick={handleDeleteItem}
          >
            {intl.get('hzero.common.button.batchDelete').d('批量删除')}
          </Button>,
        ];
  };

  /**
   * 打开选择供应商的侧边弹窗
   */
  // const openChooseSupplierModal = () => {
  //   let modal = null;
  //   const ids = supplierListDS.map(rcd => rcd.get('categoryId'));

  //   const handleCloseModal = () => {
  //     if (modal) {
  //       supplierLovDS.data = [];
  //       supplierLovDS.reset();
  //       modal.close();
  //     }
  //   };

  //   const handleCreateItem = () => {
  //     if (supplierLovDS.selected.length) {
  //       supplierLovDS.selected.forEach(record => {
  //         supplierListDS.create(
  //           {
  //             companyCode: record?.get('categoryCode') ?? '',
  //             categoryDescription: record?.get('categoryDescription') ?? '',
  //             companyId: record?.get('categoryId') ?? '',
  //           },
  //           0
  //         );
  //       });
  //       modal.close();
  //     } else {
  //       notification.warning({
  //         message: intl.get('hzero.common.message.confirm.title').d('提示'),
  //         description: intl
  //           .get('sdat.riskDefinition.view.message.mustSelectOneOrMoreSupplier')
  //           .d('请至少选择一个供应商'),
  //       });
  //     }
  //   };

  //   modal = Modal.open({
  //     title: intl.get('sdat.riskDefinition.view.title.chooseSupplier').d('选择供应商'),
  //     children: <SupplierChooseModal companyLovDS={supplierLovDS} selectedIds={ids} />,
  //     key: supplierChooseKey,
  //     closable: false,
  //     drawer: true,
  //     mask: true,
  //     resizable: true,
  //     style: { width: '860px' },
  //     header: null,
  //     footer: (
  //       <div>
  //         <Button color="primary" onClick={handleCreateItem}>
  //           {intl.get(`hzero.common.button.ok`).d('确定')}
  //         </Button>
  //         <Button onClick={handleCloseModal}>
  //           {intl.get(`hzero.common.button.cancel`).d('取消')}
  //         </Button>
  //       </div>
  //     ),
  //   });
  // };

  /**
   * 删除数据
   */
  const handleDeleteSupplier = () => {
    if (supplierListDS.selected.length) {
      Modal.confirm({
        title: intl.get('hzero.common.message.confirm.title').d('提示'),
        children: (
          <div>
            {intl.get('sdat.riskDefinition.view.message.isConfirmDelete').d('是否确认删除选中行')}
          </div>
        ),
      }).then(async button => {
        if (button === 'ok') {
          supplierListDS.delete(supplierListDS.selected, false);
        }
      });
    }
  };

  const handleSelectSupplier = list => {
    if (list.length) {
      list.forEach(record => {
        supplierListDS.create(
          {
            companyCode: record?.get('categoryCode') ?? '',
            categoryDescription: record?.get('categoryDescription') ?? '',
            companyId: record?.get('categoryId') ?? '',
          },
          0
        );
      });
    } else {
      notification.warning({
        message: intl.get('hzero.common.message.confirm.title').d('提示'),
        description: intl
          .get('sdat.riskDefinition.view.message.mustSelectOneOrMoreSupplier')
          .d('请至少选择一个供应商'),
      });
    }
  };

  const supplierButtons = () => {
    return enableFlag === '1'
      ? []
      : [
          // <Button
          //   key="create"
          //   funcType="flat"
          //   icon="playlist_add"
          //   disabled={enableFlag === '1'}
          //   onClick={openChooseSupplierModal}
          // >
          //   {intl.get('hzero.common.button.add').d('新增')}
          // </Button>,
          <Lov
            dataSet={supplierSelectDs}
            name="categoryObj"
            mode="button"
            clearButton={false}
            key="create"
            icon="playlist_add"
            searchFieldInPopup
            onOption={() => {
              return {
                disabled: enableFlag === '1',
              };
            }}
            tableProps={{
              // mode: 'tree',
              treeAsync: true,
              alwaysShowRowBox: true,
              selectionMode: 'rowbox',
              onRow: ({ record: tableRecord }) => {
                const nodeProps = { disabled: false };
                if (tableRecord.get('hasChild') === 0) {
                  nodeProps.isLeaf = true;
                }
                return nodeProps;
              },
            }}
            modalProps={{
              destroyOnClose: true,
              afterClose: () => {
                supplierSelectDs.loadData([]);
                supplierSelectDs.clearCachedSelected();
                supplierSelectDs.reset();
              },
            }}
            onBeforeSelect={handleSelectSupplier}
          >
            {intl.get('hzero.common.button.add').d('新增')}
          </Lov>,
          <Button
            key="delete"
            funcType="flat"
            icon="delete_sweep"
            disabled={!supplierListDS.selected.length}
            onClick={handleDeleteSupplier}
          >
            {intl.get('hzero.common.button.batchDelete').d('批量删除')}
          </Button>,
        ];
  };

  return (
    <div className={styles['scope-step-basic']}>
      <div style={{ fontSize: '16px', fontWeight: '500', color: '#1D2129' }}>
        {intl.get(`sdat.riskDefinition.model.applicationScope`).d('基础信息')}
      </div>

      <div style={{ fontSize: '12px', color: '#1D2129', fontWeight: '500', marginTop: '32px' }}>
        {intl.get(`sdat.riskDefinition.model.defineName`).d('风险定义标题')}
      </div>
      <div style={{ marginTop: '8px', fontWeight: '500' }}>
        <Form dataSet={intlDs} columns={1} style={{ width: '200px' }}>
          <IntlField
            // placeholder={intl
            //   .get('sdat.riskDefinition.view.placeholder.inputRiskTitle')
            //   .d('请输入风险定义标题')}
            name="defineName"
          />
        </Form>
      </div>

      <div style={{ fontSize: '12px', color: '#1D2129', marginTop: '32px', fontWeight: '500' }}>
        {intl.get('sdat.riskDefinition.model.applicationArea').d('适用范围')}
      </div>
      <div style={{ marginTop: '16px', fontWeight: '500' }}>
        <RadioGroup
          value={`${levelStr}`}
          disabled={enableFlag === '1'}
          onChange={handleChangeRadio}
        >
          {scopeList.map(item => {
            return (
              <Radio key={item.value} value={item.value}>
                {item.meaning}
              </Radio>
            );
          })}
        </RadioGroup>
      </div>

      {['1', 1].includes(levelStr) ? (
        <div style={{ marginTop: '16px', height: 'calc(100vh - 338px)' }}>
          <Table
            dataSet={scopeListDS}
            columns={columns()}
            queryBar="none"
            showRemovedRow={false}
            buttons={buttons()}
            selectionMode={[1, '1'].includes(enableFlag) ? 'none' : 'rowbox'}
            autoHeight={{ type: 'maxHeight', diff: 20 }}
            customizable
            customizedCode="SDAT.RISK_DEFINITION_SCOPE_COMPANY_LIST"
          />
        </div>
      ) : null}

      {['2', 2].includes(levelStr) ? (
        <div style={{ marginTop: '16px', height: 'calc(100vh - 338px)' }}>
          <Table
            dataSet={supplierListDS}
            columns={supplierColumns()}
            queryBar="none"
            showRemovedRow={false}
            buttons={supplierButtons()}
            selectionMode={[1, '1'].includes(enableFlag) ? 'none' : 'rowbox'}
            autoHeight={{ type: 'maxHeight', diff: 20 }}
            customizable
            customizedCode="SDAT.RISK_DEFINITION_SCOPE_SUPPLIER_LIST"
          />
        </div>
      ) : null}
    </div>
  );
}

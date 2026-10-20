/*
 * 推荐物料/品类
 * @date: 2023/10/19
 * @author: zlh
 * @version: 0.0.1
 * @copyright Copyright (c) 2023, Hand
 */
import React, { useCallback, useState, useEffect } from 'react';
import { useObserver } from 'mobx-react-lite';
import { isEmpty } from 'lodash';
import classnames from 'classnames';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { Spin, Button, Modal, Lov, DataSet, Menu, Icon } from 'choerodon-ui/pro';
import DynamicButtons from '_components/DynamicButtons';
import '@/routes/index.less';
import SearchBarTable from '_components/SearchBarTable';
import { renderC7NAttachmentText, renderStatus } from '@/routes/components/utils';
import { filterNullValueObject, getCurrentOrganizationId, getResponse } from 'utils/utils';
import moment from 'moment';
import { yesOrNoRender } from 'utils/renderer';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';

import {
  queryBatchApprovalHistory,
  renderApproveProgress,
} from '@/routes/components/WorkFlowApproval';

import CategoryMaterialModal from './CategoryMaterialModal';
import AttachmentModal from './AttachmentModal';
import { getItemDs, getCategoryDs } from './CategoryMaterialModal/stores/getItemDS';
import styles from '../../index.less';

let categoryMaterialModal;
let attachmentModal;

let categoryMaterialSearchRef = null;

const organizationId = getCurrentOrganizationId();
const batchEditFormCode = 'SSLM.SUPPLIER_ABLILITY_MANAGE.DETAIL.CATEGORY_MATERIALS_BATCH_EDIT_FORM';

const CategoryMaterial = ({
  remote,
  supplyAbilityId,
  dataSet,
  customizeTable,
  customizeUnitCode,
  customizeSearchCode,
  customizeBtnGroupCode,
  isCompanyDimension,
  customizeForm,
  readOnlyFlag,
  customizeBtnGroup,
  custLoading,
  onExpand,
  handleSaveBatchLine,
  isEdit,
  isCreat,
  isReviewFlag, // 是否需要评审
  isGroupManageFlag, // 是否集团级管控
  optional,
  handleSubmit = () => {},
  refreshData = () => {},
  refreshAll = () => {},
  handleSave = () => {},
  showApproveProgress = false, // 展示审批进度
  detailRemote,
}) => {
  const [editFlag, setEditFlag] = useState(isEdit);
  const [approvalInfo, setApprovalInfo] = useState({});

  const { approvalHistoryMap = {} } = approvalInfo;

  useEffect(() => {
    setEditFlag(isEdit);
  }, [supplyAbilityId, isEdit]);

  useEffect(() => {
    if (showApproveProgress) {
      dataSet.addEventListener('load', handleDsLoadAfter);
    }
    return () => {
      if (showApproveProgress) {
        dataSet.removeEventListener('load', handleDsLoadAfter);
      }
    };
  }, [showApproveProgress, dataSet]);

  const handleDsLoadAfter = (dataSetProps = {}) => {
    const { dataSet: ds } = dataSetProps;
    const businessKeys = ds.filter(r => r.get('businessKey')).map(r => r.get('businessKey'));
    queryBatchApprovalHistory(businessKeys).then(response => {
      if (response) {
        setApprovalInfo({
          approvalHistoryMap: response,
        });
      }
    });
  };

  const handleAttamentModal = useCallback((record, isEditFlag) => {
    attachmentModal = Modal.open({
      key: Modal.key(),
      drawer: true,
      title: intl.get('hzero.common.upload.modal.title').d('附件'),
      style: { width: 1090 },
      closable: true,
      destroyOnClose: true,
      footer: null,
      children: (
        <AttachmentModal
          isEdit={isEditFlag}
          LineRecord={record.toData()}
          optional={optional}
          modal={attachmentModal}
          refreshData={refreshData}
        />
      ),
    });
  }, []);

  const handleQuery = useCallback((queryProps = {}) => {
    if (supplyAbilityId) {
      const { params } = queryProps;
      if (dataSet.queryDataSet?.current) {
        const clearParams = {}; // 清理
        const dataObj = dataSet.queryDataSet.current.toData();
        if (dataObj) {
          for (const key in dataObj) {
            if (!['multiSelectReqNums'].includes(key)) {
              // 排除掉自定义的查询条件
              if (!Object.prototype.hasOwnProperty.call(params, key)) {
                clearParams[key] = undefined;
              }
            }
          }
        }
        // 处理多单号
        const reqList = params.changeReqNumber;
        clearParams.changeReqNumber = isEmpty(reqList) ? null : reqList.join(',');
        dataSet.queryDataSet.current.set({
          ...params,
          ...clearParams,
        });
        dataSet.query();
      } else if (categoryMaterialSearchRef) {
        // handleQuery 内部会触发我们的handleQuery方法
        categoryMaterialSearchRef.handleQuery(true);
      } else {
        dataSet.query();
      }
    }
  }, []);

  /**
   * 批量编辑保存
   */
  const handleBatchEditSave = useCallback((formValues = {}) => {
    const selectedRows = dataSet.selected?.map(item => item.toData()) || [];
    // 批量编辑表单参数
    const fieldsValuesObj = {
      ...formValues,
      dateFrom: formValues.dateFrom && moment(formValues.dateFrom).format(DEFAULT_DATE_FORMAT),
      dateTo: formValues.dateTo && moment(formValues.dateTo).format(DEFAULT_DATE_FORMAT),
    };
    const formData = filterNullValueObject(fieldsValuesObj);
    if (isEmpty(formData)) {
      // 关闭弹窗
      categoryMaterialModal.close();
    }
    let payload = {};
    if (isEmpty(selectedRows)) {
      // 全量保存
      // 获取新增的行
      const createLines = dataSet
        .filter(item => !item.data.abilityLineId)
        .map(item => item.toData());
      // 获取查询参数
      const queryParam = dataSet.getQueryParameter();
      payload = {
        selectAllFlag: 1,
        supplyAbilityLineUpDTO: formData,
        lineQueryParam: queryParam,
        supplyAbilityLines: createLines,
        customizeUnitCode: batchEditFormCode,
      };
    } else {
      const saveLineData = dataSet.selected.map(item => {
        const { inventoryOrganizationId, dateFrom, dateTo, ...otherItem } = item.data;
        /** 处理入参字段
         *  1、库存组织多选值集传参数，入参需要字符
         *  2、处理日期格式
         */
        const handParams = {
          inventoryOrganizationId: !isEmpty(inventoryOrganizationId)
            ? inventoryOrganizationId.map(n => n.organizationId).join(',')
            : null,
          dateFrom: dateFrom && moment(dateFrom).format(DEFAULT_DATE_FORMAT),
          dateTo: dateTo && moment(dateTo).format(DEFAULT_DATE_FORMAT),
        };
        return { ...handParams, ...otherItem, ...formData };
      });

      payload = {
        selectAllFlag: 0,
        supplyAbilityLines: saveLineData,
        customizeUnitCode: batchEditFormCode,
      };
    }
    handleSaveBatchLine(payload);
    // 关闭弹窗
    categoryMaterialModal.close();
  }, []);

  const openCategoryMaterialModal = isAllSelectFlag => {
    categoryMaterialModal = Modal.open({
      key: Modal.key(),
      title: intl.get('sslm.supplyAbility.view.message.category.edit').d('编辑品类物料'),
      style: { width: 380 },
      className: styles.createModal,
      bodyStyle: {
        padding: 0,
        overflow: 'hidden',
      },
      closable: true,
      destroyOnClose: true,
      drawer: true,
      footer: null,
      children: (
        <CategoryMaterialModal
          isAllSelectFlag={isAllSelectFlag}
          handleBatchEditSave={handleBatchEditSave}
          customizeForm={customizeForm}
          custLoading={custLoading}
          modal={categoryMaterialModal}
          isEdit={editFlag}
          tableDs={dataSet}
          customizeUnitCode={batchEditFormCode}
        />
      ),
    });
  };

  /**
   * 推荐物料/品类弹窗
   * */
  const handleBatchEdit = useCallback(async () => {
    // 全量批量编辑标识
    const isAllSelectFlag = isEmpty(dataSet.selected);
    // 是否有新建行
    let hasCreatStatus = false;
    if (isAllSelectFlag) {
      hasCreatStatus = !isEmpty(dataSet.records.filter(i => !i.data.abilityLineId));
      if (hasCreatStatus) {
        // 有新建行，先进行保存操作
        handleSave().then(res => {
          if (getResponse(res)) {
            openCategoryMaterialModal(isAllSelectFlag);
          }
        });
      } else {
        openCategoryMaterialModal(isAllSelectFlag);
      }
    } else {
      hasCreatStatus = !isEmpty(dataSet.selected.filter(i => !i.data.abilityLineId));
      if (hasCreatStatus) {
        notification.warning({
          message: intl
            .get('sslm.supplyAbility.view.message.notification.newDataWarning')
            .d('勾选行有未保存的数据，请保存后再进行操作！'),
        });
      } else {
        openCategoryMaterialModal(isAllSelectFlag);
      }
    }
  }, []);

  // 批量新增供应商分类确认回调-按物料
  const addMaterialCategory = useCallback(
    (records = [], type) => {
      let addList = [];
      if (type === 'create') {
        addList = [
          {
            tenantId: organizationId,
          },
        ];
      } else if (type === 'createByMaterial') {
        addList = records.map(record => {
          const recordData = record.toData();
          const { categoryCode, categoryName, categoryId, itemCode, itemId, itemName } = recordData;
          return {
            itemId,
            itemCode,
            itemName,
            supplyFlag: 1,
            itemCategoryId: categoryId || null,
            itemCategoryCode: categoryCode,
            itemCategoryName: categoryName,
            tenantId: organizationId,
          };
        });
        // 二开处理批量新建物料带值
        addList = detailRemote
          ? detailRemote.process('SSLM_SUPPLY_ABILITY_MANAGE_DETAIL_BATCH_CREATE_ITEM', addList, {
              selectedItemRecords: records,
            })
          : addList;
      } else if (type === 'createByCategory') {
        addList = records.map(record => {
          const recordData = record.toData();
          const { categoryCode, categoryName, categoryId, itemCode, itemId, itemName } = recordData;
          return {
            itemId,
            itemCode,
            itemName,
            supplyFlag: 1,
            itemCategoryId: categoryId || null,
            itemCategoryCode: categoryCode,
            itemCategoryName: categoryName,
            tenantId: organizationId,
          };
        });
      }
      addList.forEach(record => {
        dataSet.create({ ...record, supplyFlag: 1 }, 0);
      });
    },
    [dataSet]
  );

  // 一键拓展回调
  const handleExpand = useCallback(() => {
    const hasCreatStatus = !isEmpty(dataSet.selected.filter(i => !i.data.abilityLineId));
    if (hasCreatStatus) {
      notification.warning({
        message: intl
          .get('sslm.supplyAbility.view.message.notification.newDataWarning')
          .d('勾选行有未保存的数据，请保存后再进行操作！'),
      });
      return;
    }
    const selectedRows = dataSet.selected.map(item => item.toData());
    onExpand(selectedRows);
  }, []);

  // 操作按钮集合
  const getButtons = useCallback(() => {
    // 未勾选数据标识
    const unCheckedFlag = useObserver(() => isEmpty(dataSet.selected));

    // 评审中、已评审状态 不允许提交评审
    const isDisabledStatus = useObserver(
      () =>
        !isEmpty(
          dataSet.selected.filter(i =>
            ['REVIEWED', 'REVIEWING'].includes(i.data.supplyReviewStatus)
          )
        )
    );
    // 提交评审 禁用标识
    const submitDisabledFlag = unCheckedFlag || isDisabledStatus;

    // 评审中状态单据不允许批量编辑
    const isDisabledBatchEdit = unCheckedFlag
      ? useObserver(
          () => !isEmpty(dataSet.filter(i => ['REVIEWING'].includes(i.data.supplyReviewStatus)))
        )
      : useObserver(
          () =>
            !isEmpty(
              dataSet.selected.filter(i => ['REVIEWING'].includes(i.data.supplyReviewStatus))
            )
        );
    // 全量批量编辑-不允许评估中状态
    const allBatchEditFlag = unCheckedFlag && isDisabledBatchEdit;
    // 勾选批量编辑-不允许评估中状态
    const selectBatchEditFlag = !unCheckedFlag && isDisabledBatchEdit;
    // 批量编辑 禁用标识
    const batchEditDisabled = isEmpty(dataSet) || allBatchEditFlag || selectBatchEditFlag;

    // 批量删除回调
    const handDelete = async () => {
      if (remote && remote.event) {
        // 默认返回true,当返回false时走二开逻辑不走标准逻辑
        const res = await remote.event.fireEvent('cuxCategoryDelete', { dataSet, refreshAll });
        if (!res) {
          return;
        }
      }
      const removeList = dataSet.selected.filter(item => item.data.abilityLineId);
      if (!isEmpty(removeList)) {
        dataSet
          .delete(dataSet.selected, {
            title: intl.get('hzero.common.message.confirm.title').d('提示'),
            children: intl
              .get('sslm.common.view.message.sureDeleteRefresh')
              .d('删除后会刷新页面，其他新建未保存的数据将丢失，请确认是否继续删除？'),
          })
          .then(res => {
            const resp = getResponse(res);
            if (resp) {
              refreshAll();
            }
          });
      } else {
        dataSet.remove(dataSet.selected);
      }
    };

    const btns = [
      {
        name: 'add',
        group: true,
        child: (
          <Button icon="playlist_add" funcType="flat">
            {intl.get(`hzero.common.button.add`).d('新增')}
            <Icon type="expand_more" style={{ fontSize: 16, marginTop: -2, marginRight: 0 }} />
          </Button>
        ),
        children: [
          {
            name: 'create',
            child: intl.get(`sslm.common.button.manualCreate`).d('手工新增'),
            btnProps: {
              onClick: () => addMaterialCategory([], 'create'),
              funcType: 'flat',
              icon: 'playlist_add',
            },
          },
          {
            name: 'createByMaterial',
            btnComp: MaterialBtn,
          },
          {
            name: 'createByCategory',
            btnComp: CategoryBtn,
          },
        ],
      },
      {
        name: 'delete',
        child: intl.get(`sslm.common.button.batchDelete`).d('批量删除'),
        btnProps: {
          icon: 'delete_sweep',
          disabled: unCheckedFlag,
          style: { marginRight: 8 },
          onClick: () => handDelete(),
          type: 'c7n-pro',
          funcType: 'flat',
        },
      },
      {
        name: 'batchEdit',
        child: unCheckedFlag
          ? intl.get('hzero.common.button.batchEdit').d('批量编辑')
          : intl.get('sslm.common.button.batchCheckEdit').d('勾选批量编辑'),
        btnProps: {
          icon: 'mode_edit',
          disabled: batchEditDisabled,
          style: { marginRight: 8 },
          onClick: () => handleBatchEdit(),
          type: 'c7n-pro',
          funcType: 'flat',
        },
      },
      {
        name: 'submit',
        child: intl.get('sslm.common.button.submitForFeview').d('提交评审'),
        hidden: isCreat || !isReviewFlag,
        btnProps: {
          icon: 'done',
          disabled: submitDisabledFlag,
          style: { marginRight: 8 },
          onClick: () => handleSubmit(),
          type: 'c7n-pro',
          funcType: 'flat',
        },
      },
      {
        name: 'expand',
        child: intl.get(`sslm.supplyAbility.view.btn.vistaExpand`).d('一键拓展'),
        hidden: isCreat || isGroupManageFlag,
        btnProps: {
          icon: 'queue',
          disabled: unCheckedFlag || !isCompanyDimension,
          style: { marginRight: 8 },
          onClick: () => handleExpand(),
          type: 'c7n-pro',
          funcType: 'flat',
        },
      },
    ];
    const buttons = remote
      ? remote.process('SSLM_SUPPLY_ABILITY_MANAGE_DETAIL_CATEGORY_MATERIAL_BUTTONS', btns, {
          dataSet,
        })
      : btns;
    return editFlag ? [buttonGroup(buttons)] : [];
  }, [editFlag, isCompanyDimension, isReviewFlag, isGroupManageFlag]);

  const buttonGroup = (btns = []) => {
    return customizeBtnGroup(
      {
        code: customizeBtnGroupCode,
        pro: true,
      },
      <DynamicButtons defaultBtnType="c7n-pro" buttons={btns} />
    );
  };

  // 批量新增-按物料
  const MaterialBtn = (btnProps = {}) => {
    // 获取额外按钮属性
    const { advisedMenuItem, inMenuItem } = btnProps || {};
    const needMenuItem = !!advisedMenuItem && !inMenuItem;
    const itemDs = new DataSet(getItemDs());
    const getBtnComp = () => (
      <Lov
        mode="button"
        name="itemLov"
        icon={needMenuItem ? '' : 'playlist_add'}
        clearButton={false}
        dataSet={itemDs}
        funcType="flat"
        onBeforeSelect={records => addMaterialCategory(records, 'createByMaterial')}
        modalProps={{
          beforeOpen: () => {
            const lovDs = itemDs.getField('itemLov').getOptions(itemDs.current);
            if (lovDs) {
              lovDs.unSelectAll();
              lovDs.clearCachedSelected();
            }
          },
        }}
      >
        <span
          className={classnames({
            [styles['supply-ability-detail-btn']]: true,
            [styles['supply-ability-detail-menu-btn']]: needMenuItem,
          })}
        >
          {intl.get(`sslm.supplyAbility.button.createByMaterial`).d('批量新增-按物料')}
        </span>
      </Lov>
    );
    return needMenuItem ? <Menu.Item>{getBtnComp()}</Menu.Item> : getBtnComp();
  };

  // 批量新增-按品类
  const CategoryBtn = (btnProps = {}) => {
    // 获取额外按钮属性
    const { advisedMenuItem, inMenuItem } = btnProps || {};
    const needMenuItem = !!advisedMenuItem && !inMenuItem;
    const categoryDs = new DataSet(getCategoryDs());
    const getBtnComp = () => (
      <Lov
        mode="button"
        name="itemCategoryLov"
        icon={needMenuItem ? '' : 'playlist_add'}
        clearButton={false}
        dataSet={categoryDs}
        funcType="flat"
        onBeforeSelect={records => addMaterialCategory(records, 'createByCategory')}
        modalProps={{
          beforeOpen: () => {
            const lovDs = categoryDs.getField('itemCategoryLov').getOptions(categoryDs.current);
            if (lovDs) {
              lovDs.unSelectAll();
              lovDs.clearCachedSelected();
            }
          },
        }}
        tableProps={{
          alwaysShowRowBox: true,
          selectionMode: 'rowbox',
          onRow: ({ record }) => {
            const nodeProps = {};
            if (record.get('hasChild') === '0') {
              nodeProps.isLeaf = true;
            }
            return nodeProps;
          },
        }}
      >
        <span
          className={classnames({
            [styles['supply-ability-detail-btn']]: true,
            [styles['supply-ability-detail-menu-btn']]: needMenuItem,
          })}
        >
          {intl.get(`sslm.supplyAbility.button.createByCategory`).d('批量新增-按品类')}
        </span>
      </Lov>
    );
    return needMenuItem ? <Menu.Item>{getBtnComp()}</Menu.Item> : getBtnComp();
  };

  const cols = [
    {
      name: 'supplyReviewStatusMeaning',
      width: 100,
      renderer: renderStatus,
    },
    {
      name: 'itemLov',
      width: 150,
      editor: editFlag,
    },
    {
      name: 'itemName',
      width: 180,
    },
    {
      name: 'itemCategoryLov',
      width: 100,
      editor: editFlag && (
        <Lov
          name="itemCategoryLov"
          searchFieldInPopup
          onOption={({ record: optionRecord }) => {
            return {
              disabled: optionRecord.get('isCheck') === false,
            };
          }}
          tableProps={{
            alwaysShowRowBox: true,
            selectionMode: 'rowbox',
            onRow: ({ record }) => {
              const nodeProps = {};
              if (record.get('hasChild') === '0') {
                nodeProps.isLeaf = true;
              }
              return nodeProps;
            },
          }}
        />
      ),
    },
    {
      name: 'itemCategoryName',
      width: 180,
    },
    {
      width: 80,
      name: 'supplyFlag',
      editor: editFlag,
      type: 'CHECKBOX',
      renderer: editFlag
        ? null
        : ({ value }) => {
            return yesOrNoRender(value);
          },
    },
    {
      name: 'adapterProducts',
      width: 100,
      editor: editFlag,
    },
    {
      width: 140,
      name: 'countryLov',
      editor: editFlag,
    },
    {
      width: 100,
      name: 'regionLov',
      editor: editFlag,
    },
    {
      width: 100,
      name: 'cityLov',
      editor: editFlag,
    },
    {
      name: 'dateFrom',
      width: 120,
      editor: editFlag,
    },
    {
      name: 'dateTo',
      width: 120,
      editor: editFlag,
    },
    {
      name: 'purchaseOrganizationLov',
      width: 150,
      editor: editFlag,
    },
    {
      name: 'manufacturer',
      width: 150,
      editor: editFlag,
    },
    {
      name: 'remark',
      width: 200,
      editor: editFlag,
    },
    {
      name: 'lastUpdateUserName',
      width: 150,
    },
    {
      name: 'lastUpdateDate',
      width: 150,
    },
    {
      name: 'quotaRatio',
      width: 200,
    },
    {
      name: 'inventoryOrganizationId',
      width: 200,
      editor: editFlag,
    },
    {
      name: 'attachment',
      width: 130,
      fixed: 'right',
      renderer: ({ record }) => {
        const { fileCount, abilityLineId, supplyReviewStatus } = record.get([
          'fileCount',
          'abilityLineId',
          'supplyReviewStatus',
        ]);
        const editableFlag = editFlag && !['REVIEWING'].includes(supplyReviewStatus);
        return (
          <a disabled={!abilityLineId} onClick={() => handleAttamentModal(record, editableFlag)}>
            {renderC7NAttachmentText({
              editable: editableFlag,
              fileCount,
            })}
          </a>
        );
      },
    },
    {
      name: 'dataSource',
      renderer: ({ record }) => {
        const dataSourceMeaning = record.get('dataSourceMeaning');
        return dataSourceMeaning;
      },
    },
    {
      name: 'docNumAndLineNum',
    },
    {
      name: 'approvalProgress',
      width: 160,
      hidden: !showApproveProgress,
      title: intl.get('sslm.common.view.title.approvalProgress').d('审批进度'),
      renderer: ({ record }) => {
        const supplyReviewStatus = record.get('supplyReviewStatus');
        const showFlag = supplyReviewStatus !== 'STAY_REVIEW';
        return showFlag ? renderApproveProgress({ approvalHistoryMap, record }) : '-';
      },
    },
  ].filter(col => !col.hidden);

  const columns = detailRemote
    ? detailRemote.process('SSLM_SUPPLY_ABILITY_MANAGE_DETAIL_CATEGORY_MATERIAL_COLUMNS', cols, {
        isEdit,
        isCreat,
      })
    : cols;

  return (
    <Spin dataSet={dataSet}>
      {customizeTable(
        {
          code: customizeUnitCode,
          readOnly: readOnlyFlag,
        },
        <SearchBarTable
          cacheState={false} // 缓存expand配置，若需要变更expand时，需要设置为false
          dataSet={dataSet}
          columns={columns}
          buttons={getButtons()}
          searchCode={customizeSearchCode}
          searchBarRef={ref => {
            categoryMaterialSearchRef = ref;
          }}
          searchBarConfig={{
            closeFilterSelector: true,
            expand: !editFlag,
            expandable: editFlag,
            onQuery: queryProps => handleQuery(queryProps),
          }}
          style={{ maxHeight: 518 }}
        />
      )}
    </Spin>
  );
};

export default CategoryMaterial;

import React, { useContext, useMemo, useEffect, useRef, useState } from 'react';

import { max, isFunction } from 'lodash';
import intl from 'utils/intl';
import classnames from 'classnames';
import { observer } from 'mobx-react-lite';
import notification from 'utils/notification';
import { yesOrNoRender } from 'utils/renderer';

import { Tag } from 'choerodon-ui';
import { Modal, Lov } from 'choerodon-ui/pro';
import { Button as PermissionButton } from 'components/Permission';
import SearchBarTable from '_components/SearchBarTable';

import { PriceModal } from '@/routes/components/priceModal';
// import MobilePhone from '@/routes/components/MoblePhone';
import {
  cancelPurchase,
  fetchPurchaseLinesClose,
} from '@/services/purchaseRequisitionCancelService';
import { fetchBasePrice } from '@/services/purchaseRequisitionCreationService';
import EditLineAdd from './EditLineAdd';
import Remark from '../components/Remark';
import ViewPrimaryUrl from '@/routes/ProductImage.js';
import { ItemCustom } from '../components/ItemCustomC7N';
import LineChangeTable from '../components/LineChangeTable';
import CustomSpecsModal from '../components/CustomSpecsModal';
import ProductSpecsModal from '../components/ProductSpecsModal';
import OutsourcingBom from '../components/OutsourcingBom';
import ReferencePrice from '../components/ReferencePrice';
// import { deleteLines } from '@/services/purchaseRequisitionCreationService';

import { renderAmount, colorRender } from '../hook';
import { Store } from '../stores';

// 设置sprm国际化前缀 - common - model
const commonPrompt = 'sprm.common.model.common';
const messagePrompt = 'sprm.purchaseRequisitionCancel.view.message';
const deleteLineIds = [];

const tableButton = () => {
  const {
    headerDs,
    listDs,
    addLineDs,
    sourceType,
    urlflagIf,
    prHeaderId,
    isNewCancelTeant,
    prSourcePlatform,
    commonUpdate,
    uomControl,
    customizeForm,
    customizeTable,
    isOldUser,
    handleCuxLineCancelClose,
    handleChangeAddDefault,
    remote,
    handleOperationModal,
  } = useContext(Store);

  const { current } = headerDs;

  const remarkRef = useRef({});

  const handleCancelClose = (btnType) => {
    const { selected = [] } = listDs;
    if (selected && selected.length === 0) {
      notification.error({
        message: intl.get(`hzero.common.validation.atLeast`).d('请至少选择一条数据'),
      });
      return;
    }

    const lineCancelCloseFunc = () => {
      const { handleCancelProps } = remote?.props?.process || {};
      Modal.open({
        key: Modal.key(),
        title:
          btnType === 'cancelledRemark'
            ? intl.get(`sprm.purchaseRequisitionCancel.view.message.cancelReason`).d('取消原因')
            : intl.get(`sprm.purchaseRequisitionCancel.view.message.closeReason`).d('关闭原因'),
        children: (
          <Remark
            isOldUser={isOldUser}
            prHeaderId={prHeaderId}
            ref={remarkRef}
            required
            customizeForm={customizeForm}
            cusCode={
              btnType === 'cancelledRemark'
                ? 'SPRM.PURCHASE_PLAFORM.CANCELMODAL'
                : 'SPRM.PURCHASE_PLAFORM.CLOSEMODAL'
            }
            params={{ prLineIds: selected.map((e) => e.get('prLineId')), prHeaderId }}
            btnType={btnType}
            remarkLabel={
              btnType === 'cancelledRemark'
                ? intl.get(`sprm.purchaseRequisitionCancel.view.message.cancelReason`).d('取消原因')
                : intl.get(`sprm.purchaseRequisitionCancel.view.message.closeReason`).d('关闭原因')
            }
          />
        ),
        closable: true,
        movable: false,
        drawer: true,
        destroyOnClose: true,
        onCancel: () => {},
        onOk: async () => {
          const remarkCurrent = remarkRef.current.saveCurrentData();
          const validateFlag = await remarkCurrent.validate();
          if (validateFlag) {
            const [{ cancelledRemark, ...other }] = remarkCurrent.toData();
            const operationType = btnType === 'cancelledRemark' ? 'CANCEL' : 'CLOSE';
            // 工作流审批提交前的弹窗表单
            const result = await handleOperationModal({
              code: `SPRM.PURCHASE_PLAFORM_CANCEL.OPERATION_${operationType}_FORM`,
              operationType,
              body: {
                prHeaderId,
                prLineList: selected.map((s) => s.toData()),
              },
              handleOk: (data) => {
                other.customWorkFlowParam = data;
              },
            });
            if (!result) return false;

            const cuxCancelProps = isFunction(handleCancelProps)
              ? handleCancelProps({ btnType, ...other })
              : {};
            if (btnType === 'cancelledRemark') {
              cancelPurchase(
                selected?.map((ele) => {
                  return { ...ele.toJSONData(), cancelledRemark, ...other, ...cuxCancelProps };
                })
              ).then((res) => {
                if (res && !res.failed) {
                  commonUpdate();
                } else if (res && res.failed) {
                  notification.error({ message: res.message });
                }
              });
            } else {
              fetchPurchaseLinesClose(
                selected?.map((ele) => {
                  return { ...ele.toJSONData(), closedRemark: cancelledRemark, ...other };
                })
              ).then((res) => {
                if (res && !res.failed) {
                  const { successCounts, failedCounts } = res;
                  notification.success({
                    message: intl
                      .get(`${messagePrompt}.successAndfailed`, { successCounts, failedCounts })
                      .d(`成功了${successCounts}条，失败了${failedCounts}条`),
                  });
                  commonUpdate();
                } else if (res && res.failed) {
                  notification.error({ message: res.message });
                }
              });
            }
          } else {
            return false;
          }
        },
        footer: (okBtn, cancelBtn) => (
          <div>
            {okBtn}
            {cancelBtn}
          </div>
        ),
        style: { width: btnType === 'closedRemark' ? '742px' : '380px' },
      });
    };

    if (isFunction(handleCuxLineCancelClose)) {
      handleCuxLineCancelClose(selected, btnType, lineCancelCloseFunc);
    } else {
      lineCancelCloseFunc();
    }
  };

  // 行报错信息解析
  const getLineErrorMsg = (lineError = []) => {
    // 解套娃: 原报错信息格式是: [{error:{errors:[{ruleName:XXX,injectionOptions:{label}}]},record:{}}]
    return lineError?.map((ele, index) => {
      const { record = {} } = ele || {};
      const currentLineError = ele.errors.map((item) => item.errors[0]); // {errors:[{ruleName:XXX,injectionOptions:{label}}]}
      const currentIndex =
        record.status !== 'add' && !record.isCached
          ? record.get('displayLineNum') || record.index + 1
          : index + 1; // 取当前行号

      const errorTypeArr = [...new Set(currentLineError?.map((item) => item.ruleName))]; // 获取当前行的报错信息类型
      let currentInfo = '';
      // eslint-disable-next-line no-unused-expressions
      errorTypeArr?.forEach((e) => {
        const classifyType = currentLineError.filter((item) => item.ruleName === e);
        if (e === 'valueMissing') {
          // 针对于字段未填写的类型统一报错
          const zzz = Array.from(
            new Set(classifyType?.map((item) => item.injectionOptions?.label))
          );
          currentInfo += intl.get('hzero.common.validation.notNull', {
            name: zzz.join('，'),
          });
        } else {
          // eslint-disable-next-line no-unused-expressions
          currentLineError?.forEach((item, ind) => {
            if (item.ruleName !== 'valueMissing') {
              currentInfo += `${item.validationMessage}${
                ind === currentLineError.length - 1 ? '' : '，'
              }`;
            }
          });
        }
      });
      return ele.record.get('displayLineNum') ? (
        <div>{`行号为${currentIndex}，数据校验不通过。具体原因为:${currentInfo}`}</div>
      ) : (
        <div>{`第${currentIndex}行，${currentInfo}`}</div>
      );
    });
  };

  const handleOpenTableAdd = () => {
    const shieldedLineIds = addLineDs.getState('shieldedLineIds') || [];
    const { created: listCreated, updated: listUpdated } = listDs;
    addLineDs.setQueryParameter('shieldedLineIds', shieldedLineIds.join(','));
    addLineDs.query().then(() => {
      const cacheAddLine = [];
      const addLineIds = addLineDs?.map((ele) => ele.get('prLineId'));
      const supplierListFiled = listDs.getField('supplierList');
      listUpdated.forEach((item) => {
        // 变更新增行才能更改弹窗数据
        if (item.get('changeInsertFlag')) {
          // 非当前页面的数据
          if (!addLineIds.includes(item.get('prLineId'))) {
            cacheAddLine.push(item);
          } else {
            // 当前页面的数据
            addLineDs.forEach((ele) => {
              if (ele.get('prLineId') && ele.get('prLineId') === item.get('prLineId')) {
                const allField = addLineDs.fields._data;
                for (const s of allField.keys()) {
                  if (s === 'supplierList') {
                    if (supplierListFiled && supplierListFiled.isDirty(item)) {
                      ele.set(s, item.get(s)?.toJS());
                    }
                  } else {
                    ele.set(s, item.get(s));
                  }
                }
              }
            });
          }
        }
      });
      listCreated.forEach((ele) => {
        // eslint-disable-next-line no-param-reassign
        ele.disabled = false;
        ele.save();
      });
      addLineDs.setCachedModified(listCreated.concat(cacheAddLine));
    });

    Modal.open({
      key: Modal.key(),
      drawer: true,
      style: { width: 1090 },
      title: intl.get(`sprm.common.add.prline`).d('新建采购申请行'),
      children: (
        <EditLineAdd
          handleChangeAddDefault={handleChangeAddDefault}
          deleteLineIds={deleteLineIds}
          addLineDs={addLineDs}
          customizeTable={customizeTable}
          headerDs={headerDs}
          listDs={listDs}
          uomControl={uomControl}
          remote={remote}
          basePriceFlag={headerDs.getState('basePriceFlag')}
        />
      ),
      closable: true,
      movable: false,
      destroyOnClose: true,
      onOk: async () => {
        const validateFlag = await addLineDs.validate();
        if (validateFlag) {
          // 查询上次修改数据（删除数据）
          const queryIds = addLineDs.getState('lastLineIds') || [];
          addLineDs.setState('shieldedLineIds', queryIds);

          const { updated, created } = addLineDs;
          console.log(created);
          const listUpdatedLines = listDs?.map((ele) => ele.get('prLineId'));
          const addUpdateLines = updated?.map((ele) => ele.get('prLineId'));
          const cacheLine = [];
          // 变更的行
          updated.forEach((item) => {
            item.save();
            // 非当前页面的数据
            if (!listUpdatedLines.includes(item.get('prLineId'))) {
              cacheLine.push(item);
            } else {
              // 当前页面的数据
              const supplierListFiled = addLineDs.getField('supplierList');
              listDs.forEach((ele) => {
                if (ele.get('prLineId') && ele.get('prLineId') === item.get('prLineId')) {
                  const allField = addLineDs.fields._data;
                  for (const s of allField.keys()) {
                    if (s === 'supplierList') {
                      if (supplierListFiled && supplierListFiled.isDirty(item)) {
                        ele.set(s, item.get(s)?.toJS());
                      }
                    } else {
                      ele.set(s, item.get(s));
                    }
                  }
                }
              });
            }
          });
          created.forEach((item) => {
            // eslint-disable-next-line no-param-reassign
            item.disabled = true;
            item.save();
          });
          // 弹窗取消了某个变更的行
          listUpdated.forEach((ele) => {
            if (
              ele.get('changeInsertFlag') === 1 &&
              !addUpdateLines.includes(ele.get('prLineId'))
            ) {
              ele.reset();
            }
            if (
              ele.get('changeInsertFlag') !== 1 &&
              !listUpdatedLines.includes(ele.get('prLineId'))
            ) {
              cacheLine.push(ele);
            }
          });
          listDs.setQueryParameter('shieldedLineIds', queryIds.join(','));
          listDs.query(listDs?.currentPage, { shieldedLineIds: queryIds.join(',') }, true);
          listDs.setCachedModified(created.concat(cacheLine));
        } else {
          const lineError = await addLineDs.getValidationErrors();
          const cachedLine = getLineErrorMsg(
            lineError.filter(({ record }) => {
              return record.isCached && record.status === 'add';
            })
          );
          const lineMsg = getLineErrorMsg(
            lineError.filter(({ record }) => !record.isCached || record.status !== 'add')
          );
          notification.error({
            message: (
              <div>
                <p style={{ marginBottom: 3, fontWeight: 600 }}>
                  {intl.get('sprm.common.title.addLine').d('新增行')}:
                </p>
                {cachedLine}
                <p style={{ marginBottom: 3, fontWeight: 600 }}>
                  {intl.get('sprm.common.title.currentLine').d('当前页')}:
                </p>
                {lineMsg}
              </div>
            ),
          });
          return false;
        }
      },
      onCancel: () => {
        const { updated, created } = addLineDs;
        const arrCreated = listCreated?.map((item) => item.get('uuidKey'));
        const updatedIds = listUpdated?.map((ele) => ele.get('prLineId'));
        updated.forEach((ele) => {
          if (updatedIds.includes(ele.get('prLineId'))) {
            ele.restore();
          } else {
            ele.reset();
          }
        });
        listCreated.forEach((e) => {
          // eslint-disable-next-line semi
          e.disabled = true;
        });
        created.forEach((ele) => {
          if (arrCreated.includes(ele.get('uuidKey'))) {
            ele.restore();
          } else {
            addLineDs.remove(ele);
          }
        });
      },
      footer: (okBtn, cancelBtn) => (
        <div>
          {okBtn} {cancelBtn}
        </div>
      ),
    });
  };

  const CancelBtn = observer(() => {
    const { selected } = listDs;
    const cancelFlag = useMemo(() => {
      if (isNewCancelTeant) {
        return selected.some((ele) => ele.get('prLineCancelledFlag') !== 1);
      } else {
        return !selected.every((ele) =>
          ['APPROVED', 'ASSIGNED', 'SUSPEND'].includes(ele.get('prLineStatusCode'))
        );
      }
    }, [selected, isNewCancelTeant]);
    return (
      <PermissionButton
        onClick={() => handleCancelClose('cancelledRemark')}
        disabled={selected.length === 0 || cancelFlag}
        icon="cancel"
        key="cancel"
        name="cancelLine"
        color="primary"
        funcType="flat"
        type="c7n-pro"
        permissionList={[
          {
            code: `hzero.srm.requirement.prm.pr-platform.ps.control-line-cancel`,
            type: 'button',
            meaning: '取消',
          },
        ]}
      >
        {intl.get(`hzero.common.button.cancel`).d('取消')}
      </PermissionButton>
    );
  });

  const CloseBtn = observer(() => {
    const { selected } = listDs;
    const closeFlag = useMemo(() => {
      if (isNewCancelTeant) {
        return selected.some((ele) => ele.get('prLineClosedFlag') !== 1);
      } else {
        return !selected.every(
          (ele) =>
            ele.get('occupiedQuantity') > 0 &&
            ele.get('occupiedQuantity') < ele.get('quantity') &&
            ['APPROVED', 'ASSIGNED', 'SUSPEND'].includes(ele.get('prLineStatusCode'))
        );
      }
    }, [selected, isNewCancelTeant]);

    return (
      <PermissionButton
        onClick={() => handleCancelClose('closedRemark')}
        disabled={selected.length === 0 || closeFlag}
        icon="not_interested"
        key="close"
        name="closeLine"
        funcType="flat"
        color="primary"
        type="c7n-pro"
        permissionList={[
          {
            code: `hzero.srm.requirement.prm.pr-platform.ps.control-line-close`,
            type: 'button',
            meaning: '关闭',
          },
        ]}
      >
        {intl.get(`hzero.common.button.close`).d('关闭')}
      </PermissionButton>
    );
  });

  return [
    prSourcePlatform === 'SRM' && urlflagIf && current?.get('prHeaderChangeInsertFlag') === 1 && (
      <PermissionButton
        onClick={() => handleOpenTableAdd()}
        icon="playlist_add"
        key="addLine"
        name="addLine"
        color="primary"
        funcType="flat"
        type="c7n-pro"
      >
        {intl.get('sprm.common.model.comon.insertLine').d('变更新增行')}
      </PermissionButton>
    ),
    ['SRM', 'ERP', 'SHOP', 'CATALOGUE'].includes(prSourcePlatform) &&
      current?.get('changedFlag') !== 1 &&
      !urlflagIf &&
      current?.get('cancelStatusCode') !== 'CANCELLEDING' &&
      ['normal', 'cancel'].includes(sourceType) && <CancelBtn name="cancelLine" />,
    ['SRM', 'ERP', 'SHOP', 'CATALOGUE'].includes(prSourcePlatform) &&
      current?.get('changedFlag') !== 1 &&
      !urlflagIf &&
      isNewCancelTeant &&
      ['normal', 'close'].includes(sourceType) && <CloseBtn name="closeLine" />,
  ];
};

const PurchaseLineInfo = function PurchaseLineInfo() {
  const {
    headerDs,
    listDs,
    urlflagIf,
    isOldUser,
    isNewCancelTeant,
    prSourcePlatform,
    customizeTable,
    uomControl,
    headerCompanyId,
    lineCompanyId,
    cuxCacelLineAllowEdit,
    handleCacelLineCols,
    location,
    remote,
    cuxLineRef,
    prHeaderId,
  } = useContext(Store);

  const [basePriceFlag, setBasePriceFlag] = useState(true);

  const { current } = headerDs;

  useEffect(() => {
    if (
      (prSourcePlatform === 'SRM' || prSourcePlatform === 'ERP') &&
      (headerCompanyId || lineCompanyId)
    ) {
      fetchBasePrice({ companyId: headerCompanyId, prSourcePlatform }).then((res) => {
        setBasePriceFlag(res);
        headerDs.setState('basePriceFlag', res);
      });
    }
  }, [headerCompanyId, prSourcePlatform, lineCompanyId]);

  const normalAllowEdit = ({ record = {}, name }) => {
    if (!urlflagIf) {
      return false;
    }

    if (record.get('changeInsertFlag') === 1) {
      return false;
    }

    if (name === 'categoryLov') {
      if (
        record.get('occupyFlag') !== 1 &&
        ['APPROVED', 'ASSIGNED'].includes(record.get('prLineStatusCode')) &&
        record.get('occupiedQuantity') === 0
      ) {
        return (
          <Lov
            editor
            dataSet={listDs}
            name="categoryLov"
            tableProps={{
              mode: 'tree',
              onRow: (row) => {
                const handleSelect = ({ dataSet, record: _record }) => {
                  if (dataSet && _record) {
                    dataSet.select(_record);
                  }
                };
                return {
                  onClick: () => handleSelect(row),
                  onDoubleClick: () => {
                    if (row?.record?.selectable) {
                      handleSelect(row);
                      record.set({
                        categoryLov: row?.record?.toData(),
                      });
                      Modal.destroyAll();
                    }
                  },
                };
              },
              selectionMode: 'rowbox',
            }}
          />
        );
      }
    }

    if (name === 'secondaryQuantity') {
      if (
        isOldUser ||
        (!isOldUser && ['ORDER', 'SOURCE'].includes(record.get('executionStrategyCode')))
      ) {
        return (
          record.get('cancelledFlag') === 0 &&
          record.get('closedFlag') === 0 &&
          record.get('occupiedQuantity') < record.getPristineValue('quantity')
        );
      } else if (
        !isOldUser &&
        ['BEFORE_SOURCE_AFTER_ORDER', 'SOURCE_AND_ORDER'].includes(
          record.get('executionStrategyCode')
        )
      ) {
        return (
          record.get('cancelledFlag') === 0 &&
          record.get('closedFlag') === 0 &&
          record.getPristineValue('quantity') >=
            max([record.get('occupiedQuantity'), record.get('sourceOccupiedQuantity')])
        );
      }
    }

    if (name === 'quantity') {
      if (
        isOldUser ||
        (!isOldUser && ['ORDER', 'SOURCE'].includes(record.get('executionStrategyCode')))
      ) {
        return (
          record.get('cancelledFlag') === 0 &&
          record.get('closedFlag') === 0 &&
          record.get('occupiedQuantity') < record.getPristineValue('quantity')
        );
      } else if (
        !isOldUser &&
        ['BEFORE_SOURCE_AFTER_ORDER', 'SOURCE_AND_ORDER'].includes(
          record.get('executionStrategyCode')
        )
      ) {
        return (
          record.get('cancelledFlag') === 0 &&
          record.get('closedFlag') === 0 &&
          record.getPristineValue('quantity') >=
            max([record.get('occupiedQuantity'), record.get('sourceOccupiedQuantity')])
        );
      }
    }

    // if (name === 'receiveTelNum') {
    //   return record.get('occupyFlag') !== 1 &&
    //     record.get('cancelledFlag') === 0 &&
    //     record.get('closedFlag') === 0 &&
    //     record.get('occupiedQuantity') === 0 ? (
    //     // eslint-disable-next-line react/jsx-indent
    //     <MobilePhone record={record} fieldCode="receiveTelNum" editable={true} />
    //   ) : (
    //     false
    //   );
    // }

    if (name === 'attachmentUuid') {
      return record.get('cancelledFlag') === 0 && record.get('closedFlag') === 0;
    }

    if (name === 'changeAttachmentUuid') {
      return true;
    }

    if (name === 'projectTaskId') {
      return record.get('occupyFlag') !== 1 &&
        record.get('cancelledFlag') === 0 &&
        record.get('closedFlag') === 0 &&
        record.get('occupiedQuantity') === 0 ? (
          <Lov
            editor
            dataSet={listDs}
            name="projectTaskId"
            tableProps={{
            mode: 'tree',
            onRow: (row) => {
              const handleSelect = ({ dataSet, record: _record }) => {
                if (dataSet && _record) {
                  dataSet.select(_record);
                }
              };
              return {
                onClick: () => handleSelect(row),
                onDoubleClick: () => {
                  if (row?.record?.selectable) {
                    handleSelect(row);
                    record.set({
                      projectTaskId: row?.record?.toData(),
                    });
                    Modal.destroyAll();
                  }
                },
              };
            },
            selectionMode: 'rowbox',
          }}
          />
      ) : (
        false
      );
    }
    if (
      !isOldUser &&
      ['BEFORE_SOURCE_AFTER_ORDER', 'SOURCE_AND_ORDER'].includes(
        record.get('executionStrategyCode')
      )
    ) {
      return (
        record.get('occupyFlag') !== 1 &&
        record.get('cancelledFlag') === 0 &&
        record.get('closedFlag') === 0 &&
        !(record.get('occupiedQuantity') > 0 || record.get('sourceOccupiedQuantity') > 0)
      );
    }
    return (
      record.get('occupyFlag') !== 1 &&
      record.get('cancelledFlag') === 0 &&
      record.get('closedFlag') === 0 &&
      record.get('occupiedQuantity') === 0
    );
  };

  const allowEdit = ({ record = {}, name }) => {
    const normalAllowEditFlag = normalAllowEdit({ record, name });
    const processAllowEditFlag = isFunction(cuxCacelLineAllowEdit)
      ? cuxCacelLineAllowEdit(normalAllowEditFlag, { record, name })
      : normalAllowEditFlag;
    return processAllowEditFlag;
  };

  const viewPrimaryUrl = ({ record }) => {
    Modal.open({
      key: Modal.key(),
      drawer: true,
      style: { width: '520px' },
      children: <ViewPrimaryUrl currentPrLineId={record?.get('prLineId')} />,
    });
  };

  // 明细行上预算外标识字段变化时回调
  // const handleBudgetIoFlagChange = (e, record) => {
  //   record.set('budgetIoFlag', Number(e));
  // };

  const lineColumns = useMemo(() => {
    let allCols = [
      {
        name: 'displayLineNum',
        width: 100,
      },
      {
        name: 'changeInsertFlag',
        width: 100,
        renderer: ({ value }) => yesOrNoRender(Number(value)),
      },
      {
        name: 'invOrganizationIdLov',
        width: 200,
        editor: (record, name) => allowEdit({ record, name }),
      },
      {
        name: 'productNum',
        width: 100,
        editor: (record, name) => allowEdit({ record, name }),
      },
      {
        name: 'productName',
        width: 200,
        editor: (record, name) => allowEdit({ record, name }),
      },
      {
        name: 'primaryUrl',
        width: 100,
        renderer: ({ record }) => (
          <a onClick={() => viewPrimaryUrl({ record })}>
            {intl.get('sprm.common.model.view.primaryUrl').d('查看主图')}
          </a>
        ),
      },
      { name: 'thirdSkuCode', width: 100 },
      { name: 'thirdSkuName', width: 100 },
      { name: 'productBrand', width: 100 },
      { name: 'productModel', width: 100 },
      { name: 'packingList', width: 100 },
      {
        name: 'itemCodeLov',
        width: 100,
        editor: (record, name) => allowEdit({ record, name }),
      },
      {
        name: 'itemName',
        width: 200,
        editor: (record, name) => allowEdit({ record, name }),
      },
      {
        name: 'customMadeFlag',
        width: 100,
        renderer: ({ value }) => (value || value === 0 ? yesOrNoRender(value) : null),
      },
      {
        name: 'customAttributeList',
        width: 100,
        renderer: ({ record }) =>
          record.get('customMadeFlag') === 1 ? (
            <ItemCustom
              record={record}
              disabled={
                record.get('occupyFlag') === 1 ||
                !(
                  record.get('cancelledFlag') === 0 &&
                  record.get('closedFlag') === 0 &&
                  record.get('occupiedQuantity') === 0
                ) ||
                !urlflagIf
              }
            />
          ) : null,
      },
      {
        name: 'itemModel',
        width: 100,
        editor: (record, name) => allowEdit({ record, name }),
      },
      {
        name: 'itemSpecs',
        width: 100,
        editor: (record, name) => allowEdit({ record, name }),
      },
      {
        name: 'categoryLov',
        width: 100,
        editor: (record, name) => allowEdit({ record, name }),
        // editor: true,
      },
      {
        name: 'catalogName',
        width: 100,
        editor: (record, name) => allowEdit({ record, name }),
      },
      {
        name: 'neededDate',
        width: 150,
        editor: (record, name) => allowEdit({ record, name }),
      },
      {
        name: 'outsourcingBomFlag',
        width: 150,
        editor: false,
      },
      {
        name: 'outsourcingBom',
        width: 150,
        renderer: ({ record }) =>
          record?.get('outsourcingBomFlag') ? (
            <OutsourcingBom
              record={record}
              headerDs={headerDs}
              type="change"
              readOnly={!urlflagIf || record.get('changeInsertFlag') === 1}
              customizeTable={customizeTable}
              custCode={
                urlflagIf
                  ? 'SPRM.PURCHASE_PLAFORM_CANCEL.CHANGE_OUTSOURCINGBOM'
                  : 'SPRM.PURCHASE_PLAFORM_CANCEL.OUTSOURCINGBOM'
              }
            />
          ) : null,
      },
      {
        name: 'occupiedQuantity',
        width: 100,
      },
      {
        name: 'changeQuantity',
        width: 100,
      },
      {
        name: 'quantity',
        width: 100,
        type: 'number',
        editor: (record, name) => {
          return uomControl === 1 ? false : allowEdit({ record, name });
        },
      },
      {
        name: 'sourceOccupiedQuantity',
        type: 'number',
        title: intl.get(`${commonPrompt}.sourceOccupiedQuantity`).d('寻源链路占用数量'),
      },
      {
        name: 'orderOccupiedQuantity',
        type: 'number',
        title: intl.get(`${commonPrompt}.orderOccupiedQuantity`).d('履约链路占用数量'),
      },
      {
        name: 'restSourceQuantity',
        type: 'number',
        title: intl.get(`${commonPrompt}.restSourceQuantity`).d('寻源链路可用数量'),
      },
      {
        name: 'restPoQuantity',
        type: 'number',
        title: intl.get(`${commonPrompt}.orderRestPoQuantity`).d('履约链路可用数量'),
      },
      {
        name: 'secondLevelStrategyCode',
        title: intl.get(`${commonPrompt}.secondLevelStrategyCode`).d('寻源链路执行规则'),
      },
      {
        name: 'orderExecuteStatus',
        width: 100,
        renderer: ({ value, record }) =>
          colorRender(value, record.get('orderExecuteStatusMeaning')),
      },
      {
        name: 'sourceExecuteStatus',
        width: 100,
        renderer: ({ value, record }) =>
          colorRender(value, record.get('sourceExecuteStatusMeaning')),
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
      {
        name: 'uomLov',
        width: 100,
        editor: (record, name) => {
          return uomControl === 1 ? false : allowEdit({ record, name });
        },
      },
      {
        name: 'secondaryUomId',
        width: 100,
        editor: (record, name) => allowEdit({ record, name }),
      },
      {
        name: 'secondaryQuantity',
        width: 100,
        editor: (record, name) => allowEdit({ record, name }),
      },
      {
        name: 'secondaryTaxInUnitPrice',
        width: 100,
        editor: (record, name) => allowEdit({ record, name }) && basePriceFlag,
      },
      {
        name: 'taxLov',
        width: 100,
        editor: (record, name) => allowEdit({ record, name }),
      },
      {
        name: 'taxRate',
        width: 100,
      },
      {
        width: 100,
        name: 'currencyLov',
        editor: (record, name) => allowEdit({ record, name }),
      },
      {
        name: 'referencePriceDisplayFlag',
        width: 100,
        // renderer: ({ record }) => <ReferPrice currentRecord={record} fetchPrice={fetchPrice} />,
        renderer: ({ record }) => {
          const sourceFormFlag = normalAllowEdit({ record, name: 'itemCodeLov' });
          return (
            <ReferencePrice
              record={record}
              headerDs={headerDs}
              sourceForm={sourceFormFlag ? 'update' : null}
              uomControl={uomControl}
              remote={remote}
            />
          );
        },
      },
      {
        name: 'taxIncludedUnitPrice',
        width: 100,
        renderer: renderAmount,
        editor: (record, name) => {
          return (uomControl === 1 ? false : allowEdit({ record, name })) && basePriceFlag;
        },
      },
      {
        name: 'lastPurPrice',
        width: 100,
        renderer: ({ record }) => (
          <PriceModal
            {...{
              item: record.toData(),
            }}
          />
        ),
      },
      {
        name: 'unitPriceBatch',
        width: 100,
        editor: (record, name) => allowEdit({ record, name }),
      },
      {
        name: 'taxIncludedLineAmount',
        width: 100,
        align: 'right',
        renderer: renderAmount,
        editor: (record, name) => allowEdit({ record, name }),
      },
      {
        name: 'localCurrencyNoTaxSum',
        width: 100,
        align: 'right',
        renderer: renderAmount,
        editor: (record, name) => allowEdit({ record, name }),
      },
      {
        name: 'localCurrencyNoTaxUnit',
        width: 100,
        align: 'right',
        renderer: renderAmount,
        editor: (record, name) => allowEdit({ record, name }),
      },
      {
        name: 'localCurrencyTaxSum',
        renderer: renderAmount,
        align: 'right',
        width: 100,
        editor: (record, name) => allowEdit({ record, name }),
      },
      {
        name: 'localCurrencyTaxUnit',
        width: 100,
        renderer: renderAmount,
        align: 'right',
        editor: (record, name) => allowEdit({ record, name }),
      },
      {
        name: 'supplierCompanyIdLov',
        width: 100,
        editor: (record, name) => allowEdit({ record, name }),
      },
      {
        name: 'supplierList',
        width: 100,
        editor: (record, name) => allowEdit({ record, name }),
      },
      {
        name: 'prRequestedLov',
        width: 100,
        editor: (record, name) => allowEdit({ record, name }),
      },
      {
        name: 'purchaseAgentLov',
        width: 100,
        editor: (record, name) => allowEdit({ record, name }),
      },
      {
        name: 'executorName',
        width: 100,
      },
      {
        width: 100,
        name: 'accountSubjectLov',
        editor: (record, name) => allowEdit({ record, name }),
      },
      {
        name: 'costLov',
        width: 100,
        editor: (record, name) => allowEdit({ record, name }),
      },
      {
        name: 'expBearDepLov',
        width: 100,
        editor: (record, name) => allowEdit({ record, name }),
      },
      {
        name: 'projectNum',
        width: 100,
        editor: (record, name) => allowEdit({ record, name }),
      },
      {
        name: 'projectName',
        width: 100,
        editor: (record, name) => allowEdit({ record, name }),
      },
      {
        name: 'projectCategoryLov',
        width: 100,
        editor: (record, name) => allowEdit({ record, name }),
      },
      {
        name: 'wbsLov',
        width: 100,
        renderer: ({ record }) => record.get('wbs'),
        editor: (record, name) => allowEdit({ record, name }),
      },
      {
        name: 'taxIncludedBudgetUnitPrice',
        width: 100,
        renderer: renderAmount,
        editor: (record, name) => allowEdit({ record, name }),
      },
      {
        name: 'budgetIoFlag',
        width: 100,
        renderer: ({ value }) => yesOrNoRender(Number(value)),
        editor: (record, name) => allowEdit({ record, name }),
        // renderer: ({ record, name, value }) => {
        //   return (
        //     <CheckBox
        //       // eslint-disable-next-line eqeqeq
        //       checked={value == 1}
        //       onChange={(e) => {
        //         handleBudgetIoFlagChange(e, record);
        //       }}
        //       unCheckedChildren={intl.get('hzero.common.status.no').d('否')}
        //       disabled={!allowEdit({ record, name })}
        //     >
        //       {intl.get('hzero.common.status.yes').d('是')}
        //     </CheckBox>
        //   );
        // },
      },
      {
        name: 'budgetAccountLov',
        width: 100,
        editor: (record, name) => allowEdit({ record, name }),
      },
      {
        name: 'pcNum',
        width: 100,
      },
      {
        name: 'receiveAddress',
        width: 100,
        editor: (record, name) => allowEdit({ record, name }),
      },
      {
        name: 'receiveTelNum',
        width: 280,
        // editor: (record, name) => {
        //   const flag = allowEdit({ record, name });
        //   return < MobilePhone record={record} fieldCode="receiveTelNum" editable={flag} />
        // },
        // renderer: ({ record, value, name }) => {
        //   const flag = allowEdit({ record, name });
        //   return flag ? (
        //     <MobilePhone record={record} fieldCode="receiveTelNum" editable />
        //   ) : value ? (
        //     `${record?.get('internationalTelCode') || ''} ${value || ''}`
        //   ) : (
        //     ''
        //   );
        // },
      },
      {
        name: 'defaultOrderingAddressId',
        width: 120,
        editor: false,
      },
      {
        name: 'defaultContactPerson',
        width: 120,
        editor: false,
      },
      {
        name: 'defaultContactPhone',
        width: 120,
        editor: false,
      },
      {
        name: 'lineFreight',
        renderer: renderAmount,
        width: 100,
        align: 'right',
        editor: (record, name) => allowEdit({ record, name }),
      },
      {
        name: 'remark',
        width: 100,
        editor: (record, name) => allowEdit({ record, name }),
      },
      {
        name: 'mallLineNum',
        width: 100,
      },
      {
        name: 'productSpecsJson',
        width: 100,
        renderer: ({ value }) => {
          return <ProductSpecsModal value={value} />;
        },
      },
      {
        name: 'budgetOccupyFlag',
        width: 100,
      },
      {
        name: 'attachmentUuid',
        width: 100,
        editor: (record, name) => allowEdit({ record, name }),
      },
      {
        name: 'changeAttachmentUuid',
        width: 100,
        editor: (record, name) => allowEdit({ record, name }),
      },
      { name: 'projectTaskId', width: 100, editor: (record, name) => allowEdit({ record, name }) },
    ];

    if (headerDs?.current?.get('rpSourceFlag') === 1) {
      allCols.push({ name: 'rpSourceNum', width: 100 });
    }
    const baseUomInfo =
      uomControl === 1 ? [] : ['secondaryUomId', 'secondaryTaxInUnitPrice', 'secondaryQuantity'];

    allCols = isFunction(handleCacelLineCols)
      ? handleCacelLineCols({ allCols, headerDs, location })
      : allCols;

    // 对所有来源都适用的过滤
    if (isOldUser) {
      allCols = allCols.filter(
        (item) =>
          ![
            'sourceOccupiedQuantity',
            'restSourceQuantity',
            'orderOccupiedQuantity',
            'restPoQuantity',
            'closeQuantity',
            'sourceCloseQuantity',
            'currentCloseQuantity',
            'downsStreamQuantity',
            'sourceDownsStreamQuantity',
            'currentSourceCloseQuantity',
            'secondLevelStrategyCode',
            'sourceExecuteStatus',
            'orderExecuteStatus',
            ...baseUomInfo,
          ].includes(item.name)
      );
    }
    if (!headerDs?.current?.get('prHeaderChangeInsertFlag')) {
      allCols = allCols.filter((item) => !['prHeaderChangeInsertFlag'].includes(item.name));
    }

    // E-COMMERCE
    if (prSourcePlatform === 'E-COMMERCE') {
      if (!isOldUser) {
        return allCols.filter(
          (ele) =>
            ![
              'lastPurPrice',
              'receiveAddress',
              'defaultContactPhone',
              'defaultContactPerson',
              'defaultOrderingAddressId',
              'receiveContactName',
              'receiveTelNum',
              'customMadeFlag',
              'customAttributeList',
              'changeQuantity',
              'sourceOccupiedQuantity',
              'restSourceQuantity',
              'sourceExecuteStatus',
              'orderExcessRuleCode',
              'sourceExcessRuleCode',
              'contractExcessRuleCode',
              'sourceDisposableExcessFlag',
              ...baseUomInfo,
            ].includes(ele.name)
        );
      } else {
        return allCols.filter(
          (ele) =>
            ![
              'lastPurPrice',
              'receiveAddress',
              'defaultContactPhone',
              'defaultContactPerson',
              'defaultOrderingAddressId',
              'receiveContactName',
              'receiveTelNum',
              'customMadeFlag',
              'customAttributeList',
              'changeQuantity',
              'orderExcessRuleCode',
              'sourceExcessRuleCode',
              'contractExcessRuleCode',
              'sourceDisposableExcessFlag',
              ...baseUomInfo,
            ].includes(ele.name)
        );
      }
    }

    if (isNewCancelTeant && ['SRM', 'ERP', 'SHOP', 'CATALOGUE'].includes(prSourcePlatform)) {
      allCols.splice(0, 0, {
        name: 'operable',
        width: 100,
        renderer: ({ record }) => {
          if (current?.get('changedFlag') === 1) {
            return null;
          }
          return record.get('prLineCancelledFlag') === 1 || record.get('prLineClosedFlag') === 1 ? (
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
          ) : null;
        },
      });
    }

    // CATALOGUE
    if (prSourcePlatform === 'CATALOGUE') {
      if (!isOldUser) {
        return allCols
          .concat([
            {
              width: 100,
              name: 'skuType',
            },
            {
              width: 100,
              name: 'customUomName',
            },
            {
              width: 100,
              name: 'customQuantity',
            },
            {
              width: 100,
              name: 'packageQuantity',
            },
            {
              width: 100,
              name: 'customSpecsJson',
              renderer: ({ value }) => {
                return <CustomSpecsModal value={value} />;
              },
            },
          ])
          .filter(
            (item) =>
              ![
                'customMadeFlag',
                'lastPurPrice',
                'customAttributeList',
                'changeQuantity',
                'sourceOccupiedQuantity',
                'restSourceQuantity',
                'sourceExecuteStatus',
                'orderExcessRuleCode',
                'sourceExcessRuleCode',
                'contractExcessRuleCode',
                'sourceDisposableExcessFlag',
                ...baseUomInfo,
              ].includes(item.name)
          );
      } else {
        return allCols
          .concat([
            {
              width: 100,
              name: 'skuType',
            },
            {
              width: 100,
              name: 'customUomName',
            },
            {
              width: 100,
              name: 'customQuantity',
            },
            {
              width: 100,
              name: 'packageQuantity',
            },
            {
              width: 100,
              name: 'customSpecsJson',
              renderer: ({ value }) => {
                return <CustomSpecsModal value={value} />;
              },
            },
          ])
          .filter(
            (item) =>
              ![
                'customMadeFlag',
                'lastPurPrice',
                'customAttributeList',
                'changeQuantity',
                'orderExcessRuleCode',
                'sourceExcessRuleCode',
                'contractExcessRuleCode',
                'sourceDisposableExcessFlag',
                ...baseUomInfo,
              ].includes(item.name)
          );
      }
    }

    // SHOP
    if (prSourcePlatform === 'SHOP') {
      return allCols.filter(
        (ele) =>
          ![
            'productNum',
            'productName',
            'primaryUrl',
            'thirdSkuCode',
            'thirdSkuName',
            'productBrand',
            'productModel',
            'packingList',
            'catalogName',
            'lastPurPrice',
            'projectTaskId',
            'productSpecsJson',
            'customMadeFlag',
            'customAttributeList',
            'changeQuantity',
            ...baseUomInfo,
          ].includes(ele.name)
      );
    }

    // SRM or ERP
    if (['SRM', 'ERP', null, undefined].includes(prSourcePlatform)) {
      if (!urlflagIf) {
        return allCols.filter(
          (ele) =>
            ![
              'mallLineNum',
              'productNum',
              'productName',
              'primaryUrl',
              'thirdSkuCode',
              'thirdSkuName',
              'productBrand',
              'productModel',
              'packingList',
              'catalogName',
              'productSpecsJson',
              'changeAttachmentUuid',
              ...baseUomInfo,
            ].includes(ele.name)
        );
      }
      return allCols.filter(
        (ele) =>
          ![
            'mallLineNum',
            'productNum',
            'productName',
            'primaryUrl',
            'thirdSkuCode',
            'thirdSkuName',
            'productBrand',
            'productModel',
            'packingList',
            'catalogName',
            'productSpecsJson',
            'defaultOrderingAddressId',
            'defaultContactPerson',
            'defaultContactPhone',
            ...baseUomInfo,
          ].includes(ele.name)
      );
    }
  }, [isOldUser, prSourcePlatform, isNewCancelTeant, current, urlflagIf, basePriceFlag]);

  const cuxColumns = useMemo(() => {
    return remote
      ? remote.process('SPRM_PRDETAIL_REMOTE_PROCESS_LINE_COLUMNS', lineColumns, {
          prSourcePlatform,
          location,
          urlflagIf,
        })
      : lineColumns;
  }, [remote, lineColumns, urlflagIf, location]);

  const table = urlflagIf ? (
    customizeTable(
      {
        code: 'SPRM.PURCHASE_PLAFORM_CANCEL.CHANGE_PURCHASELINE', // 阔以变更的table
        dataSet: listDs,
        buttonCode: 'SPRM.PURCHASE_PLAFORM_CANCEL.TABLE_BTN',
        // __force_record_to_update__: true,
        custLoading: false,
        lovIgnore: false,
      },
      <SearchBarTable
        style={{ maxHeight: '400px' }}
        dataSet={listDs}
        code="queryTable"
        columns={cuxColumns}
        buttons={tableButton()}
        selectionMode="none"
        pagination={{
          pageSizeOptions: ['10', '20', '50', '100', '200'],
        }}
        virtual
        virtualSpin
        virtualCell
        searchCode="SPRM.PURCHASE_PLAFORM_CANCEL.PURCHASELINE_SEARCHBAR"
      />
    )
  ) : (
    <LineChangeTable // 不阔以变更的table
      code="SPRM.PURCHASE_PLAFORM_CANCEL.PURCHASELINE"
      columns={cuxColumns}
      buttonCode="SPRM.PURCHASE_PLAFORM_CANCEL.TABLE_BTN"
      buttons={tableButton()}
    />
  );

  const remoteRenderBottom = remote
    ? remote.render('SPRM_PURCHASE_PLAFORM_LINE_CANCEL_REMOTE_RENDER_BOTTOM', <></>, {
        headerDs,
        listDs,
        prHeaderId,
        cuxLineRef,
        location,
      })
    : null;

  return (
    <>
      {table}
      {remoteRenderBottom}
    </>
  );
};

export default PurchaseLineInfo;

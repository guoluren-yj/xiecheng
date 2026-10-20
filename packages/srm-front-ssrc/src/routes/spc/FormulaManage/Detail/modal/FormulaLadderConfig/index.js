import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import {
  Button,
  Table,
  IntlField,
  Modal,
  DataSet,
  Form,
  useDataSet,
  Output,
  Lov,
} from 'choerodon-ui/pro';
import { isEmpty, isNil } from 'lodash';
import { TableButtonType } from 'choerodon-ui/pro/lib/table/enum';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/interface';
import { DataSetSelection } from 'choerodon-ui/dataset/data-set/enum';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import intl from 'utils/intl';
import { DynamicTab } from '@/routes/spc/components';
import styles from '@/routes/spc/components/DynamicTab/style.less';
import { CalcFormula } from '../../components';

import { FormulaRender, batchValidateData } from '../../../utils';
import { FormulaLadderDS, LadderDetailDS, PreFormulaLadderDS, addAllStageDS } from './store';

// 每个阶梯式Tab页页对应的表格ds 集合
const ladderDetailMap = new Map();

const Index = (props) => {
  const { formulaId, isEdit, isAssign, modal, assignItemBomDS, record: basicRecord } = props;
  const [activeKey, setActiveKey] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectAllFlag, setSelectAllFlag] = useState(0); // 勾选全部公式阶段标识

  const [currentLadderDetailDS, setCurrentLadderDetailDS] = useState(new DataSet());
  // 编辑弹窗的ds
  const editLadderDS = useDataSet(() => FormulaLadderDS(formulaId), [formulaId]);
  // 阶梯公式Tab页
  const formulaLadderDS = useDataSet(() => FormulaLadderDS(formulaId, assignItemBomDS, isAssign), [
    formulaId,
    assignItemBomDS,
    isAssign,
  ]);

  // 加入全都ds
  const addAllStageDs = useDataSet(() => addAllStageDS(formulaId), [formulaId]);

  useEffect(() => {
    // 分配模式，判断是否有修改过行
    const priceFormulaLadderList = basicRecord.get('priceFormulaLadderList');
    if (isAssign && priceFormulaLadderList) {
      // 加载修改过的行
      if (priceFormulaLadderList) {
        formulaLadderDS.loadData(priceFormulaLadderList);
        // 查询每个Tab下的表格数据，存入Map中
        initDetail(formulaLadderDS);
      }
    } else {
      setLoading(true);
      // 查询所有数据包括行
      formulaLadderDS
        .query()
        .then((res) => {
          if (getResponse(res)) {
            // 查询每个Tab下的表格数据，存入Map中
            initDetail(res);
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, []);

  const initDetail = (tabList) => {
    // 查询每个Tab下的表格数据，存入Map中
    tabList.forEach((record, index) => {
      const { ladderId, includeAllFlag } = record;
      addDetail(ladderId, true);
      // 默认激活第一条数据
      if (index === 0) {
        onChangeTab(ladderId);
        // 取第一条数据的加入全部标识
        addAllStageDs.loadData([
          {
            includeAllFlag,
          },
        ]);
        setSelectAllFlag(includeAllFlag);
      }
    });
  };

  useEffect(() => {
    if (modal) {
      const { update } = modal;
      update({
        footer: () => <FooterBtns dataSet={currentLadderDetailDS} btnLoading={loading} />,
      });
    }
  }, [currentLadderDetailDS, loading, activeKey]);

  const columns = useMemo(
    () =>
      [
        {
          name: 'ladderFrom',
          editor: isEdit,
          width: 150,
        },
        {
          name: 'ladderTo',
          editor: isEdit,
          width: 150,
        },
        isEdit
          ? {
              name: 'ladderFormula',
              width: 150,
              renderer: ({ record }) => (
                <a onClick={() => handleOpenCalcFormula(record)}>
                  {intl.get(`hzero.common.view.button.edit`).d('编辑')}
                </a>
              ),
            }
          : null,
        {
          name: 'operationalFormulaName',
          renderer: ({ value }) => FormulaRender(value),
        },
      ].filter(Boolean),
    [isEdit]
  );

  const handleConfirm = async () => {
    const ladderDetailDSList = Array.from(ladderDetailMap.values());
    const validateFlag = await batchValidateData([formulaLadderDS, ...ladderDetailDSList]);
    if (!validateFlag) return;

    const operationalFormulaFlag = ladderDetailDSList.some((ds) =>
      ds.some((record) => !record.get('operationalFormulaName'))
    );
    if (operationalFormulaFlag) {
      notification.error({
        description: intl
          .get('spc.formulaManage.view.message.formulaRequired')
          .d('计算公式不能为空'),
      });
      return;
    }
    // 获取加入全部按钮值
    const addAllStageData = addAllStageDs.current ? addAllStageDs.current.toData() : {};
    const { includeAllFlag } = addAllStageData;
    let deleteObj = {};

    if (includeAllFlag) {
      deleteObj = {
        bomViewCode: null,
        bomViewId: null,
        bomViewName: null,
        bomViewNameEnCode: null,
      };
    }
    formulaLadderDS.forEach((record) => {
      const lineDS = ladderDetailMap.get(record.get('ladderId'));
      let needDeleteFlag = false;
      if (record.key !== activeKey && includeAllFlag) {
        needDeleteFlag = true;
      }
      deleteObj = {
        ...deleteObj,
        needDeleteFlag,
      };

      record.set({
        priceFormulaLadderLineList: lineDS.toData(),
        includeAllFlag: includeAllFlag ? 1 : 0,
        ...deleteObj,
      });
    });
    const saveData = formulaLadderDS.toData().map((i) => {
      const { needDeleteFlag } = i;
      let { _status } = i;
      if (needDeleteFlag) {
        _status = 'delete';
      }
      return {
        ...i,
        _status,
      };
    });
    // 分配进入，临时保存，不调用接口
    if (isAssign) {
      basicRecord.set({
        priceFormulaLadderList: saveData,
      });
      modal.close();
      return;
    }
    setLoading(true);
    const res = getResponse(
      await formulaLadderDS.submit().finally(() => {
        setLoading(false);
      })
    );
    if (res) {
      modal.close();
    }
  };

  const FooterBtns = observer(({ dataSet, btnLoading }) => {
    const editFlag = isEdit || isAssign;
    return (
      <>
        {editFlag && (
          <Button
            loading={btnLoading}
            color="primary"
            disabled={(dataSet?.length || 0) === 0}
            onClick={handleConfirm}
          >
            {intl.get('hzero.common.button.confirm').d('确认')}
          </Button>
        )}
        <Button onClick={() => modal.close()} {...(!editFlag ? { color: 'primary' } : {})}>
          {editFlag
            ? intl.get('hzero.common.button.cancel').d('取消')
            : intl.get('hzero.common.button.close').d('关闭')}
        </Button>
      </>
    );
  });

  const onAddTab = useCallback(() => {
    onEditTab(undefined);
    // calcPaddingBottom();
  });

  const onChangeTab = useCallback(async (ladderId) => {
    let key = ladderId;
    // key不存在，定位到第一行，
    if (!key) {
      const preRecord = await formulaLadderDS.first();
      key = preRecord?.get('ladderId');
    }
    if (ladderDetailMap.has(key)) {
      setCurrentLadderDetailDS(ladderDetailMap.get(key));
    } else {
      addDetail(key);
    }
    setActiveKey(key);
  });

  const addDetail = (ladderId, init) => {
    const ladderDetailDS = new DataSet({
      ...LadderDetailDS(ladderId),
      selection: isEdit && DataSetSelection.multiple,
    });
    ladderDetailMap.set(ladderId, ladderDetailDS);
    if (!init) {
      setCurrentLadderDetailDS(ladderDetailDS);
    }
  };

  const onEditTab = (record) => {
    const currentRecord = record || editLadderDS.create({});
    Modal.open({
      title: record
        ? intl.get('spc.formulaManage.view.title.updateLadder').d('修改阶梯')
        : intl.get('spc.formulaManage.view.title.addLadder').d('新增阶梯'),
      drawer: true,
      style: { width: '380px' },
      destroyOnClose: true,
      children: (
        <Form labelLayout={LabelLayout.float} columns={1} record={currentRecord}>
          <IntlField name="ladderName" />
        </Form>
      ),
      onOk: async () => {
        const flag = await editLadderDS.validate();
        if (!flag) return false;
        if (!record) {
          // 校验之前的阶梯必填
          const formulaLaddeValidate = await formulaLadderDS.validate();
          if (!formulaLaddeValidate) {
            // 校验不通过关闭弹窗
            return true;
          }
          const createRecord = formulaLadderDS.create(currentRecord.toData());
          try {
            const res = await formulaLadderDS.submit();
            if (!getResponse(res)) {
              formulaLadderDS.remove(createRecord, true);
              return false;
            }
            formulaLadderDS.query();
            // onChangeTab(res?.content[0].formulaId);
            onChangeTab();
          } catch (error) {
            formulaLadderDS.remove(createRecord, true);
            return false;
          }
        }
      },
      afterClose: () => {
        editLadderDS.removeAll(true);
      },
    });
  };

  const handleOpenCalcFormula = useCallback((record) => {
    const { operationalFormulaName, operationalFormula } = record.toData();
    let formulaInfo = {
      operationalFormulaName,
      operationalFormula,
    };
    const preFormulaLadderDS = new DataSet(PreFormulaLadderDS());

    const calcFormulaProps = {
      ...props,
      record,
      onBlur: (response) => {
        formulaInfo = { ...response };
      },
      originFormula: basicRecord.get('operationalFormula'),
    };
    const notEditProps = {
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
    };
    Modal.open({
      title: intl.get(`spc.formulaManage.model.ladderFormula`).d('阶梯公式'),
      drawer: true,
      destroyOnClose: true,
      style: { width: '1090px' },
      children: <CalcFormula {...calcFormulaProps} />,
      onOk: async () => {
        if (!isEdit) return;
        if (isEmpty(formulaInfo)) {
          return false;
        }
        preFormulaLadderDS.create({
          operationalFormula: formulaInfo.operationalFormula,
          formulaId,
        });
        const res = await preFormulaLadderDS.submit();
        if (!res) return false;
        record.set(formulaInfo);
      },
      ...(!isEdit ? notEditProps : {}),
    });
  });

  const handleAdd = () => {
    let newData = {};
    if (currentLadderDetailDS.length) {
      const lastRecord = currentLadderDetailDS.records[currentLadderDetailDS.length - 1] || {};
      const initialValue = lastRecord?.get('ladderTo');
      if (!isNil(initialValue)) {
        newData = { ladderFrom: Number(initialValue) };
      }
    }
    currentLadderDetailDS.create(newData);
  };

  const handleDelete = async () => {
    const selectedRows = currentLadderDetailDS.selected;
    const newAddRows = selectedRows.filter((s) => s.status === 'add') || [];
    const existedRows = selectedRows.filter((s) => ['sync', 'update'].includes(s.status)) || [];
    // 删除本地数据
    currentLadderDetailDS.remove(newAddRows);

    if (!isEmpty(existedRows)) {
      // 删除线上数据
      await currentLadderDetailDS.delete(existedRows, {
        title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
        children: intl
          .get('hzero.c7nProUI.DataSet.delete_selected_row_confirm')
          .d('确认删除选中行？'),
      });
    }
  };

  const renderTabPane = (record) => {
    const formEdit = isEdit || isAssign;
    const hiddenBomFlag = formulaLadderDS.getState('hiddenBom');
    return (
      <>
        {hiddenBomFlag ? (
          <div style={{ margin: '20px' }} />
        ) : (
          <div style={{ margin: '20px 0 16px 0' }}>
            <Form
              labelLayout={formEdit ? 'float' : 'vertical'}
              className={formEdit ? null : 'c7n-pro-vertical-form-display'}
              columns={1}
              record={record}
            >
              {formEdit ? (
                <Lov
                  name="bomViewId"
                  // tableProps={{ showAllPageSelectionButton: true }}
                  // onChange={(val) => {
                  //   record.set(
                  //     'bomViewCode',
                  //     val && !isEmpty(val) ? val.map((item) => item.bomViewCode).join(',') : null
                  //   );
                  // }}
                />
              ) : (
                <Output name="bomViewId" />
              )}
            </Form>
          </div>
        )}
        <div className={styles['table-wrapper']}>
          <Table
            customizable
            customizedCode="SPC.PRICE_FORMULA_MANAGE.DETAIL.LADDER_CONFIG_TABLE"
            dataSet={currentLadderDetailDS}
            buttons={
              isEdit && [
                [TableButtonType.add, { onClick: handleAdd }],
                [TableButtonType.delete, { icon: 'delete_sweep', onClick: handleDelete }],
              ]
            }
            queryFieldsLimit={2}
            style={{ maxHeight: 'calc(100vh - 250px)' }}
            columns={columns}
            // filterBarConfig={{
            //   collpaseble: true,
            // }}
          />
        </div>
      </>
    );
  };

  const dynamicTabProps = {
    isEdit,
    activeKey,
    onAddTab,
    onChangeTab,
    onEditTab,
    renderTabPane,
    tabName: 'ladderName',
    dataSet: formulaLadderDS,
    addAllStageDs,
    selectAllFlag,
  };

  return <DynamicTab {...dynamicTabProps} />;
};

export default Index;

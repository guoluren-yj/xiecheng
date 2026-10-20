/*
 * 扩展表入口
 * @Date: 2020-04-02 14:50:15
 * @Author: 汪渊  <yuan.wang07@hand-china.com>
 * @version: 1.0.0
 * @copyright: copyright: HAND ® 2020
 */
import React, { useState, useRef, useEffect, useMemo, useContext, FC } from 'react';
import { Table, Button, Radio, DataSet } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { Steps, Tooltip } from 'choerodon-ui';
import notification from 'utils/notification';
import { isEmpty } from 'lodash';
import Record from 'choerodon-ui/pro/lib/data-set/Record';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import {
  ColumnLock,
  TableQueryBarType,
  ColumnAlign,
  TableColumnTooltip,
} from 'choerodon-ui/pro/lib/table/enum';
import { Renderer } from 'choerodon-ui/pro/lib/field/FormField';

import ImgIcon from '@/utils/ImgIcon';
import _store, { IModelManagerStore } from '@/routes/Modeler/ModelDesigner/stores';
import {
  queryModelDataService,
  unBindRedundantTableServices,
} from '@/services/modelDataSourceService';
import {
  createRedTableService,
  fetchRedAllInfo,
  fetchQuoteRedTable,
} from '@/services/modelListService';
import globalStyles from '@/lowcodeGlobalStyles/global.less';
import Modal from '@/components/LowcodeModal';
import LowcodeTip from '@/components/LowcodeTip';
import { isPresetField } from '@/routes/Modeler/ModelDesigner/utils/utils';

import { getResponse, isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import PositiveTable from './PositiveTable';
import RedundantEmptyPage from './PositiveTable/EmptyStep/RedundantEmptyPage';
import { EditModelDataSet, BaseTableFieldDataSet, DataModelFieldDataSet } from './CreateModelModal';
import CreateModel from './CreateModelModal/CreateModel';
import styles from '../../index.less';
import isFailureResponse from '@/utils/isFailureResponse';
import { IHandleMenuQueryList } from '@/routes/Modeler/ModelDesigner/ListView';

const { Column } = Table;
const { Step } = Steps;
const { confirm } = Modal;

const isTenant = isTenantRoleLevel();

const redNameList = ['REDUNDANT_RELATION_TABLE', 'REDUNDANT_RELATION_KEY'];
// 静态数据
const positiveModalKey = Modal.key();
const modelModalKey = Modal.key();

enum ETableType {
  OWNER = 'OWNER',
  REFERENCE = 'REFERENCE',
  switch = 'switch',
}
interface IVal {
  id: number;
  dataSourceType: string;
  name: string;
}
interface IModal {
  update: (arg?: any) => void;
  close: () => void;
}
let positiveModal: IModal = {
  update: () => {},
  close: () => {},
};
let redundantFieldModal: IModal = {
  update: () => {},
  close: () => {},
};
interface IIndex extends IHandleMenuQueryList {
  redCommand: ({ record }: { record: Record }) => JSX.Element[];
  renderDisplayName: ({ record, value }: { record: Record; value: string }) => JSX.Element;
  renderBooleanText: ({ value }: { value: number }) => JSX.Element;
  redundantTableDataSet: DataSet;
  handleEditField: (recode: Record) => void;
  refreshHeaderInfo: () => void;
  headerModalDetailInfoDS: DataSet;
  primaryKeyField?: any;
}
const Index: FC<IIndex> = observer(
  ({
    redCommand,
    renderDisplayName,
    renderBooleanText,
    handleMenuQueryList,
    redundantTableDataSet,
    refreshHeaderInfo,
    headerModalDetailInfoDS,
    primaryKeyField,
  }) => {
    const modelManagerStore = useContext<IModelManagerStore>(_store as any).store;

    const {
      currentModelDetailAll,
      setRightEditData,
      setDataStore,
      storeData: {
        modelDetail,
        redundantTableName,
        redundantMode,
        refDataSourceType,
        refServiceCode,
        refSchemaName,
        resourceUponRoleHierarchy,
        modelType,
      },
    }: IModelManagerStore = modelManagerStore;

    // 创建 / 编辑 扩展表权限
    const canCreateRedundantTable = headerModalDetailInfoDS.current?.get('canCreateRedundantTable');
    const canEditRedundantTable = headerModalDetailInfoDS.current?.get('canEditRedundantTable');

    const platformValue = resourceUponRoleHierarchy === 'tenant' ? 'ORGANIZATION' : 'SITE';
    const searchParams = {
      resourceLevel: isTenant ? undefined : platformValue,
    };

    const stepRef: any = useRef();
    const redundantTableCode: any = useRef();
    const [step, setStep] = useState<number>(0); // 步骤
    const [id, setId] = useState<string | number | null>(''); // 扩展表id
    const [checkObj, setCheckObj] = useState<model.LogicModel>({} as any);
    const [fieldStep, setFieldStep] = useState<number>(0); // 扩展字段步骤
    const [isShowEmpty, setIsShowEmpty] = useState<boolean>(false); // 是否显示空tab页
    const [tableType, setTableType] = useState<string | null>(null); // 扩展表类型 OWNER : 创建 REFERENCE : 引用
    const [lovInfo, setLovInfo] = useState<IVal>({} as any); // 扩展表类型
    const [firstData, setFirstData] = useState<any[]>(); // 第一步数据 // fixme
    const [secondData, setSecondData] = useState<any[]>(); // 第二步数据  // fixme
    const [thirdData, setThirdData] = useState<any[]>(); // 第三步数据
    const [lockStatus, setLockStatus] = useState<boolean>(true); // 引用扩展表上锁

    /**
     * 点击表格整行触发右侧属性面板
     */
    // 暂时注释老的弹框
    // useEffect(() => {
    //   if (redundantTableDataSet.current) handleEditField(redundantTableDataSet.current);
    // }, []);

    stepRef.current = fieldStep;
    const dataModelFieldDataSet = useMemo(
      () =>
        new DataSet(
          DataModelFieldDataSet(
            modelDetail.id,
            undefined,
            (item?: any) =>
              !(redundantMode === 'REDUNDANT_X' && item.fieldName === primaryKeyField.fieldName)
          )
        ),
      [modelDetail.id, redundantMode]
    );
    const baseTableFieldDataSet = useMemo(
      () => new DataSet(BaseTableFieldDataSet(dataModelFieldDataSet, refDataSourceType)),
      [modelDetail.id, refDataSourceType, dataModelFieldDataSet]
    );
    // 解决code为空还搜索的bug
    const editModelDataSet = useMemo(() => new DataSet(EditModelDataSet(modelDetail.id)), [
      modelDetail.id,
    ]);

    /**
     * 初始化扩展表信息
     */
    async function fetchData() {
      let res: model.LogicModel = {} as any;
      res = await queryModelDataService({ query: { id: modelDetail?.id, ...searchParams } });
      let _id: string | number | null = null;
      let _res: any = null;
      let _name: string | null = null;
      let _type: string | null = null;
      if ((res as any).failed || !res.name) {
        notification.error({ message: '错误', description: (res as any).message });
        // return false;
      } else {
        _id = res.id;
        _res = res;
        _name = res.redundantTableName ? res.redundantTableName : null;
        _type = res.redundantTableType ? res.redundantTableType : null;
        redundantTableCode.current = res.redundantTableCode;
      }
      if (modelDetail.id) {
        const res1 = await fetchRedAllInfo(modelDetail.id);
        if (getResponse(res)) {
          _id = res1.id;
          _res = res1;
        }
      }
      return {
        _id,
        _res,
        _type,
        _name,
        res,
      };
    }

    // 模型id改变
    const modelIdChange = async () => {
      const res = await fetchData();
      setDataStore('redundantTableName', res?._name);
    };

    /**
     * 初始化扩展表信息
     */
    useEffect(() => {
      modelIdChange();
    }, [modelDetail.id]);

    /**
     * 重置表信息 清空或当前表信息
     */
    const resetTableInfo = async () => {
      if (positiveTableProps?.ref?.current) {
        // eslint-disable-next-line no-unused-expressions
        (positiveTableProps?.ref?.current as any)?.refreshAll(); // 清空所有DS
      }
      redundantTableCode.current = null;
      setFirstData([]); // 清空第一步保存数据
      setSecondData([]); // 清空第二步保存数据
      setThirdData([]); // 清空第三步保存数据
      setDataStore('redundantTableName', null);
      setId(''); // 设置查询到的扩展信息
      handleChangeTable(null); // 初始化lov信息 保存时用
      setLovInfo({} as any); //   清空lov信息
    };

    /**
     * 保存成功后刷新tab页
     */
    const refreshTabs = async () => {
      const res = await queryModelDataService({ query: { id: modelDetail?.id, ...searchParams } });
      // if (!res || res.failed) {
      //   return;
      // }
      if (isFailureResponse(res)) {
        return;
      }
      setDataStore('redundantTableName', res.redundantTableName);
    };

    /**
     * 更新设计表弹窗内容
     */
    useEffect(() => {
      positiveModal.update({
        // 更新扩展表弹窗
        children: childrenCom,
        footer: footerCom,
        onOk: handleSave,
      });
    }, [step, isShowEmpty, tableType, lockStatus]); // 变量变化 更新模态框

    /**
     * 更新创建表字段弹窗信息
     */
    useEffect(() => {
      redundantFieldModal.update({
        children: (
          <CreateModel
            redundantTableName={redundantTableName}
            editModelDataSet={editModelDataSet}
            step={fieldStep === -1 ? 0 : fieldStep}
            refDataSourceType={refDataSourceType}
            baseTableFieldDataSet={baseTableFieldDataSet}
            dataModelFieldDataSet={dataModelFieldDataSet}
          />
        ),
      });
    }, [fieldStep]); // 变量变化 更新模态框

    const handleDelete = async () => {
      const submitOk =
        (await confirm(
          '该操作将会取消扩展表与引用表的双向1-1关联，同时已维护的模型扩展字段将会被清空，被使用的扩展字段将会失效，您确定解除绑定吗？',
          'small'
        )) === 'ok';
      if (!submitOk) return;
      // const body = { ...modelManagerStore.stuoreData.currentModelDetailAll };
      const body = { ...currentModelDetailAll };

      // 请求
      const res = await unBindRedundantTableServices({ body, id: modelDetail.id });
      if (!res) return;
      if (!isFailureResponse(res)) {
        // 清空
        resetTableInfo();
        refreshTabs();
        setRightEditData('model');
        setCheckObj({} as any);
        handleMenuQueryList(); // 刷新左边侧边栏
        refreshHeaderInfo();
        await redundantTableDataSet.query();
        notification.success({
          message: '删除成功',
        } as any);
      }
      if (isFailureResponse(res)) {
        notification.error({
          message: '警告',
          description: res.message,
        });
      }
    };

    /**
     * 获取是否有引用表可用
     */
    const getQuoteTableInfo = async () => {
      const res = await fetchQuoteRedTable(); // 系统第一次创建需查引用表信息，差不到显示空tab页
      if (res && (res as any)?.failed) {
        return false;
      }
      return true;
    };

    // 判断走哪个流程
    const judgerProcess = async (flag) => {
      if (flag) {
        if (flag === 'createNow') {
          // 第一次建表时默认创建流程
          setTableType(canCreateRedundantTable ? ETableType.OWNER : ETableType.REFERENCE); // 创建流程
          setIsShowEmpty(false);
        } else if (flag === 'switch') {
          resetTableInfo(); // 切换到新建 清空缓存的表信息
          setIsShowEmpty(false); // 是否显示空tab页
          setTableType(ETableType.OWNER); // 创建流程
        } else if (flag === ETableType.REFERENCE) {
          // 切换表时查是否有引用表 有则走引用流程 否则显示空tab页且置为创建流程
          const hasQuoteTable = await getQuoteTableInfo();
          if (hasQuoteTable) {
            setTableType(ETableType.REFERENCE); // 引用流程
            setIsShowEmpty(false);
          } else {
            setTableType(ETableType.OWNER); // 创建流程
            setIsShowEmpty(true);
          }
        }
      }
    };

    /**
     * 打开设计扩展表模态框
     */
    const designTable = async (flag: string) => {
      const initData: any = await fetchData();
      positiveModal = await Modal.open({
        lowcodeSize: 'biggest',
        title: <div style={{ fontSize: '.18rem', fontWeight: 'bold' }}>设计扩展表</div>,
        key: positiveModalKey,
        destroyOnClose: true, // 关闭时是否销毁
        closable: true, // 显示右上角关闭按钮
        children: childrenCom,
        footer: footerCom,
        afterClose: handleAfterClose,
      });
      setStep(0);
      setCheckObj(initData.res);
      setTableType(initData._type);
      setId(initData._id); // 设置查询到的扩展信息
      handleChangeTable(initData._res); // 初始化lov信息 保存时用
      setDataStore('redundantTableName', initData._name);
      judgerProcess(flag);
    };

    /**
     * 弹窗底部按钮
     * @param {*} okBtn
     */
    const footerCom = (_, onCancel: JSX.Element) => (
      <div className={globalStyles['model-footer']}>
        {onCancel}
        {step === 2 && (
          <Button
            onClick={async () => {
              const data = await (positiveTableProps?.ref?.current as any)?.indexTableSave();
              setThirdData(data);
              setStep(0);
            }}
          >
            返回第一步
          </Button>
        )}
        {step !== 0 && (
          <Button
            onClick={async () => {
              let data: any = null;
              if (step === 1) {
                data = await (positiveTableProps?.ref?.current as any)?.fieldTableSave();
                setSecondData(data);
              }
              if (step === 2) {
                data = await (positiveTableProps?.ref?.current as any)?.indexTableSave();
                setThirdData(data);
              }
              if (data) {
                setStep((s) => s - 1);
              }
            }}
          >
            上一步
          </Button>
        )}
        {!isShowEmpty && step !== 2 && (
          <Button
            color={ButtonColor.blue}
            onClick={async () => {
              let data: any = null;
              if (step === 0) {
                if (tableType === ETableType.OWNER) {
                  data = await (positiveTableProps?.ref?.current as any)?.baseTableSave();
                } else {
                  data = await (positiveTableProps?.ref?.current as any)?.quoteTableSave();
                }
                setFirstData(data);
              } else if (step === 1) {
                data = await (positiveTableProps?.ref?.current as any)?.fieldTableSave();
                setSecondData(data);
              }
              if (data) {
                setStep((s) => s + 1);
              }
            }}
          >
            下一步
          </Button>
        )}
        {step === 2 && (
          <Button color={ButtonColor.blue} onClick={() => handleSave()}>
            完成
          </Button>
        )}
      </div>
    );

    /**
     * 切换引用和新建扩展表
     */
    const checkStatus = async (flag) => {
      resetTableInfo();
      judgerProcess(flag);
      setStep(0);
    };

    // 关闭后回调
    const handleAfterClose = async () => {
      // eslint-disable-next-line no-unused-expressions
      (positiveTableProps?.ref?.current as any)?.refreshAll();
      setStep(0);
      setTableType(null);
      setLovInfo({} as any); // 更新lov信息
      setId('');
      setLockStatus(true);
    };

    /**
     * 扩展表弹窗空tab页创建回调
     */
    const createRedundantTable = () => {
      setIsShowEmpty(false);
    };

    /**
     * 通过Lov引用表回调
     * @param {*} val 选中表信息
     */
    type IHandleChangeTable = (val: IVal | null) => void;
    const handleChangeTable: IHandleChangeTable = (val) => {
      if (val) {
        setLovInfo(val); // 更新lov信息
        setId(val.id);
        if (val.dataSourceType) {
          setDataStore('refDataSourceType', val.dataSourceType); // 设置当前选中表所属数据库类型
        }
      }
    };

    // 传递到设计扩展表的参数
    const positiveTableProps = {
      secondData,
      thirdData,
      checkObj,
      tableType, // 新建表|引用表
      createRedundantTable,
      lovInfo,
      tableId: id, // 表id
      modelId: modelDetail.id, // 模型id
      isShowEmpty,
      positiveModal,
      ref: useRef(),
      setFirstData,
      setSecondData,
      setThirdData,
      refDataSourceType, // 数据库类型
      redundantTableName,
      refServiceCode,
      refSchemaName,
      redundantTableCode: checkObj?.redundantTableCode,
      onChangeTable: handleChangeTable,
      lockStatus,
      setLockStatus,
      primaryKeyField,
    };

    // 传递到扩展表步骤条参数
    const StepsProps = [
      { title: '确认扩展表信息' },
      { title: '添加扩展表字段' },
      { title: '添加扩展表索引' },
    ];

    /**
     * 步骤内容
     */
    const childrenCom = (
      <div style={{ height: '60vh' }}>
        {!isShowEmpty && (
          <div>
            <div className={styles['steps-title']}>
              <span className={styles['steps-title-name']}>选择扩展字段来源:</span>
              <Radio
                checked={tableType === ETableType.OWNER}
                disabled={!!redundantTableName || !canCreateRedundantTable}
                onChange={() => checkStatus('switch')}
              >
                自建扩展表
              </Radio>
              <Radio
                checked={tableType === ETableType.REFERENCE}
                disabled={!!redundantTableName || !canEditRedundantTable}
                onChange={() => checkStatus(ETableType.REFERENCE)}
              >
                引用扩展表
              </Radio>
            </div>
            <div className={`${globalStyles['model-body']} ${globalStyles['step-style']}`}>
              <Steps current={step}>
                {StepsProps.map((item) => (
                  <Step key={item.title} title={item.title} />
                ))}
              </Steps>
            </div>
            {/* {step !== 0 && (
              <div className={styles['top-warning']}>
                <span className={styles['top-warning-icon']} />
                <span>
                  新建/编辑/删除 扩展表{step === 1 ? '字段' : '索引'}
                  将会全量更新基础扩展表结构，基于该扩展表的其他相关模型扩展字段数据将均会受到影响
                </span>
              </div>
            )} */}
          </div>
        )}
        <PositiveTable step={step} {...positiveTableProps} />
      </div>
    );

    /**
     * 设计扩展表最后一步保存
     */
    const handleSave = async () => {
      const lastData = await (positiveTableProps?.ref?.current as any)?.indexTableSave('save');
      if (!secondData || !lastData) {
        return false;
      }
      let newRedundantTableType = '';
      if (redundantTableName) {
        const { redundantTableType } = checkObj;
        newRedundantTableType = redundantTableType;
      } else if (tableType === ETableType.OWNER) {
        newRedundantTableType = ETableType.OWNER;
      } else {
        newRedundantTableType = ETableType.REFERENCE;
      }
      const body = {
        id,
        code: checkObj.redundantTableCode,
        redundantTableType: newRedundantTableType,
        tableColumns:
          (secondData &&
            secondData.map((item) => (id ? { ...item, refTableId: id, metaTableId: id } : item))) ||
          [],
        tableIndexes:
          (lastData &&
            lastData.map((item) => (id ? { ...item, refTableId: id, metaTableId: id } : item))) ||
          [],
      }; // 组装数据
      if (tableType === ETableType.OWNER) {
        Object.assign(body, {
          name: (firstData?.[0] as any).name,
          description: (firstData?.[0] as any)?.description,
          redundantMode: (firstData?.[0] as any)?.redundantMode,
        });
      } else {
        Object.assign(body, {
          name: firstData?.[0]?.reFTable?.name,
          description: firstData?.[0]?.reFTable?.description,
          code: firstData?.[0]?.reFTable?.code,
          id: firstData?.[0]?.reFTable?.id,
        });
      }

      const res = await createRedTableService({ body, id: modelDetail.id });
      if (isFailureResponse(res)) {
        notification.error({
          message: '警告',
          description: res.message,
        });
      } else {
        // 保存成功后重新查表信息
        redundantTableDataSet.query();
        refreshTabs();
        handleMenuQueryList(); // 刷新左边侧边栏
        refreshHeaderInfo();
        positiveModal.close();
        notification.success({ message: '提示', description: '操作成功' });
      }
    };

    /**
     * 添加扩展字段底部
     */
    const handleQuoteTable = () => {
      designTable('createNow');
    };

    // 下一步1
    const handleStep1 = async () => {
      setFieldStep(stepRef.current + 1);
      await dataModelFieldDataSet.query();
      dataModelFieldDataSet.forEach((record) => {
        if (record.get('primaryFlag')) {
          Object.assign(record, { selectable: false });
        } // 设置主键不能选择
      });
      await baseTableFieldDataSet.setQueryParameter('code', redundantTableCode.current);
      baseTableFieldDataSet.query();
    };

    // 下一步2
    const handleStep2 = async () => {
      const val = await dataModelFieldDataSet.validate();
      if (val) {
        setFieldStep(stepRef.current + 1);
      }
    };

    // 保存
    const handleStep3 = async () => {
      const val = await dataModelFieldDataSet.validate();
      if (val) {
        await dataModelFieldDataSet.submit();
        await redundantTableDataSet.query();
        handleMenuQueryList(); // 刷新左边侧边栏
        fetchData();
        refreshHeaderInfo();
        const t = setTimeout(() => {
          redundantFieldModal.close();
          clearTimeout(t);
        });
      }
    };

    /**
     * 添加扩展字段
     */
    const openRedundantFieldModal = async () => {
      const res = await queryModelDataService({ query: { id: modelDetail?.id, ...searchParams } });
      redundantTableCode.current = res.redundantTableCode;
      const handleFieldModelAfterClose = () => {
        // 关闭清空
        setFieldStep(0);
        redundantTableCode.current = null;
        editModelDataSet.reset();
        dataModelFieldDataSet.removeAll();
        baseTableFieldDataSet.removeAll();
      };
      redundantFieldModal = await Modal.open({
        lowcodeSize: 'biggest',
        title: <div style={{ fontSize: '.18rem', fontWeight: 'bold' }}>新增扩展字段</div>,
        key: modelModalKey,
        destroyOnClose: true, // 关闭时是否销毁
        closable: true, // 显示右上角关闭按钮
        onOk: () => handleStep3(),
        okText: '完成',
        cancelText: '取消',
        children: (
          <CreateModel
            redundantTableName={redundantTableName}
            editModelDataSet={editModelDataSet}
            step={fieldStep === -1 ? 0 : fieldStep}
            refDataSourceType={refDataSourceType}
            baseTableFieldDataSet={baseTableFieldDataSet}
            dataModelFieldDataSet={dataModelFieldDataSet}
          />
        ),
        footer: (okBtn, onCancel) => (
          <div className={globalStyles['model-footer']}>
            {onCancel}
            {stepRef.current !== 0 && (
              <Button
                onClick={() => {
                  setFieldStep(stepRef.current - 1);
                }}
              >
                上一步
              </Button>
            )}
            {stepRef.current !== 2 && (
              <Button
                color={ButtonColor.blue}
                onClick={() => {
                  switch (stepRef.current) {
                    case 0:
                      return handleStep1();
                    case 1:
                      return handleStep2();
                    default:
                  }
                }}
              >
                下一步
              </Button>
            )}
            {stepRef.current === 2 && (
              <>
                <Button onClick={handleStep3} color={ButtonColor.blue}>
                  保存
                </Button>
              </>
            )}
          </div>
        ),
        afterClose: handleFieldModelAfterClose,
      });
    };

    const valueListRender = ({ record }) =>
      isPresetField(record.get('fieldName'), ['whoNameList', 'TENANT_ID']) ||
      record.get('primaryFlag') === 1 ||
      isPresetField(record.get('fieldName'), ['others', [...redNameList]])
        ? '—'
        : record.get('valueListName');

    const ruleNameRender = ({ record }) =>
      isPresetField(record.get('fieldName'), ['whoNameList', 'TENANT_ID']) ||
      record.get('primaryFlag') === 1 ||
      isPresetField(record.get('fieldName'), ['others', [...redNameList]])
        ? '—'
        : record.get('ruleName');

    // 获取表格可操作的按钮列表
    const getTableButtons = () => {
      const buttons = [
        <LowcodeTip
          hidden={!isEmpty(redundantTableDataSet.toData())}
          text='当前已完成扩展表设计，请点击 "新增扩展字段"'
          styleObj={{ position: 'static', width: 'auto' }}
        />,
        <div>
          <Button
            icon="delete"
            funcType={FuncType.flat}
            color={ButtonColor.primary}
            onClick={handleDelete}
          >
            解除绑定扩展表
          </Button>
          {!canEditRedundantTable ? (
            <Tooltip title="您无权设计扩展表">
              <Button
                icon="mode_edit"
                funcType={FuncType.flat}
                color={ButtonColor.primary}
                onClick={() => designTable('')}
                disabled={!canEditRedundantTable}
              >
                设计扩展表
              </Button>
            </Tooltip>
          ) : (
            <Button
              icon="mode_edit"
              funcType={FuncType.flat}
              color={ButtonColor.primary}
              onClick={() => designTable('')}
            >
              设计扩展表
            </Button>
          )}
          <Button
            funcType={FuncType.flat}
            disabled={redundantTableDataSet.currentSelected.length === 0}
            onClick={() => redundantTableDataSet.delete(redundantTableDataSet.selected)}
            key="delete"
          >
            <ImgIcon name="batch-operation@v4.0.svg" size={16} style={{ marginRight: '5px' }} />
            批量删除
          </Button>
          <Button
            funcType={FuncType.flat}
            color={ButtonColor.primary}
            icon="playlist_add"
            onClick={() => openRedundantFieldModal()}
          >
            新增扩展字段
          </Button>
        </div>,
      ];

      if (
        (isTenantRoleLevel() ||
          modelManagerStore.storeData.resourceUponRoleHierarchy === 'tenant') &&
        modelManagerStore.storeData.modelType === 'PLATFORM_SHARED'
      ) {
        return [];
      } else {
        return buttons;
      }
    };

    return (
      <div className={styles['table-wrapper']}>
        {redundantTableName ? (
          <React.Fragment>
            <Table
              rowHeight={30}
              queryBar={TableQueryBarType.none}
              buttons={modelType !== 'PREDEFINE' ? getTableButtons() : []}
              dataSet={redundantTableDataSet}
              className={`${styles['redundant-table']} ${styles.btnFloatRight} ${globalStyles['table-style']}`}
            >
              <Column
                tooltip={TableColumnTooltip.overflow}
                name="displayName"
                renderer={renderDisplayName as Renderer}
                width={150}
                align={ColumnAlign.left}
              />
              <Column
                tooltip={TableColumnTooltip.overflow}
                name="fieldName"
                width={140}
                align={ColumnAlign.left}
              />
              <Column
                tooltip={TableColumnTooltip.overflow}
                name="dataType"
                // renderer={renderDataType as Renderer}
                width={100}
                align={ColumnAlign.left}
              />
              <Column
                tooltip={TableColumnTooltip.overflow}
                name="requiredFlag"
                renderer={renderBooleanText as Renderer}
                width={100}
                align={ColumnAlign.left}
              />
              <Column
                tooltip={TableColumnTooltip.overflow}
                name="description"
                align={ColumnAlign.left}
              />
              <Column
                tooltip={TableColumnTooltip.overflow}
                name="dataSize"
                width={100}
                align={ColumnAlign.left}
              />
              <Column
                tooltip={TableColumnTooltip.overflow}
                name="defaultValue"
                width={100}
                align={ColumnAlign.left}
              />
              <Column
                tooltip={TableColumnTooltip.overflow}
                name="valueListName"
                width={120}
                renderer={valueListRender as Renderer}
              />
              <Column
                tooltip={TableColumnTooltip.overflow}
                name="ruleName"
                width={120}
                renderer={ruleNameRender as Renderer}
              />
              <Column name="encryptFlag" align={ColumnAlign.center} width={100} editor={false} />
              {((isTenantRoleLevel() || resourceUponRoleHierarchy === 'tenant') &&
                modelType === 'PLATFORM_SHARED') ||
              modelType === 'PREDEFINE' ? null : (
                <Column header="操作" command={redCommand} width={100} lock={ColumnLock.right} />
              )}
            </Table>
          </React.Fragment>
        ) : (
          <RedundantEmptyPage
            canCreateRedundantTable={canCreateRedundantTable}
            canEditRedundantTable={canEditRedundantTable}
            // appId={appId}
            quoteRedundantTable={handleQuoteTable}
          />
        )}
      </div>
    );
  }
);
export default Index;

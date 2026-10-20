/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable import/order */
/**
 * Table - 页面列表 - menu
 * @date: 2019-12-22
 * @author: wz
 * @version: 4.0.0
 * @copyright Copyright (c) 2019, Hand
 */
import React, { useRef, useState, useEffect, useContext, useMemo, FC } from 'react';
import notification from 'utils/notification';
import { DataSet, Button, TextField, Tooltip, Spin } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { runInAction } from 'mobx';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';

import Modal from '@/components/LowcodeModal';
import { ETableType } from '@/globalData/modelManager';
import globalStyles from '@/lowcodeGlobalStyles/global.less';
import {
  deleteModelList,
  modelReleaseService,
  refreshModelService, // 同步
  refreshWarningSubmitService, // 同步警告提交
} from '@/services/modelListService';
import _store, { IModelManagerStore } from '@/routes/Modeler/ModelDesigner/stores';

import CreateModel from './CreateModelModal/CreateModel';
import CreateApiModal from './CreateApiModal';
import RefreshModel from './RefreshModelModal';
import MenuList from './MenuList/index';
import ImgIcon from '@/utils/ImgIcon';
import styles from './index.less';
import BaseTableFieldDataSet from './CreateModelModal/BaseTableFieldDataSet'; // 新建逻辑模型基础表DS
import EditModelDataSet from './CreateModelModal/EditModelDataSet'; // 新建逻辑模型表单DS
import DataModelFieldDataSet from './CreateModelModal/DataModelFieldDataSet';
import isFailureResponse from '@/utils/isFailureResponse';
import { TagsScreen } from '@/routes/Modeler/hooks/tags';
import useModalMain from '@/routes/Modeler/hooks/useModalMain';
import { TargetType } from '@/globalData/common';
import { IHandleMenuQueryList } from '../../ListView';

const { confirm } = Modal;
// 静态数据
const modelModalKey = Modal.key();
type IUpdate = (props?: object) => any;
type IClose = () => any;
interface IModal {
  update: IUpdate;
  close: IClose;
}
let modelModal: IModal = {
  update: () => {},
  close: () => {},
};
// 静态数据
const refreshModalKey = Modal.key();
let refreshModal: IModal = {
  update: () => {},
  close: () => {},
};

interface IIndex extends IHandleMenuQueryList {
  // handleMenuQueryList: (params?: any) => any; // IHandleMenuQueryList;
}
const ListView: FC<IIndex> = observer((args: any) => {
  // fixme
  const { handleMenuQueryList } = args as IIndex;
  const ModelManagerStore = useContext<IModelManagerStore>(_store as any).store;
  const { openTagsManagerModal } = useModalMain();

  const {
    setDataStore,
    setModelDetailAll, // 设置中间区域的modelid/name/code
    setModelDataObjItem,
    setRightEditData,
    setApiDetailAll,
    storeData: {
      modelRadio,
      modelRefreshData,
      labelCodeList,
      modelDetail,
      resourceUponRoleHierarchy,
      modelDataObj: { content: modelList = [] } = {} as model.LogicModelTreeVO,
      selectedTenantId,
    },
    platformHidden,
    pageFun: { type: pageFunType },
    ref: { modelDetailRef, modelFormEditRef, menuListRef },
  }: IModelManagerStore = ModelManagerStore; // useContext<IModelManagerStore>(_store as any).store;

  const stepRef: any = useRef();
  const searchInputValueRef = useRef('');
  const currentNodeDataRef: any = useRef();
  const [editor, setEditor] = useState(false);
  const [rerenderSignal, setRerenderSignal] = useState(0);

  const dataModelFieldDataSet: DataSet = useMemo(
    () => new DataSet(DataModelFieldDataSet(undefined, resourceUponRoleHierarchy)),
    [resourceUponRoleHierarchy]
  );
  const dataModelFieldNoSelDataSet: DataSet = useMemo(
    () => new DataSet(DataModelFieldDataSet('')),
    []
  );
  const baseTableFieldDataSet: DataSet = useMemo(
    () => new DataSet(BaseTableFieldDataSet(dataModelFieldDataSet, resourceUponRoleHierarchy)),
    [dataModelFieldDataSet, resourceUponRoleHierarchy]
  );
  const editModelDataSet: DataSet = useMemo(
    () =>
      new DataSet(
        EditModelDataSet(
          dataModelFieldNoSelDataSet,
          baseTableFieldDataSet,
          modelList,
          resourceUponRoleHierarchy
        )
      ),
    [dataModelFieldNoSelDataSet, baseTableFieldDataSet, modelList, resourceUponRoleHierarchy]
  );

  useEffect(() => {
    const value = editModelDataSet?.current?.get('type');
    // setEditor(true);
    if (value === 'PLATFORM_SHARED') {
      setEditor(true);
      // eslint-disable-next-line no-unused-expressions
      editModelDataSet?.current?.set('assignPattern', 'BLOCK_LIST');
    } else {
      setEditor(false);
    }
  }, [editModelDataSet?.current?.get('type')]);

  const [warningSelectedList, setWarningSelectedList] = useState<model.SyncModelWarningVO[]>([]);
  const [step, setStep] = useState<number>(0); // 步骤
  const [openDeleModal, setOpenDeleModal] = useState<boolean>(false);
  // const [flag, setFlag] = useState<boolean>(false);
  stepRef.current = step;

  useEffect(() => {
    if (step !== -1) {
      modelModal.update({
        children: childrenCom,
        onOk: handleSaveModel,
        footer: modelFooter,
      });
    }
  }, [step, editor]);
  const [refreshMenuLoading, setRefreshMenuLoading] = useState(false);

  /**
   * 刷新浏览器
   */
  const refresh = () => {
    setRefreshMenuLoading(true);
    const timer = setTimeout(() => {
      clearTimeout(timer);
      setRefreshMenuLoading(false);
      // location.reload(); // 刷新所有服务
      if (pageFunType === 'model') {
        handleMenuQueryList({ dataSourceType: modelRadio });
      } else {
        // handleSourceMenuQuery('', sourceRadio);
        handleMenuQueryList({ dataSourceType: modelRadio, modelTypeList: ['PLATFORM_SHARED'] });
      }
    }, 500);
  };

  // 下一步1
  const handleStep1 = async () => {
    const val = await editModelDataSet?.current?.validate(true);
    if (val) {
      setStep(stepRef.current + 1);
    }
  };

  // 下一步2
  const handleStep2 = async () => {
    const val = await dataModelFieldDataSet.validate();
    if (val) {
      runInAction(() => {
        dataModelFieldNoSelDataSet.removeAll();
        dataModelFieldDataSet.forEach((item) => {
          dataModelFieldNoSelDataSet.create(item.toData());
        });
        setStep(stepRef.current + 1);
      });
    }
  };

  // 下一步3
  const handleSaveModel = async () => {
    const subCanAddFlagList = baseTableFieldDataSet
      ?.toData()
      .filter((record: any) => record?.subCanAddFlag);
    await editModelDataSet?.setState('subCanAddFlagList', subCanAddFlagList);
    await editModelDataSet?.setState('dataModelFieldData', dataModelFieldDataSet.toData());
    const data: model.LogicModel = currentNodeDataRef.current;
    if (editModelDataSet?.toData()?.length !== 0) {
      if (data && editModelDataSet?.current) {
        editModelDataSet.current.set('extendsParentCode', data?.code);
      }
      const valModel = await editModelDataSet.validate();
      if (valModel) {
        const valField = await dataModelFieldNoSelDataSet.validate();
        if (valField) {
          const res: any = await editModelDataSet.submit(); // fixme
          setDataStore('radioVal', 'fieldBtn');
          if (!isFailureResponse(res)) {
            setModelDetailAll(res?.content?.[0]);
            // eslint-disable-next-line no-unused-expressions
            menuListRef?.current?.handelSelect({ selectedKeys: [res?.content?.[0]?.id] });
            setStep(-1);
            modelModal.close();
            return handleMenuQueryList();
          }
        }
      }
      notification.error({
        message: '警告',
        description: '请输入必填信息',
      });
    }
    return false;
  };

  const childrenCom = (
    <CreateModel
      editor={editor}
      editModelDataSet={editModelDataSet}
      step={step === -1 ? 0 : step}
      currentNodeData={currentNodeDataRef.current}
      currentNodeDataRef={currentNodeDataRef}
      dataModelFieldNoSelDataSet={dataModelFieldNoSelDataSet}
      baseTableFieldDataSet={baseTableFieldDataSet}
      dataModelFieldDataSet={dataModelFieldDataSet}
      resourceUponRoleHierarchy={ModelManagerStore.storeData.resourceUponRoleHierarchy}
    />
  );

  const handleAfterClose = () => {
    // 关闭清空
    setStep(0);
    editModelDataSet.reset();
    dataModelFieldDataSet.removeAll();
    baseTableFieldDataSet.removeAll();
    dataModelFieldDataSet.setState('extendsParentCode', undefined);
    baseTableFieldDataSet.setState('extendsParentCode', undefined);
    currentNodeDataRef.current = null;
    if (!modelDetail.code) {
      setDataStore('name', null);
    }
  };

  // footer
  const modelFooter = (okBtn) => (
    <div className={globalStyles['model-footer']}>
      {(stepRef.current === 1 || stepRef.current === 2) && (
        <Button
          onClick={() => {
            if (stepRef.current === 2) {
              runInAction(() => {
                dataModelFieldDataSet.removeAll();
                dataModelFieldNoSelDataSet.forEach((item) => {
                  dataModelFieldDataSet.create(item.toData());
                });
              });
            }
            setStep(stepRef.current - 1);
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
      {stepRef.current === 2 && okBtn}
    </div>
  );

  // 添加模型
  const openModelModal = () => {
    modelModal = Modal.open({
      lowcodeSize: 'biggest',
      title: <div style={{ fontSize: '.18rem', fontWeight: 'bold' }}>新建表模型</div>,
      key: modelModalKey,
      destroyOnClose: true, // 关闭时是否销毁
      closable: true, // 显示右上角关闭按钮
      onOk: handleSaveModel,
      okText: '完成',
      children: childrenCom,
      footer: modelFooter,
      afterClose: handleAfterClose,
    });
  };

  // 同步模型
  useEffect(() => {
    refreshModal.update({
      footer: () => refreshModalFooter(modelRefreshData?.statusList),
    });
  }, [warningSelectedList]);

  const handleModelRefresh = async (currentNodeData: any = { id: '' }) => {
    setModelDataObjItem();
    const res: model.SyncModelResultVO = await refreshModelService({
      query: { id: currentNodeData?.id },
    });
    if (res && res.statusList) {
      setDataStore('modelRefreshData', res);
      setWarningSelectedList([]);
      refreshModal.update({
        children: refreshModalChildren(res, refreshModal.close),
        footer: () => refreshModalFooter(res.statusList),
      });
      setTimeout(() => {
        openRefreshModal(res, currentNodeData);
      });
    } else {
      const { message = '错误' }: any = res || {};
      notification.error({
        message,
      } as any);
    }
  };

  type IRefreshModalChildren = (
    responseData: model.SyncModelResultVO,
    refreshModalClose: any
  ) => React.ReactElement;
  const refreshModalChildren: IRefreshModalChildren = (responseData, refreshModalClose) => (
    <RefreshModel
      {...{
        refreshModalClose,
        responseData,
        setWarningSelectedList,
      }}
    />
  );

  type IRefreshModalFooter = (statusList: string[]) => React.ReactElement;
  const refreshModalFooter: IRefreshModalFooter = (statusList) => (
    <div className={globalStyles['model-footer']}>
      <Button onClick={() => refreshModal.close()}>知道了</Button>
      {(statusList || []).includes('warning') && (
        <Button
          color={ButtonColor.blue}
          onClick={submitRefreshWarning}
          disabled={warningSelectedList.length === 0}
        >
          确定
        </Button>
      )}
    </div>
  );
  const submitRefreshWarning = async () => {
    // 把斜杠转回null
    const dsFillToNullList = (selected) => {
      if (!selected || !Array.isArray(selected)) return selected;
      return selected.map((item) => {
        const data = item.toData();
        Object.keys(data).forEach((key) => {
          // eslint-disable-next-line no-param-reassign
          data[key] = data[key] === '/' ? null : data[key];
        });
        return data;
      });
    };
    const res = await refreshWarningSubmitService({ body: dsFillToNullList(warningSelectedList) });
    if (!res.failed) {
      refreshModal.close();
      notification.success({
        message: '操作成功',
      } as any);
    } else {
      const { message = '错误' } = res || {};
      notification.error({
        message,
      } as any);
    }
  };

  type IOpenRefreshModal = (
    responseData: model.SyncModelResultVO,
    currentNodeData: model.LogicModel
  ) => void;
  const openRefreshModal: IOpenRefreshModal = (responseData, currentNodeData) => {
    refreshModal = Modal.open({
      lowcodeSize: 'biggest',
      title: <div style={{ fontSize: '.18rem', fontWeight: 'bold' }}>同步结果</div>,
      key: refreshModalKey,
      destroyOnClose: true, // 关闭时是否销毁
      closable: true, // 显示右上角关闭按钮
      children: refreshModalChildren(responseData, refreshModal.close),
      footer: () => refreshModalFooter(responseData.statusList),
      afterClose: async () => {
        setWarningSelectedList([]); // 清除选中数据
        await handleMenuQueryList();
        if (modelDetailRef && modelDetailRef.current) {
          if (modelDetailRef.current.fieldInformationDataSetReset) {
            modelDetailRef.current.fieldInformationDataSetReset(); // 刷新表字段
          }
          if (modelDetailRef.current.redundantTableDataSetRest) {
            modelDetailRef.current.redundantTableDataSetRest(); // 刷新扩展表
          }
          if (modelDetailRef.current.listModelRelationDataSetReset) {
            modelDetailRef.current.listModelRelationDataSetReset(); // 刷新关系表
          }
        }
        if (currentNodeData) {
          // 切换到这个模型
          setModelDetailAll(currentNodeData);
        }
        setRightEditData('model');
        if (modelFormEditRef.current) {
          modelFormEditRef.current.detailFormReset();
        }
      },
    });
  };

  // 删除提示
  const moduleDeleteModel = async (currentNodeData: model.LogicModel = {} as any) => {
    setOpenDeleModal(true);
    if (!openDeleModal) {
      const submitOk =
        (await confirm(
          '删除该逻辑模型，运行态模型数据也将会被删除，可能会影响相关模型关系及已有页面的使用功能，你确定要删除吗？',
          'small'
        )) === 'ok'
          ? 'ok'
          : 'cancel';
      if (submitOk === 'ok') {
        setOpenDeleModal(false);
        const params = {
          body: currentNodeData,
        };
        const res = await deleteModelList(params);
        if (!isFailureResponse(res)) {
          await handleMenuQueryList({ dataSourceType: modelRadio });
          notification.success({
            message: '操作成功！',
          } as any);
          if (modelRadio === 'modelTable') {
            if (currentNodeData.code === modelDetail.code) {
              // 删除的是当前选中的 则清空中间
              setDataStore('modelDetail.code', null); // 肃清中间
            }
            setDataStore('isRightShow', 'no'); // 关闭右边操作栏
            setDataStore('name', null); // 清空标题
          } else {
            if (currentNodeData.code === modelDetail.code) {
              // 删除的是当前选中的 则清空中间
              setDataStore('modelDetail.code', null); // 肃清中间
            }
            setDataStore('isRightShow', 'no'); // 关闭右边操作栏
            setDataStore('modelDetail.name', null); // 清空标题
          }
        } else {
          notification.error({
            message: '错误',
            description: res.message,
          });
        }
      } else if (submitOk === 'cancel') {
        setOpenDeleModal(false);
      }
    }
  };

  /**
   * 删除
   * @param currentNodeData
   * @param grade
   */
  const handleDeleteNode = (currentNodeData: model.LogicModel) => {
    moduleDeleteModel(currentNodeData);
  };

  /**
   * 同步模型
   */
  const handleRefresh = (
    currentNodeData: model.LogicModel,
    grade: string // module
  ) => {
    switch (grade) {
      case 'module':
        handleModelRefresh(currentNodeData);
        break;
      default:
    }
  };

  /**
   * 发布
   * @param currentNodeData
   * @param parentNodeData
   * @param grade
   */
  const handleEnableNode = async (
    currentNodeData: model.LogicModel, // 暂时没用
    grade: string = 'module' // module
  ) => {
    const msg =
      modelRadio === 'modelTable'
        ? '您确定需要发布该逻辑模型吗？'
        : '首次发布API逻辑模型后将会自动生成API模型数据对象，如果再次发布将会执行更新操作，您确定发布该API模型吗？';
    const submitOk = (await confirm(msg, 'small')) === 'ok';
    if (submitOk) {
      switch (grade) {
        case 'module': {
          const res = await modelReleaseService({
            query: {
              id: currentNodeData.id,
            },
          });
          if (!isFailureResponse(res)) {
            await handleMenuQueryList({ dataSourceType: modelRadio });
            notification.success({
              message: '操作成功！',
            } as any);
            setModelDetailAll(currentNodeData);
            setRightEditData('model');
            if (modelFormEditRef.current) {
              modelFormEditRef.current.detailFormReset();
            }
          } else {
            notification.error({
              message: res.message ? res.message : '当前检测到的模型未进行任何变更，操作失败！',
            } as any);
          }
          break;
        }
        default:
      }
    }
  };

  const handleExtend = (currentNodeData: model.LogicModel) => {
    if (currentNodeData) {
      const {
        dataSourceType,
        dataSourceTypeMeaning,
        refSchemaName,
        refDataSourceType,
        refServiceCode,
        refTableCode,
        refTableName,
        code,
        id,
        name,
      } = currentNodeData;
      // 初始化数据
      editModelDataSet.loadData([
        {
          dataSourceType,
          dataSourceTypeMeaning,
          refSchemaName,
          refDataSourceType,
          refServiceCode,
          refTableCode,
          refTableName,
          code,
          type: 'TENANT',
          extendsParentName: name,
        },
      ]);
      handleAddNode(currentNodeData, true);
      // 继承后要依据当前数据进行查询
      baseTableFieldDataSet.removeAll();
      baseTableFieldDataSet.setState('extendsParentCode', code);
      dataModelFieldDataSet.setState('extendsParentCode', code);
      baseTableFieldDataSet.setQueryParameter('code', refTableCode);
      baseTableFieldDataSet.setQueryParameter('refDataSourceType', refDataSourceType);
      baseTableFieldDataSet.setQueryParameter('logicModelId', id);
      baseTableFieldDataSet.query();
    } else {
      notification.error({
        message: '错误',
        description: '继承数据失败！',
      });
    }
  };

  const menuPreps = {
    handleRefresh, // 同步
    handleEnableNode, // 发布
    handleDeleteNode,
    handleMenuQueryList,
    handleExtend,
  };

  /**
   * enter事件
   */
  // const handleEnterKey = async (e) => {
  //   if (e.nativeEvent.keyCode === 13) {
  //     // e.nativeEvent获取原生的事件对像
  //     setFlag(true);
  //   }
  // };

  // 切换清空过滤框
  // useEffect(() => {
  //   if (flag) {
  //     handleMenuQueryList();
  //   }
  //   setFlag(false);
  // }, [flag]);
  interface ICreateProps {
    ref: any;
    resourceUponRoleHierarchy: string;
  }
  const createProps: ICreateProps = {
    ref: useRef(),
    resourceUponRoleHierarchy: ModelManagerStore.storeData.resourceUponRoleHierarchy,
  };

  /**
   * 打开API模型新增弹窗
   */
  const openApiModal = () => {
    const handleAddEventClose = () => {
      // eslint-disable-next-line no-unused-expressions
      createProps?.ref?.current?.formRest();
    };
    const apiModal = Modal.open({
      key: Modal.key(),
      lowcodeSize: 'small',
      title: (
        <div
          style={{
            height: '314',
            fontSize: '16px',
            fontWeight: 600,
            lineHeight: '22px',
          }}
        >
          新建API逻辑模型
        </div>
      ),
      closable: true,
      children: <CreateApiModal {...createProps} />,
      afterClose: handleAddEventClose,
      footer: () => (
        <div>
          <Button
            onClick={() => {
              apiModal.close();
            }}
          >
            取消
          </Button>
          <Button
            className={styles['primary-blue-button']}
            color={ButtonColor.blue}
            onClick={async () => {
              const val = await createProps?.ref?.current?.saveCreateApi();
              if (val && val.content) {
                apiModal.close();
                setApiDetailAll(val.content[0]);
                setDataStore('apiDetailTab', 'fieldDefinition'); // 字段定义接口定义tab重置
                setDataStore('isRightShow', 'true'); // 显示右侧
                await handleMenuQueryList({ dataSourceType: ETableType.apiTable }); // 保存完成后 停留在当前tab页 刷新当前匹配菜单
                // eslint-disable-next-line no-unused-expressions
                menuListRef?.current?.handelSelect({ selectedKeys: [val?.content?.[0]?.id] });
              }
            }}
          >
            保存
          </Button>
        </div>
      ),
    });
  };

  /**
   * 新建数据对象
   */
  const handleAddNode = (currentNodeData?: model.LogicModel, extend: boolean = false) => {
    currentNodeDataRef.current = currentNodeData;

    const editModelDataSetDataAlready = editModelDataSet.toData() as Record<string | number, any>[];

    if (!extend) {
      editModelDataSet.loadData([
        {
          dataSourceType: 'TABLE',
          type: editModelDataSetDataAlready[0].type,
        },
      ]);
    }

    if (modelRadio === 'modelTable') {
      // 如果是平台级，增加flag标记
      baseTableFieldDataSet.setQueryParameter('logicModelId', undefined);
      baseTableFieldDataSet.setQueryParameter('code', undefined);
      baseTableFieldDataSet.setQueryParameter('refDataSourceType', undefined);
      openModelModal();
    } else {
      openApiModal();
    }
  };

  const filterInputDs = useMemo(
    () =>
      new DataSet({
        // autoCreate: true,
        fields: [
          {
            name: 'query',
            type: FieldType.string,
            required: false,
          },
        ],
      }),
    []
  );

  // 切换清空过滤框
  useEffect(() => {
    filterInputDs.reset();
    setDataStore('modelDataObjParams', null);
    searchInputValueRef.current = '';
  }, [modelRadio, pageFunType, resourceUponRoleHierarchy]);

  useEffect(() => {
    handleMenuQueryList();
  }, [labelCodeList]);

  // 切换租户清空搜索框和模型类型筛选 //
  useEffect(() => {
    ModelManagerStore.storeData.modelTypeList = [];
    filterInputDs.reset();
    setDataStore('modelDataObjParams', null);
    searchInputValueRef.current = '';
    setRerenderSignal(rerenderSignal + 1);
  }, [selectedTenantId]);

  return (
    <div className={styles['menu-left']}>
      {ModelManagerStore.pageFun.type === 'model' && (
        <div
          className={styles['create-new-model']}
          onClick={() => {
            handleAddNode();
          }}
        >
          <ImgIcon name="Creating model@v4.0.svg" size={14} style={{ marginRight: 4 }} />
          创建模型
        </div>
      )}
      <div className={styles['menu-left-query']}>
        <div className={styles['search-input-left']}>
          <TextField
            dataSet={filterInputDs}
            name="query"
            // onEnterDown={handleEnterKey}
            className={`${styles['master-model-input']} model-list-search-input`}
            placeholder="请输入逻辑模型名称"
            onInput={(e) => {
              searchInputValueRef.current = e.currentTarget.value;
            }}
            onChange={(value = '') => {
              setDataStore('modelDataObjParams', value);
            }}
            suffix={
              <ImgIcon
                name="search@v4.0.svg"
                size={14}
                onClick={() => {
                  setDataStore('modelDataObjParams', searchInputValueRef.current);
                }}
              />
            }
          />
        </div>
        {platformHidden && (
          <>
            <Tooltip title="标签管理" placement="right">
              <ImgIcon
                name="TagsManager.svg"
                size={16}
                style={{ marginLeft: 8, cursor: 'pointer' }}
                onClick={() => openTagsManagerModal({ callback: handleMenuQueryList })}
              />
            </Tooltip>
            <TagsScreen
              type={TargetType.MODEL}
              menuTagsScreenQuery={(list) => setDataStore('labelCodeList', list)}
              labelCodes={labelCodeList}
            />
          </>
        )}
        {refreshMenuLoading ? (
          <span className={styles['left-menu-list-refresh']}>
            <Spin size={'small' as any} className={globalStyles['spin-small']} />
          </span>
        ) : (
          <span className={styles['left-menu-list-refresh']} onClick={() => refresh()}>
            <Tooltip placement="top" title="刷新">
              <ImgIcon name="refresh.svg" size={16} />
            </Tooltip>
          </span>
        )}
      </div>
      <MenuList {...menuPreps} />
    </div>
  );
});

export default ListView;

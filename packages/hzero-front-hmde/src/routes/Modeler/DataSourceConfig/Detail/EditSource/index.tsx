/* eslint-disable react/jsx-props-no-spreading */
import React, { useState, useRef, useEffect, useContext } from 'react';
import { Button } from 'choerodon-ui/pro';
import { Steps } from 'choerodon-ui';
import notification from 'utils/notification';
import { observer } from 'mobx-react-lite';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { uuid } from '@/utils/common';
import { mapTree } from '../../utils/utils';

import _store, { ISourceManagerStore } from '@/routes/Modeler/DataSourceConfig/stores';
import {
  sourceEditService,
  sourceExtendService,
  sourceCreateService,
  querySourceDetailService,
  checkVirtualFields,
} from '@/services/modelDataSourceService';

import FirstStep from './FirstStep';
import SecondParts from './SecondParts';
import ThirdParts from './ThirdStep';
import CreateStep from './CreateStep';
import styles from '../index.less';

const { Step } = Steps;

interface IIndex {
  handleSourceMenuQuery: (
    data: string,
    type: string | null
  ) => Promise<model.data.DataSourceTreeVO>;
}
export default observer(({ handleSourceMenuQuery }: IIndex) => {
  const {
    ref: { firstStepRef, secondStepRef, thirdStepRef, createStepRef },
    virtualFields,
    setVirtualFields,
    setDataObjectTreeData,
    setDataObject,
    setDataObjectDetailAll,
    clearStoreAll,
    platformHidden,
    dataObject: { dataObjectDetail, dataRadio, dataObjectDetailType, dataObj, refDataSourceType },
    dataObjectTreeDataToJs,
  }: ISourceManagerStore = useContext<ISourceManagerStore>(_store as any).store;
  const [step, setStep] = useState<number>(0); // 步骤
  const [newData, setNewData] = useState<any[]>([]); // 原始模型字段中的数据 // fixme
  const loading: any = useRef(false);
  // 初始化数据
  useEffect(() => {
    loading.current = true;
    setStep(0);
    clearStoreAll('dataObject');
    if (dataObjectDetailType === 'create') {
      // 创建
      setDataObjectTreeData({} as model.data.BaseDataObject);
      loading.current = false;
    } else if ((dataObjectDetail.dataObjectId as any) !== true) {
      // fixme 可能为true 和 string number
      // 编辑
      // 查询数据
      editSourceQuery(dataObjectDetail.dataObjectId);
      loading.current = false;
    }
  }, [dataObjectDetailType, dataObjectDetail.dataObjectId]);

  // 编辑/查询数据
  const editSourceQuery = async (dataObjectId: string | number) => {
    if (dataObjectId) {
      const res: model.data.DataObject = await querySourceDetailService({
        query: { dataObjectId },
      });
      if (res && (res as any).failed) {
        // 错误
        notification.error({
          message: '警告',
          description: (res as any).message,
        });
        return;
      }
      if (res.extendsParentName) {
        setDataObjectDetailAll({
          ...dataObjectDetail,
          extendsParentName: res.extendsParentName,
        });
      }
      const masterModel = mapTree([res.masterModel], (item, self) => ({
        ...item,
        treeModelKey: item.dataModelId || uuid(),
        treeParentModelKey: self?.treeModelKey,
      }));
      setDataObjectTreeData({ ...res, masterModel: masterModel[0] });
      // // 传入数据认为都是修改数据
      // _sourceTreeData = mapTree(_sourceTreeData, (item) => ({ ...item, _status: 'update' }));
      // setDataObjectTreeData(_sourceTreeData);
    }
    loading.current = false;
  };

  /**
   * 表达式解析校验
   */
  const handleCheck = async (_virtualFields: model.data.BaseDataObjectField[] = []) => {
    const dataList: model.data.BaseDataObject = dataObjectTreeDataToJs;
    // newData.forEach((item) => {
    //   if (item.fields) {
    //     item.fields.forEach((i) => {
    //       dataList.push(i);
    //     });
    //   }
    // });
    Object.assign(dataList, { virtualFieldList: _virtualFields });
    const res = await checkVirtualFields({ body: dataList });
    if (res && res.failed) {
      notification.error({
        description: res.message,
      } as any);
      return false;
    }
    return true;
  };
  // 创建第一步
  const handleStep1 = async () => {
    if (loading.current) return; // 竞态处理
    loading.current = true;
    if (createStepRef.current && createStepRef.current.createStepSave) {
      // 保存
      const val = await createStepRef.current.createStepSave();
      loading.current = false;
      // 保存/校验/下一步
      if (val) {
        setStep(step + 1);
      }
    }
    loading.current = false;
  };
  // 第二步
  const handleStep2 = async () => {
    if (loading.current) return; // 竞态处理
    loading.current = true;
    if (firstStepRef.current && firstStepRef.current.handleSaveItem) {
      // 保存
      const val = await firstStepRef.current.handleSaveItem();
      loading.current = false;
      // 保存/校验/下一步
      if (val) {
        setStep(step + 1);
      }
    }
  };
  // 第三步
  const handleStep3 = async () => {
    if (loading.current) return; // 竞态处理
    loading.current = true;
    if (secondStepRef.current && secondStepRef.current.handleSaveSecond) {
      // 保存
      const val = await secondStepRef.current.handleSaveSecond();
      loading.current = false;
      // 保存/校验/下一步
      if (val) {
        setNewData(val);
        setStep(step + 1);
      }
    }
  };

  // 虚拟字段上一步
  const handleStep4 = async () => {
    if (loading.current) return; // 竞态处理
    loading.current = true;
    if (thirdStepRef.current && thirdStepRef.current.handleSaveThird) {
      // 保存
      const val = await thirdStepRef.current.handleSaveThird();
      loading.current = false;
      if (val) {
        // setThirdData(val);
        setStep(step - 1);
      }
    }
  };

  /**
   * 校验dataObjectCode
   */
  const checkSourceCode = (val) => {
    if (val && val.length > 32) {
      notification.error({
        description: '数据对象编码不能大于32位',
      } as any);
      return false;
    }
    return true;
  };

  // 关闭弹窗
  const handleModelClose = () => {
    setDataObjectTreeData({} as model.data.BaseDataObject);
    setVirtualFields([]); // 清空虚拟字段 重新查询后会更新重新更新 否则会出现乐观锁版本号问题
  };

  // 保存
  const handleSave = async () => {
    if (loading.current) return; // 竞态处理
    loading.current = true;
    // let seData = []; // 第二步数据
    let thData: model.data.BaseDataObjectField[] = []; // 第三步数据
    const _dataList: model.data.BaseDataObject = dataObjectTreeDataToJs;
    // 第三步保存
    thData = await (thirdStepRef.current?.handleSaveThird?.() || virtualFields);
    loading.current = false;
    if (thData) {
      const checked = await handleCheck(thData);
      if (!checked) {
        loading.current = false;
        return false;
      }
    } else {
      notification.error({
        message: '警告',
        description: '请按校验信息，完成表单内容。',
      });
      loading.current = false;
      return false;
    }
    if (newData && newData[0] && !checkSourceCode(newData[0].dataObjectCode)) {
      loading.current = false;
      return false;
    }
    const dataNew = await thirdStepRef.current.handleSaveThird(); // 第三步保存的数据
    // 校验虚拟字段
    if (dataNew) {
      const checked = await handleCheck(dataNew);
      if (!checked) {
        return false;
      }
    } else {
      notification.error({
        message: '警告',
        description: '请按校验信息，完成表单内容。',
      });
      return false;
    }
    if (newData) {
      // 保存
      let res = {};
      if (dataObjectDetailType === 'create') {
        // 新建操作
        res = await sourceCreateService({ body: _dataList });
      } else if (dataObjectDetailType === 'inherit') {
        // 继承操作
        // _dataList = _dataList.map((item) => {
        //   const temp: any = _dataList[0] || {};
        //   const { extendsParentCode, extendsParentName } = temp;
        //   return {
        //     ...item,
        //     extendsParentCode,
        //     extendsParentName,
        //     dataObjectOwnerType: 'TENANT',
        //   };
        // });
        _dataList.dataObjectOwnerType = 'TENANT';
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { dataObjectId, ...rest } = _dataList;
        res = await sourceExtendService({
          body: rest,
        });
      } else {
        // 修改操作
        res = await sourceEditService({ body: _dataList });
      }
      loading.current = false;
      if (res && (res as any).failed) {
        // 错误
        notification.error({
          message: '警告',
          description: (res as any).message,
        });
      } else {
        // 保存成功
        notification.success({
          message: '成功',
          description: ['create', 'inherit'].includes(dataObjectDetailType)
            ? '创建数据对象成功！'
            : '编辑数据对象成功！',
        });
        handleModelClose();
        await handleSourceMenuQuery('', null);
        setDataObject('dataObjectDetailType', 'see');
        setDataObject(`dataObjectSelectedKey.${dataRadio}`, res);
        setDataObjectDetailAll({
          dataObjectId: (res as any)?.dataObjectId,
          dataObjectName: (res as any)?.dataObjectName,
          dataObjectCode: (res as any)?.dataObjectCode,
          dataObjectCategory: (res as any)?.dataObjectCategory,
          assignPattern: (res as any)?.assignPattern,
          publishStatus: (res as any)?.publishStatus || false,
          dataObjectOwnerType: (res as any)?.dataObjectOwnerType,
          extendsParentCode: (res as any)?.extendsParentCode,
          extendsParentName: (res as any)?.extendsParentName,
          encryptId: (res as any)?.encryptId,
        });
        // setDataObjectTreeData(res);
      }
    } else {
      notification.error({
        message: '警告',
        description: '请处理字段命名冲突！',
      });
    }
  };
  /**
   * 步骤数组
   */
  const steps = [
    {
      title: '定义数据对象',
      content: (
        <CreateStep
          {...{
            dataList: dataObjectTreeDataToJs,
            setDataList: setDataObjectTreeData,
            // ref: createStepRef,
            dataObjectDetail,
            dataObjectDetailType,
            dataObj,
            platformHidden,
          }}
        />
      ),
    },
    {
      title: '配置数据关系及约束',
      content: dataObjectTreeDataToJs ? (
        <FirstStep
          {...{
            dataList: dataObjectTreeDataToJs,
            setDataList: setDataObjectTreeData,
            // ref: firstStepRef,
          }}
        />
      ) : (
        <div
          style={{
            height: '60vh',
            textAlign: 'center',
            paddingTop: '35vh',
            color: '#b6bbc6',
          }}
        >
          暂无可用的模型
        </div>
      ),
    },
    {
      title: '选择可用范围字段',
      content: (
        <SecondParts
          step={step}
          dataList={dataObjectTreeDataToJs}
          setDataList={setDataObjectTreeData}
        />
      ),
    },
    {
      title: '添加虚拟字段',
      content: (
        <ThirdParts
          step={step}
          // ref={thirdStepRef}
          secondRightData={newData}
          refDataSourceType={refDataSourceType}
        />
      ),
    },
  ];
  return (
    <div className={styles['global-pro']}>
      <Steps current={step}>
        {steps.map((item) => (
          <Step key={item.title} title={item.title} />
        ))}
      </Steps>
      <div
        style={{
          flex: 1,
          margin: '30px 0 10px',
          overflow: step === 2 ? 'hidden' : 'auto',
        }}
      >
        {steps[step].content}
      </div>
      <footer className={styles['edit-source-footer']}>
        <Button
          onClick={() => {
            if (dataObjectDetailType === 'edit') {
              setDataObject('dataObjectDetailType', 'see');
            } else {
              setDataObject('dataObjectDetailType', 'see');
              setDataObject('dataObjectDetail', {
                // ...dataObjectDetail,
                dataObjectCode: null,
                dataObjectName: null,
              });
            }
          }}
        >
          取消
        </Button>
        {![0, 1, 2].includes(step) && (
          <Button
            onClick={async () => {
              if (step === 2) {
                if (loading.current) return; // 竞态处理
                loading.current = true;
                if (secondStepRef.current && secondStepRef.current.handleSaveSecond) {
                  // 保存
                  const val = await secondStepRef.current.handleSaveSecond();
                  loading.current = false;
                  // 保存/校验/下一步
                  if (val) {
                    setNewData(val);
                    setStep(1);
                  }
                }
              } else if (step === 3) {
                // handleStep4();
                await thirdStepRef.current?.handleSaveThird?.();
              }
              setStep(1);
            }}
          >
            返回第二步
          </Button>
        )}
        {step !== 0 && (
          <Button
            onClick={async () => {
              if (step === 1) {
                if (loading.current) return;
                loading.current = true;
                await firstStepRef.current.handleSaveItem();
                loading.current = false;
                setStep(step - 1);
              } else if (step === 2) {
                if (loading.current) return;
                loading.current = true;
                if (secondStepRef.current && secondStepRef.current.handleSaveSecond) {
                  // 保存
                  const val = await secondStepRef.current.handleSaveSecond();
                  loading.current = false;
                  // 保存/校验/下一步
                  if (val) {
                    setNewData(val);
                    setStep(step - 1);
                  }
                }
              } else if (step === 3) {
                handleStep4();
                loading.current = false;
                setStep(step - 1);
              } else {
                loading.current = false;
                setStep(step - 1);
              }
            }}
          >
            上一步
          </Button>
        )}
        {step !== 3 && (
          <Button
            color={ButtonColor.primary}
            onClick={() => {
              switch (step) {
                case 0:
                  return handleStep1();
                case 1:
                  return handleStep2();
                case 2:
                  return handleStep3();
                default:
              }
            }}
          >
            下一步
          </Button>
        )}
        {step === 3 && (
          <>
            <Button color={ButtonColor.primary} onClick={() => handleSave()}>
              保存
            </Button>
          </>
        )}
      </footer>
    </div>
  );
});

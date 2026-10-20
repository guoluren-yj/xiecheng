import React, { useMemo, useState, useEffect, useContext, useImperativeHandle } from 'react';
import { Form, DataSet, TextField, Select, SelectBox } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import notification from 'utils/notification';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import { uuid } from '@/utils/common';

import Lov from '@/components/LowcodeLov';
import { EModelType, ESourceCategory } from '@/globalData/modelManager';
import { queryModelDataService } from '@/services/modelDataSourceService';
import _store, {
  ISourceManagerStore,
  ISourceDetail,
} from '@/routes/Modeler/DataSourceConfig/stores';

import CreateStepDS from './CreateStepDS';
import styles from '../../index.less';

const { Option } = Select;

interface IIndex {
  dataList: model.data.BaseDataObject;
  setDataList: any;
  dataObjectDetail: ISourceDetail;
  dataObjectDetailType: string;
  dataObj: model.data.DataSourceTreeVO;
  platformHidden;
}
const Index = observer(
  ({
    dataList,
    setDataList,
    dataObjectDetail,
    dataObjectDetailType,
    dataObj,
    platformHidden,
  }: IIndex) => {
    const {
      ref: { createStepRef },
    }: ISourceManagerStore = useContext<ISourceManagerStore>(_store as any).store;
    const [editor, setEditor] = useState(false);
    // 创建ds
    const createStepDS = useMemo(
      () => new DataSet(CreateStepDS({ dataObjectDetailType, dataObj, platformHidden })),
      [dataObj, dataObjectDetailType, platformHidden]
    );
    useImperativeHandle(createStepRef, () => ({
      createStepSave, // 保存当前数据
    }));

    useEffect(() => {
      const value = createStepDS?.current?.get('dataObjectOwnerType');
      setEditor(true);
      if (value === 'PLATFORM_SHARED') {
        setEditor(true);
      } else {
        setEditor(false);
      }
    }, [createStepDS?.current?.get('dataObjectOwnerType')]);

    // 下一步的数据（设置name值）
    const createStepSave = async () => {
      const val = await createStepDS.validate();
      if (!val) return false;
      const _dataList = {
        ...dataList,
        dataObjectName: createStepDS?.current?.get('dataObjectName'), // 设置name值
        dataObjectCode: createStepDS?.current?.get('dataObjectCode'), // 设置code值
        extendsParentCode: createStepDS?.current?.get('extendsParentCode'),
        extendsParentName: createStepDS?.current?.get('extendsParentName'),
        assignPattern:
          createStepDS?.current?.get('dataObjectOwnerType') === 'PLATFORM_SHARED'
            ? createStepDS?.current?.get('assignPattern')
            : undefined,
      };
      setDataList(_dataList);
      return true;
    };
    // 编辑/初始化数据
    useEffect(() => {
      if (dataList) {
        createStepDS.removeAll();
        const {
          dataObjectOwnerType,
          dataObjectName,
          dataObjectCode,
          extendsParentCode,
          extendsParentName,
          masterModel: { logicModelId, logicModelName } = {},
          assignPattern,
        } = dataList;
        let record = {
          sourceDetailType: dataObjectDetailType,
          dataObjectOwnerType,
          dataObjectName,
          dataObjectCode,
          logicModelName,
          assignPattern,
          masterModel: {
            id: logicModelId, // 有错误，联调时修改
            name: logicModelName,
          },
        };
        if (dataObjectDetailType === 'inherit' || extendsParentName) {
          record = Object.assign(record, { extendsParentCode, extendsParentName });
        }
        createStepDS.create(record);
      }
    }, [dataObjectDetail.dataObjectCode]);
    // // 主模型lov变动/创建/制造数据
    useEffect(() => {
      createStepDS.addEventListener('update', createTreeData);
      return () => {
        createStepDS.removeEventListener('update', createTreeData);
      };
    }, []);
    const createTreeData = async ({ value }) => {
      const logicModelId = value && value.id;
      if (!logicModelId) return;
      const res = await queryModelDataService({ query: { id: logicModelId } });
      if (res && (res as any).failed) {
        // 错误
        notification.error({
          message: '警告',
          description: (res as any)?.message,
        });
      } else {
        setDataList({
          assignPattern: createStepDS?.current?.get('assignPattern'),
          dataObjectCategory: ESourceCategory.TABLE,
          dataObjectCode: createStepDS?.current?.get('dataObjectCode'),
          dataObjectName: createStepDS?.current?.get('dataObjectName'),
          dataObjectOwnerType: createStepDS?.current?.get('dataObjectOwnerType'),
          logicModelCode: res.code,
          masterModel: {
            children: [],
            conditions: [],
            fields: res.modelFields,
            joinType: 'left_join',
            treeModelKey: uuid(), // 树节点key值
            logicModelId: res.id,
            logicModelCode: res.code,
            logicModelName: res.name,
            masterFlag: 1,
            operateFlag: res.operateFlag,
            referenceTableName: res.refTableName,
          },
          virtualFieldList: [],
          _status: 'create',
        });
      }
    };
    return (
      <div className={styles['create-step-content']}>
        <Form dataSet={createStepDS} labelLayout={LabelLayout.vertical}>
          {!platformHidden && dataObjectDetailType !== 'inherit' && (
            <Select name="dataObjectOwnerType" disabled={dataObjectDetailType === 'edit'}>
              <Option value={EModelType.PLATFORM}>平台自定义数据对象</Option>
              <Option value={EModelType.PLATFORM_SHARED}>平台共享数据对象</Option>
            </Select>
          )}
          <TextField name="dataObjectCode" disabled={dataObjectDetailType === 'edit'} />
          <TextField name="dataObjectName" />
          {!['edit', 'inherit'].includes(dataObjectDetailType) && (
            <Lov
              name="masterModel"
              clearButton={false}
              disabled={dataObjectDetailType === 'edit'}
              noCache
            />
          )}
          {dataObjectDetailType === 'edit' && <TextField name="logicModelName" disabled />}
          {(dataObjectDetailType === 'inherit' || dataObjectDetail.extendsParentName) && (
            <TextField name="extendsParentName" disabled />
          )}
          {editor ? (
            <SelectBox name="assignPattern" disabled={dataObjectDetailType === 'edit'}>
              <Option value="ALLOW_LIST">白名单模式</Option>
              <Option value="BLOCK_LIST">黑名单模式</Option>
            </SelectBox>
          ) : null}
        </Form>
      </div>
    );
  }
);
export default Index;

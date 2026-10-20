/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable import/order */
import React, {
  useState,
  useRef,
  useMemo,
  forwardRef,
  useImperativeHandle,
  useContext,
} from 'react';
import { Row, Col } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';
// import { isEmpty } from 'lodash';

import _store, { ISourceManagerStore } from '@/routes/Modeler/DataSourceConfig/stores';
import { ESourceCategory } from '@/globalData/modelManager';

import styles from './index.less';
import StrLeftDrawing from './StrLeftDrawing';
import StrRightFrom from './StrRightFrom';
import { mapTree } from '@/utils/treeUtils';

interface IIndex {
  dataList: model.data.BaseDataObject;
  setDataList: (data: any) => void;
}
const Index = observer(({ dataList, setDataList }: IIndex) => {
  const {
    ref: { firstStepRef },
    dataObject: {
      level,
      tenantId,
      dataObjectDetailType,
      dataObjectDetail: { extendsParentName },
    },
    virtualFields,
    // setVirtualFields,
    setSecondLeftData,
    setSecondRightData,
  }: ISourceManagerStore = useContext<ISourceManagerStore>(_store as any).store;
  const strRightFromRef: any = useRef();
  const [rightFormData, setRightFormData] = useState<model.data.DataObjectModel>();
  useImperativeHandle(firstStepRef, () => ({
    handleSaveItem, // 保存当前数据
  }));

  useMemo(() => {
    const data: model.data.DataObjectModel = dataList.masterModel;
    // 初始化
    // if (isEmpty(virtualFields) && dataList?.masterModel?.masterFlag) {
    //   // 选中主模型时 拆分全局虚拟字段和模型字段 注： 虚拟字段只保留着主模型当中
    //   const _virtualFields = dataList.virtualFieldList
    //     .map((item) => ({ ...item, modelId: dataList.masterModel.logicModelId }));
    //   setVirtualFields(_virtualFields);
    // }
    if (data) {
      setRightFormData(data);
    }
  }, []);

  /**
   * 保存当前数据——将右侧筛选逻辑匹配左侧模型，并设置进保存提交的数据结构中
   * @returns {boolean|*}
   */
  // interface IData {
  //   conditions: model.data.DataObjectModelConditions[];
  //   joinType: string;
  //   strongRelationFlag: number;
  //   logicModelCode: string;
  //   logicModelId: string;
  // }
  interface IHandleRightFromSubmit {
    handleRightFromSubmit: () => boolean | model.data.DataObjectModel;
  }
  const handleSaveItem = () => {
    const {
      handleRightFromSubmit = () => ({} as any),
    }: IHandleRightFromSubmit = strRightFromRef.current;
    // 抓取最新的数据（rightFromData）
    const newRightFormData = handleRightFromSubmit();
    if (!newRightFormData) {
      return false;
    }
    // 保存数据，遍历主模型树形数据，将右侧筛选逻辑赋值给左侧模型
    const _masterModel = mapTree([dataList.masterModel], (newItem: model.data.DataObjectModel) => {
      if (
        newItem?.logicModelId === (newRightFormData as model.data.DataObjectModel)?.logicModelId &&
        newItem.treeParentModelKey ===
          (newRightFormData as model.data.DataObjectModel)?.treeParentModelKey
      ) {
        return {
          // 判断
          ...newItem,
          ...(newRightFormData as model.data.DataObjectModel),
        };
      }
      return newItem;
    });
    const _dataList = { ...dataList, masterModel: _masterModel[0] };
    setDataList(_dataList);
    return _dataList;
  };

  /**
   * 切换模型关系
   * @param data
   * @returns {boolean}
   */
  const handleClickItem = (data: model.data.DataObjectModel) => {
    if (
      rightFormData &&
      dataList?.dataObjectCategory !== ESourceCategory.API &&
      data.logicModelCode === rightFormData.logicModelCode &&
      data.dataObjectId === rightFormData.dataObjectId
      // data.relationCode === rightFormData.relationCode
    ) {
      return false;
    } // 控制点击同一个模型 不重新初始化设置 返回false 不重新设置样式
    // 保存
    if (handleSaveItem()) {
      // if (data.masterFlag) {
      //   const modelFields = (data || {}).fields?.filter(
      //     (item) => item.fieldType !== EFieldType.VIRTUAL_FIELD
      //   );
      //   Object.assign(data, { fields: modelFields });
      // }
      // 切换数据
      setRightFormData(data);
      return true;
    }
    return false;
  };

  const dataListProps = {
    dataList,
    setDataList,
    handleClickItem,
    setRightFormData,
    handleSaveItem,
    setSecondLeftData,
    setSecondRightData,
  };
  const strRightFromProps = {
    rightFormData,
    virtualFields,
    dataList,
    setRightFormData,
    wrappedComponentRef: strRightFromRef,
    isTenant: level === 'tenant',
    dataObjectDetailType,
    extendsParentName,
    tenantId,
  };

  return (
    <article
      style={{
        margin: '10px 10px 0px',
      }}
    >
      <Row className={styles['h-100']}>
        <Col span={8}>
          <StrLeftDrawing {...dataListProps} />
        </Col>
        <Col span={16}>
          <div className={styles['right-step-right']}>
            <StrRightFrom {...strRightFromProps} />
          </div>
        </Col>
      </Row>
    </article>
  );
});
export default forwardRef((props: any) => <Index {...props} />);

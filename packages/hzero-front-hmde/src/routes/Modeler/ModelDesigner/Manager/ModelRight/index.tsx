/* eslint-disable react/jsx-props-no-spreading */
import React, { useContext, useState, useEffect } from 'react';
import { Icon, Tooltip, Tabs } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';

import _store, { IModelManagerStore } from '@/routes/Modeler/ModelDesigner/stores';
import EmptyPage from '@/routes/Modeler/component/EmptyPage';
import ImgIcon from '@/utils/ImgIcon';

import styles from './index.less';
import ModelFormEdit from './ModelFormEdit';
import FieldsEdit from './FieldsEdit';
import RelationEdit from './RelationEdit';
import { IHandleMenuQueryList } from '../../ListView';

const { TabPane } = Tabs;
export interface IParams extends IHandleMenuQueryList {
  // handleMenuQueryList: IHandleMenuQueryListParams;
}

export default observer(({ handleMenuQueryList }: IParams) => {
  const modelManagerStore = useContext<IModelManagerStore>(_store as any).store;
  const {
    setRightEditData, // 设置右侧菜单内容
    setIsModelShow, // 设置侧边栏是否显示
    ref: { modelDetailRef, apiDetailRef },
    storeData: {
      modelRadio,
      modelDetail, // 左边栏数据
      modelAttribute,
      fieldAttribute,
      fieldShowEmpty,
      relationShowEmpty,
      relationAttribute,
      // historyRightListName, // 右侧侧边栏点击历史
    },
  }: IModelManagerStore = modelManagerStore; // useContext<IModelManagerStore>(_store as any).store;

  const [activeKey, setActiveKey] = useState('model');

  useEffect(() => {
    if (modelAttribute) {
      setActiveKey('model');
    } else if (fieldAttribute || fieldShowEmpty) {
      setActiveKey('field');
    } else if (relationAttribute || relationShowEmpty) {
      setActiveKey('relation');
    }
  }, [modelAttribute, fieldAttribute, fieldShowEmpty, relationAttribute, relationShowEmpty]);

  const FieldsEditProps = {
    handleMenuQueryList,
  };
  const ModelFormEditProps = {
    // 模型form操作栏参数
    handleMenuQueryList,
  };
  const RelationEditProps = {
    handleMenuQueryList,
    // modelDetailRef,
    modelDetail,
    relationAttribute,
    setIsModelShow,
    // perHidden,
    perHidden: false,
  };

  const handleRightTitle = (_activeKey: string = 'model'): void => {
    switch (_activeKey) {
      case 'model':
        setRightEditData('model');
        break;
      case 'field':
        if (modelRadio === 'modelTable') {
          if (modelDetailRef.current && modelDetailRef.current.fieldAttributeReset) {
            modelDetailRef.current.fieldAttributeReset(true);
          }
        } else if (modelRadio === 'apiTable') {
          if (apiDetailRef.current && apiDetailRef.current.fieldAttributeReset) {
            apiDetailRef.current.fieldAttributeReset(true);
          }
        }
        break;
      case 'relation':
        if (modelDetailRef.current && modelDetailRef.current.relationAttributeReset) {
          modelDetailRef.current.relationAttributeReset(true);
        }
        break;
      case 'close':
        setIsModelShow('right', 'false');
        break;
      default:
    }
    setActiveKey(_activeKey);
  };

  const emptyPageProps = {
    styles: {
      imgWrapperHeight: 150,
      imgWrapperWidth: 150,
      imgWrapperMargin: '50% auto',
      marginLeft: 0,
      messageFontSize: '14px',
    },
  };

  return (
    <div className={styles['right-list-content']}>
      {/* <div> */}
      {/* <h4
          className={modelAttribute ? styles['title-active'] : ''}
          onClick={() => handleRightTitle('model')}
        >
          模型属性
        </h4>
        {historyRightListName === 'field' && (
          <h4
            className={fieldAttribute || fieldShowEmpty ? styles['title-active'] : ''}
            onClick={() => handleRightTitle('field')}
          >
            字段属性
          </h4>
        )}
        {historyRightListName === 'relation' && (
          <h4
            className={relationAttribute || relationShowEmpty ? styles['title-active'] : ''}
            onClick={() => handleRightTitle('relation')}
          >
            关系属性
          </h4>
        )} */}
      <Tabs
        activeKey={activeKey}
        onChange={(_activeKey) => {
          handleRightTitle(_activeKey);
        }}
        className={styles['detail-panel']}
      >
        <TabPane
          tab={
            <Tooltip placement="top" title="模型属性">
              <span>
                {['model'].includes(activeKey) ? (
                  <ImgIcon size={16} name="model-selected@v4.0.svg" />
                ) : (
                  <ImgIcon size={16} name="tabicon-model.svg" />
                )}
              </span>
            </Tooltip>
          }
          key="model"
        >
          <ModelFormEdit {...ModelFormEditProps} />
        </TabPane>
        {
          /* historyRightListName === 'field' && */
          // 先使用 false 将字段属性隐藏
          modelRadio === 'apiTable' && (
            <TabPane
              tab={
                <Tooltip placement="top" title="字段属性">
                  <span onClick={() => handleRightTitle('field')}>
                    {['field'].includes(activeKey) ? (
                      <ImgIcon size={16} name="field-selected@v4.0-210514.svg" />
                    ) : (
                      <ImgIcon size={16} name="field@v4.0.svg" />
                    )}
                  </span>
                </Tooltip>
              }
              key="field"
            >
              {fieldAttribute ? (
                <FieldsEdit {...FieldsEditProps} />
              ) : (
                <EmptyPage message="当前暂无字段信息，请选择模型字段。" {...emptyPageProps} />
              )}
            </TabPane>
          )
        }
        {
          /* historyRightListName === 'relation' && */ modelRadio !== 'apiTable' && (
            <TabPane
              tab={
                <Tooltip placement="top" title="关系属性">
                  <span onClick={() => handleRightTitle('relation')}>
                    {['relation'].includes(activeKey) ? (
                      <ImgIcon size={16} name="relationship-selected@v4.0-210514.svg" />
                    ) : (
                      <ImgIcon size={16} name="relationship@v4.0.svg" />
                    )}
                  </span>
                </Tooltip>
              }
              key="relation"
            >
              {relationAttribute ? (
                <RelationEdit {...RelationEditProps} />
              ) : (
                <EmptyPage message="当前暂无模型关系信息，请选择模型关系" {...emptyPageProps} />
              )}
            </TabPane>
          )
        }
        <TabPane
          tab={
            <Tooltip placement="top" title="收起">
              <span>
                <Icon type="format_indent_increase" />
              </span>
            </Tooltip>
          }
          key="close"
        />
      </Tabs>
      {/* <span onClick={() => setIsModelShow('right', 'false')}>
        <Tooltip title="收起">
          <Icon type="format_indent_increase" />
        </Tooltip>
      </span> */}
      {/* </div> */}
      {/* {modelAttribute && <ModelFormEdit {...ModelFormEditProps} />} */}
      {/* {fieldAttribute && <FieldsEdit {...FieldsEditProps} />}
      {fieldShowEmpty && (
        <EmptyPage message="当前暂无字段信息，请选择模型字段。" {...emptyPageProps} />
      )}
      {relationShowEmpty && (
        <EmptyPage message="当前暂无模型关系信息，请选择模型关系" {...emptyPageProps} />
      )}
      {relationAttribute && <RelationEdit {...RelationEditProps} />} */}
    </div>
  );
});

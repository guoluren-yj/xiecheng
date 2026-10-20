import React, { useMemo, useEffect } from 'react';
import {
  TextField,
  Icon,
  Spin,
  DataSet,
  Form,
  Switch,
  SelectBox,
  Select,
  Button,
  Output,
} from 'choerodon-ui/pro';
import { List, Popover } from 'choerodon-ui';
import intl from 'srm-front-boot/lib/utils/intl';
import { debounce } from 'lodash';
import { Observer } from 'mobx-react-lite';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { ButtonType, ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';

import TLoader from './TLoader';
import styles from '../index.less';
import EnableRender from '../TrueOrFalseRender/EnableRender';
import RelationTypeRender from '../TrueOrFalseRender/RelationTypeRender';

const { Item } = List;
const { Option } = Select;
const [
  SLAVE_MASTER, // 从主
  LINK, // 关联
] = ['SLAVE_MASTER', 'LINK'];
const filterQueryParameters = {
  enabledFlag: undefined,
  associateType: undefined,
  onlySingleFieldFlag: undefined,
  conditionExistedFlag: undefined,
};
interface IIndex {
  autoLoadMore?: any;
  leftMenuRef: any;
  listDs: DataSet;
  setBusinessObjectAssociateId?: any;
}
// 搜索ds
const Index = ({
  autoLoadMore = true,
  leftMenuRef,
  listDs,
  setBusinessObjectAssociateId = () => {},
}: IIndex) => {
  const TLoaderRef = React.useRef<any>(null);
  const searchValueRef = React.useRef<any>(null);
  const [currentId, setCurrentId] = React.useState<string>('');
  const [showLoadingMore, setShowLoadingMore] = React.useState<boolean>(true);
  const [loadingMore, setLoadingMore] = React.useState<boolean>(false);

  const searchDs = useMemo(
    () =>
      new DataSet({
        autoCreate: true,
        fields: [
          {
            name: 'searchName',
            type: 'string',
          },
        ],
        events: {
          update: ({ name, value }) => {
            if (name === 'searchName') {
              searchValueRef.current = value;
            }
          },
        },
      } as DataSetProps),
    []
  );

  const filterDs = useMemo(
    () =>
      new DataSet({
        autoCreate: true,
        fields: [
          {
            name: 'enabledFlag',
            type: 'boolean',
            label: intl.get('hzero.common.model.status.enabledFlag').d('状态'),
            defaultValue: true,
          },
          {
            name: 'enabledText',
            type: 'string',
            defaultValue: intl.get('hzero.common.model.status.enable').d('启用'),
          },
          {
            name: 'associateType',
            type: 'string',
            label: intl.get('hmde.bo.field.associateType').d('关系'),
          },
          {
            name: 'onlySingleFieldFlag',
            type: 'boolean',
            label: intl.get('hzero.common.model.type').d('类型'),
          },
          {
            name: 'conditionExistedFlag',
            type: 'boolean',
            label: intl.get('hmde.bo.field.prevConditions').d('前置条件'),
          },
        ],
        events: {
          update: ({ name, value, record }) => {
            if (name === 'searchName') {
              searchValueRef.current = value;
            }
            if (name === 'enabledFlag') {
              record.set(
                'enabledText',
                value
                  ? intl.get('hzero.common.model.status.enable').d('启用')
                  : intl.get('hzero.common.model.status.disable').d('禁用')
              );
            }
          },
        },
      } as DataSetProps),
    []
  );

  const init = async () => {
    const res = await listDs.query();
    if (!currentId) {
      setCurrentId(res?.content?.[0]?.businessObjectAssociateId);
    }
    if (res && !res.failed && res?.content?.length > 0) {
      setBusinessObjectAssociateId(res?.content?.[0]?.businessObjectAssociateId);
    } else {
      // 菜单没有数据则置空
      setBusinessObjectAssociateId(undefined);
    }
  };

  useEffect(() => {
    init();
  }, [listDs]);

  /**
   * 菜单搜索
   */
  const handleListSearch = () => {
    // eslint-disable-next-line guard-for-in
    for (const key in filterQueryParameters) {
      listDs.setQueryParameter(key, null);
    }
    listDs.setQueryParameter('keyword', searchValueRef.current);
    setShowLoadingMore(false);
    return listDs.query();
  };

  const filterQuery = () => {
    const params = filterDs?.current?.toData();
    // eslint-disable-next-line guard-for-in
    for (const key in filterQueryParameters) {
      listDs.setQueryParameter(key, params[key]);
    }
    return listDs.query();
  };

  // 获取下一页
  const handleLoadMore = React.useCallback(
    debounce((resolve: () => {}) => {
      setLoadingMore(true);
      listDs.queryMore(listDs.currentPage + 1).finally(() => {
        setLoadingMore(false);
        resolve();
      });
    }, 500),
    [loadingMore]
  );

  const handleSelectItem = (item) => {
    setCurrentId(item?.businessObjectAssociateId);
    setBusinessObjectAssociateId(item?.businessObjectAssociateId);
  };

  const renderItem = (item) => {
    if (!item) {
      return;
    }
    const itemClassName = currentId === item?.businessObjectAssociateId ? 'list-item-active' : '';
    const preConditionObj = item?.businessObjectAssociateFieldList?.find?.(
      (field) => field?.associateFieldType === 'CONSTANT'
    );
    return (
      <Item key={item.code} className={`${styles['item-wrapper']} ${styles[itemClassName]}`}>
        <div className={styles['item-content']} onClick={handleSelectItem.bind(null, item)}>
          <div className={styles['item-title']}>
            <span>{item?.associateName}</span>
            <EnableRender enabledFlag={item?.enabledFlag} />
          </div>
          <RelationTypeRender associateType={item?.associateType} />
          <div className={styles['item-remark']} style={{ color: 'rgba(0,0,0,0.45)' }}>
            <span className={styles['content-title']}>[目标对象]</span>
            {item?.associateBusinessObjectName}
          </div>
          <div className={styles['item-type']}>
            <span className={styles['content-title']}>{preConditionObj ? '[条件]' : '无条件'}</span>
            {preConditionObj && (
              <>
                <span>&apos;{preConditionObj?.masterBusinessObjectFieldName}&apos;</span>
                <span style={{ padding: '0 4px' }}>=</span>
                <span>{preConditionObj?.associateValue}</span>
              </>
            )}
            {/* {conditionFlag && (
              <div className={styles['item-condition']}>
                {intl.get('hmde.bo.advanced.condition').d('条件')}
              </div>
            )} */}
          </div>
        </div>
      </Item>
    );
  };

  const content = (
    <div style={{ display: 'flex', width: 380, flex: 1, flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Form dataSet={filterDs} style={{ width: '50%' }} labelWidth={60}>
          <Switch name="enabledFlag" />
        </Form>
        <Output dataSet={filterDs} name="enabledText" />
      </div>
      <Form dataSet={filterDs} labelWidth={60}>
        {/* <Switch name="enabledFlag" /> */}
        <SelectBox name="associateType">
          <Option value={LINK}>{intl.get('hmde.bo.view.messages.link').d('关联')}</Option>
          <Option value={SLAVE_MASTER}>
            {intl.get('hmde.bo.view.messages.salve_master').d('从主')}
          </Option>
        </SelectBox>
        <SelectBox name="onlySingleFieldFlag">
          <Option value>
            {intl.get('hzero.common.model.singleFieldRelation').d('单字段关系')}
          </Option>
          <Option value={false}>
            {intl.get('hmde.bo.view.messages.moreFieldRelation').d('多字段关系')}
          </Option>
        </SelectBox>
        <SelectBox name="conditionExistedFlag">
          <Option value={false}>{intl.get('hmde.bo.field.noCondition').d('无条件')}</Option>
          <Option value>{intl.get('hmde.bo.view.messages.conditions').d('有条件')}</Option>
        </SelectBox>
        {/* <Switch name="onlySingleFieldFlag" />
        <Switch name="conditionExistedFlag" /> */}
      </Form>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button onClick={() => filterDs.reset()}>
          {intl.get('hzero.common.button.reset').d('重置')}
        </Button>
        <Button type={ButtonType.submit} color={ButtonColor.primary} onClick={filterQuery}>
          {intl.get('hzero.common.button.query').d('查询')}
        </Button>
      </div>
    </div>
  );

  // 重置当前选中菜单id
  const resetCurrentId = (curId) => {
    setCurrentId(curId);
  };

  React.useImperativeHandle(leftMenuRef, () => ({
    handleListSearch,
    resetCurrentId,
  }));

  return (
    <Observer>
      {() => (
        <>
          <div className={styles['list-search']}>
            <TextField
              name="searchName"
              className={styles['input-wrapper']}
              dataSet={searchDs}
              onEnterDown={handleListSearch}
              prefix={<Icon type="search" style={{ color: '#D0D0D0' }} />}
              placeholder={intl.get('hmde.bo.message.search.keywords').d('请搜索关键词')}
            />
            <div className={styles['list-filter']}>
              <Popover content={content}>
                <Icon type="filter2" />
              </Popover>
            </div>
          </div>
          <div className={styles['list-area']}>
            <TLoader
              ref={TLoaderRef}
              // onRefresh={handleRefresh}
              hasMore={showLoadingMore && listDs.length > 0}
              onLoadMore={handleLoadMore}
              autoLoadMore={autoLoadMore}
              className={styles['t-loader']}
            >
              <Spin dataSet={listDs}>
                <List dataSource={listDs.toData()} renderItem={renderItem} />
              </Spin>
            </TLoader>
          </div>
        </>
      )}
    </Observer>
  );
};
export default formatterCollections({ code: 'hmde' })(Index);

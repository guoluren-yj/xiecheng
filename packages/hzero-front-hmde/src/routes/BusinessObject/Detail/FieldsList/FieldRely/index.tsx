import React, { useState, useMemo, useRef, useEffect } from 'react';
import intl from 'srm-front-boot/lib/utils/intl';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import { observer } from 'mobx-react-lite';
import { isEmpty, toArray, debounce } from 'lodash';
import {
  getCurrentLanguage,
  getCurrentOrganizationId,
  getResponse,
  isTenantRoleLevel,
} from 'hzero-front/lib/utils/utils';
import { TagRender, operatorRender } from 'hzero-front/lib/utils/renderer';
import { Header, Content } from 'hzero-front/lib/components/Page';
import { Button, DataSet, Select, Spin, TextField, CheckBox, Tooltip } from 'choerodon-ui/pro';
import Record from 'choerodon-ui/pro/lib/data-set/Record';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { Collapse, Popconfirm, Icon } from 'choerodon-ui';
import qs from 'querystring';

import ImgIcon from '@/utils/ImgIcon';
import { OperatorsItem } from '@/businessGlobalData/common';
import { relyDs, controlLovValueDs } from '@/stores/BusinessObject/FieldRelyDS';
import {
  disableFieldRely,
  enableFieldRely,
  getFieldRelyValueMap,
} from '@/services/businessObjectService';
import SpringTooltip from '@/businessComponents/SpringTooltip';
import useChangeSize from './useChangeSIze';

import styles from './index.less';

const { Panel } = Collapse;
const tenantId = getCurrentOrganizationId();

const Index = props => {
  const { history } = props;
  let _search = props.location.search.split('?')?.[1];
  _search = qs.parse(_search);
  const { businessObjectId, businessObjectName, domainId } = _search || {};
  // const [searchValue, setSearchValue] = useState<string>();
  const [activeKey, setActiveKey] = useState<string[]>([]);

  const relyCollapseDs = useMemo(() => new DataSet(relyDs(businessObjectId)), []);

  const panelHeader = record => {
    const enableList = [
      {
        status: true,
        color: 'green',
        text: intl.get('hzero.common.status.enable').d('启用'),
      },
      {
        status: false,
        color: 'red',
        text: intl.get('hzero.common.status.disable').d('禁用'),
      },
    ];
    return record?.get('fieldDependenceId') ? (
      <div className={styles['rely-title']}>
        <span className={styles['rely-name']}>
          <span>{record?.get('controlBusinessObjectFieldName')}</span>
          <span style={{ margin: '0 8px' }}>-</span>
          <span>{record?.get('slaveBusinessObjectFieldName')}</span>
        </span>
        {TagRender(record?.get('enabledFlag'), enableList)}
      </div>
    ) : (
      <div className={styles['rely-title']} style={{ marginLeft: 22 }}>
        <span className={styles['rely-name']}>
          <Select
            record={record}
            name="controlBusinessObjectField"
            placeholder={intl
              .get('hmde.bo.field.rely.controlField.placeholder')
              .d('请选择控制字段')}
            noCache
            optionsFilter={obj => ['RADIO', 'SINGLE_SELECT'].includes(obj?.get('componentType'))}
          />
          <span style={{ margin: '0 8px' }}>-</span>
          <Select
            record={record}
            disabled={!record.get('controlBusinessObjectField')}
            name="slaveBusinessObjectField"
            placeholder={intl.get('hmde.bo.field.rely.slaveField.placeholder').d('请选择受控字段')}
            noCache
            optionsFilter={obj =>
              ['RADIO', 'SINGLE_SELECT', 'CHECKBOX', 'MULTIPLE_SELECT'].includes(
                obj?.get('componentType')
              )
            }
          />
        </span>
        <ImgIcon
          name="queren.svg"
          size={14}
          onClick={async () => {
            if (await record.validate()) {
              const res = await relyCollapseDs.submit();
              if (getResponse(res)) {
                await relyCollapseDs.query();
                const newItem = res?.content?.[0];
                handleOpenPanel([newItem?.fieldDependenceId]);
              }
            }
          }}
        />
        <ImgIcon name="quxiao.svg" size={14} onClick={() => relyCollapseDs.delete(record, false)} />
      </div>
    );
  };

  const PanelOperator = ({ record }) => {
    const operators: OperatorsItem[] = [];
    if (!record?.get('fieldDependenceId')) return null;
    if (record?.get('enabledFlag')) {
      operators.push({
        key: 'disable',
        ele: (
          <a
            style={{ verticalAlign: 'text-bottom' }}
            onClick={e => {
              if (e.stopPropagation) e.stopPropagation();
              handleDisableBORely(record?.toJSONData());
            }}
          >
            {intl.get('hzero.common.button.disable').d('禁用')}
          </a>
        ),
        len: 2,
        title: intl.get('hzero.common.button.disable').d('禁用'),
      });
    } else {
      operators.push({
        key: 'enable',
        ele: (
          <a
            style={{ verticalAlign: 'text-bottom' }}
            onClick={e => {
              if (e.stopPropagation) e.stopPropagation();
              handleEnableBORely(record?.toJSONData());
            }}
          >
            {intl.get('hzero.common.button.enable').d('启用')}
          </a>
        ),
        len: 2,
        title: intl.get('hzero.common.button.enable').d('启用'),
      });
    }
    operators.push({
      key: 'enable',
      ele: (
        <Popconfirm
          title={intl.get('hzero.common.message.confirm.delete').d('是否删除此条记录？')}
          okText={intl.get('hzero.common.button.ok').d('确定')}
          cancelText={intl.get('hzero.common.button.cancel').d('取消')}
          onConfirm={() => relyCollapseDs?.delete(record, false).then(() => setActiveKey([]))}
        >
          <a
            style={{ marginRight: 8, verticalAlign: 'text-bottom' }}
            onClick={e => {
              if (e.stopPropagation) e.stopPropagation();
            }}
          >
            {intl.get('hzero.common.button.delete').d('删除')}
          </a>
        </Popconfirm>
      ),
      len: 2,
      title: intl.get('hzero.common.button.delete').d('删除'),
    });
    return operatorRender(operators, record, { limit: 3 });
  };

  const handleDisableBORely = async data => {
    const res = await disableFieldRely(data);
    if (getResponse(res)) {
      setActiveKey([]);
      await relyCollapseDs.query();
    }
  };

  const handleEnableBORely = async data => {
    const res = await enableFieldRely(data);
    if (getResponse(res)) {
      setActiveKey([]);
      await relyCollapseDs.query();
    }
  };

  const handleOpenPanel = async key => {
    setActiveKey(key);
  };

  // 获取标题
  const getTitle = () => {
    return (
      <>
        <span
          className={styles['head-bo']}
          onClick={() => {
            history.push('/hmde/business-object/list');
            if (domainId) {
              location.hash = domainId;
            }
          }}
        >
          {intl.get('hmde.bo.model.businessObject').d('业务对象')}/
        </span>
        <span
          className={styles['head-title']}
          onClick={() =>
            history.push({
              pathname: `/hmde/business-object/detail/${businessObjectId}`,
              state: {
                originKey: 'fieldList',
                fieldActiveKey: isTenantRoleLevel() ? null : 'STANDARD',
              },
            })
          }
        >
          {businessObjectName}-{intl.get('hmde.bo.view.message.tab.fieldList').d('字段列表')}
        </span>
        <>
          /
          <span className={styles['head-title-last']}>
            {intl.get('hmde.bo.model.fieldRely.fieldDependency').d('字段依赖')}
          </span>
        </>
      </>
    );
  };

  return (
    <>
      <Header
        title={intl.get('hmde.bo.model.fieldRely.fieldDependency').d('字段依赖')}
        backPath={`/hmde/business-object/detail/${businessObjectId}`}
      />
      <Content>
        {relyCollapseDs.length !== 0 ? (
          <>
            <div className={styles['operate-header']}>
              <TextField
                // value={searchValue}
                // onChange={(val) => {
                //   setSearchValue(val);
                //   if (val) {
                //     const keys = relyCollapseDs
                //       .toData()
                //       .filter(
                //         (item: any) =>
                //           item.controlBusinessObjectFieldName.includes(val) ||
                //           item.slaveBusinessObjectFieldName.includes(val)
                //       )
                //       ?.map((item: any) => item.fieldDependenceId);
                //     handleOpenPanel([...keys]);
                //   }
                // }}
                onEnterDown={e => {
                  const val = (e.target as any).value;
                  // setSearchValue(val);
                  if (val) {
                    const keys = relyCollapseDs
                      .toData()
                      .filter(
                        (item: any) =>
                          item.controlBusinessObjectFieldName.includes(val) ||
                          item.slaveBusinessObjectFieldName.includes(val)
                      )
                      ?.map((item: any) => item.fieldDependenceId);
                    handleOpenPanel([...keys]);
                  }
                }}
                prefix={<ImgIcon name="search@v4.0.svg" size={14} />}
                placeholder={intl
                  .get('hmde.bo.field.rely.search.placeholder')
                  .d('搜索控制字段/受控字段')}
              />
              <Button
                icon="add"
                funcType={FuncType.flat}
                color={ButtonColor.primary}
                onClick={async () => {
                  if (await relyCollapseDs.validate()) {
                    relyCollapseDs.create({ enabledFlag: true }, 0);
                  }
                }}
              >
                {intl.get('hzero.common.table.column.add').d('新建')}
              </Button>
            </div>
            <Collapse
              className={styles['rely-collapse']}
              activeKey={activeKey}
              onChange={handleOpenPanel}
            >
              {relyCollapseDs.map(record => (
                <Panel
                  className={styles['rely-collapse-panel']}
                  style={{ border: '1px solid #E5E7EC', borderRadius: 2 }}
                  key={record?.get('fieldDependenceId')}
                  disabled={!record?.get('fieldDependenceId')}
                  showArrow={!!record?.get('fieldDependenceId')}
                  header={panelHeader(record)}
                  extra={
                    <div onClick={e => e.stopPropagation()}>
                      <PanelOperator record={record} />
                    </div>
                  }
                  forceRender={false}
                >
                  {activeKey.includes(record?.get('fieldDependenceId')) && (
                    <PanelContent record={record} />
                  )}
                </Panel>
              ))}
            </Collapse>
          </>
        ) : (
          <div className={styles['no-data']}>
            <ImgIcon name="no-data-fieldRely.png" size={140} />
            <p>{intl.get('hmde.bo.field.rely.noData').d('暂无数据，请点击按钮添加数据')}</p>
            <Button
              color={ButtonColor.primary}
              icon="add"
              onClick={() => relyCollapseDs.create({ enabledFlag: true }, 0)}
            >
              {intl.get('hmde.common.button.add').d('添加')}
            </Button>
          </div>
        )}
      </Content>
    </>
  );
};

const PanelContent = observer(({ record }: { record: Record }) => {
  const {
    fieldDependenceId,
    controlBusinessObjectFieldName,
    slaveBusinessObjectFieldName,
    slaveBusinessObjectFieldCode,
    businessObjectId,
  } = record.toData();
  const relyPanelDs = useMemo(() => new DataSet(controlLovValueDs(record)), [record]);

  const init = async () => {
    if (fieldDependenceId) {
      await relyPanelDs.query();
      const slaveBusinessObjectFieldLovCode = record.getState('lovCode');
      const valueList = await getFieldRelyValueMap(slaveBusinessObjectFieldLovCode, {
        businessObjectId,
        slaveBusinessObjectFieldCode,
      });
      if (getResponse(valueList)) {
        relyPanelDs.setState(
          'valueList',
          valueList?.map(item => {
            let { meaning } = item;
            if (Object.prototype.toString.call(meaning) === '[Object Object]') {
              meaning = meaning?.[getCurrentLanguage()] ?? Object.values(meaning)?.[0];
            }
            return {
              ...item,
              meaning,
            };
          }) || []
        );
      }
    }
  };
  useEffect(() => {
    init();
  }, [fieldDependenceId]);

  return (
    <Spin dataSet={relyPanelDs}>
      <div className={styles['rely-card-container']}>
        {relyPanelDs?.map(item => (
          <Card
            dataSet={relyPanelDs}
            controlBusinessObjectFieldName={controlBusinessObjectFieldName}
            slaveBusinessObjectFieldName={slaveBusinessObjectFieldName}
            item={item}
            businessObjectId={businessObjectId}
            fieldDependenceId={fieldDependenceId}
          />
        ))}
      </div>
    </Spin>
  );
});

const Card = observer(
  ({
    dataSet,
    controlBusinessObjectFieldName,
    slaveBusinessObjectFieldName,
    item,
    businessObjectId,
    fieldDependenceId,
  }: {
    dataSet: DataSet;
    controlBusinessObjectFieldName: string;
    slaveBusinessObjectFieldName: string;
    item: Record;
    businessObjectId: string;
    fieldDependenceId: string;
  }) => {
    const contentRef: any = useRef();
    const [fourthLastIndex, setFourthLastIndex] = useState<number>();
    const size = useChangeSize(setFourthLastIndex);

    const target160: any = document.getElementsByClassName('hzero-main-menu')?.[0];
    const target150: any = document.getElementsByClassName('hzero-common-layout-container')?.[0];
    const targetContainer: any = document.getElementById('root')?.firstChild;
    // TypeError: Failed to execute 'observe' on 'MutationObserver': parameter 1 is not of type 'Node'.
    // 【问题原因】该报错是由于 target 未获取到dom节点，MutationObserver监听的元素不存在，根本原因：不同主题或版本监听的dom类名不同。
    // 【解决方案】寻找Hzero左侧菜单收起展开类型变化的dom元素并监听它。
    const target = target160 || target150 || targetContainer; // hzero-front 不同版本下hzero菜单class类名不一致
    const mutationObserver = useMemo(
      () =>
        new MutationObserver(mutations => {
          mutations.forEach(() => {
            setFourthLastIndex(undefined);
            setTimeout(() => changeIndex(), 300);
          });
        }),
      []
    );
    mutationObserver.observe(target, { attributes: true });
    useEffect(() => {
      return () => {
        mutationObserver.disconnect();
      };
    });

    const changeIndex = () => {
      const {
        offsetHeight,
        offsetLeft,
        offsetTop,
        offsetWidth,
        childNodes,
        scrollHeight,
      } = contentRef.current;
      setFourthLastIndex(undefined);
      if (scrollHeight <= 108) {
        setMoreFlag(false);
        return;
      }
      const childList = toArray(childNodes).filter(child => !child.className);
      if (!isEmpty(childList)) {
        const res = childList.some((child, index) => {
          const {
            offsetHeight: childHeight,
            offsetLeft: childLeft,
            offsetTop: childTop,
            offsetWidth: childWidth,
          } = child;
          if (
            childTop > offsetTop + offsetHeight - 12 ||
            (childTop + childHeight + 4 >= offsetHeight + offsetTop &&
              offsetLeft + offsetWidth - childWidth - childLeft <= 36 &&
              index !== childList.length - 1)
          ) {
            setFourthLastIndex(index);
            return true;
          } else {
            return false;
          }
        });
        if (!res) {
          setFourthLastIndex(undefined);
          setMoreFlag(false);
        }
      }
    };

    useEffect(() => {
      changeIndex();
    }, [item.get('valueMap')?.length, size]);

    const [moreFlag, setMoreFlag] = useState(false);
    const [checkboxSearch, setCheckboxSearch] = useState('');
    const checkOptions = useMemo(
      () =>
        dataSet
          .getState('valueList')
          ?.filter?.(({ meaning }) => !checkboxSearch || meaning?.includes(checkboxSearch)),
      [dataSet.getState('valueList'), checkboxSearch]
    );

    const handleDebounceSearch = debounce(
      val => {
        setCheckboxSearch(val);
      },
      200,
      {
        trailing: true,
      }
    );

    const handleSave = async () => {
      await dataSet.submit();
    };

    return (
      <div
        className={styles['rely-card']}
        style={
          moreFlag
            ? {
                position: 'relative',
                zIndex: 2,
                borderColor: '#0840F8',
                borderRadius: '2px 2px 0 0',
              }
            : {}
        }
      >
        <div className={styles['rely-card-title']}>
          <span>
            {controlBusinessObjectFieldName}: {item?.get('meaning')}
          </span>
        </div>
        <div
          className={styles['rely-card-content']}
          ref={dom => {
            contentRef.current = dom;
          }}
        >
          <Tooltip
            theme="light"
            placement="bottomLeft"
            trigger={'click' as any}
            onHiddenChange={async visible => {
              if (visible) {
                handleSave();
              }
              handleDebounceSearch('');
            }}
            title={
              <div className={styles.selectableSlaveFieldList}>
                <span>{slaveBusinessObjectFieldName}</span>
                <TextField
                  hidden={isEmpty(dataSet.getState('valueList'))}
                  value={checkboxSearch}
                  onInput={e => handleDebounceSearch((e?.target as any)?.value || '')}
                />
                {!isEmpty(checkOptions) ? (
                  <div>
                    {checkOptions.map(({ meaning, value }) => {
                      return (
                        <CheckBox
                          name="valueMap"
                          value={value}
                          checked={item
                            .get('valueMap')
                            .some(({ slaveValue }) => slaveValue === value)}
                          onChange={val => {
                            const valueMap = item.get('valueMap');
                            if (!val) {
                              item.set(
                                'valueMap',
                                valueMap.filter(({ slaveValue }) => slaveValue !== value)
                              );
                            } else {
                              item.set('valueMap', [
                                ...valueMap,
                                {
                                  ...(item
                                    .get('valueMap')
                                    ?.find(({ slaveValue }) => slaveValue === value) || {}),
                                  controlValue: item.get('value'),
                                  slaveValue: value,
                                  slaveMeaning: meaning,
                                  businessObjectId,
                                  fieldDependenceId,
                                  tenantId,
                                },
                              ]);
                            }
                          }}
                        >
                          {meaning}
                        </CheckBox>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ margin: 20, textAlign: 'center' }}>
                    {intl.get('hmde.common.view.message.nodata').d('暂无数据')}
                  </div>
                )}
              </div>
            }
          >
            <div className={styles['rely-field-add']}>
              <Icon type="add" style={{ marginRight: 4 }} />
              {intl.get('hmde.common.button.add').d('添加')}
            </div>
          </Tooltip>
          {item
            .get('valueMap')
            ?.slice(0, fourthLastIndex)
            ?.map(field => {
              return (
                <div>
                  <SpringTooltip title={field.slaveMeaning}>
                    {(stRef: any) => <span ref={stRef}>{field.slaveMeaning}</span>}
                  </SpringTooltip>
                  <ImgIcon
                    className={styles['field-delete']}
                    name="failed@3x.png"
                    size={12}
                    onClick={() => {
                      item.set(
                        'valueMap',
                        item.get('valueMap')?.filter(i => i.slaveValue !== field.slaveValue)
                      );
                      handleSave();
                    }}
                  />
                </div>
              );
            })}
          <div
            className={styles['rely-field-more']}
            hidden={!fourthLastIndex}
            onClick={() => setMoreFlag(!moreFlag)}
          >
            <Icon type={moreFlag ? 'baseline-arrow_drop_up' : 'baseline-arrow_drop_down'} />
          </div>
          {fourthLastIndex &&
            item
              .get('valueMap')
              ?.slice(fourthLastIndex)
              ?.map(field => {
                return (
                  <div>
                    <SpringTooltip title={field.slaveMeaning}>
                      {(stRef: any) => <span ref={stRef}>{field.slaveMeaning}</span>}
                    </SpringTooltip>
                    <ImgIcon
                      className={styles['field-delete']}
                      name="failed@3x.png"
                      size={12}
                      onClick={() => {
                        item.set(
                          'valueMap',
                          item.get('valueMap')?.filter(i => i.slaveValue !== field.slaveValue)
                        );
                        handleSave();
                      }}
                    />
                  </div>
                );
              })}
        </div>
        {fourthLastIndex && (
          <div
            className={styles['more-filed-content']}
            style={!moreFlag ? {} : { display: 'block' }}
          >
            {item
              .get('valueMap')
              .slice(fourthLastIndex)
              .map(field => {
                return (
                  <div>
                    <SpringTooltip title={field.slaveMeaning}>
                      {(stRef: any) => <span ref={stRef}>{field.slaveMeaning}</span>}
                    </SpringTooltip>
                    <ImgIcon
                      className={styles['field-delete']}
                      name="failed@3x.png"
                      size={12}
                      onClick={() => {
                        item.set(
                          'valueMap',
                          item.get('valueMap')?.filter(i => i.slaveValue !== field.slaveValue)
                        );
                        handleSave();
                      }}
                    />
                  </div>
                );
              })}
          </div>
        )}
      </div>
    );
  }
);

export default formatterCollections({ code: ['hmde.common', 'hmde.bo', 'hzero.common'] })(
  observer(Index)
);

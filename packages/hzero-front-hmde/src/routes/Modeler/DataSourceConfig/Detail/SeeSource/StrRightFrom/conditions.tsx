import React, { useMemo, useState, useContext } from 'react';
import classnames from 'classnames';
import { observer } from 'mobx-react-lite';
import { DataSet, TextField, Switch } from 'choerodon-ui/pro';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import { Row, Col, Tooltip, Icon, Collapse } from 'choerodon-ui';
import ImgIcon from '@/utils/ImgIcon';

import innerJoinImg from '@/assets/inner-join@2x.png';
import leftJoinImg from '@/assets/left-join@2x.png';
import rightJoinImg from '@/assets/right-join@2x.png';
import _store, { ISourceManagerStore } from '@/routes/Modeler/DataSourceConfig/stores';

import styles from '../index.less';

interface ICondition {
  rightFormData: model.data.DataObjectModel;
}

export default observer(({ rightFormData }: ICondition) => {
  const {
    dataObject: {
      level,
      tenantId,
      dataObjectDetail: { extendsParentName, extendsParentCode },
    },
  }: ISourceManagerStore = useContext<ISourceManagerStore>(_store as any).store;
  const ds = useMemo(() => {
    const { conditions = [] } = rightFormData;
    const data =
      level === 'tenant' && (extendsParentName || extendsParentCode)
        ? conditions.filter((ele) => String(ele.tenantId) !== String(tenantId))?.[0]?.detailList ||
          []
        : rightFormData?.conditions?.[0]?.detailList || [];
    return new DataSet({
      fields: [
        {
          name: 'leftDisplayText',
          type: FieldType.string,
        },
        {
          name: 'rightDisplayText',
          type: FieldType.string,
        },
        {
          name: 'operatorType',
          type: FieldType.string,
          transformResponse: (value) => {
            switch (value) {
              case 'IS_NULL':
                return '空';
              case 'IS_NOT_NULL':
                return '非空';
              case 'EQUAL':
                return '等于';
              case 'NOT_EQUAL':
                return '不等于';
              case 'GREATER_THAN':
                return '大于';
              case 'GREATER_THAN_OR_EQUAL_TO':
                return '大于等于';
              case 'LESS_THAN':
                return '小于';
              case 'LESS_THAN_OR_EQUAL_TO':
                return '小于等于';
              case 'FULLY_FUZZY':
                return '全模糊';
              case 'BEFORE_FUZZY':
                return '前模糊';
              case 'AFTER_FUZZY':
                return '后模糊';
              case 'IN':
                return '包含';
              case 'NOT_IN':
                return '不包含';
              default:
                return '';
            }
          },
        },
        {
          name: 'valueType',
          type: FieldType.string,
          transformResponse: (value) => {
            switch (value) {
              case 'fixed':
                return '固定值';
              case 'field':
                return '模型字段';
              case 'sql':
                return '自定义sql';
              default:
                return '';
            }
          },
        },
      ],
      data,
    });
  }, [rightFormData]);
  const tenantDs = useMemo(() => {
    const data =
      level === 'tenant' && (extendsParentName || extendsParentCode)
        ? rightFormData?.conditions?.filter((ele) => String(ele.tenantId) === String(tenantId))?.[0]
            ?.detailList || []
        : [];
    return new DataSet({
      fields: [
        {
          name: 'leftDisplayText',
          type: FieldType.string,
        },
        {
          name: 'rightDisplayText',
          type: FieldType.string,
        },
        {
          name: 'operatorType',
          type: FieldType.string,
          transformResponse: (value) => {
            switch (value) {
              case 'IS_NULL':
                return '空';
              case 'IS_NOT_NULL':
                return '非空';
              case 'EQUAL':
                return '等于';
              case 'NOT_EQUAL':
                return '不等于';
              case 'GREATER_THAN':
                return '大于';
              case 'GREATER_THAN_OR_EQUAL_TO':
                return '大于等于';
              case 'LESS_THAN':
                return '小于';
              case 'LESS_THAN_OR_EQUAL_TO':
                return '小于等于';
              case 'FULLY_FUZZY':
                return '全模糊';
              case 'BEFORE_FUZZY':
                return '前模糊';
              case 'AFTER_FUZZY':
                return '后模糊';
              case 'IN':
                return '包含';
              case 'NOT_IN':
                return '不包含';
              default:
                return '';
            }
          },
        },
        {
          name: 'valueType',
          type: FieldType.string,
          transformResponse: (value) => {
            switch (value) {
              case 'fixed':
                return '固定值';
              case 'field':
                return '模型字段';
              case 'sql':
                return '自定义sql';
              default:
                return '';
            }
          },
        },
      ],
      data,
    });
  }, [rightFormData]);
  const { joinType, relation = null, strongRelationFlag } = rightFormData;
  const conditions = useMemo(() => {
    return ds.toData();
  }, [rightFormData]);
  const customConditions = useMemo(() => {
    return tenantDs.toData();
  }, [rightFormData]);
  const {
    relationFields = [],
    masterDataSourceType = '??',
    relationDataSourceType = '??',
    masterSchemaName = '??',
    relationSchemaName = '??',
    masterTable = '??',
    relationTable = '??',
  } = (relation as any) || {};

  const joinTypeList = [
    {
      value: 'left_join',
      text: 'Left Join',
      tooltip: leftJoinImg,
    },
    {
      value: 'inner_join',
      text: 'Inner Join',
      tooltip: innerJoinImg,
    },
    {
      value: 'right_join',
      text: 'Right Join',
      tooltip: rightJoinImg,
    },
  ];
  /**
   * 关系名称拼接
   * @param {*} str
   */
  const relationTitle = (str) => {
    let str1: string = '';
    let str2: string = '';
    if (masterDataSourceType) {
      str1 = `${masterSchemaName}(${masterDataSourceType}).${masterTable}.${
        str.masterModelFieldName || '??'
      }`;
    } else {
      str1 = `${masterSchemaName}.${masterTable}.${str.masterModelFieldName || '??'}`;
    }
    if (relationDataSourceType) {
      str2 = `${relationSchemaName}(${relationDataSourceType}).${relationTable}.${
        str.relationModelFieldName || '??'
      }`;
    } else {
      str2 = `${relationSchemaName}.${relationTable}.${str.relationModelFieldName || '??'}`;
    }
    return `${str1}=${str2}`;
  };

  interface ICurTextField {
    item: model.data.DataObjectConditionDetail;
    value: string;
    left?: 'left' | 'right';
  }
  const CurTextField = ({ item, value, left }: ICurTextField) => {
    const [visible1, setVisible1] = useState(false);

    const getIcon = (): string => {
      if (left === 'left') {
        if (item[`${left}HeaderRelationCode`] === '') {
          return 'main-icon.svg'; // 主
        } else {
          return 'modelRelation.svg'; // 从
        }
      } else if (left === 'right') {
        if (item[`${left}HeaderRelationCode`]) {
          return 'modelRelation.svg';
        } else if (item.valueType === '模型字段') {
          return 'main-icon.svg';
        }
      }
      return '';
    };

    return (
      <TextField
        disabled
        className={left && getIcon() && 'model-icon'}
        value={
          <>
            <Tooltip
              placement="top"
              title={item?.[value] || '当前数据已丢失，请检查！'}
              visible={visible1}
            >
              <span
                onMouseEnter={(e) => {
                  const ele: any = e?.target;
                  if ((ele?.offsetWidth || 0) > (ele?.parentNode?.offsetWidth || 0)) {
                    setVisible1(true);
                  }
                }}
                onMouseLeave={() => setVisible1(false)}
              >
                {item?.[value] || '当前数据已丢失，请检查！'}
              </span>
            </Tooltip>
            <Tooltip placement="top" title={item?.[`${left}HeaderRelationName`]}>
              <ImgIcon name={getIcon()} hidden={!left || !getIcon()} size={16} />
            </Tooltip>
          </>
        }
        suffix={<Icon type="expand_more" />}
      />
    );
  };

  const conditionItems = (cond: model.data.DataObjectConditionDetail[]) =>
    cond.map((item, idx) => {
      return (
        <Row
          gutter={8}
          key={item.dataConditionDetailId}
          className={styles['filter-condition-item']}
        >
          <Col span={2}>
            <span className={styles['sort-num']}>
              <i>{idx + 1}</i>
            </span>
          </Col>
          <Col span={6}>
            <CurTextField item={item} value="leftDisplayText" left="left" />
          </Col>
          <Col span={5}>
            <CurTextField item={item} value="operatorType" />
          </Col>
          <Col span={5}>
            {item?.operatorType !== '空' && item?.operatorType !== '非空' && (
              <CurTextField item={item} value="valueType" />
            )}
          </Col>
          <Col span={6}>
            {item?.operatorType !== '空' && item?.operatorType !== '非空' && (
              <CurTextField item={item} value="rightDisplayText" left="right" />
            )}
          </Col>
        </Row>
      );
    });

  return (
    <>
      {!rightFormData?.masterFlag && (
        <>
          <Row>
            <Col span={8}>
              <h4 className={styles['label-4']}>
                关联方式：
                {joinTypeList.find(({ value }) => value === joinType)?.text}
                <Tooltip
                  placement="bottom"
                  overlayClassName={styles['tooltip-contain-override']}
                  overlayStyle={{ width: '300px' }}
                  title={
                    <img
                      className={styles['img-contain']}
                      src={joinTypeList.find(({ value }) => value === joinType)?.tooltip}
                      alt={joinType}
                    />
                  }
                >
                  <ImgIcon name="help.svg" size={14} style={{ marginLeft: 4 }} />
                </Tooltip>
              </h4>
            </Col>
            <Col span={8}>
              <h4 className={styles['label-4']}>
                是否强关联：
                <Switch readOnly checked={strongRelationFlag === 1} style={{ top: 2 }} />
                <Tooltip
                  placement="top"
                  title="当启用层级的模型关系为双向1-1时，可开启强关联。启用强关联后，主模型执行增删改操作时，关联模型数据将会一起随之变化。"
                >
                  <ImgIcon name="help.svg" size={14} style={{ marginLeft: 8 }} />
                </Tooltip>
              </h4>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <h4 className={styles['label-4']}>
                <span style={{ whiteSpace: 'nowrap' }}>关联关系：</span>
                {relationFields?.length > 0 ? (
                  <ul className={styles.correlation}>
                    {relationFields.map((str, i) => (
                      // eslint-disable-next-line react/no-array-index-key
                      <li key={i} className={styles['relation-fields']}>
                        <Tooltip placement="topLeft" title={relationTitle(str)}>
                          {relationTitle(str)}
                        </Tooltip>
                      </li>
                    ))}
                  </ul>
                ) : (
                  '当前数据已丢失，请检查！'
                )}
              </h4>
            </Col>
          </Row>
        </>
      )}
      {level === 'tenant' && (extendsParentName || extendsParentCode) ? (
        <Collapse
          bordered={false}
          className={classnames(
            styles['see-filter-condition-collapse'],
            styles['filter-condition-collapse']
          )}
        >
          <Collapse.Panel header="平台层" key="platform">
            <h4 className={styles['label-4']}>过滤条件：</h4>
            {conditionItems(conditions as model.data.DataObjectConditionDetail[])}
            <h4 className={styles['label-4']}>
              自定义筛选逻辑：
              {
                rightFormData?.conditions?.filter(
                  (ele) => String(ele.tenantId) !== String(tenantId)
                )?.[0]?.logicFormula
              }
              <Tooltip
                placement="top"
                title="默认筛选逻辑按照过滤条件全部进行AND运算，可自定义连接条件，优先执行自定义筛选逻辑。"
              >
                <ImgIcon name="help.svg" size={14} style={{ marginLeft: 8 }} />
              </Tooltip>
            </h4>
          </Collapse.Panel>
          <Collapse.Panel header="租户层" key="tenant">
            <h4 className={styles['label-4']}>过滤条件：</h4>
            {conditionItems(customConditions as model.data.DataObjectConditionDetail[])}
            <h4 className={styles['label-4']}>
              自定义筛选逻辑：
              {
                rightFormData?.conditions?.filter(
                  (ele) => String(ele.tenantId) === String(tenantId)
                )?.[0]?.logicFormula
              }
              <Tooltip
                placement="top"
                title="默认筛选逻辑按照过滤条件全部进行AND运算，可自定义连接条件，优先执行自定义筛选逻辑。"
              >
                <ImgIcon name="help.svg" size={14} style={{ marginLeft: 8 }} />
              </Tooltip>
            </h4>
          </Collapse.Panel>
        </Collapse>
      ) : (
        <>
          <h4 className={styles['label-4']}>过滤条件：</h4>
          {conditionItems(conditions as model.data.DataObjectConditionDetail[])}
          <h4 className={styles['label-4']}>
            自定义筛选逻辑：
            {rightFormData?.conditions?.[0]?.logicFormula}
            <Tooltip
              placement="top"
              title="默认筛选逻辑按照过滤条件全部进行AND运算，可自定义连接条件，优先执行自定义筛选逻辑。"
            >
              <ImgIcon name="help.svg" size={14} style={{ marginLeft: 8 }} />
            </Tooltip>
          </h4>
        </>
      )}
    </>
  );
});

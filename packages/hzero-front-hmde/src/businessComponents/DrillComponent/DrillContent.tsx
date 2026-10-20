import React, { useEffect, useState, useImperativeHandle, forwardRef, useRef } from 'react';
import { Select, Form, DataSet, Tooltip, Output, Row, Col, Icon, Spin } from 'choerodon-ui/pro';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { LabelAlign } from 'choerodon-ui/pro/lib/form/enum';
import { RenderProps } from 'choerodon-ui/pro/lib/field/FormField';
import { FieldProps } from 'choerodon-ui/pro/lib/data-set/Field';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import { Card } from 'choerodon-ui';
import intl from 'srm-front-boot/lib/utils/intl';

import { getResponse } from 'utils/utils';
import { queryIdpValue } from 'services/api';
import ImgIcon from '@/utils/ImgIcon';
import { drill, getDrillInfo } from '@/services/businessObjectService';

import { formDs } from './formDs';
import styles from './index.less';
import { generateArray } from './utils';
import { EDrillMainKeyType } from '.';

interface IG {
  group: string;
}

type TFields = FieldProps & IG;

interface IResult {
  businessObjectName?: string;
  businessObjectFieldName?: string;
  componentType?: string;
}

interface IInitDrillParams {
  [propName: string]: any;
}
interface IProps {
  businessObjectCode: string | number;
  drillMainKeyType: EDrillMainKeyType;
  value?: string;
  curFieldCode?: string;
  drillDownFlag?: boolean;
  customComponentTypeList?: string[];
  initDrillParams?: IInitDrillParams;
  refList?: any;
  refState?: boolean;
}

const [
  MASTER_RELATION, // 从主
  LINK_RELATION, // 关联
  MASTER_SLAVE, // 主从
  LINK, // 高级关联,
  SLAVE_MASTER, // 高级从主,
] = ['MASTER_RELATION', 'LINK_RELATION', 'MASTER_SLAVE', 'LINK', 'SLAVE_MASTER'];
const [ASSOCIATE, FIELD] = ['ASSOCIATE', 'FIELD']; // 与后端约定好的字段类型 用于拼接保证businessObjectFieldId的全局唯一
const objectTypeList = [MASTER_RELATION, LINK_RELATION, MASTER_SLAVE, LINK, SLAVE_MASTER]; // 对象的componentType类型集合

const getGroupData = (res, curFieldCode) => {
  const seniorList = res?.businessObjectAssociateList
    ?.filter((j) => j?.associateCode !== curFieldCode)
    ?.map((item) => {
      return {
        ...item,
        businessObjectFieldCode: item?.associateCode,
        businessObjectFieldName: item?.associateName,
        componentType: item?.associateType, // 高级关系的associateType是字段类型
        businessObjectFieldId: `${ASSOCIATE}${item?.businessObjectAssociateId}`, // serious前缀代表高级类型 全局唯一
        businessObjectCode: res?.businessObjectCode,
        businessObjectName: res?.businessObjectName,
        groupName: intl.get('hmde.bo.model.advancedRelationship').d('高级关系'),
      };
    });
  const relationList = res?.businessObjectFields
    ?.filter((j) => j?.businessObjectFieldCode !== curFieldCode)
    ?.map((item) => {
      return {
        ...item,
        businessObjectCode: res?.businessObjectCode,
        businessObjectName: res?.businessObjectName,
        businessObjectFieldId: `${FIELD}${item?.businessObjectFieldId}`, // serious前缀代表高级类型 全局唯一
        groupName: intl.get('hmde.bo.model.associationRelationship').d('关联关系'),
      };
    });
  return [...seniorList, ...relationList];
};
// 处理解析接口返回的数据
const dealDrillInfo = (res) => {
  const newRes = res.map((item) => ({
    ...item,
    businessObjectFieldId: item?.referenceType
      ? `${item?.referenceType}${item?.businessObjectFieldId}`
      : `${item?.referenceType}${item?.businessObjectFieldId}`,
  }));
  return newRes;
};
export default forwardRef((props: IProps, ref) => {
  const {
    businessObjectCode,
    value: drillValue,
    curFieldCode,
    drillMainKeyType = 'none',
    drillDownFlag,
    customComponentTypeList,
    initDrillParams,
    refState,
    refList,
  } = props;

  const selectItemRef: any = useRef(); // 当前选中下拉项信息

  const [current, setCurrent] = useState(1); // 钻取fields的最大key

  const [initData, setInitData] = useState<any[] | undefined>([]); // 用于下一次loadData

  const [totalFields, setTotalFields] = useState<FieldProps[]>([]); // 包含初始化字段的所有字段

  const [otherFields, setOtherFields] = useState<FieldProps[]>([]); // 动态的其他字段

  const [loading, setLoading] = useState<boolean>(false); // 加载

  const [result, setResult] = useState<IResult>({}); // 最后选择的结果

  const [componentTypeList, setComponentTypeList] = useState<any[]>([]);

  const [curEdit, setCurEdit] = useState(0); // 当前编辑字段

  const [referenceFormula, setReferenceFormula] = useState<any[]>([]); // 用于反解析字段 code <=> name

  const [ds, setDs] = useState<DataSet>(); // form的dataSet

  const [originEdit, setOriginEdit] = useState<number>(0); // 上一次编辑的层级

  useImperativeHandle(ref, () => ({
    dataSet: ds, // 务必维护和组件名称一致后缀加Ds 方便父组件调用
    getResult: () => result,
    getReferenceInfo: () => referenceFormula,
    getOptions: (name) => ds?.current?.getField(name)?.options?.toData(),
    totalFields,
    selectItem: selectItemRef.current,
  }));

  /**
   * 二次编辑时点击文本，再次钻取，需要先钻取当前字段的下拉框
   * @param number 当前编辑的字段key
   */
  const handleChangeEdit = (number, val) => {
    setCurEdit(number);
    setOriginEdit(number);
    if (drillValue && number && val && originEdit !== number) {
      setLoading(true);
      const id = referenceFormula?.find((item) => item.businessObjectFieldId === val)
        ?.businessObjectCode;
      const query = {
        businessObjectCode: id,
        drillDownFlag,
        drillMainKeyFlag:
          drillMainKeyType === 'all' || (number !== 1 && drillMainKeyType === 'exclude_first'),
      };
      if (customComponentTypeList && Array.isArray(customComponentTypeList)) {
        Object.assign(query, {
          componentTypeList: customComponentTypeList.toString(),
        });
      }
      drill({ query }).then((res) => {
        const groupData = getGroupData(res, curFieldCode);
        if (getResponse(res)) {
          // 需要更新field, 用于回写拿到最新的options
          setTotalFields([
            {
              ...totalFields?.[0],
              options: new DataSet({
                paging: false,
                data: groupData,
                fields: [
                  {
                    name: 'groupName',
                    type: 'string',
                    group: true,
                  },
                ],
                // data: res?.businessObjectFields
                //   ?.filter((i) => i?.businessObjectFieldCode !== curFieldCode)
                //   .map((item) => {
                //     return {
                //       ...item,
                //       businessObjectCode: res?.businessObjectCode,
                //       businessObjectName: res?.businessObjectName,
                //     };
                //   }),
              } as DataSetProps),
            },
            ...totalFields.slice(1)?.map((i) => {
              return {
                ...i,
                options: new DataSet({
                  paging: false,
                  data: groupData,
                  fields: [
                    {
                      name: 'groupName',
                      type: 'string',
                      group: true,
                    },
                  ],
                  // data: res?.businessObjectFields
                  //   ?.filter((j) => j?.businessObjectFieldCode !== curFieldCode)
                  //   ?.map((item) => {
                  //     return {
                  //       ...item,
                  //       businessObjectCode: res?.businessObjectCode,
                  //       businessObjectName: res?.businessObjectName,
                  //     };
                  //   }),
                } as DataSetProps),
              };
            }),
          ]);
          const othersArr = totalFields.slice(1).map((i) => {
            return {
              ...i,
              options: new DataSet({
                paging: false,
                data: groupData,
                fields: [
                  {
                    name: 'groupName',
                    type: 'string',
                    group: true,
                  },
                ],
                // data: res?.businessObjectFields
                //   ?.filter((j) => j?.businessObjectFieldCode !== curFieldCode)
                //   ?.map((item) => {
                //     return {
                //       ...item,
                //       businessObjectCode: res?.businessObjectCode,
                //       businessObjectName: res?.businessObjectName,
                //     };
                //   }),
              } as DataSetProps),
            };
          });
          setOtherFields(othersArr);
          // eslint-disable-next-line no-unused-expressions
          ds?.current?.getField(String(number))?.set(
            'options',
            new DataSet({
              paging: false,
              data: groupData,
              fields: [
                {
                  name: 'groupName',
                  type: 'string',
                  group: true,
                },
              ],
              // data: res?.businessObjectFields
              //   ?.filter((j) => j?.businessObjectFieldCode !== curFieldCode)
              //   ?.map((item) => {
              //     return {
              //       ...item,
              //       businessObjectCode: res?.businessObjectCode,
              //       businessObjectName: res?.businessObjectName,
              //     };
              //   }),
            } as DataSetProps)
          );
          setLoading(false);
        } else {
          setLoading(false);
        }
      });
    }
  };

  /**
   * 字段选择onchange回调
   * @param fieldName 字段名
   * @param fieldValue 字段值
   * @param fieldRecord 字段记录
   * @param options 字段下啦选项
   */
  const handleChangeField = async (fieldName, fieldValue, fieldRecord, options) => {
    /**
     * 1.fieldName < current 需要隐藏多余的字段
     * 2。fieldName = current
     */
    const findItem = options?.find((item) => item?.businessObjectFieldId === fieldValue) || {};
    const {
      drillFlag = false,
      masterBusinessObjectCode,
      associateBusinessObjectCode, // 高级关系code
      componentType,
      // businessObjectName,
    } = findItem;
    selectItemRef.current = findItem;
    // 因为是output自定义render，所以需要手动set值
    // eslint-disable-next-line no-unused-expressions
    ds?.current?.set(fieldName, fieldValue);
    // 钻取接口的参数
    const query = {
      drillDownFlag,
      businessObjectCode: associateBusinessObjectCode || masterBusinessObjectCode,
      drillMainKeyFlag: ['all', 'exclude_first'].includes(drillMainKeyType),
    };
    if (customComponentTypeList && Array.isArray(customComponentTypeList)) {
      Object.assign(query, {
        componentTypeList: customComponentTypeList.toString(),
      });
    }

    // 上一次的数据， 用于下一次fields变更后loadData
    const originData = ds?.toData();

    // 1. 当前编辑的字段位置在整个表单的中间
    if (Number(fieldName) < current) {
      // 需要截取初始数据
      const sliceData = {};
      // eslint-disable-next-line no-unused-expressions
      generateArray(1, Number(fieldName))?.forEach((item) => {
        sliceData[item] = originData?.[0]?.[item];
      });
      // 可以钻取， 去除多余的字段
      if (drillFlag) {
        setLoading(true);
        setCurrent(Number(fieldName) + 1);
        setCurEdit(Number(fieldName) + 1);
        drill({ query }).then((res) => {
          const groupData = getGroupData(res, curFieldCode);
          if (getResponse(res)) {
            const next = {
              name: String(Number(fieldName) + 1),
              type: FieldType.string,
              options: new DataSet({
                paging: false,
                data: groupData,
                fields: [
                  {
                    name: 'groupName',
                    type: 'string',
                    group: true,
                  },
                ],
                // data: res?.businessObjectFields
                //   ?.filter((j) => j?.businessObjectFieldCode !== curFieldCode)
                //   ?.map((item) => {
                //     return {
                //       ...item,
                //       businessObjectCode: res?.businessObjectCode,
                //       businessObjectName: res?.businessObjectName,
                //     };
                //   }),
              } as DataSetProps),
              textField: 'businessObjectFieldName',
              valueField: 'businessObjectFieldId',
            };
            const _totalFields = totalFields.slice(0, Number(fieldName))?.map((item, index) => {
              if (index === totalFields.length - 1) {
                return { ...item, componentType };
              }
              return item;
            });
            setTotalFields([..._totalFields, next]);
            setDs(
              new DataSet({
                ...formDs(),
                fields: [
                  ...totalFields.slice(0, Number(fieldName)),
                  next,
                  // {
                  //   name: 'businessObjectName',
                  //   type: 'string',
                  //   group: true,
                  // },
                ],
              } as DataSetProps)
            );
            setInitData([sliceData]);
            // eslint-disable-next-line no-unused-expressions
            ds?.current?.getField(String(Number(fieldName) + 1))?.set(
              'options',
              new DataSet({
                paging: false,
                data: groupData,
                fields: [
                  {
                    name: 'groupName',
                    type: 'string',
                    group: true,
                  },
                ],
                // data: res?.businessObjectFields
                //   ?.filter((j) => j?.businessObjectFieldCode !== curFieldCode)
                //   ?.map((item) => {
                //     return {
                //       ...item,
                //       businessObjectCode: res?.businessObjectCode,
                //       businessObjectName: res?.businessObjectName,
                //     };
                //   }),
              } as DataSetProps)
            );
            const o = [...totalFields.slice(0, Number(fieldName)), next].slice(1);
            setOtherFields(o);
            // 选中的是相关对象（主从/关联/从主） 则只显示来源对象
            const obj = {};
            if (objectTypeList.includes(componentType)) {
              Object.assign(obj, findItem);
            }
            setResult(obj);
            setLoading(false);
          }
          setLoading(false);
        });
      } else {
        // 不可钻取
        setCurrent(Number(fieldName));
        setCurEdit(0);
        const _totalFields = totalFields.slice(0, Number(fieldName))?.map((item, index) => {
          if (index === totalFields.length - 1) {
            return { ...item, componentType };
          }
          return item;
        });
        setTotalFields(_totalFields);
        setDs(
          new DataSet({
            ...formDs(),
            fields: [
              ...totalFields.slice(0, Number(fieldName)),
              // {
              //   name: 'businessObjectName',
              //   type: 'string',
              //   group: true,
              // },
            ],
          } as DataSetProps)
        );
        setInitData([sliceData]);
        setOtherFields(_totalFields.slice(1, Number(fieldName)));
        setResult(findItem);
      }
    } else if (Number(fieldName) === current) {
      // 当前编辑的字段处于表单的末端
      if (drillFlag) {
        // 可钻取
        // 添加一个子节点，然后设置当前节点 + 1
        setCurrent(Number(fieldName) + 1);
        setCurEdit(Number(fieldName) + 1);
        setLoading(true);
        drill({ query }).then((r) => {
          if (getResponse(r)) {
            const _totalFields = totalFields?.map((item, index) => {
              if (index === totalFields.length - 1) {
                return { ...item, componentType };
              }
              return item;
            });
            const groupData = getGroupData(r, curFieldCode);
            const total = [
              ..._totalFields,
              {
                name: String(Number(fieldName) + 1),
                type: FieldType.string,
                options: new DataSet({
                  paging: false,
                  data: groupData,
                  fields: [
                    {
                      name: 'groupName',
                      type: 'string',
                      group: true,
                    },
                  ],
                  // data: r?.businessObjectFields
                  //   ?.filter((j) => j?.businessObjectFieldCode !== curFieldCode)
                  //   ?.map((item) => {
                  //     return {
                  //       ...item,
                  //       businessObjectName: r?.businessObjectName,
                  //       businessObjectCode: r?.businessObjectCode,
                  //     };
                  //   }),
                } as DataSetProps),
                textField: 'businessObjectFieldName',
                valueField: 'businessObjectFieldId',
              },
            ];
            setTotalFields(total);
            setDs(
              new DataSet({
                ...formDs(),
                fields: [
                  ...total,
                  // {
                  //   name: 'businessObjectName',
                  //   type: 'string',
                  //   group: true,
                  // },
                ],
              } as DataSetProps)
            );
            setInitData(originData);
            // eslint-disable-next-line no-unused-expressions
            ds?.current?.getField(String(Number(fieldName) + 1))?.set(
              'options',
              new DataSet({
                paging: false,
                data: groupData,
                fields: [
                  {
                    name: 'groupName',
                    type: 'string',
                    group: true,
                  },
                ],
                // data: r?.businessObjectFields
                //   ?.filter((j) => j?.businessObjectFieldCode !== curFieldCode)
                //   ?.map((item) => {
                //     return {
                //       ...item,
                //       businessObjectName: r?.businessObjectName,
                //       businessObjectCode: r?.businessObjectCode,
                //     };
                //   }),
              } as DataSetProps)
            );
            setOtherFields(total.slice(1));
            const obj = {};
            if (objectTypeList.includes(componentType)) {
              Object.assign(obj, findItem);
            }
            setResult(obj);
            setLoading(false);
          }
          setLoading(false);
        });
      } else {
        // 不可钻取
        setCurrent(Number(fieldName));
        setCurEdit(0);
        setResult(findItem);
      }
    }
  };

  /**
   * 初始化第一层数据
   */
  useEffect(() => {
    queryIdpValue('HMDE.BUSINESS_OBJECT.FIELD_TYPE').then((r) => {
      if (r) {
        setComponentTypeList(r);
      }
    });
    if (drillValue) {
      setLoading(true);
      getDrillInfo({ referenceFormula: drillValue }).then((res) => {
        if (getResponse(res)) {
          const newRes = dealDrillInfo(res);
          setReferenceFormula(newRes);
          const dataObj = {};
          newRes.forEach((item, index) => {
            dataObj[index + 1] = item?.businessObjectFieldId;
          });
          const fields = newRes?.map((item, index) => {
            return {
              componentType: item?.componentType,
              name: String(index + 1),
              type: 'string',
              options: new DataSet({
                paging: false,
                data: item,
              }),
              textField: 'businessObjectFieldName',
              valueField: 'businessObjectFieldId',
            };
          });
          const lastItem = fields[newRes.length - 1];
          if (objectTypeList.includes(lastItem.componentType)) {
            // 如果回显的最后一个是主从 关联 从主对象 则继续向下钻取一次
            const query = {
              businessObjectCode: res[res.length - 1]?.masterBusinessObjectCode,
              drillDownFlag,
              drillMainKeyFlag:
                drillMainKeyType === 'all' ||
                (fields.length !== 1 && drillMainKeyType === 'exclude_first'),
            };
            if (customComponentTypeList && Array.isArray(customComponentTypeList)) {
              Object.assign(query, {
                componentTypeList: customComponentTypeList.toString(),
              });
            }
            // eslint-disable-next-line guard-for-in
            for (const key in initDrillParams) {
              Object.assign(query, { [key]: initDrillParams[key] });
            }
            drill({ query }).then((_res) => {
              const groupData = getGroupData(_res, curFieldCode);
              fields.push({
                name: String(Number(fields.length) + 1),
                type: FieldType.string,
                options: new DataSet({
                  paging: false,
                  data: groupData,
                  fields: [
                    {
                      name: 'groupName',
                      type: 'string',
                      group: true,
                    },
                  ],
                  // data: _res?.businessObjectFields
                  //   ?.filter((j) => j?.businessObjectFieldCode !== curFieldCode)
                  //   ?.map((item) => {
                  //     return {
                  //       ...item,
                  //       businessObjectCode: _res?.businessObjectCode,
                  //       businessObjectName: _res?.businessObjectName,
                  //     };
                  //   }),
                } as DataSetProps),
                textField: 'businessObjectFieldName',
                valueField: 'businessObjectFieldId',
              });
              setTotalFields(fields as TFields[]);
              setDs(
                new DataSet({
                  ...formDs(),
                  data: [dataObj],
                  fields,
                } as any)
              );
              setInitData([dataObj]);
              res.forEach((it, i) => {
                // eslint-disable-next-line no-unused-expressions
                ds?.current?.getField(String(i + 1))?.set(
                  'options',
                  new DataSet({
                    paging: false,
                    data: it,
                  })
                );
              });
              setOtherFields(fields.slice(1));
              setCurEdit(0);
              setResult(res?.[res?.length - 1]);
              setLoading(false);
              setCurrent(res?.length);
            });
          } else {
            setTotalFields(fields as TFields[]);
            setDs(
              new DataSet({
                ...formDs(),
                data: [dataObj],
                fields,
              } as any)
            );
            setInitData([dataObj]);
            res.forEach((it, i) => {
              // eslint-disable-next-line no-unused-expressions
              ds?.current?.getField(String(i + 1))?.set(
                'options',
                new DataSet({
                  paging: false,
                  data: it,
                })
              );
            });
            setOtherFields(fields.slice(1));
            setCurEdit(0);
            setResult(res?.[res?.length - 1]);
            setLoading(false);
            setCurrent(res?.length);
          }
        } else {
          setLoading(false);
        }
      });
    } else {
      setCurEdit(1);
      const query = {
        drillDownFlag,
        businessObjectCode,
        drillMainKeyFlag: drillMainKeyType === 'all',
      };
      if (customComponentTypeList && Array.isArray(customComponentTypeList)) {
        Object.assign(query, {
          componentTypeList: customComponentTypeList.toString(),
        });
      }
      // eslint-disable-next-line guard-for-in
      for (const key in initDrillParams) {
        Object.assign(query, { [key]: initDrillParams[key] });
      }
      drill({ query }).then((res) => {
        if (getResponse(res)) {
          const groupData = getGroupData(res, curFieldCode);
          setDs(
            new DataSet({
              ...formDs(),
              fields: [
                {
                  name: '1',
                  type: 'string',
                  options: new DataSet({
                    paging: false,
                    data: groupData,
                    fields: [
                      {
                        name: 'groupName',
                        type: 'string',
                        group: true,
                      },
                    ],
                    // data: res?.businessObjectFields
                    //   ?.filter((j) => j?.businessObjectFieldCode !== curFieldCode)
                    //   ?.map((item) => {
                    //     return {
                    //       ...item,
                    //       businessObjectCode: res?.businessObjectCode,
                    //       businessObjectName: res?.businessObjectName,
                    //     };
                    //   }),
                  } as DataSetProps),
                  textField: 'businessObjectFieldName',
                  valueField: 'businessObjectFieldId',
                },
                // {
                //   name: 'groupName',
                //   type: 'string',
                //   group: true,
                // },
              ],
            } as any)
          );
          setTotalFields([
            {
              name: '1',
              type: 'string',
              options: new DataSet({
                paging: false,
                data: groupData,
                fields: [
                  {
                    name: 'groupName',
                    type: 'string',
                    group: true,
                  },
                ],
                // data: res?.businessObjectFields
                //   ?.filter((j) => j?.businessObjectFieldCode !== curFieldCode)
                //   ?.map((item) => {
                //     return {
                //       ...item,
                //       businessObjectCode: res?.businessObjectCode,
                //       businessObjectName: res?.businessObjectName,
                //     };
                //   }),
              } as DataSetProps),
              textField: 'businessObjectFieldName',
              valueField: 'businessObjectFieldId',
            },
          ] as TFields[]);
          // eslint-disable-next-line no-unused-expressions
          ds?.current?.getField('1')?.set(
            'options',
            new DataSet({
              paging: false,
              data: groupData,
              fields: [
                {
                  name: 'groupName',
                  type: 'string',
                  group: true,
                },
              ],
              // data: res?.businessObjectFields
              //   ?.filter((j) => j?.businessObjectFieldCode !== curFieldCode)
              //   ?.map((item) => {
              //     return {
              //       ...item,
              //       businessObjectCode: res?.businessObjectCode,
              //       businessObjectName: res?.businessObjectName,
              //     };
              //   }),
            } as DataSetProps)
          );
          setLoading(false);
        }
        setLoading(false);
      });
    }
  }, []);

  /**
   * 获取componentType对应的imgIcon
   * @param componentType 字段类型 关联|主从|从主
   */
  const getComponentTypeIcon = (componentType) => {
    let iconName = '';
    let title = '';
    if (componentType) {
      switch (componentType) {
        case MASTER_RELATION:
        case SLAVE_MASTER:
          iconName = 'bocCongZhu.svg';
          title = intl.get('hmde.drillComponent.model.masterRelation').d('从主');
          break;
        case LINK_RELATION:
        case LINK:
          iconName = 'bocGuanLian.svg';
          title = intl.get('hmde.drillComponent.model.link').d('关联');
          break;
        case MASTER_SLAVE:
          iconName = 'bocZhuCong.svg';
          title = intl.get('hmde.drillComponent.model.masterSlave').d('主从');
          break;
        default:
          break;
      }
    }
    return (
      <Tooltip title={title} placement="left">
        <ImgIcon name={iconName} size={16} style={{ marginRight: 4 }} />
      </Tooltip>
    );
  };

  /**
   * 下啦选项的自定义渲染
   * @param param
   */
  const optionRenderer = ({ text, record }: RenderProps) => {
    const componentType = record?.get('componentType');
    const iconDom = getComponentTypeIcon(componentType);
    return (
      <div
        key={record?.get('')}
        style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}
      >
        <span style={{ textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
          {objectTypeList.includes(componentType) ? iconDom : null}
          <Tooltip title={text} placement="right">
            {text}
          </Tooltip>
        </span>
        {record?.get('drillFlag') && (
          <Icon type="baseline-arrow_right" style={{ marginRight: -10 }} />
        )}
      </div>
    );
  };

  // 初始化dataSet改变后的数据， dataSet中的fields每次改变之后，需要重新loadData
  useEffect(() => {
    // eslint-disable-next-line no-unused-expressions
    ds?.loadData(initData);
  }, [initData]);

  /**
   * 获取显示文本
   * @param text 这里有可能是text，也有可能是value，所以需要反查一下
   */
  const getText = (value, text) => {
    const findItem = referenceFormula.find((i) => i.businessObjectFieldId === value);
    return findItem?.businessObjectFieldName || text;
  };

  /**
   *  当前编辑态渲染为下拉框，其余渲染为Output
   * @param param
   * @param options
   */
  const renderer = (param: RenderProps, options?: DataSet | undefined | string) => {
    const { record, name, text, value: val } = param;
    const realOptions = (record?.getField(name)?.options || options) as DataSet;
    return String(curEdit) === name ? (
      <Select
        readOnly={String(curEdit) !== name}
        name={name}
        options={realOptions}
        onChange={(value) => handleChangeField(name, value, record, realOptions?.toData())}
        optionRenderer={optionRenderer}
        placeholder={intl.get('hzero.common.validation.requireSelect').d("请选择")}
      />
    ) : (
      // setCurEdit(Number(name))
      <div className={styles['drill-show']} onClick={() => handleChangeEdit(Number(name), val)}>
        {getText(val, text) || intl.get('hzero.common.validation.requireSelect').d("请选择")}
      </div>
    );
  };

  return (
    <Spin spinning={loading}>
      {!refState && (
        <div className={styles['tip-contain-warn']}>
          <div>
            <ImgIcon name="publish_fail_icon.svg" size={14} />
            <span>{refList?.message}</span>
          </div>
          <ImgIcon name="publish_fail_red.png" style={{ width: '100px', height: '28px' }} />
        </div>
      )}
      <div className={styles['drill-form']}>
        <Form
          dataSet={ds}
          columns={3}
          labelAlign={LabelAlign.right}
          labelWidth={46}
          useColon={false}
        >
          <Output name="1" label={intl.get('hzero.common.text.startEvent').d("开始")} renderer={renderer} />
          {otherFields?.map((item) => {
            return (
              <Output
                name={String(item.name)}
                label={
                  <>
                    <ImgIcon
                      name="fil-up@1x.svg"
                      size={14}
                      style={{ marginLeft: 8, transform: 'scaleY(-1) rotate(90deg)' }}
                    />
                    {(item as any)?.componentType &&
                      getComponentTypeIcon((item as any)?.componentType)}
                  </>
                }
                renderer={(params) => renderer(params, item?.options)}
              />
            );
          })}
        </Form>
        <Row gutter={24}>
          <Col span={8}>
            <ImgIcon size={160} name="select-field@2X.png" style={{ marginLeft: 20 }} />
          </Col>
          <Col span={16}>
            <Card bordered={false} style={{ height: 160, marginTop: 20 }}>
              <p>来源对象：{result?.businessObjectName}</p>
              <p>字段名称：{result?.businessObjectFieldName}</p>
              <p>
                字段类型：
                {componentTypeList.find((item) => item.value === result?.componentType)?.meaning}
              </p>
            </Card>
          </Col>
        </Row>
      </div>
    </Spin>
  );
});

import React, { ReactNode, useRef, useState, useEffect } from 'react';
import { Select, Modal, Output, DataSet, Tooltip } from 'choerodon-ui/pro';
import { message, Icon } from 'choerodon-ui';
import { getResponse } from 'utils/utils';
import { isEmpty } from 'lodash';
import intl from 'srm-front-boot/lib/utils/intl';

import ImgIcon from '@/utils/ImgIcon';
import { getDrillInfo, getNewDrillInfo } from '@/services/businessObjectService';

import DrillContent from './DrillContent';
import { formula2Desc } from './utils';

interface IRes {
  businessObjectFieldName: string;
  businessObjectName: string;
  businessObjectCode: string;
  componentType: string;
  attributeJson?: any;
  lovCode?: string;
}
export interface IParams {
  dataSet?: DataSet;
  text?: string;
  value?: string;
  result?: IRes;
}

export enum EDrillMainKeyType {
  NONE = 'none', // 不钻取主键
  ALL = 'all', // 全部钻取主键
  EXCLUDE_FIRST = 'exclude_first', // 第一层不钻取，其余钻取
}
const [
  MASTER_RELATION, // 从主
  LINK_RELATION, // 关联
  MASTER_SLAVE, // 主从
  LINK, // 高级关联,
  SLAVE_MASTER, // 高级从主,
] = ['MASTER_RELATION', 'LINK_RELATION', 'MASTER_SLAVE', 'LINK', 'SLAVE_MASTER'];
const objectTypeList = [MASTER_RELATION, LINK_RELATION, MASTER_SLAVE, LINK, SLAVE_MASTER]; // 对象的componentType类型集合
const [
  CONSTANT, // 前置条件类型标识
  FIELD, // 关联字段类型标识
] = ['CONSTANT', 'FIELD'];

interface IInitDrillParams {
  [propName: string]: any;
}
interface IProps {
  businessObjectCode: string | number; // 当前业务对象id
  renderer?: () => ReactNode; // 自定义renderer
  onOk?: (params?: IParams | undefined) => any; // 弹窗关闭回调
  onClear?: () => any; // 弹窗关闭回调
  name?: string; // dataSet中的name
  title?: string; // 自定义标题
  initValue?: string; // 后端返回的初始值
  isWriteBack?: boolean; // 是否需要回写
  curFieldCode?: string; // 当前字段的code，用于排除当前字段（不可选）取businessObjectFieldCode
  readOnly?: boolean;
  disabled?: boolean;
  drillSet?: boolean; // 是否开始钻取集合 默认不开启钻取单值或对象
  drillDownFlag?: boolean; // 控制是否向下钻取 不传的话默认是false，就是不向下钻取 传true就是允许向下钻取
  getInitRes?: (res) => void; // 初始化获取字段信息
  drillMainKeyType?: EDrillMainKeyType;
  componentTypeList?: string[]; // 前端自定义钻取参数 拼接到drill接口路径后
  initDrillParams?: IInitDrillParams; // 初始化时钻取接口需要添加的查询参数 拼接在接口后
}

const DrillComponent = (props: IProps) => {
  const drillRef: any = useRef();

  const {
    renderer,
    onOk,
    businessObjectCode,
    name,
    title,
    initValue,
    onClear,
    isWriteBack = true,
    curFieldCode,
    readOnly = false,
    disabled = false,
    drillMainKeyType = EDrillMainKeyType.NONE,
    drillSet = false,
    drillDownFlag = false,
    componentTypeList,
    initDrillParams,
    // getInitRes = () => {},
  } = props;

  const [drillText, setDrillText] = useState<string | undefined>('');
  const [drillValue, setDrillValue] = useState<string | undefined>('');
  const [curId, setCurId] = useState<string | number>('');

  const [refList, setRefList] = useState<any>({});
  const [refState, setRefState] = useState<boolean>(true);

  useEffect(() => {
    setDrillValue('');
    setDrillText('');
    setCurId(businessObjectCode);
  }, [businessObjectCode]);

  /**
   * 初始化给input赋值
   */
  useEffect(() => {
    if (drillValue) {
      getNewDrillInfo({ referenceFormula: drillValue }).then((res) => {
        if (res) {
          setRefList(res);
          setRefState(res?.success);
        }
      });
      getDrillInfo({ referenceFormula: drillValue }).then((res) => {
        const transferList: any[] = [];
        if (getResponse(res)) {
          res.forEach((item) => {
            transferList.push({
              value: item.businessObjectFieldCode
                ? `${item.businessObjectCode}.${item.businessObjectFieldCode}`
                : `${item.businessObjectCode}`,
              meaning: item.businessObjectFieldName
                ? `${item.businessObjectName}.${item.businessObjectFieldName}`
                : `${item.businessObjectName}`,
              formula: item.referenceFormula,
            });
          });
          const desc = formula2Desc(transferList);
          // 直接拼接后端文本即可
          setDrillText(desc);
        } else {
          setDrillValue('');
          setDrillText('');
        }
      });
    }
  }, [drillValue]);

  useEffect(() => {
    setDrillValue(initValue);
  }, [initValue]);

  /**
   * 弹窗关闭回调
   */
  const handleOk = async () => {
    const result: IRes = drillRef?.current?.getResult?.();
    const referenceFormula = drillRef?.current?.getReferenceInfo?.();
    if (result?.businessObjectFieldName || result?.businessObjectName) {
      const curData = drillRef?.current?.dataSet?.current?.toData();
      delete curData?.__dirty;
      let insertValue = '';
      let realValue = '';
      let _insertValue = '';
      let masterBusinessObjectFieldCode = ''; // 前置条件左侧字段
      let associateValue = ''; // 前置条件右侧字段值
      let associationStr = '';
      const len = Object.keys(curData)?.length;
      Object.keys(curData).forEach((item, index) => {
        const opt = drillRef?.current?.dataSet?.current?.getField(item)?.options?.toData();
        const editOpt = referenceFormula?.find((i) => i?.businessObjectFieldId === curData?.[item]);
        const curOpt = opt?.find((i) => i?.businessObjectFieldId === curData?.[item]) || editOpt;
        const {
          businessObjectName = '',
          businessObjectFieldName = '',
          businessObjectCode: boCode = '',
          businessObjectFieldCode = '',
          associateBusinessObjectCode = '', // 高级对象标识
          referenceType = '', // 高级对象标识
          businessObjectAssociateFieldList = [],
        } = curOpt || {};

        // 高级关系前置条件对象 // CASCADE(MEMBER_ROLE.|${memberType// 前置条件字段}=${USER // 前置条件值}|${memberId // 关联字段左侧code集合}, USER.id)
        if (associateBusinessObjectCode || referenceType === 'ASSOCIATE') {
          const preCondition = businessObjectAssociateFieldList.find(
            (advanceField) => advanceField?.associateFieldType === CONSTANT
          );
          masterBusinessObjectFieldCode = preCondition?.masterBusinessObjectFieldCode;
          associateValue = preCondition?.associateValue;
          let associationRelationCodeList = businessObjectAssociateFieldList
            .filter((advanceField) => advanceField?.associateFieldType === FIELD)
            .map((associateField) => associateField?.masterBusinessObjectFieldCode); // 关联关系标识
          associationRelationCodeList = associationRelationCodeList.join('|');
          if (!isEmpty(associationRelationCodeList)) {
            associationStr = masterBusinessObjectFieldCode
              ? `|${masterBusinessObjectFieldCode}=${associateValue}|${associationRelationCodeList}`
              : `|${associationRelationCodeList}`;
          } else if (masterBusinessObjectFieldCode) {
            associationStr = `|${masterBusinessObjectFieldCode}=${associateValue}`;
          }
        }

        if (
          len - 1 === index &&
          objectTypeList.includes(drillRef.current?.selectItem?.componentType)
        ) {
          // 非字段 （即主从/关联/从主对象）
          if (index === len - 1) {
            _insertValue = `${businessObjectName}.${businessObjectFieldName},${businessObjectName}`;
          } else {
            _insertValue = `${businessObjectName}.${businessObjectFieldName},${businessObjectName},`;
          }
        } else if (index === len - 1) {
          _insertValue = `${businessObjectName}.${businessObjectFieldName}`;
        } else {
          _insertValue = `${businessObjectName}.${businessObjectFieldName},`;
        }
        insertValue = insertValue.concat(_insertValue);
        realValue = realValue.concat(
          index === len - 1
            ? `${boCode}.${associateBusinessObjectCode ? associationStr : businessObjectFieldCode}`
            : `${boCode}.${associateBusinessObjectCode ? associationStr : businessObjectFieldCode},`
        );
      });
      let str = objectTypeList.includes(drillRef.current?.selectItem?.componentType) // 非字段 （即主从/关联/从主对象）
        ? `CASCADE(${realValue}, ${
            drillRef.current?.selectItem?.associateBusinessObjectCode
              ? drillRef.current?.selectItem?.associateBusinessObjectCode
              : drillRef.current?.selectItem?.masterBusinessObjectCode
          }`
        : `CASCADE(${realValue}`;
      if (drillSet) {
        // 是否开起钻取集合
        str = `${str}, LIST)`;
      } else {
        str = `${str})`;
      }
      if (isWriteBack) {
        // 当前选中的是主从关系对象 则拼接对象编码
        setDrillValue(str);
        setDrillText(insertValue);
      }
      const params = {
        dataSet: drillRef?.current?.dataSet,
        text: `CASCADE(${insertValue})`,
        value: str,
        result,
      };
      // eslint-disable-next-line no-unused-expressions
      onOk?.(params);
    } else {
      message.error('请选择完整的数据', 3, () => {}, 'top');
      return false;
    }
  };

  const cusRender = () => {
    if (readOnly) {
      return (
        <Tooltip placement="top" title={drillText}>
          {drillText}
        </Tooltip>
      );
    } else if (renderer) {
      return <div>{renderer()}</div>;
    } else {
      return initRender();
    }
  };

  /**
   * 清除钻取值
   * @param e
   */
  const handleClear = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDrillText('');
    setDrillValue('');
    // eslint-disable-next-line no-unused-expressions
    onClear?.();
  };

  const initRender = () => (
    <Tooltip title={drillText}>
      <Select
        name={name}
        onClick={openDrillModal}
        style={{ width: '100%' }}
        placeholder={intl.get('hzero.common.validation.requireSelect', { name: '' }).d("请选择")}
        value={isWriteBack ? drillText : undefined}
        disabled={!curId || disabled}
        suffix={
          <span style={{ display: 'flex' }}>
            {drillText && isWriteBack && (
              <Icon type="close" onClick={handleClear} style={{ marginLeft: -12 }} />
            )}
            <ImgIcon name="LOV.svg" size={14} style={{ marginTop: 3 }} />
          </span>
        }
      >
        <Select.Option value={drillValue}>{drillText}</Select.Option>
      </Select>
    </Tooltip>
  );

  const openDrillModal = () => {
    if (!readOnly && curId && !disabled) {
      Modal.open({
        key: 'drill',
        destroyOnClose: true,
        style: {
          width: 595,
        },
        closable: true,
        title: title || intl.get('hzero.common.validation.requireSelect', { name: '' }).d("请选择"),
        children: (
          <DrillContent
            ref={drillRef}
            businessObjectCode={curId}
            value={isWriteBack ? drillValue : undefined}
            curFieldCode={curFieldCode}
            drillDownFlag={drillDownFlag}
            drillMainKeyType={drillMainKeyType}
            customComponentTypeList={componentTypeList}
            initDrillParams={initDrillParams}
            refList={refList}
            refState={refState}
          />
        ),
        drawer: false,
        onOk: handleOk,
      });
    }
  };

  return <Output disabled={disabled} renderer={cusRender} onClick={openDrillModal} />;
};

export default DrillComponent;

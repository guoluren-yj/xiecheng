/**
 * 基本配置
 */
import React, { useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { Badge } from 'choerodon-ui';
import { Form, TextField, Select, NumberField, IntlField, Tooltip, Icon, Output, Button } from 'choerodon-ui/pro';
import { isEmpty, isUndefined } from 'lodash';

import intl from 'utils/intl';
import { isTenantRoleLevel } from 'utils/utils';
import Card from '@/components/Card';

import DefaultComponent from './DefaultComponent';
import LovCode from './LovCode';

/* 打开fx配置模态框 */
const FxComponentWrapper = observer(
  ({ ds, dimensionType, conditionType, disabledFlag, isDefault, showConditionModal }) => {
    const { conditionList = [], defaultCondition, proDefaultFlag, formulaConditionFx = {} } = ds?.current?.get(['conditionList', 'defaultCondition', 'proDefaultFlag', 'formulaConditionFx']) || {};
    let dotFlag;
    if(isDefault) {
      dotFlag = !isEmpty((proDefaultFlag === 'FORMULA' ? formulaConditionFx : defaultCondition)?.conditionLineList);
    } else {
      dotFlag = conditionList.find(n => n.conditionHeader?.conditionType === conditionType);
    }
    return (
      <Badge dot={dotFlag}>
        <a
          className="fx"
          onClick={() =>
            showConditionModal(dimensionType, conditionList, conditionType, isDefault, disabledFlag)
          }
        >
          Fx
        </a>
      </Badge>
    );
  }
);

function BaseConfig(props) {
  const {
    dataSet,
    dimensionType,
    editEnable,
    isCreate,
    templateType,
    dimensionCode,
    fieldConfig = {},
    templateId,
    showConditionModal = e => e,
    showFieldPararamsConfig = e => e,
    readOnly,
  } = props;

  // 价格权限维度
  // 不允许修改以下选项
  // 编码、启用标识、必输标识、拆单标识，组件类型，值集编码，价格权限维度标识
  const isProductDimension = +dataSet.current?.get('productDimensionFlag') === 1;

  // 复制的固定维度
  const disabled = useMemo(() => {
    return templateType === 'COPY' && dimensionType.includes('FIXED') && !isCreate;
  }, [templateType, dimensionType, isCreate]);

  // 获取配置表字段配置
  const getConfigDisabled = (code) => {
    // 首先判断是不是固定维度，自定义维度可编辑，固定维度再读取配置，没有配置默认不可编辑
    return disabled && (isEmpty(fieldConfig) ? true : fieldConfig[code] === '0');
  };

  // 受价格权限维度控制
  const priceControlDisabled = (code) => {
    return getConfigDisabled(code) || isProductDimension;
  };

  const { dimensionParameterList } = dataSet.current?.toData() || {};

  const fxComponent = (conditionType, _disabled = false, isDefault = false) => {
    return (
      <FxComponentWrapper
        dimensionType={dimensionType}
        conditionType={conditionType}
        ds={dataSet}
        disabledFlag={_disabled}
        isDefault={isDefault}
        showConditionModal={showConditionModal}
      />
    );
  };

  // function getComponent() {
  //   let component;
  //   const { componentType, defaultType } = dataSet.current?.get(['componentType', 'defaultType']) || {};
  //   switch (componentType) {
  //     case 'TEXT_AREA':
  //     case 'INPUT':
  //       component = readOnly ? (
  //         <Output name="fieldLengthObj" />
  //       ) : (
  //         <NumberField name="fieldLengthObj" style={{ width: '100%' }} />
  //       );
  //       break;
  //     case 'LOV':
  //     case 'SELECT':
  //       component = readOnly ? (
  //         <Output
  //           name="lovCode"
  //           renderer={({ text }) => (
  //             <span>
  //               {text}
  //               <Button
  //                 funcType="link"
  //                 style={{ marginLeft: 8 }}
  //                 onClick={() =>
  //                   showFieldPararamsConfig(
  //                     dimensionParameterList,
  //                     dataSet.toData()[0].dimensionParameterList,
  //                     editEnable,
  //                     isCreate,
  //                     dataSet
  //                   )
  //                 }
  //               >
  //                 {intl.get('small.common.fx.field.config').d('值集配置')}
  //               </Button>
  //             </span>
  //           )}
  //         />
  //       ) : (
  //         <LovCode
  //           ds={dataSet}
  //           fieldEvents={() =>
  //             showFieldPararamsConfig(
  //               dimensionParameterList,
  //               dataSet.toData()[0].dimensionParameterList,
  //               editEnable,
  //               isCreate,
  //               dataSet
  //             )
  //           }
  //         />
  //       );
  //       break;
  //     case 'DATE_PICKER':
  //       component = !defaultType ? (
  //         readOnly ? (
  //           <Output name="proDefaultFlag" />
  //         ) : (
  //           <Select name="proDefaultFlag" clearButton={false} />
  //         )
  //       ) : (
  //         <div />
  //       );
  //       break;
  //     default:
  //       component = <div />;
  //       break;
  //   }
  //   return component;
  // }

  function renderForm(item) {
    const { fieldList } = item || {};
    const com = (props) => {
      let component;
      switch (props.type) {
        case 'text':
          component = <TextField {...props} />
          break;
        case 'intl':
          component = <IntlField {...props} />
          break;
        case 'select':
          component = <Select {...props} />
          break;
        case 'number':
          component = <NumberField {...props} />;
          break;
        default:
          component = <TextField {...props} />
          break;
      }
      return props.children || component;
    }
    const newList = fieldList.filter(n => (n.show || isUndefined(n.show)));
    const outPutRender = ({ value, text, name }, field) => (
      <span>
        {name.endsWith('Flag') || field.hasBadge ? <Badge color={value ? '#3AB344' : '#f05434'} text={text} /> : <span className='text-overflow'>{text || '-'}</span>}
        <span style={{ paddingLeft: 8 }}>{field.addonAfter}</span>
      </span>
    );
    return (
      <Form
        dataSet={dataSet}
        columns={3}
        labelLayout={readOnly ? 'vertical' : 'float'}
        className={readOnly ? 'c7n-pro-vertical-form-display' : ''}
      >
        {newList.map(field => (
          <>
          {field.children ||
          (readOnly ? <Output colSpan={field.colSpan} name={field.name} newLine={field.newLine} renderer={n => outPutRender(n, field)} /> : com(field))}
          </>
        ))}
      </Form>
    );
  }

  const configList = [
    {
      title: intl.get('small.common.view.title.baseInfo').d('基础信息'),
      fieldList: [
        {
          name: 'dimensionCode',
          disabled: disabled || isProductDimension,
        },
        {
          name: 'dimensionName',
          type: 'intl',
        },
        {
          name: 'annotation',
          type: 'intl',
        },
      ],
    },
    {
      title: intl.get('small.common.view.title.dimensionConfig').d('维度配置'),
      fieldList: [
        {
          name: 'necessaryFlag',
          type: 'select',
          disabled: priceControlDisabled('necessaryFlag'),
          addonAfter: fxComponent('NECESSARY', priceControlDisabled('necessaryFlag')),
        },
        {
          name: 'editFlag',
          type: 'select',
          disabled: priceControlDisabled('editFlag'),
          addonAfter: fxComponent('EDIT', priceControlDisabled('editFlag')),
        },
        {
          name: 'displayFlag',
          type: 'select',
          addonAfter: fxComponent('DISPLAY', false),
        },
        {
          name: 'splitFlag',
          type: 'select',
          disabled: priceControlDisabled('splitFlag'),
          addonAfter: fxComponent('SPLIT', priceControlDisabled('splitFlag')),
        },
        {
          name: 'budgetFlag',
          type: 'select',
          disabled:
            getConfigDisabled('budgetFlag') ||
            (dimensionType === 'LINE_FIXED' && templateType === 'COPY'),
          addonAfter: fxComponent(
            'BUDGET',
            getConfigDisabled('budgetFlag') ||
              (dimensionType === 'LINE_FIXED' && templateType === 'COPY')
          ),
        },
        {
          name: 'productDimensionFlag',
          type: 'select',
          disabled: true,
          showHelp: 'tooltip',
          help: intl
            .get('small.cartTemplate.productCustDim.desc')
            .d('维度对商品的价格权限有影响，值为【是】'),
        },
        {
          name: 'mergeFlag',
          type: 'select',
          disabled: getConfigDisabled('mergeFlag'),
        },
        {
          name: 'fieldBinding',
        },
        {
          name: 'encryptFlag',
          type: 'select',
          disabled: disabled,
        },
        {
          name: 'batchFlag',
          type: 'select',
          disabled:
            isTenantRoleLevel() &&
            ['quantity', 'taxIncludedPrice', 'warehouseId'].includes(dimensionCode),
        },
      ],
    },
    {
      title: intl.get('small.common.view.title.dimensionAttr').d('维度属性'),
      fieldList: [
        {
          name: 'orderSeq',
          type: 'number',
          show: dimensionType.startsWith('LINE'),
        },
        {
          name: 'orderSeq',
          type: 'number',
          show: dimensionType.startsWith('LINE'),
        },
        {
          name: 'colSeq',
          type: 'number',
          show: dimensionType.startsWith('HEADER'),
        },
        {
          name: 'rowSeq',
          type: 'number',
          show: dimensionType.startsWith('HEADER'),
        },
        {
          name: 'componentType',
          newLine: true,
          type: 'select',
          disabled: disabled || isProductDimension,
          onClick: () => {
            dataSet.current.set({ defaultValue_component: '', lovCodeLov: {} });
          },
        },
        {
          name: 'lovCode',
          show: readOnly && ['LOV', 'SELECT'].includes(dataSet.current?.get('componentType')),
          colSpan: 2,
          addonAfter: (
            <Button
              funcType="link"
              style={{height: 16}}
              onClick={() =>
                showFieldPararamsConfig(
                  dimensionParameterList,
                  dataSet.toData()[0].dimensionParameterList,
                  editEnable,
                  isCreate,
                  dataSet
                )
              }
            >
              {intl.get('small.common.fx.field.config').d('值集配置')}
            </Button>
          ),
        },
        {
          show: !readOnly && ['LOV', 'SELECT'].includes(dataSet.current?.get('componentType')),
          children: (
            <LovCode
              ds={dataSet}
              fieldEvents={() =>
                showFieldPararamsConfig(
                  dimensionParameterList,
                  dataSet.toData()[0].dimensionParameterList,
                  editEnable,
                  isCreate,
                  dataSet
                )
              }
            />
          ),
        },
        {
          name: 'fieldLengthObj',
          type: 'number',
          show: ['INPUT', 'TEXT_AREA'].includes(dataSet.current?.get('componentType')),
        },
        {
          name: 'proDefaultFlag',
          type: 'select',
          show:
            'DATE_PICKER' === dataSet.current?.get('componentType') &&
            !dataSet.current?.get('defaultType'),
          clearButton: false,
        },
        {
          name: 'defaultType',
          newLine: true,
          type: 'select',
          hasBadge: true,
        },
        {
          // 默认值
          children: (
            <DefaultComponent
              name="defaultValue"
              isDefault
              dataSet={dataSet}
              fxComponent={fxComponent}
              ds={dataSet}
              disabled={!editEnable && !isCreate}
              templateId={templateId}
              dimensionType={dimensionType}
              readOnly={readOnly}
            />
          ),
        },
      ],
    },
  ];

  return configList.map(item => {
    return (
      <Card title={item.title} titleStyle={{ fontWeight: 600, marginBottom: 16 }}>
        {renderForm(item)}
      </Card>
    );
  });
}

export default observer(BaseConfig);

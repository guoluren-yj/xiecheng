/*
 * @Description: 适用范围/累计维度
 * @Date: 2023-04-11 11:37:03
 * @Author: MYT<yitian.mao@going-link.com>
 * @Version: 1.0.0
 * @Copyright: Copyright (c) 2021, ZhenYun
 */
import React, { useContext, useCallback, useEffect } from 'react';
import { observer } from 'mobx-react';
import {
  Icon,
  TextField,
  NumberField,
  Select,
  Button,
  Lov,
  Output,
  Form,
} from 'choerodon-ui/pro';
import { FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/interface';

import intl from 'utils/intl';

import type DataSet from 'choerodon-ui/dataset/data-set/DataSet';

import { DimensionType } from '../../../BasicConfiguration/utils/type';
import EditorForm from '../../../Components/EditorForm';
import OverflowTip from '../../../Components/OverflowTip';
import noDataImg from '../../../../assets/no_result.svg';
import { Store, dimensionColumns } from '../Detail/stores';
import style from './index.less';
import { getLeftValueParams } from '../Detail/stores/mainDS';
import { setNewColumnsProps } from '../../../utils';

const ComponentType = {
  INPUT_NUMBER: NumberField,
  INPUT: TextField,
  LOV: Lov,
  SELECT: Select,
};

interface maintainProps {
  dataSet: DataSet,
  dimensionType: DimensionType,
  cuxStyle?: object,
  setBubblePrompt?: Function,
}

const ReadOnlyLine = observer(props => {
  const { dataSet, editorColumns } = props;
  const getShowField = useCallback((fieldCode) => {
    return editorColumns(dataSet.records[0]).some(obj => obj.name === fieldCode);
  }, [editorColumns, dataSet]);

  return (
    <div className={style['rule-maintenance-dimensoin-list-readonly']}>
      {
        dataSet.map(record => {
          return (
            <div key={record.index} className='item' style={record?.index + 1 === dataSet.length ? { borderBottom: 0 } : {}}>
              <OverflowTip className='index'>#{record?.index + 1}</OverflowTip>
              {getShowField('dimensionCode') && <OverflowTip className='prev'>{record?.get('dimensionName')}</OverflowTip>}
              {getShowField('dimensionOperation') && <OverflowTip className='compare'>{record?.get('dimensionOperationMeaning')}</OverflowTip>}
              {getShowField('dimensionValue') && <OverflowTip className='next'>{record?.get('dimensionValueMeaning') || record?.get('dimensionValue')}</OverflowTip>}
            </div>
          );
        })
      }
    </div>
  );
});

const MaintainView = observer((props: maintainProps) => {
  const { dataSet, dimensionType, cuxStyle, setBubblePrompt } = props;
  const { editFlag = true, configFieldsArr, ruleDs, headerInfo, changeFlag, discountRemote, history } = useContext(Store);

  // 获取维度范围的下拉框数据
  const dimensionCodeLookupDatas = dataSet.getField('dimensionCode')?.getOptions()?.toData() || [];

  // 处理气泡
  const handleSetBubblePrompt = useCallback(() => {
    if (setBubblePrompt && dataSet) {
      const dimensionCodeTips = dataSet.current?.getField('dimensionCode')?.get('bubblePrompt');
      const dimensionValueTips = dataSet.current?.getField('dimensionValue')?.get('bubblePrompt');
      const dimensionOperationTips = dataSet.current?.getField('dimensionOperation')?.get('bubblePrompt');
      const tips = [dimensionCodeTips, dimensionOperationTips, dimensionValueTips].filter((v) => v)?.join(';');
      setBubblePrompt(tips || '');
    }
  }, [setBubblePrompt, dataSet]);

  const handleLoad = useCallback(() => {
    const stepCurrentIndex = ruleDs.getState('stepCurrent') || 0;
    const effectiveStepList = ruleDs.getState('effectiveStepList') || [];
    const step = effectiveStepList?.[stepCurrentIndex]?.name || 'END';
    const { cumulativeMode } = ruleDs?.current?.get(['cumulativeMode']) || {};
    if (dataSet && !dataSet.length
      && ((step === 'END' && editFlag && (
        dimensionType === DimensionType.apply ||
        dimensionType === DimensionType.cumulative
        && cumulativeMode === 'CUMULATIVE'
      )) ||
        (step === 'APPLICATION_SCOPE' && dimensionType === DimensionType.apply) ||
        (step === 'CALCULATE_RULE'
          && dimensionType === DimensionType.cumulative
          && cumulativeMode === 'CUMULATIVE'))) {
      if (dimensionCodeLookupDatas.length && headerInfo) {
        dimensionCodeLookupDatas.map((dimension: any) => {
          const { dimensionCode, componentType } = dimension;
          const isLovType = ['LOV'].includes(componentType);
          const itemObj = {
            ...dimension,
            dimensionValue: isLovType ? headerInfo : headerInfo[dimensionCode],
            dimensionOperation: 'EQUALS',
          };
          if (['supplierCompanyId', 'companyId', 'pcHeaderId'].includes(dimensionCode)) {
            dataSet.create(itemObj);
          } else if (dimensionCode === 'currencyCode' && headerInfo.pcCurrencyCodes) {
            dataSet.create({
              ...itemObj,
              dimensionValue: { currencyCode: headerInfo.pcCurrencyCodes, currencyName: headerInfo.pcCurrencyCodes },
            });
          }
        });
      }
      if (discountRemote?.event) {
        discountRemote.event.fireEvent('handleCuxLoad', { ruleDs, dataSet, dimensionCodeLookupDatas });
      } else if (!dataSet.length) {
        dataSet.create({});
      }
    }
  }, [ruleDs, dataSet, editFlag, dimensionType, dimensionCodeLookupDatas, headerInfo, discountRemote]);

  useEffect(() => {
    if (dimensionCodeLookupDatas?.length && !dataSet.length && ruleDs?.current?.get('sourceCombineDocumentCode')) {
      handleLoad();
    }
  }, [dimensionCodeLookupDatas, dataSet.length, handleLoad, ruleDs]);

  useEffect(() => {
    dataSet.addEventListener('load', handleSetBubblePrompt);
    return () => {
      dataSet.removeEventListener('load', handleSetBubblePrompt);
    };
  }, [handleSetBubblePrompt, dataSet]);

  // 新增
  const handleAdd = useCallback(
    () => {
      dataSet.create({});
      handleSetBubblePrompt();
    },
    [dataSet, handleSetBubblePrompt],
  );

  const handleDelete = useCallback(
    async (record) => {

      const res = await dataSet.delete(record, record.status != 'add' ? {
        title: intl.get('hzero.common.message.confirm.title').d('提示'),
        children: intl.get('spfp.common.view.message.isDeleteSelectedLines').d('确认删除选中行？'),
      } : false);
      if (res) {
        dataSet.query();
      }
    },
    [dataSet],
  );

  // 渲染右边的
  const renderRightValue = useCallback(
    (record) => {
      const leftValueParams = getLeftValueParams(dataSet, record);
      const { componentType } = leftValueParams;
      const basicConfig = {
        colSpan: 6,
        name: 'dimensionValue',
        maxTagCount: 1,	// 多值标签最大数量
        // maxTagTextLength: 5, // 多值标签文案最大长度
        maxTagPlaceholder: (restValues) => `+${restValues.length}...`, // 多值标签超出最大数量时的占位描述
        changeFlag,
      };
      return { editor: ComponentType[componentType || 'INPUT'], ...basicConfig };
    },
    [dataSet, changeFlag],
  );

  // 过滤其他行已经出现过的选项
  const filterOptions = useCallback((record) => {
    // 列表上面已经出现过的dimensionCode集合
    const pastDimensionCodes = dataSet.slice(0, dataSet.length).map(r => r.get('dimensionCode')) || [];
    return !pastDimensionCodes.includes(record?.get('dimensionCode'));

  }, [dataSet]);

  const editorColumns = useCallback((record) => {
    const columnArray = setNewColumnsProps([
      { name: 'index', colSpan: 1, editor: () => <div style={{ fontWeight: 'bold', textAlign: 'center' }}>#{record?.index + 1}</div> },
      {
        name: 'dimensionCode',
        colSpan: 6,
        editor: Select,
        optionsFilter: filterOptions,
      },
      { name: 'dimensionOperation', colSpan: 6, editor: Select },
      renderRightValue(record),
      {
        name: 'action', colSpan: 1, editor: () => (
          <Button
            icon="delete"
            funcType={FuncType.flat}
            disabled={dataSet.length === 1}
            onClick={() => handleDelete(record)}
          />
        ),
      },
    ], dataSet, configFieldsArr, dimensionType);

    return discountRemote
      ? discountRemote.process('SPFP_DISCOUNT_DETAIL_MAINTAIN_COLUMNS', columnArray, {
        dataSet,
        handleDelete,
        record,
        changeFlag,
      })
      : columnArray;
  }, [handleDelete, renderRightValue, dimensionType, dataSet, configFieldsArr, filterOptions, discountRemote, changeFlag]);

  useEffect(() => {
    dataSet.setState('configFieldsArr', configFieldsArr);
    // 供新建校验使用
    const showFields = setNewColumnsProps(dimensionColumns, dataSet, configFieldsArr, dimensionType);
    dataSet.setState('displayFields', showFields);
  }, [dimensionType, dataSet, configFieldsArr]);

  const renderReadOnlyLine = () => {
    if (discountRemote) {
      return discountRemote.render('SPFP_DISCOUNT_DETAIL_READONLY_LINE', <ReadOnlyLine dataSet={dataSet} editorColumns={editorColumns} />, {
        dataSet,
        editorColumns,
        history,
      });
    }
    return <ReadOnlyLine dataSet={dataSet} editorColumns={editorColumns} />;
  };

  return (
    <div className={style['rules-maintenance-editor-wrapper']}>
      {
        dataSet?.length > 0 && dimensionCodeLookupDatas?.length > 0 ? (
          (editFlag || changeFlag) ? dataSet.map(record => {
            if (record.status !== 'delete') {
              return (
                <div className="rule-editor-form">
                  <EditorForm
                    key={record.index}
                    columns={20}
                    record={record}
                    editorFlag={editFlag}
                    editorColumns={editorColumns(record)}
                  />
                </div>
              );
            } else {
              return null;
            }
          })
            : renderReadOnlyLine()
        ) : (
          <div className={style['rule-maintenance-no-data']} style={cuxStyle}>
            <img src={noDataImg} />
            <div>{intl.get('hzero.common.components.noticeIcon.null').d('暂无数据')}</div>
          </div>
        )
      }
      {editFlag
        && dimensionCodeLookupDatas?.length
        && dataSet?.length
        && (dimensionCodeLookupDatas.length > dataSet.length)
        ? (
          <div className="rule-editor-add-btn">
            <Form columns={20} labelLayout={LabelLayout.float}>
              <Output colSpan={1} renderer={() => ' '} />
              <Output
                colSpan={18}
                renderer={() => <a className='rules-maintenance-control-point' onClick={handleAdd}><Icon type="control_point" /></a>}
              />
              <Output colSpan={1} renderer={() => ' '} />
            </Form>
          </div>
        ) : null
      }
    </div>
  );
});

export default MaintainView;

/*
 * @Description: 适用范围-维护视图
 * @Author: yan.xie <yan.xie@gong-link.com>
 * @Date: 2023-03-01 12:57:20
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2023, Hand
 */
import React, { useContext, useCallback, useEffect } from 'react';
import { observer } from 'mobx-react';
import
{
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
// import { queryUnifyIdpValue } from 'services/api';
// import { getResponse } from 'utils/utils';

import EditorForm from '../../../Components/EditorForm';
import OverflowTip from '../../../Components/OverflowTip';
import { DimensionType } from '../../../BasicConfiguration/utils/type';
import noDataImg from '../../../../assets/no_result.svg';
import { Store, dimensionColumns } from '../Detail/stores';
import style from './index.less';
import { getLeftValueParams } from '../Detail/stores/mainDS';
import { setNewColumnsProps } from '../../../utils';
import { getSelectedNegActConfirmMsg } from '../../../../utils/renderer';


const ComponentType = {
  INPUT_NUMBER: NumberField,
  INPUT: TextField,
  LOV: Lov,
  SELECT: Select,
};

const ReadOnlyLine = observer(props =>
{
  const { dataSet, editorColumns } = props;
  const getShowField = useCallback((fieldCode) =>
  {
    return editorColumns(dataSet.records[0]).some(obj => obj.name === fieldCode);
  }, [editorColumns, dataSet]);

  return (
    <div className={style['rule-maintenance-dimensoin-list-readonly']}>
      {
        dataSet.map(record =>
        {
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
    </div >
  );
});

const DimensionLine = observer((props) =>
{
  const { dataSet, dimensionType, setBubblePrompt } = props;
  const { editFlag = true, modal, configFieldsArr, ruleDs, applyRangeDs, spcmHeaderInfo, changeFlag, remoteProps } = useContext(Store);



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

  const handleLoad = useCallback(async () =>
  {
    const stepCurrentIndex = ruleDs.getState('stepCurrent') || 0;
    const effectiveStepList = ruleDs.getState('effectiveStepList') || [];
    const step = effectiveStepList?.[stepCurrentIndex]?.name || 'END';
    const { cumulativeMode } = ruleDs?.current?.get(['cumulativeMode']) || {};
    if (dataSet && !dataSet.length
      && ruleDs?.current?.get('sourceCombineDocumentCode')
      && ((step === 'END' && editFlag && (
        dimensionType === DimensionType.apply ||
        dimensionType === DimensionType.cumulative
        && cumulativeMode === 'CUMULATIVE'
      ))
        ||
        (step === 'APPLICATION_SCOPE' && dimensionType === DimensionType.apply) ||
        (step === 'CALCULATE_RULE'
          && dimensionType === DimensionType.cumulative
          && cumulativeMode === 'CUMULATIVE')))
    {
      if (dimensionCodeLookupDatas.length)
      {
        // dataSet.create({});
        // 需默认带出协议头上的 公司/供应商/协议编码等字段。
        if (spcmHeaderInfo && dimensionType === DimensionType.apply)
        {

          dimensionCodeLookupDatas.map((dimension: any) =>
          {
            const { dimensionCode, componentType } = dimension;
            const isLovType = ['LOV'].includes(componentType);
            if (['supplierCompanyId', 'companyId', 'pcNum'].includes(dimensionCode))
            {
              dataSet.create({
                ...dimension,
                dimensionValue: isLovType ? spcmHeaderInfo : spcmHeaderInfo[dimensionCode],
                dimensionOperation: 'EQUALS',
              });

            }
          });

        }
        if (remoteProps?.event) {
          remoteProps.event.fireEvent('handleCuxLoad', { ruleDs, dataSet, dimensionCodeLookupDatas, dimensionType });
        } else if (!dataSet.length) {
          dataSet.create({});
        }
      }

    }
    handleSetBubblePrompt();
  }, [ruleDs, dataSet, editFlag, dimensionType, spcmHeaderInfo, dimensionCodeLookupDatas, handleSetBubblePrompt, remoteProps]);

  useEffect(() =>
  {
    // 防止新增行删不掉
    dataSet.addEventListener('load', handleLoad);
    return () =>
    {
      dataSet.removeEventListener('load', handleLoad);
    };
  }, [handleLoad, spcmHeaderInfo, dataSet]);



  useEffect(() =>
  {
    const ruleId = ruleDs?.current?.get('ruleId');
    if (ruleId)
    {
      dataSet.setQueryParameter('ruleId', ruleId);
    }
  }, [dataSet, ruleDs?.current]);

  // 新增
  const handleAdd = useCallback(
    () =>
    {
      dataSet.create({});
      handleSetBubblePrompt();
    },
    [dataSet, handleSetBubblePrompt],
  );

  const handleDelete = useCallback(
    async (record) =>
    {
      const res = await dataSet.delete(record, getSelectedNegActConfirmMsg('delete', dataSet));
      if (res) dataSet.query();
    },
    [dataSet],
  );

  // 渲染右边的
  const renderRightValue = useCallback(
    (record) =>
    {
      const leftValueParams = getLeftValueParams(dataSet, record);
      const { componentType } = leftValueParams;
      const basicConfig = {
        colSpan: 6,
        name: 'dimensionValue',
        maxTagCount: 1,	// 多值标签最大数量
        changeFlag,
      };
      return { editor: ComponentType[componentType || 'INPUT'], ...basicConfig };
    },
    [dataSet, changeFlag],
  );

  // 过滤其他行已经出现过的选项
  const filterOptions = useCallback((record) =>
  {
    // 列表上面已经出现过的dimensionCode集合
    const pastDimensionCodes = dataSet.slice(0, dataSet.length).map(r => r.get('dimensionCode')) || [];
    const options = !pastDimensionCodes.includes(record?.get('dimensionCode'));
    return remoteProps ? remoteProps.process('SPFP.RULE_REBATE_DETAIL_CUX.DIMENSIONCODE_OPTIONS', options, { ruleDs, dimensionType, record }) : options;

  }, [dataSet, remoteProps, dimensionType, ruleDs]);

  // 累计维度 的操作符选项，与适用维度相同维度值保持相似的选项
  const filterCalOprOptions = useCallback((lovRecord, record) =>
  {
    const currentDimensionCode = record.get('dimensionCode');
    const equalOptions = ['EQUALS', 'IN'];
    const noEqualOptions = ['NOT_EQUALS', 'NOT_IN'];
    if (applyRangeDs?.length)
    {
      // 找到【适用维度】列表是否存在和当前行的维度值一致的数据
      const sameDimensionRecord = applyRangeDs.find(applyRecord => applyRecord.get('dimensionCode') === currentDimensionCode);
      const dimensionOperation = sameDimensionRecord?.get('dimensionOperation');
      const effectiveOptions = equalOptions.includes(dimensionOperation) ? equalOptions : noEqualOptions;
      return dimensionOperation ? effectiveOptions.includes(lovRecord?.get('value')) : true;
    }
    return true;
  }, [applyRangeDs]);

  const editorColumns = useCallback((record) =>
  {
    const { cumulativeMode } = ruleDs?.current?.get(['cumulativeMode']) || {};
    const cuxDisableFlag = remoteProps ? remoteProps.process('SPFP.RULE_REBATE_DETAIL_CUX.DIMENSIONCODE_DEL_BTN_DISABLE', false, { ruleDs, dimensionType, record }) : false;
    return setNewColumnsProps([
      { name: 'index', colSpan: 1, editor: () => <div style={{ fontWeight: 'bold', textAlign: 'center' }}>#{record?.index + 1}</div> },
      {
        name: 'dimensionCode',
        colSpan: 6,
        editor: Select,
        optionsFilter: filterOptions,
      },
      {
        name: 'dimensionOperation',
        colSpan: 6,
        editor: Select,
        optionsFilter: (lovRecord) => dimensionType === DimensionType.cumulative
          ? filterCalOprOptions(lovRecord, record)
          : true,
        changeFlag,
      },
      renderRightValue(record),
      {
        name: 'action', colSpan: 1, editor: () => (
          <Button
            icon="delete"
            funcType={FuncType.flat}
            // 计算规则下的累计维度单笔不用限制
            disabled={(dataSet.length === 1 || cuxDisableFlag) && (dimensionType !== DimensionType.cumulative)}
            onClick={() => handleDelete(record)}
          />
        ),
      },
    ], dataSet, configFieldsArr, dimensionType);
  }, [
    handleDelete,
    renderRightValue,
    dataSet,
    configFieldsArr,
    dimensionType,
    filterOptions,
    filterCalOprOptions,
    changeFlag,
    ruleDs,
    remoteProps,
  ]);

  useEffect(() =>
  {
    dataSet.setState('configFieldsArr', configFieldsArr);
    // 供新建校验使用
    const showFields = setNewColumnsProps(dimensionColumns, dataSet, configFieldsArr, dimensionType);
    dataSet.setState('displayFields', showFields);
  }, [dataSet, configFieldsArr, dimensionType]);

  return (
    <div className={style['rules-maintenance-editor-wrapper']}>
      {
        dataSet?.length > 0 && (
          (editFlag || changeFlag) ? dataSet.map(record =>
          {
            if (record.status !== 'delete')
            {
              return (
                <div className="rule-editor-form">
                  <EditorForm
                    useWidthPercent={!modal}
                    key={record.index}
                    columns={20}
                    record={record}
                    editorFlag={editFlag}
                    editorColumns={editorColumns(record)}
                  />
                </div>
              );
            } else
            {
              return null;
            }
          })
            : <ReadOnlyLine dataSet={dataSet} editorColumns={editorColumns} />
        )
      }
      {editFlag
        && dimensionCodeLookupDatas?.length
        && (dimensionCodeLookupDatas.length > dataSet.length)
        ? (
          <div className="rule-editor-add-btn">
            <Form useWidthPercent={!modal} columns={20} labelLayout={LabelLayout.float} >
              <Output colSpan={1} renderer={() => ' '} />
              <Output colSpan={18}
                renderer={() => <a className='rules-maintenance-control-point' onClick={handleAdd}><Icon type="control_point" /></a>} />
              <Output colSpan={1} renderer={() => ' '} />
            </Form>
          </div>
        ) : null
      }
      {(!editFlag && dataSet?.length < 1 || editFlag && dimensionCodeLookupDatas?.length < 1) && (
        <div className={style['rule-maintenance-no-data']}>
          <img src={noDataImg} />
          <div>{intl.get('hzero.common.components.noticeIcon.null').d('暂无数据')}</div>
        </div>
      )}
    </div>
  );
});

export default DimensionLine;

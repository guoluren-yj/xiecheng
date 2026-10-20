import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { DataSet, Table, useDataSet, Spin } from 'choerodon-ui/pro';
import { Collapse, Icon } from 'choerodon-ui';
import { observer } from 'mobx-react';

import intl from 'utils/intl';
import { getResponse } from 'hzero-front/lib/utils/utils';

import { fetchModuleIncludeLines, queryParamsAll } from '@/services/priceModelService';
import { ReactComponent as CountFormulaImg } from '@/assets/count-formula.svg';
import { previewLineTableDS, previewOtherParameterDS, previewHeaderDS } from '../store/storeDS';
import { codeTransfer } from '../../../utils/utils';
import style from '../common.less';

const { Panel } = Collapse;

export default observer(function Preview(props) {
  const { modelId } = props;

  const previewOtherParameterDs = useDataSet(() => previewOtherParameterDS({ modelId }), []);
  const previewHeaderDs = useDataSet(() => previewHeaderDS({ modelId }), []);

  const moduleList = useRef([]);
  const paramList = useRef([]);
  const [loading, setLoading] = useState(false);
  const [dynamicLineColumns, setItemDynamicColumns] = useState({});

  const tableDsMap = useMemo(() => new Map(), []);

  useEffect(() => {
    init();
  }, []);

  const init = () => {
    queryModuleIncludeLines();
    fetchParamsAll();
  };

  // 查询价格公式所有参数
  const fetchParamsAll = () => {
    queryParamsAll({ modelId }).then((res) => {
      const result = getResponse(res);
      if (result) {
        paramList.current = result;
      }
    });
  };

  // 查询模块数据
  const queryModuleIncludeLines = () => {
    setLoading(true);
    fetchModuleIncludeLines({ modelId })
      .then((res) => {
        const result = getResponse(res);
        if (Array.isArray(result) && result.length > 0) {
          moduleList.current = result;
          let columns = {};
          // 设置模块dataset
          result.forEach((item) => {
            const { moduleId, priceModelQuoColumns = [], priceModelQuoRowPage = {} } = item;
            tableDsMap.set(moduleId, new DataSet(previewLineTableDS({ modelId })));
            columns = { ...columns, [moduleId]: getDynamicColumns(priceModelQuoColumns, moduleId) };
            // 查询
            if (tableDsMap.get(moduleId)) {
              tableDsMap.get(moduleId).setState('moduleId', moduleId);
              tableDsMap
                .get(moduleId)
                .loadData(
                  getDataSource(priceModelQuoRowPage.content),
                  priceModelQuoRowPage.totalElements
                );
            }
          });
          // 设置动态列
          setItemDynamicColumns(columns);
        }
      })
      .finally(() => setLoading(false));
  };

  const getDataSource = (data = []) => {
    const _data = data.map((item) => {
      const { priceModelQuoRowColumns = [], ...otherItem } = item;
      let elementValue = {};
      // eslint-disable-next-line no-unused-expressions
      priceModelQuoRowColumns?.forEach?.((elementItem) => {
        elementValue = {
          ...elementValue,
          [elementItem.columnId]: elementItem.value,
          [`${elementItem.columnId}Meaning`]: elementItem.valueMeaning,
        };
      });
      return {
        ...otherItem,
        ...elementValue,
        priceModelQuoRowColumns,
      };
    });
    return _data;
  };

  // 设置明细项动态列
  const getDynamicColumns = (data, moduleId) => {
    const columns = [];
    data.forEach((item) => {
      const { componentType, columnId, columnName } = item;
      const fieldName = ['Lov', 'ValueList'].includes(componentType)
        ? `${columnId}Meaning`
        : columnId;
      // eslint-disable-next-line no-unused-expressions
      tableDsMap.get(moduleId)?.addField(fieldName, {
        name: fieldName,
        label: columnName,
      });
      columns.push({
        name: fieldName,
        width: 150,
      });
    });
    return columns;
  };

  // 计算公式预览
  const calculateFormulaPreview = useCallback(() => {
    if (!previewHeaderDs.current) return;
    const calculateFormula = previewHeaderDs.current.get('calculateFormula') || '';
    return codeTransfer(calculateFormula, paramList.current);
  }, [paramList.current]);

  // 主要参数
  const getColumns = useCallback(
    (moduleId) => {
      return [
        {
          name: 'rowCode',
          width: 150,
        },
        {
          name: 'rowName',
          width: 130,
        },
        ...(dynamicLineColumns?.[moduleId] || []),
      ];
    },
    [dynamicLineColumns]
  );

  // 其他参数
  const otherParamColumns = useMemo(() => {
    return [
      {
        name: 'paramCode',
        width: 150,
      },
      {
        name: 'paramName',
        width: 150,
      },
      {
        name: 'componentTypeMeaning',
        width: 120,
      },
      {
        name: 'calculateType',
        width: 200,
      },
      {
        name: 'calculateRule',
        width: 250,
      },
    ];
  }, []);

  return (
    <Spin spinning={loading}>
      <Collapse
        defaultActiveKey={['mainParameter', 'otherParameter', 'countFormula']}
        bordered={false}
        expandIconPosition="text-right"
        expandIcon={(panelProps) => {
          const { isActive } = panelProps;
          return <Icon type={isActive ? 'expand_more' : 'expand_less'} />;
        }}
        className={style['preview-collapse-panel']}
      >
        <Panel
          header={intl.get('spc.priceModel.view.card.title.mainParameter').d('主要参数')}
          key="mainParameter"
        >
          {moduleList.current.map?.((item) => (
            <>
              <div className="preview-module-line">{item.moduleName}</div>
              <Table
                customizable
                dataSet={tableDsMap.get(item.moduleId)}
                columns={getColumns(item.moduleId)}
                customizedCode="SRC.PRICE_MODEL.UPDATE.PREVIEW_ROW"
                style={{ maxHeight: '230px' }}
              />
            </>
          ))}
        </Panel>
        {previewOtherParameterDs.length > 0 ? (
          <Panel
            header={intl.get('spc.priceModel.view.card.title.otherParameter').d('其他参数')}
            key="otherParameter"
          >
            <Table
              customizable
              dataSet={previewOtherParameterDs}
              columns={otherParamColumns}
              customizedCode="SRC.PRICE_MODEL.UPDATE.PREVIEW_OTHER_PARAMETER"
              style={{ maxHeight: '230px' }}
            />
          </Panel>
        ) : null}
        <Panel
          header={intl.get('spc.priceModel.view.card.title.priceFormula').d('价格公式')}
          key="countFormula"
        >
          {previewHeaderDs.current?.get('calculateFormula') ? (
            <div
              style={{ fontWeight: 600 }}
              dangerouslySetInnerHTML={{ __html: calculateFormulaPreview() }}
            />
          ) : (
            <div className={style['preview-no-content-wrapper']}>
              <span className={style['no-content-img']}>
                <CountFormulaImg />
              </span>
              <span className={style['no-content-text']}>
                {intl.get('spc.priceModel.view.priceModel.noCountFormula').d('暂无计算公式')}
              </span>
            </div>
          )}
        </Panel>
      </Collapse>
    </Spin>
  );
});

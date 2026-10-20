/*
 * @Date: 2023-10-07 15:51:01
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { isEmpty, isNil } from 'lodash';
import React, { useCallback } from 'react';
import { Spin, Button, Modal, Dropdown, Icon } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';

import MoreButton from '@/routes/components/MoreButton';
import MultipleTextField from '@/routes/components/MultipleTextField';
import { handleConfiguration } from '@/routes/components/utils/appraisal';
import { renderEnable, tableMaxHeight, tableHeight } from '@/routes/components/utils';
import { indicatorsEnable, deleteIndicators } from '@/services/indicatorTemplateDefineService';

import { handleManualCreate, renderAddMenus } from './utils';

let searchBarRef; // 筛选器ref

const Index = ({
  remote,
  loading,
  dataSet,
  customizeTable,
  setLoading,
  updateToTemplate,
  onOverlayClick,
}) => {
  // 启用、禁用指标
  const handleEnabled = useCallback((enabledFlag, record) => {
    setLoading(true);
    indicatorsEnable(enabledFlag, record.toData())
      .then(response => {
        const res = getResponse(response);
        if (res) {
          notification.success();
          dataSet.query();
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // 删除指标
  const handleDelete = useCallback(record => {
    const deleteData = record.toData();
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: intl.get('sslm.common.view.message.sureDeleteSelectedRows').d('确认删除选中行？'),
      onOk: () => {
        setLoading(true);
        return deleteIndicators(deleteData)
          .then(response => {
            const res = getResponse(response);
            if (res) {
              notification.success();
              dataSet.query(null, {}, false);
            }
          })
          .finally(() => {
            setLoading(false);
          });
      },
    });
  }, []);

  // 更新至评分模板
  const updateScoreTemplate = useCallback(record => {
    const { indicatorId, indicatorCode } = record.get(['indicatorId', 'indicatorCode']);
    const params = { indicatorId, indicatorCode };
    updateToTemplate({ params });
  }, []);

  // 获取行上操作按钮
  const getLineBtns = useCallback(record => {
    const { enabledFlag } = record.get(['enabledFlag']);
    return [
      {
        name: 'edit',
        child: intl.get('hzero.common.button.edit').d('编辑'),
        onClick: () => handleManualCreate(dataSet, 'EDIT', record, updateToTemplate, remote),
      },
      {
        name: 'addChildIndicator',
        child: (
          <Dropdown
            placement="bottomRight"
            overlay={renderAddMenus()}
            onOverlayClick={event => onOverlayClick(event, 'CHILD', record)}
          >
            <span>
              {intl
                .get('spfm.supplierKpiIndicator.view.button.addChildIndicator')
                .d('新增下级指标')}
            </span>
            <Icon type="expand_more" style={{ fontSize: '16px', marginRight: 0 }} />
          </Dropdown>
        ),
      },
      {
        name: 'updateToScoringTemplate',
        hidden: !enabledFlag,
        child: intl
          .get('spfm.supplierKpiIndicator.view.button.updateToScoringTemplate')
          .d('更新至评分模板'),
        onClick: () => updateScoreTemplate(record),
      },
      {
        name: 'enable',
        child:
          enabledFlag === 1
            ? intl.get('hzero.common.status.disable').d('禁用')
            : intl.get('hzero.common.status.enable').d('启用'),
        onClick: () => handleEnabled(enabledFlag, record),
      },
      {
        name: 'delete',
        child: intl.get('hzero.common.button.delete').d('删除'),
        onClick: () => handleDelete(record),
      },
    ].filter(btn => !btn.hidden);
  }, []);

  const handleQuery = ({ params }) => {
    if (dataSet.queryDataSet?.current) {
      const { customizeOrderField, indicatorCodeOrName, ...rest } = params;
      const orderField = {}; // 排序
      if (customizeOrderField) {
        const newCustomizeOrderField = customizeOrderField?.split(':');
        const orderKey = newCustomizeOrderField[0];
        const orderValue = newCustomizeOrderField[1];
        if (orderKey === 'creationDate') {
          // 按创建时间排序时，后端自己手动处理
          orderField.creationDateOrder = orderValue;
        } else {
          orderField.customizeOrderField = customizeOrderField;
        }
      }
      const clearParams = {}; // 清理
      const dataObj = dataSet.queryDataSet.current.toData();
      if (dataObj) {
        for (const key in dataObj) {
          if (!['creationDateOrder', 'indicatorCodeOrName'].includes(key)) {
            // 排除掉自定义的查询条件
            if (!Object.prototype.hasOwnProperty.call(params, key)) {
              clearParams[key] = undefined;
            }
          }
        }
      }
      clearParams.indicatorCodeOrName = isEmpty(indicatorCodeOrName) ? null : indicatorCodeOrName;
      dataSet.queryDataSet.current.set({
        ...rest,
        ...orderField,
        ...clearParams,
      });
      dataSet.query();
    } else {
      // 解决设置默认值查询不生效问题
      searchBarRef.handleQuery(true);
    }
  };

  // 清除筛选器字段
  const clearFieldsValues = () => {
    if (dataSet.queryDataSet && dataSet.queryDataSet.current) {
      dataSet.queryDataSet.current.reset();
    }
  };

  // 筛选器左侧渲染
  const renderLeftSearchBar = useCallback((_, queryDataSet) => {
    return (
      <MultipleTextField
        multiple={false}
        dataSet={queryDataSet}
        name="indicatorCodeOrName"
        placeholder={intl
          .get('sslm.common.modal.placeholder.indicatorCodeOrName')
          .d('请输入指标编码、名称查询')}
      />
    );
  }, []);

  const columns = [
    {
      name: 'enabledFlag',
      width: 120,
      renderer: renderEnable,
      headerStyle: { paddingLeft: 48 },
    },
    {
      name: 'option',
      width: 230,
      renderer: ({ record }) => {
        const buttons = getLineBtns(record);
        return <MoreButton buttons={buttons} />;
      },
    },
    {
      name: 'indicatorCode',
      width: 150,
      renderer: ({ value, record }) => (
        <a onClick={() => handleManualCreate(dataSet, 'VIEW', record, null, remote)}>{value}</a>
      ),
    },
    {
      name: 'indicatorName',
    },
    {
      name: 'indicatorTypeMeaning',
      width: 100,
    },
    {
      name: 'scoreTypeMeaning',
      width: 100,
    },
    {
      name: 'evalStandard',
      width: 150,
    },
    {
      name: 'score',
      width: 100,
      renderer: ({ record }) => {
        const { scoreFrom, scoreTo } = record.get(['scoreFrom', 'scoreTo']);
        if (isNil(scoreFrom) && isNil(scoreTo)) {
          return '-';
        } else {
          return `${scoreFrom} ~ ${scoreTo}`;
        }
      },
    },
    {
      name: 'configuration',
      width: 100,
      renderer: ({ record }) => {
        const { enabledFlag, scoreType, indicatorId, indicatorType, children } = record.get([
          'enabledFlag',
          'scoreType',
          'indicatorId',
          'indicatorType',
          'children',
        ]);
        if (enabledFlag && isEmpty(children)) {
          return scoreType === 'SYSTEM' ? (
            <Button
              funcType="link"
              onClick={() =>
                handleConfiguration({
                  type: 'formulaConfig',
                  indicatorId,
                  sourceKey: 'TENANT',
                })
              }
            >
              {intl.get('sslm.common.model.field.formulaQuery').d('公式查询')}
            </Button>
          ) : scoreType === 'MANUAL' && indicatorType === 'OPT' ? (
            <Button
              funcType="link"
              onClick={() => handleConfiguration({ type: 'optionsConfig', indicatorId })}
            >
              {intl.get('sslm.common.model.field.optionQuery').d('选项查询')}
            </Button>
          ) : (
            '-'
          );
        } else {
          return '-';
        }
      },
    },
  ];

  return (
    <Spin spinning={loading}>
      <div style={{ height: tableHeight.hasTab }}>
        {customizeTable(
          {
            code: 'SSLM.INDICATOR_DEFINE.LIST_TABLE',
          },
          <SearchBarTable
            virtual
            virtualCell
            cacheState
            mode="tree"
            dataSet={dataSet}
            columns={columns}
            searchBarRef={ref => {
              searchBarRef = ref;
            }}
            style={{ maxHeight: tableMaxHeight.hasTab }}
            searchCode="SSLM.INDICATOR_DEFINE.LIST_SEARCH_BAR"
            searchBarConfig={{
              left: {
                render: renderLeftSearchBar,
              },
              onQuery: handleQuery,
              onClear: () => clearFieldsValues(),
              onReset: () => clearFieldsValues(),
            }}
          />
        )}
      </div>
    </Spin>
  );
};

export default Index;

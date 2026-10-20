import React, { useEffect, memo, useMemo, useState, useCallback, useRef } from 'react';
import { DataSet, Button, Icon, Spin, IntlField, Lov, TextField } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';
import { throttle } from 'lodash';
import classNames from 'classnames';

import intl from 'utils/intl';
import { Header, Content } from 'components/Page';
import { getResponse, filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';
import SearchBarTable from '_components/SearchBarTable';
import ImportBtn from '_components/Import';
import ExcelExportPro from '_components/ExcelExportPro';
import notification from 'utils/notification';
import { SRM_SAGM } from '_utils/config';

import c7nModal from '@/utils/c7nModal';
import { getC7NQueryParams } from '@/utils/utils';
import FormPro from '@/components/FormPro';
import {
  generatePurchaseUnit,
  fetchTreeChildData,
  fetchSave,
  fetchSyncProcess,
  fetchEnable,
  queryConfig,
} from '@/services/PurchaseManageNewService';
import { DropdownBtn, DropdownBtns, HeadButton } from './component/CommonButtons';
import ConfigureForm from './Drawer/ConfigureForm';
import { tableDS, batchFormDS } from './ds';

import style from './index.less';

const customTag = (value, yesText, noText) => {
  return (
    <Tag color={value === 1 ? 'green' : 'red'} style={{ border: 'none' }}>
      {value === 1 ? yesText : noText}
    </Tag>
  );
};

const Performance = memo((props) => {
  const {
    config: { sourceType = '', level = '', isNewTenant },
  } = props;

  const timerRef = useRef(null);

  const [editing, setEditing] = useState(false);
  const [isExpand, setIsExpand] = useState(false);
  // 查询配置表，确定新老租户
  const [tenantExist, setTenantExist] = useState(false);

  const tableDs = useMemo(() => new DataSet(tableDS(sourceType, level)), [sourceType, level]);

  useEffect(() => {
    return () => {
      // 组件卸载清除定时器
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // 新租户第一次进入页面
    if (sourceType && isNewTenant) {
      tableDs.setState('dataSync_loading', true);
      // 生产采购组织
      generatePurchaseUnit(
        filterNullValueObject({
          sourceType,
          level,
        })
      );
      // console.log('config', sourceType, level, isNewTenant);
      // 轮询生成进度
      timerRef.current = setInterval(async () => {
        const process = getResponse(await fetchSyncProcess());
        if (process !== 'PENDING') {
          clearInterval(timerRef.current);
          tableDs.setState('dataSync_loading', false);
          // 查询一级目录
          tableDs.query(tableDs.currentPage);
        }
      }, 500);

      // 查询表格数据
    } else {
      queryCompanyConfig();
      tableDs.query(tableDs.currentPage);
    }
  }, [sourceType, isNewTenant, tableDs]);

  const queryCompanyConfig = () => {
    queryConfig().then((res) => {
      setTenantExist(res);
    });
  };

  // 子节点分页请求
  const loadMore = useCallback((record, dataSet) => {
    let page = record.get('page') || 1;
    const parentUnitId = record.get('parentPurUnitId');
    const size = tableDs.pageSize;
    record.setState('loading', true);
    fetchTreeChildData({
      parentPurUnitId: parentUnitId,
      page,
      size,
    })
      .then((res) => {
        if (res) {
          const { totalElements } = res || {};
          const showMore = size * ++page < totalElements;
          dataSet.remove([record], true);
          dataSet.appendData(res?.content || []);
          if (showMore) {
            dataSet.appendData([{ showMore, parentPurUnitId: parentUnitId, page }]);
          }
        }
      })
      .finally(() => {
        record.setState('loading', false);
      });
  });

  const handleLoadData = useCallback(
    ({ record, dataSet }) => {
      // 老租户直接查询
      if (sourceType) {
        const parentUnitId = record.get('purUnitId');
        const hasChild = record.get('children');
        const isAddChild = !record.children;
        if (isAddChild && hasChild && hasChild.length) {
          dataSet.appendData(hasChild);
          return;
        }
        if (isAddChild && record.get('hasChildren')) {
          const { enabledFlag } = tableDs.queryDataSet?.toData()[0] || {};
          record.setState('loading', true);
          fetchTreeChildData(
            filterNullValueObject({
              parentPurUnitId: parentUnitId,
              page: 0,
              size: tableDs.pageSize,
              enabledFlag,
            })
          )
            .then((res) => {
              if (res) {
                const { totalPages } = res || {};
                const showMore = totalPages > 1;
                dataSet.appendData(res?.content || []);
                if (showMore) {
                  dataSet.appendData([{ showMore, parentPurUnitId: record.get('purUnitId') }]);
                }
              }
            })
            .finally(() => {
              record.setState('loading', false);
            });
        }
      }
    },
    [sourceType]
  );

  // 保留节点展开收起行为
  const query = async () => {
    if (isExpand) {
      await tableDs.query(tableDs.currentPage);
      handleExpandAll(true);
    } else {
      tableDs.query(tableDs.currentPage);
    }
  };

  const handleBatchEdit = () => {
    const ds = new DataSet(batchFormDS(sourceType, level));
    c7nModal({
      // okText: intl.get('hzero.common.button.save').d('保存'),
      style: {
        width: 380,
      },
      title: intl.get('hzero.common.button.batchEdit').d('批量编辑'),
      children: (
        <FormPro
          dataSet={ds}
          fields={[
            { name: 'aliasName', FormField: IntlField },
            // 配置为业务组织
            {
              name: 'comLov',
              _type: 'Lov',
              onChange: (value, oldValue) =>
                handleCompanyChange({ value, oldValue, record: ds.current }),
            },
            // 配置为业务组织且实体层级为库存组织
            {
              name: 'invLov',
              _type: 'Lov',
              onChange: (value) => handleInventoryChange({ value, record: ds.current }),
            },
            // 配置为采购组织不可编辑
            { name: 'purLov', _type: 'Lov' },
          ]}
        />
      ),
      onOk: () => {
        const formData = ds.current.toJSONData() || {};
        delete formData.__dirty;
        const {
          companyId,
          companyName,
          invOrganizationId,
          invOrganizationName,
          purOrganizationId,
          purOrganizationName,
          aliasName,
          _tls,
        } = formData;
        tableDs.selected.forEach((r) => {
          const { companyId: rowCompanyId, invOrganizationId: rowInvOrganizationId } = r.get([
            'companyId',
            'invOrganizationId',
          ]);
          const invEdit =
            invOrganizationId &&
            invOrganizationId !== rowInvOrganizationId &&
            companyId === rowCompanyId;
          // 业务组织配置， 公司不能编辑 (库存会带出对应公司)
          // 库存组织层级
          if (sourceType === 'BUSINESS_UNIT' && level === 'INV_ORGANIZATION') {
            if (invEdit && r.get('levelPath')?.split('|').length !== 3) {
              r.set('invLov', {
                organizationId: invOrganizationId,
                organizationName: invOrganizationName,
              });
            }
          }
          // 业务实体、公司层级
          if (sourceType === 'BUSINESS_UNIT' && level !== 'INV_ORGANIZATION') {
            if (invEdit) {
              r.set('invLov', {
                organizationId: invOrganizationId,
                organizationName: invOrganizationName,
              });
            }
          }
          // Hr组织 、采购组织
          if (sourceType !== 'BUSINESS_UNIT') {
            if (companyId) {
              r.set('comLov', {
                companyId,
                companyName,
              });
            }
            // 更改公司，且未维护库存 =》 清空库存
            if (companyId && companyId !== rowCompanyId && !invOrganizationId) {
              r.set('invLov', null);
            }
            if (invOrganizationId) {
              r.set('invLov', {
                organizationId: invOrganizationId,
                organizationName: invOrganizationName,
              });
            }
          }
          // 采购组织配置， 采购组织不能编辑
          if (purOrganizationId && sourceType !== 'PUR_ORGANIZATION') {
            r.set('purLov', {
              purchaseOrgId: purOrganizationId,
              organizationName: purOrganizationName,
            });
          }
          if (aliasName) {
            r.set('aliasName', aliasName);
            r.set('_tls', _tls);
          }
        });
        return true;
      },
    });
  };

  // 编辑配置
  const handleEditConfigure = () => {
    const baseConfig = props.config;
    c7nModal({
      okText: intl.get('hzero.common.button.save').d('保存'),
      style: {
        width: 742,
      },
      title: intl.get('sagm.common.button.configure').d('采买身份配置'),
      children: <ConfigureForm query={query} tenantExist={tenantExist} baseConfig={baseConfig} />,
    });
  };

  const expandIcon = ({ prefixCls, expanded, expandable, record, onExpand }) => {
    const iconPrefixCls = `${prefixCls}-expand-icon`;
    const classString = classNames(iconPrefixCls, {
      [`${iconPrefixCls}-expanded`]: expanded,
    });
    if (record.getState('loading') === true) {
      // 自定义状态渲染
      return <Spin delay={200} size="small" />;
    }
    return (
      <Icon
        type="baseline-arrow_right"
        className={classString}
        style={{ visibility: record.get('hasChildren') ? 'visible' : 'hidden' }}
        onClick={onExpand}
        tabIndex={expandable ? 0 : -1}
      />
    );
  };

  const handleSyncData = async () => {
    tableDs.setState('dataSync_loading', true);
    tableDs.status = 'loading';
    // 生产采购组织
    await generatePurchaseUnit(
      filterNullValueObject({
        sourceType,
        level,
      })
    );
    // 轮询生成进度
    timerRef.current = setInterval(async () => {
      const process = getResponse(await fetchSyncProcess());
      if (process !== 'PENDING') {
        clearInterval(timerRef.current);
        tableDs.setState('dataSync_loading', false);
        tableDs.status = 'ready';
        // 查询一级目录
        tableDs.query(tableDs.currentPage);
        setIsExpand(false);
      }
    }, 500);
  };

  const handleExpandAll = (_isExpand) => {
    // 只展开第一层
    tableDs.forEach((r) => {
      if (!r.get('levelPath')?.includes('|')) {
        const _r = r;
        _r.isExpanded = _isExpand;
      }
    });
  };

  // 保存
  const handleSave = async () => {
    const flag = await tableDs.validate();
    if (!flag) return;
    const data =
      tableDs.records.filter((f) => f.dirty && f.get('purUnitId')).map((m) => m.toData()) || [];
    if (data.length > 0) {
      const res = await fetchSave(data);
      if (getResponse(res)) {
        notification.success();
        tableDs.query(tableDs.currentPage);
      }
    }
  };

  const handleEnableFlag = async (record, isBatch, enabled) => {
    let data = [];
    if (isBatch) {
      data = tableDs.selected.filter((f) => Number(f.get('enabledFlag')) === +!enabled);
    } else {
      data = [record];
    }
    const params = data.map((m) => ({
      ...m.toData(),
      enabledFlag: +!m.get('enabledFlag'),
    }));
    tableDs.status = 'loading';
    const res = await fetchEnable(params);
    tableDs.status = 'ready';
    if (getResponse(res)) {
      // tableDs.query(tableDs.currentPage);
      query();
      notification.success();
    }
  };

  const handleCompanyChange = ({ value, oldValue, record }) => {
    if (value) {
      if (value.companyId !== (oldValue || {}).companyId) {
        record.set('invLov', null);
      }
      record.set('comLov', {
        companyId: value.companyId,
        companyName: value.companyName,
      });
    } else {
      record.set('invLov', null);
    }
  };

  const handleInventoryChange = ({ value, record }) => {
    if (value) {
      record.set('invLov', {
        organizationId: value.organizationId,
        organizationName: value.organizationName,
      });
      record.set('comLov', {
        companyId: value.companyId,
        companyName: value.companyName,
      });
    }
  };

  const handleExitEdit = () => {
    tableDs.forEach((f) => {
      if (f.dirty) {
        query();
      }
    });
    setEditing(false);
  };
  const searchBarProps = {
    style: { maxHeight: 'calc(100% - 22px)' },
    rowHeight: 32,
    cacheState: true,
    searchCode: 'SAGM.PURCHASE_MANAGE.SEARCHBAR_TABLE',
    searchBarConfig: {
      left: {
        render: (filter, dataSet) => {
          return (
            <TextField
              clearButton
              style={{ width: 300 }}
              placeholder={intl
                .get('sagm.purchaseManageNew.view.query.purUnitCodeName')
                .d('请输入组织编码或名称查询')}
              prefix={<Icon type="search" />}
              name="purUnitCodeName"
              dataSet={dataSet}
            />
          );
        },
      },
    },
  };

  const emptyRender = ({ record, text }) => (record.get('showMore') ? ' ' : text);

  const columns = useMemo(() => {
    return [
      {
        name: 'enabledFlag',
        minWidth: 180,
        width: 180,
        align: 'left',
        tooltip: 'none',
        renderer: ({ record, dataSet, value }) => {
          return !record.get('showMore') ? (
            customTag(
              value,
              intl.get('hzero.common.status.enable').d('启用'),
              intl.get('hzero.common.status.disable').d('禁用')
            )
          ) : (
            <Button
              funcType="link"
              color="primary"
              onClick={() => {
                loadMore(record, dataSet);
              }}
            >
              {intl.get('sagm.common.view.btn.btnLoadMore').d('加载更多')}
            </Button>
          );
        },
      },
      {
        name: 'purUnitCode',
        // onCell: cellRender,
        renderer: emptyRender,
        width: 120,
      },
      {
        name: 'purUnitName',
        // onCell: cellRender,
        renderer: emptyRender,
        width: 120,
      },
      {
        name: 'aliasName',
        editor: (record) => (record.get('showMore') ? false : editing),
        // onCell: cellRender,
        renderer: emptyRender,
        // width: 120,
      },
      {
        name: 'comLov',
        width: 170,
        editor: (record) =>
          record.get('showMore') || !editing ? (
            false
          ) : (
            <Lov onChange={(value, oldValue) => handleCompanyChange({ value, oldValue, record })} />
          ),
        // onCell: cellRender,
        renderer: emptyRender,
      },
      {
        name: 'invLov',
        // width: 170,
        editor: (record) =>
          record.get('showMore') || !editing ? (
            false
          ) : (
            <Lov onChange={(value) => handleInventoryChange({ value, record })} />
          ),
        // onCell: cellRender,
        renderer: emptyRender,
      },
      {
        name: 'purLov',
        width: 170,
        editor: (record) => (record.get('showMore') ? false : editing),
        // onCell: cellRender,
        renderer: emptyRender,
      },
      {
        name: 'operate',
        width: 80,
        show: !editing,
        // onCell: cellRender,
        renderer: ({ record }) => {
          const enabledFlag = record.get('enabledFlag');
          return record.get('showMore') ? (
            ' '
          ) : (
            <Button funcType="link" color="primary" onClick={() => handleEnableFlag(record)}>
              {enabledFlag === 1
                ? intl.get('hzero.common.status.disable').d('禁用')
                : intl.get('hzero.common.status.enable').d('启用')}
            </Button>
          );
        },
      },
    ].filter((f) => f.show !== false);
  }, [editing, tableDs, isExpand]);

  const buttons = useMemo(() => {
    const _buttons = [
      {
        name: 'save',
        btnText: intl.get('hzero.common.button.save').d('保存'),
        show: editing,
        btnComp: HeadButton,
        dataSet: tableDs,
        btnProps: {
          icon: 'save',
          color: 'primary',
          onClick: throttle(handleSave, 1000),
        },
      },
      {
        name: 'dataSync',
        getBtnText: (ds) =>
          ds.getState('dataSync_loading')
            ? intl.get('sagm.common.button.syncing').d('同步中')
            : intl.get('sagm.common.button.dataSync').d('数据同步'),
        show: !editing,
        btnComp: HeadButton,
        dataSet: tableDs,
        btnProps: {
          icon: 'sync',
          color: 'primary',
          onClick: throttle(handleSyncData, 1000),
        },
      },
      {
        name: 'batchEdit',
        btnText: intl.get('hzero.common.button.batchEdit').d('批量编辑'),
        show: editing,
        btnComp: HeadButton,
        dataSet: tableDs,
        getDisable: (dataSet) => dataSet.selected.length === 0,
        btnProps: {
          icon: 'mode_edit',
          funcType: 'flat',
          onClick: handleBatchEdit,
        },
      },
      {
        name: 'editConfigure',
        btnText: intl.get('sagm.common.button.configure').d('采买身份配置'),
        show: !editing,
        btnComp: HeadButton,
        dataSet: tableDs,
        getDisable: (ds) => ds.getState('dataSync_loading'),
        btnProps: {
          icon: 'settings',
          funcType: 'flat',
          onClick: handleEditConfigure,
          style: {
            maxWidth: 'fit-content',
          },
        },
      },
      {
        name: 'edit',
        btnText: intl.get('hzero.common.button.edit').d('编辑'),
        show: !editing,
        btnComp: HeadButton,
        dataSet: tableDs,
        getDisable: (ds) => ds.getState('dataSync_loading'),
        btnProps: {
          icon: 'mode_edit',
          funcType: 'flat',
          onClick: () => {
            setEditing(true);
            // tableDs.forEach((r) => {
            //   Object.assign(r, { status: 'add' });
            // });
          },
        },
      },
      {
        name: 'cancel',
        btnText: intl.get('hzero.common.button.cance').d('取消'),
        show: editing,
        btnComp: HeadButton,
        dataSet: tableDs,
        btnProps: {
          icon: 'cancel',
          funcType: 'flat',
          onClick: handleExitEdit,
        },
      },
      // 业务组织最多三级 采购组织只有一级 Hr组织无限制
      {
        name: 'expandAll',
        btnText: isExpand
          ? intl.get('sagm.common.model.collapseAll').d('全部收起')
          : intl.get('hzero.common.button.expandAll').d('全部展开'),
        // 引用业务组织配置且层级为公司或引用采购组织配置，隐藏
        show: !(
          (sourceType === 'BUSINESS_UNIT' && level === 'COMPANY') ||
          sourceType === 'PUR_ORGANIZATION'
        ),
        btnComp: HeadButton,
        dataSet: tableDs,
        getDisable: (ds) => ds.getState('dataSync_loading'),
        btnProps: {
          icon: isExpand ? 'baseline-arrow_right' : 'baseline-arrow_drop_down',
          funcType: 'flat',
          onClick: () => {
            setIsExpand((pre) => {
              handleExpandAll(!pre);
              return !pre;
            });
          },
        },
      },
      {
        name: 'batchEnabled',
        btnText: intl.get('sagm.common.button.batchEnabled').d('批量启用'),
        show: !editing,
        btnComp: HeadButton,
        dataSet: tableDs,
        getDisable: (ds) => ds.getState('dataSync_loading') || ds.selected.length === 0,
        btnProps: {
          funcType: 'flat',
          icon: 'finished',
          onClick: throttle(() => handleEnableFlag('', true, true), 1000),
        },
      },
      {
        name: 'batchDisable',
        btnText: intl.get('sagm.common.button.batchDisableEnabled').d('批量禁用'),
        btnComp: HeadButton,
        show: !editing,
        dataSet: tableDs,
        getDisable: (ds) => ds.getState('dataSync_loading') || ds.selected.length === 0,
        btnProps: {
          funcType: 'flat',
          icon: 'not_interested',
          onClick: throttle(() => handleEnableFlag('', true, false), 1000),
        },
      },
      {
        name: 'batchExport',
        renderChildRef: (isGroup) => {
          return (
            <ExcelExportPro
              exportAsync
              templateCode="SAGM_PUR_UNIT_EXPORT"
              queryParams={() => getC7NQueryParams(tableDs)}
              requestUrl={`${SRM_SAGM}/v1/${getCurrentOrganizationId()}/pur-units/export`}
              buttonText={intl.get('sagm.common.button.batchExport').d('批量导出')}
              otherButtonProps={{
                icon: '',
                type: 'c7n-pro',
                funcType: 'flat',
                style: isGroup
                  ? {
                      width: 'fit-content',
                      textAlign: 'left',
                      marginLeft: 0,
                      whiteSpace: 'nowrap',
                    }
                  : {},
              }}
            />
          );
        },
      },
      {
        name: 'batchImport',
        renderChildRef: (isGroup) => (
          <ImportBtn
            refreshButton
            prefixPatch={SRM_SAGM}
            businessObjectTemplateCode="SAGM_PUR_UNIT_IMPORT"
            buttonProps={{
              icon: '',
              style: isGroup
                ? {
                    width: 'fit-content',
                    textAlign: 'left',
                    marginLeft: 0,
                    whiteSpace: 'nowrap',
                    fontWeight: 'normal',
                  }
                : {},
              funcType: 'flat',
            }}
            successCallBack={() => tableDs.query()}
            buttonText={intl.get('sagm.common.button.batchEditBusinessInfo').d('批量编辑业务信息')}
          />
        ),
      },
    ];
    const showBtns = _buttons.filter((f) => f.show || !('show' in f));
    const showMore = showBtns.length > 5;
    const nomalBtns = showBtns.slice(0, showMore ? 4 : 5).map((f) => {
      const {
        name,
        bindBtns = [],
        btnText = '',
        btnComp,
        btnProps = {},
        renderChildRef = (e) => e,
        ...other
      } = f;
      const Btn = btnComp || Button;
      return (
        renderChildRef(false) || (
          <Btn {...btnProps} name={name} bindBtns={bindBtns} {...other}>
            {btnText}
          </Btn>
        )
      );
    });
    if (!showMore) {
      return nomalBtns;
    }
    const moreBtn = (
      <DropdownBtns
        placement="left"
        menus={showBtns.slice(4).map((m) => ({
          text: m.btnText,
          event: m.btnProps?.onClick,
          childRef: m.renderChildRef ? m.renderChildRef(true) : m.childRef,
          ...m,
        }))}
      >
        <DropdownBtn icon="more_horiz" hiddenIcon funcType="flat" />
      </DropdownBtns>
    );
    return [...nomalBtns, moreBtn];
  }, [editing, tableDs, isExpand, isExpand, tenantExist]);

  const pagination = {
    // 待优化
    onChange: () => {
      if (isExpand) {
        setIsExpand(false);
      }
    },
  };

  return (
    <>
      <Header title={intl.get('sagm.purchaseManageNew.view.title').d('商城采买组织管理')}>
        {buttons}
      </Header>
      <Content>
        <SearchBarTable
          selectionBoxRenderer={({ record, element }) =>
            record.get('showMore') ? <span /> : element
          }
          className={style['purchase-manage-table']}
          dataSet={tableDs}
          columns={columns}
          mode="tree"
          expandIcon={expandIcon}
          customizedCode="SAGM.PURCHASE_MANAGE_NEW.TABLE"
          treeLoadData={handleLoadData}
          {...searchBarProps}
          pagination={pagination}
        />
      </Content>
    </>
  );
});

export default Performance;

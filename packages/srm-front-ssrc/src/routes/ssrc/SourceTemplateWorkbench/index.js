import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { compose, isEmpty } from 'lodash';
import { Dropdown, Menu, Modal, Button, DataSet } from 'choerodon-ui/pro';
import { Tag, Icon, Spin } from 'choerodon-ui';
import { observer } from 'mobx-react';

import intl from 'utils/intl';
import { getResponse, getCurrentTenant, getCurrentOrganizationId } from 'utils/utils';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import DynamicButtons from '_components/DynamicButtons';
import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import withProps from 'utils/withProps';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import CommonImportNew from 'hzero-front/lib/components/Import';
import { SRM_SSRC } from '_utils/config';

import { isJSON } from '@/utils/utils';
import { enableDisabled, copy } from '@/services/sourceTemplateWorkbechService';
import MutlTextFieldSearch from '@/routes/ssrc/components/MutlTextFieldSearch';
import { fetchBidConfig, fetchRFContentConfig } from '@/services/inquiryHallService';

import { tableDS } from './indexDS';
import Style from './index.less';

const SourceTemplateWorkbench = (props) => {
  const { history, tableDs } = props;

  const [loading, setLoading] = useState(false);
  const [newBidFlag, setNewBidFlag] = useState(false); // 是否开启新招标
  const [useRF, setUseRF] = useState(''); // 是否开启RF

  useEffect(() => {
    fetchBid();
    fetchShowRF();
  }, []);

  // 查询是否开启新招标
  const fetchBid = async () => {
    const res = getResponse(await fetchBidConfig({ tenant: getCurrentTenant().tenantNum }));
    if (res) {
      setNewBidFlag(Number(res[0]?.newBid || 1));
    }
  };

  // 查询是否开启RF
  const fetchShowRF = async () => {
    const res = await fetchRFContentConfig();
    if (!isJSON(res)) {
      if (res) {
        if (res === 'RFI') {
          setUseRF('RFI');
        } else if (res === 'RFP') {
          setUseRF('RFP');
        } else {
          setUseRF('ALL');
        }
      } else {
        setUseRF('');
      }
    } else {
      getResponse(JSON.parse(res));
    }
  };

  // 渲染状态列
  const getTemplateStatusColor = (record) => {
    switch (record.get('templateStatus')) {
      case 'RELEASED':
        return 'green';
      case 'PENDING':
        return 'yellow';
      case 'DISABLED':
        return 'red';
      default:
        return 'green';
    }
  };

  // 跳转历史版本
  const handleHistory = (item) => {
    history.push({
      pathname: `/ssrc/source-template-workbench/details/${item.templateId}/history`,
    });
  };

  // 渲染历史版本
  const renderHistoryVersion = (record) => {
    return (
      <div className={Style['ssrc-source-template-list-history-buttons-wrapper']}>
        <Menu>
          {record.get('historyDTO').map((item) => {
            return (
              <Menu.Item onClick={() => handleHistory(item)} key={item.templateId}>
                <div className={Style['history-version']}>
                  {`${intl.get('ssrc.sourceTemplate.model.sourceTemplate.version').d('版本')}v${
                    item.versionNumber
                  }`}
                </div>
                <div className={Style['history-creation']}>
                  <span style={{ paddingRight: '8px' }}>{item.releaseDate}</span>
                </div>
              </Menu.Item>
            );
          })}
        </Menu>
      </div>
    );
  };

  // 启用禁用
  const handleEnable = async ({ record, enabled = 0 }) => {
    setLoading(true);
    const res = await enableDisabled({
      enabled,
      templateId: record.get('templateId'),
    });
    if (getResponse(res)) {
      notification.success();
      tableDs.query(tableDs?.currentPage);
    }
    setLoading(false);
  };

  // 渲染更多
  const renderMoreAction = (record) => {
    const menu = (
      <Menu style={{ width: '140px' }}>
        <Menu.Item key="disabled" onClick={() => handleEnable({ record, enabled: 0 })}>
          {intl.get('ssrc.sourceTemplate.model.sourceTemplate.disabled').d('禁用')}
        </Menu.Item>
        <Menu.SubMenu
          title={intl.get('ssrc.inquiryHall.view.inquiryHall.historyMode').d('历史版本')}
          key="history"
        >
          <div className={Style['ssrc-source-template-list-history-buttons-wrapper']}>
            <Menu>
              {record.get('historyDTO').map((item) => {
                return (
                  <Menu.Item onClick={() => handleHistory(item)} key={item.templateId}>
                    <div className={Style['history-version']}>
                      {`${intl.get('ssrc.sourceTemplate.model.sourceTemplate.version').d('版本')}v${
                        item.versionNumber
                      }`}
                    </div>
                    <div className={Style['history-creation']}>
                      <span style={{ paddingRight: '8px' }}>{item.releaseDate}</span>
                    </div>
                  </Menu.Item>
                );
              })}
            </Menu>
          </div>
        </Menu.SubMenu>
      </Menu>
    );
    return menu;
  };

  // 复制
  const handleCopy = (record) => {
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: intl
        .get('ssrc.sourceTemplate.model.sourceTemplate.copyTip')
        .d('是否复制此寻源模板生成一张新的模板'),
      onOk: async () => {
        setLoading(true);
        const res = await copy({
          templateId: record.get('templateId'),
        });
        if (getResponse(res)) {
          notification.success();
          history.push({
            pathname: `/ssrc/source-template-workbench/update/edit/${res.templateId}`,
          });
        }
        setLoading(false);
      },
    });
  };

  // 编辑
  const handleEdit = (record) => {
    history.push({
      pathname: `/ssrc/source-template-workbench/update/edit/${record.get('templateId')}`,
    });
  };

  // 渲染操作列
  const displayAction = (record) => {
    if (record.get('templateStatus') !== 'DISABLED') {
      return (
        // <div>
        //   <a onClick={() => handleEdit(record)}>
        //     {intl.get(`hzero.common.view.button.edit`).d('编辑')}
        //   </a>
        //   <a style={{ marginLeft: '16px' }} onClick={() => handleCopy(record)}>
        //     {intl.get(`ssrc.sourceTemplate.view.button.copy`).d('复制')}
        //   </a>
        //   {isEmpty(record.get('historyDTO')) ? (
        //     <a style={{ marginLeft: '16px' }} onClick={() => handleEnable({ record, enabled: 0 })}>
        //       {intl.get('ssrc.sourceTemplate.model.sourceTemplate.disabled').d('禁用')}
        //     </a>
        //   ) : (
        //     <Dropdown overlay={renderMoreAction(record)} trigger={['hover']} placement="bottomLeft">
        //       <a style={{ marginLeft: '16px' }}>
        //         {intl.get('ssrc.inquiryHall.model.inquiryHall.moreAction').d('更多')}
        //         <Icon type="expand_more" style={{ marginTop: '-1px' }} />
        //       </a>
        //     </Dropdown>
        //   )}
        // </div>
        <div className={Style['ssrc-source-template-list-buttons-wrapper']}>
          <Button onClick={() => handleEdit(record)} funcType="link">
            {intl.get(`hzero.common.view.button.edit`).d('编辑')}
          </Button>
          <Button onClick={() => handleCopy(record)} funcType="link">
            {intl.get(`ssrc.sourceTemplate.view.button.copy`).d('复制')}
          </Button>
          {isEmpty(record.get('historyDTO')) ? (
            <Button onClick={() => handleEnable({ record, enabled: 0 })} funcType="link">
              {intl.get('ssrc.sourceTemplate.model.sourceTemplate.disabled').d('禁用')}
            </Button>
          ) : (
            <Dropdown overlay={renderMoreAction(record)} trigger={['hover']} placement="bottomLeft">
              <Button funcType="link">
                {intl.get('ssrc.inquiryHall.model.inquiryHall.moreAction').d('更多')}
                <Icon type="expand_more" style={{ marginTop: '-1px' }} />
              </Button>
            </Dropdown>
          )}
        </div>
      );
    }
    return (
      <div>
        <a onClick={() => handleEnable({ record, enabled: 1 })}>
          {intl.get('ssrc.sourceTemplate.model.sourceTemplate.enable').d('启用')}
        </a>
        {isEmpty(record.get('historyDTO')) ? null : (
          <Dropdown
            overlay={renderHistoryVersion(record)}
            trigger={['hover']}
            placement="bottomLeft"
          >
            <a style={{ marginLeft: '16px' }}>
              {intl.get('ssrc.inquiryHall.view.inquiryHall.historyMode').d('历史版本')}
              <Icon type="expand_more" style={{ marginTop: '-1px' }} />
            </a>
          </Dropdown>
        )}
      </div>
    );
  };

  // 新建
  const handleCreate = () => {
    history.push({
      pathname: `/ssrc/source-template-workbench/update/create/null`,
    });
  };

  // 明细页
  const handleDetail = (record) => {
    history.push({
      pathname: `/ssrc/source-template-workbench/details/${record.get('templateId')}/detail`,
    });
  };

  // 获取询价/新招标 导出模板 参数
  const getRFXExportQueryParam = () => {
    const { selected = [] } = tableDs;
    if (isEmpty(selected)) return {};
    const templateIdList = selected?.map((record) => record.get('templateId')) || [];
    return { templateIdList };
  };

  const columns = useMemo(
    () => [
      {
        name: 'templateStatusMeaning',
        width: 120,
        renderer: ({ value, record }) => {
          return (
            <Tag color={getTemplateStatusColor(record)} style={{ border: 'none' }}>
              {value}
            </Tag>
          );
        },
      },
      {
        name: 'action',
        width: 200,
        renderer: ({ record }) => displayAction(record),
      },
      {
        name: 'templateNum',
        width: 120,
        renderer: ({ record, value }) => <a onClick={() => handleDetail(record)}>{value}</a>,
      },
      {
        name: 'templateName',
      },
      {
        name: 'secondarySourceCategoryMeaning',
        width: 120,
      },
      {
        name: 'versionNumber',
        width: 120,
      },
      {
        name: 'creationDate',
      },
      {
        name: 'lastUpdateDate',
      },
    ],
    []
  );

  // 头部按钮组
  const getButtons = useCallback(() => {
    const rfxExportDisabledFlag =
      tableDs?.selected?.length === 0 ||
      tableDs?.selected?.some?.((record) => record.get('sourceCategory') !== 'RFQ');
    const rfaExportDisabledFlag =
      tableDs?.selected?.length === 0 ||
      tableDs?.selected?.some?.((record) => record.get('sourceCategory') !== 'RFA');
    const rfExportDisabledFlag =
      tableDs?.selected?.length === 0 ||
      tableDs?.selected?.some?.((record) => !['RFP', 'RFI'].includes(record.get('sourceCategory')));
    return [
      {
        name: 'createTemplate',
        btnType: 'c7n-pro',
        child: intl.get('hzero.common.button.create').d('新建'),
        btnProps: {
          onClick: handleCreate,
          icon: 'add',
          color: 'primary',
        },
      },
      {
        name: 'rfxImportAndExport',
        group: true,
        child: (fieldName = '') => (
          <Button name="batchOperate" funcType="flat">
            <Icon type="swap_vert" />
            {fieldName ||
              intl
                .get('ssrc.sourceTemplate.view.button.rfxSourceTemplateImportExport')
                .d('询价/招投标模板导入导出')}
            <Icon type="expand_more" />
          </Button>
        ),
        children: [
          {
            name: 'rfxExport',
            btnComp: ExcelExportPro,
            btnProps: {
              templateCode: 'SRM_C_SRM_SSRC_SOURCE_TEMPLATE_EXPORT_V2',
              name: 'rfxExport',
              requestUrl: `/ssrc/v2/${getCurrentOrganizationId()}/source-templates/export`,
              buttonText: intl
                .get(`ssrc.sourceTemplate.view.button.rfxExport`)
                .d('询价/招投标模板导出'),
              buttonTooltip: intl
                .get('ssrc.sourceTemplate.view.button.rfxExport.tooltip')
                .d(
                  '用于导出询价/招投标模板。如果你选择导出的模板包含竞价/信息征询书/方案征询书模板，【询价/招投标模板导出】按钮将置灰，请重新选择导出的模板。'
                ),
              allBody: true,
              method: 'POST',
              queryParams: {
                ...(getRFXExportQueryParam() || {}),
              },
              otherButtonProps: {
                icon: '',
                className: rfxExportDisabledFlag ? Style['noBtn-disabled'] : Style.noBtn,
                type: 'c7n-pro',
                disabled: rfxExportDisabledFlag,
              },
            },
          },
          {
            name: 'rfxImport',
            btnComp: CommonImportNew,
            btnProps: {
              name: 'rfxImport',
              businessObjectTemplateCode: 'SRM_C_SRM_SSRC_SOURCE_TEMPLATE_IMPORT_V2',
              prefixPatch: SRM_SSRC,
              args: {
                tenantId: getCurrentOrganizationId(),
              },
              buttonText: intl
                .get(`ssrc.sourceTemplate.view.button.rfxImport`)
                .d('询价/招投标模板导入'),
              auto: true,
              refreshButton: true,
              buttonProps: {
                icon: '',
                className: Style.noBtn,
              },
              successCallBack: () => tableDs.query(),
            },
          },
        ],
      },
      {
        name: 'rfaImportAndExport',
        group: true,
        child: (fieldName = '') => (
          <Button name="batchOperate" funcType="flat">
            <Icon type="swap_vert" />
            {fieldName ||
              intl
                .get('ssrc.sourceTemplate.view.button.rfaSourceTemplateImportExport')
                .d('竞价模板导入导出')}
            <Icon type="expand_more" />
          </Button>
        ),
        children: [
          {
            name: 'rfaExport',
            btnComp: ExcelExportPro,
            btnProps: {
              templateCode: 'SRM_C_SRM_SSRC_SOURCE_TEMPLATE_RFA_EXPORT_V2',
              name: 'rfaExport',
              requestUrl: `/ssrc/v2/${getCurrentOrganizationId()}/source-templates/export`,
              buttonText: intl.get(`ssrc.sourceTemplate.view.button.rfaExport`).d('竞价模板导出'),
              buttonTooltip: intl
                .get('ssrc.sourceTemplate.view.button.rfaExport.tooltip')
                .d(
                  '用于导出竞价模板。如果你选择导出的模板包含询价/招投标/信息征询书/方案征询书模板，【竞价模板导出】按钮将置灰，请重新选择导出的模板。'
                ),
              allBody: true,
              method: 'POST',
              queryParams: {
                ...(getRFXExportQueryParam() || {}),
              },
              otherButtonProps: {
                icon: '',
                className: rfaExportDisabledFlag ? Style['noBtn-disabled'] : Style.noBtn,
                type: 'c7n-pro',
                disabled: rfaExportDisabledFlag,
              },
            },
          },
          {
            name: 'rfaImport',
            btnComp: CommonImportNew,
            btnProps: {
              name: 'rfaImport',
              businessObjectTemplateCode: 'SRM_C_SRM_SSRC_SOURCE_TEMPLATE_RFA_IMPORT_V2',
              prefixPatch: SRM_SSRC,
              args: {
                tenantId: getCurrentOrganizationId(),
              },
              buttonText: intl.get(`ssrc.sourceTemplate.view.button.rfaImport`).d('竞价模板导入'),
              auto: true,
              refreshButton: true,
              buttonProps: {
                icon: '',
                className: Style.noBtn,
              },
              successCallBack: () => tableDs.query(),
            },
          },
        ],
      },
      {
        name: 'rfImportAndExport',
        group: true,
        child: (fieldName = '') => (
          <Button name="batchOperate" funcType="flat">
            <Icon type="swap_vert" />
            {fieldName ||
              intl
                .get('ssrc.sourceTemplate.view.button.rfSourceTemplateImportExport')
                .d('信息征询书/方案征询书模板导入导出')}
            <Icon type="expand_more" />
          </Button>
        ),
        children: [
          {
            name: 'rfExport',
            btnComp: ExcelExportPro,
            btnProps: {
              templateCode: 'SRM_C_SRM_SSRC_SOURCE_TEMPLATE_RF_EXPORT_V2',
              name: 'rfExport',
              requestUrl: `/ssrc/v2/${getCurrentOrganizationId()}/source-templates/export`,
              buttonText: intl
                .get(`ssrc.sourceTemplate.view.button.rfExport`)
                .d('信息征询书/方案征询书模板导出'),
              buttonTooltip: intl
                .get('ssrc.sourceTemplate.view.button.rfExport.tooltip')
                .d(
                  '用于导出信息征询书/方案征询书模板。如果你选择导出的模板包含询价/招投标/竞价模板，【信息征询书/方案征询书模板导入导出】按钮将置灰，请重新选择导出的模板。'
                ),
              allBody: true,
              method: 'POST',
              queryParams: {
                ...(getRFXExportQueryParam() || {}),
              },
              otherButtonProps: {
                icon: '',
                className: rfExportDisabledFlag ? Style['noBtn-disabled'] : Style.noBtn,
                type: 'c7n-pro',
                disabled: rfExportDisabledFlag,
              },
            },
          },
          {
            name: 'rfImport',
            btnComp: CommonImportNew,
            btnProps: {
              name: 'rfImport',
              businessObjectTemplateCode: 'SRM_C_SRM_SSRC_SOURCE_TEMPLATE_RF_IMPORT_V2',
              prefixPatch: SRM_SSRC,
              args: {
                tenantId: getCurrentOrganizationId(),
              },
              buttonText: intl
                .get(`ssrc.sourceTemplate.view.button.rfImport`)
                .d('信息征询书/方案征询书模板导入'),
              auto: true,
              refreshButton: true,
              buttonProps: {
                icon: '',
                className: Style.noBtn,
              },
              successCallBack: () => tableDs.query(),
            },
          },
        ],
      },
    ];
  }, [tableDs, tableDs?.selected]);

  // 筛选器宽回调事件
  const handleChange = (ds, value) => {
    const searchValue = value
      ? value.map((ele) => ele.trim().replace(/\s+/g, ',')).join(',')
      : undefined;
    tableDs.setQueryParameter('multiSTNumOrName', searchValue);
  };

  // 左边多选框渲染
  const leftInput = (ds) => {
    return (
      <MutlTextFieldSearch
        searchBarDS={ds}
        name="multiSTNumOrName"
        placeholder={intl
          .get('ssrc.sourceTemplate.model.sourceTemplate.inputMultiTemplateNumOrTitle')
          .d('请输入模板编码或者名称查询')}
        onChange={handleChange}
      />
    );
  };

  const clearQueryParameter = () => {
    tableDs.setQueryParameter('multiSTNumOrName', '');
  };

  // 过滤筛选器
  const renderFilterOption = (record) => {
    const optionValue = record.get('value') || null;
    if (newBidFlag) {
      if (!useRF) {
        return optionValue !== 'RFI' && optionValue !== 'RFP';
      } else if (useRF === 'RFI') {
        return optionValue !== 'RFP';
      } else if (useRF === 'RFP') {
        return optionValue !== 'RFI';
      } else {
        return optionValue;
      }
    } else if (!useRF) {
      return optionValue !== 'RFI' && optionValue !== 'RFP' && optionValue !== 'NEW_BID';
    } else if (useRF === 'RFI') {
      return optionValue !== 'RFP' && optionValue !== 'NEW_BID';
    } else if (useRF === 'RFP') {
      return optionValue !== 'RFI' && optionValue !== 'NEW_BID';
    } else {
      return optionValue !== 'NEW_BID';
    }
  };

  return (
    <React.Fragment>
      <Header
        title={intl
          .get('ssrc.sourceTemplate.view.message.title.sourcingTemplateWorkbench')
          .d('寻源模板配置')}
      >
        <DynamicButtons buttons={getButtons()} />
      </Header>
      <Content>
        <Spin spinning={loading}>
          <SearchBarTable
            cacheState
            dataSet={tableDs}
            columns={columns}
            style={{ maxHeight: 'calc(100vh - 190px)' }}
            searchBarConfig={{
              left: {
                render: (_, ds) => leftInput(ds),
              },
              onReset: clearQueryParameter,
              onClear: clearQueryParameter,
              editorProps: {
                secondarySourceCategory: {
                  optionsFilter: renderFilterOption,
                },
              },
            }}
            searchCode="SSRC.SOURCE_TEMPLATE_WORKBENCH.FILTER_BAR"
            customizedCode="SSRC.SOURCE_TEMPLATE_WORKBENCH.LIST"
          />
        </Spin>
      </Content>
    </React.Fragment>
  );
};

export default compose(
  WithCustomizeC7N({
    unitCode: [],
  }),
  formatterCollections({ code: ['ssrc.sourceTemplate', 'ssrc.common', 'ssrc.inquiryHall'] }),
  withProps(
    () => {
      // 缓存dataset
      const tableDs = new DataSet(tableDS());
      return {
        tableDs,
      };
    },
    { cacheState: true }
  )
)(observer(SourceTemplateWorkbench));

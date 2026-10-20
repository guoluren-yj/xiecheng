import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { compose, isEmpty, noop } from 'lodash';
import { Button, Dropdown, Menu, Icon, Spin, Tabs, DataSet } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';
import classNames from 'classnames';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import intl from 'utils/intl';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import withProps from 'utils/withProps';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import { checkPermission } from 'services/api';
import { yesOrNoRender } from 'utils/renderer';
import { SRM_SPC } from '_utils/config';

import { retry } from '@/services/advancedPricingRecordService';
import MutlTextFieldSearch from '@/routes/ssrc/components/MutlTextFieldSearch';
import { TabKeyList, PriceSourceType } from './enum';
import { AdjustPriceDS, AdvancedPriceDS } from './listDS';
import styles from './index.less';
import { StatusRender, ViewLinkRender } from './utils';
import { CallDetail, CallRecord, ExecutionResDoc, SourcePrice } from './modal';

const { Item } = Menu;

const AdvancedPricingRecordForm = observer((props) => {
  const tabList = [
    {
      tab: intl.get('spc.advancedPricingRecord.view.title.adjustPriceRecords').d('调价单生成记录'),
      key: TabKeyList.ADJUST,
      filterCode: 'SPC.ADVANCED_PRICING_RECORD.ADJUST_TAB.FILTER',
      customizeUnitCode: 'SPC.ADVANCED_PRICING_RECORD.ADJUST_TAB.TABLE',
    },
    {
      tab: intl.get('spc.advancedPricingRecord.view.title.advancedPriceRecords').d('取价记录'),
      key: TabKeyList.ADVANCED,
      filterCode: 'SPC.ADVANCED_PRICING_RECORD.LIST.FILTER',
      customizeUnitCode: 'SPC.ADVANCED_PRICING_RECORD.LIST.ALL_TABLE',
    },
  ];

  const { customizeBtnGroup, customizeTable, tabDsList } = props;
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeKey, setActiveKey] = useState(TabKeyList.ADJUST);

  const isAdjust = useMemo(() => activeKey === TabKeyList.ADJUST, [activeKey]);

  const tableDs = useMemo(() => tabDsList[activeKey], [activeKey]);

  useEffect(() => {
    fetchPermission();
  }, []);

  // 获取按钮权限
  const fetchPermission = () => {
    // 请求权限
    const permissionList = [
      'srm.pc-admin.pc-purchaser.workspace2.ps.submit.button', // 提交
      'srm.pc-admin.pc-purchaser.workspace2.ps.delete.button', // 删除
    ];
    checkPermission(permissionList).then((res) => {
      if (getResponse(res)) {
        setPermissions(res);
      }
    });
  };

  // 重新执行
  const handleReExecution = async (record) => {
    setLoading(true);
    const res = await retry(record.toData());
    setLoading(false);
    if (getResponse(res)) {
      notification.success();
      tableDs.query();
    }
  };

  const getOverlay = (items = []) => {
    return isEmpty(items) ? (
      false
    ) : (
      <Menu>
        {items.map((i) => (
          <Item className={styles['more-option']} key={i.key}>
            {i}
          </Item>
        ))}
      </Menu>
    );
  };

  const allActionList = [
    {
      key: 'ReExecution',
      // code: 'srm.pc-admin.pc-purchaser.workspace2.button.seal',
      title: intl.get('spc.advancedPricingRecord.button.reExecution').d('重新执行'),
      onClick: handleReExecution,
      isHidden: (record) => record.get('triggerMode') !== 'MONITORING', // 触发方式不为系统监听
    },
  ];

  const getButton = (key, record) => {
    const action = allActionList.find((item) => item.key === key);
    if (!action) {
      return {};
    }
    const { title, onClick = noop, isHidden = () => false } = action;
    return {
      ...action,
      button: !isHidden(record) && (
        <Button
          key={key}
          type="c7n-pro"
          funcType="link"
          color="primary"
          onClick={() => onClick(record)}
        >
          {title}
        </Button>
      ),
    };
  };

  const getActionList = (callResult) => {
    const actionStatusMap = {
      ERROR: ['ReExecution'],
    };
    return actionStatusMap[callResult] || [];
  };

  // 渲染操作列
  const renderAction = (record) => {
    const actionList = getActionList(record.get('callResult'));

    const permissionButtonList = actionList
      .filter((i) => {
        const currenPer = permissions.find((n) => n.code === i.code);
        return currenPer?.approve || true;
      })
      .map((action) => getButton(action, record)?.button)
      .filter((btn) => btn);

    const moreActionList = permissionButtonList.filter((_, index) => ![0, 1].includes(index));
    const overlay = getOverlay(moreActionList);
    const moreAction =
      moreActionList.length > 1 ? (
        <Dropdown overlay={overlay} trigger={['hover']}>
          <Button type="c7n-pro" funcType="link" color="primary" className={styles['more-action']}>
            {intl.get('ssrc.inquiryHall.model.inquiryHall.moreAction').d('更多')}
            <Icon type="expand_more" />
          </Button>
        </Dropdown>
      ) : (
        moreActionList[0]
      );
    return isEmpty(permissionButtonList)
      ? '-'
      : [permissionButtonList[0], permissionButtonList[1], moreAction];
  };

  const getModalpRrops = useCallback(
    (type) => {
      if (!tableDs?.current) return;
      const record = tableDs.current;
      switch (type) {
        case TabKeyList.ADJUST:
          return {
            title: intl.get(`spc.advancedPricingRecord.model.callDetail`).d('调用详情'),
            children: <CallDetail record={record} isAdjust />,
            width: '742px',
          };
        case TabKeyList.ADVANCED:
          // eslint-disable-next-line no-case-declarations
          const { priceSourceType, priceSourceTypeMeaning } = record.get([
            'priceSourceType',
            'priceSourceTypeMeaning',
          ]);
          return {
            title: priceSourceTypeMeaning,
            width: '742px',
            // 公式计价
            children:
              priceSourceType === PriceSourceType.FORMULA_PRICE ? (
                <CallDetail record={record} />
              ) : (
                <SourcePrice record={record} />
              ),
          };
        case 'executionResDoc':
          return {
            title: intl.get(`spc.advancedPricingRecord.model.executionResDoc`).d('执行结果单据'),
            children: <ExecutionResDoc record={record} />,
            width: '380px',
          };
        case 'callRecord':
          return {
            title: intl.get(`spc.advancedPricingRecord.model.callRecord`).d('调用记录'),
            children: <CallRecord record={record} />,
            width: '1090px',
          };
        default:
          break;
      }
    },
    [tableDs]
  );

  const adjustColumns = useMemo(
    () => [
      {
        name: 'callResult',
        width: 120,
        renderer: ({ value, record }) => {
          return StatusRender(value, record.get('callResultMeaning'));
        },
      },
      {
        name: 'action',
        width: 150,
        renderer: ({ record }) => renderAction(record),
      },
      {
        name: 'recordNum',
        width: 150,
      },
      {
        name: 'triggerMode',
        width: 120,
      },
      {
        name: 'callDetail',
        width: 180,
        renderer: () => ViewLinkRender(getModalpRrops(TabKeyList.ADJUST)),
      },
      {
        name: 'errorMsg',
        width: 200,
      },
      {
        name: 'executionResDoc',
        width: 120,
        renderer: () => ViewLinkRender(getModalpRrops('executionResDoc')),
      },
      {
        name: 'callTime',
        width: 150,
      },
      {
        name: 'callByName',
        width: 150,
      },
      {
        name: 'callRecord',
        width: 150,
        renderer: () => ViewLinkRender(getModalpRrops('callRecord')),
      },
    ],
    [tableDs]
  );

  const advancedColumns = useMemo(
    () => [
      {
        name: 'callResult',
        width: 120,
        renderer: ({ value, record }) => {
          return StatusRender(value, record.get('callResultMeaning'));
        },
      },
      // {
      //   name: 'action',
      //   width: 120,
      //   renderer: ({ record }) => renderAction(record),
      // },
      {
        name: 'recordNum',
        width: 160,
      },
      {
        name: 'sourceFrom',
        width: 120,
      },
      {
        name: 'advancedDetail',
        width: 120,
        renderer: () => ViewLinkRender(getModalpRrops(TabKeyList.ADVANCED)),
      },
      {
        name: 'pricingServiceCode',
        width: 200,
      },
      // {
      //   name: 'sourceNum',
      //   width: 120,
      // },
      {
        name: 'priceSourceType',
        width: 120,
      },
      {
        name: 'discountRuleFlag',
        width: 120,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'errorMsg',
        width: 200,
      },
      {
        name: 'callTime',
        width: 150,
      },
    ],
    [tableDs]
  );

  const columns = {
    [TabKeyList.ADJUST]: adjustColumns,
    [TabKeyList.ADVANCED]: advancedColumns,
  };

  /**
   * 获取数据导出查询参数
   */
  const getExportParams = () => {
    const { selected, queryDataSet } = tableDs;
    const dsParams = queryDataSet ? queryDataSet.toData()[0] : {};
    const queryParameter = tableDs.queryParameter || {};
    const recordIds = selected.map((i) => i.get('recordId'));
    const queryParams = selected.length
      ? { recordIds }
      : { ...dsParams, codeOrName: dsParams?.codeOrName?.split(','), customizeOrderField: null };
    return {
      ...queryParameter,
      ...queryParams,
    };
  };

  const getButtons = useCallback(() => {
    const tabSelectRows = tableDs.selected;
    return customizeBtnGroup(
      {
        code: 'SPC.ADVANCED_PRICING_RECORD.ADJUST_TAB.BTN_GROUP',
      },
      [
        <ExcelExportPro
          data-name="newExport"
          buttonText={
            tabSelectRows.length > 0
              ? intl.get(`hzero.common.checkedExport`).d('勾选导出')
              : intl.get(`hzero.common.button.export`).d('导出')
          }
          templateCode={isAdjust ? 'SRM_C_SSRC_PRICE_ADJUST_RECORD_EXPORT' : ''}
          requestUrl={`${SRM_SPC}/v1/${getCurrentOrganizationId()}/price-adjust-records/excel-export-adjust`}
          queryParams={getExportParams()}
          method="POST"
          allBody
          otherButtonProps={{
            type: 'c7n-pro',
            icon: 'unarchive',
            funcType: 'flat',
            // permissionList: [
            //   {
            //     code: 'srm.pc-admin.pc-purchaser.view.ps.export.new',
            //     type: 'button',
            //     meaning: '新版导出(协议)',
            //   },
            // ],
          }}
        />,
      ]
    );
  }, []);

  const handleChange = (ds, value) => {
    const searchValue = value
      ? value.map((ele) => ele.trim().replace(/\s+/g, ',')).join(',')
      : undefined;
    tableDs.setQueryParameter('codeOrName', searchValue);
  };

  // 左边多选框渲染
  const leftInput = (ds) => {
    return (
      <MutlTextFieldSearch
        searchBarDS={ds}
        name="codeOrName"
        placeholder={
          isAdjust
            ? intl
                .get('spc.advancedPricingRecord.view.message.adjust.inputMultiTemplateNumOrTitle')
                .d('请输入调用记录编码')
            : intl
                .get('spc.advancedPricingRecord.view.message.advanced.inputMultiTemplateNumOrTitle')
                .d('请输入取价记录编码')
        }
        onChange={handleChange}
      />
    );
  };

  const clearQueryParameter = () => {
    tableDs.setQueryParameter('codeOrName', '');
  };

  const handleTabChange = (Key) => {
    setActiveKey(Key);
  };

  return (
    <React.Fragment>
      <Header
        title={intl
          .get('spc.advancedPricingRecord.view.title.advancedPricingRecord')
          .d('高级取价记录表')}
      >
        {getButtons()}
      </Header>
      <Content className={classNames(styles['action-content-wide'])}>
        <Tabs activeKey={activeKey} onChange={handleTabChange}>
          {tabList.map(({ tab, key, filterCode, customizeUnitCode }) => (
            <Tabs.TabPane tab={tab} key={key}>
              <Spin spinning={loading}>
                {customizeTable(
                  {
                    code: customizeUnitCode,
                  },
                  <SearchBarTable
                    cacheState
                    dataSet={tableDs}
                    columns={columns[key]}
                    style={{ maxHeight: 'calc(100vh - 250px)' }}
                    searchBarConfig={{
                      fieldProps: {
                        codeOrName: {
                          multiple: ',',
                        },
                      },
                      left: {
                        render: (_, ds) => leftInput(ds),
                      },
                      onReset: clearQueryParameter,
                      onClear: clearQueryParameter,
                    }}
                    searchCode={filterCode}
                  />
                )}
              </Spin>
            </Tabs.TabPane>
          ))}
        </Tabs>
      </Content>
    </React.Fragment>
  );
});

export default compose(
  WithCustomizeC7N({
    unitCode: [
      'SPC.ADVANCED_PRICING_RECORD.ADJUST_TAB.BTN_GROUP',
      'SPC.ADVANCED_PRICING_RECORD.ADJUST_TAB.TABLE',
      'SPC.ADVANCED_PRICING_RECORD.ADJUST_TAB.FILTER',
      'SPC.ADVANCED_PRICING_RECORD.ADVANCED_TAB.FILTER',
      'SPC.ADVANCED_PRICING_RECORD.ADVANCED_TAB.ALL_TABLE',
    ],
  }),
  formatterCollections({
    code: [
      'entity.roles',
      'hzero.c7nProUI',
      'hzero.common',
      'ssrc.common',
      'ssrc.inquiryHall',
      'ssrc.priceAdjustmentWorkBench',
      'spc.bomDimConfig',
      'spc.bomViewWorkbench',
      'spc.formulaManage',
      'spc.advancedPricingRecord',
    ],
  }),
  withProps(
    () => {
      // 调价
      const adjustPriceDs = new DataSet(AdjustPriceDS());
      const advancedPriceDs = new DataSet(AdvancedPriceDS());
      return {
        tabDsList: {
          [TabKeyList.ADJUST]: adjustPriceDs,
          [TabKeyList.ADVANCED]: advancedPriceDs,
        },
      };
    },
    { cacheState: true }
  )
)(AdvancedPricingRecordForm);

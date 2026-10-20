import React, { useState, useRef, useMemo} from 'react';
import { Tabs } from 'choerodon-ui';
import { DataSet, Modal, Button as C7nButton } from 'choerodon-ui/pro';
import classnames from 'classnames';
import { compose, isEmpty } from 'lodash';
import { connect } from 'dva';
import moment from 'moment';
import { DATETIME_MIN, DEFAULT_DATETIME_FORMAT } from 'utils/constants';

import { getCurrentOrganizationId } from 'utils/utils';
import notification from 'utils/notification';
import intl from 'utils/intl';
import OverflowTip from '@/components/OverflowTip';
import ColorConfig from '../ColorConfig';
import GreyModeConfig from '../GreyModeConfig';
import LogoConfig from '../LogoConfig';
import FaviconConfig from '../FaviconConfig';
import CatalogConfig from '../CatalogConfig';
import BottomInfoConfig from '../BottomInfoConfig';
import CopyRightConfig from '../CopyRightConfig';
import EditUnitLogo from '../LogoConfig/EditUnitLogo';
import SiglTitleConfig from '../SiglTitleConfig';
import ComContent from '../../common/ComContent';
import CustConfig from '../CustConfig';
import ProductCardConfig from '../ProductCardConfig';

import styles from './index.less';

const { TabPane } = Tabs;

function ConfigList(props) {
  const {
    modal,
    mallHomeConfig,
    mallHome: { memberPermission, configDetail },
    dispatch,
    saveLoading,
    saveCustLoading,
    saveProductCardLoading,
  } = props;

  const [currentType, setCurrentType] = useState('A');
  const [currentItem, setCurrentItem] = useState('A');
  const [custConfigInfo, setCustConfigInfo] = useState({});
  const productCardRef = useRef();
  const sortSearchRef = useRef();

  const ds = useMemo(
    () =>
      new DataSet({
        autoCreate: true,
        forceValidate: true,
        fields: [
          {
            name: 'greyMode',
            label: intl.get(`small.common.model.isornoEnabledFlag`).d('启用'),
            required: true,
            trueValue: 1,
            falseValue: 0,
          },
          {
            name: 'greyModeRange',
            label: intl.get(`small.mallHomeConfig.model.greyThemeRange`).d('置灰范围'),
            dynamicProps: {
              required: ({ record }) => {
                return record.get('greyMode') === 1;
              },
            },
          },
          {
            name: 'validityDate',
            type: 'date',
            ignore: 'always',
            range: ['startDate', 'endDate'],
            label: intl.get(`small.mallHomeConfig.model.greyThemeValidTime`).d('有效期'),
            dynamicProps: {
              required: ({ record }) => {
                return record.get('greyMode') === 1;
              },
              min:
              ({ record }) => {
                if(record.get('greyMode') === 1){
                  return moment().format(DATETIME_MIN);
                }
              },
            },
            validator: (value, name, record) => {
              // 未开启 则不校验
              if(record.get('greyMode') === 0) return true;
              if(!value.startDate){
                return intl.get(`small.mallHomeConfig.view.validateFrom`).d('请输入有效期从');
              }
              if(!value.endDate){
                return intl.get(`small.mallHomeConfig.view.validateTo`).d('请输入有效期至');
              }
            },
          },
          {
            name: 'startDate',
            type: 'date',
            bind: 'validityDate.startDate',
          },
          {
            name: 'endDate',
            type: 'date',
            bind: 'validityDate.endDate',
          },
        ],
      }),
    []
  );
  async function handleSave() {
    const flag = await ds.validate();
    if(!flag) return;

   const {greyMode, greyModeRange, startDate, endDate} = ds.current.toData();
    const res = await dispatch({
      type: 'mallHomeConfig/save',
      payload: {
        ...mallHomeConfig,
        greyMode,
        greyModeRange,
        endDate: moment(endDate).format(DEFAULT_DATETIME_FORMAT),
        startDate: moment(startDate).format(DEFAULT_DATETIME_FORMAT),
        logoUrl: mallHomeConfig.currentlogoUrl,
        pageBottomList: mallHomeConfig.pageBottomList.map(p => {
          const { headerDs, tableDs, ...other } = p;
          return other;
        }),
      },
    });
    if (res) {
      dispatch({
        type: 'mallHome/updateState',
        payload: {
          configDetail: res,
        },
      });
      modal.close();
    }
  }

  async function handleCustSave() {
    const {
      sortSearchList,
      productQuickLinkConfigList,
      sortMenuList,
      ...otherData
    } = custConfigInfo.ds.current.toData();
    const enabledTypeList = sortSearchList.filter(p => p.enabledFlag === 1);
    if (isEmpty(enabledTypeList)) {
      notification.warning({
        message: intl.get('small.mallHomeConfig.view.nosearchType').d('至少启用一个搜索条件!'),
      });
      return;
    }
    const flag = await custConfigInfo.ds.validate();
    if (flag) {
      await dispatch({
        type: 'mallHome/saveSortSearch',
        payload: [...sortSearchList, ...productQuickLinkConfigList, ...sortMenuList],
      });
      const res = await dispatch({
        type: 'mallHomeConfig/saveCust',
        payload: otherData,
      });
      if (res) {
        custConfigInfo.ds.loadData([res]);
        modal.close();
      }
    }
  }

  async function handleCardSave() {
    const { bottomData, topData, currentOpreate } = productCardRef.current || {};
    const data = [
      ...bottomData
        .filter(p => !!p?.elementType)
        .map((p, i) => {
          if (bottomData?.[i]?.id) {
            delete bottomData[i].id;
          }
          return {
            ...p,
            row: 2,
            column: i + 1,
          };
        }),
      ...topData
        .filter(p => !!p?.elementType)
        .map((p, i) => {
          if (p?.id) {
            delete topData[i].id;
          }
          return {
            ...p,
            row: 1,
            column: i + 1,
          };
        }),
      {
        column: 1,
        elementType: currentOpreate,
        enabledFlag: 1,
        row: 1,
        rowLength: 1,
        tenantId: getCurrentOrganizationId(),
      },
    ];
    const res = await dispatch({
      type: 'mallHome/saveProductCartConfig',
      payload: data,
    });
    if (res) {
      modal.close();
    }
  }

  const itemList = [
    {
      code: 'A',
      title: intl.get('small.mallHomeConfig.view.item.themeColor').d('设置商城主题色'),
      id: 'small-MallHomeConfig-A',
      children: <ColorConfig />,
    },
    {
      code: 'A2',
      title: intl.get(`small.mallHomeConfig.view.greyThemeConfig`).d('灰色主题配置'),
      id: 'small-MallHomeConfig-greyThemeConfig',
      children: <GreyModeConfig dataSet={ds} />,
    },
    {
      code: 'B',
      title: intl.get('small.mallHomeConfig.view.item.logo').d('LOGO图片'),
      id: 'small-MallHomeConfig-B',
      children: (
        <>
          <LogoConfig />
          <C7nButton
            style={{ height: 24, maxWidth: 250, marginTop: 16, display: 'flex', alignItems: 'center' }}
            className="primary-color"
            icon="mode_edit"
            color="primary"
            funcType="flat"
            onClick={() => {
              openUnitLogo();
            }}
          >
            <OverflowTip>{intl.get('small.mallHomeConfig.view.edit.UnitLOGO').d('编辑采购组织LOGO')}</OverflowTip>
          </C7nButton>
        </>
      ),
    },
    {
      code: 'C',
      title: intl.get('small.mallHomeConfig.view.item.faviconConfig').d('浏览器Favicon图标'),
      id: 'small-MallHomeConfig-C',
      children: <FaviconConfig />,
    },
    {
      code: 'C1',
      title: intl.get('small.mallHomeConfig.view.item.siglTitleConfig').d('会员购标题'),
      id: 'small-MallHomeConfig-C1',
      children: <SiglTitleConfig />,
      visible: memberPermission,
    },
    {
      code: 'D',
      title: intl.get('small.mallHomeConfig.view.item.catalogConfig').d('商品目录'),
      id: 'small-MallHomeConfig-D',
      children: <CatalogConfig />,
    },
    {
      code: 'E',
      title: intl.get('small.mallHomeConfig.item.bottom.info').d('底部信息栏'),
      id: 'small-MallHomeConfig-E',
      children: <BottomInfoConfig />,
    },
    {
      code: 'F',
      title: intl.get('small.mallHomeConfig.item.footerNumConfig').d('底部备案号'),
      id: 'small-MallHomeConfig-F',
      children: <CopyRightConfig />,
    },
  ];

  const openUnitLogo = () => {
    Modal.open({
      destroyOnClose: true,
      title: intl.get('small.mallHomeConfig.view.UnitLOGO.list').d('采购组织LOGO列表'),
      mask: true,
      closable: true,
      style: { width: 742 },
      drawer: true,
      children: <EditUnitLogo />,
    });
  };

  const getItemList = type => {
    switch (type) {
      case 'B':
        return custConfigInfo.itemList || [];
      case 'C':
        return productCardRef.current?.itemList || [];
      default:
        return itemList;
    }
  };

  const getSaveFn = type => {
    switch (type) {
      case 'B':
        return handleCustSave;
      case 'C':
        return handleCardSave;
      default:
        return handleSave;
    }
  };

  return (
    <div className={styles['global-config-container']}>
      <div className="config-list">
        <div className="config-list-title">
          {intl.get('small.common.button.global.setting').d('全局设置')}
        </div>
        <div className="config-list-content">
          <Tabs
            activeKey={currentType}
            onChange={e => {
              setCurrentType(e);
              setCurrentItem('A');
            }}
          >
            <TabPane tab={intl.get('small.mallHomeConfig.view.config.theme').d('主题配置')} key="A">
              <div className="config-list-content-list">
                {itemList
                  .filter(i => i.visible !== false)
                  .map(m => {
                    return (
                      <ComContent
                        style={m.code === 'F' ? { marginBottom: 0 } : {}}
                        id={m.id}
                        title={m.title}
                      >
                        {m.children}
                      </ComContent>
                    );
                  })}
              </div>
            </TabPane>
            <TabPane
              tab={intl.get('small.mallHomeConfig.view.config.cust').d('个性化配置')}
              key="B"
            >
              <CustConfig
                returnList={param => setCustConfigInfo(param)}
                sortSearchRef={sortSearchRef}
              />
            </TabPane>
            <TabPane
              tab={intl.get('small.mallHomeConfig.view.config.productCard').d('商品卡片配置')}
              key="C"
            >
              <div className="config-list-content-list">
                <ProductCardConfig
                  onRef={ref => {
                    productCardRef.current = ref;
                  }}
                />
              </div>
            </TabPane>
          </Tabs>
        </div>
        <div className="config-list-footer">
          <C7nButton
            color="primary"
            onClick={getSaveFn(currentType)}
            loading={saveLoading || saveCustLoading || saveProductCardLoading}
          >
            {currentType === 'A'
              ? intl.get('small.common.button.save.publish').d('保存并发布')
              : intl.get('hzero.common.btn.save').d('保存')}
          </C7nButton>
          <C7nButton
            onClick={() => {
              dispatch({
                type: 'mallHomeConfig/updateState',
                payload: {
                  ...configDetail,
                },
              });
              modal.close();
            }}
          >
            {intl.get('hzero.common.button.cancel').d('取消')}
          </C7nButton>
        </div>
      </div>
      <div className="position-list">
        <div className="config-list-title" title={intl.get('small.common.button.quick.position').d('快速定位')}>
          {intl.get('small.common.button.quick.position').d('快速定位')}
        </div>
        <div className="config-list-content">
          {getItemList(currentType).map(item => {
            return (
              <a
                className={classnames([
                  'config-list-item',
                  'text-overflow',
                  { active: currentItem === item.code },
                ])}
                href={`#${item.id}`}
                onClick={() => {
                  setCurrentItem(item.code);
                }}
                title={item.title}
              >
                {item.title}
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default compose(
  connect(({ mallHomeConfig, mallHome, loading }) => ({
    mallHomeConfig,
    mallHome,
    saveLoading: loading.effects['mallHomeConfig/save'],
    saveCustLoading: loading.effects['mallHomeConfig/saveCust'],
    saveProductCardLoading: loading.effects['mallHome/saveProductCartConfig'],
  }))
)(ConfigList);

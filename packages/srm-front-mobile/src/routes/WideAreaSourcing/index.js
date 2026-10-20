/* eslint-disable jsx-a11y/label-has-for */
/**
 * 寻商问品页面
 * @author: suijiang.liu@going-link.com
 * @data: 2022-02-14
 */
import React, { Component } from 'react';
import { Icon, DataSet, ModalProvider } from 'choerodon-ui/pro';
import { message } from 'choerodon-ui';
import formatterCollections from 'utils/intl/formatterCollections';
import { Header, Content } from 'components/Page';
import { Bind } from 'lodash-decorators';
// import * as dd from 'dingtalk-jsapi';
import intl from 'utils/intl';
import notification from 'utils/notification';
import SearchBar from '_components/SearchBarTable/SearchBar';
import { fetchGoodsList, getUserInfoApi } from '@/services/wideAreaService';
import { WideAreaListDS } from './stores/wideAreaDS';
import AutoComplete from './AutoComplete';
import ListTable from './ListTable';
// import DropDownSelect from './DropDownSelect';
import HotDataList from './HotDataList';
import Tips from './Tips';

import ModelText from './ModelText';

import './index.less';

// 钉钉免登
const dingDingAuth = () => {
  // eslint-disable-next-line func-names
  dd.ready(function() {
    const url = window.location.href;
    let corpId = url.split('corpId=')[1] || '';
    corpId = corpId.includes('#') ? corpId.split('#')[0] : corpId;
    // dd.ready参数为回调函数，在环境准备就绪时触发，jsapi的调用需要保证在该回调函数触发后调用，否则无效。
    dd.runtime.permission.requestAuthCode({
      corpId,
      onSuccess(result) {
        const { code } = result; // 传给后端
        getUserInfoApi(code, corpId).then(() => {});
      },
      onFail(err) {
        console.log(`dd error: ${JSON.stringify(err)}`);
      },
    });
  });
};

const loadDingDingSdk = (c, i, e, b) => {
  const h = i.createElement('script');
  const meta = i.createElement('meta');
  meta.name = 'wpk-bid';
  meta.content = 'dta_2_110458';
  const head = i.getElementsByTagName('head')[0];
  const f = i.getElementsByTagName('script')[0];
  head.appendChild(meta);
  h.type = 'text/javascript';
  h.crossorigin = true;
  // eslint-disable-next-line func-names
  h.onload = function() {
    // eslint-disable-next-line
    c[b] || (c[b] = new c.wpkReporter({ bid: 'dta_2_110458' }));
    c[b].installAll();
  };
  f.parentNode.insertBefore(h, f);
  h.src = e;
};

const dingdingMonitor = () => {
  const isProductEnv =
    window &&
    window.location &&
    window.location.host &&
    window.location.host.indexOf('//127.0.0.1') === -1 &&
    window.location.host.indexOf('//localhost') === -1 &&
    window.location.host.indexOf('//192.168.') === -1;
  // 如果有其它测试域名，请一起排掉，减少测试环境对生产环境监控的干扰
  if (isProductEnv) {
    loadDingDingSdk(
      window,
      document,
      'https://g.alicdn.com/woodpeckerx/jssdk??wpkReporter.js',
      '__wpk'
    );
  }
};

if (navigator && /DingTalk/.test(navigator.userAgent)) {
  console.log('dindin');
  dingdingMonitor();
  dingDingAuth();
}

@formatterCollections({
  code: ['smbl.wideAreaSourcing', 'srm.filterBar'],
})
class WideAreaSourcing extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modal: null,
      totalCount: 0, // 总数
      isShowCount: false, // 是否展示查询数据总数
      inputMsg: '',
      selectedItem: null,
      sortType: '',
      historyWord: JSON.parse(localStorage.getItem('widearea-historyWord')) || [], // 历史搜索
    };
    this.containerRef = null; // 弹窗容器
    this.queryParams = {}; // 过滤参数
    this.wideAreaListDS = new DataSet({ ...WideAreaListDS() });
    this.filtrator = null; // 过滤器
    this.lodDs = new DataSet({
      fields: [
        {
          name: 'industryCategoryName',
          type: 'object',
          lovCode: 'SMBL.SUPPLIER_INDUSTRY',
          lovPara: { itemName: '' },
        },
      ],
    });
  }

  get columns() {
    return [
      {
        name: 'companyName',
        renderer: ({ record }) => {
          return (
            <ModelText
              setModalValue={this.setModalValue}
              modal={this.state.modal}
              companyArea={record.get('first_level_name')}
              companyId={record.get('osph_supplier_company_id')}
              text={record.get('companyName')}
            />
          );
        },
      },
      { name: 'legalRepName' },
      { name: 'first_level_name' },
      {
        name: 'registeredCapital',
        renderer: ({ record }) => {
          const text = record.get('registeredCapital');
          return parseFloat(text) > 0
            ? `${text}${intl.get(`smbl.wideAreaSourcing.modal.currency.thousand`).d('万')}`
            : '-';
        },
      },
      { name: 'buildDate' },
    ];
  }

  // 设置弹窗的值
  @Bind()
  setModalValue(modal) {
    this.setState({ modal });
  }

  @Bind()
  handleSelected(item) {
    // this.queryParams = {}; // 清空筛选条件
    // this.filtrator.queryDs.reset();
    const itemName = item.item_name || item;

    if (!itemName) {
      this.setState({ isShowCount: false });
      return;
    }

    this.updateHistoryWord(itemName);

    const params = { itemName };

    this.filtrator.queryDs.getField('industryCategoryName').setLovPara('itemName', itemName);

    this.setState({ selectedItem: item, inputMsg: itemName, isShowCount: true });
    this.fetchDsList(params);
  }

  /**
   * 执行查询操作
   * @param {*} params
   */
  @Bind()
  fetchDsList(params) {
    const newParms = { ...params, ...this.queryParams };
    Object.keys(newParms).forEach(p => {
      this.wideAreaListDS.setQueryParameter(p, newParms[p]);
    });

    this.wideAreaListDS.query().then(res => {
      this.setState({ isShowCount: true, totalCount: res.totalElements });
      message.success(
        intl
          .get('smbl.wideAreaSourcing.view.message.hasSearched.count', {
            count: res.totalElements || 0,
          })
          .d(`已为你找到${res.totalElements || 0}家公司`),
        undefined,
        undefined,
        'top'
      );
    });
  }

  /**
   * 自动补全列表查询
   * @param {*} str
   * @returns
   */
  @Bind()
  async fetchSuggestions(str) {
    let list = [];
    this.setState({
      selectedItem: null,
    });

    const result = await fetchGoodsList({
      itemName: str,
    });

    if (result) {
      list = result?.content ?? [];
    } else {
      notification.error({
        message: result?.message ?? intl.get('hzero.common.notification.error').d('操作失败'),
      });
    }

    return list;
  }

  /**
   * 查询
   */
  @Bind()
  handleQuery() {
    const { inputMsg, selectedItem } = this.state;

    if (inputMsg) {
      const params = {
        itemName: selectedItem?.item_name ?? selectedItem ?? inputMsg,
      };
      this.fetchDsList(params);
    }
  }

  /**
   * 更新缓存信息
   */
  @Bind()
  updateHistoryWord(keyword, index, e) {
    const { historyWord } = this.state;
    let historyWordCache = historyWord.slice();
    if (index !== undefined) {
      // 删除
      e.stopPropagation();
      historyWordCache.splice(index, 1);
      this.setState({ historyWord: historyWordCache });
      return;
    }
    if (!keyword) {
      // 清空
      localStorage.setItem('widearea-historyWord', JSON.stringify([]));
      this.setState({ historyWord: [] });
      return;
    }
    if (historyWordCache.length > 15) {
      historyWordCache.pop();
    }
    historyWordCache.unshift(keyword);
    historyWordCache = [...new Set(historyWordCache)];
    localStorage.setItem('widearea-historyWord', JSON.stringify(historyWordCache));
    this.setState({ historyWord: historyWordCache });
  }

  /**
   * 筛选器变更回调
   * @param {string} value
   */
  @Bind()
  handlerFieldChange({ record, name, value }) {
    const { data } = record;
    console.log(data);
    if (name === 'province') {
      this.queryParams.province = data.province === 'all' ? '' : data.province_meaning;
    } else if (name === 'industryCategoryName') {
      this.queryParams.industryCategoryName = data.industryCategoryName?.industryCategoryName;
    } else {
      this.queryParams[name] = value;
    }
    this.handleQuery();
  }

  @Bind()
  listTableProps() {
    return {
      columns: this.columns,
      dataSet: this.wideAreaListDS,
    };
  }

  @Bind()
  getRef(ref) {
    console.log(ref, 111);
    this.filtrator = ref;
  }

  render() {
    // const { areaCodeList, capitalTypeList } = this.props;
    const { sortType, inputMsg, isShowCount, historyWord, totalCount } = this.state;

    return (
      <div
        style={{ height: '100%' }}
        ref={ref => {
          this.containerRef = ref;
        }}
      >
        <ModalProvider getContainer={() => this.containerRef}>
          <Header
            title={intl.get('smbl.wideAreaSourcing.view.title.supplier.findSource').d('供应商寻源')}
          >
            <div className="wide-area-phone">
              <Icon type="phone" />
              {intl.get('smbl.wideAreaSourcing.view.title.platform.phone').d('平台咨询电话')}：
              <span className="wide-area-phone-num">400-116-0808</span>
            </div>
          </Header>
          <Content className="wide-area-content">
            <div className="banner-top">
              <div style={{ display: 'inline-block' }}>
                <AutoComplete
                  value={inputMsg}
                  fetchSuggestions={this.fetchSuggestions}
                  onSelect={this.handleSelected}
                  historyWord={historyWord}
                  updateHistoryWord={this.updateHistoryWord}
                  placeholder={intl
                    .get('smbl.wideAreaSourcing.view.placeholder.productName')
                    .d('请输入商品名称查询')}
                  prefix={
                    <Icon
                      type="search"
                      className="icon-search"
                      onClick={() => this.handleQuery(sortType)}
                    />
                  }
                />
              </div>
            </div>

            {!isShowCount && <HotDataList onSelected={this.handleSelected} />}

            <div style={{ display: isShowCount ? 'block' : 'none' }}>
              <SearchBar
                autoQuery={false}
                searchCode="SMBL.WIDEAREA.FILTER.NEW.TAB"
                dataSet={this.lodDs}
                expandable={false}
                onQuery={() => {}}
                onRef={ref => this.getRef(ref)}
                onFieldChange={this.handlerFieldChange}
              />
            </div>

            {isShowCount && (
              <>
                {isShowCount && (
                  <Tips
                    title={intl
                      .get('smbl.wideAreaSourcing.view.message.hasSearched.count', {
                        count: totalCount ?? 0,
                      })
                      .d(`已为你找到${totalCount ?? 0}家公司`)}
                  />
                )}

                <ListTable {...this.listTableProps()} />
              </>
            )}
          </Content>
        </ModalProvider>
      </div>
    );
  }
}

export default WideAreaSourcing;

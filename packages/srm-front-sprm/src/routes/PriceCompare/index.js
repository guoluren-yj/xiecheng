import React, { PureComponent, Fragment } from 'react';
import { Spin } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { withRouter } from 'react-router-dom';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { numberRender } from 'utils/renderer';

import { Header, Content } from 'components/Page';
import styles from './index.less';

const promptKey = 'sprm.priceCompare.view';

@withRouter
@formatterCollections({ code: ['sprm.priceCompare'] })
export default class PriceList extends PureComponent {
  constructor(props) {
    super(props);
    const {
      location: { state = {} },
    } = this.props;

    const { detailUrl = '', priceList = [] } = state;
    this.state = {
      detailUrl,
      priceList,
    };
  }

  @Bind()
  toFixedTax(data = '') {
    if (data === null) {
      return '';
    } else {
      const taxData = numberRender(data, 2, false);
      return taxData;
    }
  }

  render() {
    const { loading = false } = this.props;
    const { priceList, detailUrl } = this.state;
    return (
      <Fragment>
        <Header backPath={detailUrl} title={intl.get(`${promptKey}.compareList`).d('比价单')} />
        <Content>
          <Spin spinning={loading}>
            <div className={styles['price-compare-container']}>
              <table>
                <tr className="compare-title">
                  <td className="col-num">{intl.get(`${promptKey}.num`).d('序号')}</td>
                  <td className="col-img">{intl.get(`${promptKey}.productImg`).d('商品图')}</td>
                  <td className="col-supply">{intl.get(`${promptKey}.supplyName`).d('供应商')}</td>
                  <td className="col-product">
                    {intl.get(`${promptKey}.productName`).d('商品名称')}
                  </td>
                  <td className="col-price">{intl.get(`${promptKey}.price`).d('价格')}</td>
                  <td className="col-source">{intl.get(`${promptKey}.source`).d('来源')}</td>
                </tr>
                {priceList.length > 0 ? (
                  priceList &&
                  priceList?.map((json, index) => (
                    <Fragment>
                      <tr className="compare-product">
                        <td
                          rowSpan={json.productCompareAssignList.length + 1}
                          className="compare-num"
                        >
                          {index + 1}
                        </td>
                        <td
                          rowSpan={json.productCompareAssignList.length + 1}
                          className="compare-img"
                        >
                          <img src={json.imagePath} alt="" />
                        </td>
                      </tr>
                      {json.productCompareAssignList &&
                        json.productCompareAssignList?.map(item => (
                          <tr className="compare-content">
                            <td className="compare-supply">
                              <div title={item.supplierCompanyName}>
                                {item.supplierCompanyName || '-'}
                              </div>
                            </td>
                            <td className="compare-name">
                              <div title={item.productName}>{item.productName || '-'}</div>
                            </td>
                            <td style={item.cheapestFlag === 1 ? { color: '#d0521e' } : {}}>
                              ￥{this.toFixedTax(item.price)}
                            </td>
                            <td>
                              {item.type === 1
                                ? intl.get(`${promptKey}.createProduct`).d('手动添加')
                                : item.type === 2
                                ? intl.get(`${promptKey}.sameProduct`).d('同款推荐')
                                : intl.get(`${promptKey}.similarProduct`).d('同类推荐')}
                            </td>
                          </tr>
                        ))}
                    </Fragment>
                  ))
                ) : (
                  <tr className="no-content">
                    <td colSpan={6}>{intl.get(`${promptKey}.nodata`).d('暂无数据')}</td>
                  </tr>
                )}
              </table>
            </div>
          </Spin>
        </Content>
      </Fragment>
    );
  }
}

/**
 * DetailCatalog - 供应商360度查询-目录
 * @date: 2018-08-20
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Row, Col } from 'hzero-ui';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import './index.less';

/**
 * 供应商360度查询 - 详情菜单
 * @extends {Component} - React.Component
 * @reactProps {Object} catalogList - 数据源
 * @return React.element
 */
@formatterCollections({ code: ['sslm.supplierDetail'] })
export default class DetailCatalog extends PureComponent {
  render() {
    const { catalogList = [] } = this.props;
    return (
      <Row gutter={24} style={{ marginRight: '-26px' }}>
        <Col className="catalog-row" span={20}>
          <Row gutter={24} style={{ margin: 0 }}>
            <div className="catalog-title" span={2}>
              <div>{intl.get('sslm.supplierDetail.view.message.title.catalog').d('目录')}</div>
            </div>
            <ul
              className="catalog-ul"
              style={{ width: `${Math.ceil(catalogList.length / 5) * 180}px` }}
            >
              {catalogList.map((item, index) => {
                const { length } = catalogList;
                const borderLiLength = Math.floor(length / 5) * 5;
                return (
                  <li
                    key={item.serialNumber}
                    className={`catalog-li ${index < borderLiLength ? 'botder-li' : 'noBorder-li'}`}
                  >
                    <a
                      href={`#${item.configName}`}
                      className={`catalog-li-lelel${
                        item.serialNumber - Math.floor(item.serialNumber) === 0 ? 1 : 2
                      }`}
                    >
                      <span className="catalog-li-span">{item.serialNumber}</span>
                      {item.configDescription}
                    </a>
                  </li>
                );
              })}
            </ul>
          </Row>
        </Col>
        <Col span={4} />
      </Row>
    );
  }
}

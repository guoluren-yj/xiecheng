import React, { useCallback, useEffect } from 'react';
import { DataSet, Table, Spin } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';

import { indexDS, columns } from './store/indexDS';

const Hoc = (WrappedComponent) => {
  return class extends React.Component {
    constructor(props) {
      super(props);

      this.state = {
        loading: true,
        children: {},
        dataSet: {},
      };
    }

    componentDidMount() {
      const newTable = {};

      const newDs = [];

      const { quotationRoundNumber = 0 } = this.props;

      for (let i = 0; i < quotationRoundNumber; i++) {
        const ds = `tableDs${i}`;

        const table = `table${i}`;

        newDs[ds] = new DataSet(indexDS());

        newTable[table] = this.tables({ i, ds: newDs[ds] });

        if (i === quotationRoundNumber - 1) {
          this.setState({ loading: false });
        }
      }
      // 反转对象的键值对
      this.setState({ children: this.objReverse(newTable), dataSet: this.objReverse(newDs) });
    }

    /**
     * tables
     * @param {*} obj
     * @returns object
     */
    @Bind()
    tables({ i, ds }) {
      const {
        customizeTable = (e) => e,
        customizedCode = null,
        lineRecord,
        sourceKey = '',
      } = this.props;

      return customizeTable(
        { code: customizedCode },
        <Table
          key={String(i)}
          dataSet={ds}
          columns={columns({ lineRecord, sourceKey })}
          columnResizable="true"
          columnWidth="auto"
          style={{ width: '100%' }}
        />
      );
    }

    /**
     * 将对象的键值对反转
     * @param {*} obj
     * @returns object
     */
    @Bind()
    objReverse(obj) {
      const reversedObj = {};

      const keys = Object.keys(obj);

      const reversedKeys = keys?.reverse();

      reversedKeys.forEach((key) => {
        reversedObj[key] = obj[key];
      });

      return reversedObj;
    }

    render() {
      const lProps = { ...this.props, ...this.state };

      return (
        <Spin spinning={this.state?.loading || false}>
          <WrappedComponent {...lProps} />
        </Spin>
      );
    }
  };
};

const RoundQuotation = (props) => {
  const { children = {}, dataSet = {}, rfxHeaderId, customizedCode } = props;

  useEffect(() => {
    const keys = Object.keys(dataSet);

    keys.forEach((item, index) => {
      dataSet[item].setQueryParameter('rfxHeaderId', rfxHeaderId);

      dataSet[item].setQueryParameter('customizeUnitCode', customizedCode);

      dataSet[item].setQueryParameter('quotationRoundNumber', keys.length - index);

      dataSet[item].query();
    });
  }, [children, dataSet, rfxHeaderId]);

  /**
   * 将阿拉伯数字转换为中文数字
   * @param {*} num
   * @returns {string}
   */
  const arabicToChinese = useCallback(
    (num) => {
      let result = '';

      let groupIndex = 0;

      const units = ['', '十', '百', '千'];

      const bigUnits = ['', '万', '亿', '万亿'];

      const chineseNumbers = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];

      let numStr = num?.toString();

      while (numStr?.length > 0) {
        const group = numStr?.slice(-4);

        numStr = numStr?.slice(0, -4);

        let groupResult = '';

        let zeroFlag = false;

        for (let i = 0; i < group?.length; i++) {
          const digit = parseInt(group[i], 10);

          if (digit === 0) {
            zeroFlag = true;
          } else {
            if (zeroFlag) {
              groupResult += chineseNumbers[0];

              zeroFlag = false;
            }

            groupResult += chineseNumbers[digit] + units[group?.length - i - 1];
          }
        }

        if (groupResult) {
          result = groupResult?.replace(/零+$/, '') + bigUnits[groupIndex] + result;
        } else if (result && groupIndex > 0) {
          result = chineseNumbers[0] + result;
        }

        groupIndex++;
      }

      result = result?.replace(/零+/g, '零').replace(/零$/, '');

      if (result === '') {
        const [zero] = chineseNumbers;

        result = zero;
      }

      return result;
    },
    [children, rfxHeaderId]
  );

  return (
    <div>
      {Object.values(children)?.map((child, index) => (
        <div key={String(index)}>
          <div
            style={{
              fontSize: '14px',
              fontWeight: 'bold',
              marginBottom: '10px',
              marginTop: '16px',
            }}
          >
            {intl
              .get('ssrc.inquiryHall.model.inquiryHall.roundQuotationBtnDetail', {
                number: arabicToChinese(Object.values(children)?.length - index),
              })
              .d(`第{number}轮执行情况`)}
          </div>
          <div>{child}</div>
        </div>
      ))}
    </div>
  );
};

export default Hoc(RoundQuotation);

import React, { useContext, useEffect, useState, useMemo } from 'react';
import { Select, Form, CheckBox } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import { noop } from 'lodash';

import { getResponse, getCurrentTenant } from 'utils/utils';

import { isJSON } from '@/utils/utils';
import { fetchBidConfig, fetchRFContentConfig } from '@/services/inquiryHallService';

import Store from '../store/index';

const SourceCategory = (props) => {
  const {
    remote,
    commonDs: { baseInfoDs },
  } = useContext(Store);
  const { onChange = noop, changeBiddingMode = noop, britishBidding = noop } = props;

  const britishBiddingFlag = britishBidding();

  const [newBidFlag, setNewBidFlag] = useState(false);
  const [useRF, setUseRF] = useState(''); // 是否开启RF, ''为不开启；ALL为全部开启

  // 过滤类别字段
  const renderSourceCategory = (optionRecord) => {
    const optionValue = optionRecord.get('value') || null;
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

  // 新竞价标识
  const biddingFlag = useMemo(() => {
    return baseInfoDs?.current?.get('sourceCategory') === 'RFA';
  }, [baseInfoDs?.current?.get('sourceCategory')]);

  // 启用红绿灯
  const isBritishBidTrafficLight = useMemo(() => {
    return baseInfoDs?.current?.get('isBritishBidTrafficLight');
  }, [baseInfoDs?.current?.get('isBritishBidTrafficLight')]);

  // 启用红绿灯
  // const biddingModeValue = useMemo(() => {
  //   return baseInfoDs?.current?.get('biddingMode');
  // }, [baseInfoDs?.current?.get('biddingMode')]);

  const getFields = () => {
    const list = [
      <Select
        name="sourceCategory"
        onChange={onChange}
        clearButton={false}
        showHelp="tooltip"
        renderer={({ text, record }) => record.get('secondarySourceCategoryMeaning') || text}
        optionsFilter={renderSourceCategory}
      />,
      biddingFlag ? (
        <Select
          name="biddingMode"
          onChange={changeBiddingMode}
          clearButton={false}
          showHelp="tooltip"
        />
      ) : null,
      britishBiddingFlag ? <CheckBox name="isBritishBidTrafficLight" showHelp="tooltip" /> : null,
      britishBiddingFlag && isBritishBidTrafficLight === 1 ? (
        <CheckBox name="isBritishBidLowestPriceGreen" showHelp="tooltip" />
      ) : null,
      biddingFlag ? <CheckBox name="biddingStageChangeableFlag" showHelp="tooltip" /> : null,
    ];

    return remote?.process(
      'SSRC.SOURCE_TEMPLATE_WORKBENCH_UPDATE.PROCESS_SOURCE_CATEGORY_FORM',
      list,
      { baseInfoDs }
    );
  };

  return (
    <Form dataSet={baseInfoDs} columns={3} labelLayout="float" useWidthPercent>
      {getFields()}
    </Form>
  );
};

export default observer(SourceCategory);

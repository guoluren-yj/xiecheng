import React, { memo, useEffect } from 'react';
import { Anchor } from 'hzero-ui';

import { equals, camelCase, head, isEmpty } from 'lodash';

import { useSetState } from '../utils';

const { Link } = Anchor;

export const RowLink = memo(({ configList = [] }) => {
  return configList.map(({ investgCfHeaderId, configDescription }) => (
    <Link key={investgCfHeaderId} title={configDescription} href={`#${configDescription}`} />
  ));
}, equals);

const setConfigList = (investigateConfigHeaders, isTab) => {
  const configList = [];
  investigateConfigHeaders.forEach(item => {
    const { configName } = item;
    configList.push({ ...item, ...isTab[configName] });
    // if (isTab[configName]) {
    //   const index = configList.findIndex(
    //     (value) => value.tab && value.configName === isTab[item.configName].configName
    //   );
    //   if (index >= 0) {
    //     configList[index].tablist.push(item);
    //   } else {
    //     configList.push({
    //       tablist: [item],
    //       tab: true,
    //       investgCfHeaderId: item.investgCfHeaderId,
    //       ...isTab[configName],
    //     });
    //   }
    // } else {
    //   configList.push(item);
    // }
  });
  return configList;
};

const setConfigData = (investigateConfigLines, list, LinefxList) => {
  const configData = {};
  investigateConfigLines.forEach(({ fieldCode, ...item }) => {
    const { investgCfHeaderId, investgCfLineId, componentType } = item;
    const attributes = list.filter(value => value.investgCfLineId === investgCfLineId);
    let fxProps = [];
    if (!isEmpty(LinefxList)) {
      fxProps = LinefxList.filter(value => value.investgCfLineId === investgCfLineId);
    }
    const toValueListFlag = (
      head(attributes.filter(attr => attr.attributeName === 'toValueListFlag')) || {}
    ).attributeValue;
    const otherItem = {};
    if (toValueListFlag) {
      otherItem.componentType = 'ValueList';
      if (fieldCode === 'attachment_type') {
        otherItem.lovCode = 'SPFM.COMPANY.SUB_ATTACHMENT';
      }
      if (fieldCode === 'authentication_type') {
        otherItem.lovCode = 'SSLM.QUALIFICATION_AUTHENTICATION_TYPE';
      }
    } else if (fieldCode === 'attachment_type' && componentType === 'ValueList') {
      otherItem.componentType = 'Cascader';
    }
    if (configData[investgCfHeaderId]) {
      configData[investgCfHeaderId].push({
        ...item,
        ...otherItem,
        attributes,
        fxProps,
        fieldCode: camelCase(fieldCode),
      });
    } else {
      configData[investgCfHeaderId] = [
        { ...item, ...otherItem, attributes, fxProps, fieldCode: camelCase(fieldCode) },
      ];
    }
  });
  return [configData];
};

export const useInvestListData = (
  dispatch,
  isTab,
  changeReqId,
  partnerTenantId,
  mustCompanyTabObj
) => {
  const [state, setState] = useSetState({
    configList: [],
    configData: {},
    parentNodeDisable: true,
  });

  const { configList, configData } = state;

  useEffect(() => {
    if (changeReqId && partnerTenantId) {
      dispatch({
        type: 'enterpriseInform/queryInfoChangeApprovalDetail',
        payload: { changeReqId, partnerTenantId },
      }).then(res => {
        const {
          investigateConfigComponents = [],
          investigateConfigHeaders = [],
          investigateConfigLines = [],
          investigateConfigLineFXs = [],
        } = res || {};
        const [configDatas] = setConfigData(
          investigateConfigLines,
          investigateConfigComponents,
          investigateConfigLineFXs
        );
        setState({
          configList: setConfigList(investigateConfigHeaders, isTab),
          configData: configDatas,
        });
      });
    }
  }, [changeReqId, partnerTenantId, isEmpty(mustCompanyTabObj)]);

  return [configList, configData];
};

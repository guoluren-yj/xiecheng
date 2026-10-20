import React, { createContext, useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { getCurrentOrganizationId, getResponse, getUserOrganizationId } from 'utils/utils';
import { queryMapIdpValue } from 'services/api';
import { ModalProvider, useDataSet, DataSet } from 'choerodon-ui/pro';
import withProps from 'utils/withProps';
import { compose } from 'lodash';
import LineQuoteDs from './LineQuoteDs';
import WholeOrderQuoteDs from './WholeOrderQuoteDs';

export const Store = createContext();

const StoreProvider = function StoreProvider(props) {
  const {
    history,
    children,
    lineQuoteDs,
    wholeOrderQuoteDs,
    customizeBtnGroup,
    customizeTabPane,
    customizeTable,
    customizeForm,
  } = props;
  const organizationId = getUserOrganizationId();
  const tenantId = getCurrentOrganizationId();
  const [tabActiveKey, setTabActiveKey] = useState('lineQuotation');
  const sourceDs = useDataSet(() => {}, []);
  const flagDs = useDataSet(() => {}, []);
  const value = useMemo(() => {
    return {
      organizationId,
      tenantId,
      history,
      lineQuoteDs,
      wholeOrderQuoteDs,
      customizeBtnGroup,
      customizeTabPane,
      customizeTable,
      customizeForm,
      tabActiveKey,
      setTabActiveKey,
    };
  }, [
    organizationId,
    tenantId,
    history,
    lineQuoteDs,
    wholeOrderQuoteDs,
    customizeBtnGroup,
    customizeTabPane,
    customizeTable,
    customizeForm,
    tabActiveKey,
    setTabActiveKey,
  ]);

  useEffect(() => {
    queryMapIdpValue({
      source: 'SPRM.SRC_PLATFORM',
      flag: 'HPFM.FLAG',
      tenantId,
    }).then((resp) => {
      const enumMap = getResponse(resp);
      if (enumMap) {
        sourceDs.loadData(enumMap.source);
        flagDs.loadData(enumMap.flag);
      }
    });
  }, [sourceDs, flagDs]);

  useEffect(() => {
    lineQuoteDs.query(lineQuoteDs.currentPage);
    wholeOrderQuoteDs.query(wholeOrderQuoteDs.currentPage);
  }, []);

  return (
    <Store.Provider value={value}>
      <ModalProvider>{children}</ModalProvider>
    </Store.Provider>
  );
};

export default compose(
  withProps(
    () => {
      const lineQuoteDs = new DataSet(
        LineQuoteDs({
          sourceDs: new DataSet({}),
          flagDs: new DataSet({}),
          organizationId: getUserOrganizationId(),
          tenantId: getCurrentOrganizationId(),
        })
      );
      const wholeOrderQuoteDs = new DataSet(
        WholeOrderQuoteDs({
          sourceDs: new DataSet(),
          flagDs: new DataSet(),
          organizationId: getUserOrganizationId(),
          tenantId: getCurrentOrganizationId(),
        })
      );
      return {
        lineQuoteDs,
        wholeOrderQuoteDs,
      };
    },
    { cacheState: true }
  ),
  observer
)(StoreProvider);

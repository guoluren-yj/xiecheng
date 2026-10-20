import React, { createContext } from 'react';
// import { getCurrentOrganizationId } from 'utils/utils';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
const Store = createContext('');

export default Store;

export const StoreProvider = (props) => {
  const { children, match, location, history } = props;
  const {
    params: { id = 10091 },
  } = match;
  const { state: { name = '' } = {} } = location;
  // const organizationId = getCurrentOrganizationId();
  // // //form表单
  // const detailFormDataSet = useMemo( // form表单
  //   () => new DataSet(DetailFormDataSet({ id, organizationId })),
  // );
  // // //tab表单 左边
  // const fieldInformationDataSet = useMemo( // tab表单 左边
  //   () => new DataSet(FieldInformationDataSet(organizationId, id)),
  // );

  // //

  const value = {
    ...props,
    match,
    name,
    history,
    id,
    organizationId,
  };

  return <Store.Provider value={value}>{children}</Store.Provider>;
};

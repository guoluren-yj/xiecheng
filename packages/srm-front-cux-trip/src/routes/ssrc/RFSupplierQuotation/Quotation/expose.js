import React from 'react';
import { Expose } from 'utils/remote';
import Attachments from './page/Attachments';
import { renderAttacnmentList } from './common';

export default new Expose({
  process: {
    SSRC_SUPPLIER_QUOTATION_NEW_BASIC_FORM: formFields => {
      return [
        ...formFields,
        ...renderAttacnmentList(['attributeVarchar1', 'attributeVarchar2', 'attributeVarchar3']),
      ];
    },
  },
  render: {
    SSRC_SUPPLIER_QUOTATION_NEW_RENDER_ATTACHMENT_CARD: props => {
      const { children } = props;
      return <Attachments {...children.props} />;
    },
  },
});

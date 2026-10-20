const arrFields = (data = []) => {
  const fields = [];
  data.forEach((item) => {
    const { compType, customParam, ...others } = item;
    fields.push({ ...others });
  });
  return fields;
};
const createDS = ({ componentData }) => ({
  paging: false,
  dataToJSON: 'all',
  forceValidate: true,
  fields: arrFields(componentData),
});

export { createDS };

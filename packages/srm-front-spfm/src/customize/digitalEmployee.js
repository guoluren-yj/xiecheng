const digitalEmployeeConfig = {};

export const setDigitalEmployeeButtonRoute = ({ path, component }) => {
  digitalEmployeeConfig[path] = component;
};

export const getDigitalEmployeeButtonComponent = path => {
  return digitalEmployeeConfig[path] || null;
};

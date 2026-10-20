import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';
import WithCustomizeH0 from 'srm-front-cuz/lib/h0Customize';

function App() {
  return null;
}

export default WithCustomizeH0()(WithCustomizeC7N()(App));

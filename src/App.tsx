import './App.scss';
import { AppHeader } from './components/app-header';
import { OriginNetworks } from './components/origin-networks';
import originNetworks from './origin-networks.json';
import { StepData } from './components/app-header/step-component';

function App() {

  const steps: Array<StepData> = [{
    label: "Select origin network and wallet",
    completedLabel: "Ethereum",
    completed: false
  }, {
    label: "Check allocation",
    completedLabel: '100Luna',
    completed: false
  }, {
    label: "Claim",
    completedLabel: "4B7FA467A4D3859E501DE47C9D47251AAD5621F53D7E621D1EC848D5214A3451",
    completed: false
  }];
  

  return (
    <div className="App">
      <AppHeader steps={steps} />
      <div className='AppBody'>
        <OriginNetworks originNetworks={originNetworks}/>
      </div>
    </div>
  );
}

export default App;

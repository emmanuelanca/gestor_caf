import React, { useState } from 'react';
import './vista.css';
import escudo from '/src/assets/escudo.png';
import { MdAccountBalanceWallet } from 'react-icons/md';
import { useIncome } from './hooks/useIncome';
import IncomePanel from './components/IncomePanel';
import { useFundMovement } from './hooks/useFundMovement';
import FundMovementPanel from './components/FundMovementPanel';

export default function App() {
  const [screen, setScreen] = useState('menu');
  const incomeData = useIncome();
  const fundMovementData = useFundMovement();

  if (screen === "menu") {
    return (
      <div className="vista-window">
        <div className="vista-titlebar">
          <div className="title-left">
            <img src={escudo} alt="Escudo Club Atletico French" className="club-logo" />
            <div className="club-title">Club Atletico French</div>
          </div>
          <div className="title-right">
          </div>
        </div>

        <div className="vista-content menu-vertical">
          <button className="menu-tile primary-tile vertical" onClick={() => setScreen("income")}>
            <div className="tile-icon refined"><MdAccountBalanceWallet className="svg-icon" /></div>
            <div className="tile-text"><div className="tile-title">Ingresos</div><div className="tile-desc">Registrar y ver income</div></div>
          </button>
          <button className="menu-tile primary-tile vertical" onClick={() => setScreen("fundMovement")}>
            <div className="tile-icon refined"><MdAccountBalanceWallet className="svg-icon" /></div>
            <div className="tile-text"><div className="tile-title">Movimientos de fondos</div><div className="tile-desc">Registrar y ver income</div></div>
          </button>
        </div>
      </div>
    );
  }

  if (screen === "income") {
    return (
      <div className="vista-window">
        <div className="vista-titlebar">
          <div className="title-left">
            <button className="vista-button back-button" onClick={() => setScreen("menu")}>←</button>
            <div className="club-title">Ingresos</div>
          </div>
          <div className="title-right">
          </div>
        </div>

        <div className="vista-content">
          <IncomePanel incomeData={incomeData} />
        </div>
      </div>
    );
  }

  if (screen === "fundMovement") {
    return (
      <div className="vista-window">
        <div className="vista-titlebar">
          <div className="title-left">
            <button className="vista-button back-button" onClick={() => setScreen("menu")}>←</button>
            <div className="club-title">Movimientos de fondos</div>
          </div>
          <div className="title-right">
          </div>
        </div>

        <div className="vista-content">
          <FundMovementPanel fundMovementData={fundMovementData} />
        </div>
      </div>
    );
  }
  return null;
}

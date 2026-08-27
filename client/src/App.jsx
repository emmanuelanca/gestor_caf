import React from 'react';
import './vista.css';
import escudo from '/src/assets/escudo.png';
import { MdAccountBalanceWallet } from 'react-icons/md';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';

import { useIncome } from './hooks/useIncome';
import { useFundMovement } from './hooks/useFundMovement';
import { usePendingCommitment } from './hooks/usePendingCommitment';
import { useVoucherHead } from './hooks/useVoucherHead';
import { usePuc } from './hooks/usePuc';
import { useProvider } from './hooks/useProvider';
import { useVoucherItemCommitment } from './hooks/useVoucherItemCommitment';


import IncomePanel from './components/IncomePanel';
import FundMovementPanel from './components/FundMovementPanel';
import PendingCommitmentPanel from './components/PendingCommitmentPanel';
import CreateVoucherHeadPanel from './components/CreateVoucherHeadPanel';
import PUCPanel from './components/PUCPanel';
import ProviderPanel from './components/ProviderPanel';
import VoucherItemCommitmentPanel from './components/VoucherItemCommitmentPanel';


function VistaLayout({ title, children }) {
  const navigate = useNavigate();

  return (
    <div className="vista-window">
      <div className="vista-titlebar">
        <div className="title-left">
          <button className="vista-button back-button" onClick={() => navigate('/')}>
            ←
          </button>
          <div className="club-title">{title}</div>
        </div>
        <div className="title-right"></div>
      </div>
      <div className="vista-content">
        {children}
      </div>
    </div>
  );
}

function Menu() {
  return (
    <div className="vista-window">
      <div className="vista-titlebar">
        <div className="title-left">
          <img src={escudo} alt="Escudo Club Atletico French" className="club-logo" />
          <div className="club-title">Club Atletico French</div>
        </div>
        <div className="title-right"></div>
      </div>

      <div className="vista-content menu-vertical">
        <Link to="/ingresos" className="menu-tile primary-tile vertical">
          <div className="tile-icon refined"><MdAccountBalanceWallet className="svg-icon" /></div>
          <div className="tile-text">
            <div className="tile-title">Ingresos</div>
            <div className="tile-desc">Registrar y ver ingresos</div>
          </div>
        </Link>

        <Link to="/movimientos-fondos" className="menu-tile primary-tile vertical">
          <div className="tile-icon refined"><MdAccountBalanceWallet className="svg-icon" /></div>
          <div className="tile-text">
            <div className="tile-title">Movimientos de fondos</div>
            <div className="tile-desc">Ver movimientos de fondos</div>
          </div>
        </Link>

        <Link to="/compromisos-pendientes" className="menu-tile primary-tile vertical">
          <div className="tile-icon refined"><MdAccountBalanceWallet className="svg-icon" /></div>
          <div className="tile-text">
            <div className="tile-title">Compromisos pendientes</div>
            <div className="tile-desc">Ver y pagar compromisos pendientes</div>
          </div>
        </Link>

        <Link to="/puc" className="menu-tile primary-tile vertical">
          <div className="tile-icon refined"><MdAccountBalanceWallet className="svg-icon" /></div>
          <div className="tile-text">
            <div className="tile-title">Plan de Cuentas</div>
            <div className="tile-desc">Ver y gestionar PUC</div>
          </div>
        </Link>

        <Link to="/crear-comprobante-rapido" className="menu-tile primary-tile vertical">
          <div className="tile-icon refined"><MdAccountBalanceWallet className="svg-icon" /></div>
          <div className="tile-text">
            <div className="tile-title">Crear comprobante rapido</div>
            <div className="tile-desc">Crear comprobante rapido</div>
          </div>
        </Link>

        <Link to="/proveedores" className="menu-tile primary-tile vertical">
          <div className="tile-icon refined"><MdAccountBalanceWallet className="svg-icon" /></div>
          <div className="tile-text">
            <div className="tile-title">Proveedores</div>
            <div className="tile-desc">Ver y gestionar proveedores</div>
          </div>
        </Link>
        <Link to="/detalle-comprobante" className="menu-tile primary-tile vertical">
          <div className="tile-icon refined"><MdAccountBalanceWallet className="svg-icon" /></div>
          <div className="tile-text">
            <div className="tile-title">Detalle comprobante</div>
            <div className="tile-desc">Cargar ítems de compra</div>
          </div>
        </Link>
      </div>
    </div>
  );
}

export default function App() {
  const incomeData = useIncome();
  const fundMovementData = useFundMovement();
  const pendingCommitmentData = usePendingCommitment();
  const voucherHeadData = useVoucherHead();
  const pucData = usePuc();
  const providerData = useProvider();
  const voucherItemCommitmentData = useVoucherItemCommitment();

  return (
    <Routes>
      <Route path="/" element={<Menu />} />
      
      <Route 
        path="/ingresos" 
        element={
          <VistaLayout title="Ingresos">
            <IncomePanel incomeData={incomeData} />
          </VistaLayout>
        } 
      />

      <Route 
        path="/movimientos-fondos" 
        element={
          <VistaLayout title="Movimientos de fondos">
            <FundMovementPanel fundMovementData={fundMovementData} />
          </VistaLayout>
        } 
      />

      <Route 
        path="/compromisos-pendientes" 
        element={
          <VistaLayout title="Compromisos pendientes">
            <PendingCommitmentPanel pendingCommitmentData={pendingCommitmentData} />
          </VistaLayout>
        } 
      />

      <Route 
        path="/puc" 
        element={
          <VistaLayout title="Plan de Cuentas (PUC)">
            <PUCPanel pucData={pucData} />
          </VistaLayout>
        } 
      />

      <Route 
        path="/crear-comprobante-rapido" 
        element={
          <VistaLayout title="Crear comprobante rapido">
            <CreateVoucherHeadPanel voucherHeadData={voucherHeadData} />
          </VistaLayout>
        } 
      />

      <Route 
        path="/proveedores" 
        element={
          <VistaLayout title="Proveedores">
            <ProviderPanel providerData={providerData} />
          </VistaLayout>
        } 
      />

      <Route
        path="/detalle-comprobante"
        element={
          <VistaLayout title="Detalle de Comprobante">
            <VoucherItemCommitmentPanel data={voucherItemCommitmentData} />
          </VistaLayout>
        }
      />

      {}
      <Route path="*" element={<Menu />} />
    </Routes>
  );
}

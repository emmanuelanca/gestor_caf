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
import { useProduct } from './hooks/useProduct';

import IncomePanel from './components/IncomePanel';
import FundMovementPanel from './components/FundMovementPanel';
import PendingCommitmentPanel from './components/PendingCommitmentPanel';
import CreateVoucherHeadPanel from './components/CreateVoucherHeadPanel';
import PUCPanel from './components/PUCPanel';
import ProductPanel from './components/ProductPanel';

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

        <Link to="/productos" className="menu-tile primary-tile vertical">
          <div className="tile-icon refined"><MdAccountBalanceWallet className="svg-icon" /></div>
          <div className="tile-text">
            <div className="tile-title">Modificar productos</div>
            <div className="tile-desc">Modificar productos</div>
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
  const productData = useProduct();

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
        path="/productos"
        element={
          <VistaLayout title="Modificar productos">
            <ProductPanel productData={productData} />
          </VistaLayout>
        }
      />

      {}
      <Route path="*" element={<Menu />} />
    </Routes>
  );
}

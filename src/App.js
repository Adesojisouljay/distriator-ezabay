import { useEffect, useState } from "react";
import {Route, Routes, useNavigate, useParams, useLocation } from "react-router-dom";
import { Home } from './pages/Home';
import { NavBar } from './components/nav-bar/NavBar';
import { Miner } from './pages/Miner';
import Login from "./pages/Login";
import Register from "./pages/Register";
import { Admin } from "./pages/Admin";
import './App.scss';
import Pagetest from "./pages/Pagetest";
import Aos from 'aos'
import "aos/dist/aos.css"
import { Dashboard } from "./pages/Dashboard";
import Spinner from "./pages/Spinner";
import { getUserProfile } from "./api/profile";
import { useDispatch, useSelector } from "react-redux";
import ProtectedRoute from "./protected-routes/ProtectedRoutes";
import { Kyc } from "./components/submit-kyc/Kyc";
import NotFound from "./components/not-found/NotFound";
import { KYCManagement } from "./components/manage-kyc/KycManagement";
import { MerchantAction } from "./components/merchant-action/Merchant";
import { CreateMerchantForm } from "./components/create-merchant/CreateMerchant";
import { BankAccount } from "./pages/BankAccount";
import { FiatWithdrawalAction } from "./components/fiat-withdrawal-action/FiatWithdrawalAction";
import { FiatDepositAction } from "./components/fiat-deposit-action/FiatDepositAction";
import { InvalidTokenModal } from "./components/modal/InvalidateTokenModal";
import { isTokenValid } from "./utils";
import { WalletPage } from "./pages/WalletPage";
import { protectedRoutesArray } from "./vairables/protectedRoutes";
import { SingleCoinInfo } from "./pages/SingleCoinInfo";
import { TransactionHistory } from "./components/transaction-history/TransactionHistory";
import { Trade } from "./pages/Trade";
import { DepositPage } from "./pages/DepositPagee";
import Fiatdeposit from "./components/modal/Fiatdeposit";
import FloatingNav from "./components/nav-bar/FloatingNav";
import RightNav from "./components/nav-bar/RightNav";
import { CryptoNews } from "./pages/CryptoNews";
import { SingleNewsPage } from "./pages/SingleNewsPage";
import { Profile } from "./pages/ProfilePage";
import { HiveOnboard } from "./components/hive-onboard/HiveOnboard";
import { SpendHbd } from "./components/spend-hbd/SpendHbd";
import { SingleCommunityPost } from "./components/single-post/singleCommunityPost";
import { HivelionaireGame } from "./components/games/hiveLoniare";

function App() {
  const user = useSelector((state) => state.ekzaUser);
  const dispatch = useDispatch()
  const navigate = useNavigate();
  const { pathname }  = useLocation();
  const isProtectedRoute = protectedRoutesArray.includes(pathname);

  const [tokenValid, setTokenValid] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!isTokenValid(token)) {
      setTokenValid(false);
    }
    if (isTokenValid(token)) {
      getProfile()
    }
  }, [tokenValid]);

  useEffect(() => {
    Aos.init({duration:1000});
  }, [])

  const getProfile = async () => {
    await getUserProfile(dispatch);
  }

  return (
    <div className="app">
      <NavBar/>
      <RightNav />
      <div className='app-container'>
      {!tokenValid && isProtectedRoute && <InvalidTokenModal /> }
        <Routes>
          <Route exact path="/" element={<Home/>}/>
          <Route path="/login" element={<Login/>}/>
          <Route path="/register" element={<Register/>}/>
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard/>}/>
            <Route path="/hive-onboard" element={<HiveOnboard/>}/>
            <Route path="/spend-hbd" element={<SpendHbd/>}/>
            <Route path="/post/:author/:permlink" element={<SingleCommunityPost/>}/>
            {/* <Route path="/mining" element={<Miner/>}/> */}
            {/* COMMENT ALL OUT FOR TESTING SAKE */}
            {/* <Route path="/controller" element={<Admin/>}/> */}
            {/* <Route path="/test" element={<Pagetest />} /> */}
            <Route path="spinner" element={<Spinner />} />
            {/* <Route path="/kyc" element={<Kyc />} /> */}
            {/* <Route path="/manage-kyc" element={<KYCManagement />} /> */}
            {/* <Route path="/merchant-action" element={<MerchantAction />} /> */}
            <Route path="/create-merchant" element={<CreateMerchantForm />} />
            <Route path="/hive-quiz" element={<HivelionaireGame />} />
            {/* <Route path="/accounts" element={<BankAccount />} /> */}
            {/* <Route path="/fiat-withdrawal-action" element={<FiatWithdrawalAction />} /> */}
            {/* <Route path="/fiat-deposit-action" element={<FiatDepositAction />} /> */}
            {/* <Route path="/wallet" element={<WalletPage />} /> */}
            {/* <Route path="/coin/:id" element={<SingleCoinInfo />} /> */}
            {/* <Route path="/transactions" element={<TransactionHistory />} /> */}
            {/* <Route path="/deposit" element={<DepositPage />} /> */}
            {/* <Route path="/fiat-deposit" element={<Fiatdeposit />} /> */}
            {/* <Route path="/trade" element={<Trade />} /> */}
            {/* <Route path="/page" element={<Pagetest />} /> */}
            {/* <Route path="/crypto-news" element={<CryptoNews />} /> */}
            {/* <Route path="/crypto-news/:id" element={<SingleNewsPage />} /> */}
            <Route path="/profile" element={<Profile />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      {user.isAuthenticated && <FloatingNav />}
    </div>
  );
}

export default App;
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css'
import DatabaseManager from './components/ModificationComponents/DatabaseManager'
import SelectOperations from './components/SelectOperations/SelectOpreations'
import IndexViewManager from "./components/IndexViewManager/IndexViewManager";
import Sidebar from './components/Sidebar/LeftSidebar'
import Navbar from "./components/Navbar/Navbar";
import SequenceManager from "./components/SequenceManager/SequenceManager";
import TransactionOperations from "./components/Transactions/TransactionOperations";


function App() {


  return (
  <Router>
    <>
      <div>
        <Navbar />
        <Sidebar />
        {/* Main Content */}
        <div className="flex-1 p-6 ml-[270px]"> 
          <Routes>
            <Route path="/" element={<DatabaseManager />} />
            <Route path="/select" element={<SelectOperations />} />
            <Route path="/indexview" element={<IndexViewManager />} />
            <Route path="/sequences" element={<SequenceManager />} />
            <Route path="/transactions" element={<TransactionOperations />} />
          </Routes>
        </div>
      </div>
    </>
    </Router>
  );
}

export default App

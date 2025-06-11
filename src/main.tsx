import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router";
import './index.css'

import App from './App.tsx'
import { Home } from './pages/home';
import { Status } from './pages/status';
import { All } from './pages/all';
import { Collection } from './pages/collection';


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App>
        <Routes>
          <Route index element={<Home />} />
          <Route path="/status" element={<Status />} />
          <Route path="/all" element={<All />} />
          <Route path="/collection" element={<Collection />} />
        </Routes>
      </App>
    </BrowserRouter>
  </StrictMode>,
)

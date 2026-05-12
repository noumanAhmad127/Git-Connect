import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<div className="flex min-h-screen items-center justify-center">GitConnect</div>}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

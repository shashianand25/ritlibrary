import './App.css'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import SearchPYQ from './searchpyq.jsx'
import HomePage from './HomePage.jsx'
import About from './About.jsx'
import Contribute from './Contribute.jsx'
import SyllabusTracker from './SyllabusTracker.jsx'
import ManageAdmins from './ManageAdmins.jsx'
import { AuthProvider } from './lib/AuthContext.jsx'

/* Shared page transition wrapper */
const pageVariants = {
  initial: { opacity: 0, y: 18, filter: 'blur(4px)' },
  animate: {
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { duration: 0.38, ease: [0.25, 0.46, 0.45, 0.94] }
  },
  exit: {
    opacity: 0, y: -12, filter: 'blur(4px)',
    transition: { duration: 0.22, ease: [0.55, 0, 1, 0.45] }
  },
}

function PageTransition({ children }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ willChange: 'opacity, transform' }}
    >
      {children}
    </motion.div>
  )
}

/* AnimatePresence must sit *inside* BrowserRouter and read location */
function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/"          element={<PageTransition><HomePage  /></PageTransition>} />
        <Route path="/resources" element={<PageTransition><SearchPYQ /></PageTransition>} />
        <Route path="/syllabus"  element={<PageTransition><SyllabusTracker /></PageTransition>} />
        <Route path="/admin"     element={<PageTransition><ManageAdmins /></PageTransition>} />
        <Route path="/about"     element={<PageTransition><About     /></PageTransition>} />
        <Route path="/contribute"element={<PageTransition><Contribute/></PageTransition>} />
      </Routes>
    </AnimatePresence>
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import JournalPage from './pages/JournalPage'
import NotesPage from './pages/NotesPage'
import TodoPage from './pages/TodoPage'
import CalendarPage from './pages/CalendarPage'
import KnowledgePage from './pages/KnowledgePage'
import BookmarksPage from './pages/BookmarksPage'
import ContactsPage from './pages/ContactsPage'
import BloodPressurePage from './pages/BloodPressurePage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/journal" replace />} />
          <Route path="journal" element={<JournalPage />} />
          <Route path="notes" element={<NotesPage />} />
          <Route path="todos" element={<TodoPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="knowledge" element={<KnowledgePage />} />
          <Route path="bookmarks" element={<BookmarksPage />} />
          <Route path="contacts" element={<ContactsPage />} />
          <Route path="blood-pressure" element={<BloodPressurePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App

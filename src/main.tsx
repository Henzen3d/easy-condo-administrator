import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import './index.css'
import router from './routes'
import { Toaster } from 'sonner'

// Custom loading component for when routes are being loaded
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen w-screen bg-background">
    <div className="flex flex-col items-center">
      <div className="h-16 w-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-muted-foreground">Carregando...</p>
    </div>
  </div>
)

// Wrap the application with Suspense to handle lazy loading
createRoot(document.getElementById("root")!).render(
  <Suspense fallback={<LoadingFallback />}>
    <RouterProvider router={router} />
    <Toaster position="bottom-right" expand={false} richColors />
  </Suspense>
);

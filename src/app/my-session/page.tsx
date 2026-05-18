import type { Metadata } from 'next'
import { Container } from '@/shared/ui/container.ui'
import { MySessionClient } from './my-session-client'

export const metadata: Metadata = {
  title: 'Minha Sessão | Conta.AI',
  description: 'Seus livros favoritados e autores seguidos.',
}

export default function MySessionPage() {
  return (
    <main className="min-h-screen bg-primary-200">
      <Container className="py-20">
        <MySessionClient />
      </Container>
    </main>
  )
}

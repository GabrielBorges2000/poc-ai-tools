import { prisma } from '@/lib/prisma'

export const checkConnectionDatabase = async () => {
  try {
    await prisma.$connect()
    console.log('Conexão com o banco de dados bem-sucedida.')
  } catch (error) {
    console.error('Erro ao conectar ao banco de dados:', error)
    throw new Error('Erro ao conectar ao banco de dados.')
  } finally {
    await prisma.$disconnect()
  }
}

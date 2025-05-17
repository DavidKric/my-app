const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    // Create a test annotation
    const testAnnotation = await prisma.annotation.create({
      data: {
        documentId: 'test-doc',
        pageNumber: 1,
        rects: JSON.stringify([{ x: 10, y: 20, width: 100, height: 50 }]),
        selectedText: 'Test annotation',
        note: 'This is a test note',
        tags: JSON.stringify(['test', 'prisma']),
      }
    });
    
    console.log('Created test annotation:', testAnnotation);
    
    // Query it back
    const annotations = await prisma.annotation.findMany();
    console.log('All annotations:', annotations);
    
    console.log('Prisma client is working correctly!');
  } catch (error) {
    console.error('Error testing Prisma client:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 
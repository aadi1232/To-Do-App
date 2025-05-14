import Typesense from 'typesense';

// Configure the Typesense client
const typesenseClient = new Typesense.Client({
  nodes: [
    {
      host: 'localhost',
      port: 8108,
      protocol: 'http'
    }
  ],
  apiKey: 'xyz',
  connectionTimeoutSeconds: 2
});

async function testTypesense() {
  try {
    // Check health
    console.log('Testing Typesense connection...');
    const health = await typesenseClient.health.retrieve();
    console.log('Typesense health:', health);

    // List collections
    const collections = await typesenseClient.collections().retrieve();
    console.log('Collections:', collections);

    console.log('Typesense is working correctly!');
  } catch (error) {
    console.error('Typesense test failed:', error);
  }
}

testTypesense(); 